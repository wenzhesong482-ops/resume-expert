// 前端 API 调用封装（CLAUDE.md §22.1、§20）。
// 前端只请求后端本地接口 /api/*，从不直接接触 API Key。

import type {
  AnalyzeInitialRequest,
  AnalyzeInitialResponse,
  OptimizeResumeRequest,
  OptimizeResumeResponse,
  EvaluateInterviewAnswerRequest,
  EvaluateInterviewAnswerResponse,
  ApiResponse,
  CostCallMeta
} from '../types'

export type ApiResult<T> = {
  data: T
  meta?: CostCallMeta
}

async function request<T>(url: string, payload: unknown, chainId?: string): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (chainId) headers['X-Cost-Chain-Id'] = chainId

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(chainId ? { ...(payload as object), costChainId: chainId } : payload)
    })
  } catch {
    throw new Error('后端服务未启动或网络异常，请确认已运行 npm run dev:all。')
  }

  let body: ApiResponse<T>
  try {
    body = (await response.json()) as ApiResponse<T>
  } catch {
    if (!response.ok) {
      throw new Error('后端服务未启动或返回非 JSON 内容，请确认已运行 npm run dev:all（前后端一起启动）。')
    }
    throw new Error('后端返回格式异常，请稍后重试。')
  }

  if (!response.ok || !body.success) {
    const error = body.success === false ? body.error : '请求失败，请稍后重试。'
    throw new Error(error)
  }

  return { data: body.data, meta: body.meta }
}

export function analyzeInitial(
  payload: AnalyzeInitialRequest,
  chainId?: string
): Promise<ApiResult<AnalyzeInitialResponse>> {
  return request<AnalyzeInitialResponse>('/api/analyze-initial', payload, chainId)
}

export function optimizeResume(
  payload: OptimizeResumeRequest,
  chainId?: string
): Promise<ApiResult<OptimizeResumeResponse>> {
  return request<OptimizeResumeResponse>('/api/optimize-resume', payload, chainId)
}

export function evaluateInterviewAnswer(
  payload: EvaluateInterviewAnswerRequest,
  chainId?: string
): Promise<ApiResult<EvaluateInterviewAnswerResponse>> {
  return request<EvaluateInterviewAnswerResponse>('/api/evaluate-interview-answer', payload, chainId)
}

export function createCostChainId(): string {
  return `chain_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export type LlmSettingsView = {
  baseUrl: string
  model: string
  hasKey: boolean
  keyHint: string
  configured: boolean
}

async function readApi<T>(response: Response): Promise<T> {
  let body: ApiResponse<T>
  try {
    body = (await response.json()) as ApiResponse<T>
  } catch {
    throw new Error('后端没有返回结果，请确认已经点过「开始」。')
  }
  if (!response.ok || !body.success) {
    throw new Error(body.success === false ? body.error : '请求失败，请稍后重试。')
  }
  return body.data
}

export async function fetchLlmSettings(): Promise<LlmSettingsView> {
  const response = await fetch('/api/llm-settings')
  return readApi<LlmSettingsView>(response)
}

export async function saveLlmSettings(input: {
  baseUrl: string
  model: string
  apiKey: string
}): Promise<LlmSettingsView> {
  const response = await fetch('/api/llm-settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })
  return readApi<LlmSettingsView>(response)
}

export async function testLlmSettings(input: {
  baseUrl: string
  model: string
  apiKey: string
}): Promise<string> {
  const response = await fetch('/api/llm-settings/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  })
  const data = await readApi<{ message: string }>(response)
  return data.message
}
