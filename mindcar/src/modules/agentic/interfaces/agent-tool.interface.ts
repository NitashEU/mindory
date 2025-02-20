import { ApiProperty } from '@nestjs/swagger';

export interface UserContext {
  // Add user context properties based on Rust's UserContext
  projectLabels: string[];
  openFiles: string[];
  allFiles: string[];
  rootDirectories: string[];
}

export interface RepoRef {
  name: string;
  // Add other repo ref properties
}

export interface LLMClientConfig {
  llmPropertiesForSlowModel?: {
    llmType: string;
    provider: string;
    apiKey: string;
  };
}

export class AgentToolUseRequest {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  exchangeId: string;

  @ApiProperty()
  editorUrl: string;

  @ApiProperty()
  query: string;

  @ApiProperty()
  userContext: UserContext;

  @ApiProperty()
  repoRef: RepoRef;

  @ApiProperty()
  projectLabels: string[];

  @ApiProperty()
  rootDirectory: string;

  @ApiProperty({ default: false })
  codebaseSearch: boolean;

  @ApiProperty()
  modelConfiguration: LLMClientConfig;

  @ApiProperty()
  allFiles: string[];

  @ApiProperty()
  openFiles: string[];

  @ApiProperty()
  shell: string;

  @ApiProperty({ required: false })
  aideRules?: string;

  @ApiProperty({ default: false })
  reasoning: boolean;

  @ApiProperty({ default: false })
  semanticSearch: boolean;

  @ApiProperty({ default: false })
  isDevtoolsContext: boolean;
}

export interface UIEventWithID {
  type: string;
  sessionId: string;
  exchangeId?: string;
  data?: any;
}

export interface AgentToolUseResponse {
  success: boolean;
  error?: string;
}