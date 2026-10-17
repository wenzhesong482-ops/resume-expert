// 顶部流程导航（CLAUDE.md §6）。展示 9 个业务步骤及当前进度。

export type StepStatus = 'done' | 'active' | 'pending'

export interface StepDef {
  key: string
  label: string
  phase: 'initial' | 'optimize'
}

export const STEPS: StepDef[] = [
  { key: 'jdAnalysis', label: '校招 JD 解析', phase: 'initial' },
  { key: 'resumeDiagnosis', label: '应届生简历诊断', phase: 'initial' },
  { key: 'matchAnalysis', label: 'JD-经历证据匹配', phase: 'initial' },
  { key: 'followUp', label: '经历补充追问', phase: 'initial' },
  { key: 'strategy', label: '校招简历优化策略', phase: 'initial' },
  { key: 'rewrite', label: '逐段优化', phase: 'optimize' },
  { key: 'finalResume', label: '最终校招简历', phase: 'optimize' },
  { key: 'interviewFurther', label: '面试追问与补强建议', phase: 'optimize' },
  { key: 'mockInterview', label: '模拟面试', phase: 'optimize' }
]

interface TopNavProps {
  activeIndex: number // 当前查看的步骤，-1 表示尚未开始
  maxReachedIndex: number // 已完成到第几步
}

export default function TopNav({ activeIndex, maxReachedIndex }: TopNavProps) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <ol className="flex flex-wrap items-center gap-1 px-6 py-3">
        {STEPS.map((step, i) => {
          const status: StepStatus =
            i < maxReachedIndex ? 'done' : i === activeIndex ? 'active' : 'pending'
          const isLocked = i > maxReachedIndex
          const base =
            'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors'
          const cls =
            status === 'active'
              ? 'bg-gray-900 text-white'
              : status === 'done'
                ? 'bg-gray-100 text-gray-700'
                : 'text-gray-400'
          return (
            <li key={step.key} className="flex items-center">
              <span
                className={`${base} ${cls} ${isLocked && status !== 'done' ? 'opacity-50' : ''}`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    status === 'active'
                      ? 'bg-white/20'
                      : status === 'done'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {status === 'done' ? '✓' : i + 1}
                </span>
                {step.label}
              </span>
              {i < STEPS.length - 1 && <span className="px-1 text-gray-300">›</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
