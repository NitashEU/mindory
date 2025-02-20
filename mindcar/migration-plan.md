# Migration Plan: Rust Sidecar to NestJS

## 1. Core API Migration

### Health & Config APIs (Priority: High)
- [x] Health check endpoint (/api/health)
- [x] Config endpoint (/api/config)
- [x] Version endpoint (/api/version)
- [x] Migrate response types and interfaces

### Agentic Module (Priority: High)
- [x] Agent tool use endpoint (/api/agentic/agent_tool_use)
- [ ] Code sculpting endpoints
- [ ] Plan generation and iteration
- [ ] Session management with SSE support
- [ ] Model configuration verification

## 2. Database & Storage

### TypeORM Entities (Priority: High)
Based on existing migrations:
- [ ] AgentEvent entity
- [ ] ConversationMessage entity
- [ ] FileCache entity
- [ ] GitLogStatistic entity
- [ ] LLMData entity
- [ ] Migration scripts

### Storage Services (Priority: Medium)
- [ ] Session storage service
- [ ] Plan storage service
- [ ] Scratch pad storage
- [ ] File caching system

## 3. Core Services

### Session Management (Priority: High)
- [ ] Session class with event streaming
- [ ] CLS (Continuation Local Storage) integration
- [ ] Event handling and UI updates
- [ ] Session state persistence

### LLM Integration (Priority: High)
- [ ] Multiple provider support (Anthropic, OpenAI)
- [ ] Streaming completion handlers
- [ ] Model configuration management
- [ ] Error handling and rate limiting

### Tool Integration (Priority: Medium)
- [ ] Code editing tools
- [ ] File operations
- [ ] Git integration
- [ ] LSP integration
- [ ] Terminal command execution

## 4. Advanced Features

### Plan Generation (Priority: Medium)
- [ ] Plan service implementation
- [ ] Plan storage and retrieval
- [ ] Plan execution tracking
- [ ] Plan feedback system

### Code Analysis (Priority: Medium)
- [ ] Language-specific parsers
- [ ] Tree-sitter integration
- [ ] Code chunking system
- [ ] Symbol management

### MCTS Implementation (Priority: Low)
- [ ] Monte Carlo Tree Search logic
- [ ] Node management
- [ ] Action tracking
- [ ] Reward system

## 5. Infrastructure

### Error Handling (Priority: High)
- [ ] Custom exception filters
- [ ] Error response formatting
- [ ] Logging system
- [ ] Rate limiting

### Monitoring (Priority: Medium)
- [ ] Request logging
- [ ] Performance metrics
- [ ] Error tracking
- [ ] Health monitoring

## Migration Strategy

1. **Phase 1: Core API & Database** (Weeks 1-2)
   - Implement basic endpoints
   - Set up database with TypeORM
   - Basic session management

2. **Phase 2: Core Services** (Weeks 3-4)
   - LLM integration
   - Tool services
   - Event streaming

3. **Phase 3: Advanced Features** (Weeks 5-6)
   - Plan generation
   - Code analysis
   - MCTS implementation

4. **Phase 4: Testing & Optimization** (Weeks 7-8)
   - End-to-end testing
   - Performance optimization
   - Documentation
   - Monitoring setup