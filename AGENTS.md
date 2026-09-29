# Project Purpose & Mission
Aurora is an AI-powered personal memory and productivity assistant. Its core mission is to help users store, organize, track, and surface personal memories, events, tasks, notes, and goals via an intuitive conversational and dashboard interface. The system leverages intelligent context processing to extract and segment structured data (such as dates, times, and types) from free-form user inputs.

# General Architecture & Tech Stack
The repository is structured as a full-stack monorepo featuring a decoupled client-server architecture:
- **Frontend Layer:** Built with React, TypeScript, and Vite, styled using custom modern CSS (`src/App.tsx`, `src/App.css`). State management relies heavily on React hooks (`useState`, `useEffect`, `useRef`) with persistent chat states stored locally via `localStorage`.
- **Backend/Server Layer:** Located in the `server/` directory, containing Node.js/Express service logic, database handlers (`server/src/db/database.js`), context wrappers (`server/src/context.js`), and time utility operations (`server/src/timeUtils.js`).
- **Package Management:** Uses `pnpm` (with accompanying `pnpm-lock.yaml` files at the root and server levels).
- **Tooling & Linter:** ESLint configuration (`eslint.config.js`) enforces code standards across the TypeScript codebase.

# Data Flow
Data moves through the Aurora application in a structured sequence:
1. **User Trigger / Input:** The user types a natural language prompt or memory into the composer input within the React frontend (`src/App.tsx`).
2. **Client-Side Dispatch:** Upon submission, the frontend updates the local conversation state, appends the message history, and issues an HTTP `POST` request to the backend endpoint (`http://localhost:3000/memory`) with the payload.
3. **Backend Processing & LLM/Agent Execution:** The Express server handles the request, interacts with the database (`server/src/db/database.js`), processes time data (`server/src/timeUtils.js`), and leverages internal context handlers (`server/src/context.js`) to generate structured entries or AI responses.
4. **Response & Interface Update:** The backend returns structured JSON (`AuroraResponse`) to the client. The frontend updates message states, stores history in `localStorage`, and dynamically renders updated views—such as the Daily Breakdown, Upcoming Events, Goals, or relevant surfaced memories.

# External APIs & Integrations
- **Local Express Backend API:** The primary data interface operating on `http://localhost:3000`.
  - `GET /memory` - Retrieves all stored memories.
  - `POST /memory` - Creates/processes a new memory or user message.
  - `PATCH /memory/:id` - Updates an existing memory.
  - `DELETE /memory/:id` - Removes a memory.
  - `GET /memory/today` - Fetches the daily breakdown of events and notes.
  - `GET /memory/upcoming` - Retrieves upcoming due items and events.
  - `GET /goals` - Fetches active goals.
  - `POST /relevant` - Surfaces contextually relevant memories based on recent conversation history.
- **Authentication:** Currently communicates over unauthenticated local HTTP endpoints designed for local deployment environments. Standard JSON headers (`Content-Type: application/json`) are utilized for payload exchange.

# Agent Overview & Operating Guidelines
- **Existing Agents:** 
  - `aurora-frontend-designer` (defined in `.github/agents/aurora-frontend-designer.agent.md`): Specializes in interface design, user experience adjustments, and UI component structuring within the React codebase.
- **Rules of Engagement for AI Agents:**
  - **Branching Policy:** All file modifications must occur exclusively on designated development branches. Never commit or push directly to production branches.
  - **Commit Message Format:** Commit messages must follow conventional commit standards (e.g., `feat(ui): add memory filter`, `fix(server): handle null database response`).
  - **File-Writing Protocols:** Always verify TypeScript types, ensure proper hook dependencies in React components, and maintain clean separation of concerns between the `src/` frontend code and the `server/` backend services. Do not hardcode secrets or modify configuration templates without explicit instructions.

# Security & Guardrails
- **Command Whitelisting:** Autonomous agents are restricted to running safe development scripts defined in `package.json` (e.g., linting, type-checking, builds). Arbitrary or destructive shell execution (`rm -rf`, unverified global package installations) is strictly prohibited.
- **Environment Hardening:** Agents must respect environment variables and never expose API keys, database connection strings, or sensitive user data inside client-side bundles or public logs.
- **Permission Boundaries:** Agents are limited to file manipulation within authorized workspace directories (`src/`, `server/`, and documentation files). System-level configuration files outside the repository boundaries are strictly off-limits.

# File Map
- `.github/agents/aurora-frontend-designer.agent.md` - Agent instruction profile for frontend design tasks
- `.gitignore` - Git ignore rules
- `AGENTS.md` - Core instruction manual for autonomous agents (this document)
- `README.md` - Project overview and setup instructions
- `eslint.config.js` - Linter configuration
- `index.html` - HTML entry point
- `package.json` - Root project dependencies and scripts
- `pnpm-lock.yaml` - Root dependency lockfile
- `public/favicon.svg` - Application favicon
- `public/icons.svg` - SVG sprite sheet
- `server/AURORA_PROT.code-workspace` - VS Code workspace configuration for the server
- `server/app.js` - Express application entry point
- `server/package-lock.json` - Server dependency lockfile
- `server/package.json` - Server dependencies and scripts
- `server/pnpm-lock.yaml` - Server dependency lockfile
- `server/src/context.js` - AI context management and processing logic
- `server/src/db/database.js` - Database connection and query handlers
- `server/src/timeUtils.js` - Time parsing and calculation utilities
- `src/App.css` - Global application styling
- `src/App.tsx` - Core React application root and UI component logic
- `src/EventList.tsx` - Component for rendering lists of events and memories
- `src/index.css` - Base CSS resets and variables
- `src/main.tsx` - React DOM mounting script
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript compiler configurations
- `vite.config.ts` - Vite build tool configuration