// AI Client：统一封装真实大模型 API 调用（CLAUDE.md §22.2、§20、§21）。
// - 优先使用网页里保存的本机配置，没有时再看环境变量；
// - 同时支持 OpenAI 兼容（/chat/completions）与 Anthropic 兼容（/v1/messages）两种协议；
// - 通过 AI_PROVIDER 区分：含 "anthropic" 走 Anthropic Messages API，其余走 OpenAI；
// - 统一超时、截断检测、JSON 提取修复与有限次重试；
// - 解析 usage（input/output tokens）并写入成本日志；
// - 日志绝不打印 API Key 或完整简历。

import 'dotenv/config'
import { jsonResponseFormat } from './schemas'
import {
  appendCostRun,
  estimateCostCny,
  type AiCallMeta,
  type AiUsage,
  type CostStage
} from './costLogger'
import { readStoredLlmSettings } from './llmSettings'

export type LlmConfig = {
  apiKey: string
  baseUrl: string
  model: string
  provider: string
  anthropic: boolean
  maxTokens: number
  useJsonObject: boolean
  thinking: string
}

function envLlmConfig(): LlmConfig {
  const baseUrl = (process.env.AI_API_BASE_URL?.trim() || '').replace(/\/$/, '')
  const provider = (process.env.AI_PROVIDER?.trim() || 'openai').toLowerCase()
  const anthropic = provider.includes('anthropic') || baseUrl.toLowerCase().includes('anthropic')
  return {
    apiKey: process.env.AI_API_KEY?.trim() || '',
    baseUrl,
    model: process.env.AI_MODEL?.trim() || '',
    provider: anthropic ? 'anthropic-compatible' : 'openai',
    anthropic,
    maxTokens: Math.max(2048, Number(process.env.AI_MAX_TOKENS) || 16384),
    useJsonObject: (process.env.AI_RESPONSE_FORMAT?.trim() || 'json_object').toLowerCase() !== 'off',
    thinking: (process.env.AI_THINKING?.trim() || '').toLowerCase()
  }
}

/** 网页保存的配置优先。地址里带 anthropic 时走 Anthropic 协议，其余走 OpenAI 兼容协议。 */
export function getLlmConfig(): LlmConfig {
  const env = envLlmConfig()
  const stored = readStoredLlmSettings()
  if (!stored) return env
  const baseUrl = stored.baseUrl || env.baseUrl
  const anthropic = baseUrl.toLowerCase().includes('anthropic')
  return {
    apiKey: stored.apiKey || env.apiKey,
    baseUrl,
    model: stored.model || env.model,
    provider: anthropic ? 'anthropic-compatible' : 'openai',
    anthropic,
    maxTokens: env.maxTokens,
    useJsonObject: env.useJsonObject,
    thinking: env.thinking
  }
}

const DEFAULT_TIMEOUT_MS = 180_000
const JSON_TEMPERATURE = 0.2

function openAiThinkingExtra(cfg: LlmConfig): { thinking: { type: 'enabled' | 'disabled' } } | undefined {
  if (cfg.thinking === 'enabled' || cfg.thinking === 'on') {
    return { thinking: { type: 'enabled' } }
  }
  if (cfg.thinking === 'disabled' || cfg.thinking === 'off') {
    return { thinking: { type: 'disabled' } }
  }
  // deepseek-v4-*：结构化 JSON 默认关 thinking，避免空 content
  if (cfg.model.startsWith('deepseek-v4')) {
    return { thinking: { type: 'disabled' } }
  }
  return undefined
}

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export class AiClientError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiClientError'
  }
}

export type { AiCallMeta }

type RawModelResult = {
  content: string
  truncated: boolean
  usage: AiUsage
}

export type ValidatedAiResult<T> = {
  data: T
  meta: AiCallMeta
}

export type AiCallOptions = {
  timeoutMs?: number
  stage?: CostStage
  chainId?: string
  /** 测试集 Case 标识，如 PM-C1；与 chainId 并存 */
  caseId?: string
}

function assertKeyConfigured(cfg: LlmConfig): void {
  if (!cfg.apiKey || !cfg.baseUrl || !cfg.model) {
    throw new AiClientError('还没有配置大模型。请点击右上角「设置 API」，填写接口地址、模型名称和 API Key。')
  }
}

