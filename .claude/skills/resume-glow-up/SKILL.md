---
name: resume-glow-up
description: This skill should be used when building, modifying, reviewing, or debugging the Resume Glow-up / 简历专家 project: an AI-powered campus recruitment and internship resume optimization Web App for students and new graduates. It guides Claude to implement the product with Vite, React, TypeScript, Tailwind CSS, Node.js, Express, dotenv, real AI API calls, structured JSON outputs, truthful resume rewriting, JD-based analysis, role-fit assessment, skill-gap planning, no-reply diagnosis, and text-based mock interview evaluation.
---

# Resume Glow-up Skill

## Purpose

This skill turns Claude into a product-and-engineering specialist for **Resume Glow-up**, also known as **简历专家**: an AI resume optimization Agent Web App for students, interns, and new graduates in campus recruitment.

The product is not a generic resume polishing tool. It is a **JD-customized campus recruitment resume optimization agent** that helps users convert real academic, internship, project, research, competition, campus-work, portfolio, and certificate evidence into credible resume language recognized by campus recruiters and business interviewers.

Use this skill to:

- build the app from scratch;
- modify an existing implementation;
- review or repair product scope drift;
- design backend prompts and schemas;
- implement real AI API integration;
- add or debug workflow modules;
- enforce truthful resume rewriting;
- validate UI, API, export, error handling, and security behavior.

## Non-negotiable product constraints

1. The product serves only:
   - students;
   - fresh graduates;
   - internship applicants;
   - campus recruitment applicants;
   - management trainee applicants in campus recruitment scenarios.

2. The product must not target:
   - 1-3 years experienced hires;
   - 3-5 years experienced hires;
   - senior professionals;
   - management roles;
   - executive search;
   - broad career transition users.

3. The app must call a **real AI API**. Do not use mock data to simulate AI outputs.

4. Never expose API keys in frontend code, repository files, README, `CLAUDE.md`, `SKILL.md`, or logs.

5. Resume rewriting must be conservative and evidence-based:
   - do not invent internships, projects, awards, certificates, metrics, roles, titles, or outcomes;
   - do not change “participated in” into “owned,” “led,” or “managed” unless the user provided evidence;
   - mark uncertain claims as `【待确认】` or `【需要补充】`;
   - do not write claims the user cannot defend in an interview;
   - evaluate the user by campus recruitment standards, not experienced-hire standards.

6. API failure, JSON parse failure, missing key, timeout, or network failure must never fall back to fake success.

## Canonical product workflow

The app must support this core flow:

```text
Campus JD analysis
→ Fresh graduate resume diagnosis
→ JD-to-experience evidence matching
→ Follow-up evidence questions
→ Resume optimization strategy
→ Section-by-section rewrite
→ Final campus recruitment resume
→ Interview risks and improvement suggestions
→ Text-based mock interview
→ Interview answer evaluation and structured interview report
```

The final screen and Markdown export must preserve this module order:

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
15. 模拟面试报告

If optional data is absent, omit the section or show `暂无足够信息`; never render `undefined`, `null`, or empty objects.

## Required implementation stack

Use a simple, stable local-demo architecture:

- Vite
- React
- TypeScript
- Tailwind CSS
- Node.js
- Express
- dotenv

Frontend responsibilities:

- collect user inputs;
- navigate workflow states;
- show loading, empty, success, and error states;
- render structured AI results;
- render Markdown;
- export Markdown locally.

Backend responsibilities:

- read environment variables;
- validate inputs;
- manage API keys;
- build prompts;
- call the real AI provider;
- parse strict JSON responses;
- return explicit errors.

## Required backend endpoints

Implement these three endpoints unless the codebase already has equivalent routes.

### `POST /api/analyze-initial`

Generates:

1. `jdAnalysis`
2. `resumeDiagnosis`
3. `matchTable`
4. `followUpQuestions`
5. `resumeStrategy`
6. `experienceTransferability`
7. `roleFitAssessment`
8. `jdRequirementLevels`
9. `noReplyDiagnosis`
10. `skillGapPlan`

### `POST /api/optimize-resume`

Generates:

1. `rewriteComparison`
2. `finalResume`
3. `interviewRisks`
4. `furtherSuggestions`
5. `mockInterviewPlan`

### `POST /api/evaluate-interview-answer`

Generates:

1. score and level;
2. strengths and problems;
3. missing evidence;
4. credibility risks;
5. structure advice;
6. conservative improved answer;
7. follow-up questions;
8. next practice suggestion;
9. `interviewReport`.

## Environment variable contract

Create `.env.example` with safe placeholders only.

OpenAI-compatible example:

```bash
AI_API_KEY=your_api_key_here
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_PROVIDER=openai
SERVER_PORT=3001
```

