// 后端输入/输出校验（应届生校招 / 实习求职版本）。
// 不做 Mock 兜底：校验失败直接返回明确错误。

import type {
  AnalyzeInitialRequest,
  AnalyzeInitialResponse,
  OptimizeResumeResponse,
  EvidenceStrength,
  FollowUpDirection,
  ResumeStyle,
  ResumeLength,
  ExperienceCategory,
  TransferableExperienceItem,
  RoleFitAssessment,
  FitLevel,
  JDRequirementLevel,
  RequirementLevel,
  JDRequirementUserStatus,
  NoReplyDiagnosis,
  NoReplyProbability,
  SkillGapPlan,
  SkillImportance,
  EstimatedDifficulty,
  SkillPriority,
  RewritePotential,
  FinalResumeAssessment,
  InterviewQuestionType,
  InterviewDifficulty,
  MockInterviewQuestion,
  MockInterviewPlan,
  MockInterviewLevel,
  EvaluateInterviewAnswerResponse
} from '../src/types/index'

export type ValidationResult = { ok: true } | { ok: false; error: string }

const EVIDENCE_STRENGTHS: EvidenceStrength[] = ['强', '中', '弱', '无']
const FOLLOW_UP_DIRECTIONS: FollowUpDirection[] = [
  '项目背景', '个人职责', '业务目标', '关键动作', '协作对象',
  '产出成果', '数据指标', '用户/客户规模', '难点与解决方案', '可证明能力'
]
const RESUME_STYLES: ResumeStyle[] = ['专业型', '数据型', '业务型', '技术型', '综合型']
const RESUME_LENGTHS: ResumeLength[] = ['一页', '两页', '不限制']
const EXPERIENCE_CATEGORIES: ExperienceCategory[] = [
  '实习经历', '课程项目', '科研经历', '竞赛经历',
  '社团经历', '校园工作', '个人作品', '技能证书', '其他'
]
const REWRITE_POTENTIALS: RewritePotential[] = ['高', '中', '低']
const FIT_LEVELS: FitLevel[] = ['强匹配', '可尝试', '勉强匹配', '不建议主投']
const REQUIREMENT_LEVELS: RequirementLevel[] = ['硬门槛', '重要加分项', '普通加分项', '可替代项']
const USER_STATUSES: JDRequirementUserStatus[] = ['已满足', '部分满足', '未满足', '无法判断']
const PROBABILITIES: NoReplyProbability[] = ['高', '中', '低']
const SKILL_IMPORTANCES: SkillImportance[] = ['必须补', '建议补', '加分项']
const DIFFICULTIES: EstimatedDifficulty[] = ['低', '中', '高']
const SKILL_PRIORITIES: SkillPriority[] = ['高', '中', '低']
const INTERVIEW_QUESTION_TYPES: InterviewQuestionType[] = ['HR面试', '业务面试', '项目深挖', '技能追问', '压力追问']
const INTERVIEW_DIFFICULTIES: InterviewDifficulty[] = ['基础', '中等', '高压']
const MOCK_INTERVIEW_LEVELS: MockInterviewLevel[] = ['优秀', '合格', '偏弱', '高风险']

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function valueToString(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (v === undefined || v === null) return undefined
  return JSON.stringify(v)
}

function splitStringList(v: string): string[] {
  const text = v.trim()
  if (!text) return []

  try {
    const parsed = JSON.parse(text) as unknown
    if (Array.isArray(parsed)) {
      return parsed.map(valueToString).filter((x): x is string => Boolean(x && x.trim()))
    }
  } catch {
    // 非 JSON 字符串按普通文本处理。
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.、）)])\s*/, '').trim())
    .filter(Boolean)

  if (lines.length > 1) return lines
  return [text]
}

function asString(v: unknown, field: string): string {
  const s = valueToString(v)
  if (s === undefined) throw new Error(`字段 ${field} 应为字符串`)
  return s
}

function asStringOrDefault(v: unknown, _field: string, fallback = '【待补充】'): string {
  const s = valueToString(v)
  return s && s.trim() ? s : fallback
}

function asStrArray(v: unknown, field: string): string[] {
  if (v === undefined || v === null) return []
  if (isStrArray(v)) return v
  if (Array.isArray(v)) {
    return v.map(valueToString).filter((x): x is string => Boolean(x && x.trim()))
  }
  if (typeof v === 'string') return splitStringList(v)
  const s = valueToString(v)
  if (s === undefined) throw new Error(`字段 ${field} 应为字符串数组`)
  return [s]
}

function asOptString(v: unknown, field: string): string | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v !== 'string') throw new Error(`字段 ${field} 应为字符串`)
  return v
}

