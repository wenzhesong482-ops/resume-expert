import type { ReactNode } from 'react'

interface SidebarProps {
  children: ReactNode
}

// 左侧输入区容器（CLAUDE.md §6）。
export default function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-[380px] shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
      <div className="p-5">{children}</div>
    </aside>
  )
}
