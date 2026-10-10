1. Project Purpose & Mission:
- Aurora (AURORA_PROT) is an intelligent, context-aware memory and daily orchestration system. 
- Its overarching goal is to act as an autonomous personal companion that aggregates daily breakdowns, tracks events, manages goals, and surfaces relevant personal memories dynamically using integrated LLM capabilities.

2. General Architecture & Tech Stack:
- Infrastructure Layout: Self-hosted Docker container environment (`Dockerfile`, `docker-compose.yml` implicitly required), managing both client and server layers.
- Backend: Node.js / Express server layout containing modular routing (`server/src/routes/`), database interaction wrappers (`server/src/db/database.js`), core context processing engines, and Gemini LLM micro-services (`server/src/services/geminiService.js`).
- Frontend: React 18+ powered Single Page Application built with Vite (`vite.config.ts`), TypeScript (`tsconfig.json`), and structured component design (`src/components/`).
- Package Management: Monorepo workspace configuration using pnpm (`pnpm-workspace.yaml`, `pnpm-lock.yaml`) alongside standard npm lockfiles.

3. Data Flow:
- Trigger Phase: A user interacts with the React frontend interface (e.g., inputs text into the `ConversationSection` or toggles views).
- Request Routing: User actions fire API requests via `src/services/api.ts` targeted at Express REST endpoints (`server/src/routes/`).
- Processing & LLM Integration: The backend services (`server/src/services/contextService.js`, `geminiService.js`) process the inputs, optionally interface with local/cloud LLMs or database storage (`server/src/db/database.js`), and contextualize the temporal data (`server/src/timeUtils.js`).
- Response & UI Hydration: The structured JSON response travels back to the client application, updating component states (e.g., `App.tsx` handles `messages`, `dailyBreakdown`, `goals`), persisting state to `localStorage` where applicable, and auto-scrolling conversation panes via React refs.

4. External APIs & Integrations:
- Gemini LLM Integration: Communicates with Google's Gemini models via backend services (`server/src/services/geminiService.js`) for semantic analysis, memory synthesis, and conversational context matching.
- Internal REST Endpoints: Exposes localized HTTP endpoints for contexts, goals, memories, and relevance tracking (`server/src/routes/contextRoutes.js`, `server/src/routes/goalsRoutes.js`, `server/src/routes/memoryRoutes.js`, `server/src/routes/relevantRoutes.js`).
- Authentication: API keys and runtime configuration variables are securely ingested via server-side environment configurations (expected `.env` files for Gemini and database access).

5. Agent Overview & Operating Guidelines:
- Autonomous Agents: AI coding agents operating within this repository act as full-stack maintainers, responsible for refactoring React components, adjusting Express API routers, managing TypeScript definitions, and verifying database schemas.
- Branch Strategy: Strict adherence to modifying files ONLY on designated development or feature branches. Direct commits to production branches are strictly forbidden.
- Commit Messages: Must follow a clear, semantic convention format (e.g., `feat(ui): add memory filtering`, `fix(server): resolve memory route parsing`).
- File Writing & Modification Protocols: Ensure type safety (`tsc`), linting standards (`eslint.config.js`), and workspace dependencies remain fully intact across root and `server/` workspaces.

6. Security & Guardrails:
- Command Whitelisting: Autonomous agents are permitted to execute safe workspace commands such as `npm test`, `pnpm build`, `pnpm lint`, and dependency auditing scripts.
- Shell Execution Restrictions: Direct, un-sandboxed shell execution targeting system-level configuration, unauthorized package installations from unverified registries, or exposure of private keys/secrets is strictly prohibited.
- Environment Hardening: Secrets must never be hardcoded into source files. Agents must read environmental variables exclusively from standard process contexts or configuration templates.

7. File Map:
- Directory tree and configuration layout:
  - `Dockerfile` / `docker-compose.yml`: Container configuration and service orchestration.
  - `package.json` / `pnpm-workspace.yaml`: Root workspace configurations.
  - `index.html` / `vite.config.ts`: Frontend entry point and build configurations.
  - `src/`: Core React application logic
    - `App.tsx`: Main application shell layout and primary state management.
    - `services/api.ts`: API client interface interacting with backend routes.
    - `components/`: UI components (`Header.tsx`, `ConversationSection.tsx`, `MemoryEditor.tsx`, `DailyBreakdownSection.tsx`, `RightColumnSections.tsx`, etc.).
    - `types/memory.ts`: TypeScript interfaces for memories, goals, and events.
  - `server/`: Backend service and API layer
    - `server/app.js`: Express application initialization and middleware setup.
    - `server/src/db/database.js`: Database initialization and query interfaces.
    - `server/src/routes/`: Route controllers (`contextRoutes.js`, `goalsRoutes.js`, `memoryRoutes.js`, `relevantRoutes.js`).
    - `server/src/services/`: Business logic engines (`contextService.js`, `geminiService.js`).