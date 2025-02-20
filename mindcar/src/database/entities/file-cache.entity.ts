import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Entity for storing file cache data
 * Maps to the file_cache table from Rust migration
 */
@Entity('file_cache')
export class FileCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  fs_file_path: string;

  @Column('text')
  file_content: string;

  @Column('text', { nullable: true })
  language?: string;

  @Column('text', { nullable: true })
  repo_ref?: string;

  @Column('text', { nullable: true })
  git_hash?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('json', { nullable: true })
  imports?: string[];

  @Column('json', { nullable: true })
  exports?: string[];

  @Column('json', { nullable: true })
  functions?: string[];

  @Column('json', { nullable: true })
  classes?: string[];

  @Column('json', { nullable: true })
  variables?: string[];

  @Column('boolean', { default: false })
  is_test_file: boolean;

  @Column('boolean', { default: false })
  is_generated: boolean;

  @Column('boolean', { default: false })
  is_build_file: boolean;

  @Column('boolean', { default: false })
  is_config_file: boolean;

  @Column('boolean', { default: false })
  is_documentation: boolean;

  @Column('text', { nullable: true })
  file_type?: string;

  @Column('int', { nullable: true })
  line_count?: number;

  @Column('int', { nullable: true })
  char_count?: number;

  @Column('json', { nullable: true })
  dependencies?: string[];

  @Column('json', { nullable: true })
  dependents?: string[];

  @Column('text', { nullable: true })
  module_path?: string;

  @Column('json', { nullable: true })
  tags?: string[];

  @Column('float', { nullable: true })
  complexity_score?: number;

  @Column('float', { nullable: true })
  maintainability_index?: number;

  @Column('json', { nullable: true })
  code_sections?: {
    start_line: number;
    end_line: number;
    section_type: string;
    content: string;
  }[];

  @Column('json', { nullable: true })
  ast_data?: any;

  @Column('json', { nullable: true })
  symbol_references?: {
    symbol: string;
    locations: { line: number; character: number }[];
  }[];

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;
}