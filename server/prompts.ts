// Prompt 模板（应届生校招 / 实习求职版本）。
// 所有 Prompt 集中在此维护，不分散写到各路由。

import type { AnalyzeInitialRequest, OptimizeResumeRequest, EvaluateInterviewAnswerRequest } from '../src/types/index'
import { initialResponseSchemaText, optimizeResponseSchemaText, evaluateInterviewAnswerSchemaText } from './schemas'

// ---------- 系统提示词 ----------

export const SYSTEM_PROMPT = `你是一名资深职业发展顾问、校招 HRBP、企业招聘经理和应届生简历优化专家，熟悉校招、实习招聘、应届生简历筛选、校园招聘面试和管培生选拔。你了解互联网、AI、产品、运营、数据、研发、设计、解决方案等方向校招岗位的真实用人标准。

你的任务是基于目标校招岗位 JD，帮助应届生 / 在校生 / 实习求职者解析岗位要求、诊断简历短板、挖掘实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作、个人作品和技能证书中的能力证据，并重构成校招 HR 和业务面试官认可的简历表达，提高简历通过率和面试邀约率。

你必须遵守以下规则：

1. 只能基于用户提供的信息进行分析和改写。
2. 绝不能编造用户不存在的实习、项目、数据、奖项、证书、职位或成果。
3. 不要把"参与"改写成"负责"或"主导"，除非用户材料能证明其确实负责/主导。
4. 没有数据时，不要编造数据。
5. 对不确定内容必须标注【待确认】或【需要补充】。
6. 必须用校招标准评价应届生：不能用社招标准机械评价，不能要求用户具备多年正式工作成果或管理经验；要从实习、课程、科研、竞赛、社团、校园工作、个人项目和技能证书中提炼可证明的岗位能力证据。
7. 如果简历与目标校招岗位不匹配，必须直接指出，并给出应届生可执行的补强方向（如补一段相关实习、做一个对口项目、考取某项证书等）。
8. 如果某些表达容易被面试官追问/质疑，必须指出风险。
9. 输出要专业、直接、严格、具体、可执行；不要空泛鼓励，不要讲大道理。
10. 必须严格按照指定 JSON Schema 返回结果；只输出合法 JSON 对象，不要 Markdown 或解释性文字。`

/** 所有结构化接口共用的 JSON 输出约束，降低截断与非法 JSON 概率。 */
export const JSON_OUTPUT_RULES = `【JSON 输出硬性约束】
1. 只输出一个合法 JSON 对象，不要 Markdown，不要代码块（不要 \`\`\`），不要前后解释。
2. 字段名必须与 Schema 完全一致，顶层字段一个都不能缺。
3. 枚举值必须使用 Schema 中的中文取值，不要自创同义词。
4. 数组字段必须是 JSON 数组；布尔必须是 true/false；数字必须是 number。
5. 为避免输出被截断：每条文本尽量短（1-2 句）；匹配表 5-8 条；追问 5-8 条；门槛拆解 5-10 条；经历可转化只覆盖用户真实提供的类别；改写对照 4-8 条；模拟面试题固定 8 道。
6. 不要编造用户不存在的实习、项目、数据、奖项、证书或成果。`

// ---------- 初始分析用户提示词 ----------

