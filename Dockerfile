# ==========================================
# STAGE 1: Build the React / Vite Frontend
# ==========================================
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
FROM node:20-alpine AS backend-builder
# Install Python, Make, and G++ required to compile better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

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

# Create the folder where the SQLite database file will live inside the container
RUN mkdir -p /app/server/data

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy installed production dependencies from Stage 2
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/server/node_modules ./server/node_modules

# Copy backend source code
COPY server ./server

EXPOSE 5000

# Start the Express server
CMD ["node", "server/app.js"]