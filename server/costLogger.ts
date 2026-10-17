// 成本观测：持久化每次 AI 调用的 Token / 耗时，供成本看板读取。
// 计费货币统一为人民币（CNY）。不记录简历原文与 API Key。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type CostStage =
  | 'analyze-initial'
  | 'optimize-resume'
  | 'evaluate-interview-answer'
  | 'follow-up-answers'

export type CostRunRecord = {
  id: string
  /** 测试集 Case 标识（可选；历史记录可无此字段） */
  caseId?: string
  chainId: string
  timestamp: string
  stage: CostStage
  model: string
  provider: string
  inputTokens: number
  /**
   * 缓存命中的输入 Token。
   * null = Provider 未返回 cache 明细（勿当作「无缓存」）。
   */
  cachedInputTokens: number | null
  /**
   * 未命中缓存的输入 Token。
   * null = 与 cachedInputTokens 同步，表示无可靠 cache 信息。
   */
  uncachedInputTokens: number | null
  outputTokens: number
  totalTokens: number
  durationMs: number
  success: boolean
  error?: string
  /** 估算成本（人民币元） */
  estimatedCostCny: number | null
  attemptCount: number
}

export type CostStore = {
  version: 1
  updatedAt: string
  currency: 'CNY'
  runs: CostRunRecord[]
}

export type AiUsage = {
  inputTokens: number
  outputTokens: number
  /**
   * 单次 API 返回的 cached input tokens。
   * null = 本次响应无 cache 明细。
   */
  cachedInputTokens: number | null
}

export type AiCallMeta = {
  model: string
  provider: string
  inputTokens: number
  cachedInputTokens: number | null
  uncachedInputTokens: number | null
  outputTokens: number
  durationMs: number
  attemptCount: number
  estimatedCostCny: number | null
}

/** 历史 USD 记录迁移用汇率（仅兼容旧数据） */
const LEGACY_USD_TO_CNY = 7.2

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = [
  process.cwd(),
  path.resolve(__dirname, '..')
].find((dir) => fs.existsSync(path.join(dir, 'package.json'))) || process.cwd()
const DATA_DIR = path.resolve(ROOT_DIR, 'cost-dashboard/data')
const DATA_FILE = path.join(DATA_DIR, 'runs.json')
const CANDIDATES_FILE = path.resolve(ROOT_DIR, 'model-candidates.json')

type PricingHint = {
  unit?: string
  inputCacheMiss?: number
  inputCacheHit?: number
  output?: number
}

type CandidateLike = {
  id?: string
  AI_MODEL?: string
  pricingHint?: PricingHint
  plan?: string
}

type ModelPricing = {
  inputMiss: number
  inputHit: number | null
  output: number
}

function asOptionalNonNegInt(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return Math.max(0, Math.round(value))
}

function deriveUncached(
  inputTokens: number,
  cachedInputTokens: number | null
): number | null {
  if (cachedInputTokens == null) return null
  return Math.max(0, inputTokens - cachedInputTokens)
}

function normalizeRun(raw: Record<string, unknown>): CostRunRecord {
  const legacyUsd = typeof raw.estimatedCostUsd === 'number' ? raw.estimatedCostUsd : null
  const cny =
    typeof raw.estimatedCostCny === 'number'
      ? raw.estimatedCostCny
      : legacyUsd != null
        ? legacyUsd * LEGACY_USD_TO_CNY
        : null
  const inputTokens = Number(raw.inputTokens) || 0
  const cachedRaw = raw.cachedInputTokens
  // 历史记录无 cache 字段 → null（表示「未知」，不是 0）
  const cachedInputTokens =
    cachedRaw === undefined ? null : asOptionalNonNegInt(cachedRaw)
  const uncachedRaw = raw.uncachedInputTokens
  const uncachedInputTokens =
    uncachedRaw === undefined
      ? deriveUncached(inputTokens, cachedInputTokens)
      : asOptionalNonNegInt(uncachedRaw)

  const caseId =
    typeof raw.caseId === 'string' && raw.caseId.trim() ? raw.caseId.trim() : undefined

  return {
    id: String(raw.id || ''),
    ...(caseId ? { caseId } : {}),
    chainId: String(raw.chainId || ''),
    timestamp: String(raw.timestamp || ''),
    stage: raw.stage as CostStage,
    model: String(raw.model || ''),
    provider: String(raw.provider || ''),
    inputTokens,
    cachedInputTokens,
    uncachedInputTokens,
    outputTokens: Number(raw.outputTokens) || 0,
    totalTokens: Number(raw.totalTokens) || 0,
    durationMs: Number(raw.durationMs) || 0,
    success: Boolean(raw.success),
    error: typeof raw.error === 'string' ? raw.error : undefined,
    estimatedCostCny: cny,
    attemptCount: Number(raw.attemptCount) || 1
  }
}

