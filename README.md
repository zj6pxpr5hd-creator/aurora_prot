# AURORA

A personal AI assistant designed to help organize and surface the information that matters to you.

Aurora combines a conversational interface with persistent memories, tasks, events, and context. Rather than simply answering questions, the goal is for Aurora to understand what is happening in the user's life and surface relevant information at the right time.

> **Status:** Personal project / prototype

## Features

* Conversational interface
* Persistent memories stored in SQLite
* Create, edit, and delete memories through the app
* Tasks, events, notes, and ideas
* Daily breakdown of today's tasks and events
* Upcoming event detection
* Recent conversation context
* Relevant-memory retrieval using Gemini
* Time-aware responses
* Context-aware responses based on persistent memories
* Informational messages when memories are edited or deleted

## Architecture

```text
React / Vite frontend
        │
        │ HTTP requests
        ▼
Express backend
        │
        ├── Gemini API
        │
        └── SQLite database
```

The frontend handles the user interface and conversation state, while the backend is responsible for database access and communication with Gemini.

SQLite is the source of truth for Aurora's persistent memories.

## Tech Stack

* React
* TypeScript
* Vite
* Express
* SQLite
* Gemini API
* pnpm

## Running Locally

Install dependencies:

```bash
pnpm install
```

Start the frontend:

```bash
pnpm dev
```

Start the backend from the server directory:

```bash
pnpm start
```

Aurora requires the appropriate environment variables for the Gemini API key. These should be stored in `.env` files and **must not be committed to Git**.

## Project Structure

```text
aurora/
├── src/              # React frontend
├── server/           # Express backend
│   └── src/
│       └── db/       # SQLite database
├── public/
└── package.json
```

## What Aurora Is

Aurora started as an experiment in building a personal AI secretary and gradually evolved into an exploration of:

* AI-assisted applications
* LLM context and memory
* Backend/frontend architecture
* Persistent user information
* AI agents and autonomous behavior
* Building software around an LLM rather than simply chatting with one

The project is intentionally kept as a personal prototype rather than a finished commercial product.

## Future Ideas

Some possible directions include:

* Smarter memory retrieval
* Notifications and proactive reminders
* Voice interaction
* More dynamic dashboard sections
* Greater awareness of the user's goals and priorities
* Automated actions based on context
* Desktop integration

These ideas are intentionally left open. The main purpose of the project was to explore how far a personal AI assistant could be taken while learning by building it.
