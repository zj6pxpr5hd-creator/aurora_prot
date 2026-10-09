1. Project Purpose & Mission:
- Project Name: Aurora Protocol (AURORA_PROT)
- Mission: To build an intelligent, context-aware memory and daily planning web application (Aurora) that tracks user conversations, memories, daily breakdowns, goals, and upcoming events, leveraging local or remote AI models (like Gemini) to assist users in managing personal productivity, schedules, and contextual memory recall.

2. General Architecture & Tech Stack:
- Infrastructure Layout: Full-stack web application with a containerized or local dual-tier architecture consisting of a React single-page frontend (Vite) and an Express.js backend server.
- Backend Tech Stack: Node.js, Express, SQLite (via `database.js`), Google Gemini AI integrations (`geminiService.js`), and modular REST routing.
- Frontend Tech Stack: React 18+ with TypeScript, Vite, custom styling (`App.css`, `index.css`), React Hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`), and local storage caching.
- Package Management: npm / pnpm workspaces (`pnpm-workspace.yaml`).
- Environmental Requirements: Node.js runtime, proper environment variable configurations for database and AI API keys.

3. Data Flow:
- Step 1 (User Interaction): The user types a message, note, or prompt into the `ConversationSection` on the React frontend.
- Step 2 (API Trigger): Submitting the form calls `createMemoryApi` from `src/services/api.ts`, sending a POST request to the backend server.
- Step 3 (Backend Processing): The Express server routes the request through context/memory routes where services (e.g., `geminiService.js`) process the input text alongside current conversational history and database context.
- Step 4 (Persistence): Data updates are committed to the SQLite database via `database.js`, and relevant outputs/responses are returned as JSON.
- Step 5 (Interface Update): The frontend receives the assistant response or data updates, updates React component state, synchronizes with browser `localStorage`, and triggers auto-scrolling or UI re-renders.

4. External APIs & Integrations:
- Google Gemini API: Integrated via `server/src/services/geminiService.js` to process conversational memory, extract relevant details, and generate intelligent agent responses.
- Local REST Endpoints: Internal communication routes handle context, goals, memories, and relevance checks (`/api/context`, `/api/goals`, `/api/memory`, `/api/relevant`).
- Authentication Headers: Standard HTTP headers (e.g., `Content-Type: application/json`) and secure environment-injected API keys/tokens for third-party AI provider calls.

5. Agent Overview & Operating Guidelines:
- Existing Agent Roles: Autonomous software engineering and DevOps agents configured to handle repository refactoring, dependency updates, debugging, and feature additions.
- Rules of Engagement:
  - Branching Strategy: Strict adherence to modifying files only on designated development branches. Direct commits to production/main branches are prohibited.
  - Commit Messages: Follow conventional commit message formats (e.g., `feat:`, `fix:`, `refactor:`, `docs:`).
  - File Writing Protocols: Always ensure proper TypeScript typing, adhere to existing ESLint configurations (`eslint.config.js`), and avoid modifying system configuration files unless explicitly tasked.
  - State & Performance: Maintain React performance optimizations (such as `useCallback`, `useMemo`, and `React.memo`) when altering UI components.

6. Security & Guardrails:
- Command Whitelisting: Only standard build, test, and package management commands (`npm run`, `pnpm build`, `vite`, `node`) are permitted.
- Shell Execution Restrictions: Arbitrary destructive shell execution (e.g., recursive deletion, unauthorized network requests, installation of unvetted global packages) is strictly blocked.
- Environment Hardening: Secrets, API keys, and database credentials must remain strictly inside environment variables (`.env`) and never be hardcoded into source files.
- Permissions: Agents operate within sandboxed repository boundaries with restricted write access to production configurations and infrastructure scripts.

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
- public/
  - favicon.svg
  - icons.svg
- server/
  - AURORA_PROT.code-workspace
  - app.js
  - package-lock.json
  - package.json
  - pnpm-lock.yaml
  - src/
    - context.js
    - db/database.js
    - routes/contextRoutes.js
    - routes/goalsRoutes.js
    - routes/memoryRoutes.js
    - routes/relevantRoutes.js
    - schemas/memorySchemas.js
    - services/contextService.js
    - services/geminiService.js
    - timeUtils.js
- src/
  - App.css
  - App.tsx
  - EventList.tsx
  - components/
    - ConversationSection.tsx
    - DailyBreakdownSection.tsx
    - Header.tsx
    - Icons.tsx
    - MemoryEditor.tsx
    - MemoryItem.tsx
    - RightColumnSections.tsx
  - index.css
  - main.tsx
  - services/api.ts
  - types/memory.ts
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts