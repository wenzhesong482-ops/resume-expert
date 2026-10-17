import type { ReactNode } from 'react'

type Tone = 'gray' | 'green' | 'amber' | 'red' | 'blue'

interface BadgeProps {
  children: ReactNode
  tone?: Tone
}

const toneClass: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700'
}

export default function Badge({ children, tone = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${toneClass[tone]}`}>
      {children}
    </span>
  )
}

// 证据强度 → 颜色
export function strengthTone(s: string): Tone {
  if (s === '强') return 'green'
  if (s === '中') return 'blue'
  if (s === '弱') return 'amber'
  return 'red'
}
