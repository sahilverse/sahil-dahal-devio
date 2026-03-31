FROM node:20-slim

RUN apt-get update && apt-get install -y python3 make g++ curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/zod ./packages/zod

COPY apps/frontend ./apps/frontend

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["pnpm", "dev"]
