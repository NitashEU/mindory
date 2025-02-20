import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Entity for storing LLM interaction data
 * Maps to the llm_data table from Rust migration
 */
@Entity('llm_data')
export class LLMData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  request_id: string;

  @Column('text')
  model_type: string;

  @Column('text')
  provider_type: string;

  @Column('text', { nullable: true })
  api_key?: string;

  @Column('json')
  messages: {
    role: string;
    content: string;
    name?: string;
  }[];

  @Column('float')
  temperature: number;

  @Column('json', { nullable: true })
  functions?: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  }[];

  @Column('json', { nullable: true })
  function_call?: {
    name: string;
    arguments: string;
  };

  @Column('text', { nullable: true })
  stop?: string;

  @Column('int', { nullable: true })
  max_tokens?: number;

  @Column('float', { nullable: true })
  presence_penalty?: number;

  @Column('float', { nullable: true })
  frequency_penalty?: number;

  @Column('json', { nullable: true })
  logit_bias?: Record<string, number>;

  @Column('text', { nullable: true })
  user?: string;

  @Column('json', { nullable: true })
  response_format?: {
    type: string;
    [key: string]: any;
  };

  @Column('json', { nullable: true })
  tools?: {
    type: string;
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  }[];

  @Column('text', { nullable: true })
  tool_choice?: string;

  @Column('json', { nullable: true })
  response?: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
      index: number;
      message?: {
        role: string;
        content: string;
        tool_calls?: {
          id: string;
          type: string;
          function: {
            name: string;
            arguments: string;
          };
        }[];
      };
      finish_reason: string;
    }[];
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };

  @Column('text', { nullable: true })
  answer?: string;

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;

  @Column('boolean', { default: false })
  is_streaming: boolean;

  @Column('boolean', { default: false })
  is_error: boolean;

  @Column('text', { nullable: true })
  error_message?: string;

  @Column('int', { nullable: true })
  latency_ms?: number;

  @Column('int', { nullable: true })
  token_count?: number;

  @Column('float', { nullable: true })
  cost?: number;

  @CreateDateColumn()
  created_at: Date;

  @Column('json', { nullable: true })
  tags?: string[];

  @Column('text', { nullable: true })
  session_id?: string;

  @Column('text', { nullable: true })
  exchange_id?: string;

  @Column('text', { nullable: true })
  tool_type?: string;

  @Column('json', { nullable: true })
  context?: Record<string, any>;
}