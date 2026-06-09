# Devio - IT community Platform

Dev.io is a developer-centered community platform with posts, communities, coding challenges, CTF labs, events, and real-time collaboration. Users can join communities, solve problems, earn aura points, run code in a sandbox, chat, and customize their feed—all in one unified ecosystem.

## THE PROJECT IS UNDER ACTIVE DEVELOPMENT. SO THE STRUCTURE AND FEATURES MAY CHANGE FREQUENTLY. THIS README WILL BE UPDATED ACCORDINGLY.

## This documentation covers only the features and structure that are currently implemented.

## 🏗️ Project Architecture

This is a [Turborepo](https://turborepo.com/)-based monorepo using [pnpm](https://pnpm.io/) as the package manager.

### Apps

- **`backend`** - Node.js/Express REST API with Prisma ORM
- **`frontend`** - Next.js 16 React application for the web interface
- **`code-sandbox`** - Docker-based code execution service supporting multiple programming languages
- **`lab-orchestrator`** - Docker based virtual lab sessions orchestrator (Spins up the virtual machines for CTF)
- **`transcoder`** - Video transcoder for adaptive streaming. 

### Shared Packages

- **`@devio/eslint-config`** - Shared ESLint configuration
- **`@devio/typescript-config`** - Shared TypeScript configuration
- **`@devio/zod`** - Shared Zod validation schemas
- **`@devio/boilerplate-generator`** - Code boilerplate generation utilities

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Job Queue**: BullMQ
- **Authentication**: JWT with bcryptjs (completed), OAuth (Pending)
- **Email**: Nodemailer
- **API Documentation**: Swagger/OpenAPI

### Frontend

- **Framework**: Next.js 16
- **UI Library**: React 19
- **Language**: TypeScript

### Code Execution

- **Containerization**: Docker
- **Supported Languages**: C++, Java, Node.js, Python
- **Execution Client**: Dockerode

## 📋 Prerequisites

- Node.js >= 18
- pnpm >= 10.24.0
- Docker (for code sandbox)
- PostgreSQL database
- Redis cache

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Copy .env.example to .env in backend and frontend directories
# Configure database, Redis, and other services
```

### Development

Start all services in development mode:

```bash
# Run all apps and packages in watch mode
pnpm dev
```

Or develop a specific app:

```bash
# Frontend only
pnpm dev --filter @devio/frontend

# Backend only
pnpm dev --filter @devio/backend

# Code sandbox only
pnpm dev --filter @devio/code-sandbox
```

### Building

Build all apps and packages:

```bash
pnpm build
```

Build a specific app:

```bash
pnpm build --filter @devio/backend
pnpm build --filter @devio/frontend
```

### Database Migrations

```bash
# Run migrations
pnpm --filter @devio/backend exec prisma migrate dev

# Reset database
pnpm --filter @devio/backend exec prisma migrate reset

# View database in Prisma Studio
pnpm --filter @devio/backend exec prisma studio
```

## 📦 Docker Deployment

### Compose Services

The `docker-compose.yml` orchestrates all services:

```bash
# Build and start all containers
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

## 🔍 Code Quality

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm check-types
```

### Formatting

```bash
pnpm format
```

## 📝 Project Structure

```
devio/
├── apps/
│   ├── backend/               # Express API server
│   ├── frontend/              # Next.js frontend
│   ├── code-sandbox/          # Docker execution service
│   └── lab-orchestrator/      # Virtual Lab Service
|   └── transcoder/            # Video Transcoding Service
├── packages/
│   ├── boilerplate-generator/ # Code template generation
│   ├── eslint-config/         # Shared ESLint config
│   ├── typescript-config/     # Shared TypeScript config
│   └── zod/                   # Shared validation schemas
├── infra/                     # Infrastructure configs
├── docker-compose.yml         # Multi-container orchestration
├── turbo.json                 # Turborepo configuration
└── pnpm-workspace.yaml        # Workspace configuration
```
