# QUICK NOTES ON DOCKER FOR MYSELF:
# A Dockerfile is a text document containing step-by-step instructions that tells 
# Docker how to build and package an application into a portable, runnable container.
# FROM: Downloads a mini operating system to use as a starting point.
# WORKDIR: Creates and opens a working directory (like double-clicking a folder).
# COPY: Copies files from your computer into the container.
# RUN: Executes a command line inside the container during assembly.
# ENV: Sets a configuration variable.
# EXPOSE: Documents which network port the application uses.
# CMD: The final command executed when the container turns on.

# ==========================================
# STAGE 1: Build the React / Vite Frontend
# ==========================================
# creates a new image based on the official Node.js 20 image with Alpine Linux
FROM node:20-alpine AS frontend-builder 
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy root lockfiles & package manifests for pnpm workspace caching
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY server/package.json ./server/

# Install all dependencies (including devDependencies needed for Vite)
RUN pnpm install --frozen-lockfile

# Copy full source code and build the React frontend
COPY . .
RUN pnpm build

# ==========================================
# STAGE 2: Prepare Backend Dependencies
# ==========================================
# This stage is needed to install production dependencies for the backend (Express server) without including devDependencies.
FROM node:20-alpine AS backend-builder
# Install Python, Make, and G++ required to compile better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy root lockfiles & package manifests for pnpm workspace caching
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY server/package.json ./server/

# Install only production dependencies for the server
RUN pnpm install --filter ./server... --prod --frozen-lockfile

# ==========================================
# STAGE 3: Production Runner Container
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Create directory for persistent SQLite database
RUN mkdir -p /app/server/data

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy root node_modules intact from Stage 2 to avoid reinstalling dependencies
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# Copy backend source code
COPY server ./server





EXPOSE 5000

# Start the Express server
CMD ["node", "server/app.js"]