# AGENTS.md

## 1. Overview

**Aurora** is an autonomous AI assistant and orchestration prototype designed to operate within a user's technological environment, adapting tools, workflows, and system interactions to work directly in favor of the user.

### Primary Mission & Agent Roles
- **Aurora Core Agent (`aurora`):** Serves as the primary conversational and task-execution agent. It interprets user intent, plans multi-step execution graphs, coordinates sub-agents, and manipulates the surrounding technological environment.
- **Workflow & Automation Agents (`.github/agents`):** Repository-level autonomous agents designed to handle specialized automation tasks, environment lifecycle operations, continuous integration checks, and contextual system management.

---

## 2. Triggers & Inputs

Aurora and associated automation agents can be invoked through multiple trigger channels:

| Trigger Source | Type | Description |
| :--- | :--- | :--- |
| **Web UI Client** (`src/`) | User Interaction | Direct real-time text/command input via the React/Vite web application interface. |
| **Server API Endpoints** (`server/`) | HTTP / REST / WebSocket | Inbound requests, streaming interactions, and external webhook integrations. |
| **Repository & CI/CD Events** (`.github/agents`) | Event-driven / Webhook | Repository actions, issue triggers, code push, pull request automations, and scheduled agent tasks. |
| **Autonomous System Loops** | Background / Polling | Scheduled task execution and periodic environment state monitoring. |

---

## 3. Tools & Capabilities

Agents operate across a unified runtime integrating client-side interfaces and backend system execution:

### Backend & System Tools (`server/`)
- **System Command Execution:** Local/containerized shell execution capabilities for automated tasks.
- **API & Service Integration:** Connectors for third-party REST/GraphQL services and dynamic web resources.
- **Environment Management:** Context collection, environment variable configuration, and workspace state querying.

### Client-Side Capabilities (`src/`)
- **Interactive UI Rendering:** Real-time feedback, Markdown streaming, tool execution status inspection, and user confirmation modals.
- **Client Tool Invocation:** Local browser-state manipulation and client-side session storage.

---

## 4. Security & Guardrails

To ensure safe operation within host environments, the following guardrails are enforced:

- **Command Sanitization & Whitelisting:** System commands and API calls pass through schema validation and strict parameter checking prior to execution.
- **Approval Boundaries (Human-in-the-Loop):** Destructive system actions, sensitive configuration changes, and external mutations require explicit user confirmation.
- **Sandbox Isolation:** Server-side execution units and sub-processes are bounded to project workspace paths, blocking unauthorized file-system traversal.
- **Environment & Secret Hygiene:** Sensitive tokens and API credentials must be supplied via secure environment variables (`.env`) and are excluded from version control via `.gitignore`.

---

## 5. File Map

```text
aurora_prot/
├── .github/
│   └── agents/               # GitHub-level agent specifications & automation configurations
├── public/                   # Static web assets
├── server/                   # Backend API runtime, agent execution loops, and system tool handlers
├── src/                      # Frontend client application (React + TypeScript interface)
│   ├── assets/               # Client UI static resources
│   └── ...                   # UI components, state management, and API clients
├── .gitignore                # Version control exclusions
├── AGENTS.md                 # Agent architecture and automation documentation
├── eslint.config.js          # Code quality & linting configuration
├── index.html                # Client entry point
├── package.json              # Project dependencies and script definitions
├── pnpm-lock.yaml            # Deterministic dependency lockfile
├── tsconfig.json             # Root TypeScript configuration
├── tsconfig.app.json         # Client-side TypeScript configuration
├── tsconfig.node.json        # Node/Server TypeScript configuration
└── vite.config.ts            # Vite bundler & dev server configuration
```