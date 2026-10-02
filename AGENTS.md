# AGENTS.md

## 1. Project Purpose & Mission
Aurora is an intelligent, context-aware AI assistant and memory-management system designed to help users structure their days, track goals, record personal memories, and interact via an adaptive conversation interface. The overarching goal of the system is to bridge structured personal data (daily breakdowns, upcoming events, and long-term goals) with dynamic, LLM-powered conversational processing to surface relevant insights precisely when needed.

## 2. General Architecture & Tech Stack
- **Architecture Layout:** Monorepo containing a modern Single Page Application (SPA) frontend and a dedicated Node.js/Express backend server communicating via REST API interfaces.
- **Frontend Tech Stack:** 
  - React 18+ with TypeScript (`src/App.tsx`, Vite build tool)
  - CSS for styling (`src/App.css`, `src/index.css`)
- **Backend Tech Stack:** 
  - Node.js with Express (`server/app.js`)
  - SQLite/Database integration layer (`server/src/db/database.js`)
  - Google Gemini API integration for LLM agent processing (`server/src/services/geminiService.js`)
- **Package Management:** `pnpm` (utilized across root and server directories)
- **Environment Requirements:** Node.js runtime, configured environment variables for API keys (e.g., Gemini API keys).

## 3. Data Flow
1. **User Trigger:** The user interacts with the UI (`App.tsx`), either by typing a message/memory into the `ConversationSection` or by navigating through views like daily breakdowns and memory editors.
2. **Frontend Request:** The frontend uses wrapper services (`src/services/api.ts`) to execute asynchronous HTTP requests (GET/POST) targeting the Express backend.
3. **Backend Parsing & Routing:** 
   - Express routes (`server/src/routes/*.js`) intercept requests, passing payloads to relevant services (`server/src/services/*.js`).
   - Context is injected via utility and context managers (`server/src/context.js`, `server/src/timeUtils.js`).
4. **LLM/Agent Processing:** If conversational memory creation or relevance matching is triggered, the backend queries the Google Gemini API (`server/src/services/geminiService.js`) with the relevant prompt payload.
5. **Persistence & Return:** Data is written to or read from the SQLite database (`server/src/db/database.js`), and JSON responses are returned up through the API layer to update frontend state (`messages`, `memories`, `dailyBreakdown`, etc.).

## 4. External APIs & Integrations
- **Google Gemini API:** 
  - Purpose: Powers intelligent memory extraction, conversational responses, and relevant memory surfacing.
  - Authentication: Requires API key configuration via secure environment variables injected into the backend runtime environment.
- **Internal REST Endpoints:**
  - `/api/context`: Context management routes
  - `/api/goals`: Goal tracking and retrieval
  - `/api/memory`: Memory CRUD operations
  - `/api/relevant`: Contextual/relevant memory matching

## 5. Agent Overview & Operating Guidelines
- **Existing Agents:**
  - `aurora-frontend-designer`: Specialized agent situated in `.github/agents/aurora-frontend-designer.agent.md` tasked with managing UI/UX components, CSS styles, and React state architectures.
- **Rules of Engagement:**
  - **Branching Strategy:** All modifications, bug fixes, or feature additions must be executed and committed exclusively on designated development branches (`dev/*` or feature branches). Never commit directly to production/main branches.
  - **Commit Message Format:** Follow conventional commits (e.g., `feat(ui): add memory filter`, `fix(server): resolve db connection leak`).
  - **File-Writing Protocols:** Always respect existing TypeScript typings (`src/types/memory.ts`) and maintain strict separation of concerns between frontend presentation components and backend services. Do not hardcode secrets or API keys.

## 6. Security & Guardrails
- **Command Whitelisting:** Autonomous agents are restricted to running safe project scripts (`pnpm install`, `pnpm dev`, `pnpm build`, `pnpm lint`). Destructive shell executions (e.g., recursive deletions, unauthorized global system modifications) are strictly prohibited.
- **Environment Hardening:** Sensitive credentials (API keys, database files) must never be committed to version control. Ensure `.env` configurations are respected and ignored by git.
- **Permission Boundaries:** Agents may read and modify application source code, configuration files, and documentation within this repository, but must not access external networks or systems outside the defined API integration surface.

## 7. File Map
```text
.
├── .github/
│   └── agents/
│       └── aurora-frontend-designer.agent.md
├── .gitignore
├── AGENTS.md
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
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
│   │   └── timeUtils.js
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
│   │   └── RightColumnSections.tsx
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