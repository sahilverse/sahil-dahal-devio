ARG BASE_IMAGE=node:24-slim

# --- Stage 0: Common Node Environment ---
FROM ${BASE_IMAGE} AS node-env
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install dependencies (Universal Base)
RUN apt-get update && apt-get install -y python3 make g++ openssl curl gnupg ca-certificates && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
    chmod a+r /etc/apt/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian bookworm stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update && apt-get install -y docker-ce-cli && \
    (command -v node >/dev/null 2>&1 || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)) && \
    if [ "$APP_NAME" = "@devio/transcoder" ]; then apt-get install -y ffmpeg; fi && \
    npm install -g pnpm turbo && \
    apt-get clean
WORKDIR /app

# --- Stage 1: Prune the workspace ---
FROM node-env AS pruner
COPY . .
ARG APP_NAME
RUN turbo prune ${APP_NAME} --docker

# --- Stage 2: Install dependencies ---
FROM node-env AS installer
# First copy the json and pnpm-lock.yaml to install dependencies
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN pnpm install --frozen-lockfile

# --- Stage 3: Build the application ---
FROM node-env AS builder
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Re-generate Prisma Client for backend
ARG APP_NAME
ARG APP_PATH

# Pass NEXT_PUBLIC environment variables to the builder (Crucial for Next.js)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GITHUB_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GITHUB_CLIENT_ID=$NEXT_PUBLIC_GITHUB_CLIENT_ID

RUN if [ "${APP_NAME}" = "@devio/backend" ]; then \
    cd apps/backend && npx prisma generate; \
    fi
RUN turbo build --filter=${APP_NAME}

# --- Stage 4: FINAL PRODUCTION RUNNER ---
FROM node-env AS runner
ARG APP_NAME
ARG APP_PATH

# Copy essential files
COPY --from=builder /app/package.json .
COPY --from=builder /app/pnpm-lock.yaml .
COPY --from=builder /app/pnpm-workspace.yaml .
COPY --from=builder /app/turbo.json .

# Copy built app and its workspace dependencies (zod, etc.)
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/${APP_PATH} ./${APP_PATH}

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Expose ports based on the app
EXPOSE 3000 5000 5500 8000

# Startup command logic
WORKDIR /app/${APP_PATH}

# Entrypoint script logic
ENV APP_NAME=${APP_NAME}
RUN if [ "${APP_NAME}" = "@devio/backend" ]; then \
    echo '#!/bin/sh\npnpm exec prisma migrate deploy && pnpm exec prisma db seed && node dist/index.mjs' > entrypoint.sh && chmod +x entrypoint.sh; \
    elif [ "${APP_NAME}" = "@devio/code-sandbox" ]; then \
    echo '#!/bin/sh\nbash ./buildImages.sh && node dist/index.js' > entrypoint.sh && chmod +x entrypoint.sh; \
    elif [ "${APP_NAME}" = "@devio/frontend" ]; then \
    echo '#!/bin/sh\npnpm start' > entrypoint.sh && chmod +x entrypoint.sh; \
    else \
    echo '#!/bin/sh\nnode dist/index.js' > entrypoint.sh && chmod +x entrypoint.sh; \
    fi

CMD ["./entrypoint.sh"]
