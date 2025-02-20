import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Entity for storing git log statistics
 * Maps to the git_log_statistics table from Rust migration
 */
@Entity('git_log_statistics')
export class GitLogStatistic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  fs_file_path: string;

  @Column('text')
  git_hash: string;

  @Column('text', { nullable: true })
  repo_ref?: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('int', { default: 0 })
  commit_count: number;

  @Column('int', { default: 0 })
  author_count: number;

  @Column('int', { default: 0 })
  total_additions: number;

  @Column('int', { default: 0 })
  total_deletions: number;

  @Column('json')
  commit_history: {
    hash: string;
    author: string;
    date: string;
    message: string;
    additions: number;
    deletions: number;
  }[];

  @Column('json')
  author_stats: {
    author: string;
    commit_count: number;
    additions: number;
    deletions: number;
    last_commit_date: string;
  }[];

  @Column('json', { nullable: true })
  file_renames?: {
    old_path: string;
    new_path: string;
    commit_hash: string;
    date: string;
  }[];

  @Column('json')
  change_frequency: {
    period: string;
    commit_count: number;
    additions: number;
    deletions: number;
  }[];

  @Column('float', { nullable: true })
  churn_rate?: number;

  @Column('text', { nullable: true })
  last_modified_date?: string;

  @Column('text', { nullable: true })
  creation_date?: string;

  @Column('json', { nullable: true })
  co_changed_files?: {
    file_path: string;
    change_count: number;
    correlation: number;
  }[];

  @Column('json', { nullable: true })
  blame_data?: {
    line_ranges: {
      start: number;
      end: number;
      author: string;
      commit_hash: string;
      date: string;
    }[];
  };

  @Column('json', { nullable: true })
  complexity_trend?: {
    date: string;
    complexity_score: number;
  }[];

  @Column('json', { nullable: true })
  bug_fixes?: {
    commit_hash: string;
    date: string;
    message: string;
    files_changed: string[];
  }[];

  @Column('json', { nullable: true })
  metadata?: Record<string, any>;
}