export function buildInitialPrompt(input: AnalyzeInitialRequest): string {
  const fill = (v?: string) => (v && v.trim() ? v.trim() : '（未提供）')
  const ds = input.deliverySituation
  const deliveryBlock = ds
    ? `已投递数量：${ds.appliedCount ?? '（未提供）'}
收到回复数量：${ds.replyCount ?? '（未提供）'}
主要投递岗位方向：${fill(ds.targetRoles)}
主要投递平台：${fill(ds.platforms)}
常见 JD 类型：${fill(ds.commonJDTypes)}
目前最困扰的问题：${fill(ds.mainProblem)}`
    : '（用户未提供投递情况）'
  return `请基于以下用户输入，完成校招 JD 解析、应届生简历诊断、JD-经历证据匹配、经历补充追问、校招简历优化策略、经历可转化分析、岗位适配度判断、JD 硬门槛/软门槛识别、简历无回应诊断和技能缺口与补强路径。

输入信息：

1. 目标岗位：
${fill(input.targetRole)}

2. 目标行业：
${fill(input.targetIndustry)}

3. 目标公司类型：
${fill(input.targetCompanyType)}

4. 投递场景：
${fill(input.targetApplicationScenario)}

5. 毕业阶段：
${fill(input.graduationStage)}

6. 学历：
${fill(input.educationLevel)}

7. 专业：
${fill(input.major)}

8. 希望简历突出：
${fill(input.highlightAbilities)}

9. 目标校招岗位 JD：
${fill(input.jdText)}

10. 用户原始简历：
${fill(input.resumeText)}

11. 实习经历：
${fill(input.internshipExperience)}

12. 项目/课程项目经历：
${fill(input.projectExperience)}

13. 科研经历：
${fill(input.researchExperience)}

14. 竞赛经历：
${fill(input.competitionExperience)}

15. 社团 / 校园工作经历：
${fill(input.campusExperience)}

16. 技能与证书：
${fill(input.skillsAndCertificates)}

17. 有数据结果的经历：
${fill(input.measurableResults)}

18. 不希望被夸大的地方：
${fill(input.avoidExaggeration)}

19. 简历目标长度：
${fill(input.resumeLength)}

20. 投递情况：
${deliveryBlock}

${JSON_OUTPUT_RULES}

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
- 匹配表使用"JD 要求 - 我简历/经历中已有证据 - 证据强度 - 是否需要补充 - 优化建议"的结构；证据强度只能是：强、中、弱、无；某项 JD 要求没有对应经历时必须明确指出，不要编造。匹配表控制在 5-8 条。
- 追问必须提出 5-8 个面向应届生的最关键问题（围绕实习、课程项目、科研、竞赛、社团、校园工作中的证据补充），不能泛泛地问"还有什么补充吗"。
- 校招简历优化策略需说明应届生求职定位、应前置的经历、应弱化或删除的内容、应嵌入的关键词、代表项目/经历、整体风格。
- 经历可转化分析：只分析用户实际提供的经历类别（实习经历、课程项目、科研经历、竞赛经历、社团经历、校园工作、个人作品、技能证书、其他），用户未提供的类别省略，不要编造。逐项分析：它是什么、能转化成哪些岗位能力、适合哪些岗位或场景、适合放在简历哪里、证据强度（强/中/弱/无）、改写潜力（高/中/低）、缺失哪些信息、面试风险、改写方向（只给方向，不编造最终成果）。每项文字尽量短。
- 岗位适配度判断（roleFitAssessment）：回答"这个岗位我是否值得投"。fitScore 为 0-100 校招语境相对匹配分；fitLevel 只能是强匹配 / 可尝试 / 勉强匹配 / 不建议主投。hardBlockers 没有则返回 []；softGaps / bestEvidence / riskWarnings / recommendedAction 均需给出。
- JD 硬门槛/软门槛识别（jdRequirementLevels）：requirement 必须来自目标 JD 真实要求；level / userStatus 使用约定枚举；currentEvidence 没有证据时写"暂无明确证据"；条目控制在 5-10 条。
- 简历无回应诊断（noReplyDiagnosis）：hasDeliveryContext 标记是否提供了投递情况；未提供时 summary 必须说明判断依据有限；likelyReasons 2-5 条；topThreeFixes 仅 3 项；nextSevenDayActionPlan 给出具体 7 天行动。
- 技能缺口与补强路径（skillGapPlan）：missingSkills 基于 JD 与简历判断，控制在 3-6 项；targetLevel 写应届生可执行水平，不要写"精通"；learningSourceTypes 只输出来源类型，不要编造广告链接；sevenDayPlan / thirtyDayPlan 必须具体。

${initialResponseSchemaText}`
}

// ---------- 深度优化用户提示词 ----------

