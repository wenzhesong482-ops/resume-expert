import { useState, type ReactNode } from 'react'
import type { AnalyzeInitialRequest, DeliverySituation, ResumeLength } from '../../types'
import Button from '../common/Button'
import TextArea from '../common/TextArea'

interface InputMaterialsProps {
  value: AnalyzeInitialRequest
  onChange: (patch: Partial<AnalyzeInitialRequest>) => void
  onAnalyze: () => void
  loading: boolean
}

const ROLES = ['AI 产品经理', '产品管培生', '运营', '数据分析师', 'AI 应用', '研发工程师', '设计师', '解决方案']
const INDUSTRIES = ['互联网', 'AI/大模型', 'ToB SaaS', '企业服务', '消费科技', '智能硬件']
const COMPANY_TYPES = ['大厂', '独角兽', '创业公司', '外企', '国企/央企', 'ToB SaaS']
const SCENARIOS = ['日常实习', '暑期实习', '秋招', '春招', '实习转正', '管培生', '校招提前批']
const GRAD_STAGES = [
  '大一/大二找实习',
  '大三找暑期实习',
  '大四秋招',
  '大四春招',
  '研一找实习',
  '研二找实习',
  '研三秋招/春招',
  '已毕业但按应届生身份求职'
]
const EDUCATION_LEVELS = ['大专', '本科', '硕士', '博士']
const LENGTHS: ResumeLength[] = ['一页', '两页', '不限制']

// 各字段示例文本：输入为空时按回车可自动填入，便于演示。
const EXAMPLES = {
  targetRole: '算法工程师',
  targetIndustry: '金融科技',
  targetCompanyType: '上市公司',
  major: '计算机科学与技术',
  highlightAbilities: 'AI 产品落地、课程项目主导、竞赛获奖',
  jdText:
    '岗位：AI 产品实习生（暑期实习）。职责：协助 AI 产品需求调研与竞品分析；参与大模型应用方案设计与 prompt 调优；输出 PRD 与原型；跟进上线与数据复盘。要求：本科及以上在读，26 届优先；熟悉 AI/大模型应用；具备数据分析基础；良好的逻辑与沟通。',
  resumeText:
    '李四，某 985 计算机本科大三。课程项目：智能问答 demo，负责需求梳理与 prompt 编写。竞赛：数模省二等奖（数据处理）。社团：校 AI 俱乐部副部长。技能：Python、SQL、Figma、英语六级。无正式实习经历。',
  internshipExperience:
    '某互联网公司 产品实习生 2025.06-2025.09：参与 AI 对话产品需求梳理，编写并迭代 prompt，构建评测集，辅助产品上线。',
  projectExperience:
    '课程智能问答 demo：梳理常见问题，编写 prompt（含 Few-shot），用 Python 调用大模型 API，配合队友完成前端页面与测试。',
  researchExperience: '跟随导师做 RAG 检索增强方向，负责数据清洗与检索效果评测。',
  competitionExperience: '全国大学生数学建模竞赛省二等奖（团队 3 人，负责数据处理与建模）',
  campusExperience: '校 AI 俱乐部副部长，组织两场技术分享，分别约 50 人、30 人参加。',
  skillsAndCertificates: 'Python, SQL, Figma, Prompt Engineering, 英语六级',
  measurableResults: '课程 demo 覆盖约 50 个测试问题，问答准确率约 80%。',
  avoidExaggeration: '课程项目是参与不是主导；没有正式实习经历，不要编造。',
  deliveryTargetRoles: '产品实习生 / 运营实习生 / 数据分析实习生',
  deliveryPlatforms: '牛客 / 实习僧 / Boss直聘 / 公司官网',
  deliveryCommonJDTypes: '大厂日常实习 / 创业公司暑期实习',
  deliveryMainProblem: '投了很多但几乎没有面试邀请'
}

// 普通芯片组（无自定义输入）
function ChipGroup({
  options,
  value,
  onPick
}: {
  options: string[]
  value: string
  onPick: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
            value === o
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

// 带「其他」自定义输入的芯片组
function ChipsWithOther({
  options,
  value,
  onPick,
  placeholder,
  example
}: {
  options: string[]
  value: string
  onPick: (v: string) => void
  placeholder?: string
  example?: string
}) {
  const [otherMode, setOtherMode] = useState(false)
  const isOther = otherMode || (value !== '' && !options.includes(value))
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => {
              setOtherMode(false)
              onPick(o)
            }}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              !isOther && value === o
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {o}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setOtherMode(true)
            onPick('')
          }}
          className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
            isOther
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          其他
        </button>
      </div>
      {isOther && (
        <input
          value={value}
          onChange={(e) => onPick(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && example && value.trim() === '') {
              e.preventDefault()
              onPick(example)
            }
          }}
          placeholder={placeholder || '请自行输入'}
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
        />
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  )
}

