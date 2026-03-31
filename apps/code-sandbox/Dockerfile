FROM node:20-slim

# Install build dependencies for node-pty and other native modules
RUN apt-get update && apt-get install -y python3 make g++ curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

# Copy root configs
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy internal packages (needed)
COPY packages/typescript-config ./packages/typescript-config
COPY packages/zod ./packages/zod

# Copy the app
COPY apps/code-sandbox ./apps/code-sandbox

# Install all dependencies (including workspace links)
RUN pnpm install --frozen-lockfile

# Finalize build
WORKDIR /app/apps/code-sandbox

EXPOSE 8000

CMD ["pnpm", "dev"]
