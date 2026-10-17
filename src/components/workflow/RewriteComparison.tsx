import type { RewriteComparisonItem } from '../../types'
import Card from '../common/Card'
import Badge from '../common/Badge'
import DataTable from '../common/DataTable'

export default function RewriteComparison({ data }: { data: RewriteComparisonItem[] }) {
  return (
    <Card title="逐段优化对照表" description="采用「动作 + 对象 + 方法 + 结果」结构，未确认内容标注【待确认】">
      <DataTable
        headers={['修改前', '修改后', '修改理由', '需确认']}
        rows={data.map((r) => [
          <span className="whitespace-pre-wrap text-gray-500 line-through decoration-gray-300">{r.before}</span>,
          <span className="whitespace-pre-wrap text-gray-900">{r.after}</span>,
          <span className="text-gray-600">{r.reason}</span>,
          r.needsConfirmation ? <Badge tone="amber">待确认</Badge> : <span className="text-gray-400">—</span>
        ])}
        empty="暂无对照数据"
      />
    </Card>
  )
}
