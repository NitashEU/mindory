/**
 * File content with metadata
 */
export interface SidecarFileContent {
  file_path: string;
  file_content: string;
  language: string;
}

/**
 * Image content with metadata
 */
export interface SidecarImageContent {
  type: string;
  media_type: string;
  data: string;
}

/**
 * Variable types supported by sidecar
 */
export type SidecarVariableTypes = string; // To be expanded based on actual types

/**
 * User context for agent operations
 */
export interface UserContext {
  variables: SidecarVariableTypes[];
  file_content_map: SidecarFileContent[];
  images: SidecarImageContent[];
  terminal_selection?: string;
  folder_paths: string[];
  is_plan_generation: boolean;
  is_plan_execution_until: number | null;
  is_plan_append: boolean;
  with_lsp_enrichment: boolean;
  is_plan_drop_from: number | null;
}

/**
 * Symbol identifier
 */
export interface SymbolIdentifier {
  symbol_name: string;
  fs_file_path?: string;
}

/**
 * Active window data
 */
export interface ActiveWindowData {
  file_path: string;
  file_content: string;
  language: string;
}

/**
 * Repository reference
 */
export interface RepoRef {
  name: string;
  path: string;
  remote_url?: string;
}

/**
 * Tool parameter types
 */
export enum ToolParameter {
  FSFilePath = 'fs_file_path',
  DirectoryPath = 'directory_path',
  Instruction = 'instruction',
  Command = 'command',
  Question = 'question',
  Result = 'result',
  RegexPattern = 'regex_pattern',
  FilePattern = 'file_pattern',
  Recursive = 'recursive'
}

/**
 * Tool types available in the system
 */
export enum ToolType {
  ListFiles = 'ListFiles',
  SearchFileContentWithRegex = 'SearchFileContentWithRegex',
  OpenFile = 'OpenFile',
  CodeEditing = 'CodeEditing',
  LSPDiagnostics = 'LSPDiagnostics',
  AskFollowupQuestions = 'AskFollowupQuestions',
  AttemptCompletion = 'AttemptCompletion',
  RepoMapGeneration = 'RepoMapGeneration'
}

/**
 * Tool input parameters
 */
export interface ToolInputPartial {
  CodeEditing?: CodeEditingPartialRequest;
  ListFiles?: ListFilesInput;
  SearchFileContentWithRegex?: SearchFileContentInputPartial;
  OpenFile?: OpenFileRequestPartial;
  LSPDiagnostics?: Record<string, never>;
  TerminalCommand?: TerminalInputPartial;
  AskFollowupQuestions?: AskFollowupQuestionsRequest;
  AttemptCompletion?: AttemptCompletionClientRequest;
}

/**
 * Code editing request
 */
export interface CodeEditingPartialRequest {
  fs_file_path: string;
  instruction: string;
}

/**
 * List files input
 */
export interface ListFilesInput {
  directory_path: string;
  recursive: boolean;
}

/**
 * File search input
 */
export interface SearchFileContentInputPartial {
  directory_path: string;
  regex_pattern: string;
  file_pattern: string | null;
}

/**
 * Open file request
 */
export interface OpenFileRequestPartial {
  fs_file_path: string;
}

/**
 * Terminal command input
 */
export interface TerminalInputPartial {
  command: string;
}

/**
 * Follow-up questions request
 */
export interface AskFollowupQuestionsRequest {
  question: string;
}

/**
 * Completion attempt request
 */
export interface AttemptCompletionClientRequest {
  result: string;
  command: string | null;
}