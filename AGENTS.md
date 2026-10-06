# Project Purpose & Mission

Aurora Protocol is a personalized context-aware assistant and memory management application. Its primary mission is to help users capture memories, manage daily schedules, track goals, and surface relevant contextual information dynamically through a reactive user interface powered by LLM assistance.

# General Architecture & Tech Stack

- **Architecture:** Client-server monorepo layout comprising a modern React/Vite single-page application (SPA) front-end and a Node.js Express back-end server.
- **Frontend Framework:** React 19 with TypeScript, bundled via Vite. Styled with custom modular CSS.
- **Backend Framework:** Node.js with Express (`server/app.js`), incorporating SQLite database integration (`server/src/db/database.js`) and AI capabilities via the Gemini API (`server/src/services/geminiService.js`).
- **Containerization & Deployment:** Dockerized setup utilizing a root `Dockerfile` and `docker-compose.yml` patterns for self-hosted or containerized deployment.
- **Package Management:** `npm` / `pnpm` workspace structure.

# Data Flow

1. **User Trigger:** The user interacts with the React frontend (`App.tsx`), typing a memory or prompt into the `ConversationSection` or fetching views (Daily Breakdown, Goals, Relevant Memories).
2. **API Request Routing:** The frontend calls asynchronous API helper functions defined in `src/services/api.ts`, sending HTTP requests to the Node.js/Express backend (`server/app.js` and associated route modules).
3. **Backend Processing & LLM Integration:** The server routes requests through controllers and services (`server/src/services/contextService.js`, `server/src/services/geminiService.js`). It reads/writes data to the SQLite database (`server/src/db/database.js`) and interfaces with external AI models (Gemini) when context analysis or conversational responses are needed.
4. **Response & UI Update:** The backend returns structured JSON responses back to the frontend API services, which update the React state hooks (`useState`), causing seamless rendering adjustments (e.g., updating messages, memory lists, or daily breakdowns).

# External APIs & Integrations

- **Google Gemini API:** Utilized via `server/src/services/geminiService.js` for generative text, memory evaluation, and context relevance analysis.
  - *Authentication:* Requires a secure API key supplied via environment variables (`GEMINI_API_KEY`).
- **Internal REST Endpoints:** Communication between the frontend client and the Express server runs over HTTP JSON endpoints (e.g., `/api/context`, `/api/goals`, `/api/memory`, `/api/relevant`).

# Agent Overview & Operating Guidelines

- **Autonomous Agents:** AI agents operating within this repository act as assistant developers, bug-fixers, and refactoring utilities. They are responsible for maintaining code quality, ensuring TypeScript safety, and implementing requested feature extensions without disrupting system architecture.
- **Rules of Engagement:**
  - **Branching Policy:** Always perform modifications and create commits on designated development or feature branches (`development` or `feat/*`). Never push directly to `main`/`master` without explicit authorization.
  - **Commit Message Format:** Use conventional commits format (e.g., `feat(ui): add memory filter`, `fix(server): resolve db connection leak`).
  - **File Writing Protocols:** Ensure all edited TypeScript/JavaScript files pass local linting checks (`eslint.config.js`) and adhere strictly to existing formatting standards and types.

# Security & Guardrails

- **Environment Hardening:** Never hardcode sensitive credentials, database secrets, or API keys (`GEMINI_API_KEY`) into source files. Always reference environment variables through `process.env`.
- **Shell Execution:** Autonomous agents are strictly restricted from executing arbitrary, untrusted shell commands or destructive system operations (`rm -rf`, unauthorized global package installations, etc.). Only whitelisted build, test, and dependency installation scripts (`npm test`, `npm run build`, `pnpm install`) are permitted.
- **Input Validation:** All new API endpoints and user inputs must be properly validated using robust schemas (such as those defined in `server/src/schemas/memorySchemas.js`) to protect against injection and malformed payloads.

# File Map

```text
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