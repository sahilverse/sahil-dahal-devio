FROM node:20-slim

# Install pnpm and dependencies
RUN apt-get update && apt-get install -y python3 make g++ curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

# Copy root configs
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy internal packages (needed for frontend)
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/zod ./packages/zod

# Copy the frontend app
COPY apps/frontend ./apps/frontend

# Install dependencies (including workspace links)
RUN pnpm install --frozen-lockfile

# Switch to the app directory
WORKDIR /app/apps/frontend

# Port exposed for dev
EXPOSE 3000

CMD ["pnpm", "dev"]
