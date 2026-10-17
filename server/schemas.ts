// JSON Schema 定义（应届生校招 / 实习求职版本）。
// 1. 以文本形式拼入 Prompt，要求模型严格按结构返回；
// 2. 传给支持 response_format 的 OpenAI 兼容服务做结构化约束。

export const initialResponseSchemaText = `请严格按以下 JSON 结构返回（字段名不可更改，数组元素为字符串，除非另行说明）。必须返回以下 10 个顶层字段：jdAnalysis、resumeDiagnosis、matchTable、followUpQuestions、resumeStrategy、experienceTransferability、roleFitAssessment、jdRequirementLevels、noReplyDiagnosis、skillGapPlan。

{
  "jdAnalysis": {
    "coreResponsibilities": string[],
    "hardRequirements": string[],
    "hiddenRequirements": string[],
    "keywords": string[],
    "idealCandidate": string,
    "topFiveAbilities": string[]
  },
  "resumeDiagnosis": {
    "matchScore": number,
    "scoreReasons": string[],
    "dimensions": {
      "educationMatch": string,
      "majorRelevance": string,
      "internshipQuality": string,
      "projectQuality": string,
      "transferableExperience": string,
      "skillsMatch": string,
      "resultsQuantification": string,
      "keywordCoverage": string,
      "differentiation": string,
      "credibilityRisk": string,
      "priorityFixes": string
    },
    "strengths": string[],
    "problems": string[],
    "priorityFixes": string[]
  },
  "matchTable": [
    {
      "jdRequirement": string,
      "resumeEvidence": string,
      "evidenceStrength": "强" | "中" | "弱" | "无",
      "needSupplement": boolean,
      "optimizationSuggestion": string
    }
  ],
  "followUpQuestions": [
    {
      "question": string,
      "reason": string,
      "direction": "项目背景" | "个人职责" | "业务目标" | "关键动作" | "协作对象" | "产出成果" | "数据指标" | "用户/客户规模" | "难点与解决方案" | "可证明能力"
    }
  ],
  "resumeStrategy": {
    "positioning": string,
    "experiencesToMoveForward": string[],
    "contentToWeakenOrDelete": string[],
    "keywordsToEmbed": string[],
    "representativeProjects": string[],
    "resumeStyle": "专业型" | "数据型" | "业务型" | "技术型" | "综合型"
  },
  "experienceTransferability": [
    {
      "category": "实习经历" | "课程项目" | "科研经历" | "竞赛经历" | "社团经历" | "校园工作" | "个人作品" | "技能证书" | "其他",
      "description": string,
      "transferableAbilities": string[],
      "suitableRolesOrScenarios": string[],
      "resumePlacement": string,
      "evidenceStrength": "强" | "中" | "弱" | "无",
      "rewritePotential": "高" | "中" | "低",
      "missingDetails": string[],
      "interviewRisks": string[],
      "suggestedRewriteDirection": string
    }
  ],
  "roleFitAssessment": {
    "fitLevel": "强匹配" | "可尝试" | "勉强匹配" | "不建议主投",
    "fitScore": number,                       // 0-100，校招语境相对匹配分
    "summary": string,
    "reasons": string[],
    "hardBlockers": string[],                 // 没有明确硬阻碍时返回空数组 []
    "softGaps": string[],
    "bestEvidence": string[],
    "riskWarnings": string[],
    "recommendedAction": string               // 明确行动建议
  },
  "jdRequirementLevels": [
    {
      "requirement": string,                  // 必须来自目标 JD 真实要求
      "level": "硬门槛" | "重要加分项" | "普通加分项" | "可替代项",
      "sourceText": string,                   // JD 原文片段，可为空字符串
      "evidenceNeeded": string,
      "userStatus": "已满足" | "部分满足" | "未满足" | "无法判断",
      "currentEvidence": string,              // 没有证据时写"暂无明确证据"
      "howToCompensate": string,
      "resumeEmbeddingSuggestion": string
    }
  ],
  "noReplyDiagnosis": {
    "hasDeliveryContext": boolean,            // 用户是否提供了投递情况
    "summary": string,
    "likelyReasons": [
      {
        "reason": string,
        "probability": "高" | "中" | "低",
        "evidence": string,
        "fixSuggestion": string
      }
    ],
    "topThreeFixes": string[],                // 仅最优先 3 项
    "nextSevenDayActionPlan": string[]        // 7 天内可执行行动
  },
  "skillGapPlan": {
    "targetRole": string,
    "summary": string,
    "missingSkills": [
      {
        "skill": string,
        "importance": "必须补" | "建议补" | "加分项",
        "currentEvidence": string,            // 没有证据时写"暂无明确证据"
        "targetLevel": string,                // 应届生可执行水平，不要写"精通"
        "learningSourceTypes": string[],      // 来源类型，不要编造具体广告链接
        "practiceProject": string,            // 可放进简历的练习项目方向
        "resumeEmbeddingSuggestion": string,
        "estimatedDifficulty": "低" | "中" | "高",
        "priority": "高" | "中" | "低"
      }
    ],
    "sevenDayPlan": string[],
    "thirtyDayPlan": string[]
  }
}`

