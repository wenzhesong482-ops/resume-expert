import { useState } from 'react'
import type {
  AnalyzeInitialRequest,
  AnalyzeInitialResponse,
  OptimizeResumeResponse,
  MockInterviewPlan,
  MockInterviewQuestion,
  InterviewQuestionType,
  InterviewDifficulty,
  EvaluateInterviewAnswerResponse,
  MockInterviewLevel
} from '../../types'
import { evaluateInterviewAnswer } from '../../services/api'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import TextArea from '../common/TextArea'
import LoadingState from '../common/LoadingState'

const TYPE_ORDER: InterviewQuestionType[] = ['HR面试', '业务面试', '项目深挖', '技能追问', '压力追问']

function difficultyTone(d: InterviewDifficulty) {
  if (d === '高压') return 'red'
  if (d === '中等') return 'amber'
  return 'gray'
}

function levelTone(l: MockInterviewLevel) {
  if (l === '优秀') return 'green'
  if (l === '合格') return 'blue'
  if (l === '偏弱') return 'amber'
  return 'red'
}

const toneText: Record<'gray' | 'green' | 'red' | 'amber' | 'blue', string> = {
  gray: 'text-gray-700',
  green: 'text-green-700',
  red: 'text-red-700',
  amber: 'text-amber-700',
  blue: 'text-blue-700'
}

function Section({ title, items, tone = 'gray', emptyText = '暂无' }: { title: string; items: string[]; tone?: 'gray' | 'green' | 'red' | 'amber' | 'blue'; emptyText?: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-gray-500">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className={`list-disc space-y-1 pl-5 text-sm ${toneText[tone]}`}>
          {items.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      )}
    </div>
  )
}

// 单题的点评 + 最终面试报告（内联展示）
function EvaluationView({ ev }: { ev: EvaluateInterviewAnswerResponse }) {
  const rep = ev.interviewReport
  return (
    <div className="mt-3 space-y-3 rounded-md border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge tone={levelTone(ev.level)}>{ev.level}</Badge>
          <span className="text-xs text-gray-500">本次回答评分</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{ev.score} / 100</span>
      </div>

      <Section title="回答优点" items={ev.strengths} tone="green" />
      <Section title="主要问题" items={ev.problems} tone="red" />
      <Section title="缺失证据" items={ev.missingEvidence} tone="amber" />
      <Section title="可信度风险" items={ev.credibilityRisks} tone="red" />
      <Section title="结构建议" items={ev.structureAdvice} tone="blue" />

      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">改进版回答（基于用户回答和已有材料，未编造）</p>
        <div className="whitespace-pre-wrap rounded bg-white p-2 text-sm text-gray-700">{ev.improvedAnswer}</div>
      </div>

      <Section title="后续可能追问" items={ev.followUpQuestions} tone="gray" />
      <div>
        <p className="mb-1 text-xs font-medium text-gray-500">下一步练习建议</p>
        <p className="text-sm text-gray-700">{ev.nextPracticeSuggestion}</p>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <p className="mb-2 text-xs font-semibold text-gray-500">最终面试报告</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone={levelTone(rep.overallLevel)}>{rep.overallLevel}</Badge>
            <span className="text-xs text-gray-500">整体评分</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{rep.overallScore} / 100</span>
        </div>
        <p className="mt-2 text-sm text-gray-700">{rep.summary}</p>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-gray-400">岗位匹配：</span><span className="text-gray-700">{rep.jobFitPerformance}</span></div>
          <div><span className="text-gray-400">回答结构：</span><span className="text-gray-700">{rep.answerStructurePerformance}</span></div>
          <div><span className="text-gray-400">证据质量：</span><span className="text-gray-700">{rep.evidenceQualityPerformance}</span></div>
          <div><span className="text-gray-400">可信度：</span><span className="text-gray-700">{rep.credibilityPerformance}</span></div>
        </div>
        <div className="mt-2 space-y-2">
          <Section title="核心优势" items={rep.keyStrengths} tone="green" />
          <Section title="主要短板" items={rep.majorWeaknesses} tone="amber" />
          <Section title="高风险点（易被继续追问）" items={rep.highRiskPoints} tone="red" />
          <Section title="优先改进项" items={rep.priorityImprovements} tone="blue" />
          <Section title="下一步练习计划" items={rep.nextPracticePlan} tone="gray" />
        </div>
      </div>
    </div>
  )
}

interface MockInterviewProps {
  plan: MockInterviewPlan | undefined
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  optimizedResult: OptimizeResumeResponse | undefined
  answers: Record<string, string>
  onAnswerChange: (id: string, text: string) => void
  evaluations: Record<string, EvaluateInterviewAnswerResponse>
  onEvaluated: (id: string, result: EvaluateInterviewAnswerResponse) => void
  onExport: () => void
  costChainId?: string
}

