# Project Purpose & Mission
Aurora is an AI-powered personal context, memory, and schedule management system designed to serve as a companion for day-to-day organization. The platform ingests user notes, extracts key insights, tracks ongoing goals, manages upcoming events, and provides relevant memories surfaced contextually through conversation and automated daily breakdowns. The mission of this repository is to maintain a robust, high-performance, and secure full-stack application supporting both a React-based frontend and an Express/Node.js backend integrated with modern LLM capabilities.

# General Architecture & Tech Stack
- **Infrastructure Layout:** Self-hosted / containerized setup (supported via Docker) running a split client-server paradigm.
- **Frontend Framework:** React 18+ with TypeScript, bundled via Vite. Styled with custom modular CSS.
- **Backend Architecture:** Node.js with Express (`server/`), interfacing with an embedded/local SQLite or persistent store via specialized database handlers.
- **AI / LLM Integration:** Google Gemini APIs (`server/src/services/geminiService.js`) powering natural language understanding, context synthesis, and memory retrieval.
- **Environmental Requirements:** Node.js (v18+ recommended), npm/pnpm package managers, Docker / Docker Compose for containerized runtime.

# Data Flow
1. **User Trigger:** The user interacts with the UI (e.g., typing a message or memory into the `ConversationSection` in `App.tsx`, or triggering a background refresh for daily breakdowns).
2. **API Request & Routing:** The React frontend makes asynchronous HTTP/API calls via `src/services/api.ts` to the backend Express server endpoints (e.g., `/api/context`, `/api/goals`, `/api/memory`, `/api/relevant`).
3. **Backend Processing & LLM Inference:** Server routes (`server/src/routes/`) process the requests using internal services (`server/src/services/`). When generating insights or querying semantic content, requests are routed to the Gemini AI service.
4. **Data Persistence:** Data is read/written to the database (`server/src/db/database.js`) and persistent state handlers.
5. **UI Update:** The backend responds with JSON payloads, which the React frontend processes and renders through specialized functional components (e.g., `DailyBreakdownSection`, `MemoryEditor`, `RightColumnSections`), updating local storage or component state accordingly.

# External APIs & Integrations
- **Google Gemini API:** Utilized for generative AI capabilities, context evaluation, and intelligent memory surfacing.
  - *Authentication:* Requires a secure API key passed via environment variables (`GEMINI_API_KEY`) on the server side.
- **Internal REST Endpoints:**
  - `/api/context`: Contextual data management.
  - `/api/goals`: Goal tracking and retrieval.
  - `/api/memory`: Memory creation, modification, and deletion.
  - `/api/relevant`: Semantic/relevant memory matching based on current dialogue state.

# Agent Overview & Operating Guidelines
- **Agent Roles:** 
  - *Code Generation Agents:* Responsible for implementing new React components, optimizing hooks (`useCallback`, `useMemo`), and extending backend API routes.
  - *Maintenance & Security Agents:* Responsible for dependency updates, linting checks (`eslint.config.js`), and vulnerability scanning.
- **Rules of Engagement:**
  - **Branching Policy:** All code modifications must occur exclusively on designated feature or development branches. Never commit directly to production or main branches without explicit peer review/validation.
  - **Commit Message Format:** Use clear, conventional commit styles (e.g., `feat: add memory filtering`, `fix: resolve daily breakdown race condition`).
  - **File-Writing Protocols:** Preserve existing TypeScript type definitions (`src/types/memory.ts`) and adhere strictly to the established file architecture. Do not introduce extraneous build configurations or modify core workspace configurations (`pnpm-workspace.yaml`, `tsconfig.json`) without justification.

# Security & Guardrails
- **Command Whitelisting:** Autonomous agents are restricted to running safe development commands (`npm run build`, `npm run lint`, `pnpm test` equivalents). Destructive shell execution (e.g., unfiltered `rm`, arbitrary global package uninstalls, unauthorized network requests) is strictly prohibited.
- **Environment Hardening:** Secret tokens, database credentials, and API keys (such as `GEMINI_API_KEY`) must never be hardcoded into source files. They must be ingested exclusively via `.env` configurations and ignored via `.gitignore`.
- **Permissions Boundary:** Agents operate with sandboxed repository access. They are forbidden from altering system-level host configurations or accessing directories outside the designated repository workspace.

# File Map
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
│   └── src/
│       ├── context.js
│       ├── db/
│       │   └── database.js
│       ├── routes/
│       │   ├── contextRoutes.js
│       │   ├── goalsRoutes.js
│       │   ├── memoryRoutes.js
│       │   └── relevantRoutes.js
│       ├── schemas/
│       │   └── memorySchemas.js
│       ├── services/
│       │   ├── contextService.js
│       │   └── geminiService.js
│       └── timeUtils.js
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