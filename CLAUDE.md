# 简历专家 / 应届生校招简历优化 Agent Web App

## 1. 项目定位

本项目是一个接入真实大模型 API 的 AI 简历优化 Agent Web App，产品名为「简历专家」。

它只服务应届生、在校生实习求职者和校招人群，不面向 1-3 年经验、3-5 年经验、管理岗、中高端社招或泛职业转型用户。它不是普通简历润色工具，而是基于目标校招岗位 JD，帮助应届生解析岗位要求、诊断简历短板、挖掘实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作和技能证书中的能力证据，并重构成校招 HR 和业务面试官认可的简历表达，同时生成面试追问风险和补强建议的「应届生校招 / 实习求职 JD 定制简历优化 Agent」。

产品核心逻辑是：

校招 JD 解析 → 应届生简历诊断 → JD-经历证据匹配 → 经历补充追问 → 校招简历优化策略 → 逐段优化 → 最终校招简历 → 面试追问与补强建议

核心目标是帮助应届生把真实经历（实习、课程项目、科研、竞赛、社团、校园工作、个人作品、技能证书）重构成校招招聘方认可的能力证据，提高简历通过率和面试邀约率。

本项目必须接入真实 AI API，不使用 Mock 数据伪造分析结果。

---

## 2. 当前版本范围

第一版是可本地运行、可课堂展示、可真实调用 API 的 Web App Demo。

必须实现：

- 前端页面；
- 后端 API 代理；
- 真实大模型 API 调用；
- 用户输入材料；
- AI 结构化分析；
- AI 追问；
- AI 简历优化；
- AI 面试追问与补强建议；
- Markdown 导出功能；
- Loading 状态；
- API 调用失败提示；
- 输入校验。

应届生求职痛点增强功能（第一版必须实现）：

- 岗位适配度判断（roleFitAssessment）：判断这个岗位是否值得投；
- JD 硬门槛 / 软门槛识别（jdRequirementLevels）：拆解 JD 要求的门槛类型与弥补方式；
- 经历可转化分析（experienceTransferability，增强版）：把实习、课程、科研、竞赛、社团等经历转化为岗位能力证据；
- 简历无回应诊断（noReplyDiagnosis）：诊断投递无反馈的可能原因与 7 天行动；
- 技能缺口与补强路径（skillGapPlan）：补什么技能、补到什么程度、用什么项目证明、怎么写进简历。

文本版模拟面试（第一阶段，仅文本交互）：

- 深度优化完成后生成模拟面试题库（mockInterviewPlan）；
- 用户选择一道题输入回答；
- 后端调用真实大模型 API 对回答进行评分、指出问题、给出追问、改进版回答；
- 最终生成一份结构化面试报告（interviewReport）；
- 暂不做前端页面、语音、视频、摄像头检测、多人面试或数据库历史记录。

第一版暂不实现：

- 用户登录；
- 数据库；
- 历史记录保存；
- 多用户系统；
- 付费支持；
- 文件上传解析；
- PDF / Word 自动解析；
- 多端同步；
- 权限系统。

注意：虽然没有数据库和登录，但必须接入真实 AI API，禁止用固定 Mock 冒充 AI 结果。

---

## 3. 技术栈

使用：

- Vite
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- dotenv

前端负责

- 页面展示；
- 用户输入；
- 流程导航；
- Loading 状态；
- 错误提示；
- 展示 AI 返回结果；
- 渲染 Markdown；
- 本地拼接并导出 Markdown。

后端负责

- 读取用户输入；
- 管理 API Key；
- 调用真实大模型 API；
- 封装 Prompt；
- 校验输入；
- 解析返回结构化 JSON；
- 处理 API 错误。

禁止在前端代码中暴露 API Key。

---

## 4. API Key 与环境变量

真实 API Key 只能存放在环境变量文件中，例如：

```bash
.env
.env.local
```

默认示例：

```bash
AI_API_KEY=你的真实API_KEY
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
SERVER_PORT=3001
```

支持两类协议，通过 `AI_PROVIDER` 区分：

1. OpenAI 兼容（`AI_PROVIDER=openai` 或 `openai-compatible`）：DeepSeek、Moonshot、Qwen、OpenAI 等，走 `/chat/completions`，使用 `Authorization: Bearer`。

2. Anthropic 兼容（`AI_PROVIDER=anthropic-compatible`）：如智谱 BigModel 的 `https://open.bigmodel.cn/api/anthropic`，走 `/v1/messages`，使用 `x-api-key` 与 `anthropic-version` 头，`system` 作为顶层字段。

智谱 BigModel 示例：

```bash
AI_API_KEY=你的真实API_KEY
AI_API_BASE_URL=https://open.bigmodel.cn/api/anthropic
AI_MODEL=glm-5.2
AI_PROVIDER=anthropic-compatible
SERVER_PORT=3001
```

注意：模型代码必须是供应商接受的合法值（如智谱用 `glm-5.2`，不要带 `[1m]` 等上下文变体后缀）。

安全要求：

1. 绝对不能把 API Key 写入代码里。
2. 绝对不能把 API Key 写入 CLAUDE.md。
3. 绝对不能把 API Key 写入 README。
4. 绝对不能把 API Key 写入前端或任何会被浏览器加载的文件。
5. 绝对不能把 `.env`、`.env.local` 提交到 Git。
6. 必须在 `.gitignore` 中忽略 `.env`、`.env.local`。
7. 前端只能请求本地后端接口，如 `/api/analyze-initial`。
8. 后端必须真实调用大模型 API。

---

## 5. 项目结构建议

建议使用以下结构：

```text
src/
  components/
    layout/
      AppLayout.tsx
      TopNav.tsx
      Sidebar.tsx
    common/
      Card.tsx
      Badge.tsx
      ProgressBar.tsx
      DataTable.tsx
      Button.tsx
      TextArea.tsx
      LoadingState.tsx
      ErrorState.tsx
    workflow/
      InputMaterials.tsx
      JDAnalysis.tsx
      ResumeDiagnosis.tsx
      MatchAnalysis.tsx
      FollowUpQuestions.tsx
      ResumeStrategy.tsx
      RewriteComparison.tsx
      FinalResume.tsx
      InterviewAndFurther.tsx
  types/
    index.ts
  services/
    api.ts
  utils/
    exportMarkdown.ts
    validators.ts
  App.tsx
  main.tsx
  index.css

server/
  index.ts
  aiClient.ts
  prompts.ts
  schemas.ts
  validators.ts

.env.example
.gitignore
CLAUDE.md
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
tsconfig.server.json
tailwind.config.js
postcss.config.js
```

---

## 6. 页面整体结构

页面结构为：

- 顶部标题与流程导航；
- 左侧输入材料区；
- 右侧结果展示区。

整体像专业效率工具，而不是营销官网。

流程导航共 9 个结果步骤（加左侧输入材料共 10 个核心模块）：

