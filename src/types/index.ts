// 前后端共用的数据类型（应届生校招 / 实习求职版本）。
// 字段命名必须稳定，前端展示字段与后端返回字段保持一致。

// ---------- 请求类型 ----------

export type ResumeLength = '一页' | '两页' | '不限制'

// 投递情况（可选，用于简历无回应诊断）
export type DeliverySituation = {
  appliedCount?: number
  replyCount?: number
  targetRoles?: string
  platforms?: string
  commonJDTypes?: string
  mainProblem?: string
}

export type AnalyzeInitialRequest = {
  // 目标岗位（保留）
  targetRole: string
  targetIndustry: string
  targetCompanyType: string
  // 应届生场景字段
  targetApplicationScenario: string
  graduationStage: string
  educationLevel: string
  major: string
  highlightAbilities: string
  jdText: string
  resumeText: string
  // 经历材料（可选）
  internshipExperience?: string
  projectExperience?: string
  campusExperience?: string
  researchExperience?: string
  competitionExperience?: string
  skillsAndCertificates?: string
  measurableResults?: string
  avoidExaggeration?: string
  resumeLength?: ResumeLength
  // 投递情况（可选）
  deliverySituation?: DeliverySituation
}

// ---------- 核心数据类型 ----------

export type JDAnalysis = {
  coreResponsibilities: string[]
  hardRequirements: string[]
  hiddenRequirements: string[]
  keywords: string[]
  idealCandidate: string
  topFiveAbilities: string[]
}

// 应届生简历诊断维度（11 项，校招场景）
export type ResumeDiagnosisDimensions = {
  educationMatch: string
  majorRelevance: string
  internshipQuality: string
  projectQuality: string
  transferableExperience: string
  skillsMatch: string
  resultsQuantification: string
  keywordCoverage: string
  differentiation: string
  credibilityRisk: string
  priorityFixes: string
}

export type ResumeDiagnosis = {
  matchScore: number
  scoreReasons: string[]
  dimensions: ResumeDiagnosisDimensions
  strengths: string[]
  problems: string[]
  priorityFixes: string[]
}

export type EvidenceStrength = '强' | '中' | '弱' | '无'

export type MatchItem = {
  jdRequirement: string
  resumeEvidence: string
  evidenceStrength: EvidenceStrength
  needSupplement: boolean
  optimizationSuggestion: string
}

export type FollowUpDirection =
  | '项目背景'
  | '个人职责'
  | '业务目标'
  | '关键动作'
  | '协作对象'
  | '产出成果'
  | '数据指标'
  | '用户/客户规模'
  | '难点与解决方案'
  | '可证明能力'

export type FollowUpQuestion = {
  question: string
  reason: string
  direction: FollowUpDirection
}

export type ResumeStyle = '专业型' | '数据型' | '业务型' | '技术型' | '综合型'

export type ResumeStrategy = {
  positioning: string
  experiencesToMoveForward: string[]
  contentToWeakenOrDelete: string[]
  keywordsToEmbed: string[]
  representativeProjects: string[]
  resumeStyle: ResumeStyle
}

// 经历可转化分析（应届生场景：把各类经历转化为岗位能力证据）
export type ExperienceCategory =
  | '实习经历'
  | '课程项目'
  | '科研经历'
  | '竞赛经历'
  | '社团经历'
  | '校园工作'
  | '个人作品'
  | '技能证书'
  | '其他'

export type RewritePotential = '高' | '中' | '低'

export type TransferableExperienceItem = {
  category: ExperienceCategory
  description: string
  transferableAbilities: string[]
  suitableRolesOrScenarios: string[]
  resumePlacement: string
  evidenceStrength: EvidenceStrength
  rewritePotential: RewritePotential
  missingDetails: string[]
  interviewRisks: string[]
  suggestedRewriteDirection: string
}

// 岗位适配度判断
export type FitLevel = '强匹配' | '可尝试' | '勉强匹配' | '不建议主投'

export type RoleFitAssessment = {
  fitLevel: FitLevel
  fitScore: number
  summary: string
  reasons: string[]
  hardBlockers: string[]
  softGaps: string[]
  bestEvidence: string[]
  riskWarnings: string[]
  recommendedAction: string
}

// JD 硬门槛 / 软门槛识别
export type RequirementLevel = '硬门槛' | '重要加分项' | '普通加分项' | '可替代项'

export type JDRequirementUserStatus = '已满足' | '部分满足' | '未满足' | '无法判断'

export type JDRequirementLevel = {
  requirement: string
  level: RequirementLevel
  sourceText?: string
  evidenceNeeded: string
  userStatus: JDRequirementUserStatus
  currentEvidence: string
  howToCompensate: string
  resumeEmbeddingSuggestion: string
}

// 简历无回应诊断
export type NoReplyProbability = '高' | '中' | '低'

export type NoReplyLikelyReason = {
  reason: string
  probability: NoReplyProbability
  evidence: string
  fixSuggestion: string
}

export type NoReplyDiagnosis = {
  hasDeliveryContext: boolean
  summary: string
  likelyReasons: NoReplyLikelyReason[]
  topThreeFixes: string[]
  nextSevenDayActionPlan: string[]
}

// 技能缺口与补强路径
export type SkillImportance = '必须补' | '建议补' | '加分项'

