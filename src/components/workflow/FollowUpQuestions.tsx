import type { FollowUpQuestion } from '../../types'
import Card from '../common/Card'
import Badge from '../common/Badge'
import TextArea from '../common/TextArea'

interface FollowUpQuestionsProps {
  data: FollowUpQuestion[]
  answers: string
  onAnswersChange: (v: string) => void
  onOptimize: () => void
  loading: boolean
}

export default function FollowUpQuestions({
  data,
  answers,
  onAnswersChange,
  onOptimize,
  loading
}: FollowUpQuestionsProps) {
  return (
    <div className="space-y-4">
      <Card title="经历补充追问清单" description="围绕实习、课程项目、科研、竞赛、社团等经历补充证据；未回答的部分将以保守方式优化并标注【需要补充】">
        <div className="space-y-3">
          {data.map((q, i) => (
            <div key={i} className="rounded-md border border-gray-100 bg-gray-50 p-3">
              <div className="mb-1 flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {i + 1}. {q.question}
                </p>
                <Badge tone="blue">{q.direction}</Badge>
              </div>
              <p className="text-xs text-gray-500">追问原因：{q.reason}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="补充回答">
        <TextArea
          value={answers}
          onChange={(e) => onAnswersChange(e.target.value)}
          placeholder={'可按追问序号逐一作答，例如：\n1. 该项目面向中小企业销售团队…\n2. 我负责需求梳理与原型设计…'}
          rows={8}
          hint="未回答也没关系，AI 会基于现有信息做保守优化，并对不确定内容标注【需要补充】。"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={onOptimize}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? '优化中…' : '开始深度优化'}
          </button>
        </div>
      </Card>
    </div>
  )
}