export default function MockInterview({
  plan,
  originalInput,
  initialAnalysis,
  optimizedResult,
  answers,
  onAnswerChange,
  evaluations,
  onEvaluated,
  onExport,
  costChainId
}: MockInterviewProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 空状态：未完成深度优化或后端未返回题库
  if (!plan || plan.questions.length === 0) {
    return (
      <Card title="模拟面试（文本版）">
        <p className="py-6 text-center text-sm text-gray-400">请先完成简历深度优化，再生成模拟面试题。</p>
      </Card>
    )
  }

  const grouped = TYPE_ORDER.map((t) => ({
    type: t,
    items: plan.questions.filter((q) => q.type === t)
  })).filter((g) => g.items.length > 0)

  async function handleSubmit(q: MockInterviewQuestion) {
    const ans = answers[q.id] || ''
    if (!ans.trim()) {
      setErrors((p) => ({ ...p, [q.id]: '请先输入你的面试回答。' }))
      return
    }
    setLoadingId(q.id)
    setErrors((p) => { const n = { ...p }; delete n[q.id]; return n })
    try {
      const result = await evaluateInterviewAnswer(
        {
          originalInput,
          initialAnalysis,
          optimizedResult,
          question: q,
          userAnswer: ans
        },
        costChainId
      )
      onEvaluated(q.id, result.data)
    } catch (e) {
      setErrors((p) => ({ ...p, [q.id]: e instanceof Error ? e.message : 'AI 返回格式不符合要求，请重试。' }))
    } finally {
      setLoadingId(null)
    }
  }

  const evaluatedCount = Object.keys(evaluations).length

  return (
    <div className="space-y-4">
      <Card title="模拟面试题库（文本版）" description="每道题下方均可直接作答，支持多题并答与对比查看点评">
        <p className="mb-3 text-xs text-gray-500">{plan.interviewPositioning}</p>
        {plan.priorityQuestions.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-gray-500">建议优先练习</p>
            <div className="flex flex-wrap gap-1.5">
              {plan.priorityQuestions.map((p, i) => <Badge key={i} tone="amber">{p}</Badge>)}
            </div>
          </div>
        )}
        {plan.preparationAdvice.length > 0 && (
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium text-gray-500">备考建议</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
              {plan.preparationAdvice.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">回答仅保存在当前页面，不存储到数据库。已点评 {evaluatedCount} 题。</span>
          <Button variant="secondary" onClick={onExport}>导出 Markdown（含模拟面试）</Button>
        </div>
      </Card>

      {loadingId && <LoadingState message="正在调用 AI 点评你的回答…" />}

      <div className="space-y-4">
        {grouped.map((g) => (
          <div key={g.type}>
            <p className="mb-2 text-xs font-semibold text-gray-500">{g.type}</p>
            <div className="space-y-3">
              {g.items.map((q) => {
                const ev = evaluations[q.id]
                const loading = loadingId === q.id
                return (
                  <Card key={q.id}>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <Badge tone="blue">{q.type}</Badge>
                      <Badge tone={difficultyTone(q.difficulty)}>{q.difficulty}</Badge>
                      <span className="text-xs text-gray-400">{q.id}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    <p className="mt-1 text-xs text-gray-500">为什么会问：{q.whyAsked}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {q.evaluationFocus.map((f, i) => <Badge key={i} tone="gray">{f}</Badge>)}
                    </div>
                    <div className="mt-1.5 text-xs text-gray-500">
                      <div>相关 JD 要求：{q.relatedJDRequirement}</div>
                      <div>相关简历证据：{q.relatedResumeEvidence}</div>
                    </div>
                    <p className="mt-1 text-xs text-amber-700">回答风险：{q.riskWarning}</p>

                    <div className="mt-3">
                      <TextArea
                        label="你的回答"
                        value={answers[q.id] || ''}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        placeholder={`建议框架：${q.answerFramework}`}
                        rows={4}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">建议框架：{q.answerFramework}</span>
                        <Button onClick={() => handleSubmit(q)} loading={loading} disabled={loadingId !== null}>
                          {ev ? '重新点评' : '提交回答点评'}
                        </Button>
                      </div>
                      {errors[q.id] && (
                        <p className="mt-2 rounded bg-red-50 px-3 py-2 text-xs text-red-700">{errors[q.id]}</p>
                      )}
                    </div>

                    {ev && <EvaluationView ev={ev} />}
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
