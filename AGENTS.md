1. Project Purpose & Mission:
- Project Name: Aurora Protocol (AURORA_PROT)
- Purpose: A unified, intelligent workspace and assistant interface designed to track user goals, daily breakdowns, upcoming events, and long-term/relevant memories. 
- Overarching Goals: Provide a seamless, responsive UI combined with a robust backend service capable of context management, semantic/relevant memory processing, and external LLM interactions (Gemini) to act as an autonomous personal operating system.

2. General Architecture & Tech Stack:
- Infrastructure Layout: Full-stack application containerized via Docker (`Dockerfile`, `docker-compose.yml` equivalents), featuring a decoupled frontend SPA and a Node.js/Express backend server.
- Core Frameworks & Libraries: 
  - Frontend: React 18+ with TypeScript, Vite, CSS styling.
  - Backend: Node.js with Express, SQLite database integration (`server/src/db/database.js`).
- Languages: TypeScript (Frontend), JavaScript (Backend).
- Environmental Requirements: Node.js runtime, npm/pnpm package managers, SQLite for local persistence, and external LLM API credentials (Gemini).

3. Data Flow:
- Trigger: User interacts with the UI (e.g., enters a chat message or creates a memory via `App.tsx`).
- API Request: The frontend invokes API services (`src/services/api.ts`) communicating with Express backend routes (e.g., `/api/context`, `/api/goals`, `/api/memory`).
- Backend Processing: 
  - Routes (`server/src/routes/`) pass payloads to services (`server/src/services/`).
  - Services interact with the SQLite database and external intelligence layers (e.g., `geminiService.js`).
- Response Handling: Processed data/AI inference is returned via JSON payloads to the frontend, updating the application state (e.g., conversation threads, relevant memories, daily breakdowns) and persisting states locally via `localStorage` or the database.

4. External APIs & Integrations:
- Third-Party Services: Google Gemini API (via `geminiService.js`) for natural language understanding, context generation, and relevant memory extraction.
- Endpoints & Routes:
  - `/api/context`: Context management and synchronization.
  - `/api/goals`: Goal tracking and retrieval.
  - `/api/memory`: Memory creation, updating, and retrieval.
  - `/api/relevant`: Surfacing contextual and relevant memories based on active conversations.
- Authentication & Headers: Standard HTTP JSON headers (`Content-Type: application/json`), with API keys securely injected via server-side environment variables (`process.env`).

5. Agent Overview & Operating Guidelines:
- Active Agents: Autonomous coding, refactoring, and documentation agents operating within this workspace.
- Roles: Maintain code health, implement feature updates in accordance with TypeScript types, ensure UI/UX consistency, and safeguard backend routes and database schemas.
- Rules of Engagement:
  - Branching Strategy: Strict adherence to modifying files only on designated development branches. Direct commits to production/main branches are strictly prohibited.
  - Commit Messages: Use clear, descriptive commit messages following conventional commit structures (e.g., `feat: add new memory filtering`, `fix: handle abort controller in useEffect`).
  - File Writing Protocols: Validate all file edits against existing TypeScript definitions (`src/types/memory.ts`) and ensure proper error handling and performance optimizations (e.g., `useCallback`, `useMemo`) are preserved.

6. Security & Guardrails:
- Command Whitelisting: Only approved development and package-management commands (`npm test`, `npm run build`, `pnpm install`, linting tools) are permitted.
- Shell Execution Restrictions: Arbitrary shell command execution, unauthorized network requests, and external package installations without prior vetting are strictly blocked.
- Environment Hardening: Never hardcode API keys, secrets, or database connection strings. Always rely on `.env` templates and server-side environment variables.
- Permission Boundaries: Agents are restricted to modifying repository files and must not access host system environments or unrelated system directories.

7. File Map:
- .gitignore
- AGENTS.md
- Dockerfile
- README.md
- eslint.config.js
- index.html
- package-lock.json
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- public/
  - favicon.svg
  - icons.svg
- server/
  - AURORA_PROT.code-workspace
  - app.js
  - package-lock.json
  - package.json
  - pnpm-lock.yaml
  - src/
    - context.js
    - db/
      - database.js
    - routes/
      - contextRoutes.js
      - goalsRoutes.js
      - memoryRoutes.js
      - relevantRoutes.js
    - schemas/
      - memorySchemas.js
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
  - services/
    - api.ts
  - types/
    - memory.ts
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts