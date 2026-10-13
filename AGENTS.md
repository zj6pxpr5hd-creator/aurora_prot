1. Project Purpose & Mission:
- The system is an intelligent personal assistant and contextual memory application named "Aurora". 
- Its overarching goal is to help users manage, organize, and interact with daily breakdowns, upcoming events, long-term goals, and conversational memory streams backed by automated AI processing.

2. General Architecture & Tech Stack:
- Infrastructure layout: A client-server architecture containerized via Docker (`Dockerfile`, `docker-compose.yml`), combining a frontend application with a backend API service.
- Core frameworks and languages:
  - Frontend: React (with TypeScript, Vite, CSS).
  - Backend: Node.js (Express framework), interacting with local SQLite databases.
- Environmental requirements: Node.js runtime, local LLM integration services (Google Gemini via backend services), and modern browser support.

3. Data Flow:
- Initial User Trigger: The user interacts with the React frontend interface (e.g., inputting text or submitting a chat message/memory).
- Webhook/API Parsing: The frontend dispatches API requests through `src/services/api.ts` targeting specific backend routes (`server/src/routes/`).
- LLM/Agent Processing: The backend services (`server/src/services/`) parse incoming context and route payloads through the Gemini service (`geminiService.js`) and database handlers (`database.js`).
- Output Interface: Processed data (such as conversational replies, relevant memories, goals, or daily breakdowns) is returned via JSON responses, updating the React state models and rendering dynamically back to the user shell.

4. External APIs & Integrations:
- Google Gemini API: Integrated via backend services (`server/src/services/geminiService.js`) for natural language processing, semantic matching, and assistant generation.
- Authentication Methods: Secure API keys and environment secrets managed through backend configuration (`.env`, `server/AURORA_PROT.code-workspace`).

5. Agent Overview & Operating Guidelines:
- Defined Roles: Autonomous agents operating within this repository act as developer assistants, refactoring aids, bug fixers, and documentation maintainers.
- Rules of Engagement:
  - Branching: Strict adherence to modifying files only on designated development branches. Direct commits to production/main branches are forbidden.
  - Commits: Use clear, descriptive commit messages adhering to standard conventional commit formats (e.g., `feat:`, `fix:`, `refactor:`).
  - File Writing: Maintain existing code style (TypeScript strict rules, ESLint configurations). Verify that modifications do not break existing component memoization, hooks, or backend middleware logic.

6. Security & Guardrails:
- Command Whitelisting: Autonomous agents are restricted to executing safe development tasks (e.g., `npm test`, `npm run build`, linting checks).
- Explicit Restrictions: Direct shell execution of destructive commands (e.g., `rm -rf`, uncontrolled database drops, modifications to production environment files) is strictly prohibited.
- Environment Hardening: Secrets and API keys must never be hardcoded into source files; they must strictly utilize environment variables.

7. File Map:
- .gitignore
- AGENTS.md
- Dockerfile
- README.md
- eslint.config.js
- index.html
- package-lock.json
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- public/favicon.svg
- public/icons.svg
- server/AURORA_PROT.code-workspace
- server/app.js
- server/package-lock.json
- server/package.json
- server/pnpm-lock.yaml
- server/src/context.js
- server/src/db/database.js
- server/src/routes/contextRoutes.js
- server/src/routes/goalsRoutes.js
- server/src/routes/memoryRoutes.js
- server/src/routes/relevantRoutes.js
- server/src/schemas/memorySchemas.js
- server/src/services/contextService.js
- server/src/services/geminiService.js
- server/src/timeUtils.js
- src/App.css
- src/App.tsx
- src/EventList.tsx
- src/components/ConversationSection.tsx
- src/components/DailyBreakdownSection.tsx
- src/components/Header.tsx
- src/components/Icons.tsx
- src/components/MemoryEditor.tsx
- src/components/MemoryItem.tsx
- src/components/RightColumnSections.tsx
- src/index.css
- src/main.tsx
- src/services/api.ts
- src/types/memory.ts
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts