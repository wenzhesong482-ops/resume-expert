// Express 后端服务。
// 提供真实 AI 接口：/api/analyze-initial、/api/optimize-resume、/api/evaluate-interview-answer。
// 不做 Mock 兜底；错误信息具体且不泄露 Key 与完整简历。

import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import type {
  AnalyzeInitialRequest,
  AnalyzeInitialResponse,
  OptimizeResumeRequest,
  OptimizeResumeResponse,
  EvaluateInterviewAnswerRequest,
  EvaluateInterviewAnswerResponse,
  ApiResponse,
  CostCallMeta
} from '../src/types/index'
import { callAiForValidatedJson, AiClientError, testLlmConnection } from './aiClient'
import { getPublicLlmSettings, normalizeBaseUrl, readStoredLlmSettings, saveLlmSettings } from './llmSettings'
import {
  SYSTEM_PROMPT,
  buildInitialPrompt,
  buildOptimizePrompt,
  buildEvaluateInterviewAnswerPrompt
} from './prompts'
import {
  validateInitialRequest,
  validateOptimizeRequest,
  checkInputLength,
  validateInitialResponse,
  validateOptimizeResponse,
  validateEvaluateInterviewAnswerRequest,
  validateEvaluateInterviewAnswerResponse
} from './validators'
import { newChainId, type CostStage } from './costLogger'

const app = express()
app.use(express.json({ limit: '1mb' }))

const PORT = Number(process.env.SERVER_PORT) || 3001

function resolveChainId(req: Request): string {
  const fromBody = typeof req.body?.costChainId === 'string' ? req.body.costChainId.trim() : ''
  const fromHeader = typeof req.headers['x-cost-chain-id'] === 'string' ? req.headers['x-cost-chain-id'].trim() : ''
  return fromBody || fromHeader || newChainId()
}

/** caseId 优先取 body.costCaseId，其次请求头 X-Cost-Case-Id。没有就不传。 */
function resolveCaseId(req: Request): string | undefined {
  const fromBody = typeof req.body?.costCaseId === 'string' ? req.body.costCaseId.trim() : ''
  const fromHeader =
    typeof req.headers['x-cost-case-id'] === 'string' ? req.headers['x-cost-case-id'].trim() : ''
  const value = fromBody || fromHeader
  return value || undefined
}

function ok<T>(res: Response, data: T, meta?: CostCallMeta) {
  const body: ApiResponse<T> = meta ? { success: true, data, meta } : { success: true, data }
  res.json(body)
}

function fail(res: Response, status: number, error: string) {
  const body: ApiResponse<never> = { success: false, error }
  res.status(status).json(body)
}

function toPublicMeta(
  chainId: string,
  stage: CostStage,
  meta: {
    model: string
    provider: string
    inputTokens: number
    cachedInputTokens: number | null
    uncachedInputTokens: number | null
    outputTokens: number
    durationMs: number
    estimatedCostCny: number | null
  },
  caseId?: string
): CostCallMeta {
  return {
    chainId,
    ...(caseId ? { caseId } : {}),
    stage,
    model: meta.model,
    provider: meta.provider,
    inputTokens: meta.inputTokens,
    cachedInputTokens: meta.cachedInputTokens,
    uncachedInputTokens: meta.uncachedInputTokens,
    outputTokens: meta.outputTokens,
    durationMs: meta.durationMs,
    estimatedCostCny: meta.estimatedCostCny
  }
}

// ---------- /api/analyze-initial ----------

app.post('/api/analyze-initial', async (req: Request, res: Response) => {
  const input = req.body as AnalyzeInitialRequest
  const chainId = resolveChainId(req)
  const caseId = resolveCaseId(req)
  const stage: CostStage = 'analyze-initial'

  const reqCheck = validateInitialRequest(input)
  if (!reqCheck.ok) return fail(res, 400, reqCheck.error)

  const lenCheck = checkInputLength(input)
  if (!lenCheck.ok) return fail(res, 400, lenCheck.error)

  try {
    const { data, meta } = await callAiForValidatedJson<AnalyzeInitialResponse>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildInitialPrompt(input) }
      ],
      validateInitialResponse,
      { stage, chainId, caseId }
    )
    return ok(res, data, toPublicMeta(chainId, stage, meta, caseId))
  } catch (e) {
    return handleError(res, e)
  }
})

// ---------- /api/optimize-resume ----------

app.post('/api/optimize-resume', async (req: Request, res: Response) => {
  const body = req.body as OptimizeResumeRequest & { costChainId?: string; costCaseId?: string }
  const chainId = resolveChainId(req)
  const caseId = resolveCaseId(req)
  const stage: CostStage = 'optimize-resume'

  const reqCheck = validateOptimizeRequest(body)
  if (!reqCheck.ok) return fail(res, 400, reqCheck.error)

  const lenCheck = checkInputLength(body.originalInput)
  if (!lenCheck.ok) return fail(res, 400, lenCheck.error)

  try {
    const { data, meta } = await callAiForValidatedJson<OptimizeResumeResponse>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildOptimizePrompt(body) }
      ],
      validateOptimizeResponse,
      { stage, chainId, caseId }
    )
    return ok(res, data, toPublicMeta(chainId, stage, meta, caseId))
  } catch (e) {
    return handleError(res, e)
  }
})

// ---------- /api/evaluate-interview-answer ----------

app.post('/api/evaluate-interview-answer', async (req: Request, res: Response) => {
  const body = req.body as EvaluateInterviewAnswerRequest & { costChainId?: string; costCaseId?: string }
  const chainId = resolveChainId(req)
  const caseId = resolveCaseId(req)
  const stage: CostStage = 'evaluate-interview-answer'

  const reqCheck = validateEvaluateInterviewAnswerRequest(body)
  if (!reqCheck.ok) return fail(res, 400, reqCheck.error)

  if (body.userAnswer.length > 20000) {
    return fail(res, 400, '回答内容过长，请缩短后重试。')
  }

  try {
    const { data, meta } = await callAiForValidatedJson<EvaluateInterviewAnswerResponse>(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildEvaluateInterviewAnswerPrompt(body) }
      ],
      validateEvaluateInterviewAnswerResponse,
      { stage, chainId, caseId }
    )
    return ok(res, data, toPublicMeta(chainId, stage, meta, caseId))
  } catch (e) {
    return handleError(res, e)
  }
})

function handleError(res: Response, e: unknown): void {
  if (e instanceof AiClientError) {
    const status = e.message.includes('还没有配置大模型') ? 503 : 502
    console.error(`[AI] ${e.message}`)
    return fail(res, status, e.message)
  }
  if (e instanceof Error) {
    const isFormat = e.message.includes('AI 返回结构不符合要求')
    console.error(`[Server] ${e.message}`)
    return fail(res, isFormat ? 502 : 500, e.message)
  }
  console.error('[Server] 未知错误')
  return fail(res, 500, '服务器内部错误，请稍后重试。')
}

app.get('/api/llm-settings', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store')
  return ok(res, getPublicLlmSettings())
})

app.put('/api/llm-settings', (req: Request, res: Response) => {
  try {
    const saved = saveLlmSettings(req.body ?? {})
    return ok(res, saved)
  } catch (e) {
    const message = e instanceof Error ? e.message : '保存失败，请稍后重试。'
    return fail(res, 400, message)
  }
})

app.post('/api/llm-settings/test', async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as { baseUrl?: unknown; model?: unknown; apiKey?: unknown }
  const baseUrl = normalizeBaseUrl(typeof body.baseUrl === 'string' ? body.baseUrl : '')
  const model = typeof body.model === 'string' ? body.model.trim() : ''
  const incomingKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : ''
  const stored = readStoredLlmSettings()
  const apiKey = incomingKey || stored?.apiKey || ''

  if (!baseUrl) return fail(res, 400, '请填写接口地址，以 http:// 或 https:// 开头。')
  if (!model) return fail(res, 400, '请填写模型名称。')
  if (!apiKey) return fail(res, 400, '请填写 API Key。')

  try {
    await testLlmConnection({ baseUrl, model, apiKey })
    return ok(res, { message: '连接成功，之后的分析都会用这份配置。' })
  } catch (e) {
    const message = e instanceof AiClientError ? e.message : '连接失败，请检查地址、模型名称和 API Key。'
    return fail(res, 502, message)
  }
})

// 仅对未匹配的 /api/* 返回 JSON 404，避免静态页被误判为接口
app.use('/api', (_req: Request, res: Response) => {
  fail(res, 404, '接口不存在。')
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[Server] 简历专家后端已启动：http://localhost:${PORT}`)
  if (!getPublicLlmSettings().configured && !process.env.AI_API_KEY) {
    console.warn('[Server] 还没有大模型配置。请在网页右上角「设置 API」中填写。')
  }
})