function asEnum<T extends string>(v: unknown, field: string, allowed: T[]): T {
  if (typeof v === 'string') {
    const s = v.trim()
    if (allowed.includes(s as T)) return s as T
    const normalized = normalizeEnumValue(s, allowed)
    if (normalized) return normalized
  }
  if (typeof v === 'number' || typeof v === 'boolean') {
    const normalized = normalizeEnumValue(String(v), allowed)
    if (normalized) return normalized
  }
  {
    throw new Error(`字段 ${field} 应为 ${allowed.join(' / ')} 之一`)
  }
}

function asEnumOrDefault<T extends string>(v: unknown, field: string, allowed: T[], fallback: T): T {
  try {
    return asEnum(v, field, allowed)
  } catch {
    return fallback
  }
}

function normalizeEnumValue<T extends string>(raw: string, allowed: T[]): T | undefined {
  const s = raw.trim()
  for (const item of allowed) {
    if (s.includes(item)) return item
  }

  const has = (value: string) => allowed.includes(value as T)
  const pick = (value: string): T | undefined => (has(value) ? value as T : undefined)

  if (has('强') && has('中') && has('弱') && has('无')) {
    if (/无|没有|暂无|缺失|不足以证明/.test(s)) return pick('无')
    if (/弱|低|薄弱|不足|待补/.test(s)) return pick('弱')
    if (/中|一般|部分|普通|适中/.test(s)) return pick('中')
    if (/强|高|充分|明确|直接/.test(s)) return pick('强')
  }

  if (has('高') && has('中') && has('低')) {
    if (/高|强|优先|重要|困难|高压/.test(s)) return pick('高')
    if (/中|一般|普通|适中|中等/.test(s)) return pick('中')
    if (/低|弱|容易|基础|较低/.test(s)) return pick('低')
  }

  if (has('专业型') || has('数据型') || has('业务型') || has('技术型') || has('综合型')) {
    if (/专业/.test(s)) return pick('专业型')
    if (/数据|指标|量化/.test(s)) return pick('数据型')
    if (/业务|商业/.test(s)) return pick('业务型')
    if (/技术|工程|开发/.test(s)) return pick('技术型')
    if (/综合|复合/.test(s)) return pick('综合型')
  }

  if (has('实习经历') || has('课程项目') || has('科研经历') || has('竞赛经历')) {
    if (/实习/.test(s)) return pick('实习经历')
    if (/课程|项目/.test(s)) return pick('课程项目')
    if (/科研|论文|课题/.test(s)) return pick('科研经历')
    if (/竞赛|比赛|挑战杯/.test(s)) return pick('竞赛经历')
    if (/社团/.test(s)) return pick('社团经历')
    if (/校园|学生会|班委/.test(s)) return pick('校园工作')
    if (/作品|Demo|原型|个人/.test(s)) return pick('个人作品')
    if (/证书|技能/.test(s)) return pick('技能证书')
    return pick('其他')
  }

  if (has('强匹配') || has('可尝试') || has('勉强匹配') || has('不建议主投')) {
    if (/不建议|不匹配|不适合/.test(s)) return pick('不建议主投')
    if (/勉强|弱匹配|较弱/.test(s)) return pick('勉强匹配')
    if (/可尝试|可投|尝试|部分匹配/.test(s)) return pick('可尝试')
    if (/强|高|高度|匹配/.test(s)) return pick('强匹配')
  }

  if (has('硬门槛') || has('重要加分项') || has('普通加分项') || has('可替代项')) {
    if (/替代/.test(s)) return pick('可替代项')
    if (/硬|必须|必备|强制|门槛/.test(s)) return pick('硬门槛')
    if (/重要|优先|核心|关键/.test(s)) return pick('重要加分项')
    if (/普通|一般|加分/.test(s)) return pick('普通加分项')
  }

  if (has('已满足') || has('部分满足') || has('未满足') || has('无法判断')) {
    if (/无法|不清楚|不确定|待确认|未知/.test(s)) return pick('无法判断')
    if (/部分|不完全|较弱/.test(s)) return pick('部分满足')
    if (/未|没有|暂无|缺少|不满足/.test(s)) return pick('未满足')
    if (/已|满足|具备|有/.test(s)) return pick('已满足')
  }

  if (has('必须补') || has('建议补') || has('加分项')) {
    if (/必须|必补|硬|核心/.test(s)) return pick('必须补')
    if (/建议|需要|应补/.test(s)) return pick('建议补')
    if (/加分|锦上添花|可选/.test(s)) return pick('加分项')
  }

  if (has('HR面试') || has('业务面试') || has('项目深挖') || has('技能追问') || has('压力追问')) {
    if (/HR|人力|综合|通用/i.test(s)) return pick('HR面试')
    if (/业务|岗位|场景|产品|运营/.test(s)) return pick('业务面试')
    if (/项目|经历|深挖|复盘/.test(s)) return pick('项目深挖')
    if (/技能|技术|工具|SQL|Python|RAG|Prompt/i.test(s)) return pick('技能追问')
    if (/压力|质疑|挑战|风险/.test(s)) return pick('压力追问')
  }

  if (has('基础') || has('中等') || has('高压')) {
    if (/高|难|压力|挑战/.test(s)) return pick('高压')
    if (/中|一般|普通/.test(s)) return pick('中等')
    if (/低|基础|简单|入门/.test(s)) return pick('基础')
  }

  if (has('优秀') || has('合格') || has('偏弱') || has('高风险')) {
    if (/风险|危险/.test(s)) return pick('高风险')
    if (/弱|差|不足/.test(s)) return pick('偏弱')
    if (/合格|通过|一般/.test(s)) return pick('合格')
    if (/优秀|好|强/.test(s)) return pick('优秀')
  }

  return undefined
}