export const optimizeResponseSchemaText = `请严格按以下 JSON 结构返回（字段名不可更改）：

{
  "rewriteComparison": [
    {
      "before": string,
      "after": string,
      "reason": string,
      "needsConfirmation": boolean
    }
  ],
  "finalResume": {
    "personalInfo": string,
    "jobIntention": string,
    "professionalSummary": string,
    "coreAbilities": string[],
    "workExperience": string[],
    "projectExperience": string[],
    "skillsAndTools": string[],
    "education": string,
    "additionalItems": string[]
  },
  "finalAssessment": {
    "roleFitAssessment": {
      "fitLevel": "强匹配" | "可尝试" | "勉强匹配" | "不建议主投",
      "fitScore": number,                     // 0-100，基于最终简历重新判断的校招语境相对匹配分
      "summary": string,
      "reasons": string[],
      "hardBlockers": string[],               // 最终简历仍无法解决的硬阻碍，没有则返回 []
      "softGaps": string[],                   // 最终简历仍存在、可继续补强的软短板
      "bestEvidence": string[],               // 最终简历中最能支持投递的真实证据
      "riskWarnings": string[],
      "recommendedAction": string
    },
    "matchScore": number,                     // 0-100，基于最终简历重新测算的岗位匹配度评分
    "scoreReasons": string[],                 // 解释最终匹配度评分的主要依据和扣分点
    "scoreChangeSummary": string              // 对比初始评分，说明分数变化来自表达优化、关键词覆盖、证据前置还是仍有缺口
  },
  "interviewRisks": [
    {
      "question": string,
      "riskReason": string,
      "evidenceNeeded": string,
      "suggestedAnswer": string
    }
  ],
  "furtherSuggestions": {
    "projectsToAdd": string[],
    "portfolioNeeded": boolean,
    "portfolioContent": string[],
    "resumeVersions": string[],
    "roleSpecificVersionsNeeded": boolean
  },
  "mockInterviewPlan": {
    "interviewPositioning": string,          // 本次模拟面试的定位说明
    "questions": [                            // 固定 8 道：HR 2 / 业务 2 / 项目深挖 2 / 技能追问 1 / 压力追问 1
      {
        "id": string,                         // 唯一 id，如 "q1"
        "type": "HR面试" | "业务面试" | "项目深挖" | "技能追问" | "压力追问",
        "difficulty": "基础" | "中等" | "高压",
        "question": string,
        "relatedResumeEvidence": string,      // 对应简历中的哪段证据
        "relatedJDRequirement": string,       // 对应 JD 中的哪项要求
        "whyAsked": string,                   // 为什么会被问
        "evaluationFocus": string[],          // 面试官重点考察什么
        "answerFramework": string,            // 建议回答框架，不要替用户编造经历
        "riskWarning": string                 // 回答时的风险
      }
    ],
    "priorityQuestions": string[],            // 建议优先练习的题目 id 或题目
    "preparationAdvice": string[]             // 备考建议
  }
}`

// OpenAI 兼容 response_format（json_object 模式，兼容性最好）。
export const jsonResponseFormat = {
  type: 'json_object' as const
}

// 模拟面试回答点评响应结构
export const evaluateInterviewAnswerSchemaText = `请严格按以下 JSON 结构返回（字段名不可更改）：

{
  "score": number,                              // 0-100，校招面试标准评分
  "level": "优秀" | "合格" | "偏弱" | "高风险",
  "strengths": string[],                        // 回答中已有的优点
  "problems": string[],                         // 表达/逻辑/证据/岗位匹配上的问题
  "missingEvidence": string[],                  // 还缺少的项目细节、数据、职责、方法、结果或反思
  "credibilityRisks": string[],                 // 可能被面试官质疑的地方
  "structureAdvice": string[],                  // 回答结构修改建议（STAR/CAR/PAR 或 背景-任务-行动-结果-反思）
  "improvedAnswer": string,                     // 基于用户已有回答和简历保守改写，不得编造；信息不足标注【待补充】或【待确认】
  "followUpQuestions": string[],                // 2-4 个面试官可能继续追问的问题
  "nextPracticeSuggestion": string,             // 下一步练习建议
  "interviewReport": {                          // 本次模拟面试最终报告
    "overallScore": number,                     // 0-100
    "overallLevel": "优秀" | "合格" | "偏弱" | "高风险",
    "summary": string,
    "jobFitPerformance": string,                // 岗位匹配表达
    "answerStructurePerformance": string,       // 回答结构
    "evidenceQualityPerformance": string,       // 证据质量
    "credibilityPerformance": string,           // 可信度风险
    "keyStrengths": string[],
    "majorWeaknesses": string[],
    "highRiskPoints": string[],
    "priorityImprovements": string[],
    "nextPracticePlan": string[]
  }
}`
