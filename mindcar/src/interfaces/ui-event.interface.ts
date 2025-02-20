import { SymbolIdentifier, ToolInputPartial } from './user-context.interface';

/**
 * UI Event with ID
 */
export interface UIEventWithID {
  request_id: string;
  exchange_id: string;
  event: UIEvent;
}

/**
 * Main UI Event type
 */
export interface UIEvent {
  SymbolEvent?: SymbolEventRequest;
  ToolEvent?: ToolInput;
  CodebaseEvent?: SymbolInputEvent;
  SymbolLocationUpdate?: SymbolLocation;
  SymbolEventSubStep?: SymbolEventSubStepRequest;
  RequestEvent?: RequestEvents;
  EditRequestFinished?: string;
  FrameworkEvent?: FrameworkEvent;
  ChatEvent?: ChatMessageEvent;
  ExchangeEvent?: ExchangeMessageEvent;
  Error?: ErrorEvent;
}

/**
 * Symbol event request
 */
export interface SymbolEventRequest {
  symbol: SymbolIdentifier;
  event: SymbolEvent;
  tool_properties: ToolProperties;
}

/**
 * Tool input
 */
export interface ToolInput {
  CodeEditing?: CodeEdit;
  LSPDiagnostics?: LSPDiagnostics;
  FindCodeSnippets?: FindCodeSnippets;
  ReRank?: ReRankEntriesForBroker;
  CodeSymbolUtilitySearch?: CodeSymbolUtilitySearch;
}

/**
 * Symbol input event
 */
export interface SymbolInputEvent {
  context: any; // Context type to be defined
  llm: string;
  provider: string;
  api_keys: any; // API keys type to be defined
  user_query: string;
  request_id: string;
}

/**
 * Symbol location
 */
export interface SymbolLocation {
  snippet: Snippet;
  symbol_identifier: SymbolIdentifier;
}

/**
 * Symbol event sub-step request
 */
export interface SymbolEventSubStepRequest {
  symbol_identifier: SymbolIdentifier;
  event: SymbolEventSubStep;
}

/**
 * Request events
 */
export interface RequestEvents {
  ProbingStart?: Record<string, never>;
  ProbeFinished?: RequestEventProbeFinished;
}

/**
 * Framework event
 */
export interface FrameworkEvent {
  RepoMapGenerationStart?: string;
  RepoMapGenerationFinished?: string;
  LongContextSearchStart?: string;
  LongContextSearchFinished?: string;
  InitialSearchSymbols?: InitialSearchSymbols;
  OpenFile?: OpenFileRequestFrameworkEvent;
  CodeIterationFinished?: string;
  ReferenceFound?: FoundReference;
  RelevantReference?: RelevantReference;
  GroupedReferences?: GroupedReferences;
  ReferencesUsed?: FrameworkReferencesUsed;
  SearchIteration?: IterativeSearchEvent;
  AgenticTopLevelThinking?: string;
  AgenticSymbolLevelThinking?: StepListItem;
  ToolUseDetected?: ToolUseDetectedEvent;
  ToolThinking?: ToolThinkingEvent;
  ToolNotFound?: ToolNotFoundEvent;
  ToolCallError?: ToolTypeErrorEvent;
  ToolTypeFound?: ToolTypeFoundEvent;
  ToolParameterFound?: ToolParameterFoundEvent;
  ToolOutput?: ToolOutputEvent;
}

/**
 * Chat message event
 */
export interface ChatMessageEvent {
  answer_up_until_now: string;
  delta: string | null;
}

/**
 * Exchange message event
 */
export interface ExchangeMessageEvent {
  FinishedExchange?: FinishedExchangeEvent;
  EditsExchangeState?: EditsExchangeEditsState;
  PlansExchangeState?: EditsExchangeEditsState;
  ExecutionState?: ExecutionExchangeStateEvent;
  RegeneratePlan?: RegeneratePlanExchangeEvent;
  TerminalCommand?: TerminalCommandEvent;
}

/**
 * Error event
 */
export interface ErrorEvent {
  message: string;
}

// Additional supporting interfaces

export interface ToolProperties {
  swe_bench_test_endpoint?: string;
  swe_bench_code_editing_llm?: any; // LLM type to be defined
  swe_bench_reranking_llm?: any; // LLM type to be defined
}

export interface Snippet {
  content: string;
  language: string;
}

export interface RequestEventProbeFinished {
  reply: string;
}

export interface InitialSearchSymbols {
  request_id: string;
  symbols: InitialSearchSymbolInformation[];
}

export interface OpenFileRequestFrameworkEvent {
  fs_file_path: string;
}

export type FoundReference = Record<string, number>;

export interface RelevantReference {
  fs_file_path: string;
  symbol_name: string;
  reason: string;
}

export type GroupedReferences = Record<string, Location[]>;

export interface FrameworkReferencesUsed {
  exchange_id: string;
  variables: any[]; // Variable type to be defined
}

export type IterativeSearchEvent = {
  type: string;
  duration?: Duration;
  queries?: SearchQuery[];
  results?: SearchResult[];
  response?: any;
  iteration?: number;
};

export interface StepListItem {
  name: string;
  steps: string[];
  new: boolean;
  filePath: string;
}

export interface ToolUseDetectedEvent {
  tool_use_partial_input: ToolInputPartial;
  thinking: string;
}

export interface ToolThinkingEvent {
  thinking: string;
}

export interface ToolNotFoundEvent {
  full_output: string;
}

export interface ToolTypeErrorEvent {
  error_string: string;
}

export interface ToolTypeFoundEvent {
  tool_type: string;
}

export interface ToolParameterFoundEvent {
  tool_parameter_input: {
    field_name: string;
    field_content_up_until_now: string;
    field_content_delta: string;
  };
}

export interface ToolOutputEvent {
  ToolTypeForOutput: ToolTypeForOutputEvent;
  ToolOutputResponse: ToolOutputResponseEvent;
}

export interface ToolTypeForOutputEvent {
  tool_type: string;
}

export interface ToolOutputResponseEvent {
  delta: string;
  answer_up_until_now: string;
}

export interface FinishedExchangeEvent {
  exchange_id: string;
  session_id: string;
}

export interface EditsExchangeEditsState {
  edits_state: 'Loading' | 'Cancelled' | 'MarkedComplete' | 'Accepted';
  files: string[];
}

export type ExecutionExchangeStateEvent = 'Inference' | 'InReview' | 'Cancelled';

export interface RegeneratePlanExchangeEvent {
  exchange_id: string;
  session_id: string;
}

export interface TerminalCommandEvent {
  exchange_id: string;
  session_id: string;
  command: string;
}

export interface Duration {
  secs: number;
  nanos: number;
}

export interface SearchQuery {
  thinking: string;
  tool: string;
  query: string;
}

export interface SearchResult {
  path: string;
  thinking: string;
  snippet: SearchResultSnippet;
}

export type SearchResultSnippet = {
  type: 'FileContent';
  content: Uint8Array;
} | {
  type: 'Tag';
  tag: string;
};

export interface Location {
  fs_file_path: string;
  symbol_name: string;
}