1. 校招 JD 解析
2. 应届生简历诊断
3. JD-经历证据匹配
4. 经历补充追问
5. 校招简历优化策略（含经历可转化分析）
6. 逐段优化
7. 最终校招简历
8. 面试追问与补强建议
9. 模拟面试（文本版，求职闭环最后一步）

---

## 7. 输入字段模块

输入模块需要支持用户填写以下内容。

### 7.1 应届生求职目标

- 目标岗位
- 目标行业
- 目标公司类型
- 投递场景
- 毕业阶段
- 学历
- 专业
- 希望简历突出什么能力

目标岗位示例（只填岗位名称，不附带"实习生"等后缀，实习与校招通用）：

- AI 产品经理
- 产品管培生
- 运营
- 数据分析师
- AI 应用
- 研发工程师
- 设计师
- 解决方案

目标行业示例：

- 互联网
- AI/大模型
- ToB SaaS
- 企业服务
- 消费科技
- 智能硬件

目标公司类型示例：

- 大厂
- 独角兽
- 创业公司
- 外企
- 国企/央企
- ToB SaaS

投递场景选项：

- 日常实习
- 暑期实习
- 秋招
- 春招
- 实习转正
- 管培生
- 校招提前批

毕业阶段选项：

- 大一/大二找实习
- 大三找暑期实习
- 大四秋招
- 大四春招
- 研一找实习
- 研二暑期实习
- 研三秋招/春招
- 已毕业但按应届生身份求职

学历选项：

- 大专
- 本科
- 硕士
- 博士

### 7.2 目标校招岗位 JD

支持粘贴目标校招岗位 JD 文本。

### 7.3 我的原始简历

支持粘贴用户原始简历文本。

### 7.4 经历材料（可选）

支持填写：

- 实习经历
- 项目 / 课程项目经历
- 科研经历
- 竞赛经历
- 社团 / 校园工作经历
- 技能与证书
- 有数据结果的经历
- 不希望被夸大的地方
- 简历目标长度

技能/证书示例：

- Axure
- Figma
- SQL
- Python
- 英语六级
- 计算机等级

简历目标长度选项：

- 一页
- 两页
- 不限制

### 7.5 投递情况（可选，用于简历无回应诊断）

支持填写，不强制：

- 已投递数量（数字）
- 收到回复数量（数字）
- 主要投递岗位方向
- 主要投递平台
- 常见 JD 类型
- 目前最困扰的问题

用户不填写投递情况也可以正常开始分析；此时无回应诊断基于简历与 JD 做一般性判断，但必须说明判断依据有限。

---

## 8. Agent 角色定位

产品中的 Agent 要设计成一个熟悉校招、实习招聘、应届生简历筛选、校园招聘面试和管培生选拔的资深职业发展顾问、校招 HRBP、企业招聘经理和应届生简历优化专家。

Agent 熟悉以下校招方向的招聘逻辑：

- 互联网
- AI
- 产品
- 运营
- ToB SaaS
- 研发
- 设计
- 数据

Agent 的核心是基于校招岗位，帮助应届生把实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作、个人作品和技能证书重构成招聘方认可的能力证据。

Agent 必须具备以下能力：

1. 能够基于校招岗位 JD，提取岗位职责、硬性要求、隐性要求、关键词和能力要求。
2. 能够结合应届生身份，做结构化诊断：教育背景匹配度、专业相关性、实习经历质量、项目经历质量、科研/竞赛/社团经历可转化程度、技能匹配、成果量化、关键词覆盖、应届生差异化亮点、可信度与面试追问风险、优先补强方向。
3. 能够把实习、课程、科研、竞赛、社团、校园工作中的经历改写成专业、有结构、有结果的简历表达。
4. 能够使用 STAR / CAR / PAR 等方法帮助应届生把经历映射成正确的能力证据。
5. 能够根据不同校招岗位特点，给出应届生可执行的一套通用建议。
6. 能够识别哪些表达可能被面试官追问/质疑，并提示用户补充真实证据。
7. 绝不能编造不存在的实习、项目、数据、奖项、证书、职位或成果。
8. 必须用校招标准评价应届生：不能用社招标准机械评价，不能要求用户具备多年正式工作成果或管理经验。

---

## 9. 真实 API 调用原则

本项目必须接入真实大模型 API。

后端需要封装以下接口：

### 9.1 初始分析接口

```http
POST /api/analyze-initial
```

输入：

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

输出：

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

该接口用于生成：

1. 校招 JD 解析表；
2. 应届生简历诊断报告；
3. JD-经历证据匹配表；
4. 经历补充追问清单；
5. 校招简历优化策略；
6. 经历可转化分析（增强版）；
7. 岗位适配度判断；
8. JD 硬门槛 / 软门槛识别；
9. 简历无回应诊断；
10. 技能缺口与补强路径。

---

### 9.2 深度优化接口

```http
POST /api/optimize-resume
```

输入：

```ts
type OptimizeResumeRequest = {
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  followUpAnswers?: string
}
```

输出：

```ts
type OptimizeResumeResponse = {
  rewriteComparison: RewriteComparisonItem[]
  finalResume: FinalResume
  interviewRisks: InterviewRisk[]
  furtherSuggestions: FurtherSuggestions
  mockInterviewPlan?: MockInterviewPlan
}
```

该接口用于生成：

1. 修改前后对照表；
2. 最终校招简历；
3. 面试追问风险；
4. 进一步补强建议；
5. 模拟面试题库（mockInterviewPlan）。

---

### 9.3 模拟面试回答点评接口

```http
POST /api/evaluate-interview-answer
```

输入：

```ts
type EvaluateInterviewAnswerRequest = {
  originalInput: AnalyzeInitialRequest
  initialAnalysis: AnalyzeInitialResponse
  optimizedResult?: OptimizeResumeResponse
  question: MockInterviewQuestion
  userAnswer: string
}
```

输出：

