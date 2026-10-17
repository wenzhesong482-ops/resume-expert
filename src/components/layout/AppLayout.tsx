import { useEffect, useState, type ReactNode } from 'react'
import LlmSettingsDialog from '../settings/LlmSettingsDialog'
import { fetchLlmSettings } from '../../services/api'

interface AppLayoutProps {
  children: ReactNode
}

// 整体三栏布局：顶部标题 + 流程导航 + （左侧输入 / 右侧结果）（CLAUDE.md §6、§18）。
export default function AppLayout({ children }: AppLayoutProps) {
  const [open, setOpen] = useState(false)
  const [configured, setConfigured] = useState(false)

  useEffect(() => {
    fetchLlmSettings()
      .then((settings) => setConfigured(settings.configured))
      .catch(() => setConfigured(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-900 text-sm font-semibold text-white">
              简
            </span>
            <h1 className="text-base font-semibold">简历专家 · 应届生校招简历优化 Agent</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {configured ? 'API 已设置' : '设置 API'}
            </button>
            <span className="text-xs text-gray-400">应届生校招 / 实习求职 · JD 定制简历优化</span>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
      <LlmSettingsDialog
        open={open}
        onClose={() => setOpen(false)}
        onSaved={(settings) => setConfigured(settings.configured)}
      />
    </div>
  )
}
