# Code Sandbox - Architecture Documentation

## Overview

Devio Code Sandbox is a Docker-based code execution service that allows users to execute code in isolated container environments. It supports multiple programming languages (Python, JavaScript, C, C++, Java) and provides session-based execution with interactive input/output support.

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                  HTTP Requests                          │
│              (Express.js Server)                        │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   SessionController          │
        │   (HTTP Request Handling)    │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │     SessionManager            │
        │  (Session State Management)   │
        └──────────┬───────────┬────────┘
                   │           │
         ┌─────────▼─┐     ┌───▼───────────┐
         │ DockerPool│     │ExecutionService│
         │(Container │     │  (Code Exec)   │
         │ Management)     │                │
         └───────────┘     └────────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │   Docker Containers          │
        │  (Isolated Execution Env)    │
        └──────────────────────────────┘
```

## Components

### 1. **SessionController** (`src/controller/session.controller.ts`)

**Responsibility:** HTTP request/response handling

**Methods:**

- `startSession(req, res)` - Starts a new execution session
- `executeCode(req, res)` - Executes code in an active session
- `sendInput(req, res)` - Sends input to a running process
- `endSession(req, res)` - Terminates a session

**Key Features:**

- Request validation
- Error handling and HTTP status codes
- Delegates business logic to SessionManager

### 2. **SessionManager** (`src/services/SessionManager.ts`)

**Responsibility:** Session lifecycle and state management

**Dependencies:** Docker, DockerPool, ExecutionService

**Key Methods:**

- `startSession(language)` - Creates a new session with an isolated container
- `executeCode(sessionId, code)` - Executes code and manages output streams
- `sendInput(sessionId, input)` - Sends input to running process
- `endSession(sessionId)` - Cleans up and returns container to pool

**Data Structures:**

- `sessions: Map<sessionId, ExecutionSession>` - Active sessions
- `sessionStreams: Map<sessionId, StreamData>` - Output buffers and streams

**Responsibilities:**

- Creating and tracking sessions
- Stream data management
- Timeout handling
- Container lifecycle coordination

### 3. **ExecutionService** (`src/services/ExecutionService.ts`)

**Responsibility:** Code execution logic and stream handling

**Dependencies:** DockerPool

**Key Methods:**

- `executeCode(container, code, language, sessionId, streamData)` - Executes code in container
- `sendInput(stream, input)` - Writes input to stream

**Features:**

- Language-specific execution (Java, Python, JavaScript, C, C++)
- File writing to containers
- Stream demuxing (separating stdout/stderr)
- ANSI code stripping
- File path cleanup in output

**Utilities:**

- `extractJavaClassName(code)` - Parses Java class names
- `demuxStream(chunk)` - Parses Docker multiplexed streams
- `stripAnsiCodes(text)` - Removes ANSI escape sequences
- `cleanupFilePath(text)` - Removes container paths from output

### 4. **DockerPool** (`src/services/DockerPool.ts`)

**Responsibility:** Container resource management and pooling

**Key Methods:**

- `getContainer(language)` - Gets or creates a container
- `returnContainer(language, container)` - Returns container to pool
- `shutdown()` - Cleans up all containers

**Features:**

- Object pool pattern for containers
- Per-language container pooling
- Automatic idle container cleanup
- Memory/CPU resource limits
- Initial container pool setup

**Configuration:**

- `maxPoolSize` - Maximum containers per language (default: 3)
- `initialPoolSize` - Initial containers per language (default: 1)
- `idleTimeout` - Idle container cleanup interval (default: 5 min)

## API Endpoints

### Session Management

```
POST /session/start
├── Body: { language: string }
└── Response: { sessionId: string }

POST /session/:sessionId/execute
├── Body: { code: string }
└── Response: { sessionId, stdout, stderr, executionTime, error? }

POST /session/:sessionId/input
├── Body: { input: string }
└── Response: { sessionId, stdout, stderr, executionTime, error? }

POST /session/:sessionId/end
├── Body: { sessionId: string }
└── Response: { message: string }
```

### Utilities

```
GET /pool/stats
└── Response: { language: { available, maxSize } }

GET /languages
└── Response: { languages: string[] }
```

## Data Flow

### Code Execution Flow

1. **Request:** Client sends POST `/session/:sessionId/execute` with code
2. **SessionManager:** Validates session exists, sets up stream handlers
3. **ExecutionService:** Writes code to container, executes it
4. **Container:** Runs code, outputs to stdout/stderr
5. **Stream Handlers:**
   - Capture output chunks
   - Demux stdout/stderr
   - Clean ANSI codes
   - Clean file paths
6. **Response:** Return accumulated output to client

### Session Lifecycle

```
1. Client calls /session/start
   └─> SessionManager.startSession()
       └─> DockerPool.getContainer()
           └─> Create container if needed
       └─> Store session state

