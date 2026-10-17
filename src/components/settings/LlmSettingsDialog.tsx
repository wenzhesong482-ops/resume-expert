import { useEffect, useState } from 'react'
import { fetchLlmSettings, saveLlmSettings, testLlmSettings, type LlmSettingsView } from '../../services/api'

interface LlmSettingsDialogProps {
  open: boolean
  onClose: () => void
  onSaved: (settings: LlmSettingsView) => void
}

export default function LlmSettingsDialog({ open, onClose, onSaved }: LlmSettingsDialogProps) {
  const [baseUrl, setBaseUrl] = useState('')
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [keyHint, setKeyHint] = useState('')
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoading(true)
    setMessage('')
    setApiKey('')
    fetchLlmSettings()
      .then((settings) => {
        if (cancelled) return
        setBaseUrl(settings.baseUrl)
        setModel(settings.model)
        setKeyHint(settings.keyHint)
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setMessage(e instanceof Error ? e.message : '设置读取失败。')
        setOk(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  if (!open) return null

  async function handleTest() {
    setTesting(true)
    setMessage('')
    try {
      const text = await testLlmSettings({ baseUrl, model, apiKey })
      setMessage(text)
      setOk(true)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '连接失败。')
      setOk(false)
    } finally {
      setTesting(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const saved = await saveLlmSettings({ baseUrl, model, apiKey })
      setBaseUrl(saved.baseUrl)
      setModel(saved.model)
      setKeyHint(saved.keyHint)
      setApiKey('')
      setMessage('已保存。之后的分析都会用这份配置。')
      setOk(true)
      onSaved(saved)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '保存失败。')
      setOk(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-labelledby="llm-settings-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="llm-settings-title" className="text-lg font-semibold text-gray-900">
              设置 API
            </h2>
            <p className="mt-1 text-sm text-gray-500">填写你自己的大模型。密钥只留在这台电脑上。</p>
          </div>
          <button type="button" className="text-xl leading-none text-gray-400 hover:text-gray-900" onClick={onClose}>
            ×
          </button>
        </div>

        <label className="mt-5 block text-sm text-gray-700">
          接口地址
          <input
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://api.deepseek.com"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            autoComplete="off"
          />
        </label>
        <p className="mt-1 text-xs text-gray-400">填到域名或 /v1 为止，不要带 /chat/completions。</p>

        <label className="mt-4 block text-sm text-gray-700">
          模型名称
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="deepseek-v4-pro"
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            autoComplete="off"
          />
        </label>

        <label className="mt-4 block text-sm text-gray-700">
          API Key
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={keyHint ? `已保存 ${keyHint}，留空则不修改` : '粘贴你的 API Key'}
            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
            autoComplete="off"
          />
        </label>

        {message && (
          <p className={`mt-4 text-sm ${ok ? 'text-green-700' : 'text-red-600'}`}>{message}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            disabled={loading || testing || saving}
            onClick={handleTest}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          >
            {testing ? '检测中…' : '检测连接'}
          </button>
          <button
            type="button"
            disabled={loading || testing || saving}
            onClick={handleSave}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
          >
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
