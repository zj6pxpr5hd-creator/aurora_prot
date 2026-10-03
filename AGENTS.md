# AGENTS.md

## 1. Project Purpose & Mission
Aurora is an AI-powered personal assistant and context-management web application designed to help users organize their daily lives, track goals, manage upcoming events, and maintain a persistent memory store. The overarching goal of the system is to provide a seamless, conversational interface backed by intelligent context-retrieval mechanisms that surface relevant personal insights precisely when needed.

## 2. General Architecture & Tech Stack
- **Architecture:** Monorepository containing a decoupled client-server setup consisting of a Single Page Application (SPA) frontend and a Node.js/Express backend service.
- **Frontend Framework:** React 18+ with TypeScript, Vite, and custom CSS styling.
- **Backend Framework:** Node.js with Express, structured around modular routing and service layers.
- **Database:** Local database storage managed via custom database service layers (`server/src/db/database.js`).
- **AI/LLM Integration:** Google Gemini integration via `geminiService.js` for natural language processing, memory extraction, and context reasoning.
- **Environment Requirements:** Node.js (v18+ recommended), PNPM or NPM for dependency management.

## 3. Data Flow
1. **User Trigger:** The user interacts with the React frontend (e.g., typing a message into the `ConversationSection` or modifying memories).
2. **API Request:** The client dispatches asynchronous HTTP requests via `src/services/api.ts` to backend Express endpoints (`server/src/routes/`).
3. **Webhook & Route Parsing:** Express routes intercept the payload, validate parameters against defined schemas (`server/src/schemas/memorySchemas.js`), and delegate business logic to corresponding services (`server/src/services/`).
4. **Agent & LLM Processing:** Services interact with the local database or invoke the Gemini API (`geminiService.js`) to generate responses, extract structural insights, or compute relevant memories.
5. **Response & Rendering:** The backend serializes the processed data back to JSON. The frontend updates its component state, rendering changes dynamically across views (Conversation, Daily Breakdown, Goals, and Memory management views).

## 4. External APIs & Integrations
- **Google Gemini API:** Utilized for advanced text generation, contextual analysis, and memory relevance matching.
  - **Authentication:** Requires a secure API key supplied via environment variables (`GEMINI_API_KEY`) loaded on the server side.
- **Internal REST Endpoints:**
  - `/api/context`: Contextual data management.
  - `/api/goals`: Goal tracking operations.
  - `/api/memory`: Memory creation, updating, and retrieval.
  - `/api/relevant`: Dynamic context-matching for active conversation states.
  - **Authentication / Headers:** Standard `Content-Type: application/json` headers; API routes assume internal trust boundaries within the containerized or local deployment setup.

## 5. Agent Overview & Operating Guidelines
- **Existing Agents:**
  - `aurora-frontend-designer` (`.github/agents/aurora-frontend-designer.agent.md`): Specialized agent responsible for user interface design patterns, component styling, and frontend layout structures.
- **Rules of Engagement for AI Agents:**
  - **Branching Strategy:** Always execute changes on designated development branches. Never push directly to production or main branches without explicit verification and authorization.
  - **Commit Messages:** Use clear, conventional commit formats (e.g., `feat(ui): add new memory item component`, `fix(server): resolve null pointer in context service`).
  - **File-Writing Protocols:** Always verify existing types, schema validations, and dependencies before modifying files. Ensure TypeScript types (`src/types/memory.ts`) remain synchronized with backend schemas.

## 6. Security & Guardrails
- **Command Whitelisting:** Agents are restricted to running safe package manager scripts (`pnpm build`, `pnpm test`, `npm run dev`), linting tools (`eslint`), and type-checking scripts.
- **Shell Execution Restrictions:** Direct destructive shell commands (e.g., `rm -rf`, raw database drops, or unauthorized network requests outside configured service bindings) are strictly prohibited.
- **Environment Hardening:** Secret keys, API tokens (such as Gemini API keys), and database credentials must never be hardcoded into source files and must only be read from protected environment configuration files (`.env`).
- **Input Validation:** All incoming payloads on the server side must pass schema validation (`server/src/schemas/memorySchemas.js`) before interacting with database layers or external LLM services.

## 7. File Map
```text
.
├── .github/
│   └── agents/
│       └── aurora-frontend-designer.agent.md
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