// followUpQuestions.direction 容错：模型偶尔返回近义表述（如"项目背景与目标""用户规模"），
// 按关键词归一化到枚举，避免单条偏差导致整次分析失败。
function normalizeDirection(v: unknown, field: string): FollowUpDirection {
  if (typeof v !== 'string' || v.trim() === '') {
    throw new Error(`字段 ${field} 应为非空字符串`)
  }
  const s = v.trim()
  if (FOLLOW_UP_DIRECTIONS.includes(s as FollowUpDirection)) return s as FollowUpDirection
  const map: Array<[string, FollowUpDirection]> = [
    ['项目背景', '项目背景'],
    ['个人职责', '个人职责'],
    ['职责', '个人职责'],
    ['业务目标', '业务目标'],
    ['关键动作', '关键动作'],
    ['动作', '关键动作'],
    ['协作', '协作对象'],
    ['产出', '产出成果'],
    ['成果', '产出成果'],
    ['数据指标', '数据指标'],
    ['指标', '数据指标'],
    ['数据', '数据指标'],
    ['客户', '用户/客户规模'],
    ['用户', '用户/客户规模'],
    ['规模', '用户/客户规模'],
    ['难点', '难点与解决方案'],
    ['解决', '难点与解决方案'],
    ['可证明', '可证明能力'],
    ['能力', '可证明能力'],
    ['目标', '业务目标']
  ]
  for (const [kw, dir] of map) {
    if (s.includes(kw)) return dir
  }
  return '可证明能力'
}

function asNum(v: unknown, field: string): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim() !== '') {
    const matched = v.match(/-?\d+(?:\.\d+)?/)
    if (matched) {
      const n = Number(matched[0])
      if (Number.isFinite(n)) return n
    }
  }
  throw new Error(`字段 ${field} 应为数字`)
}

function asBool(v: unknown, _field: string): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase()
    if (['true', 'yes', 'y', '1', '是', '需要', '需补充', '需确认', '有'].includes(s)) return true
    if (['false', 'no', 'n', '0', '否', '不需要', '无需', '无'].includes(s)) return false
  }
  return Boolean(v)
}

function asArray(v: unknown): unknown[] {
  if (Array.isArray(v)) return v
  if (v === undefined || v === null) return []
  return [v]
}

// ---------- 请求校验 ----------

export function validateInitialRequest(body: unknown): ValidationResult {
  if (!isObj(body)) return { ok: false, error: '请求体格式不正确。' }

  const required: Array<[keyof AnalyzeInitialRequest, string]> = [
    ['targetRole', '目标岗位'],
    ['targetIndustry', '目标行业'],
    ['targetCompanyType', '目标公司类型'],
    ['targetApplicationScenario', '投递场景'],
    ['graduationStage', '毕业阶段'],
    ['educationLevel', '学历'],
    ['major', '专业'],
    ['highlightAbilities', '希望简历突出的能力'],
    ['jdText', '目标校招岗位 JD'],
    ['resumeText', '原始简历']
  ]

  for (const [key, label] of required) {
    const val = body[key]
    if (typeof val !== 'string' || val.trim() === '') {
      return { ok: false, error: `请先填写${label}。` }
    }
  }

  if (body.resumeLength !== undefined && !RESUME_LENGTHS.includes(body.resumeLength as ResumeLength)) {
    return { ok: false, error: '简历目标长度取值不合法。' }
  }

  // 投递情况为可选项，仅做类型抽查
  if (body.deliverySituation !== undefined) {
    const ds = body.deliverySituation
    if (!isObj(ds)) return { ok: false, error: '投递情况格式不正确。' }
    if (ds.appliedCount !== undefined && typeof ds.appliedCount !== 'number' && ds.appliedCount !== '') {
      return { ok: false, error: '已投递数量应为数字。' }
    }
    if (ds.replyCount !== undefined && typeof ds.replyCount !== 'number' && ds.replyCount !== '') {
      return { ok: false, error: '收到回复数量应为数字。' }
    }
  }

  return { ok: true }
}

