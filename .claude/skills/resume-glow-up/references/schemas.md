# Core TypeScript Schema Contract

Use these fields and names consistently across frontend, backend, prompts, and Markdown export.

## Initial analysis request

```ts
type AnalyzeInitialRequest = {
  targetRole: string
  targetIndustry: string
  targetCompanyType: string
  targetApplicationScenario: string
  graduationStage: string
  educationLevel: string
  major: string
  highlightAbilities: string
  jdText: string
  resumeText: string
  internshipExperience?: string
  projectExperience?: string
  campusExperience?: string
  researchExperience?: string
  competitionExperience?: string
  skillsAndCertificates?: string
  measurableResults?: string
  avoidExaggeration?: string
  resumeLength?: '一页' | '两页' | '不限制'
  deliverySituation?: {
    appliedCount?: number
    replyCount?: number
    targetRoles?: string
    platforms?: string
    commonJDTypes?: string
    mainProblem?: string
  }
}
```

## Initial analysis response

```ts
type AnalyzeInitialResponse = {
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
```

## JD analysis

```ts
type JDAnalysis = {
  coreResponsibilities: string[]
  hardRequirements: string[]
  hiddenRequirements: string[]
  keywords: string[]
  idealCandidate: string
  topFiveAbilities: string[]
}
```

## Resume diagnosis

```ts
type ResumeDiagnosis = {
  matchScore: number
  scoreReasons: string[]
  dimensions: {
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
  strengths: string[]
  problems: string[]
  priorityFixes: string[]
}
```

## Match table

```ts
type MatchItem = {
  jdRequirement: string
  resumeEvidence: string
  evidenceStrength: '强' | '中' | '弱' | '无'
  needSupplement: boolean
  optimizationSuggestion: string
}
```

## Follow-up question

```ts
type FollowUpQuestion = {
  question: string
  reason: string
  direction:
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
}
```

## Resume strategy

```ts
type ResumeStrategy = {
  positioning: string
  experiencesToMoveForward: string[]
  contentToWeakenOrDelete: string[]
  keywordsToEmbed: string[]
  representativeProjects: string[]
  resumeStyle: '专业型' | '数据型' | '业务型' | '技术型' | '综合型'
}
```

## Transferable experience

```ts
type ExperienceCategory =
  | '实习经历'
  | '课程项目'
  | '科研经历'
  | '竞赛经历'
  | '社团经历'
  | '校园工作'
  | '个人作品'
  | '技能证书'
  | '其他'

type TransferableExperienceItem = {
  category: ExperienceCategory
  description: string
  transferableAbilities: string[]
  suitableRolesOrScenarios: string[]
  resumePlacement: string
  evidenceStrength: '强' | '中' | '弱' | '无'
  rewritePotential: '高' | '中' | '低'
  missingDetails: string[]
  interviewRisks: string[]
  suggestedRewriteDirection: string
}
```

Only analyze categories actually provided by the user. Do not invent missing categories.

## Optimize resume request and response

```ts
type OptimizeResumeRequest = {
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  followUpAnswers?: string
}

type OptimizeResumeResponse = {
  rewriteComparison: RewriteComparisonItem[]
  finalResume: FinalResume
  interviewRisks: InterviewRisk[]
  furtherSuggestions: FurtherSuggestions
  mockInterviewPlan?: MockInterviewPlan
}
```

## Rewrite and final resume

```ts
type RewriteComparisonItem = {
  before: string
  after: string
  reason: string
  needsConfirmation?: boolean
}

type FinalResume = {
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
```

## Interview risks and suggestions

```ts
type InterviewRisk = {
  question: string
  riskReason: string
  evidenceNeeded: string
  suggestedAnswer: string
}

type FurtherSuggestions = {
  projectsToAdd: string[]
  portfolioNeeded: boolean
  portfolioContent: string[]
  resumeVersions: string[]
  roleSpecificVersionsNeeded: boolean
}
```

## Role fit

```ts
type FitLevel = '强匹配' | '可尝试' | '勉强匹配' | '不建议主投'

type RoleFitAssessment = {
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
```

## JD requirement levels

```ts
type RequirementLevel = '硬门槛' | '重要加分项' | '普通加分项' | '可替代项'
type JDRequirementUserStatus = '已满足' | '部分满足' | '未满足' | '无法判断'

type JDRequirementLevel = {
  requirement: string
  level: RequirementLevel
  sourceText?: string
  evidenceNeeded: string
  userStatus: JDRequirementUserStatus
  currentEvidence: string
  howToCompensate: string
  resumeEmbeddingSuggestion: string
}
```

## No-reply diagnosis

```ts
type NoReplyProbability = '高' | '中' | '低'

type NoReplyLikelyReason = {
  reason: string
  probability: NoReplyProbability
  evidence: string
  fixSuggestion: string
}

type NoReplyDiagnosis = {
  hasDeliveryContext: boolean
  summary: string
  likelyReasons: NoReplyLikelyReason[]
  topThreeFixes: string[]
  nextSevenDayActionPlan: string[]
}
```

## Skill gap plan

```ts
type SkillImportance = '必须补' | '建议补' | '加分项'
type EstimatedDifficulty = '低' | '中' | '高'
type SkillPriority = '高' | '中' | '低'

type SkillGapItem = {
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

type SkillGapPlan = {
  targetRole: string
  summary: string
  missingSkills: SkillGapItem[]
  sevenDayPlan: string[]
  thirtyDayPlan: string[]
}
```

## Mock interview

```ts
type InterviewQuestionType = 'HR面试' | '业务面试' | '项目深挖' | '技能追问' | '压力追问'
type InterviewDifficulty = '基础' | '中等' | '高压'

type MockInterviewQuestion = {
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

type MockInterviewPlan = {
  interviewPositioning: string
  questions: MockInterviewQuestion[]
  priorityQuestions: string[]
  preparationAdvice: string[]
}
```

Generate 8-12 questions:
- HR面试: 2-3
- 业务面试: 2-3
- 项目深挖: 2-4
- 技能追问: 1-2
- 压力追问: 1-2

## Interview answer evaluation

```ts
type EvaluateInterviewAnswerRequest = {
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  optimizedResult?: OptimizeResumeResponse
  question: MockInterviewQuestion
  userAnswer: string
}

type MockInterviewLevel = '优秀' | '合格' | '偏弱' | '高风险'

type MockInterviewReport = {
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

type EvaluateInterviewAnswerResponse = {
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
```