```ts
type EvaluateInterviewAnswerResponse = {
  score: number
  level: '优秀' | '合格' | '偏弱' | '高风险'
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

该接口用于：

1. 对用户选择的一道模拟面试题的回答进行评分与点评；
2. 指出优点、问题、证据缺口、可信度风险与结构建议；
3. 给出基于用户材料的保守改写版回答与 2-4 个追问；
4. 生成本次模拟面试的结构化面试报告（interviewReport）。

---

### 9.4 Markdown 导出

在前端本地完成 Markdown 拼接，无需后端接口。

导出内容必须包含（按顺序）：

1. 校招 JD 解析表
2. 应届生简历诊断报告
3. JD-经历证据匹配表
4. 经历补充追问清单
5. 校招简历优化策略
6. 经历可转化分析
7. 修改前后对照表
8. 最终校招简历
9. 面试追问与补强建议

---

## 10. AI 输出格式要求

后端调用大模型时，必须要求模型返回结构化 JSON。

不要让前端直接解析大段自然语言。

推荐做法：

1. 后端构造系统提示词和用户提示词；
2. 要求模型严格返回 JSON；
3. 后端尝试解析 JSON；
4. 如果解析失败，返回明确错误；
5. 前端显示错误提示，不使用 Mock 数据兜底；
6. 不要在解析失败时伪造成功结果。

如果模型返回 Markdown 或非 JSON 内容，后端应尽量提取 JSON；提取失败则返回：

```json
{
  "success": false,
  "error": "AI 返回格式不符合要求，请重试。"
}
```

---

## 11. 核心数据类型

### 11.1 JDAnalysis

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

---

### 11.2 ResumeDiagnosis

```ts
type ResumeDiagnosis = {
  matchScore: number
  scoreReasons: string[]
  dimensions: {
    educationMatch: string         // 教育背景匹配度
    majorRelevance: string         // 专业与岗位相关性
    internshipQuality: string      // 实习经历质量
    projectQuality: string         // 项目经历质量
    transferableExperience: string // 科研/竞赛/社团经历可转化程度
    skillsMatch: string            // 技能工具匹配度
    resultsQuantification: string  // 成果量化程度
    keywordCoverage: string        // 关键词覆盖度
    differentiation: string        // 应届生差异化亮点
    credibilityRisk: string        // 可信度与面试追问风险
    priorityFixes: string          // 优先补强方向
  }
  strengths: string[]
  problems: string[]
  priorityFixes: string[]
}
```

---

### 11.3 MatchItem

```ts
type MatchItem = {
  jdRequirement: string
  resumeEvidence: string
  evidenceStrength: '强' | '中' | '弱' | '无'
  needSupplement: boolean
  optimizationSuggestion: string
}
```

---

### 11.4 FollowUpQuestion

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

---

### 11.5 ResumeStrategy

```ts
type ResumeStrategy = {
  positioning: string
  experiencesToMoveForward: string[]
  contentToWeakenOrDelete: string[]
  keywordsToEmbed: string[]
  representativeProjects: string[]
  resumeStyle:
    | '专业型'
    | '数据型'
    | '业务型'
    | '技术型'
    | '综合型'
}
```

---

### 11.6 TransferableExperienceItem（经历可转化分析，增强版）

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

只分析用户实际提供的经历类别，未提供的类别省略，不允许编造。证据强度必须客观，不允许把弱证据包装成强证据。

---

### 11.7 RewriteComparisonItem

```ts
type RewriteComparisonItem = {
  before: string
  after: string
  reason: string
  needsConfirmation?: boolean
}
```

---

### 11.8 FinalResume

```ts
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

---

### 11.9 InterviewRisk

```ts
type InterviewRisk = {
  question: string
  riskReason: string
  evidenceNeeded: string
  suggestedAnswer: string
}
```

---

### 11.10 FurtherSuggestions

```ts
type FurtherSuggestions = {
  projectsToAdd: string[]
  portfolioNeeded: boolean
  portfolioContent: string[]
  resumeVersions: string[]
  roleSpecificVersionsNeeded: boolean
}
```

---

### 11.11 RoleFitAssessment（岗位适配度判断）

```ts
type FitLevel = '强匹配' | '可尝试' | '勉强匹配' | '不建议主投'

type RoleFitAssessment = {
  fitLevel: FitLevel
  fitScore: number                 // 0-100，校招语境相对匹配分
  summary: string
  reasons: string[]
  hardBlockers: string[]           // 没有明确硬阻碍时返回空数组 []
  softGaps: string[]
  bestEvidence: string[]
  riskWarnings: string[]
  recommendedAction: string
}
```

fitLevel 判断标准：强匹配=简历已有较多直接证据；可尝试=有匹配基础但需改写补证据；勉强匹配=可投但不应作为主投方向；不建议主投=JD 关键门槛明显缺失。不要用社招标准要求多年工作成果或管理经验。

---

### 11.12 JDRequirementLevel（JD 硬门槛 / 软门槛识别）

```ts
type RequirementLevel = '硬门槛' | '重要加分项' | '普通加分项' | '可替代项'
type JDRequirementUserStatus = '已满足' | '部分满足' | '未满足' | '无法判断'

type JDRequirementLevel = {
  requirement: string
  level: RequirementLevel
  sourceText?: string
  evidenceNeeded: string
  userStatus: JDRequirementUserStatus
  currentEvidence: string          // 没有证据时写"暂无明确证据"
  howToCompensate: string
  resumeEmbeddingSuggestion: string
}
```

requirement 必须来自目标 JD 真实要求，不要脱离 JD 编造。userStatus 必须基于用户材料判断，不能强行判定已满足。

---

### 11.13 NoReplyDiagnosis（简历无回应诊断）

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
  topThreeFixes: string[]          // 仅最优先 3 项
  nextSevenDayActionPlan: string[]
}
```

未提供投递情况时基于简历和 JD 给出一般性诊断，但 summary 必须说明判断依据有限。

---

### 11.14 SkillGapPlan（技能缺口与补强路径）

```ts
type SkillImportance = '必须补' | '建议补' | '加分项'
type EstimatedDifficulty = '低' | '中' | '高'
type SkillPriority = '高' | '中' | '低'