export function buildOptimizePrompt(req: OptimizeResumeRequest): string {
  const { originalInput, initialAnalysis, followUpAnswers } = req
  const answers =
    followUpAnswers && followUpAnswers.trim()
      ? followUpAnswers.trim()
      : '（用户未补充回答，请基于现有信息做保守优化，并对不确定内容标注【需要补充】或【待确认】）'

  return `请基于用户原始输入、初始分析结果、用户补充回答、最终校招简历和面试风险点，完成简历逐段优化、最终校招简历、最终简历二次适配度评估、面试追问风险、进一步补强建议和模拟面试题库。

你必须遵守：

1. 每段经历尽量使用"动作 + 对象 + 方法 + 结果"的结构。
2. 避免空话，例如"认真负责""沟通能力强""学习能力强""提升用户体验"。
3. 尽量使用具体业务对象、方法、产出和结果；应届生可用课程成果、实习产出、竞赛成绩、科研结论等作为结果。
4. 没有数据时，不要编造数据；可用"完成 XX 课题""产出 XX 原型""覆盖 XX 个用例"等保守表达。
5. 如果原文信息不足，请用【待补充】标记。
6. 不要把"参与"弱化或改写成"负责/主导"，除非原文能证明用户确实负责/主导。
7. 不要写用户无法在面试中解释清楚的内容。
8. 如果使用了用户未确认的信息，必须标注【待确认】或【需要补充】。
9. 用校招标准评价和改写，不要要求应届生具备多年正式工作成果或管理经验。
10. 模拟面试题库（mockInterviewPlan）必须基于目标校招 JD、用户简历、最终简历与面试风险点生成；题目必须与 JD 和简历强相关；必须能帮助用户识别"简历写得出来但面试讲不清楚"的风险；不要生成泛泛问题（如"请介绍一下你自己"除非能结合岗位定位给出具体考察点）；answerFramework 只提供回答框架，不要替用户编造具体经历。
11. finalAssessment 必须基于你生成的 finalResume 再测一遍岗位适配度判断得分和匹配度评分。评分必须对照原始目标 JD 与用户真实材料，不能因为改写得更流畅就虚高；只有关键词覆盖、证据前置、表达清晰度和可证明性确实增强时才提高分数。若最终简历仍缺少硬门槛证据，hardBlockers / softGaps / riskWarnings 必须保留，不能被改写掩盖。

【用户原始输入】
目标岗位：${originalInput.targetRole}
目标行业：${originalInput.targetIndustry}
目标公司类型：${originalInput.targetCompanyType}
投递场景：${originalInput.targetApplicationScenario}
毕业阶段：${originalInput.graduationStage}
学历：${originalInput.educationLevel}
专业：${originalInput.major}
希望突出：${originalInput.highlightAbilities}

目标校招岗位 JD：
${originalInput.jdText}

用户原始简历：
${originalInput.resumeText}

实习经历：${originalInput.internshipExperience || '（未提供）'}
项目/课程项目经历：${originalInput.projectExperience || '（未提供）'}
科研经历：${originalInput.researchExperience || '（未提供）'}
竞赛经历：${originalInput.competitionExperience || '（未提供）'}
社团/校园工作经历：${originalInput.campusExperience || '（未提供）'}
技能与证书：${originalInput.skillsAndCertificates || '（未提供）'}
有数据结果的经历：${originalInput.measurableResults || '（未提供）'}
不希望被夸大的地方：${originalInput.avoidExaggeration || '（未提供）'}
简历目标长度：${originalInput.resumeLength || '（未提供）'}

【初始分析结果（JSON）】
${JSON.stringify(initialAnalysis)}

【用户补充回答】
${answers}

${JSON_OUTPUT_RULES}

需要输出：

1. rewriteComparison
2. finalResume
3. finalAssessment
4. interviewRisks
5. furtherSuggestions
6. mockInterviewPlan

finalAssessment 要求：
- roleFitAssessment：回答"最终简历用于投这个岗位是否值得投"，fitScore 为 0-100，fitLevel 只能是强匹配 / 可尝试 / 勉强匹配 / 不建议主投；字段结构与初始分析的 roleFitAssessment 一致，但必须基于 finalResume 重新判断。
- matchScore：最终简历相对目标 JD 的岗位匹配度评分，0-100。
- scoreReasons：列出最终匹配度评分的关键依据和扣分原因，必须说明最终简历中的真实证据，不要编造。
- scoreChangeSummary：对比初始分析中的 roleFitAssessment.fitScore=${initialAnalysis.roleFitAssessment.fitScore} 和 resumeDiagnosis.matchScore=${initialAnalysis.resumeDiagnosis.matchScore}，说明最终简历评分变化的原因；如果变化不大，直接说明仍受哪些真实证据缺口限制。

rewriteComparison 控制在 4-8 条；interviewRisks 控制在 3-6 条。
mockInterviewPlan 固定生成 8 道题：HR 面试 2、业务面试 2、项目深挖 2、技能追问 1、压力追问 1。每道题必须包含 id / type / difficulty / question / relatedResumeEvidence / relatedJDRequirement / whyAsked / evaluationFocus / answerFramework / riskWarning；answerFramework 只给框架，不编造经历。priorityQuestions 与 preparationAdvice 各 2-4 条即可。

${optimizeResponseSchemaText}`
}

