# Product Contract: Resume Glow-up

## Product positioning

Resume Glow-up / 简历专家 is a real-API AI Agent Web App for campus recruitment resume optimization.

It helps students, interns, and new graduates:

1. parse a target campus recruitment JD;
2. diagnose resume weaknesses under campus recruitment standards;
3. match JD requirements to real resume evidence;
4. ask targeted follow-up questions;
5. build a resume optimization strategy;
6. rewrite resume sections conservatively;
7. produce a final JD-customized resume;
8. identify interview risks;
9. create a text-based mock interview plan;
10. evaluate a user's answer and produce an interview report.

## Mandatory first-version scope

Implement:

- frontend page;
- backend API proxy;
- real LLM API call;
- user input form;
- structured AI analysis;
- follow-up questions;
- resume optimization;
- interview risks and improvement suggestions;
- Markdown export;
- loading states;
- API error states;
- input validation.

Mandatory enhanced functions:

- `roleFitAssessment`: whether the role is worth applying to;
- `jdRequirementLevels`: hard gate / soft gate identification;
- `experienceTransferability`: enhanced conversion of student experiences into job evidence;
- `noReplyDiagnosis`: diagnosis of why applications receive no responses;
- `skillGapPlan`: skills to improve, target level, project proof, and resume embedding;
- `mockInterviewPlan`: text-based interview question set after resume optimization;
- `interviewReport`: answer evaluation report after mock interview answer submission.

Do not implement in V1:

- user login;
- database;
- history saving;
- multi-user system;
- payment;
- file upload parsing;
- PDF or Word automatic parsing;
- multi-device sync;
- permission system.

## Core agent persona

The in-app Agent should act as:

- senior career development consultant;
- campus recruitment HRBP;
- recruiting manager;
- fresh graduate resume optimization expert.

The Agent understands campus recruitment logic for:

- internet;
- AI;
- product;
- operations;
- ToB SaaS;
- R&D;
- design;
- data;
- solution consulting.

The Agent must extract job-relevant evidence from:

- internships;
- coursework projects;
- research;
- competitions;
- clubs and student organizations;
- campus work;
- personal works;
- skills and certificates.

## Final output order

Final result and Markdown export must use this order:

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

## Error handling rules

Handle:

1. missing JD;
2. missing resume;
3. missing API key;
4. invalid API key;
5. timeout;
6. provider error;
7. invalid JSON;
8. network failure;
9. backend not started;
10. input too long;
11. mock interview question not selected;
12. mock interview answer missing;
13. missing analysis context;
14. interview evaluation API failure;
15. interview evaluation JSON parse failure.

Never show mock data after real API failure.

## Privacy and security

- Do not store API keys in frontend code.
- Do not print full resumes in console logs.
- Do not print API keys.
- Do not leak API keys in error messages.
- Do not write user resumes to local files.
- Do not send user resumes to unnecessary third-party logging tools.
- Do not enable unnecessary tracking.
- Do not commit `.env` or `.env.local`.
- Do not hardcode real user private data as sample data.
