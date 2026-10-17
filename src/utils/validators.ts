// 前端输入校验（应届生校招 / 实习求职版本）。
// 在发请求前拦截必填项缺失，给出具体中文提示。

import type { AnalyzeInitialRequest } from '../types'

export type FieldRule = { key: keyof AnalyzeInitialRequest; label: string }

const REQUIRED: FieldRule[] = [
  { key: 'targetRole', label: '目标岗位' },
  { key: 'targetIndustry', label: '目标行业' },
  { key: 'targetCompanyType', label: '目标公司类型' },
  { key: 'targetApplicationScenario', label: '投递场景' },
  { key: 'graduationStage', label: '毕业阶段' },
  { key: 'educationLevel', label: '学历' },
  { key: 'major', label: '专业' },
  { key: 'highlightAbilities', label: '希望简历突出的能力' },
  { key: 'jdText', label: '目标校招岗位 JD' },
  { key: 'resumeText', label: '原始简历' }
]

export function validateInput(input: AnalyzeInitialRequest): string | null {
  for (const { key, label } of REQUIRED) {
    const val = input[key]
    if (typeof val !== 'string' || val.trim() === '') {
      return `请先填写${label}。`
    }
  }
  if (input.jdText.trim().length < 20) {
    return '目标校招岗位 JD 内容过短，请粘贴更完整的 JD。'
  }
  if (input.resumeText.trim().length < 30) {
    return '原始简历内容过短，请粘贴更完整的简历。'
  }
  return null
}
