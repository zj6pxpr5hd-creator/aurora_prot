# AGENTS.md

1. **Project Purpose & Mission:**
   - Aurora Protocol is an intelligent, context-aware memory and daily organization assistant.
   - The mission of the system is to help users manage their personal memories, goals, daily breakdowns, and upcoming events seamlessly through an interactive React frontend and an Express.js backend powered by LLM (Gemini) integrations.

2. **General Architecture & Tech Stack:**
   - **Infrastructure Layout:** Monorepo containing a containerized architecture managed via Docker (`Dockerfile`, `docker-compose.yml` patterns).
   - **Backend:** Node.js, Express.js (`server/app.js`), SQLite/Database storage (`server/src/db/database.js`), Google Gemini AI service integration (`server/src/services/geminiService.js`).
   - **Frontend:** React 18+ with TypeScript (`src/App.tsx`, Vite build tool (`vite.config.ts`), modern CSS layouts).
   - **Package Managers:** `npm`, `pnpm` workspaces (`pnpm-workspace.yaml`).
   - **Environment Requirements:** Node.js v18+, pnpm, and configured API keys for Gemini (`GEMINI_API_KEY`).

3. **Data Flow:**
   - **User Input:** The user interacts with the React frontend (`src/App.tsx`, conversational inputs, or memory editors).
   - **API Request:** Frontend calls asynchronous API wrappers (`src/services/api.ts`) pointing to Express backend endpoints (`server/src/routes/`).
   - **Backend Processing:** Routes process payloads, handle business logic via services (`server/src/services/`), interact with local database persistence, or forward prompts to the Gemini LLM service (`server/src/services/geminiService.js`).
   - **Response Return:** Structured JSON responses return to the frontend client, updating state, caching messages locally via `localStorage`, and rendering real-time adjustments (e.g., daily breakdown, memories, relevant context items).

4. **External APIs & Integrations:**
   - **Google Gemini API:** Primary generative AI engine used for context extraction, chat interactions, and surfacing relevant memories.
     - *Authentication:* Requires a secure environment variable (`GEMINI_API_KEY`) passed securely in the backend context.
   - **Internal API Routes:** 
     - `/api/context` (`server/src/routes/contextRoutes.js`)
     - `/api/goals` (`server/src/routes/goalsRoutes.js`)
     - `/api/memory` (`server/src/routes/memoryRoutes.js`)
     - `/api/relevant` (`server/src/routes/relevantRoutes.js`)

5. **Agent Overview & Operating Guidelines:**
   - **Available Agent Roles:** 
     - *Codebase Maintenance Agent:* Refactors TypeScript/JavaScript code, ensures styling consistency, and fixes lint errors (`eslint.config.js`).
     - *Feature Implementation Agent:* Builds modular components in `src/components/` and expands backend routes under `server/src/routes/`.
   - **Rules of Engagement:**
     - *Branching Strategy:* All modifications must be executed strictly on dedicated development branches. Never push directly to production or main branches.
     - *Commit Messages:* Follow conventional commits format (e.g., `feat(ui): add memory filter`, `fix(server): resolve db connection timeout`).
     - *File Writing Protocols:* Always validate TypeScript types (`tsconfig.json`, `tsconfig.app.json`) and run linters before completing modifications. Do not overwrite core configuration files unless explicitly instructed.

6. **Security & Guardrails:**
   - **Command Whitelisting:** Autonomous agents are restricted to running safe development and validation commands (e.g., `npm run build`, `npm run lint`, `pnpm test`).
   - **Shell Execution Restrictions:** Direct system-level administrative commands, unauthorized package installations from untrusted registries, or scripts altering system configurations outside the repository boundary are strictly prohibited.
   - **Environment Hardening:** Never hardcode secrets, API tokens, or database credentials. Always reference environment variables via `process.env`.
   - **Data Boundaries:** Agents must not leak environment keys or user data into logs or version control.

7. **File Map:**
   - Repository directory structure and core configuration files:
     ```text
     - .gitignore
     - AGENTS.md
     - Dockerfile
     - README.md
     - eslint.config.js
     - index.html
     - package.json
     - pnpm-lock.yaml
     - pnpm-workspace.yaml
     - public/
       - favicon.svg
       - icons.svg
     - server/
       - AURORA_PROT.code-workspace
       - app.js
       - package.json
       - src/
         - context.js
         - db/database.js
         - routes/
           - contextRoutes.js
           - goalsRoutes.js
           - memoryRoutes.js
           - relevantRoutes.js
         - schemas/memorySchemas.js
         - services/
           - contextService.js
           - geminiService.js
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
     ```