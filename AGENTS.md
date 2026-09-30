# Project Purpose & Mission

Aurora is an intelligent, context-aware memory and daily orchestration platform designed to assist users in managing daily workflows, tracking goals, reviewing schedule breakdowns, and capturing personal reflections. The core mission is to bridge unstructured human thoughts with structured, actionable context through conversational interfaces and automated memory retrieval.

# General Architecture & Tech Stack

## Infrastructure Layout
- **Frontend Layer:** Single-Page Application (SPA) built with Vite and React, communicating via asynchronous REST APIs.
- **Backend Layer:** Node.js Express server handling core business logic, database orchestration, and external AI integrations.
- **Database Layer:** Local SQLite/relational database accessed via embedded driver integrations (`server/src/db/database.js`).
- **AI Integration:** Google Gemini service integration for advanced natural language processing, intent extraction, and relevant memory surfacing.

## Core Frameworks, Languages & Environmental Requirements
- **Languages:** TypeScript (Frontend), JavaScript (Backend Node.js)
- **Frontend Framework:** React 18+ with Vite
- **Backend Framework:** Express.js
- **Package Management:** `pnpm` (root and server workspaces)
- **Runtime Environment:** Node.js (LTS version recommended)

# Data Flow

1. **User Trigger:** The user interacts with the React frontend (e.g., submitting a message in the `ConversationSection`, editing a memory, or loading the application dashboard).
2. **API Request Dispatch:** The frontend service layer (`src/services/api.ts`) transmits HTTP requests (GET/POST/PUT/DELETE) to the Express backend (`server/app.js` and associated routers).
3. **Backend Routing & Processing:** 
   - Routes (`server/src/routes/`) direct traffic to appropriate services (`server/src/services/`).
   - Business logic coordinates with the database (`server/src/db/database.js`) to persist or query core records (memories, goals, events).
4. **LLM / Agent Augmentation:** For context-heavy tasks like evaluating relevant memories or summarizing chat inputs, the backend queries the Google Gemini service (`server/src/services/geminiService.js`).
5. **Response Delivery:** The structured JSON payload returns through the Express route to the frontend API layer, updating local React component state, storage (`localStorage`), and re-rendering the UI (e.g., updating the daily breakdown, relevant memories, or conversation stream).

# External APIs & Integrations

- **Google Gemini API:** 
  - **Purpose:** Powers text generation, contextual analysis, and relevant memory mapping.
  - **Endpoint / SDK:** Managed via Google's official Node.js generative AI SDK / service wrapper (`server/src/services/geminiService.js`).
  - **Authentication:** Requires a secure API key supplied via environment variables (`GEMINI_API_KEY`).

# Agent Overview & Operating Guidelines

## Existing Agents
- **`aurora-frontend-designer.agent.md`:** Located in `.github/agents/`. Responsible for maintaining UI/UX consistency, designing React components, and ensuring alignment with the Aurora styling architecture.

## Rules of Engagement for Autonomous Agents
- **Branch Protection:** Agents must perform all file modifications, bug fixes, and feature implementations exclusively on designated development or feature branches. Direct commits to production branches are strictly forbidden.
- **Commit Message Conventions:** Use clear, conventional commit formats (e.g., `feat(ui): add memory filter`, `fix(api): handle missing database constraints`).
- **File-Writing Protocols:** Always verify TypeScript types and lint rules (`eslint.config.js`) before completing tasks. Ensure no hardcoded secrets or environment tokens are committed to source control.

# Security & Guardrails

- **Command Whitelisting:** Agents are authorized to run package manager scripts (`pnpm install`, `pnpm build`, `pnpm lint`) and testing suites. Arbitrary, destructive system commands (e.g., `rm -rf`, system-level modifications) are strictly restricted.
- **Environment Hardening:** All sensitive configurations, database credentials, and API keys must be loaded exclusively from environment variables. Do not log sensitive payloads or user conversational data to standard output.
- **File System Boundaries:** Agents are restricted to modifying files strictly within the repository workspace boundary.

# File Map

```text
├── .github/
│   └── agents/
│       └── aurora-frontend-designer.agent.md
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
│   │   ├── RightColumnSections.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── services/
│   │   └── api.ts
│   └── types/
│       └── memory.ts
├── .gitignore
├── AGENTS.md
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── pnpm-lock.yaml
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```