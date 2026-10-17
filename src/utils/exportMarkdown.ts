// Markdown 导出（应届生校招 / 实习求职版本）。
// 在前端本地按 16 个模块顺序拼接，并触发浏览器下载。空数组显示"暂无足够信息"，不导出 undefined/null。

import type {
  AnalyzeInitialRequest,
  AnalyzeInitialResponse,
  OptimizeResumeResponse,
  EvaluateInterviewAnswerResponse,
  InterviewQuestionType
} from '../types'

function line(s = ''): string {
  return s + '\n'
}

function list(items: string[] = []): string {
  if (items.length === 0) return '暂无\n'
  return items.map((i) => `- ${i}`).join('\n') + '\n'
}

function table(header: string[], rows: string[][]): string {
  const sep = header.map(() => '---').join(' | ')
  const head = `| ${header.join(' | ')} |`
  const body = rows.map((r) => `| ${r.join(' | ')} |`).join('\n')
  return `${head}\n| ${sep} |\n${body}\n`
}

function joinNonEmpty(arr: string[], sep = '；'): string {
  return arr.length === 0 ? '暂无' : arr.join(sep)
}

export function buildMarkdown(
  input: AnalyzeInitialRequest,
  initial: AnalyzeInitialResponse,
  optimize: OptimizeResumeResponse,
  mockEvaluations?: Record<string, EvaluateInterviewAnswerResponse> | null
): string {
  const md: string[] = []
  md.push(line('# 应届生校招简历优化报告'))
  md.push(line(`> 目标岗位：${input.targetRole} · ${input.targetIndustry} · ${input.targetCompanyType} · 投递场景：${input.targetApplicationScenario}`))
  md.push(line(`> 毕业阶段：${input.graduationStage} · 学历：${input.educationLevel} · 专业：${input.major}`))
  md.push(line('---'))

  // 1. 校招 JD 解析表
  md.push(line('## 1. 校招 JD 解析表'))
  md.push(line('**岗位核心职责**'))
  md.push(list(initial.jdAnalysis.coreResponsibilities))
  md.push(line('**岗位硬性要求**'))
  md.push(list(initial.jdAnalysis.hardRequirements))
  md.push(line('**岗位隐性要求**'))
  md.push(list(initial.jdAnalysis.hiddenRequirements))
  md.push(line('**高频关键词**'))
  md.push(list(initial.jdAnalysis.keywords))
  md.push(line('**校招招聘方想找的应届生画像**'))
  md.push(line(initial.jdAnalysis.idealCandidate))
  md.push(line('**这个岗位最看重的 5 项能力**'))
  md.push(list(initial.jdAnalysis.topFiveAbilities))
  md.push(line('---'))

  // 2. JD 硬门槛 / 软门槛识别
  md.push(line('## 2. JD 硬门槛 / 软门槛识别'))
  if (initial.jdRequirementLevels.length === 0) {
    md.push(line('暂无足够信息生成该项分析'))
  } else {
    md.push(line(table(
      ['JD 要求', '门槛类型', '当前状态', '已有证据', '弥补方式', '简历嵌入建议'],
      initial.jdRequirementLevels.map((r) => [
        r.requirement + (r.sourceText ? `（原文：${r.sourceText}）` : ''),
        r.level, r.userStatus, r.currentEvidence, r.howToCompensate, r.resumeEmbeddingSuggestion
      ])
    )))
  }
  md.push(line('---'))

  // 3. 岗位适配度判断
  const rf = initial.roleFitAssessment
  md.push(line('## 3. 岗位适配度判断'))
  md.push(line(`**适配等级**：${rf.fitLevel}（校招相对匹配分 ${rf.fitScore} / 100）`))
  md.push(line(`**核心判断**：${rf.summary}`))
  md.push(line('**判断依据**'))
  md.push(list(rf.reasons))
  md.push(line('**关键优势证据**'))
  md.push(list(rf.bestEvidence))
  md.push(line('**硬阻碍**'))
  md.push(list(rf.hardBlockers))
  md.push(line('**软短板**'))
  md.push(list(rf.softGaps))
  md.push(line('**投递风险**'))
  md.push(list(rf.riskWarnings))
  md.push(line(`**建议动作**：${rf.recommendedAction}`))
  md.push(line('---'))

  // 4. 应届生简历诊断报告
  const d = initial.resumeDiagnosis
  md.push(line('## 4. 应届生简历诊断报告'))
  md.push(line(`**校招匹配度评分**：${d.matchScore} / 100`))
  md.push(line('**扣分原因**'))
  md.push(list(d.scoreReasons))
  md.push(line('**维度诊断**'))
  md.push(list([
    `教育背景匹配度：${d.dimensions.educationMatch}`,
    `专业与岗位相关性：${d.dimensions.majorRelevance}`,
    `实习经历质量：${d.dimensions.internshipQuality}`,
    `项目经历质量：${d.dimensions.projectQuality}`,
    `科研/竞赛/社团经历可转化程度：${d.dimensions.transferableExperience}`,
    `技能工具匹配度：${d.dimensions.skillsMatch}`,
    `成果量化程度：${d.dimensions.resultsQuantification}`,
    `关键词覆盖度：${d.dimensions.keywordCoverage}`,
    `应届生差异化亮点：${d.dimensions.differentiation}`,
    `可信度与面试追问风险：${d.dimensions.credibilityRisk}`,
    `优先补强方向：${d.dimensions.priorityFixes}`
  ]))
  md.push(line('**优势**'))
  md.push(list(d.strengths))
  md.push(line('**问题**'))
  md.push(list(d.problems))
  md.push(line('**优先补强项**'))
  md.push(list(d.priorityFixes))
  md.push(line('---'))

  // 5. 简历无回应诊断
  const nr = initial.noReplyDiagnosis
  md.push(line('## 5. 简历无回应诊断'))
  md.push(line(`**是否结合投递情况**：${nr.hasDeliveryContext ? '是' : '否（仅基于简历与 JD 做一般性诊断，判断依据有限）'}`))
  md.push(line(`**诊断概要**：${nr.summary}`))
  if (nr.likelyReasons.length === 0) {
    md.push(line('暂无足够信息生成该项分析'))
  } else {
    md.push(line(table(
      ['可能原因', '概率', '依据', '修复建议'],
      nr.likelyReasons.map((r) => [r.reason, r.probability, r.evidence, r.fixSuggestion])
    )))
  }
  md.push(line('**三项优先修复**'))
  md.push(list(nr.topThreeFixes))
  md.push(line('**7 天行动计划**'))
  md.push(list(nr.nextSevenDayActionPlan))
  md.push(line('---'))

  // 6. JD-经历证据匹配表
  md.push(line('## 6. JD-经历证据匹配表'))
  md.push(line(table(
    ['JD 要求', '简历/经历中已有证据', '证据强度', '是否需要补充', '优化建议'],
    initial.matchTable.map((m) => [
      m.jdRequirement, m.resumeEvidence, m.evidenceStrength,
      m.needSupplement ? '是' : '否', m.optimizationSuggestion
    ])
  )))
  md.push(line('---'))

  // 7. 经历补充追问清单
  md.push(line('## 7. 经历补充追问清单'))
  md.push(line(table(
    ['追问方向', '追问问题', '为什么问'],
    initial.followUpQuestions.map((q) => [q.direction, q.question, q.reason])
  )))
  md.push(line('---'))

  // 8. 校招简历优化策略
  const s = initial.resumeStrategy
  md.push(line('## 8. 校招简历优化策略'))
  md.push(line(`**应届生求职定位**：${s.positioning}`))
  md.push(line(`**整体风格**：${s.resumeStyle}`))
  md.push(line('**应前置的经历**'))
  md.push(list(s.experiencesToMoveForward))
  md.push(line('**应弱化或删除的内容**'))
  md.push(list(s.contentToWeakenOrDelete))
  md.push(line('**应嵌入的关键词**'))
  md.push(list(s.keywordsToEmbed))
  md.push(line('**代表项目 / 经历**'))
  md.push(list(s.representativeProjects))
  md.push(line('---'))

  // 9. 经历可转化分析
  md.push(line('## 9. 经历可转化分析'))
  if (initial.experienceTransferability.length === 0) {
    md.push(line('暂无足够信息生成该项分析'))
  } else {
    for (const it of initial.experienceTransferability) {
      md.push(line(`### ${it.category}（证据强度：${it.evidenceStrength} · 改写潜力：${it.rewritePotential}）`))
      md.push(line(`**经历描述**：${it.description}`))
      md.push(line('**可转化能力**'))
      md.push(list(it.transferableAbilities))
      md.push(line(`**适合岗位/场景**：${joinNonEmpty(it.suitableRolesOrScenarios, '、')}`))
      md.push(line(`**简历放置**：${it.resumePlacement}`))
      md.push(line('**缺失信息**'))
      md.push(list(it.missingDetails))
      md.push(line('**面试风险**'))
      md.push(list(it.interviewRisks))
      md.push(line(`**改写方向**：${it.suggestedRewriteDirection}`))
    }
  }
  md.push(line('---'))

  // 10. 技能缺口与补强路径
  const sg = initial.skillGapPlan
  md.push(line('## 10. 技能缺口与补强路径'))
  md.push(line(`**目标岗位**：${sg.targetRole}`))
  md.push(line(`**概要**：${sg.summary}`))
  if (sg.missingSkills.length === 0) {
    md.push(line('暂无足够信息生成该项分析'))
  } else {
    md.push(line(table(
      ['技能', '重要性', '当前证据', '目标水平', '学习来源', '练习项目', '简历嵌入', '难度', '优先级'],
      sg.missingSkills.map((m) => [
        m.skill, m.importance, m.currentEvidence, m.targetLevel,
        m.learningSourceTypes.join('、'), m.practiceProject, m.resumeEmbeddingSuggestion,
        m.estimatedDifficulty, m.priority
      ])
    )))
  }
  md.push(line('**7 天计划**'))
  md.push(list(sg.sevenDayPlan))
  md.push(line('**30 天计划**'))
  md.push(list(sg.thirtyDayPlan))
  md.push(line('---'))

  // 11. 修改前后对照表
  md.push(line('## 11. 修改前后对照表'))
  md.push(line(table(
    ['修改前', '修改后', '修改理由', '需确认'],
    optimize.rewriteComparison.map((r) => [
      r.before, r.after, r.reason, r.needsConfirmation ? '是' : '否'
    ])
  )))
  md.push(line('---'))

  // 12. 最终校招简历
  const fr = optimize.finalResume
  md.push(line('## 12. 最终校招简历'))
  if (fr.personalInfo) { md.push(line('**个人信息**')); md.push(line(fr.personalInfo)) }
  md.push(line('**求职意向**')); md.push(line(fr.jobIntention))
  md.push(line('**个人简介**')); md.push(line(fr.professionalSummary))
  md.push(line('**核心能力**')); md.push(list(fr.coreAbilities))
  md.push(line('**实习 / 工作经历**')); md.push(list(fr.workExperience))
  md.push(line('**项目经历**')); md.push(list(fr.projectExperience))
  md.push(line('**技能与证书**')); md.push(list(fr.skillsAndTools))
  md.push(line('**教育背景**')); md.push(line(fr.education))
  if (fr.additionalItems?.length) { md.push(line('**其他加分项**')); md.push(list(fr.additionalItems)) }
  md.push(line('---'))

  // 13. 最终简历二次适配度评估
  const fa = optimize.finalAssessment
  const finalFit = fa.roleFitAssessment
  md.push(line('## 13. 最终简历二次适配度评估'))
  md.push(line(`**岗位适配度**：${finalFit.fitLevel}（最终适配分 ${finalFit.fitScore} / 100，初始 ${initial.roleFitAssessment.fitScore} / 100）`))
  md.push(line(`**岗位匹配度评分**：${fa.matchScore} / 100（初始 ${initial.resumeDiagnosis.matchScore} / 100）`))
  md.push(line(`**核心判断**：${finalFit.summary}`))
  md.push(line(`**分数变化说明**：${fa.scoreChangeSummary}`))
  md.push(line('**最终匹配度评分依据**'))
  md.push(list(fa.scoreReasons))
  md.push(line('**最终简历中的关键优势证据**'))
  md.push(list(finalFit.bestEvidence))
  md.push(line('**仍存在的硬阻碍**'))
  md.push(list(finalFit.hardBlockers))
  md.push(line('**仍可补强的软短板**'))
  md.push(list(finalFit.softGaps))
  md.push(line('**投递风险**'))
  md.push(list(finalFit.riskWarnings))
  md.push(line(`**建议动作**：${finalFit.recommendedAction}`))
  md.push(line('---'))

  // 14. 面试追问与补强建议
  md.push(line('## 14. 面试追问与补强建议'))
  md.push(line('**面试追问风险**'))
  md.push(line(table(
    ['可能追问的问题', '风险原因', '需要准备的证据', '建议回答'],
    optimize.interviewRisks.map((r) => [r.question, r.riskReason, r.evidenceNeeded, r.suggestedAnswer])
  )))
  const fs = optimize.furtherSuggestions
  md.push(line('**还应补充的实习 / 项目 / 竞赛**'))
  md.push(list(fs.projectsToAdd))
  md.push(line(`**是否需要作品集**：${fs.portfolioNeeded ? '是' : '否'}`))
  if (fs.portfolioNeeded) { md.push(line('**作品集应包含**')); md.push(list(fs.portfolioContent)) }
  md.push(line('**还可生成的简历版本**'))
  md.push(list(fs.resumeVersions))
  md.push(line(`**是否需要针对不同岗位生成不同版本**：${fs.roleSpecificVersionsNeeded ? '是' : '否'}`))
  md.push(line('---'))

  // 15. 模拟面试题库
  md.push(line('## 15. 模拟面试题库'))
  const plan = optimize.mockInterviewPlan
  if (!plan || plan.questions.length === 0) {
    md.push(line('暂无足够信息生成模拟面试题库'))
  } else {
    md.push(line(`**面试定位**：${plan.interviewPositioning}`))
    if (plan.priorityQuestions.length > 0) {
      md.push(line('**建议优先练习**'))
      md.push(list(plan.priorityQuestions))
    }
    if (plan.preparationAdvice.length > 0) {
      md.push(line('**备考建议**'))
      md.push(list(plan.preparationAdvice))
    }
    const TYPE_ORDER: InterviewQuestionType[] = ['HR面试', '业务面试', '项目深挖', '技能追问', '压力追问']
    let qi = 0
    for (const t of TYPE_ORDER) {
      const qs = plan.questions.filter((q) => q.type === t)
      if (qs.length === 0) continue
      md.push(line(`### ${t}`))
      md.push(line(table(
        ['题号', '难度', '问题', '考察重点', '相关 JD 要求', '相关简历证据', '回答框架', '风险提示'],
        qs.map((q) => [
          `Q${++qi}`,
          q.difficulty,
          q.question,
          q.evaluationFocus.join('、'),
          q.relatedJDRequirement,
          q.relatedResumeEvidence,
          q.answerFramework,
          q.riskWarning
        ])
      )))
    }
  }
  md.push(line('---'))

  // 16. 模拟面试报告（按已点评题目逐题输出点评与最终面试报告）
  md.push(line('## 16. 模拟面试报告'))
  const evalIds = mockEvaluations ? Object.keys(mockEvaluations) : []
  if (evalIds.length === 0) {
    md.push(line('尚未完成模拟面试回答点评'))
  } else {
    for (const id of evalIds) {
      const ev = mockEvaluations![id]
      const q = plan ? plan.questions.find((x) => x.id === id) : undefined
      md.push(line(`### ${q ? q.question : id}`))
      if (q) {
        md.push(line(`题型：${q.type} · 难度：${q.difficulty}`))
      }
      md.push(line(`**本次回答评分**：${ev.score} / 100（${ev.level}）`))
      md.push(line('**回答优点**'))
      md.push(list(ev.strengths))
      md.push(line('**主要问题**'))
      md.push(list(ev.problems))
      md.push(line('**缺失证据**'))
      md.push(list(ev.missingEvidence))
      md.push(line('**可信度风险**'))
      md.push(list(ev.credibilityRisks))
      md.push(line('**结构建议**'))
      md.push(list(ev.structureAdvice))
      md.push(line('**改进版回答（基于用户回答和已有材料，未编造）**'))
      md.push(line(ev.improvedAnswer))
      md.push(line('**后续可能追问**'))
      md.push(list(ev.followUpQuestions))
      md.push(line(`**下一步练习建议**：${ev.nextPracticeSuggestion}`))

      const rep = ev.interviewReport
      md.push(line('**最终面试报告**'))
      md.push(line(`- 整体评分：${rep.overallScore} / 100（${rep.overallLevel}）`))
      md.push(line(`- 总评：${rep.summary}`))
      md.push(line(`- 岗位匹配表达：${rep.jobFitPerformance}`))
      md.push(line(`- 回答结构：${rep.answerStructurePerformance}`))
      md.push(line(`- 证据质量：${rep.evidenceQualityPerformance}`))
      md.push(line(`- 可信度表现：${rep.credibilityPerformance}`))
      md.push(line('**核心优势**'))
      md.push(list(rep.keyStrengths))
      md.push(line('**主要短板**'))
      md.push(list(rep.majorWeaknesses))
      md.push(line('**高风险点（容易被继续追问）**'))
      md.push(list(rep.highRiskPoints))
      md.push(line('**优先改进项**'))
      md.push(list(rep.priorityImprovements))
      md.push(line('**下一步练习计划**'))
      md.push(list(rep.nextPracticePlan))
      md.push(line(''))
    }
  }

  return md.join('\n')
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
