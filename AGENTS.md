# Project Purpose & Mission

Aurora is an intelligent, context-aware memory and lifestyle assistant application designed to help users track personal goals, manage daily breakdowns, surface relevant life context, and interact via an AI-driven conversational interface. The overarching goal of the system is to act as a personal cognitive extension—organizing unstructured thoughts, memories, events, and long-term objectives into an actionable, responsive dashboard.

# General Architecture & Tech Stack

- **Architecture Layout:** Single-page client frontend communicating with a dedicated Node.js backend server, backed by a persistent local storage database layer, integrated with external LLM services (Google Gemini).
- **Frontend Framework:** React 18+ with TypeScript, bundled via Vite.
- **Backend Runtime:** Node.js using Express/custom HTTP routes.
- **Languages:** TypeScript (Frontend), JavaScript (Backend).
- **Styling:** CSS modules / global stylesheet (`App.css`, `index.css`).
- **Package Management:** `pnpm` (with fallback configuration support for npm/yarn).
- **Environmental Requirements:** Node.js (v18+ recommended), environment variables for API keys (e.g., Google Gemini API credentials).

# Data Flow

1. **User Trigger:** The user interacts with the UI—either by typing a message in the conversation section, editing a memory, or loading the dashboard.
2. **API Request Dispatch:** The React frontend (`src/services/api.ts`) fires an asynchronous HTTP request using `fetch` with optional `AbortController` signals to the Node.js backend (`server/src/routes/`).
3. **Backend Route & Service Processing:** 
   - Requests hit respective routers (`contextRoutes.js`, `goalsRoutes.js`, `memoryRoutes.js`, `relevantRoutes.js`).
   - Business logic is handled by services (`contextService.js`, `geminiService.js`) which interact with the database layer (`database.js`).
   - External LLM calls (Google Gemini) process prompts, context matching, and natural language generation when analyzing memories or user intent.
4. **Response & State Update:** The backend returns structured JSON data to the frontend, which updates local React state (`useState`), synchronizes local storage (`localStorage`), and triggers UI re-renders (e.g., updating conversation messages, daily breakdowns, or relevant memories lists).

# External APIs & Integrations

- **Google Gemini API:** Utilized via `server/src/services/geminiService.js` for natural language processing, context generation, and intelligent memory surfacing.
  - **Authentication:** Bearer tokens / API keys passed securely via server-side environment variables (`process.env.GEMINI_API_KEY` or equivalent).
- **Internal REST Endpoints:**
  - `/api/memories` (CRUD operations for user memories)
  - `/api/daily-breakdown` (Fetch daily schedule and breakdown items)
  - `/api/goals` (Fetch and manage user goals)
  - `/api/relevant` (Surface contextually relevant memories based on active conversations)

# Agent Overview & Operating Guidelines

## Existing Agents
- **Aurora Frontend Designer (`.github/agents/aurora-frontend-designer.agent.md`):** Specialized agent responsible for managing UI/UX components, CSS styles, and React layout integrity within the `src/` directory.

## Rules of Engagement for AI Agents
1. **Branch Hygiene:** Modify files strictly on designated feature/development branches. Direct pushes to production or main branches are strictly prohibited.
2. **Commit Message Format:** Use conventional commits format (e.g., `feat(ui): add memory filter`, `fix(api): handle abort controller errors`).
3. **File-Writing Protocols:** Always verify dependencies and TypeScript interfaces (`src/types/memory.ts`) before altering component props or API payloads. Avoid introducing unvetted external dependencies.
4. **State Management Integrity:** Maintain existing React patterns (e.g., proper cleanup with `AbortController` in `useEffect` hooks) to prevent memory leaks and race conditions.

# Security & Guardrails

- **Command Whitelisting:** Autonomous agents are restricted to executing safe build, test, and lint commands (`pnpm lint`, `pnpm build`, `pnpm test`). Destructive shell commands (e.g., `rm -rf`, unauthorized global package installations, or database wipes) are strictly blocked.
- **Environment Hardening:** Never hardcode API keys, secrets, or credentials in source files. Always reference `process.env` or local `.env` configurations (which must remain ignored in `.gitignore`).
- **Boundary Restrictions:** Agents must operate exclusively within the repository workspace. Access to external networks is restricted strictly to fetching declared package registries or official API integrations required by tasks.

# File Map

```text
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
│   └── src/
│       ├── context.js
│       ├── db/
│       │   └── database.js
│       ├── routes/
│       │   - contextRoutes.js
│       │   - goalsRoutes.js
│       │   - memoryRoutes.js
│       │   - relevantRoutes.js
│       ├── schemas/
│       │   └── memorySchemas.js
│       └── services/
│           ├── contextService.js
│           └── geminiService.js
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