import type { JDAnalysis as JDAnalysisType, JDRequirementLevel, RequirementLevel } from '../../types'
import Card from '../common/Card'
import Badge from '../common/Badge'
import DataTable from '../common/DataTable'

function levelTone(l: RequirementLevel) {
  if (l === '硬门槛') return 'red'
  if (l === '重要加分项') return 'amber'
  if (l === '普通加分项') return 'blue'
  return 'gray'
}

function statusTone(s: string) {
  if (s === '已满足') return 'green'
  if (s === '部分满足') return 'amber'
  if (s === '未满足') return 'red'
  return 'gray'
}

interface JDAnalysisProps {
  data: JDAnalysisType
  requirementLevels: JDRequirementLevel[]
}

export default function JDAnalysisView({ data, requirementLevels }: JDAnalysisProps) {
  return (
    <div className="space-y-4">
      <Card title="岗位核心职责">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
          {data.coreResponsibilities.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title="岗位硬性要求">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {data.hardRequirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Card>
        <Card title="岗位隐性要求">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {data.hiddenRequirements.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Card>
      </div>

      <Card title="高频关键词">
        <div className="flex flex-wrap gap-1.5">
          {data.keywords.map((k, i) => <Badge key={i} tone="blue">{k}</Badge>)}
        </div>
      </Card>

      <Card title="校招招聘方想找的应届生画像">
        <p className="text-sm text-gray-700">{data.idealCandidate}</p>
      </Card>

      <Card title="这个岗位最看重的 5 项能力">
        <div className="flex flex-wrap gap-1.5">
          {data.topFiveAbilities.map((a, i) => <Badge key={i} tone="gray">{a}</Badge>)}
        </div>
      </Card>

      <Card title="JD 硬门槛 / 软门槛拆解" description="区分必须满足、加分项与可替代项，并给出弥补方式与简历嵌入建议">
        {requirementLevels.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">暂无足够信息生成该项分析</p>
        ) : (
          <DataTable
            headers={['JD 要求', '门槛类型', '当前状态', '已有证据', '弥补方式', '简历嵌入建议']}
            rows={requirementLevels.map((r) => [
              <div className="space-y-0.5">
                <div className="text-gray-900">{r.requirement}</div>
                {r.sourceText && <div className="text-xs text-gray-400">JD 原文：{r.sourceText}</div>}
              </div>,
              <Badge tone={levelTone(r.level)}>{r.level}</Badge>,
              <Badge tone={statusTone(r.userStatus)}>{r.userStatus}</Badge>,
              <span className="text-gray-600">{r.currentEvidence}</span>,
              <span className="text-gray-600">{r.howToCompensate}</span>,
              <span className="text-gray-600">{r.resumeEmbeddingSuggestion}</span>
            ])}
            empty="暂无足够信息生成该项分析"
          />
        )}
      </Card>
    </div>
  )
}
