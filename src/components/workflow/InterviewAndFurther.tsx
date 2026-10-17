import type { InterviewRisk, FurtherSuggestions, SkillGapPlan, SkillImportance, EstimatedDifficulty, SkillPriority } from '../../types'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'

function importanceTone(v: SkillImportance) {
  if (v === '必须补') return 'red'
  if (v === '建议补') return 'amber'
  return 'gray'
}
function difficultyTone(v: EstimatedDifficulty) {
  if (v === '高') return 'red'
  if (v === '中') return 'amber'
  return 'green'
}
function priorityTone(v: SkillPriority) {
  if (v === '高') return 'red'
  if (v === '中') return 'amber'
  return 'gray'
}

interface InterviewAndFurtherProps {
  interviewRisks: InterviewRisk[]
  further: FurtherSuggestions
  skillGap: SkillGapPlan
  onExport: () => void
}

export default function InterviewAndFurther({ interviewRisks, further, skillGap, onExport }: InterviewAndFurtherProps) {
  return (
    <div className="space-y-4">
      <Card title="面试追问风险" description="简历中最可能被面试官追问的问题与应对建议">
        <div className="space-y-3">
          {interviewRisks.map((r, i) => (
            <div key={i} className="rounded-md border border-gray-100 p-3">
              <p className="text-sm font-medium text-gray-900">{i + 1}. {r.question}</p>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <dt className="text-gray-400">风险原因</dt>
                  <dd className="text-gray-700">{r.riskReason}</dd>
                </div>
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <dt className="text-gray-400">需准备证据</dt>
                  <dd className="text-gray-700">{r.evidenceNeeded}</dd>
                </div>
                <div className="grid grid-cols-[90px_1fr] gap-2">
                  <dt className="text-gray-400">建议回答</dt>
                  <dd className="whitespace-pre-wrap text-gray-700">{r.suggestedAnswer}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Card>

      <Card title="技能缺口与补强路径" description={`目标岗位：${skillGap.targetRole}`}>
        <div className="space-y-4 text-sm">
          <p className="text-gray-700">{skillGap.summary}</p>

          {skillGap.missingSkills.length === 0 ? (
            <p className="py-2 text-center text-gray-400">暂无足够信息生成该项分析</p>
          ) : (
            <div className="space-y-3">
              {skillGap.missingSkills.map((s, i) => (
                <div key={i} className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-medium text-gray-900">{s.skill}</span>
                    <Badge tone={importanceTone(s.importance)}>{s.importance}</Badge>
                    <Badge tone={difficultyTone(s.estimatedDifficulty)}>难度 {s.estimatedDifficulty}</Badge>
                    <Badge tone={priorityTone(s.priority)}>优先级 {s.priority}</Badge>
                  </div>
                  <dl className="grid grid-cols-[90px_1fr] gap-1">
                    <dt className="text-gray-400">当前证据</dt>
                    <dd className="text-gray-700">{s.currentEvidence}</dd>
                    <dt className="text-gray-400">目标水平</dt>
                    <dd className="text-gray-700">{s.targetLevel}</dd>
                    <dt className="text-gray-400">学习来源</dt>
                    <dd className="text-gray-700">{s.learningSourceTypes.join('、')}</dd>
                    <dt className="text-gray-400">练习项目</dt>
                    <dd className="text-gray-700">{s.practiceProject}</dd>
                    <dt className="text-gray-400">简历嵌入</dt>
                    <dd className="text-gray-700">{s.resumeEmbeddingSuggestion}</dd>
                  </dl>
                </div>
              ))}
            </div>
          )}

          {skillGap.sevenDayPlan.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">7 天计划</p>
              <ul className="list-disc space-y-1 pl-5 text-gray-700">
                {skillGap.sevenDayPlan.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {skillGap.thirtyDayPlan.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">30 天计划</p>
              <ul className="list-disc space-y-1 pl-5 text-gray-700">
                {skillGap.thirtyDayPlan.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card title="进一步补强建议">
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">还应补充的实习 / 项目 / 竞赛</p>
            <ul className="list-disc space-y-1 pl-5 text-gray-700">
              {further.projectsToAdd.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">是否需要作品集</span>
            <Badge tone={further.portfolioNeeded ? 'amber' : 'gray'}>
              {further.portfolioNeeded ? '需要' : '不需要'}
            </Badge>
          </div>
          {further.portfolioNeeded && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-gray-500">作品集应包含</p>
              <ul className="list-disc space-y-1 pl-5 text-gray-700">
                {further.portfolioContent.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-medium text-gray-500">还可生成的简历版本</p>
            <div className="flex flex-wrap gap-1.5">
              {further.resumeVersions.map((v, i) => <Badge key={i} tone="blue">{v}</Badge>)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">是否需要针对不同岗位生成不同版本</span>
            <Badge tone={further.roleSpecificVersionsNeeded ? 'amber' : 'gray'}>
              {further.roleSpecificVersionsNeeded ? '是' : '否'}
            </Badge>
          </div>
        </div>
      </Card>

      <Card title="导出结果">
        <p className="mb-3 text-sm text-gray-500">
          将本次完整优化报告（校招 JD 解析 → 面试追问与补强建议，共 9 个模块）导出为 Markdown 文件。
        </p>
        <Button onClick={onExport}>导出 Markdown</Button>
      </Card>
    </div>
  )
}
