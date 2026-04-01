FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ffmpeg \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy monorepo root config to handle pnpm workspace
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy necessary packages and the app
COPY packages/typescript-config ./packages/typescript-config
COPY apps/transcoder ./apps/transcoder

# Install all dependencies
RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/transcoder

# Start the dev server
CMD ["pnpm", "dev"]