Anthropic-compatible example for BigModel-style providers:

```bash
AI_API_KEY=your_api_key_here
AI_API_BASE_URL=https://open.bigmodel.cn/api/anthropic
AI_MODEL=glm-5.2
AI_PROVIDER=anthropic-compatible
SERVER_PORT=3001
```

`.gitignore` must include:

```gitignore
node_modules
dist
.env
.env.local
.DS_Store
```

Protocol rules:

- `AI_PROVIDER=openai` or `openai-compatible`: use `/chat/completions` and `Authorization: Bearer`.
- `AI_PROVIDER=anthropic-compatible`: use `/v1/messages`, `x-api-key`, `anthropic-version`, and top-level `system`.

Never accept model names with unsupported suffixes such as `[1m]` unless the provider explicitly supports them.

## Input contract

The user input form must collect:

### Fresh graduate job target

- target role;
- target industry;
- target company type;
- application scenario;
- graduation stage;
- education level;
- major;
- abilities the user wants to highlight.

### Target JD

- pasted campus recruitment or internship JD text.

### Original resume

- pasted resume text.

### Optional evidence materials

- internship experience;
- project or coursework experience;
- research experience;
- competition experience;
- campus organization or student work;
- skills and certificates;
- measurable results;
- things the user does not want exaggerated;
- target resume length.

### Optional delivery context

- number of applications;
- number of replies;
- main target roles;
- platforms;
- common JD types;
- main problem.

If delivery context is absent, `noReplyDiagnosis.hasDeliveryContext` must be `false` and the summary must state that the diagnosis is based only on the JD and resume.

## AI behavior contract

All AI prompts used by the backend must enforce:

1. strict JSON output;
2. no Markdown in API responses that frontend needs to parse;
3. no invented resume evidence;
4. campus recruitment evaluation standards;
5. clear evidence strength labels: `强`, `中`, `弱`, `无`;
6. explicit `【待确认】` or `【需要补充】` when information is insufficient;
7. specific, actionable recommendations instead of motivational filler.

If the model returns non-JSON:

1. try to extract the JSON object safely;
2. if extraction fails, return:

```json
{
  "success": false,
  "error": "AI 返回格式不符合要求，请重试。"
}
```

Do not fabricate a structured response after parse failure.

## Coding workflow for Claude Code

When working inside a project repository:

1. Inspect the existing codebase before editing.
2. Do not create a nested duplicate project folder.
3. If the current directory is empty, initialize directly in the current directory.
4. Prefer simple, stable solutions suitable for a local classroom demo.
5. Do not add complex dependencies unless necessary.
6. Keep long prompts in `server/prompts.ts`, not scattered inside routes.
7. Keep shared types in `src/types/index.ts`.
8. Keep frontend API requests in `src/services/api.ts`.
9. Centralize AI provider calls in `server/aiClient.ts`.
10. Run `npm run build` after meaningful implementation changes.
11. Fix TypeScript errors rather than ignoring them.
12. Ensure every button has real behavior or a disabled/loading state.

## Recommended project structure

```text
src/
  components/
    layout/
    common/
    workflow/
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
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
tsconfig.server.json
tailwind.config.js
postcss.config.js
```

## UI style contract

The interface must look like a professional productivity tool, not a marketing page.

Reference styles:

- Linear
- Notion
- Lark
- Raycast

Use:

- white and light gray backgrounds;
- thin bordered cards;
- restrained badges;
- clear tables;
- consistent spacing;
- restrained progress indicators;
- strong hierarchy.

Avoid:

- flashy gradients;
- large purple or blue-purple “AI SaaS” backgrounds;
- cartoons;
- glassmorphism;
- glowing buttons;
- exaggerated shadows;
- unnecessary animations;
- gamified UI;
- landing-page aesthetics.

## Required user-facing states

Implement clear states for:

- empty data;
- loading;
- success;
- API failure;
- JSON parse failure;
- missing required input;
- backend not running;
- timeout;
- mock interview question not selected;
- mock interview answer missing;
- missing analysis context before mock interview.

Use concrete messages such as:

- `请先填写目标校招岗位 JD。`
- `请先粘贴原始简历。`
- `未检测到 AI_API_KEY，请检查 .env 配置。`
- `AI 服务调用失败，请检查 API Key、模型名称或网络连接。`
- `AI 返回格式不符合要求，请重试。`
- `请求超时，请稍后重试或缩短输入内容。`
- `请先选择一道模拟面试题。`
- `请先输入你的面试回答。`
- `请先完成简历分析和深度优化后再进行模拟面试。`

## Use bundled references when needed

For detailed contracts, inspect these bundled files:

- `references/product-contract.md`
- `references/schemas.md`
- `references/prompt-contracts.md`
- `references/implementation-checklist.md`