export function validateOptimizeRequest(body: unknown): ValidationResult {
  if (!isObj(body)) return { ok: false, error: '请求体格式不正确。' }
  if (!isObj(body.originalInput)) {
    return { ok: false, error: '缺少原始输入 originalInput。' }
  }
  const initialCheck = validateInitialRequest(body.originalInput)
  if (!initialCheck.ok) return initialCheck
  if (!isObj(body.initialAnalysis)) {
    return { ok: false, error: '缺少初始分析结果 initialAnalysis。' }
  }
  return { ok: true }
}

// ---------- 输入长度保护 ----------

const MAX_INPUT_CHARS = 20000

export function checkInputLength(req: AnalyzeInitialRequest): ValidationResult {
  const fields = [
    req.jdText, req.resumeText, req.internshipExperience, req.projectExperience,
    req.campusExperience, req.researchExperience, req.competitionExperience,
    req.skillsAndCertificates, req.measurableResults, req.avoidExaggeration,
    req.highlightAbilities
  ]
  for (const f of fields) {
    if (typeof f === 'string' && f.length > MAX_INPUT_CHARS) {
      return { ok: false, error: '请求内容过长，请缩短输入内容后重试。' }
    }
  }
  if (req.deliverySituation) {
    const dsFields = [
      req.deliverySituation.targetRoles, req.deliverySituation.platforms,
      req.deliverySituation.commonJDTypes, req.deliverySituation.mainProblem
    ]
    for (const f of dsFields) {
      if (typeof f === 'string' && f.length > MAX_INPUT_CHARS) {
        return { ok: false, error: '请求内容过长，请缩短输入内容后重试。' }
      }
    }
  }
  return { ok: true }
}

// ---------- 输出结构校验 ----------

function validateRoleFitAssessment(v: unknown): RoleFitAssessment {
  if (!isObj(v)) throw new Error('roleFitAssessment 格式不正确')
  return {
    fitLevel: asEnum(v.fitLevel, 'roleFitAssessment.fitLevel', FIT_LEVELS),
    fitScore: asNum(v.fitScore, 'roleFitAssessment.fitScore'),
    summary: asString(v.summary, 'roleFitAssessment.summary'),
    reasons: asStrArray(v.reasons, 'roleFitAssessment.reasons'),
    hardBlockers: asStrArray(v.hardBlockers, 'roleFitAssessment.hardBlockers'),
    softGaps: asStrArray(v.softGaps, 'roleFitAssessment.softGaps'),
    bestEvidence: asStrArray(v.bestEvidence, 'roleFitAssessment.bestEvidence'),
    riskWarnings: asStrArray(v.riskWarnings, 'roleFitAssessment.riskWarnings'),
    recommendedAction: asString(v.recommendedAction, 'roleFitAssessment.recommendedAction')
  }
}

function validateJDRequirementLevels(v: unknown): JDRequirementLevel[] {
  if (v === undefined || v === null) return []
  return asArray(v).map((r, i): JDRequirementLevel => {
    if (!isObj(r)) throw new Error(`jdRequirementLevels[${i}] 格式不正确`)
    return {
      requirement: asString(r.requirement, `jdRequirementLevels[${i}].requirement`),
      level: asEnum(r.level, `jdRequirementLevels[${i}].level`, REQUIREMENT_LEVELS),
      sourceText: asOptString(r.sourceText, `jdRequirementLevels[${i}].sourceText`),
      evidenceNeeded: asString(r.evidenceNeeded, `jdRequirementLevels[${i}].evidenceNeeded`),
      userStatus: asEnum(r.userStatus, `jdRequirementLevels[${i}].userStatus`, USER_STATUSES),
      currentEvidence: asString(r.currentEvidence, `jdRequirementLevels[${i}].currentEvidence`),
      howToCompensate: asString(r.howToCompensate, `jdRequirementLevels[${i}].howToCompensate`),
      resumeEmbeddingSuggestion: asString(r.resumeEmbeddingSuggestion, `jdRequirementLevels[${i}].resumeEmbeddingSuggestion`)
    }
  })
}

function validateNoReplyDiagnosis(v: unknown): NoReplyDiagnosis {
  if (!isObj(v)) throw new Error('noReplyDiagnosis 格式不正确')
  const reasons = asArray(v.likelyReasons).map((r, i) => {
    if (!isObj(r)) throw new Error(`noReplyDiagnosis.likelyReasons[${i}] 格式不正确`)
    return {
      reason: asString(r.reason, `noReplyDiagnosis.likelyReasons[${i}].reason`),
      probability: asEnum(r.probability, `noReplyDiagnosis.likelyReasons[${i}].probability`, PROBABILITIES),
      evidence: asString(r.evidence, `noReplyDiagnosis.likelyReasons[${i}].evidence`),
      fixSuggestion: asString(r.fixSuggestion, `noReplyDiagnosis.likelyReasons[${i}].fixSuggestion`)
    }
  })
  return {
    hasDeliveryContext: asBool(v.hasDeliveryContext, 'noReplyDiagnosis.hasDeliveryContext'),
    summary: asString(v.summary, 'noReplyDiagnosis.summary'),
    likelyReasons: reasons,
    topThreeFixes: asStrArray(v.topThreeFixes, 'noReplyDiagnosis.topThreeFixes'),
    nextSevenDayActionPlan: asStrArray(v.nextSevenDayActionPlan, 'noReplyDiagnosis.nextSevenDayActionPlan')
  }
}