type SkillGapItem = {
  skill: string
  importance: SkillImportance
  currentEvidence: string          // 没有证据时写"暂无明确证据"
  targetLevel: string              // 应届生可执行水平，不要写"精通"
  learningSourceTypes: string[]    // 来源类型，不要编造具体广告链接
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

missingSkills 必须基于目标 JD 和用户当前简历判断，不要泛泛列技能清单。learningSourceTypes 只输出来源类型，不要假装已联网搜索资源。

---

### 11.15 MockInterviewPlan（模拟面试题库）

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

题目数量 8-12 道：HR 面试 2-3、业务面试 2-3、项目深挖 2-4、技能追问 1-2、压力追问 1-2。answerFramework 只提供回答框架，不要替用户编造具体经历。

---

### 11.16 EvaluateInterviewAnswerRequest / Response（模拟面试回答点评）

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

score 与 overallScore 均为 0-100，基于校招面试标准。improvedAnswer 必须严格基于用户已有回答和简历材料改写，不得编造；信息不足标注【待补充】或【待确认】。followUpQuestions 给出 2-4 个追问。

---

## 12. Prompt 设计要求

后端调用真实大模型 API 时，必须使用稳定的系统提示词。

系统提示词核心内容如下：

```text
你是一名资深职业发展顾问、校招 HRBP、企业招聘经理和应届生简历优化专家，熟悉校招、实习招聘、应届生简历筛选、校园招聘面试和管培生选拔。你了解互联网、AI、产品、运营、数据、研发、设计、解决方案等方向校招岗位的真实用人标准。

你的任务是基于目标校招岗位 JD，帮助应届生 / 在校生 / 实习求职者解析岗位要求、诊断简历短板、挖掘实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作、个人作品和技能证书中的能力证据，并重构成校招 HR 和业务面试官认可的简历表达，提高简历通过率和面试邀约率。

你必须遵守以下规则：

1. 只能基于用户提供的信息进行分析和改写。
2. 绝不能编造用户不存在的实习、项目、数据、奖项、证书、职位或成果。
3. 不要把“参与”改写成“负责”或“主导”，除非用户材料能证明其确实负责/主导。
4. 没有数据时，不要编造数据。
5. 对不确定内容必须标注【待确认】或【需要补充】。
6. 必须用校招标准评价应届生：不能用社招标准机械评价，不能要求用户具备多年正式工作成果或管理经验；要从实习、课程、科研、竞赛、社团、校园工作、个人项目和技能证书中提炼可证明的岗位能力证据。
7. 如果简历与目标校招岗位不匹配，必须直接指出，并给出应届生可执行的补强方向。
8. 如果某些表达容易被面试官追问/质疑，必须指出风险。
9. 输出要专业、直接、严格、具体、可执行；不要空泛鼓励，不要讲大道理。
10. 必须严格按照指定 JSON Schema 返回结果。
```

---

## 13. 初始分析 Prompt 要求

`/api/analyze-initial` 的用户提示词应包含以下内容：

```text
请基于以下用户输入，完成校招 JD 解析、应届生简历诊断、JD-经历证据匹配、经历补充追问、校招简历优化策略和经历可转化分析。

输入信息：

1. 目标岗位：
{targetRole}

2. 目标行业：
{targetIndustry}

3. 目标公司类型：
{targetCompanyType}

4. 投递场景：
{targetApplicationScenario}

5. 毕业阶段：
{graduationStage}

6. 学历：
{educationLevel}

7. 专业：
{major}

8. 希望简历突出：
{highlightAbilities}

9. 目标校招岗位 JD：
{jdText}

10. 用户原始简历：
{resumeText}

11. 实习经历：
{internshipExperience}

12. 项目/课程项目经历：
{projectExperience}

13. 科研经历：
{researchExperience}

14. 竞赛经历：
{competitionExperience}

15. 社团/校园工作经历：
{campusExperience}

16. 技能与证书：
{skillsAndCertificates}

17. 有数据结果的经历：
{measurableResults}

18. 不希望被夸大的地方：
{avoidExaggeration}

19. 简历目标长度：
{resumeLength}

20. 投递情况（可选）：
已投递数量：{deliverySituation.appliedCount}
收到回复数量：{deliverySituation.replyCount}
主要投递岗位方向：{deliverySituation.targetRoles}
主要投递平台：{deliverySituation.platforms}
常见 JD 类型：{deliverySituation.commonJDTypes}
目前最困扰的问题：{deliverySituation.mainProblem}

请严格输出 JSON，不要输出 Markdown，不要输出解释性废话。

需要输出（共 10 个顶层字段，缺一不可）：

1. jdAnalysis
2. resumeDiagnosis
3. matchTable
4. followUpQuestions
5. resumeStrategy
6. experienceTransferability
7. roleFitAssessment
8. jdRequirementLevels
9. noReplyDiagnosis
10. skillGapPlan

其中：

- JD 解析需包含岗位核心职责、岗位硬性要求、岗位隐性要求、高频关键词、校招招聘方真正想找的应届生画像、这个岗位最看重的 5 项能力。
- 简历诊断必须从教育背景匹配度、专业与岗位相关性、实习经历质量、项目经历质量、科研/竞赛/社团经历可转化程度、技能工具匹配度、成果量化程度、关键词覆盖度、应届生差异化亮点、可信度与面试追问风险、优先补强方向这 11 个维度进行诊断；用校招标准评价，不要用社招标准要求多年正式工作成果或管理经验。
- 匹配表必须使用“JD 要求 - 我简历/经历中已有证据 - 证据强度 - 是否需要补充 - 优化建议”的结构。
- 证据强度只能是：强、中、弱、无。
- 如果某项 JD 要求没有对应经历，必须明确指出，不要编造。
- 追问必须提出 5-10 个面向应届生的最关键问题（围绕实习、课程项目、科研、竞赛、社团、校园工作中的证据补充），不能泛泛地问“还有什么补充吗”。
- 校招简历优化策略需说明应届生求职定位、应该前置的经历、应该弱化或删除的内容、应嵌入关键词、代表项目/经历、整体风格。
- 经历可转化分析：对实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作、个人作品、技能证书、其他中用户实际拥有的类别，逐项分析它是什么、能转化成哪些岗位能力、适合哪些岗位或场景、适合放在简历哪里、证据强度（强/中/弱/无，客观不夸大）、改写潜力（高/中/低）、缺失哪些信息、面试风险、改写方向（只给方向，不编造最终成果）；用户未提供的类别可省略，不要编造。
- 岗位适配度判断（roleFitAssessment）：回答"这个岗位我是否值得投"。fitScore 为 0-100 校招语境相对匹配分；fitLevel——强匹配=简历已有较多直接证据，可尝试=有匹配基础但需改写补证据，勉强匹配=可投但不应作为主投方向，不建议主投=JD 关键门槛明显缺失；hardBlockers 没有明确硬阻碍时返回空数组 []，不要硬编；bestEvidence 列出真实证据；recommendedAction 给出明确行动建议。
- JD 硬门槛/软门槛识别（jdRequirementLevels）：requirement 必须来自目标 JD 真实要求；level 判断符合校招逻辑；userStatus 基于用户材料判断，不能强行判定已满足；currentEvidence 没有时写"暂无明确证据"；howToCompensate 给出应届生可执行补救方式；resumeEmbeddingSuggestion 说明应嵌入简历哪个部分。
- 简历无回应诊断（noReplyDiagnosis）：hasDeliveryContext 标记是否提供了投递情况；未提供时基于简历和 JD 给出一般性诊断，但 summary 必须说明判断依据有限；likelyReasons 聚焦真实求职问题，probability 根据证据判断，evidence 写明依据，fixSuggestion 具体到可修改动作；topThreeFixes 仅列 3 项；nextSevenDayActionPlan 给出 7 天可执行行动，不要长期空话。
- 技能缺口与补强路径（skillGapPlan）：missingSkills 基于目标 JD 和用户简历判断，不要泛泛列技能清单；targetLevel 写成应届生可执行水平，不要写"精通"；learningSourceTypes 只输出来源类型，不要编造具体广告链接，也不要假装已联网搜索；practiceProject 给出可放进简历的练习项目方向；sevenDayPlan 和 thirtyDayPlan 必须具体，不要"坚持学习、提升能力"式空话。
```

---

## 14. 深度优化 Prompt 要求

`/api/optimize-resume` 的用户提示词应包含以下内容：

```text
请基于用户原始输入、初始分析结果、用户补充回答、最终校招简历和面试风险点，完成简历逐段优化、最终校招简历、面试追问风险、进一步补强建议和模拟面试题库。

你必须遵守：

1. 每段经历尽量使用“动作 + 对象 + 方法 + 结果”的结构。
2. 避免空话，例如“认真负责”“沟通能力强”“学习能力强”“提升用户体验”。
3. 尽量使用具体业务对象、方法、产出和结果；应届生可用课程成果、实习产出、竞赛成绩、科研结论等作为结果。
4. 没有数据时，不要编造数据。
5. 如果原文信息不足，请用【待补充】标记。
6. 不要把“参与”弱化或改写成“负责/主导”，除非原文能证明用户确实负责/主导。
7. 不要写用户无法在面试中解释清楚的内容。
8. 如果使用了用户未确认的信息，必须标注【待确认】或【需要补充】。
9. 用校招标准评价和改写，不要要求应届生具备多年正式工作成果或管理经验。
10. 模拟面试题库（mockInterviewPlan）必须基于目标校招 JD、用户简历、最终简历与面试风险点生成；题目必须与 JD 和简历强相关；必须能帮助用户识别“简历写得出来但面试讲不清楚”的风险；不要生成泛泛问题；answerFramework 只提供回答框架，不要替用户编造具体经历。

请严格输出 JSON，不要输出 Markdown，不要输出解释性废话。

需要输出：

1. rewriteComparison
2. finalResume
3. interviewRisks
4. furtherSuggestions
5. mockInterviewPlan
```

mockInterviewPlan 需生成 8-12 道题，覆盖 HR 面试 2-3、业务面试 2-3、项目深挖 2-4、技能追问 1-2、压力追问 1-2。每道题必须说明为什么会被问、对应简历证据、对应 JD 要求、面试官重点考察什么、建议回答框架、回答风险。

---

## 14.1 模拟面试回答点评 Prompt 要求

`/api/evaluate-interview-answer` 的用户提示词应包含：目标校招 JD、用户原始简历、初始分析结果、优化后简历与面试风险点、本次模拟面试题（含 whyAsked、对应证据、对应 JD 要求、重点考察、建议框架、风险）、用户回答。

必须要求模型：

1. 严格返回 JSON，不要输出 Markdown，不要输出解释性废话；
2. 用校招面试标准评价应届生，不要用社招标准要求多年正式工作成果或管理经验；
3. 指出回答中的证据缺口、逻辑问题、可信度风险和可改进表达；
4. 基于用户材料保守改写 improvedAnswer，不得编造；信息不足标注【待补充】或【待确认】；
5. 给出 2-4 个 followUpQuestions；
6. 最终生成 interviewReport，总结整体表现、岗位匹配表达、回答结构、证据质量、可信度风险、核心优势、主要短板、高风险点、优先改进项和下一步练习计划。

---

## 15. 核心流程与输出要求

### 15.1 第一步：解析目标校招岗位 JD

需要输出：

1. 岗位核心职责
2. 岗位硬性要求
3. 岗位隐性要求
4. 高频关键词
5. 校招招聘方真正想找的应届生画像
6. 这个岗位最看重的 5 项能力

要求：

- 使用表格输出；
- 信息层级清晰；
- 可使用 Badge 展示关键词和能力标签；
- 可使用卡片展示应届生画像。

---

### 15.2 第二步：诊断应届生原始简历

需要从以下维度诊断：

1. 教育背景匹配度
2. 专业与岗位相关性
3. 实习经历质量
4. 项目经历质量
5. 科研/竞赛/社团经历可转化程度
6. 技能工具匹配度
7. 成果量化程度
8. 关键词覆盖度
9. 应届生差异化亮点
10. 可信度与面试追问风险
11. 优先补强方向

需要给出：

- 0-100 分校招匹配度评分；
- 扣分原因；
- 优势；
- 问题；
- 优先补强项。

---

### 15.3 第三步：建立「JD 要求 - 经历证据」匹配表

需要输出一张表：

| JD 要求 | 简历/经历中已有证据 | 证据强度 | 是否需要补充 | 优化建议 |
|---|---|---|---|---|

证据强度分为：

- 强
- 中
- 弱
- 无

要求：

- 如果某项 JD 要求没有对应经历，必须明确指出；
- 不允许编造经历；
- 不允许编造数据；
- 不允许把弱证据强行包装成强证据。

---

### 15.4 第四步：对信息不足的地方进行追问

需要根据应届生简历和校招 JD，提出 5-10 个最关键的追问。

追问要求：

- 具体；
- 可回答；
- 面向证据补充；
- 不能泛泛地问“还有什么补充吗”。

追问方向包括：

1. 项目背景
2. 个人职责
3. 业务目标
4. 关键动作
5. 协作对象
6. 产出成果
7. 数据指标
8. 用户/客户规模
9. 难点与解决方案
10. 可证明能力

如果用户没有回答这些追问，系统可以先基于现有信息做保守优化，但必须标注「需要用户确认」。

---

### 15.5 第五步：重构校招简历策略

需要输出本次简历优化策略，包括：

1. 应届生应突出什么求职定位
2. 哪些经历应该前置
3. 哪些内容应该弱化或删除
4. 哪些关键词应该自然嵌入
5. 哪些项目/经历应该作为代表经历重点写
6. 简历整体风格应该是：专业型 / 数据型 / 业务型 / 技术型 / 综合型

---

### 15.6 第五步扩展：经历可转化分析

对实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作、个人作品、技能证书中用户实际拥有的类别，逐项分析：

1. 这段经历是什么；
2. 能转化成哪些岗位能力；
3. 适合放在简历哪里；
4. 证据强度如何（强/中/弱/无）；
5. 有哪些面试风险。

用户未提供的类别可省略，不要编造。

---

### 15.7 第六步：逐段优化简历内容

优化原则：

1. 每段经历尽量使用「动作 + 对象 + 方法 + 结果」的结构。
2. 避免空话，例如“认真负责”“沟通能力强”“学习能力强”“提升用户体验”。
3. 尽量使用具体业务对象、方法、产出和结果；应届生可用课程成果、实习产出、竞赛成绩、科研结论等作为结果。
4. 没有数据时，不要编造数据；可用“完成 XX 课题”“产出 XX 原型”“覆盖 XX 个用例”等保守表达。
5. 如果原文信息不足，请用【待补充】标记。
6. 不要把“参与”弱化或改写成“负责/主导”，除非原文能证明用户确实负责/主导。
7. 不要写用户无法在面试中解释清楚的内容。

需要输出：

| 修改前 | 修改后 | 修改理由 |
|---|---|---|

---

### 15.8 第七步：输出最终校招简历

需要输出一版完整简历，结构包括：

1. 个人信息
2. 求职意向
3. 个人简介 / 职业摘要
4. 核心能力
5. 实习 / 工作经历
6. 项目经历（含课程项目、科研、竞赛）
7. 技能与证书
8. 教育背景
9. 其他加分项，可选

如果某些模块不适合用户，可以调整结构。

最终简历要求：

1. 适合目标校招岗位投递
2. 语言专业、简洁、有信息密度
3. 突出岗位匹配度
4. 尽量体现结果和价值
5. 保持真实可信
6. 控制在合理篇幅内

---

### 15.9 第八步：输出面试追问风险

需要列出：

1. 简历中最可能被面试官追问的问题；
2. 哪些表述需要用户准备证据；
3. 哪些数据或项目细节需要用户补充；
4. 哪些地方可能显得夸大；
5. 如何回答这些追问的建议。

---

### 15.10 第九步：输出进一步补强建议

需要告诉应届生：

1. 如果想提高这个校招岗位的命中率，还应该补充哪些实习/项目/竞赛；
2. 是否需要作品集；
3. 作品集应该包含哪些内容；
4. 简历还可以生成哪些版本；
5. 是否需要针对不同岗位生成不同版本。

---

### 15.11 附加：JD 硬门槛 / 软门槛拆解

对目标 JD 的真实要求逐条拆解，输出：

1. JD 要求（来自 JD 原文，不编造）；
2. 门槛类型：硬门槛 / 重要加分项 / 普通加分项 / 可替代项；
3. 需要的证据；
4. 用户当前状态：已满足 / 部分满足 / 未满足 / 无法判断（基于用户材料，不强行判定已满足）；
5. 已有证据（没有时写"暂无明确证据"）；
6. 应届生可执行的弥补方式（如用课程项目补 SQL 证据、用竞赛方案说明产品分析能力、用 Coze/Dify 个人项目补 AI 应用理解）；
7. 简历嵌入建议（核心能力 / 项目经历 / 技能证书 / 作品集 / 面试准备）。

---

### 15.12 附加：岗位适配度判断

回答"这个岗位我是否值得投"，输出：

1. 适配等级（强匹配 / 可尝试 / 勉强匹配 / 不建议主投）；
2. 校招相对匹配分（0-100，不用社招标准）；
3. 核心判断与依据；
4. 关键优势证据；
5. 硬阻碍（学历、专业、必备技能、实习、作品集等，没有则空数组）；
6. 软短板（可通过项目 / 作品集 / 技能学习 / 简历改写弥补）；
7. 投递风险；
8. 明确行动建议（如"建议作为主投岗位""可投但需先补强 SQL 项目证据""不建议主投，优先转向运营/项目助理类岗位"）。

---

### 15.13 附加：简历无回应诊断

回答"为什么我投了很多简历没有反馈"，输出：

1. 是否结合投递情况（未提供时基于简历和 JD 做一般性诊断，须说明依据有限）；
2. 诊断概要；
3. 可能原因及概率（高/中/低）、依据、修复建议（聚焦岗位选择过宽、主投方向不清晰、JD 关键词覆盖不足、教育/专业匹配弱、项目表达像课程作业、成果量化不足、实习证据不足、简历结构顺序错误、缺少作品集、技能证据不足、同一份简历投所有岗位等）；
4. 三项优先修复；
5. 7 天可执行行动计划（简历 / 投递 / 技能补强，不写长期空话）。

---

### 15.14 附加：经历可转化分析（增强版）

只分析用户实际提供的经历类别（未提供省略，不编造），逐项输出：

1. 经历类别与描述；
2. 能转化成哪些岗位能力（需求分析、数据分析、用户研究、项目推进、文档输出、协作沟通、问题拆解、技术理解、AI 工具应用、商业分析、活动策划、内容运营等）；
3. 适合哪些岗位或场景；
4. 适合放在简历哪里；
5. 证据强度（强/中/弱/无，客观不夸大）；
6. 改写潜力（高/中/低）；
7. 缺失信息；
8. 面试风险；
9. 改写方向（只给方向，不编造最终成果）。

---

### 15.15 附加：技能缺口与补强路径

回答"该补什么技能、补到什么程度、用什么项目证明、怎么写进简历"，输出：

1. 目标岗位与概要；
2. 缺口技能清单（基于 JD 与简历，不泛泛列）：技能、重要性（必须补/建议补/加分项）、当前证据、目标水平（应届生可执行，不写"精通"）、学习来源类型（不编造广告链接、不假装联网搜索）、练习项目方向、简历嵌入建议、难度、优先级；
3. 7 天计划；
4. 30 天计划。

---

### 15.16 附加：模拟面试（文本版，第一阶段）

深度优化完成后生成模拟面试题库，用户选择一道题输入回答，后端点评并生成面试报告。

题库（mockInterviewPlan）要求：

1. 题目数量 8-12 道，覆盖 HR 面试、业务面试、项目深挖、技能追问、压力追问；
2. 题目必须与目标校招 JD 和用户简历强相关；
3. 题目必须能帮助用户识别"简历写得出来但面试讲不清楚"的风险；
4. 不要生成泛泛问题（如"请介绍一下你自己"除非能结合岗位定位给出具体考察点）；
5. 每道题必须说明：为什么会被问、对应简历证据、对应 JD 要求、面试官重点考察什么、建议回答框架（只给框架不编造经历）、回答风险。

回答点评（/api/evaluate-interview-answer）要求：

1. 评分 0-100，基于校招面试标准；
2. 指出优点、问题、证据缺口、可信度风险与结构建议；
3. improvedAnswer 基于用户已有回答和简历保守改写，不得编造，信息不足标注【待补充】或【待确认】；
4. 给出 2-4 个追问；
5. 生成 interviewReport，总结整体表现、岗位匹配表达、回答结构、证据质量、可信度风险、核心优势、主要短板、高风险点、优先改进项与下一步练习计划。

---

## 16. 最终输出顺序

最终结果（含 Markdown 导出）必须严格按照以下顺序输出：

1. 校招 JD 解析表
2. JD 硬门槛 / 软门槛识别
3. 岗位适配度判断
4. 应届生简历诊断报告
5. 简历无回应诊断
6. JD-经历证据匹配表
7. 经历补充追问清单
8. 校招简历优化策略
9. 经历可转化分析
10. 技能缺口与补强路径
11. 修改前后对照表
12. 最终校招简历
13. 面试追问与补强建议
14. 模拟面试题库
15. 模拟面试报告（若用户已完成回答点评则导出点评与最终面试报告；未完成则显示"尚未完成模拟面试回答点评"）

若某些可选字段为空，应在 Markdown 中省略该部分或显示"暂无足够信息"，不要导出 undefined、null 或空对象。

---

## 17. 语气与风格

Agent 输出必须使用专业、直接、严格的风格。

要求：

1. 不要空泛鼓励。
2. 不要为了好听而夸大用户经历。
3. 如果应届生简历与目标校招岗位不匹配，必须直接指出。
4. 如果某些经历缺少证据，必须明确说明。
5. 如果某些表达容易被面试官追问/质疑，必须指出风险。
6. 输出要具体、可执行，不要讲大道理。
7. 所有修改都必须基于用户提供的信息。
8. 对不确定内容必须标注【待确认】或【需要补充】。
9. 用校招标准评价应届生，不要用社招标准机械评价。

---

## 18. 视觉风格

视觉风格必须简约、现代、专业、克制。

参考风格：

- Linear
- Notion
- Lark
- Raycast

设计要求：

- 白色和浅灰背景；
- 细边框卡片；
- 清晰表格；
- 克制 Badge；
- 克制 Progress；
- 清晰信息层级；
- 合理留白；
- 字体大小和间距统一；
- 页面整体像专业效率工具，而不是营销官网。

禁止：

- 花哨渐变；
- 大面积紫色或蓝紫色 AI SaaS 风；
- 卡通插画；
- 玻璃拟态；
- 发光按钮；
- 过度动画；
- 夸张阴影；
- 游戏化界面；
- 营销落地页风格。

---

## 19. 交互要求

用户操作应形成完整闭环：

1. 输入应届生求职目标、校招 JD、原始简历和经历材料；
2. 点击开始分析；
3. 前端向后端 `/api/analyze-initial` 发送请求；
4. 后端调用真实大模型 API；
5. 前端展示校招 JD 解析；
6. 前端展示应届生简历诊断；
7. 前端展示 JD-经历证据匹配表；
8. 前端展示经历补充追问；
9. 用户可以补充回答；
10. 前端向后端 `/api/optimize-resume` 发送请求；
11. 后端再次调用真实大模型 API；
12. 前端展示校招简历优化策略（含经历可转化分析）；
13. 前端展示修改前后对照表；
14. 前端展示最终校招简历；
15. 前端展示面试追问风险；
16. 前端展示进一步补强建议；
17. 前端展示模拟面试题库（mockInterviewPlan），按题型分组，用户可选择一道题；
18. 用户在作答区输入面试回答，点击「提交回答点评」；
19. 前端向后端 `/api/evaluate-interview-answer` 发送请求，后端调用真实大模型 API；
20. 前端展示 AI 点评结果与最终面试报告（interviewReport）；
21. 用户可以导出 Markdown 结果（含模拟面试题库与报告）。

模拟面试第一版为文本版：用户可以选择题目并输入回答；系统调用真实 AI API 生成点评和最终面试报告；不保存历史记录；不做语音/视频/摄像头能力；不使用 Mock 数据。若未完成深度优化或后端未返回题库，显示"请先完成简历深度优化，再生成模拟面试题。"；未选问题提示"请先选择一道模拟面试题。"；未填回答提示"请先输入你的面试回答。"。

任何主要按钮都不应只是装饰，必须有真实状态反馈。

必须包含：

- 空状态；
- Loading 状态；
- 成功状态；
- API 失败状态；
- JSON 解析失败状态；
- 输入缺失提示；
- 重新生成按钮；
- 导出按钮。

---

## 20. 真实 API 错误处理

必须处理以下错误：

1. 用户没有填写 JD；
2. 用户没有填写简历；
3. 用户没有配置 API Key；
4. API Key 无效；
5. 模型服务请求超时；
6. 模型服务返回错误；
7. 模型返回内容不是合法 JSON；
8. 网络请求失败；
9. 后端服务未启动；
10. 输入内容过长；
11. 模拟面试：用户未选择问题；
12. 模拟面试：用户未填写回答；
13. 模拟面试：缺少必要上下文（未完成简历分析与深度优化）；
14. 模拟面试：点评接口调用失败；
15. 模拟面试：点评结果 JSON 解析失败。

错误提示必须具体，例如：

- “请先填写目标校招岗位 JD。”
- “请先粘贴原始简历。”
- “未检测到 AI_API_KEY，请检查 .env 配置。”
- “AI 服务调用失败，请检查 API Key、模型名称或网络连接。”
- “AI 返回格式不符合要求，请重试。”
- “请求超时，请稍后重试或缩短输入内容。”
- “请先选择一道模拟面试题。”
- “请先输入你的面试回答。”
- “请先完成简历分析和深度优化后再进行模拟面试。”

严禁：

- API 失败后展示 Mock 数据；
- API 失败后假装分析成功；
- API 失败后静默无提示；
- JSON 解析失败后伪造结构化结果。

---

## 21. 安全与隐私规则

由于用户会输入真实简历和 JD，本项目必须遵守：

1. 不在前端保存 API Key；
2. 不在控制台打印完整简历；
3. 不在控制台打印 API Key；
4. 不在错误信息中泄露 API Key；
5. 不把用户简历写入本地文件；
6. 不把用户简历提交到第三方日志系统；
7. 不启用无必要的埋点；
8. 不在 Git 中保存 `.env`；
9. 不在代码中硬编码用户真实简历；
10. 不使用真实用户隐私信息作为示例数据。

---

## 22. 代码实现要求

### 22.1 前端请求封装

前端需要在 `src/services/api.ts` 中封装请求，例如：

```ts
export async function analyzeInitial(payload: AnalyzeInitialRequest) {
  const response = await fetch('/api/analyze-initial', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    throw new Error('初始分析失败')
  }

  return response.json()
}
```

### 22.2 后端 AI Client

后端需要在 `server/aiClient.ts` 中统一封装真实 API 调用。

要求：

- 从 `process.env.AI_API_KEY` 读取 API Key；
- 从 `process.env.AI_API_BASE_URL` 读取 Base URL；
- 从 `process.env.AI_MODEL` 读取模型名称；
- 从 `process.env.AI_PROVIDER` 读取协议类型（`openai` / `anthropic-compatible`）；
- 统一处理错误；
- 统一设置 timeout；
- 不在日志中输出 API Key；
- 同时兼容 OpenAI 兼容与 Anthropic 兼容两种协议。

### 22.3 Prompt 管理

后端需要在 `server/prompts.ts` 中集中管理 Prompt。

不要把长 Prompt 分散写在路由里。

### 22.4 类型管理

前后端共用的类型放在：

```text
src/types/index.ts
```

要求：

- 类型清晰；
- 字段命名稳定；
- 前端展示字段与后端返回字段一致。

---

## 23. 常用命令

安装依赖：

```bash
npm install
```

启动前端：

```bash
npm run dev
```

启动后端：

```bash
npm run server
```

同时启动前后端：

```bash
npm run dev:all
```

构建检查：

```bash
npm run build
```

预览构建结果：

```bash
npm run preview
```

如果当前 package.json 没有这些命令，需要补充。

建议使用 concurrently 同时启动前后端：

```bash
npm install concurrently -D
```

package.json scripts 建议：

```json
{
  "scripts": {
    "dev": "vite",
    "server": "tsx server/index.ts",
    "dev:all": "concurrently \"npm run server\" \"npm run dev\"",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

---

## 24. .env.example 要求

必须创建 `.env.example`，内容如下（OpenAI 兼容示例）：

```bash
AI_API_KEY=your_api_key_here
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
SERVER_PORT=3001
```

智谱 BigModel（Anthropic 兼容）示例：

```bash
AI_API_KEY=your_api_key_here
AI_API_BASE_URL=https://open.bigmodel.cn/api/anthropic
AI_MODEL=glm-5.2
AI_PROVIDER=anthropic-compatible
SERVER_PORT=3001
```

`.env.example` 可以提交到 Git。

`.env` 和 `.env.local` 不允许提交。

---

## 25. .gitignore 要求

必须确保 `.gitignore` 包含：

```gitignore
node_modules
dist
.env
.env.local
.DS_Store
```

---

## 26. 禁止事项

严禁：

1. 使用 Mock 数据冒充真实 AI 输出；
2. API 调用失败后展示假数据；
3. 编造用户不存在的实习、项目、数据、奖项、证书、职位或成果；
4. 把“参与”写成“负责/主导”，除非用户信息能够证明；
5. 把没有证据的能力写成确定事实；
6. 输出用户无法在面试中解释清楚的内容；
7. 把产品做成普通简历润色工具；
8. 把产品做成花哨营销页；
9. 使用过度渐变、卡通风、游戏化风格；
10. 在前端暴露 API Key；
11. 在代码中硬编码 API Key；
12. 在 CLAUDE.md 中写入 API Key；
13. 在 README 中写入 API Key；
14. 忽略 TypeScript 构建错误；
15. 忽略后端 API 错误；
16. 忽略 JSON 解析失败；
17. 在没有真实 API 返回时伪造成功状态；
18. 用社招标准机械评价应届生，或要求应届生具备多年正式工作成果 / 管理经验。

---

## 27. 阶段性验收标准

每完成一个阶段，需要检查：

1. 是否符合「应届生校招 / 实习求职 JD 定制简历优化 Agent」定位；
2. 是否接入真实 API；
3. 是否完全移除 Mock 数据逻辑；
4. 是否覆盖 9 个核心输出模块；
5. 是否实现 5 项增强功能（岗位适配度判断、JD 硬门槛/软门槛识别、经历可转化分析增强版、简历无回应诊断、技能缺口与补强路径）；
6. 增强功能是否挂载在 /api/analyze-initial 输出中，且未破坏原有 5 个字段；
7. 新增模块是否都有空状态处理（空数组显示"暂无足够信息生成该项分析"，不报错白屏）；
8. Markdown 导出是否为 15 模块顺序、空字段是否省略或显示"暂无足够信息"；
9. 模拟面试第一阶段是否完成文档/类型/Prompt/Schema/校验/后端接口（/api/evaluate-interview-answer）；
10. 模拟面试题库是否在 /api/optimize-resume 输出中生成、是否覆盖 5 类题型且与 JD/简历强相关；
11. 模拟面试点评是否真实调用 AI、是否生成 interviewReport、是否不编造经历；
12. 模拟面试输入校验是否覆盖未选问题/未填回答/缺少上下文；
13. 模拟面试前端是否有题库/作答/点评/报告四区域，是否有空状态/Loading/失败/JSON 失败/输入缺失提示；
14. 模拟面试是否能提交回答并生成点评与最终面试报告，且不使用 Mock；
15. Markdown 导出是否包含模拟面试题库与报告（15 模块顺序）；
16. 是否存在按钮不可点击；
17. 是否存在页面无反馈；
18. 是否存在流程断点；
19. 是否存在 TypeScript 报错；
20. 是否可以成功运行 npm run build；
21. 是否可以成功启动后端服务；
22. 是否可以成功调用真实 AI API；
23. 是否正确处理 API 调用失败；
24. 是否正确处理 JSON 解析失败；
25. 是否符合 Linear / Notion / Lark / Raycast 的克制专业风格；
26. 是否适合课堂展示；
27. 是否没有编造经历、数据或成果；
28. 是否没有把"参与"改写成"负责/主导"；
29. 是否没有泄露 API Key。

---

## 28. 当前最优开发顺序

请按照以下顺序开发：

1. 初始化 Vite + React + TypeScript + Tailwind CSS 项目；
2. 配置 Tailwind CSS；
3. 创建 Express 后端服务；
4. 配置 `.env.example` 和 `.gitignore`；
5. 封装后端 AI Client（支持 OpenAI 与 Anthropic 兼容协议）；
6. 编写 Prompt 模板；
7. 定义前后端类型；
8. 实现 `/api/analyze-initial`；
9. 实现 `/api/optimize-resume`；
10. 实现前端 API 请求层；
11. 搭建顶部导航栏、左侧流程导航、右侧主工作区；
12. 实现输入材料页面（应届生字段）；
13. 接入真实 API 调用；
14. 实现校招 JD 解析展示；
15. 实现应届生简历诊断展示（11 维度）；
16. 实现 JD-经历证据匹配表展示；
17. 实现经历补充追问页面；
18. 实现用户补充回答输入；
19. 实现校招简历优化策略展示（含经历可转化分析）；
20. 实现修改前后对照表；
21. 实现最终校招简历展示；
22. 实现面试追问风险展示；
23. 实现进一步补强建议；
24. 实现岗位适配度判断展示（简历诊断模块顶部）；
25. 实现 JD 硬门槛/软门槛拆解表（JD 解析模块）；
26. 升级经历可转化分析展示（增强版字段）；
27. 实现简历无回应诊断展示（简历诊断模块后半）；
28. 实现技能缺口与补强路径展示（补强建议区域）；
29. 新增可选投递情况输入区域；
30. 实现 Markdown 导出（15 模块顺序，含模拟面试题库与报告）；
31. 模拟面试第一阶段：新增类型、Prompt、Schema、校验；
32. 实现 /api/optimize-resume 输出 mockInterviewPlan；
33. 实现 /api/evaluate-interview-answer 接口（真实 AI 点评 + 面试报告）；
34. 模拟面试第二阶段：新增 MockInterview 前端组件（题库/作答/点评/报告四区域）；
35. 新增 evaluateInterviewAnswer 前端 API 请求函数；
36. 流程导航新增「模拟面试」步骤（面试追问与补强建议之后）；
37. 统一 UI 风格；
38. 运行 npm run build 并修复错误；
39. 启动 npm run dev:all 测试完整流程。

---

## 29. Claude Code 工作要求

开发过程中：

1. 每次修改前先理解现有代码结构；
2. 不要重复创建项目目录；
3. 如果当前目录为空，直接在当前目录初始化项目；
4. 不要在当前目录下再套一层同名文件夹；
5. 每次实现功能后检查是否破坏已有功能；
6. 每次阶段性完成后运行 npm run build；
7. 构建失败必须修复；
8. 后端启动失败必须修复；
9. API 调用失败必须显示明确错误；
10. UI 不符合风格要求时必须主动调整；
11. 对不确定的工程选择，优先采用简单、稳定、适合 Demo 的方案；
12. 不要为了炫技引入复杂依赖；
13. 不要用 Mock 数据绕过真实 API；
14. 不要在前端暴露 API Key。
