FROM node:20-slim

# Install FFmpeg and build dependencies
RUN apt-get update && apt-get install -y ffmpeg python3 make g++ curl && \
    npm install -g pnpm && \
    apt-get clean

WORKDIR /app

# Copy root configs for workspace structure
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./

# Copy internal packages needed for build
COPY packages/typescript-config ./packages/typescript-config

# Copy the transcoder app
COPY apps/transcoder ./apps/transcoder

# Install dependencies (including workspace links)
RUN pnpm install --frozen-lockfile

# Switch to the app directory
WORKDIR /app/apps/transcoder

# The app uses tsx watch for dev, so we can mount the src volume later in compose
CMD ["pnpm", "dev"]
