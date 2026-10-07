# AGENTS.md

## 1. Project Purpose & Mission
Aurora (Aurora Protocol) is a context-aware personal assistant and memory management application. Its primary mission is to help users capture memories, manage daily breakdowns, track upcoming events, and establish structured goals. The system pairs a responsive React/TypeScript single-page application frontend with a robust Node.js/Express backend service driven by Google Gemini LLM capabilities for intelligent conversation processing and memory retrieval.

## 2. General Architecture & Tech Stack
- **Architecture:** Monorepo with a decoupled Client-Server structure (Vite + React frontend with an Express + Node.js backend API).
- **Backend Stack:** Node.js, Express, Google Gemini SDK (`@google/genai`), SQLite (`sqlite3` / `sqlite`), and custom time utilities.
- **Frontend Stack:** React 19, TypeScript, Vite, CSS styling.
- **Containerization & Deployment:** Dockerized configuration (`Dockerfile`, `docker-compose.yml` patterns) supporting self-hosted execution environments.
- **Environment Requirements:** Node.js (v18+ recommended), pnpm/npm workspace management, and explicit environment variables (e.g., `GEMINI_API_KEY`, server ports).

## 3. Data Flow
1. **User Trigger:** The user interacts with the React frontend (`App.tsx`, `ConversationSection.tsx`, or memory management views) by typing a message, adding a memory, or requesting a daily breakdown.
2. **API Request Routing:** The frontend makes HTTP requests via `src/services/api.ts` to the Express server routes (`server/src/routes/`).
3. **Backend Middleware & Service Processing:** 
   - Requests hit controllers/routes (`contextRoutes.js`, `goalsRoutes.js`, `memoryRoutes.js`, `relevantRoutes.js`).
   - Business logic invokes backend services (`contextService.js`, `geminiService.js`).
   - The `geminiService.js` constructs prompts utilizing current state data and interacts with the Google Gemini LLM model.
4. **Data Persistence:** Data is read from or written to the local SQLite database via `server/src/db/database.js`.
5. **Response & Rendering:** The JSON response flows back through the API client to the React frontend state variables, updating UI components (`DailyBreakdownSection`, `MemoryList`, `ConversationSection`) and persisting messages to `localStorage`.

## 4. External APIs & Integrations
- **Google Gemini API:** 
   - **Service:** Generative AI models for text generation, context analysis, and relevant memory surfacing.
   - **Authentication:** Requires a secure API key passed via environment variables (`GEMINI_API_KEY`) consumed by `geminiService.js`.
- **Internal REST Endpoints:**
   - `/api/context` - Context management and ingestion.
   - `/api/goals` - Goal tracking and synchronization.
   - `/api/memory` - CRUD operations for user memories.
   - `/api/relevant` - AI-driven contextual memory retrieval.

## 5. Agent Overview & Operating Guidelines
- **Autonomous Agents in Scope:** Code maintenance agents, documentation generators, test runners, and refactoring bots operating inside this repository.
- **Defined Roles:**
  - *Refactoring & Feature Agents:* Implement clean, typed TypeScript and modern ES Modules JavaScript conforming to existing project standards and ESLint configurations (`eslint.config.js`).
  - *Documentation Agents:* Keep instruction manuals, READMEs, and technical specs synchronized with codebase modifications.
- **Rules of Engagement:**
  - **Branch Protection:** Agents must operate exclusively on designated development branches (`dev` or feature/fix branches). Direct commits to `main` are strictly prohibited.
  - **Commit Message Format:** Use descriptive, conventional commit messages (e.g., `feat(server): add new memory schema validation`, `fix(ui): resolve scroll behavior in conversation view`).
  - **File-Writing Protocols:** Avoid introducing unauthorized dependencies or modifying locked configuration files (`package-lock.json`, `pnpm-lock.yaml`) unless explicitly instructed or updating core packages. Preserve existing code formatting, indentation, and linting rules.

## 6. Security & Guardrails
- **Command Whitelisting:** Agents are restricted to safe development and testing commands (e.g., `npm run build`, `npm run lint`, package management installs). Destructive shell commands (e.g., `rm -rf`, forceful database drops, unauthorized system updates) are completely forbidden.
- **Environment Hardening:** Never hardcode secrets, API keys, or tokens into source code files. All sensitive configurations must rely on environment variables.
- **Permission Boundaries:** Agents must not access, read, or transmit external files or environment variables outside the explicit repository workspace boundary.

## 7. File Map
```text
.
├── .gitignore
├── AGENTS.md
├── Dockerfile
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── server/
│   ├── AURORA_PROT.code-workspace
│   ├── app.js
│   ├── package-lock.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── src/
│   │   ├── context.js
│   │   ├── db/
│   │   │   └── database.js
│   │   ├── routes/
│   │   │   ├── contextRoutes.js
│   │   │   ├── goalsRoutes.js
│   │   │   ├── memoryRoutes.js
│   │   │   └── relevantRoutes.js
│   │   ├── schemas/
│   │   │   └── memorySchemas.js
│   │   ├── services/
│   │   │   ├── contextService.js
│   │   │   └── geminiService.js
│   └── timeUtils.js
├── src/
│   ├── App.css
│   ├── App.tsx
│   ├── EventList.tsx
│   ├── components/
│   │   ├── ConversationSection.tsx
│   │   ├── DailyBreakdownSection.tsx
│   │   ├── Header.tsx
│   │   ├── Icons.tsx
│   │   ├── MemoryEditor.tsx
│   │   ├── MemoryItem.tsx
│   │   ├── RightColumnSections.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── memory.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```