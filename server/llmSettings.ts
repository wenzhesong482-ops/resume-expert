// 用户在网页里填写的大模型配置。只存在本机 data/llm-settings.json，不进 Git，也不回传完整 Key。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export type StoredLlmSettings = {
  baseUrl: string
  model: string
  apiKey: string
}

export type LlmSettingsPublic = {
  baseUrl: string
  model: string
  hasKey: boolean
  keyHint: string
  configured: boolean
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const settingsFile = path.join(root, 'data', 'llm-settings.json')

function emptyPublic(): LlmSettingsPublic {
  return { baseUrl: '', model: '', hasKey: false, keyHint: '', configured: false }
}

export function normalizeBaseUrl(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return ''
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return ''
  if (url.username || url.password) return ''
  return url.toString().replace(/\/$/, '')
}

export function maskApiKey(apiKey: string): string {
  const key = apiKey.trim()
  if (key.length < 4) return ''
  return `····${key.slice(-4)}`
}

export function readStoredLlmSettings(): StoredLlmSettings | null {
  try {
    const raw = fs.readFileSync(settingsFile, 'utf8')
    const parsed = JSON.parse(raw) as Partial<StoredLlmSettings>
    const baseUrl = typeof parsed.baseUrl === 'string' ? parsed.baseUrl.trim() : ''
    const model = typeof parsed.model === 'string' ? parsed.model.trim() : ''
    const apiKey = typeof parsed.apiKey === 'string' ? parsed.apiKey.trim() : ''
    if (!baseUrl && !model && !apiKey) return null
    return { baseUrl, model, apiKey }
  } catch {
    return null
  }
}

export function toPublicLlmSettings(stored: StoredLlmSettings | null): LlmSettingsPublic {
  if (!stored) return emptyPublic()
  const hasKey = stored.apiKey.length > 0
  return {
    baseUrl: stored.baseUrl,
    model: stored.model,
    hasKey,
    keyHint: hasKey ? maskApiKey(stored.apiKey) : '',
    configured: Boolean(stored.baseUrl && stored.model && hasKey)
  }
}

export function getPublicLlmSettings(): LlmSettingsPublic {
  return toPublicLlmSettings(readStoredLlmSettings())
}

export function saveLlmSettings(input: { baseUrl?: unknown; model?: unknown; apiKey?: unknown }): LlmSettingsPublic {
  const baseUrl = normalizeBaseUrl(typeof input.baseUrl === 'string' ? input.baseUrl : '')
  const model = typeof input.model === 'string' ? input.model.trim() : ''
  const incomingKey = typeof input.apiKey === 'string' ? input.apiKey.trim() : ''
  const previous = readStoredLlmSettings()

  if (!baseUrl) {
    throw new Error('请填写接口地址，以 http:// 或 https:// 开头。')
  }
  if (!model || model.length > 120) {
    throw new Error('请填写模型名称。')
  }
  if (incomingKey.length > 500 || /[\r\n]/.test(incomingKey)) {
    throw new Error('API Key 格式不正确。')
  }

  const apiKey = incomingKey || previous?.apiKey || ''
  if (!apiKey) {
    throw new Error('请填写 API Key。')
  }

  const next: StoredLlmSettings = { baseUrl, model, apiKey }
  fs.mkdirSync(path.dirname(settingsFile), { recursive: true })
  fs.writeFileSync(settingsFile, `${JSON.stringify(next, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  return toPublicLlmSettings(next)
}