function ensureStore(): CostStore {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    const empty: CostStore = { version: 1, updatedAt: new Date().toISOString(), currency: 'CNY', runs: [] }
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), 'utf8')
    return empty
  }
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as {
      version?: number
      updatedAt?: string
      runs?: Record<string, unknown>[]
    }
    if (!raw || !Array.isArray(raw.runs)) throw new Error('bad store')
    return {
      version: 1,
      updatedAt: raw.updatedAt || '',
      currency: 'CNY',
      runs: raw.runs.map((r) => normalizeRun(r))
    }
  } catch {
    const empty: CostStore = { version: 1, updatedAt: new Date().toISOString(), currency: 'CNY', runs: [] }
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), 'utf8')
    return empty
  }
}

function loadPricingMap(): Map<string, ModelPricing | null> {
  const map = new Map<string, ModelPricing | null>()
  // 默认参考价：人民币元 / 百万 tokens（以厂商账单为准）
  map.set('glm-5.2', { inputMiss: 8, inputHit: null, output: 28 })
  try {
    const raw = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8')) as {
      baseline?: CandidateLike
      candidates?: CandidateLike[]
    }
    const all = [raw.baseline, ...(raw.candidates || [])].filter(Boolean) as CandidateLike[]
    for (const item of all) {
      const model = (item.AI_MODEL || item.id || '').trim()
      if (!model) continue
      if (item.plan === 'Agent Plan') {
        map.set(model, null) // AFP 套餐，不按 token 人民币估算
        continue
      }
      const p = item.pricingHint
      if (p && typeof p.inputCacheMiss === 'number' && typeof p.output === 'number') {
        map.set(model, {
          inputMiss: p.inputCacheMiss,
          inputHit: typeof p.inputCacheHit === 'number' ? p.inputCacheHit : null,
          output: p.output
        })
      }
    }
  } catch {
    // 定价表缺失时仅记录 Token
  }
  return map
}

/**
 * 估算成本（人民币元）。
 * - 有 cache 明细且配置了 hit 价：按 uncached×miss + cached×hit
 * - 无 cache 明细：全部 input 按 miss 价（保守，不假装已知缓存）
 */
export function estimateCostCny(
  model: string,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens: number | null = null
): number | null {
  const pricing = loadPricingMap().get(model)
  if (!pricing) return null

  const outputCost = (outputTokens / 1_000_000) * pricing.output

  if (cachedInputTokens != null && pricing.inputHit != null) {
    const cached = Math.max(0, Math.min(inputTokens, cachedInputTokens))
    const uncached = Math.max(0, inputTokens - cached)
    const inputCost =
      (uncached / 1_000_000) * pricing.inputMiss + (cached / 1_000_000) * pricing.inputHit
    return inputCost + outputCost
  }

  // 无可靠 cache 信息，或模型未配置 hit 价：全部按 miss
  return (inputTokens / 1_000_000) * pricing.inputMiss + outputCost
}

