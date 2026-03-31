FROM node:20-slim

# Install build dependencies
RUN apt-get update && apt-get install -y python3 make g++ openssl curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

# Copy root configs for workspace structure
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy internal packages (needed for backend)
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/zod ./packages/zod
COPY packages/boilerplate-generator ./packages/boilerplate-generator

# Copy the backend app
COPY apps/backend ./apps/backend

# Install dependencies (including workspace links)
RUN pnpm install --frozen-lockfile

# Switch to the app directory
WORKDIR /app/apps/backend

# Generate Prisma client
RUN pnpm exec prisma generate

# Final dev command
CMD ["pnpm", "dev"]