# Technical Migration Steps

## Phase 1: Core API & Database Setup

### 1. Response Types and Interfaces
```typescript
// src/interfaces/api-response.interface.ts
export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// src/interfaces/health.interface.ts
export interface HealthCheckResponse {
  done: boolean;
}

// src/interfaces/config.interface.ts
export interface ConfigResponse {
  response: string;
}

export interface VersionResponse {
  version_hash: string;
  package_version: string;
}
```

### 2. Database Entities
```typescript
// src/database/entities/agent-event.entity.ts
@Entity()
export class AgentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  session_id: string;

  @Column()
  exchange_id: string;

  @Column('json')
  event_data: any;

  @CreateDateColumn()
  created_at: Date;
}

// Additional entities following similar pattern
```

### 3. Session Management
```typescript
// src/modules/shared/session/session.service.ts
@Injectable()
export class SessionService {
  private sessions = new Map<string, Session>();

  createSession(id: string): Session {
    const session = new Session(id);
    this.sessions.set(id, session);
    return session;
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }
}
```

## Phase 2: Core Services Implementation

### 1. SSE (Server-Sent Events) Handler
```typescript
// src/modules/shared/sse/sse.service.ts
@Injectable()
export class SSEService {
  createEventStream(session_id: string): Observable<MessageEvent> {
    return new Observable(subscriber => {
      // Send initial connection event
      subscriber.next({
        data: { session_id, started: true }
      });

      // Set up event handling
      const session = this.sessionService.getSession(session_id);
      session.events.subscribe(event => {
        subscriber.next({ data: event });
      });

      // Handle cleanup
      return () => {
        session.cleanup();
      };
    });
  }
}
```

### 2. LLM Integration
```typescript
// src/modules/llm/llm.service.ts
@Injectable()
export class LLMService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  async streamCompletion(
    config: LLMConfig,
    messages: Message[],
    session: Session
  ): Promise<void> {
    switch (config.provider) {
      case 'anthropic':
        return this.streamAnthropicCompletion(config, messages, session);
      case 'openai':
        return this.streamOpenAICompletion(config, messages, session);
    }
  }
}
```

### 3. Tool Integration
```typescript
// src/modules/agentic/tools/tool.service.ts
@Injectable()
export class ToolService {
  async executeToolAction(
    toolType: ToolType,
    params: any,
    session: Session
  ): Promise<ToolResponse> {
    const tool = this.getToolImplementation(toolType);
    return tool.execute(params, session);
  }
}
```

## Phase 3: Advanced Features

### 1. Plan Generation
```typescript
// src/modules/agentic/plan/plan.service.ts
@Injectable()
export class PlanService {
  async generatePlan(
    query: string,
    context: UserContext,
    session: Session
  ): Promise<Plan> {
    // Plan generation logic
  }

  async executePlanStep(
    plan: Plan,
    step: PlanStep,
    session: Session
  ): Promise<void> {
    // Step execution logic
  }
}
```

### 2. Code Analysis
```typescript
// src/modules/analysis/parser.service.ts
@Injectable()
export class ParserService {
  async parseCode(
    content: string,
    language: string
  ): Promise<ParsedCode> {
    // Language-specific parsing
  }
}
```

## Implementation Order

1. **Week 1**
   - Set up database entities and migrations
   - Implement basic API endpoints
   - Set up session management

2. **Week 2**
   - Implement SSE handling
   - Basic LLM integration
   - Initial tool framework

3. **Week 3**
   - Complete LLM integration
   - Implement core tools
   - Add plan generation

4. **Week 4**
   - Code analysis features
   - Advanced tool integration
   - Testing and optimization