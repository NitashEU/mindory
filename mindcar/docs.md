# NestJS Server Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Running the Server](#running-the-server)
3. [Server Configuration](#server-configuration)
   - [Middleware Setup](#middleware-setup)
   - [Session Management](#session-management)
   - [Project Structure](#project-structure)
4. [Development Guidelines](#development-guidelines)
5. [API Endpoints](#api-endpoints)
   - [Health and System Endpoints](#health-and-system-endpoints)
   - [Additional Modules](#additional-modules)
     - [Agentic Module](#agentic-module)
     - [Config Module](#config-module)
6. [Shared Components](#shared-components)
   - [Exchange Types](#exchange-types)
   - [Exchange States](#exchange-states)
7. [Request Context](#request-context)

## Overview
This is a NestJS-based server application that provides various functionalities through modular architecture. The server includes health checking, configuration management, and agentic capabilities.

## Project Structure
```
src/
├── app.module.ts          # Main application module
├── main.ts               # Application entry point
└── modules/              # Feature modules
    ├── agentic/          # Agentic module for AI/agent related features
    ├── config/           # Configuration management module
    ├── health/           # Health check module
    └── shared/           # Shared resources and utilities
        ├── interfaces/   # Common interfaces
        └── session/      # Session management
```

## Core Features

### 1. Session Management
- Uses `nestjs-cls` for request context management
- Automatically creates and manages sessions for each request
- Session ID is expected in request body as `session_id`

### 2. Request Logging
- Built-in middleware for request/response logging
- Excludes `/api/version` and `/api/health` endpoints from logging
- Logs both incoming requests and outgoing responses

### 3. Modules

#### Health Module
- Provides health check endpoints
- Located in `/modules/health`
- Used for monitoring application status

#### Config Module
- Handles application configuration
- Uses both NestJS built-in ConfigModule and custom AppConfigModule
- Located in `/modules/config`

#### Agentic Module
- Handles AI/agent-related functionalities
- Located in `/modules/agentic`

#### Shared Module
- Contains common utilities and interfaces
- Includes session management functionality
- Located in `/modules/shared`

## Server Configuration
- Server runs on `127.0.0.1:42424`
- Uses Express.js as the underlying HTTP framework
- Global request context management through ClsModule

## Middleware
1. Request Logging Middleware
   - Logs all incoming requests except health and version endpoints
   - Format: `Request: [URL]`

2. Response Logging Middleware
   - Logs all outgoing responses except health and version endpoints
   - Format: `Response: [Body]`

## Session Management Details
The application uses a custom session management system:
- Sessions are created per request
- Session objects are stored in the CLS (Continuation Local Storage)
- Each session is associated with a unique session ID
- Response object is attached to the session for context management

## Getting Started

### Prerequisites
- Node.js
- npm/yarn
- NestJS CLI (`npm i -g @nestjs/cli`)

### Installation
```bash
# Install dependencies
npm install
```

### Running the Server
```bash
# Production mode
npm run start

# Development mode
npm run start:dev

# Debug mode
npm run start:debug
```

### Server Configuration

#### Middleware Setup
The server includes two global middleware configurations:

1. **Request Logging Middleware**
   - Logs all incoming requests except `/api/version` and `/api/health`
   - Format: `Request: [URL]`
   - Helps in request tracking and debugging

2. **Response Logging Middleware**
   - Logs all outgoing responses except `/api/version` and `/api/health`
   - Format: `Response: [Body]`
   - Useful for response monitoring and debugging

#### Session Management
- Uses `nestjs-cls` for request context management
- Automatically creates session for each request
- Maintains session state throughout request lifecycle
- Supports streaming responses through session context

#### Project Structure
```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Main application module
├── interfaces/               # Global interfaces
├── modules/                  # Feature modules
│   ├── agentic/             # AI/Agent features
│   ├── config/              # Configuration
│   ├── health/             # Health checks
│   └── shared/             # Shared resources
└── test/                    # Test files
```

### Development Guidelines

1. **Module Organization**
   - Keep related functionality in dedicated modules
   - Use shared module for common utilities
   - Follow NestJS module structure

2. **API Endpoints**
   - All endpoints are prefixed with `/api`
   - Use appropriate HTTP methods
   - Implement proper error handling
   - Document new endpoints

3. **Session Handling**
   - Always include `session_id` in requests
   - Use ClsService for session management
   - Handle session cleanup properly

4. **Error Handling**
   - Use NestJS exception filters
   - Provide meaningful error messages
   - Log errors appropriately

## API Endpoints

### Health and System Endpoints
All endpoints are prefixed with `/api`

#### Health Check
- **GET** `/api/health`
  - Purpose: Check server health status and system components
  - Response Type:
    ```typescript
    interface HealthCheckResponse {
      status: 'ok' | 'error';
      timestamp: string;
      details?: {
        database?: boolean;      // Database status
        cache?: boolean;         // Cache service status
        services?: {             // Other service statuses
          [serviceName: string]: boolean;
        }
      }
    }
    ```
  - No authentication required
  - Used for monitoring and system health verification
  - Currently returns simplified response from health service

#### Version Information
- **GET** `/api/version`
  - Purpose: Get server version information
  - Response: Currently returns same as health check
  - No authentication required
  - Note: Shares implementation with health check endpoint

#### Exchange Management
- **POST** `/api/new_exchange`
  - Purpose: Create a new exchange session
  - Request: Accepts any body payload (to be structured based on requirements)
  - Response:
    ```typescript
    {
      exchange_id: string;  // Currently always returns "1"
    }
    ```
  - Creates a new exchange session for managing interactions
  - No validation currently implemented on request body

### Additional Modules

#### Agentic Module
- Located at `/modules/agentic`
- Base path: `/api/agentic`

##### Agent Tool Use Endpoint
**POST** `/api/agentic/agent_tool_use`
- Purpose: Handles agent tool usage and streaming events
- Request Body (`AgentSessionBody`):
  ```typescript
  {
    session_id: string;          // Unique session identifier
    exchange_id: string;         // Exchange identifier
    editor_url: string;          // URL of the editor
    query: string;              // User query/command
    user_context: UserContext;   // Context information
    agent_mode: string;         // Mode of agent operation
    repo_ref: string;           // Repository reference
    root_directory: string;     // Root directory path
    project_labels: string[];   // Project-related labels
    codebase_search: boolean;   // Enable codebase search
    model_configuration: any;   // LLM model configuration
    all_files: string[];       // List of all files
    open_files: string[];      // List of currently open files
    shell: string;             // Shell configuration
    aide_rules: string | null; // AI assistance rules
    reasoning: boolean;        // Enable reasoning
    is_devtools_context: boolean; // DevTools context flag
  }
  ```
- Response: Streams UI events through the session
- Features:
  - Uses ClsService for session management
  - Supports streaming responses
  - Handles asynchronous tool operations
  - Manages session lifecycle (start/end)
  - Sends UI events through session context

#### Config Module
- Located at `/modules/config`
- Base path: `/api`

##### Configuration Endpoints

1. **GET** `/api/config`
   - Purpose: Retrieve application configuration
   - Response:
     ```typescript
     {
       response: string; // Currently returns "hello_skcd"
     }
     ```
   - No authentication required

2. **GET** `/api/reach_the_devs`
   - Purpose: Contact developers endpoint
   - Response: Empty response
   - No authentication required

3. **GET** `/api/version`
   - Purpose: Get application version information
   - Response Type:
     ```typescript
     interface VersionInfo {
       version: string;
       buildNumber?: string;    // Optional
       timestamp?: string;      // Optional
     }
     ```
   - No authentication required
   - Currently returns empty response (implementation pending)

### Shared Components

#### Exchange Types
The system supports two types of exchanges:

1. **Human Exchange**
```typescript
interface ExchangeTypeHuman {
  query: string;              // User query
  user_context: any;          // Context data
  project_labels: string[];   // Project-related labels
  repo_ref: any;             // Repository reference
}
```

2. **Agent Exchange**
```typescript
interface ExchangeTypeAgent {
  plan_steps: string[];      // Steps in the plan
  plan_discarded: boolean;   // Plan discard status
  parent_exchange_id: string; // Parent exchange reference
}
```

#### Exchange States
An exchange can be in one of the following states:
- `Accepted`: Exchange has been accepted
- `Rejected`: Exchange has been rejected
- `Cancelled`: Exchange has been cancelled
- `Running`: Exchange is currently running
- `UserMessage`: Exchange contains a user message

### Request Context
All endpoints (except health and version) are:
- Logged for both request and response
- Managed through session context (using nestjs-cls)
- Require a `session_id` in the request body for session management
- Support exchange-based interactions
- Handle streaming responses where applicable