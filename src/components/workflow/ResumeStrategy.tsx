import type { ResumeStrategy as ResumeStrategyType, TransferableExperienceItem } from '../../types'
import Card from '../common/Card'
import Badge, { strengthTone } from '../common/Badge'

function ListBlock({ title, items, tone = 'gray' }: { title: string; items: string[]; tone?: 'gray' | 'red' | 'blue' }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-gray-500">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-sm text-gray-400">无</span>
        ) : (
          items.map((x, i) => <Badge key={i} tone={tone}>{x}</Badge>)
        )}
      </div>
    </div>
  )
}

interface ResumeStrategyProps {
  data: ResumeStrategyType
  transferability: TransferableExperienceItem[]
}

export default function ResumeStrategyView({ data, transferability }: ResumeStrategyProps) {
  return (
    <div className="space-y-4">
      <Card title="校招简历优化策略">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">应届生求职定位</p>
            <p className="text-sm text-gray-900">{data.positioning}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">整体风格</p>
            <Badge tone="blue">{data.resumeStyle}</Badge>
          </div>
        </div>
      </Card>

      <Card title="经历与内容调整">
        <div className="space-y-3">
          <ListBlock title="应前置的经历" items={data.experiencesToMoveForward} tone="blue" />
          <ListBlock title="应弱化或删除的内容" items={data.contentToWeakenOrDelete} tone="red" />
          <ListBlock title="应嵌入的关键词" items={data.keywordsToEmbed} tone="gray" />
          <ListBlock title="代表项目 / 经历" items={data.representativeProjects} tone="gray" />
        </div>
      </Card>

      <Card title="经历可转化分析" description="把各类经历转化为岗位能力证据，并提示适合岗位、改写潜力、缺失信息与面试风险">
        {transferability.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">暂无足够信息生成该项分析</p>
        ) : (
          <div className="space-y-3">
            {transferability.map((it, i) => (
              <div key={i} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{it.category}</span>
                  <Badge tone={strengthTone(it.evidenceStrength)}>证据 {it.evidenceStrength}</Badge>
                  <Badge tone="gray">改写潜力 {it.rewritePotential}</Badge>
                </div>
                <p className="text-sm text-gray-700">{it.description}</p>
                <div className="mt-2 grid grid-cols-[90px_1fr] gap-1 text-sm">
                  <span className="text-gray-400">可转化能力</span>
                  <div className="flex flex-wrap gap-1">
                    {it.transferableAbilities.map((a, j) => <Badge key={j} tone="blue">{a}</Badge>)}
                  </div>
                  <span className="text-gray-400">适合岗位/场景</span>
                  <span className="text-gray-700">
                    {it.suitableRolesOrScenarios.length === 0 ? '—' : it.suitableRolesOrScenarios.join('、')}
                  </span>
                  <span className="text-gray-400">简历放置</span>
                  <span className="text-gray-700">{it.resumePlacement}</span>
                  <span className="text-gray-400">缺失信息</span>
                  <span className="text-gray-700">
                    {it.missingDetails.length === 0 ? '无明显缺失' : it.missingDetails.join('；')}
                  </span>
                  <span className="text-gray-400">面试风险</span>
                  <span className="text-gray-700">
                    {it.interviewRisks.length === 0 ? '暂无明显风险' : it.interviewRisks.join('；')}
                  </span>
                  <span className="text-gray-400">改写方向</span>
                  <span className="text-gray-700">{it.suggestedRewriteDirection}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