export default function InputMaterials({ value, onChange, onAnalyze, loading }: InputMaterialsProps) {
  const patchDelivery = (patch: Partial<DeliverySituation>) =>
    onChange({ deliverySituation: { ...value.deliverySituation, ...patch } })
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">输入材料</h2>
        <p className="mt-0.5 text-xs text-gray-400">应届生校招 / 实习求职，填写后点击「开始分析」将真实调用 AI。输入框为空时按回车可快速填入示例。</p>
      </div>

      <Field label="目标岗位">
        <ChipsWithOther
          options={ROLES}
          value={value.targetRole}
          onPick={(v) => onChange({ targetRole: v })}
          placeholder="如：算法工程师 / 商业分析师"
          example={EXAMPLES.targetRole}
        />
      </Field>

      <Field label="目标行业">
        <ChipsWithOther
          options={INDUSTRIES}
          value={value.targetIndustry}
          onPick={(v) => onChange({ targetIndustry: v })}
          placeholder="如：金融科技 / 新能源 / 跨境电商"
          example={EXAMPLES.targetIndustry}
        />
      </Field>

      <Field label="目标公司类型">
        <ChipsWithOther
          options={COMPANY_TYPES}
          value={value.targetCompanyType}
          onPick={(v) => onChange({ targetCompanyType: v })}
          placeholder="如：上市公司 / 事业单位 / 研究所"
          example={EXAMPLES.targetCompanyType}
        />
      </Field>

      <Field label="投递场景">
        <ChipGroup
          options={SCENARIOS}
          value={value.targetApplicationScenario}
          onPick={(v) => onChange({ targetApplicationScenario: v })}
        />
      </Field>

      <Field label="毕业阶段">
        <ChipGroup
          options={GRAD_STAGES}
          value={value.graduationStage}
          onPick={(v) => onChange({ graduationStage: v })}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="学历">
          <ChipGroup
            options={EDUCATION_LEVELS}
            value={value.educationLevel}
            onPick={(v) => onChange({ educationLevel: v })}
          />
        </Field>
        <Field label="专业">
          <input
            value={value.major}
            onChange={(e) => onChange({ major: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.major.trim() === '') {
                e.preventDefault()
                onChange({ major: EXAMPLES.major })
              }
            }}
            placeholder="如：计算机/产品/统计"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </Field>
      </div>

      <TextArea
        label="希望简历突出"
        value={value.highlightAbilities}
        onChange={(e) => onChange({ highlightAbilities: e.target.value })}
        placeholder="如：AI 产品落地、课程项目主导、竞赛获奖"
        example={EXAMPLES.highlightAbilities}
        rows={2}
      />

      <TextArea
        label="目标校招岗位 JD"
        value={value.jdText}
        onChange={(e) => onChange({ jdText: e.target.value })}
        placeholder="粘贴完整校招/实习 JD"
        example={EXAMPLES.jdText}
        rows={5}
      />

      <TextArea
        label="原始简历"
        value={value.resumeText}
        onChange={(e) => onChange({ resumeText: e.target.value })}
        placeholder="粘贴原始简历全文"
        example={EXAMPLES.resumeText}
        rows={6}
      />

      <details className="rounded-md border border-gray-200 bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">经历材料（可选，尽量填写以提升分析质量）</summary>
        <div className="mt-3 space-y-3">
          <TextArea
            label="实习经历"
            value={value.internshipExperience || ''}
            onChange={(e) => onChange({ internshipExperience: e.target.value })}
            placeholder="公司、岗位、时间、你做了什么、产出/结果"
            example={EXAMPLES.internshipExperience}
            rows={3}
          />
          <TextArea
            label="项目 / 课程项目经历"
            value={value.projectExperience || ''}
            onChange={(e) => onChange({ projectExperience: e.target.value })}
            example={EXAMPLES.projectExperience}
            rows={3}
          />
          <TextArea
            label="科研经历"
            value={value.researchExperience || ''}
            onChange={(e) => onChange({ researchExperience: e.target.value })}
            example={EXAMPLES.researchExperience}
            rows={2}
          />
          <TextArea
            label="竞赛经历"
            value={value.competitionExperience || ''}
            onChange={(e) => onChange({ competitionExperience: e.target.value })}
            placeholder="竞赛名称、奖项、你的角色"
            example={EXAMPLES.competitionExperience}
            rows={2}
          />
          <TextArea
            label="社团 / 校园工作经历"
            value={value.campusExperience || ''}
            onChange={(e) => onChange({ campusExperience: e.target.value })}
            example={EXAMPLES.campusExperience}
            rows={2}
          />
          <TextArea
            label="技能与证书"
            value={value.skillsAndCertificates || ''}
            onChange={(e) => onChange({ skillsAndCertificates: e.target.value })}
            placeholder="Axure/Figma/SQL/Python/英语六级/计算机等级等"
            example={EXAMPLES.skillsAndCertificates}
            rows={2}
          />
          <TextArea
            label="有数据结果的经历"
            value={value.measurableResults || ''}
            onChange={(e) => onChange({ measurableResults: e.target.value })}
            example={EXAMPLES.measurableResults}
            rows={2}
          />
          <TextArea
            label="不希望被夸大的地方"
            value={value.avoidExaggeration || ''}
            onChange={(e) => onChange({ avoidExaggeration: e.target.value })}
            example={EXAMPLES.avoidExaggeration}
            rows={2}
          />
          <Field label="简历目标长度">
            <ChipGroup
              options={LENGTHS}
              value={value.resumeLength || ''}
              onPick={(v) => onChange({ resumeLength: v as ResumeLength })}
            />
          </Field>
        </div>
      </details>

      <details className="rounded-md border border-gray-200 bg-gray-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700">投递情况（可选，用于简历无回应诊断）</summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="已投递数量">
              <input
                type="number"
                min={0}
                value={value.deliverySituation?.appliedCount ?? ''}
                onChange={(e) =>
                  patchDelivery({ appliedCount: e.target.value === '' ? undefined : Number(e.target.value) })
                }
                placeholder="如：30"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </Field>
            <Field label="收到回复数量">
              <input
                type="number"
                min={0}
                value={value.deliverySituation?.replyCount ?? ''}
                onChange={(e) =>
                  patchDelivery({ replyCount: e.target.value === '' ? undefined : Number(e.target.value) })
                }
                placeholder="如：2"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
              />
            </Field>
          </div>
          <Field label="主要投递岗位方向">
            <input
              value={value.deliverySituation?.targetRoles || ''}
              onChange={(e) => patchDelivery({ targetRoles: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (value.deliverySituation?.targetRoles || '').trim() === '') {
                  e.preventDefault()
                  patchDelivery({ targetRoles: EXAMPLES.deliveryTargetRoles })
                }
              }}
              placeholder="如：产品实习生 / 运营实习生"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </Field>
          <Field label="主要投递平台">
            <input
              value={value.deliverySituation?.platforms || ''}
              onChange={(e) => patchDelivery({ platforms: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (value.deliverySituation?.platforms || '').trim() === '') {
                  e.preventDefault()
                  patchDelivery({ platforms: EXAMPLES.deliveryPlatforms })
                }
              }}
              placeholder="如：牛客 / 实习僧 / Boss直聘"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </Field>
          <Field label="常见 JD 类型">
            <input
              value={value.deliverySituation?.commonJDTypes || ''}
              onChange={(e) => patchDelivery({ commonJDTypes: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (value.deliverySituation?.commonJDTypes || '').trim() === '') {
                  e.preventDefault()
                  patchDelivery({ commonJDTypes: EXAMPLES.deliveryCommonJDTypes })
                }
              }}
              placeholder="如：大厂日常实习 / 创业公司暑期实习"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
            />
          </Field>
          <TextArea
            label="目前最困扰的问题"
            value={value.deliverySituation?.mainProblem || ''}
            onChange={(e) => patchDelivery({ mainProblem: e.target.value })}
            placeholder="如：投了很多但几乎没有面试邀请"
            example={EXAMPLES.deliveryMainProblem}
            rows={2}
          />
        </div>
      </details>

      <Button onClick={onAnalyze} loading={loading} className="w-full">
        {loading ? '分析中…' : '开始分析'}
      </Button>
    </div>
  )
}
