import type { MatchItem } from '../../types'
import Card from '../common/Card'
import Badge, { strengthTone } from '../common/Badge'
import DataTable from '../common/DataTable'

export default function MatchAnalysis({ data }: { data: MatchItem[] }) {
  return (
    <Card title="JD 要求 - 经历证据 匹配表" description="证据强度仅基于简历/经历已有内容，不编造经历">
      <DataTable
        headers={['JD 要求', '简历中已有证据', '证据强度', '需补充', '优化建议']}
        rows={data.map((m) => [
          m.jdRequirement,
          m.resumeEvidence,
          <Badge tone={strengthTone(m.evidenceStrength)}>{m.evidenceStrength}</Badge>,
          m.needSupplement ? <Badge tone="amber">是</Badge> : <span className="text-gray-400">否</span>,
          m.optimizationSuggestion
        ])}
        empty="暂无匹配数据"
      />
    </Card>
  )
}
