ARG BASE_IMAGE=node:24-slim
FROM ${BASE_IMAGE} AS base
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install shared dependencies (Universal Base)
RUN apt-get update && apt-get install -y python3 make g++ openssl curl gnupg ca-certificates && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install -y docker-ce-cli && \
    (command -v node >/dev/null 2>&1 || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)) && \
    if [ "$APP_NAME" = "@devio/transcoder" ]; then apt-get install -y ffmpeg; fi && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

# Copy the entire workspace config
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY packages/typescript-config ./packages/typescript-config
COPY packages/eslint-config ./packages/eslint-config
COPY packages/zod ./packages/zod
COPY packages/boilerplate-generator ./packages/boilerplate-generator

# Argument for the specific app to run
ARG APP_PATH
ARG APP_NAME

# Copy all apps to allow cross-workspace dependencies in dev
COPY apps ./apps

# Install all dependencies (including dev)
RUN pnpm install

# Generate Prisma client if the app path is backend
WORKDIR /app/${APP_PATH}
RUN if [ "$APP_NAME" = "@devio/backend" ]; then pnpm exec prisma generate; fi

# Standard Monorepo ports
EXPOSE 3000 5000 5500 8000

# Entrypoint logic for automation in dev
RUN echo '#!/bin/sh\nif [ "$APP_NAME" = "@devio/code-sandbox" ]; then ./buildImages.sh; fi\npnpm dev' > dev-entrypoint.sh && chmod +x dev-entrypoint.sh

CMD ["./dev-entrypoint.sh"]
