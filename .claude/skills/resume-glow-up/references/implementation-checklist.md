# Implementation Checklist

## Recommended development order

1. Initialize Vite + React + TypeScript + Tailwind CSS directly in the current directory.
2. Configure Tailwind CSS.
3. Create Express backend.
4. Add `.env.example` and `.gitignore`.
5. Implement `server/aiClient.ts` supporting OpenAI-compatible and Anthropic-compatible providers.
6. Implement `server/prompts.ts`.
7. Define shared types in `src/types/index.ts`.
8. Implement `/api/analyze-initial`.
9. Implement `/api/optimize-resume`.
10. Implement frontend API request layer in `src/services/api.ts`.
11. Build layout: top nav, workflow navigation, main work area.
12. Implement input materials page.
13. Connect real API calls.
14. Implement JD analysis display.
15. Implement resume diagnosis display.
16. Implement JD-to-evidence match table.
17. Implement follow-up questions page.
18. Implement follow-up answer input.
19. Implement resume strategy and experience transferability display.
20. Implement rewrite comparison.
21. Implement final resume display.
22. Implement interview risk display.
23. Implement further suggestions.
24. Implement role fit display.
25. Implement JD hard/soft gate table.
26. Upgrade experience transferability display.
27. Implement no-reply diagnosis display.
28. Implement skill gap plan display.
29. Add optional delivery context input.
30. Implement Markdown export in 15-module order.
31. Add mock interview types, prompt, schema, and validation.
32. Make `/api/optimize-resume` output `mockInterviewPlan`.
33. Implement `/api/evaluate-interview-answer`.
34. Add frontend mock interview component with question bank, answer input, evaluation, and report areas.
35. Add `evaluateInterviewAnswer` frontend API function.
36. Add workflow navigation step for mock interview.
37. Unify UI style.
38. Run `npm run build`.
39. Fix all errors.
40. Run `npm run dev:all` and test full flow.

## Phase acceptance standard

After every major phase, check:

1. product still targets campus recruitment / internship users;
2. real API is connected;
3. mock data is removed;
4. 9 core output modules exist;
5. enhanced functions exist:
   - role fit assessment;
   - JD hard/soft gates;
   - enhanced experience transferability;
   - no-reply diagnosis;
   - skill gap plan;
6. enhanced fields are included in `/api/analyze-initial`;
7. empty arrays render safe empty states;
8. Markdown export has 15 modules in order;
9. mock interview backend and frontend exist;
10. mock interview questions cover five question types and are JD/resume-specific;
11. interview evaluation calls real AI and returns `interviewReport`;
12. missing mock interview question/answer/context are validated;
13. no button is decorative only;
14. every major action has state feedback;
15. TypeScript build passes;
16. backend starts;
17. real AI API can be called;
18. provider errors are displayed clearly;
19. JSON parse failures are displayed clearly;
20. UI remains restrained and professional;
21. no user experience, data, or result is fabricated;
22. “参与” is not rewritten as “负责/主导” without evidence;
23. no API key is leaked.

## Suggested npm scripts

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

If `concurrently` is missing:

```bash
npm install concurrently -D
```

## Build validation

Run:

```bash
npm run build
```

Do not ignore TypeScript errors.

Run local full stack:

```bash
npm run dev:all
```

If the app cannot reach the backend, check:

- server port;
- Vite proxy;
- backend process status;
- `SERVER_PORT`;
- firewall or terminal working directory;
- provider base URL and model name.
