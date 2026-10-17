import type {
  ResumeDiagnosis as ResumeDiagnosisType,
  RoleFitAssessment,
  FitLevel,
  NoReplyDiagnosis,
  NoReplyProbability
} from '../../types'
import Card from '../common/Card'
import Badge from '../common/Badge'
import ProgressBar from '../common/ProgressBar'

const DIM_LABELS: Array<[keyof ResumeDiagnosisType['dimensions'], string]> = [
  ['educationMatch', '教育背景匹配度'],
  ['majorRelevance', '专业与岗位相关性'],
  ['internshipQuality', '实习经历质量'],
  ['projectQuality', '项目经历质量'],
  ['transferableExperience', '科研/竞赛/社团经历可转化程度'],
  ['skillsMatch', '技能工具匹配度'],
  ['resultsQuantification', '成果量化程度'],
  ['keywordCoverage', '关键词覆盖度'],
  ['differentiation', '应届生差异化亮点'],
  ['credibilityRisk', '可信度与面试追问风险'],
  ['priorityFixes', '优先补强方向']
]

function fitTone(l: FitLevel) {
  if (l === '强匹配') return 'green'
  if (l === '可尝试') return 'blue'
  if (l === '勉强匹配') return 'amber'
  return 'red'
}

function probTone(p: NoReplyProbability) {
  if (p === '高') return 'red'
  if (p === '中') return 'amber'
  return 'gray'
}

interface ResumeDiagnosisProps {
  data: ResumeDiagnosisType
  roleFit: RoleFitAssessment
  noReply: NoReplyDiagnosis
}

export default function ResumeDiagnosisView({ data, roleFit, noReply }: ResumeDiagnosisProps) {
  return (
    <div className="space-y-4">
      {/* 岗位适配度判断（顶部） */}
      <Card title="岗位适配度判断" description="这个岗位是否值得投">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge tone={fitTone(roleFit.fitLevel)}>{roleFit.fitLevel}</Badge>
              <span className="text-sm text-gray-500">校招相对匹配分</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{roleFit.fitScore} / 100</span>
          </div>
          <ProgressBar value={roleFit.fitScore} />
          <p className="text-sm text-gray-700">{roleFit.summary}</p>

          {roleFit.bestEvidence.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">关键优势证据</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-green-700">
                {roleFit.bestEvidence.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {roleFit.hardBlockers.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">硬阻碍</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
                {roleFit.hardBlockers.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {roleFit.softGaps.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">软短板</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-amber-700">
                {roleFit.softGaps.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          {roleFit.riskWarnings.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">投递风险</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                {roleFit.riskWarnings.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500">建议动作</p>
            <p className="mt-1 text-sm text-gray-900">{roleFit.recommendedAction}</p>
          </div>
        </div>
      </Card>

      {/* 简历诊断 */}
      <Card title="匹配度评分">
        <ProgressBar value={data.matchScore} label="校招岗位匹配度" />
        {data.scoreReasons.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-xs font-medium text-gray-500">扣分原因</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {data.scoreReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </Card>

      <Card title="维度诊断">
        <dl className="space-y-2">
          {DIM_LABELS.map(([key, label]) => (
            <div key={key} className="grid grid-cols-[140px_1fr] gap-2 text-sm">
              <dt className="text-gray-500">{label}</dt>
              <dd className="text-gray-700">{data.dimensions[key]}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card title="优势">
          <ul className="list-disc space-y-1 pl-5 text-sm text-green-700">
            {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </Card>
        <Card title="问题">
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
            {data.problems.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </Card>
        <Card title="优先补强项">
          <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
            {data.priorityFixes.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </Card>
      </div>

      {/* 简历无回应诊断（后半部分） */}
      <Card
        title="简历无回应诊断"
        description={noReply.hasDeliveryContext ? '结合你填写的投递情况判断' : '未提供投递情况，仅基于简历与 JD 做一般性诊断，判断依据有限'}
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{noReply.summary}</p>

          {noReply.likelyReasons.length === 0 ? (
            <p className="py-2 text-center text-sm text-gray-400">暂无足够信息生成该项分析</p>
          ) : (
            <div className="space-y-2">
              {noReply.likelyReasons.map((r, i) => (
                <div key={i} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-gray-900">{r.reason}</span>
                    <Badge tone={probTone(r.probability)}>{r.probability}</Badge>
                  </div>
                  <p className="text-xs text-gray-500">依据：{r.evidence}</p>
                  <p className="mt-1 text-sm text-gray-700">修复建议：{r.fixSuggestion}</p>
                </div>
              ))}
            </div>
          )}

          {noReply.topThreeFixes.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">三项优先修复</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                {noReply.topThreeFixes.map((f, i) => <li key={i}>{f}</li>)}
              </ol>
            </div>
          )}
          {noReply.nextSevenDayActionPlan.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-gray-500">7 天行动计划</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                {noReply.nextSevenDayActionPlan.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