export type EstimatedDifficulty = '低' | '中' | '高'

export type SkillPriority = '高' | '中' | '低'

export type SkillGapItem = {
  skill: string
  importance: SkillImportance
  currentEvidence: string
  targetLevel: string
  learningSourceTypes: string[]
  practiceProject: string
  resumeEmbeddingSuggestion: string
  estimatedDifficulty: EstimatedDifficulty
  priority: SkillPriority
}

export type SkillGapPlan = {
  targetRole: string
  summary: string
  missingSkills: SkillGapItem[]
  sevenDayPlan: string[]
  thirtyDayPlan: string[]
}

export type RewriteComparisonItem = {
  before: string
  after: string
  reason: string
  needsConfirmation?: boolean
}

export type FinalResume = {
  personalInfo?: string
  jobIntention: string
  professionalSummary: string
  coreAbilities: string[]
  workExperience: string[]
  projectExperience: string[]
  skillsAndTools: string[]
  education: string
  additionalItems?: string[]
}

// 最终简历生成后的二次适配度评估
export type FinalResumeAssessment = {
  roleFitAssessment: RoleFitAssessment
  matchScore: number
  scoreReasons: string[]
  scoreChangeSummary: string
}

export type InterviewRisk = {
  question: string
  riskReason: string
  evidenceNeeded: string
  suggestedAnswer: string
}

export type FurtherSuggestions = {
  projectsToAdd: string[]
  portfolioNeeded: boolean
  portfolioContent: string[]
  resumeVersions: string[]
  roleSpecificVersionsNeeded: boolean
}

// ---------- 响应类型 ----------

export type AnalyzeInitialResponse = {
  jdAnalysis: JDAnalysis
  resumeDiagnosis: ResumeDiagnosis
  matchTable: MatchItem[]
  followUpQuestions: FollowUpQuestion[]
  resumeStrategy: ResumeStrategy
  experienceTransferability: TransferableExperienceItem[]
  roleFitAssessment: RoleFitAssessment
  jdRequirementLevels: JDRequirementLevel[]
  noReplyDiagnosis: NoReplyDiagnosis
  skillGapPlan: SkillGapPlan
}

export type OptimizeResumeRequest = {
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  followUpAnswers?: string
}

export type OptimizeResumeResponse = {
  rewriteComparison: RewriteComparisonItem[]
  finalResume: FinalResume
  finalAssessment: FinalResumeAssessment
  interviewRisks: InterviewRisk[]
  furtherSuggestions: FurtherSuggestions
  mockInterviewPlan?: MockInterviewPlan
}

// ---------- 模拟面试类型 ----------

export type InterviewQuestionType = 'HR面试' | '业务面试' | '项目深挖' | '技能追问' | '压力追问'

export type InterviewDifficulty = '基础' | '中等' | '高压'

export type MockInterviewQuestion = {
  id: string
  type: InterviewQuestionType
  difficulty: InterviewDifficulty
  question: string
  relatedResumeEvidence: string
  relatedJDRequirement: string
  whyAsked: string
  evaluationFocus: string[]
  answerFramework: string
  riskWarning: string
}

export type MockInterviewPlan = {
  interviewPositioning: string
  questions: MockInterviewQuestion[]
  priorityQuestions: string[]
  preparationAdvice: string[]
}

export type MockInterviewLevel = '优秀' | '合格' | '偏弱' | '高风险'

export type MockInterviewReport = {
  overallScore: number
  overallLevel: MockInterviewLevel
  summary: string
  jobFitPerformance: string
  answerStructurePerformance: string
  evidenceQualityPerformance: string
  credibilityPerformance: string
  keyStrengths: string[]
  majorWeaknesses: string[]
  highRiskPoints: string[]
  priorityImprovements: string[]
  nextPracticePlan: string[]
}

export type EvaluateInterviewAnswerRequest = {
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  optimizedResult?: OptimizeResumeResponse
  question: MockInterviewQuestion
  userAnswer: string
}

export type EvaluateInterviewAnswerResponse = {
  score: number
  level: MockInterviewLevel
  strengths: string[]
  problems: string[]
  missingEvidence: string[]
  credibilityRisks: string[]
  structureAdvice: string[]
  improvedAnswer: string
  followUpQuestions: string[]
  nextPracticeSuggestion: string
  interviewReport: MockInterviewReport
}

// ---------- 成本观测元数据 ----------

export type CostStageName =
  | 'analyze-initial'
  | 'optimize-resume'
  | 'evaluate-interview-answer'
  | 'follow-up-answers'

export type CostCallMeta = {
  chainId: string
  /** 测试集 Case 标识（压测传入；产品路径可无） */
  caseId?: string
  stage: CostStageName
  model: string
  provider: string
  inputTokens: number
  /** null = Provider 未返回 cache 明细 */
  cachedInputTokens: number | null
  /** null = 与 cached 同步，表示无可靠 cache 信息 */
  uncachedInputTokens: number | null
  outputTokens: number
  durationMs: number
  estimatedCostCny: number | null
}

// ---------- 统一错误响应 ----------

export type ApiErrorResponse = {
  success: false
  error: string
}

export type ApiSuccessResponse<T> = {
  success: true
  data: T
  meta?: CostCallMeta
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