function validateSkillGapPlan(v: unknown): SkillGapPlan {
  if (!isObj(v)) throw new Error('skillGapPlan 格式不正确')
  const skills = asArray(v.missingSkills).map((s, i) => {
    if (!isObj(s)) throw new Error(`skillGapPlan.missingSkills[${i}] 格式不正确`)
    return {
      skill: asString(s.skill, `skillGapPlan.missingSkills[${i}].skill`),
      importance: asEnum(s.importance, `skillGapPlan.missingSkills[${i}].importance`, SKILL_IMPORTANCES),
      currentEvidence: asString(s.currentEvidence, `skillGapPlan.missingSkills[${i}].currentEvidence`),
      targetLevel: asString(s.targetLevel, `skillGapPlan.missingSkills[${i}].targetLevel`),
      learningSourceTypes: asStrArray(s.learningSourceTypes, `skillGapPlan.missingSkills[${i}].learningSourceTypes`),
      practiceProject: asString(s.practiceProject, `skillGapPlan.missingSkills[${i}].practiceProject`),
      resumeEmbeddingSuggestion: asString(s.resumeEmbeddingSuggestion, `skillGapPlan.missingSkills[${i}].resumeEmbeddingSuggestion`),
      estimatedDifficulty: asEnum(s.estimatedDifficulty, `skillGapPlan.missingSkills[${i}].estimatedDifficulty`, DIFFICULTIES),
      priority: asEnum(s.priority, `skillGapPlan.missingSkills[${i}].priority`, SKILL_PRIORITIES)
    }
  })
  return {
    targetRole: asString(v.targetRole, 'skillGapPlan.targetRole'),
    summary: asString(v.summary, 'skillGapPlan.summary'),
    missingSkills: skills,
    sevenDayPlan: asStrArray(v.sevenDayPlan, 'skillGapPlan.sevenDayPlan'),
    thirtyDayPlan: asStrArray(v.thirtyDayPlan, 'skillGapPlan.thirtyDayPlan')
  }
}

function validateFinalResumeAssessment(v: unknown): FinalResumeAssessment {
  if (!isObj(v)) throw new Error('finalAssessment 格式不正确')
  return {
    roleFitAssessment: validateRoleFitAssessment(v.roleFitAssessment),
    matchScore: asNum(v.matchScore, 'finalAssessment.matchScore'),
    scoreReasons: asStrArray(v.scoreReasons, 'finalAssessment.scoreReasons'),
    scoreChangeSummary: asString(v.scoreChangeSummary, 'finalAssessment.scoreChangeSummary')
  }
}