2. Client calls /session/:sessionId/execute (multiple times)
   └─> ExecutionService.executeCode()
       └─> Write code file
       └─> Execute code
       └─> Stream output

3. Client calls /session/end
   └─> SessionManager.endSession()
       └─> Cleanup streams
       └─> DockerPool.returnContainer()
```

## Language Support

Each language has a configuration in `src/config/languages.ts`:

```typescript
interface LanguageConfig {
  image: string; // Docker image name
  extension: string; // File extension
  compileCommand?: string[]; // Compile command (optional)
  runCommand: string[]; // Run command
  timeout: number; // Execution timeout in seconds
}
```

**Supported Languages:**

- Python 3
- JavaScript (Node.js)
- C
- C++
- Java

## Dependency Injection

All services use constructor-based dependency injection:

```typescript
// Dependency Graph
new DockerPool(docker, config);
new ExecutionService(dockerPool);
new SessionManager(docker, dockerPool, executionService);
new ExecutionController(sessionManager);
```

**Benefits:**

- Easy to test (mock dependencies)
- Loose coupling between services
- Clear dependency chain
- No circular dependencies

## Output Processing

The system performs three transformations on output:

1. **Stream Demuxing:** Docker multiplexes stdout/stderr; we separate them
2. **ANSI Code Stripping:** Removes color codes: `/\x1b\[[0-9;]*[mGKHfABCDsuJ]/g`
3. **Path Cleanup:** Removes container paths: `/\/home\/sandboxuser\/tmp\//g`

Example:

```
Before:  "File "/home/sandboxuser/tmp/main.py", line 1"
After:   "File "main.py", line 1"
```

## Error Handling

- **Validation:** All inputs validated at controller level
- **Session Errors:** Session not found returns 404-like response
- **Execution Errors:** Captured and returned in response
- **Timeout:** 5-second timeout for output collection
- **Container Errors:** Logged and gracefully handled

## File Structure

```
src/
├── index.ts                    # Server entry point
├── config/
│   ├── docker.ts             # Docker client setup
│   ├── languages.ts          # Language configurations
│   └── index.ts              # Config exports
├── controller/
│   └── session.controller.ts # HTTP handlers
├── services/
│   ├── DockerPool.ts         # Container pooling
│   ├── ExecutionService.ts   # Code execution
│   └── SessionManager.ts     # Session management
├── types/
│   ├── session.ts            # Session types
│   └── index.ts              # Type exports
└── utils/
    ├── logger.ts             # Logging utility
    └── index.ts              # Utility exports
```

## Configuration

### Environment Variables

```bash
PORT=5000                 # Server port
NODE_ENV=development      # Environment
DOCKER_SOCKET_PATH=...   # Docker socket path (optional)
```

### Pool Configuration

```typescript
const dockerPool = new DockerPool(docker, {
  maxPoolSize: 3, // Max 3 containers per language
  initialPoolSize: 1, // Start with 1 container per language
  idleTimeout: 5 * 60 * 1000, // Cleanup idle after 5 minutes
});
```

## Performance Considerations

1. **Container Pooling:** Reuses warm containers instead of creating new ones
2. **Resource Limits:** Each container limited to 256MB memory, 50% CPU
3. **Stream Timeouts:** 5-second timeout prevents hanging
4. **Idle Cleanup:** Removes unused containers every 30 seconds
5. **Sandbox Isolation:** Each container isolated (no network access)

## Security

1. **Isolated Containers:** Code runs in sandboxed Docker containers
2. **Resource Limits:** Memory (256MB) and CPU (50%) restricted
3. **No Network:** Containers have no network access
4. **Timeout:** Runaway code terminates after configurable timeout
5. **File Cleanup:** Old containers and files cleaned up automatically

## Naming Conventions

- **Files:** kebab-case with descriptors (e.g., `session.controller.ts`)
- **Classes:** PascalCase (e.g., `SessionManager`, `ExecutionService`)
- **Methods/Variables:** camelCase (e.g., `startSession`, `sessionId`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `LANGUAGE_CONFIG`)

## Design Patterns

1. **Object Pool Pattern:** DockerPool manages container reuse
2. **Dependency Injection:** All services injected via constructor
3. **Separation of Concerns:** Each service has single responsibility
4. **Factory Pattern:** DockerPool creates containers on demand
5. **Stream Handler Pattern:** Event-driven output collection