function mapHttpError(status: number): AiClientError {
  if (status === 401 || status === 403) {
    return new AiClientError('API Key 不正确，或没有调用权限。')
  }
  if (status === 429) {
    return new AiClientError('AI 服务请求过于频繁或额度不足，请稍后重试。')
  }
  return new AiClientError(`AI 服务返回错误（HTTP ${status}），请稍后重试。`)
}

function emptyUsage(): AiUsage {
  return { inputTokens: 0, outputTokens: 0, cachedInputTokens: null }
}

function addUsage(a: AiUsage, b: AiUsage): AiUsage {
  // empty + x → x；两边都有数字 → 相加；任一侧「有用量但无 cache 明细」→ null（不把未知当 0）
  const aEmpty = a.inputTokens === 0 && a.outputTokens === 0 && a.cachedInputTokens == null
  const bEmpty = b.inputTokens === 0 && b.outputTokens === 0 && b.cachedInputTokens == null
  let cached: number | null
  if (aEmpty) cached = b.cachedInputTokens
  else if (bEmpty) cached = a.cachedInputTokens
  else if (a.cachedInputTokens != null && b.cachedInputTokens != null) {
    cached = a.cachedInputTokens + b.cachedInputTokens
  } else {
    cached = null
  }

  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cachedInputTokens: cached
  }
}

/** 从 OpenAI 兼容 usage 中提取 cached input tokens；无明细则 null */
function parseCachedInputTokens(usage: Record<string, unknown>): number | null {
  const details = usage.prompt_tokens_details
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    const d = details as Record<string, unknown>
    const cached = d.cached_tokens ?? d.cachedTokens
    if (typeof cached === 'number' && Number.isFinite(cached)) {
      return Math.max(0, Math.round(cached))
    }
  }
  // 部分厂商顶层字段
  const top = usage.prompt_cache_hit_tokens ?? usage.cached_tokens ?? usage.cache_read_input_tokens
  if (typeof top === 'number' && Number.isFinite(top)) {
    return Math.max(0, Math.round(top))
  }
  return null
}

function parseOpenAiUsage(payload: { usage?: Record<string, unknown> }): AiUsage {
  const u = payload.usage || {}
  const input =
    Number(u.prompt_tokens ?? u.input_tokens ?? u.promptTokens ?? 0) || 0
  const output =
    Number(u.completion_tokens ?? u.output_tokens ?? u.completionTokens ?? 0) || 0
  return {
    inputTokens: input,
    outputTokens: output,
    cachedInputTokens: parseCachedInputTokens(u)
  }
}

function parseAnthropicUsage(payload: { usage?: Record<string, unknown> }): AiUsage {
  const u = payload.usage || {}
  const input = Number(u.input_tokens ?? u.prompt_tokens ?? 0) || 0
  const output = Number(u.output_tokens ?? u.completion_tokens ?? 0) || 0
  const cacheRead = u.cache_read_input_tokens
  const cached =
    typeof cacheRead === 'number' && Number.isFinite(cacheRead)
      ? Math.max(0, Math.round(cacheRead))
      : parseCachedInputTokens(u)
  return { inputTokens: input, outputTokens: output, cachedInputTokens: cached }
}

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim()
  const fullFence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fullFence) return fullFence[1].trim()
  const openFence = trimmed.match(/^```(?:json)?\s*([\s\S]*)$/i)
  if (openFence) return openFence[1].replace(/```\s*$/, '').trim()
  return trimmed
}

function extractBalancedObject(text: string): string | null {
  const start = text.indexOf('{')
  if (start === -1) return null
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      if (escape) {
        escape = false
        continue
      }
      if (ch === '\\') {
        escape = true
        continue
      }
      if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

function softRepairJsonText(text: string): string {
  return text
    .replace(/^\uFEFF/, '')
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
}

function extractJsonCandidate(raw: string): { json: string; incomplete: boolean } {
  const stripped = stripCodeFence(raw)
  const balanced = extractBalancedObject(stripped)
  if (balanced) return { json: balanced, incomplete: false }
  const first = stripped.indexOf('{')
  if (first !== -1) return { json: stripped.slice(first), incomplete: true }
  return { json: stripped, incomplete: true }
}

function parseAiJson(content: string): unknown {
  const { json, incomplete } = extractJsonCandidate(content)
  if (incomplete) throw new Error('INCOMPLETE_JSON')
  const candidates = [json, softRepairJsonText(json)]
  let lastError: unknown
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate)
    } catch (e) {
      lastError = e
    }
  }
  throw lastError instanceof Error ? lastError : new Error('JSON_PARSE_FAILED')
}

