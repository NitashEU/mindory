export enum ToolType {
  CodeEditing = 'CodeEditing',
  FindFiles = 'FindFiles',
  ListFiles = 'ListFiles',
  SearchFileContentWithRegex = 'SearchFileContentWithRegex',
  OpenFile = 'OpenFile',
  SemanticSearch = 'SemanticSearch',
  LSPDiagnostics = 'LSPDiagnostics',
  TerminalCommand = 'TerminalCommand',
  AskFollowupQuestions = 'AskFollowupQuestions',
  AttemptCompletion = 'AttemptCompletion',
  RepoMapGeneration = 'RepoMapGeneration',
  TestRunner = 'TestRunner',
  Reasoning = 'Reasoning',
  ContextCrunching = 'ContextCrunching',
  RequestScreenshot = 'RequestScreenshot'
}

export interface ToolEvent {
  type: ToolType;
  data: any;
}

export interface FrameworkEvent {
  ToolThinking?: {
    thinking: string;
  };
  ToolTypeFound?: {
    tool_type: string;
  };
  ToolParameterFound?: {
    tool_parameter_input: {
      field_name: string;
      field_content_up_until_now: string;
      field_content_delta: string;
    };
  };
  ToolUseDetected?: {
    tool_use_partial_input: any;
    thinking: string;
  };
}

export interface ExchangeEvent {
  EditsExchangeState?: {
    edits_state: 'Accepted' | 'Rejected';
    files: string[];
  };
  FinishedExchange?: {
    exchange_id: string;
    session_id: string;
  };
}

export interface UIEvent {
  request_id: string;
  exchange_id: string;
  event: {
    FrameworkEvent?: FrameworkEvent;
    ExchangeEvent?: ExchangeEvent;
  };
}