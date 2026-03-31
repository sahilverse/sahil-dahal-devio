FROM node:20-slim

RUN apt-get update && apt-get install -y ffmpeg python3 make g++ curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

COPY packages/typescript-config ./packages/typescript-config

COPY apps/transcoder ./apps/transcoder

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/transcoder

CMD ["pnpm", "dev"]