/** 读取原始 store，不对历史 run 做字段回填，避免写盘时“迁移”旧记录。 */
function readRawStoreForAppend(): {
  version: 1
  updatedAt: string
  currency: 'CNY'
  runs: Record<string, unknown>[]
} {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DATA_FILE)) {
    return { version: 1, updatedAt: new Date().toISOString(), currency: 'CNY', runs: [] }
  }
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as {
      updatedAt?: string
      runs?: Record<string, unknown>[]
    }
    if (!raw || !Array.isArray(raw.runs)) {
      return { version: 1, updatedAt: new Date().toISOString(), currency: 'CNY', runs: [] }
    }
    return {
      version: 1,
      updatedAt: raw.updatedAt || '',
      currency: 'CNY',
      runs: raw.runs
    }
  } catch {
    return { version: 1, updatedAt: new Date().toISOString(), currency: 'CNY', runs: [] }
  }
}

export function appendCostRun(
  partial: Omit<
    CostRunRecord,
    'id' | 'timestamp' | 'totalTokens' | 'estimatedCostCny' | 'cachedInputTokens' | 'uncachedInputTokens'
  > & {
    caseId?: string
    cachedInputTokens?: number | null
    uncachedInputTokens?: number | null
    estimatedCostCny?: number | null
  }
): CostRunRecord {
  const inputTokens = Math.max(0, Math.round(partial.inputTokens))
  const outputTokens = Math.max(0, Math.round(partial.outputTokens))
  const cachedInputTokens =
    partial.cachedInputTokens === undefined ? null : asOptionalNonNegInt(partial.cachedInputTokens)
  const uncachedInputTokens =
    partial.uncachedInputTokens !== undefined
      ? asOptionalNonNegInt(partial.uncachedInputTokens)
      : deriveUncached(inputTokens, cachedInputTokens)

  const caseId = typeof partial.caseId === 'string' && partial.caseId.trim() ? partial.caseId.trim() : undefined

  const record: CostRunRecord = {
    id: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ...(caseId ? { caseId } : {}),
    chainId: partial.chainId,
    timestamp: new Date().toISOString(),
    stage: partial.stage,
    model: partial.model,
    provider: partial.provider,
    inputTokens,
    cachedInputTokens,
    uncachedInputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    durationMs: Math.max(0, Math.round(partial.durationMs)),
    success: partial.success,
    ...(typeof partial.error === 'string' ? { error: partial.error } : {}),
    estimatedCostCny:
      partial.estimatedCostCny !== undefined
        ? partial.estimatedCostCny
        : estimateCostCny(partial.model, inputTokens, outputTokens, cachedInputTokens),
    attemptCount: Math.max(1, Math.round(partial.attemptCount))
  }

  // 仅追加新记录；历史 runs 原样写回，不回填新字段
  const store = readRawStoreForAppend()
  store.runs.push(record as unknown as Record<string, unknown>)
  store.updatedAt = record.timestamp
  store.currency = 'CNY'
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf8')
  console.log(
    `[Cost] ${record.stage}` +
      (record.caseId ? ` case=${record.caseId}` : '') +
      ` model=${record.model} in=${record.inputTokens}` +
      (record.cachedInputTokens != null ? ` cached=${record.cachedInputTokens}` : ' cached=?') +
      ` out=${record.outputTokens} ` +
      `${record.durationMs}ms success=${record.success}` +
      (record.estimatedCostCny != null ? ` ~¥${record.estimatedCostCny.toFixed(6)}` : '')
  )
  return record
}

export function readCostStore(): CostStore {
  return ensureStore()
}