async function callOpenAI(messages: ChatMessage[], signal: AbortSignal, cfg: LlmConfig): Promise<RawModelResult> {
  const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`
    },
    signal,
    body: JSON.stringify({
      model: cfg.model,
      messages,
      temperature: JSON_TEMPERATURE,
      max_tokens: cfg.maxTokens,
      ...(cfg.useJsonObject ? { response_format: jsonResponseFormat } : {}),
      ...openAiThinkingExtra(cfg)
    })
  })
  if (!response.ok) throw mapHttpError(response.status)

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string | null; reasoning_content?: string | null }
      finish_reason?: string
    }>
    usage?: Record<string, unknown>
  }
  const choice = payload?.choices?.[0]
  const content = choice?.message?.content
  if (typeof content !== 'string' || content.trim() === '') {
    const reason = (choice?.finish_reason || '').toLowerCase()
    if (reason === 'length' || reason === 'max_tokens') {
      throw new AiClientError(
        'AI 输出被截断（可能 thinking 耗尽 max_tokens 导致 content 为空），请提高 AI_MAX_TOKENS 或设置 AI_THINKING=disabled 后重试。'
      )
    }
    throw new AiClientError('AI 返回格式不符合要求，请重试。')
  }
  const reason = (choice?.finish_reason || '').toLowerCase()
  return {
    content,
    truncated: reason === 'length' || reason === 'max_tokens',
    usage: parseOpenAiUsage(payload)
  }
}

async function callAnthropic(messages: ChatMessage[], signal: AbortSignal, cfg: LlmConfig): Promise<RawModelResult> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content || ''
  const userMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const response = await fetch(`${cfg.baseUrl}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01'
    },
    signal,
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: cfg.maxTokens,
      system: systemMsg,
      messages: userMessages,
      temperature: JSON_TEMPERATURE
    })
  })
  if (!response.ok) throw mapHttpError(response.status)

  const payload = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>
    stop_reason?: string
    usage?: Record<string, unknown>
  }
  const text = (payload?.content || [])
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('')
  if (text.trim() === '') throw new AiClientError('AI 返回格式不符合要求，请重试。')

  const reason = (payload?.stop_reason || '').toLowerCase()
  return {
    content: text,
    truncated: reason === 'max_tokens' || reason === 'length',
    usage: parseAnthropicUsage(payload)
  }
}

async function invokeModel(messages: ChatMessage[], signal: AbortSignal, cfg: LlmConfig): Promise<RawModelResult> {
  return cfg.anthropic ? callAnthropic(messages, signal, cfg) : callOpenAI(messages, signal, cfg)
}

function buildParseRepairPrompt(broken: string, reason: string): string {
  const clipped = broken.length > 12000 ? `${broken.slice(0, 12000)}\n…(已截断展示)` : broken
  return `你上一次的输出不是可解析的完整 JSON（原因：${reason}）。
请把下面内容修复为「单个合法 JSON 对象」后重新输出。

硬性要求：
1. 只输出 JSON 对象本身，不要 Markdown，不要代码块，不要解释。
2. 必须是完整可被 JSON.parse 解析的对象。
3. 保持原有业务字段与含义，不要编造新的实习/项目/数据/奖项。
4. 若原文被截断，请补全缺失的括号与必要字段，字段值尽量精简，优先保证结构完整。

待修复内容：
${clipped}`
}

