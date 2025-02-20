import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';
import { UIEvent } from '../../interfaces/ui-event.interface';

/**
 * Entity for storing agent events
 * Maps to the agent_events table from Rust migration
 */
@Entity('agent_events')
export class AgentEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  session_id: string;

  @Index()
  @Column()
  exchange_id: string;

  @Column('json')
  event_data: UIEvent;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  event_type?: string;

  @Column({ nullable: true })
  tool_type?: string;

  @Column({ nullable: true })
  thinking?: string;

  @Column({ nullable: true })
  answer_up_until_now?: string;

  @Column({ nullable: true })
  delta?: string;

  @Column({ nullable: true })
  files_to_edit?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  index?: number;

  @Column({ nullable: true })
  error_message?: string;

  @Column({ type: 'boolean', default: false })
  is_error: boolean;

  @Column({ type: 'boolean', default: false })
  is_thinking: boolean;

  @Column({ type: 'boolean', default: false })
  is_plan_step: boolean;

  @Column({ type: 'boolean', default: false })
  is_tool_use: boolean;

  @Column({ type: 'boolean', default: false })
  is_chat_message: boolean;
}