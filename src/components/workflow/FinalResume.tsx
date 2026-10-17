import type { ReactNode } from 'react'
import type { FinalResume as FinalResumeType, FinalResumeAssessment, RoleFitAssessment } from '../../types'
import Card from '../common/Card'
import Badge from '../common/Badge'
import ProgressBar from '../common/ProgressBar'

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{title}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  )
}

function fitTone(level: RoleFitAssessment['fitLevel']) {
  if (level === '强匹配') return 'green'
  if (level === '可尝试') return 'blue'
  if (level === '勉强匹配') return 'amber'
  return 'red'
}

function ScoreDelta({ before, after }: { before: number; after: number }) {
  const delta = Math.round(after - before)
  const tone = delta > 0 ? 'text-green-700' : delta < 0 ? 'text-red-700' : 'text-gray-500'
  const label = delta > 0 ? `+${delta}` : String(delta)
  return <span className={`text-xs font-medium ${tone}`}>{label}</span>
}

function FinalAssessmentView({
  data,
  initialFitScore,
  initialMatchScore
}: {
  data: FinalResumeAssessment
  initialFitScore: number
  initialMatchScore: number
}) {
  const roleFit = data.roleFitAssessment
  return (
    <Card title="最终简历二次适配度评估" description="基于最终简历重新判断岗位适配度和匹配度">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge tone={fitTone(roleFit.fitLevel)}>{roleFit.fitLevel}</Badge>
                <span className="text-xs text-gray-500">岗位适配度</span>
              </div>
              <ScoreDelta before={initialFitScore} after={roleFit.fitScore} />
            </div>
            <ProgressBar value={roleFit.fitScore} label="最终适配分" />
            <p className="mt-2 text-xs text-gray-500">初始：{initialFitScore} / 100</p>
          </div>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-500">岗位匹配度评分</span>
              <ScoreDelta before={initialMatchScore} after={data.matchScore} />
            </div>
            <ProgressBar value={data.matchScore} label="最终匹配分" />
            <p className="mt-2 text-xs text-gray-500">初始：{initialMatchScore} / 100</p>
          </div>
        </div>

        <p className="text-sm text-gray-700">{roleFit.summary}</p>
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-xs font-medium text-blue-700">分数变化说明</p>
          <p className="mt-1 text-sm text-blue-900">{data.scoreChangeSummary}</p>
        </div>

        {data.scoreReasons.length > 0 && (
          <Block title="最终匹配度评分依据">
            <ul className="list-disc space-y-1 pl-5 text-gray-700">
              {data.scoreReasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </Block>
        )}
        {roleFit.bestEvidence.length > 0 && (
          <Block title="最终简历中的关键优势证据">
            <ul className="list-disc space-y-1 pl-5 text-green-700">
              {roleFit.bestEvidence.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Block>
        )}
        {roleFit.hardBlockers.length > 0 && (
          <Block title="仍存在的硬阻碍">
            <ul className="list-disc space-y-1 pl-5 text-red-700">
              {roleFit.hardBlockers.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Block>
        )}
        {roleFit.softGaps.length > 0 && (
          <Block title="仍可补强的软短板">
            <ul className="list-disc space-y-1 pl-5 text-amber-700">
              {roleFit.softGaps.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Block>
        )}
        {roleFit.riskWarnings.length > 0 && (
          <Block title="投递风险">
            <ul className="list-disc space-y-1 pl-5 text-gray-700">
              {roleFit.riskWarnings.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </Block>
        )}
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">建议动作</p>
          <p className="mt-1 text-sm text-gray-900">{roleFit.recommendedAction}</p>
        </div>
      </div>
    </Card>
  )
}

export default function FinalResumeView({
  data,
  assessment,
  initialFitScore,
  initialMatchScore
}: {
  data: FinalResumeType
  assessment?: FinalResumeAssessment
  initialFitScore: number
  initialMatchScore: number
}) {
  return (
    <div className="space-y-4">
      <Card title="最终校招简历">
        <div className="space-y-4">
          {data.personalInfo && <Block title="个人信息">{data.personalInfo}</Block>}
          <Block title="求职意向">{data.jobIntention}</Block>
          <Block title="职业摘要">
            <p className="whitespace-pre-wrap">{data.professionalSummary}</p>
          </Block>
          <Block title="核心能力">
            <div className="flex flex-wrap gap-1.5">
              {data.coreAbilities.map((a, i) => <Badge key={i} tone="blue">{a}</Badge>)}
            </div>
          </Block>
          <Block title="实习 / 工作经历">
            <ul className="space-y-2">
              {data.workExperience.map((w, i) => (
                <li key={i} className="whitespace-pre-wrap rounded-md bg-gray-50 p-2">{w}</li>
              ))}
            </ul>
          </Block>
          <Block title="项目经历">
            <ul className="space-y-2">
              {data.projectExperience.map((p, i) => (
                <li key={i} className="whitespace-pre-wrap rounded-md bg-gray-50 p-2">{p}</li>
              ))}
            </ul>
          </Block>
          <Block title="技能与证书">
            <div className="flex flex-wrap gap-1.5">
              {data.skillsAndTools.map((s, i) => <Badge key={i} tone="gray">{s}</Badge>)}
            </div>
          </Block>
          <Block title="教育背景">{data.education}</Block>
          {data.additionalItems && data.additionalItems.length > 0 && (
            <Block title="其他加分项">
              <ul className="list-disc space-y-1 pl-5">
                {data.additionalItems.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </Block>
          )}
        </div>
      </Card>
      {assessment && (
        <FinalAssessmentView
          data={assessment}
          initialFitScore={initialFitScore}
          initialMatchScore={initialMatchScore}
        />
      )}
    </div>
  )
}