function buildStructureRepairPrompt(invalidJson: string, validationError: string): string {
  const clipped = invalidJson.length > 12000 ? `${invalidJson.slice(0, 12000)}\n…(已截断展示)` : invalidJson
  return `你上一次返回的 JSON 可以解析，但字段结构不符合要求。
校验错误：${validationError}

请输出修正后的「单个合法 JSON 对象」。

硬性要求：
1. 只输出 JSON，不要 Markdown，不要代码块，不要解释。
2. 字段名必须与约定 Schema 完全一致。
3. 补齐缺失字段；枚举值必须使用约定中文取值；数组字段必须是数组。
4. 不要编造用户不存在的实习、项目、数据、奖项、证书或成果；不确定处用【待补充】或【待确认】。
5. 内容尽量精简，优先保证结构完整可校验。

上一次 JSON：
${clipped}`
}

function buildCompactRetryPrompt(): string {
  return `上一次输出因长度限制被截断，导致 JSON 不完整。
请重新输出一个更精简但结构完整的合法 JSON 对象。

硬性要求：
1. 只输出 JSON，不要 Markdown，不要代码块，不要解释。
2. 必须包含全部约定顶层字段，一个都不能缺。
3. 每个数组控制在必要数量：匹配表 5-8 条，追问 5-8 条，模拟面试题 8 道，改写对照 4-8 条。
4. 每条字符串尽量短（1-2 句），优先结构完整，不要写长段落。
5. 不要编造用户不存在的经历或数据。`
}

async function callModelOnce(
  messages: ChatMessage[],
  timeoutMs: number,
  cfg: LlmConfig
): Promise<RawModelResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await invokeModel(messages, controller.signal, cfg)
  } catch (e) {
    if (e instanceof AiClientError) throw e
    if (e instanceof Error && e.name === 'AbortError') {
      throw new AiClientError('请求超时，请稍后重试或缩短输入内容。')
    }
    throw new AiClientError('AI 服务调用失败，请检查 API Key、模型名称或网络连接。')
  } finally {
    clearTimeout(timer)
  }
}

function toParsedObject(content: string, truncatedFlag: boolean): Record<string, unknown> {
  if (truncatedFlag) {
    try {
      const parsed = parseAiJson(content)
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>
      }
    } catch {
      throw new AiClientError('AI 输出被截断导致 JSON 不完整，请重试。')
    }
  }

  let parsed: unknown
  try {
    parsed = parseAiJson(content)
  } catch (e) {
    if (e instanceof Error && e.message === 'INCOMPLETE_JSON') {
      throw new AiClientError('AI 输出被截断导致 JSON 不完整，请重试。')
    }
    throw new AiClientError('AI 返回格式不符合要求，请重试。')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new AiClientError('AI 返回格式不符合要求，请重试。')
  }
  return parsed as Record<string, unknown>
}

function toMeta(usage: AiUsage, durationMs: number, attemptCount: number, cfg: LlmConfig): AiCallMeta {
  const cachedInputTokens = usage.cachedInputTokens
  const uncachedInputTokens =
    cachedInputTokens == null ? null : Math.max(0, usage.inputTokens - cachedInputTokens)
  return {
    model: cfg.model,
    provider: cfg.provider,
    inputTokens: usage.inputTokens,
    cachedInputTokens,
    uncachedInputTokens,
    outputTokens: usage.outputTokens,
    durationMs,
    attemptCount,
    estimatedCostCny: estimateCostCny(
      cfg.model,
      usage.inputTokens,
      usage.outputTokens,
      cachedInputTokens
    )
  }
}

function persistCost(
  options: AiCallOptions | undefined,
  meta: AiCallMeta,
  success: boolean,
  error?: string
) {
  if (!options?.stage || !options.chainId) return
  appendCostRun({
    chainId: options.chainId,
    ...(options.caseId ? { caseId: options.caseId } : {}),
    stage: options.stage,
    model: meta.model,
    provider: meta.provider,
    inputTokens: meta.inputTokens,
    cachedInputTokens: meta.cachedInputTokens,
    uncachedInputTokens: meta.uncachedInputTokens,
    outputTokens: meta.outputTokens,
    durationMs: meta.durationMs,
    success,
    error,
    estimatedCostCny: meta.estimatedCostCny,
    attemptCount: meta.attemptCount
  })
}

/**
 * 调用大模型并返回已解析的 JSON 对象与用量元数据。
 */