export function validateInitialResponse(data: unknown): AnalyzeInitialResponse {
  if (!isObj(data)) throw new Error('AI 返回不是合法对象。')
  try {
    const jd = isObj(data.jdAnalysis) ? data.jdAnalysis : undefined
    const rd = isObj(data.resumeDiagnosis) ? data.resumeDiagnosis : undefined
    const dims = rd && isObj(rd.dimensions) ? rd.dimensions : undefined
    if (!jd || !rd || !dims) throw new Error('缺少 jdAnalysis / resumeDiagnosis')

    const experienceTransferability = asArray(data.experienceTransferability).map((it, i): TransferableExperienceItem => {
      if (!isObj(it)) throw new Error(`experienceTransferability[${i}] 格式不正确`)
      return {
        category: asEnum(it.category, `experienceTransferability[${i}].category`, EXPERIENCE_CATEGORIES),
        description: asString(it.description, `experienceTransferability[${i}].description`),
        transferableAbilities: asStrArray(it.transferableAbilities, `experienceTransferability[${i}].transferableAbilities`),
        suitableRolesOrScenarios: asStrArray(it.suitableRolesOrScenarios, `experienceTransferability[${i}].suitableRolesOrScenarios`),
        resumePlacement: asString(it.resumePlacement, `experienceTransferability[${i}].resumePlacement`),
        evidenceStrength: asEnum(it.evidenceStrength, `experienceTransferability[${i}].evidenceStrength`, EVIDENCE_STRENGTHS),
        rewritePotential: asEnum(it.rewritePotential, `experienceTransferability[${i}].rewritePotential`, REWRITE_POTENTIALS),
        missingDetails: asStrArray(it.missingDetails, `experienceTransferability[${i}].missingDetails`),
        interviewRisks: asStrArray(it.interviewRisks, `experienceTransferability[${i}].interviewRisks`),
        suggestedRewriteDirection: asString(it.suggestedRewriteDirection, `experienceTransferability[${i}].suggestedRewriteDirection`)
      }
    })

    return {
      jdAnalysis: {
        coreResponsibilities: asStrArray(jd.coreResponsibilities, 'jdAnalysis.coreResponsibilities'),
        hardRequirements: asStrArray(jd.hardRequirements, 'jdAnalysis.hardRequirements'),
        hiddenRequirements: asStrArray(jd.hiddenRequirements, 'jdAnalysis.hiddenRequirements'),
        keywords: asStrArray(jd.keywords, 'jdAnalysis.keywords'),
        idealCandidate: asString(jd.idealCandidate, 'jdAnalysis.idealCandidate'),
        topFiveAbilities: asStrArray(jd.topFiveAbilities, 'jdAnalysis.topFiveAbilities')
      },
      resumeDiagnosis: {
        matchScore: asNum(rd.matchScore, 'resumeDiagnosis.matchScore'),
        scoreReasons: asStrArray(rd.scoreReasons, 'resumeDiagnosis.scoreReasons'),
        dimensions: {
          educationMatch: asString(dims.educationMatch, 'dimensions.educationMatch'),
          majorRelevance: asString(dims.majorRelevance, 'dimensions.majorRelevance'),
          internshipQuality: asString(dims.internshipQuality, 'dimensions.internshipQuality'),
          projectQuality: asString(dims.projectQuality, 'dimensions.projectQuality'),
          transferableExperience: asString(dims.transferableExperience, 'dimensions.transferableExperience'),
          skillsMatch: asString(dims.skillsMatch, 'dimensions.skillsMatch'),
          resultsQuantification: asString(dims.resultsQuantification, 'dimensions.resultsQuantification'),
          keywordCoverage: asString(dims.keywordCoverage, 'dimensions.keywordCoverage'),
          differentiation: asString(dims.differentiation, 'dimensions.differentiation'),
          credibilityRisk: asString(dims.credibilityRisk, 'dimensions.credibilityRisk'),
          priorityFixes: asString(dims.priorityFixes, 'dimensions.priorityFixes')
        },
        strengths: asStrArray(rd.strengths, 'resumeDiagnosis.strengths'),
        problems: asStrArray(rd.problems, 'resumeDiagnosis.problems'),
        priorityFixes: asStrArray(rd.priorityFixes, 'resumeDiagnosis.priorityFixes')
      },
      matchTable: asArray(data.matchTable).map((m, i) => {
        if (!isObj(m)) throw new Error(`matchTable[${i}] 格式不正确`)
        return {
          jdRequirement: asString(m.jdRequirement, `matchTable[${i}].jdRequirement`),
          resumeEvidence: asString(m.resumeEvidence, `matchTable[${i}].resumeEvidence`),
          evidenceStrength: asEnum(m.evidenceStrength, `matchTable[${i}].evidenceStrength`, EVIDENCE_STRENGTHS),
          needSupplement: asBool(m.needSupplement, `matchTable[${i}].needSupplement`),
          optimizationSuggestion: asString(m.optimizationSuggestion, `matchTable[${i}].optimizationSuggestion`)
        }
      }),
      followUpQuestions: asArray(data.followUpQuestions).map((q, i) => {
        if (!isObj(q)) throw new Error(`followUpQuestions[${i}] 格式不正确`)
        return {
          question: asString(q.question, `followUpQuestions[${i}].question`),
          reason: asString(q.reason, `followUpQuestions[${i}].reason`),
          direction: normalizeDirection(q.direction, `followUpQuestions[${i}].direction`)
        }
      }),
      resumeStrategy: (() => {
        const s = isObj(data.resumeStrategy) ? data.resumeStrategy : undefined
        if (!s) throw new Error('缺少 resumeStrategy')
        return {
          positioning: asString(s.positioning, 'resumeStrategy.positioning'),
          experiencesToMoveForward: asStrArray(s.experiencesToMoveForward, 'resumeStrategy.experiencesToMoveForward'),
          contentToWeakenOrDelete: asStrArray(s.contentToWeakenOrDelete, 'resumeStrategy.contentToWeakenOrDelete'),
          keywordsToEmbed: asStrArray(s.keywordsToEmbed, 'resumeStrategy.keywordsToEmbed'),
          representativeProjects: asStrArray(s.representativeProjects, 'resumeStrategy.representativeProjects'),
          resumeStyle: asEnum(s.resumeStyle, 'resumeStrategy.resumeStyle', RESUME_STYLES)
        }
      })(),
      experienceTransferability,
      roleFitAssessment: validateRoleFitAssessment(data.roleFitAssessment),
      jdRequirementLevels: validateJDRequirementLevels(data.jdRequirementLevels),
      noReplyDiagnosis: validateNoReplyDiagnosis(data.noReplyDiagnosis),
      skillGapPlan: validateSkillGapPlan(data.skillGapPlan)
    }
  } catch (e) {
    throw new Error(e instanceof Error ? `AI 返回结构不符合要求：${e.message}` : 'AI 返回结构不符合要求。')
  }
}

