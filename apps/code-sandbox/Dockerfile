FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

COPY packages/typescript-config ./packages/typescript-config
COPY packages/zod ./packages/zod

COPY apps/code-sandbox ./apps/code-sandbox

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/code-sandbox

EXPOSE 8000

CMD ["pnpm", "dev"]
