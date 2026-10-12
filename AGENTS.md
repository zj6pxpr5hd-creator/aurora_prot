# AGENTS.md

## 1. Project Purpose & Mission
Aurora (codenamed Aurora Protocol) is an intelligent, context-aware memory and daily planning web application. Its primary mission is to act as an empathetic, reflective assistant that helps users track personal memories, organize daily schedules, monitor goal progression, and surface contextual insights using advanced AI services (Google Gemini). The system bridges local reactive UI state with backend intelligence to provide real-time updates, conversational memory management, and structured daily breakdowns.

---

## 2. General Architecture & Tech Stack
- **High-Level Infrastructure:** Client-server web application architecture structured around a Vite-powered single-page frontend and a Node.js Express backend API, containerized via Docker.
- **Frontend Framework:** React 18+ with TypeScript, utilizing functional components, hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`), and custom CSS styling.
- **Backend Framework:** Node.js with Express (`server/app.js`), modularized routing, and local data persistence via custom database abstraction layers (`server/src/db/database.js`).
- **AI / LLM Integration:** Google Gemini SDK (`server/src/services/geminiService.js`) integrated within backend services to drive context analysis and memory surfacing.
- **Environmental Requirements:** 
  - Node.js (v18+ recommended)
  - Package Managers: `npm`, `pnpm` (Workspace support via `pnpm-workspace.yaml`), or `yarn`
  - Required Environment Variables: `PORT`, `GEMINI_API_KEY` (configured in backend runtime)

---

## 3. Data Flow
1. **User Trigger:** The user interacts with the UI (e.g., typing a prompt in `ConversationSection`, triggering memory modifications, or requesting daily breakdowns).
2. **API Request & Routing:** 
   - Frontend API client (`src/services/api.ts`) dispatches asynchronous HTTP requests (`fetch`) to backend REST endpoints (e.g., `/api/context`, `/api/goals`, `/api/memory`, `/api/relevant`).
   - Express router maps incoming requests to appropriate route controllers (`server/src/routes/*`).
3. **Business Logic & AI Processing:**
   - Services (`server/src/services/*`) process application context, interact with the local database (`server/src/db/database.js`), or format payloads for external LLM inference.
   - `geminiService.js` structures prompts and queries the Google Gemini API to generate intelligent summaries, daily layouts, and relevant memory extractions.
4. **Response & State Hydration:** 
   - The backend returns JSON responses back to the frontend service layer.
   - React components update their local state or fallback to `localStorage` caching (e.g., chat messages), triggering efficient re-renders and auto-scrolling behaviors.

---

## 4. External APIs & Integrations
- **Google Gemini API:**
  - **Purpose:** Generative AI responses, context matching, memory relevance scoring, and content structuring.
  - **Authentication:** Requires a valid API key passed via environment configuration (`GEMINI_API_KEY`).
- **Internal REST Endpoints:**
  - `/api/context` - Manages contextual snapshots.
  - `/api/goals` - Fetches and updates user goal metrics.
  - `/api/memory` - CRUD operations for user memories and chat interactions.
  - `/api/relevant` - Queries and surfaces memories relevant to active conversations.

---

## 5. Agent Overview & Operating Guidelines
- **Available Agent Roles:**
  - **Frontend Refactoring & Feature Agent:** Responsible for `src/` components, TypeScript definitions (`src/types/`), and React performance tuning (`useCallback`, `useMemo`).
  - **Backend API & Service Agent:** Responsible for `server/` endpoints, database interactions, error-handling middleware, and LLM integrations.
- **Rules of Engagement:**
  - **Branch Protection:** Autonomous agents MUST perform all file modifications, refactoring, and feature implementations exclusively on designated development branches (`dev` or feature branches). Direct pushes to `main`/`master` are strictly prohibited.
  - **Commit Message Standards:** Follow conventional commit formatting (e.g., `feat(ui): add memory filter`, `fix(server): handle gemini timeout gracefully`).
  - **File-Writing Protocols:** Always verify dependencies and schema validations (`server/src/schemas/memorySchemas.js`) before modifying data models. Maintain clean separation between client UI logic and server-side orchestration.

---

## 6. Security & Guardrails
- **Command Whitelisting:** Agents are permitted to execute safe development and build commands (e.g., `npm run build`, `pnpm install`, linter checks via `eslint.config.js`). 
- **Shell Execution Restrictions:** Direct system-level modifications, execution of arbitrary shell commands outside project scopes, or modifications to host system configurations are strictly blocked.
- **Environment Hardening:** 
  - Never hardcode API keys, secrets, or database credentials in source code. Always reference environment variables via `process.env`.
  - Validate and sanitize all incoming payloads on the backend service layer before passing them to external LLMs or local data stores.

---

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
├── public
│   ├── favicon.svg
│   └── icons.svg
├── server
│   ├── AURORA_PROT.code-workspace
│   ├── app.js
│   ├── package-lock.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   └── src
│       ├── context.js
│       ├── db
│       │   └── database.js
│       ├── routes
│       │   ├── contextRoutes.js
│       │   ├── goalsRoutes.js
│       │   ├── memoryRoutes.js
│       │   └── relevantRoutes.js
│       ├── schemas
│       │   └── memorySchemas.js
│       ├── services
│       │   ├── contextService.js
│       │   └── geminiService.js
│       └── timeUtils.js
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── EventList.tsx
│   ├── components
│   │   ├── ConversationSection.tsx
│   │   ├── DailyBreakdownSection.tsx
│   │   ├── Header.tsx
│   │   ├── Icons.tsx
│   │   ├── MemoryEditor.tsx
│   │   ├── MemoryItem.tsx
│   │   └── RightColumnSections.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── services
│   │   └── api.ts
│   └── types
│       └── memory.ts
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```