export function validateOptimizeResponse(data: unknown): OptimizeResumeResponse {
  if (!isObj(data)) throw new Error('AI 返回不是合法对象。')
  try {
    const fr = isObj(data.finalResume) ? data.finalResume : undefined
    const fs = isObj(data.furtherSuggestions) ? data.furtherSuggestions : undefined
    if (!fr || !fs) throw new Error('缺少 finalResume / furtherSuggestions')

    return {
      rewriteComparison: asArray(data.rewriteComparison).map((r, i) => {
        if (!isObj(r)) throw new Error(`rewriteComparison[${i}] 格式不正确`)
        return {
          before: asStringOrDefault(r.before, `rewriteComparison[${i}].before`),
          after: asStringOrDefault(r.after, `rewriteComparison[${i}].after`),
          reason: asStringOrDefault(r.reason, `rewriteComparison[${i}].reason`),
          needsConfirmation: r.needsConfirmation === undefined
            ? undefined
            : asBool(r.needsConfirmation, `rewriteComparison[${i}].needsConfirmation`)
        }
      }),
      finalResume: {
        personalInfo: typeof fr.personalInfo === 'string' ? fr.personalInfo : undefined,
        jobIntention: asStringOrDefault(fr.jobIntention, 'finalResume.jobIntention'),
        professionalSummary: asStringOrDefault(fr.professionalSummary, 'finalResume.professionalSummary'),
        coreAbilities: asStrArray(fr.coreAbilities, 'finalResume.coreAbilities'),
        workExperience: asStrArray(fr.workExperience, 'finalResume.workExperience'),
        projectExperience: asStrArray(fr.projectExperience, 'finalResume.projectExperience'),
        skillsAndTools: asStrArray(fr.skillsAndTools, 'finalResume.skillsAndTools'),
        education: asStringOrDefault(fr.education, 'finalResume.education'),
        additionalItems: fr.additionalItems === undefined
          ? undefined
          : asStrArray(fr.additionalItems, 'finalResume.additionalItems')
      },
      finalAssessment: validateFinalResumeAssessment(data.finalAssessment),
      interviewRisks: asArray(data.interviewRisks).map((r, i) => {
        if (!isObj(r)) throw new Error(`interviewRisks[${i}] 格式不正确`)
        return {
          question: asStringOrDefault(r.question, `interviewRisks[${i}].question`),
          riskReason: asStringOrDefault(r.riskReason, `interviewRisks[${i}].riskReason`),
          evidenceNeeded: asStringOrDefault(r.evidenceNeeded, `interviewRisks[${i}].evidenceNeeded`),
          suggestedAnswer: asStringOrDefault(r.suggestedAnswer, `interviewRisks[${i}].suggestedAnswer`)
        }
      }),
      furtherSuggestions: {
        projectsToAdd: asStrArray(fs.projectsToAdd, 'furtherSuggestions.projectsToAdd'),
        portfolioNeeded: asBool(fs.portfolioNeeded, 'furtherSuggestions.portfolioNeeded'),
        portfolioContent: asStrArray(fs.portfolioContent, 'furtherSuggestions.portfolioContent'),
        resumeVersions: asStrArray(fs.resumeVersions, 'furtherSuggestions.resumeVersions'),
        roleSpecificVersionsNeeded: asBool(fs.roleSpecificVersionsNeeded, 'furtherSuggestions.roleSpecificVersionsNeeded')
      },
      mockInterviewPlan: data.mockInterviewPlan === undefined ? undefined : validateMockInterviewPlan(data.mockInterviewPlan)
    }
  } catch (e) {
    throw new Error(e instanceof Error ? `AI 返回结构不符合要求：${e.message}` : 'AI 返回结构不符合要求。')
  }
}

// ---------- 模拟面试校验 ----------

function validateMockInterviewQuestion(v: unknown, prefix: string): MockInterviewQuestion {
  if (!isObj(v)) throw new Error(`${prefix} 格式不正确`)
  const indexMatch = prefix.match(/\[(\d+)\]/)
  const fallbackId = indexMatch ? `q${Number(indexMatch[1]) + 1}` : 'q1'
  return {
    id: asStringOrDefault(v.id, `${prefix}.id`, fallbackId),
    type: asEnumOrDefault(v.type, `${prefix}.type`, INTERVIEW_QUESTION_TYPES, '业务面试'),
    difficulty: asEnumOrDefault(v.difficulty, `${prefix}.difficulty`, INTERVIEW_DIFFICULTIES, '中等'),
    question: asStringOrDefault(v.question, `${prefix}.question`),
    relatedResumeEvidence: asStringOrDefault(v.relatedResumeEvidence, `${prefix}.relatedResumeEvidence`),
    relatedJDRequirement: asStringOrDefault(v.relatedJDRequirement, `${prefix}.relatedJDRequirement`),
    whyAsked: asStringOrDefault(v.whyAsked, `${prefix}.whyAsked`),
    evaluationFocus: asStrArray(v.evaluationFocus, `${prefix}.evaluationFocus`),
    answerFramework: asStringOrDefault(v.answerFramework, `${prefix}.answerFramework`),
    riskWarning: asStringOrDefault(v.riskWarning, `${prefix}.riskWarning`)
  }
}