export function buildCostMetrics(store: CostStore = ensureStore()) {
  const runs = store.runs
  const byModel = new Map<
    string,
    {
      model: string
      calls: number
      successCalls: number
      inputTokens: number
      outputTokens: number
      totalTokens: number
      durationMs: number
      estimatedCostCny: number
      hasCnyEstimate: boolean
    }
  >()
  const byStage = new Map<
    string,
    { stage: string; calls: number; inputTokens: number; outputTokens: number; durationMs: number }
  >()
  const byDay = new Map<string, { date: string; inputTokens: number; outputTokens: number; costCny: number }>()
  const chainMap = new Map<
    string,
    {
      chainId: string
      caseId?: string
      model: string
      stages: string[]
      inputTokens: number
      outputTokens: number
      durationMs: number
      costCny: number
      success: boolean
    }
  >()

  for (const r of runs) {
    // 优先用记录中的估算；若为空则按当前 model-candidates 定价实时回算（避免改价后看板仍显示 —）
    const liveCost = estimateCostCny(r.model, r.inputTokens, r.outputTokens, r.cachedInputTokens)
    const runCost = r.estimatedCostCny != null ? r.estimatedCostCny : liveCost

    const m = byModel.get(r.model) || {
      model: r.model,
      calls: 0,
      successCalls: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      durationMs: 0,
      estimatedCostCny: 0,
      hasCnyEstimate: false
    }
    m.calls += 1
    if (r.success) m.successCalls += 1
    m.inputTokens += r.inputTokens
    m.outputTokens += r.outputTokens
    m.totalTokens += r.totalTokens
    m.durationMs += r.durationMs
    if (runCost != null) {
      m.estimatedCostCny += runCost
      m.hasCnyEstimate = true
    }
    byModel.set(r.model, m)

    const s = byStage.get(r.stage) || {
      stage: r.stage,
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
      durationMs: 0
    }
    s.calls += 1
    s.inputTokens += r.inputTokens
    s.outputTokens += r.outputTokens
    s.durationMs += r.durationMs
    byStage.set(r.stage, s)

    const day = r.timestamp.slice(0, 10)
    const d = byDay.get(day) || { date: day, inputTokens: 0, outputTokens: 0, costCny: 0 }
    d.inputTokens += r.inputTokens
    d.outputTokens += r.outputTokens
    d.costCny += runCost || 0
    byDay.set(day, d)

    const c = chainMap.get(r.chainId) || {
      chainId: r.chainId,
      ...(r.caseId ? { caseId: r.caseId } : {}),
      model: r.model,
      stages: [],
      inputTokens: 0,
      outputTokens: 0,
      durationMs: 0,
      costCny: 0,
      success: true
    }
    if (!c.caseId && r.caseId) c.caseId = r.caseId
    if (!c.stages.includes(r.stage)) c.stages.push(r.stage)
    c.inputTokens += r.inputTokens
    c.outputTokens += r.outputTokens
    c.durationMs += r.durationMs
    c.costCny += runCost || 0
    c.success = c.success && r.success
    c.model = r.model
    chainMap.set(r.chainId, c)
  }

  const modelRows = [...byModel.values()].map((m) => ({
    ...m,
    successRate: m.calls ? m.successCalls / m.calls : 0,
    avgDurationMs: m.calls ? Math.round(m.durationMs / m.calls) : 0,
    estimatedCostCny: m.hasCnyEstimate ? m.estimatedCostCny : null
  }))

  const totalInput = runs.reduce((a, r) => a + r.inputTokens, 0)
  const totalOutput = runs.reduce((a, r) => a + r.outputTokens, 0)
  const totalCost = modelRows.reduce((a, m) => a + (m.estimatedCostCny || 0), 0)
  const totalDuration = runs.reduce((a, r) => a + r.durationMs, 0)
  const successCount = runs.filter((r) => r.success).length

  return {
    updatedAt: store.updatedAt,
    currency: 'CNY' as const,
    summary: {
      totalCalls: runs.length,
      successCalls: successCount,
      successRate: runs.length ? successCount / runs.length : 0,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      totalTokens: totalInput + totalOutput,
      totalEstimatedCostCny: totalCost,
      avgDurationMs: runs.length ? Math.round(totalDuration / runs.length) : 0,
      chainCount: chainMap.size
    },
    byModel: modelRows.sort((a, b) => b.totalTokens - a.totalTokens),
    byStage: [...byStage.values()],
    byDay: [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)),
    chains: [...chainMap.values()].sort((a, b) => b.durationMs - a.durationMs).slice(0, 100),
    recentRuns: [...runs].reverse().slice(0, 100)
  }
}

export function newChainId(): string {
  return `chain_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/** 压测推荐：cost-v1-<caseId>-<timestamp> */
export function newBenchChainId(caseId: string): string {
  const safe = caseId.trim().replace(/[^\w.-]+/g, '_') || 'case'
  return `cost-v1-${safe}-${Date.now()}`
}