// ---------- 模拟面试回答点评 Prompt ----------

export function buildEvaluateInterviewAnswerPrompt(req: EvaluateInterviewAnswerRequest): string {
  const { originalInput, initialAnalysis, optimizedResult, question, userAnswer } = req
  const optimizedBlock = optimizedResult
    ? `【优化后简历与面试风险（JSON）】
${JSON.stringify({
    finalResume: optimizedResult.finalResume,
    interviewRisks: optimizedResult.interviewRisks,
    furtherSuggestions: optimizedResult.furtherSuggestions
  })}`
    : '（用户未提供优化后简历，请基于初始分析结果点评）'

  return `请基于目标校招 JD、用户原始简历、初始分析结果、优化后简历与面试风险点，对用户的一道模拟面试回答进行点评，并生成本次模拟面试的结构化面试报告。

你必须遵守：

1. 用校招面试标准评价应届生，不要用社招标准要求多年正式工作成果或管理经验。
2. 只能基于用户提供的回答、简历与经历材料进行点评和改写。
3. 绝不能编造用户不存在的实习、项目、数据、奖项、证书、职位或成果。
4. 不要把"参与"改写成"负责/主导"，除非用户材料能证明。
5. improvedAnswer 必须严格基于用户已有回答和简历材料改写，不得新增不存在的数据、项目、岗位、奖项或成果；信息不足必须标注【待补充】或【待确认】。
6. 必须指出回答中的证据缺口、逻辑问题、可信度风险和可改进表达。
7. score 与 interviewReport.overallScore 均为 0-100，基于校招面试标准评分。
8. interviewReport 必须总结本次回答的整体表现、岗位匹配表达、回答结构、证据质量、可信度风险、核心优势、主要短板、高风险点、优先改进项和下一步练习计划。

【用户原始输入】
目标岗位：${originalInput.targetRole}（${originalInput.targetIndustry} / ${originalInput.targetCompanyType} / ${originalInput.targetApplicationScenario}）
毕业阶段：${originalInput.graduationStage} · 学历：${originalInput.educationLevel} · 专业：${originalInput.major}

目标校招岗位 JD：
${originalInput.jdText}

用户原始简历：
${originalInput.resumeText}

实习经历：${originalInput.internshipExperience || '（未提供）'}
项目/课程项目经历：${originalInput.projectExperience || '（未提供）'}
科研经历：${originalInput.researchExperience || '（未提供）'}
竞赛经历：${originalInput.competitionExperience || '（未提供）'}
社团/校园工作经历：${originalInput.campusExperience || '（未提供）'}
技能与证书：${originalInput.skillsAndCertificates || '（未提供）'}

【初始分析结果（JSON）】
${JSON.stringify({
    roleFitAssessment: initialAnalysis.roleFitAssessment,
    resumeDiagnosis: initialAnalysis.resumeDiagnosis,
    jdRequirementLevels: initialAnalysis.jdRequirementLevels
  })}

${optimizedBlock}

【本次模拟面试题】
题目 id：${question.id}
题目类型：${question.type}（难度：${question.difficulty}）
题目：${question.question}
为什么会被问：${question.whyAsked}
对应简历证据：${question.relatedResumeEvidence}
对应 JD 要求：${question.relatedJDRequirement}
面试官重点考察：${question.evaluationFocus.join('、')}
建议回答框架：${question.answerFramework}
回答风险：${question.riskWarning}

【用户回答】
${userAnswer}

${JSON_OUTPUT_RULES}

followUpQuestions 控制在 2-4 条；strengths / problems / missingEvidence 等列表各 2-5 条即可，文字精简。

${evaluateInterviewAnswerSchemaText}`
}