function validateMockInterviewPlan(v: unknown): MockInterviewPlan {
  if (!isObj(v)) throw new Error('mockInterviewPlan 格式不正确')
  return {
    interviewPositioning: asStringOrDefault(v.interviewPositioning, 'mockInterviewPlan.interviewPositioning'),
    questions: asArray(v.questions).map((q, i) =>
      validateMockInterviewQuestion(q, `mockInterviewPlan.questions[${i}]`)
    ),
    priorityQuestions: asStrArray(v.priorityQuestions, 'mockInterviewPlan.priorityQuestions'),
    preparationAdvice: asStrArray(v.preparationAdvice, 'mockInterviewPlan.preparationAdvice')
  }
}

export function validateEvaluateInterviewAnswerRequest(body: unknown): ValidationResult {
  if (!isObj(body)) return { ok: false, error: '请求体格式不正确。' }

  // 必要上下文：原始输入、初始分析
  if (!isObj(body.originalInput)) return { ok: false, error: '请先完成简历分析和深度优化后再进行模拟面试。' }
  const inputCheck = validateInitialRequest(body.originalInput)
  if (!inputCheck.ok) return { ok: false, error: '请先完成简历分析和深度优化后再进行模拟面试。' }
  if (!isObj(body.initialAnalysis)) return { ok: false, error: '请先完成简历分析和深度优化后再进行模拟面试。' }

  // 必须选择一道题
  if (!isObj(body.question)) return { ok: false, error: '请先选择一道模拟面试题。' }
  try {
    validateMockInterviewQuestion(body.question, 'question')
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : '面试题格式不正确。' }
  }

  // 必须填写回答
  if (typeof body.userAnswer !== 'string' || body.userAnswer.trim() === '') {
    return { ok: false, error: '请先输入你的面试回答。' }
  }

  return { ok: true }
}

export function validateEvaluateInterviewAnswerResponse(data: unknown): EvaluateInterviewAnswerResponse {
  if (!isObj(data)) throw new Error('AI 返回不是合法对象。')
  try {
    const ir = isObj(data.interviewReport) ? data.interviewReport : undefined
    if (!ir) throw new Error('缺少 interviewReport')

    const report = {
      overallScore: asNum(ir.overallScore, 'interviewReport.overallScore'),
      overallLevel: asEnum(ir.overallLevel, 'interviewReport.overallLevel', MOCK_INTERVIEW_LEVELS),
      summary: asString(ir.summary, 'interviewReport.summary'),
      jobFitPerformance: asString(ir.jobFitPerformance, 'interviewReport.jobFitPerformance'),
      answerStructurePerformance: asString(ir.answerStructurePerformance, 'interviewReport.answerStructurePerformance'),
      evidenceQualityPerformance: asString(ir.evidenceQualityPerformance, 'interviewReport.evidenceQualityPerformance'),
      credibilityPerformance: asString(ir.credibilityPerformance, 'interviewReport.credibilityPerformance'),
      keyStrengths: asStrArray(ir.keyStrengths, 'interviewReport.keyStrengths'),
      majorWeaknesses: asStrArray(ir.majorWeaknesses, 'interviewReport.majorWeaknesses'),
      highRiskPoints: asStrArray(ir.highRiskPoints, 'interviewReport.highRiskPoints'),
      priorityImprovements: asStrArray(ir.priorityImprovements, 'interviewReport.priorityImprovements'),
      nextPracticePlan: asStrArray(ir.nextPracticePlan, 'interviewReport.nextPracticePlan')
    }

    return {
      score: asNum(data.score, 'score'),
      level: asEnum(data.level, 'level', MOCK_INTERVIEW_LEVELS),
      strengths: asStrArray(data.strengths, 'strengths'),
      problems: asStrArray(data.problems, 'problems'),
      missingEvidence: asStrArray(data.missingEvidence, 'missingEvidence'),
      credibilityRisks: asStrArray(data.credibilityRisks, 'credibilityRisks'),
      structureAdvice: asStrArray(data.structureAdvice, 'structureAdvice'),
      improvedAnswer: asString(data.improvedAnswer, 'improvedAnswer'),
      followUpQuestions: asStrArray(data.followUpQuestions, 'followUpQuestions'),
      nextPracticeSuggestion: asString(data.nextPracticeSuggestion, 'nextPracticeSuggestion'),
      interviewReport: report
    }
  } catch (e) {
    throw new Error(e instanceof Error ? `AI 返回结构不符合要求：${e.message}` : 'AI 返回结构不符合要求。')
  }
}
