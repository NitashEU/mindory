Phase 1: Database & Core Setup
1. Set up TypeORM entities based on SQLite migrations
   - Convert from _rust_old/sidecar/migrations/
   - Implement agent_events, git_log_statistics, llm_data tables

2. LLM Integration
   - Port llm_client functionality
   - Implement prompt management from llm_prompts
   - Set up model broker system

Phase 2: Core Features
3. Chunking System
   - Implement language configs (starting with Rust)
   - Set up tree-sitter integration
   - Port language parsing logic

4. Agentic Tools
   - Implement plan generator
   - Port session management
   - Set up feedback system

Phase 3: Advanced Features
5. MCTS Implementation
   - Port feedback system
   - Implement tree search logic

Phase 4: Testing & Validation
6. Set up end-to-end testing
7. Implement monitoring and logging
8. Performance optimization