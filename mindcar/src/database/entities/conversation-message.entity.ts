import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Entity for storing conversation messages
 * Maps to the agent_conversation_message table from Rust migration
 */
@Entity('agent_conversation_message')
export class ConversationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  session_id: string;

  @Index()
  @Column()
  exchange_id: string;

  @Column('text')
  message: string;

  @Column('text', { nullable: true })
  thinking?: string;

  @Column('json', { nullable: true })
  context?: any;

  @Column('text', { nullable: true })
  answer?: string;

  @Column('json', { nullable: true })
  variables?: any[];

  @Column('boolean', { default: false })
  is_human: boolean;

  @Column('boolean', { default: false })
  is_error: boolean;

  @Column('boolean', { default: false })
  is_plan_generation: boolean;

  @Column('boolean', { default: false })
  is_plan_execution: boolean;

  @Column('boolean', { default: false })
  is_plan_append: boolean;

  @Column('boolean', { default: false })
  with_lsp_enrichment: boolean;

  @Column('int', { nullable: true })
  is_plan_execution_until?: number;

  @Column('int', { nullable: true })
  is_plan_drop_from?: number;

  @Column('json', { nullable: true })
  project_labels?: string[];

  @Column('text', { nullable: true })
  repo_ref?: string;

  @Column('text', { nullable: true })
  root_directory?: string;

  @Column('boolean', { default: false })
  codebase_search: boolean;

  @Column('json', { nullable: true })
  all_files?: string[];

  @Column('json', { nullable: true })
  open_files?: string[];

  @Column('text', { nullable: true })
  shell?: string;

  @Column('text', { nullable: true })
  aide_rules?: string;

  @Column('boolean', { default: false })
  reasoning: boolean;

  @Column('boolean', { default: false })
  semantic_search: boolean;

  @Column('boolean', { default: false })
  is_devtools_context: boolean;

  @CreateDateColumn()
  created_at: Date;

  @Column('text', { nullable: true })
  model_type?: string;

  @Column('text', { nullable: true })
  provider_type?: string;

  @Column('text', { nullable: true })
  api_key?: string;

  @Column('text', { nullable: true })
  editor_url?: string;

  @Column('text', { nullable: true })
  agent_mode?: string;
}