export async function callAiForJson(
  messages: ChatMessage[],
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<{ data: Record<string, unknown>; usage: AiUsage; attemptCount: number }> {
  const cfg = getLlmConfig()
  assertKeyConfigured(cfg)

  let usage = emptyUsage()
  let attemptCount = 0

  const first = await callModelOnce(messages, timeoutMs, cfg)
  attemptCount += 1
  usage = addUsage(usage, first.usage)
  try {
    return { data: toParsedObject(first.content, first.truncated), usage, attemptCount }
  } catch (firstError) {
    const reason =
      firstError instanceof Error && firstError.message.includes('截断')
        ? '输出被截断'
        : 'JSON 无法解析'

    const repairMessages: ChatMessage[] = [
      ...messages,
      { role: 'assistant', content: first.content.slice(0, 8000) },
      {
        role: 'user',
        content:
          reason === '输出被截断'
            ? buildCompactRetryPrompt()
            : buildParseRepairPrompt(first.content, reason)
      }
    ]

    console.warn(`[AI] JSON 解析失败（${reason}），正在自动重试修复…`)
    const second = await callModelOnce(repairMessages, timeoutMs, cfg)
    attemptCount += 1
    usage = addUsage(usage, second.usage)
    return { data: toParsedObject(second.content, second.truncated), usage, attemptCount }
  }
}

/**
 * 调用大模型并做结构校验；返回业务数据与 Token/耗时元数据。
 */
export async function callAiForValidatedJson<T>(
  messages: ChatMessage[],
  validate: (data: unknown) => T,
  options: AiCallOptions = {}
): Promise<ValidatedAiResult<T>> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const started = Date.now()
  let usage = emptyUsage()
  let attemptCount = 0

  try {
    const first = await callAiForJson(messages, timeoutMs)
    usage = addUsage(usage, first.usage)
    attemptCount += first.attemptCount

    try {
      const data = validate(first.data)
      const meta = toMeta(usage, Date.now() - started, attemptCount, getLlmConfig())
      persistCost(options, meta, true)
      return { data, meta }
    } catch (e) {
      const validationError = e instanceof Error ? e.message : '结构不符合要求'
      console.warn(`[AI] 结构校验失败，正在自动重试修复：${validationError}`)

      const repairMessages: ChatMessage[] = [
        ...messages,
        { role: 'assistant', content: JSON.stringify(first.data) },
        { role: 'user', content: buildStructureRepairPrompt(JSON.stringify(first.data), validationError) }
      ]

      const second = await callAiForJson(repairMessages, timeoutMs)
      usage = addUsage(usage, second.usage)
      attemptCount += second.attemptCount
      const data = validate(second.data)
      const meta = toMeta(usage, Date.now() - started, attemptCount, getLlmConfig())
      persistCost(options, meta, true)
      return { data, meta }
    }
  } catch (e) {
    const meta = toMeta(usage, Date.now() - started, Math.max(1, attemptCount), getLlmConfig())
    const message = e instanceof Error ? e.message : '未知错误'
    persistCost(options, meta, false, message)
    throw e
  }
}

/** 用当前填写的地址、模型和 Key 发一条很短的请求，确认能否连通。不写入分析记录。 */
export async function testLlmConnection(input: { baseUrl: string; model: string; apiKey: string }): Promise<void> {
  const baseUrl = input.baseUrl.replace(/\/$/, '')
  const anthropic = baseUrl.toLowerCase().includes('anthropic')
  const cfg: LlmConfig = {
    ...getLlmConfig(),
    apiKey: input.apiKey,
    baseUrl,
    model: input.model,
    provider: anthropic ? 'anthropic-compatible' : 'openai',
    anthropic,
    maxTokens: 32,
    useJsonObject: false,
    thinking: 'disabled'
  }
  assertKeyConfigured(cfg)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20_000)
  try {
    const result = await invokeModel([{ role: 'user', content: '只回复一个字：好' }], controller.signal, cfg)
    if (!result.content.trim()) {
      throw new AiClientError('已经连上，但模型没有返回内容。请检查模型名称。')
    }
  } catch (e) {
    if (e instanceof AiClientError) throw e
    if (e instanceof Error && e.name === 'AbortError') {
      throw new AiClientError('检测超时，请检查接口地址或稍后再试。')
    }
    throw new AiClientError('连不上这个地址，请检查网址和网络。')
  } finally {
    clearTimeout(timer)
  }
}
