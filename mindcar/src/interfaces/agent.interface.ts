import { UserContext } from './user-context.interface';

/**
 * Model configuration for LLM clients
 */
export interface LLMClientConfig {
  llm_properties_for_slow_model?: LLMProperties;
}

/**
 * LLM Provider properties
 */
export interface LLMProperties {
  llm: LLMType;
  provider: LLMProvider;
  api_keys: LLMProviderAPIKeys;
}

/**
 * Supported LLM types
 */
export enum LLMType {
  ClaudeSonnet = 'ClaudeSonnet',
  GeminiPro = 'GeminiPro',
  // Add other LLM types as needed
}

/**
 * Available LLM providers
 */
export enum LLMProvider {
  Anthropic = 'Anthropic',
  GoogleAIStudio = 'GoogleAIStudio',
  OpenAI = 'OpenAI',
  // Add other providers as needed
}

/**
 * Provider API key configurations
 */
export type LLMProviderAPIKeys = {
  type: 'Anthropic';
  key: string;
} | {
  type: 'GoogleAIStudio';
  key: string;
} | {
  type: 'OpenAI';
  key: string;
};

/**
 * Agent session request body
 */
export interface AgentSessionBody {
  session_id: string;
  exchange_id: string;
  editor_url: string;
  query: string;
  user_context: UserContext;
  agent_mode: string;
  repo_ref: string;
  root_directory: string;
  project_labels: string[];
  codebase_search: boolean;
  model_configuration: LLMClientConfig;
  all_files: string[];
  open_files: string[];
  shell: string;
  aide_rules?: string | null;
  reasoning: boolean;
  is_devtools_context: boolean;
}

/**
 * Code sculpting request
 */
export interface CodeSculptingRequest {
  request_id: string;
  instruction: string;
}

/**
 * Code sculpting response
 */
export interface CodeSculptingResponse extends ApiResponse {
  data: {
    done: boolean;
  };
}

/**
 * Agent diagnostic data
 */
export interface AgenticDiagnosticData {
  message: string;
  range: CodeRange;
  range_content: string;
}

/**
 * Code range interface
 */
export interface CodeRange {
  start: Position;
  end: Position;
}

/**
 * Position in code
 */
export interface Position {
  line: number;
  character: number;
}

/**
 * Agent diagnostics
 */
export interface AgenticDiagnostics {
  fs_file_path: string;
  diagnostics: AgenticDiagnosticData[];
  source?: string;
}

/**
 * Agent diagnostics response
 */
export interface AgenticDiagnosticsResponse extends ApiResponse {
  data: {
    done: boolean;
  };
}

/**
 * Model verification request
 */
export interface AgenticVerifyModelConfig {
  model_configuration: LLMClientConfig;
}

/**
 * Model verification response
 */
export interface AgenticVerifyModelConfigResponse extends ApiResponse {
  data: {
    valid: boolean;
    error?: string;
  };
}

/**
 * Exchange feedback request
 */
export interface AgenticEditFeedbackExchange {
  exchange_id: string;
  session_id: string;
  step_index?: number;
  editor_url: string;
  accepted: boolean;
  model_configuration: LLMClientConfig;
}

/**
 * Exchange feedback response
 */
export interface AgenticEditFeedbackExchangeResponse extends ApiResponse {
  data: {
    success: boolean;
  };
}

/**
 * Session undo request
 */
export interface AgenticHandleSessionUndo {
  session_id: string;
  exchange_id: string;
}

/**
 * Session undo response
 */
export interface AgenticHandleSessionUndoResponse extends ApiResponse {
  data: {
    done: boolean;
  };
}