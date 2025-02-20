import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1710000000000 implements MigrationInterface {
    name = 'InitialMigration1710000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agent Events table
        await queryRunner.query(`
            CREATE TABLE "agent_events" (
                "id" varchar PRIMARY KEY NOT NULL,
                "session_id" varchar NOT NULL,
                "exchange_id" varchar NOT NULL,
                "event_data" text NOT NULL,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "event_type" varchar,
                "tool_type" varchar,
                "thinking" text,
                "answer_up_until_now" text,
                "delta" text,
                "files_to_edit" text,
                "title" text,
                "description" text,
                "index" integer,
                "error_message" text,
                "is_error" boolean NOT NULL DEFAULT (0),
                "is_thinking" boolean NOT NULL DEFAULT (0),
                "is_plan_step" boolean NOT NULL DEFAULT (0),
                "is_tool_use" boolean NOT NULL DEFAULT (0),
                "is_chat_message" boolean NOT NULL DEFAULT (0)
            )
        `);

        // Agent Conversation Message table
        await queryRunner.query(`
            CREATE TABLE "agent_conversation_message" (
                "id" varchar PRIMARY KEY NOT NULL,
                "session_id" varchar NOT NULL,
                "exchange_id" varchar NOT NULL,
                "message" text NOT NULL,
                "thinking" text,
                "context" text,
                "answer" text,
                "variables" text,
                "is_human" boolean NOT NULL DEFAULT (0),
                "is_error" boolean NOT NULL DEFAULT (0),
                "is_plan_generation" boolean NOT NULL DEFAULT (0),
                "is_plan_execution" boolean NOT NULL DEFAULT (0),
                "is_plan_append" boolean NOT NULL DEFAULT (0),
                "with_lsp_enrichment" boolean NOT NULL DEFAULT (0),
                "is_plan_execution_until" integer,
                "is_plan_drop_from" integer,
                "project_labels" text,
                "repo_ref" text,
                "root_directory" text,
                "codebase_search" boolean NOT NULL DEFAULT (0),
                "all_files" text,
                "open_files" text,
                "shell" text,
                "aide_rules" text,
                "reasoning" boolean NOT NULL DEFAULT (0),
                "semantic_search" boolean NOT NULL DEFAULT (0),
                "is_devtools_context" boolean NOT NULL DEFAULT (0),
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "model_type" text,
                "provider_type" text,
                "api_key" text,
                "editor_url" text,
                "agent_mode" text
            )
        `);

        // File Cache table
        await queryRunner.query(`
            CREATE TABLE "file_cache" (
                "id" varchar PRIMARY KEY NOT NULL,
                "fs_file_path" varchar NOT NULL,
                "file_content" text NOT NULL,
                "language" text,
                "repo_ref" text,
                "git_hash" text,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "imports" text,
                "exports" text,
                "functions" text,
                "classes" text,
                "variables" text,
                "is_test_file" boolean NOT NULL DEFAULT (0),
                "is_generated" boolean NOT NULL DEFAULT (0),
                "is_build_file" boolean NOT NULL DEFAULT (0),
                "is_config_file" boolean NOT NULL DEFAULT (0),
                "is_documentation" boolean NOT NULL DEFAULT (0),
                "file_type" text,
                "line_count" integer,
                "char_count" integer,
                "dependencies" text,
                "dependents" text,
                "module_path" text,
                "tags" text,
                "complexity_score" real,
                "maintainability_index" real,
                "code_sections" text,
                "ast_data" text,
                "symbol_references" text,
                "metadata" text
            )
        `);

        // Git Log Statistics table
        await queryRunner.query(`
            CREATE TABLE "git_log_statistics" (
                "id" varchar PRIMARY KEY NOT NULL,
                "fs_file_path" varchar NOT NULL,
                "git_hash" text NOT NULL,
                "repo_ref" text,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "commit_count" integer NOT NULL DEFAULT (0),
                "author_count" integer NOT NULL DEFAULT (0),
                "total_additions" integer NOT NULL DEFAULT (0),
                "total_deletions" integer NOT NULL DEFAULT (0),
                "commit_history" text NOT NULL,
                "author_stats" text NOT NULL,
                "file_renames" text,
                "change_frequency" text NOT NULL,
                "churn_rate" real,
                "last_modified_date" text,
                "creation_date" text,
                "co_changed_files" text,
                "blame_data" text,
                "complexity_trend" text,
                "bug_fixes" text,
                "metadata" text
            )
        `);

        // LLM Data table
        await queryRunner.query(`
            CREATE TABLE "llm_data" (
                "id" varchar PRIMARY KEY NOT NULL,
                "request_id" varchar NOT NULL,
                "model_type" text NOT NULL,
                "provider_type" text NOT NULL,
                "api_key" text,
                "messages" text NOT NULL,
                "temperature" real NOT NULL,
                "functions" text,
                "function_call" text,
                "stop" text,
                "max_tokens" integer,
                "presence_penalty" real,
                "frequency_penalty" real,
                "logit_bias" text,
                "user" text,
                "response_format" text,
                "tools" text,
                "tool_choice" text,
                "response" text,
                "answer" text,
                "metadata" text,
                "is_streaming" boolean NOT NULL DEFAULT (0),
                "is_error" boolean NOT NULL DEFAULT (0),
                "error_message" text,
                "latency_ms" integer,
                "token_count" integer,
                "cost" real,
                "created_at" datetime NOT NULL DEFAULT (datetime('now')),
                "tags" text,
                "session_id" text,
                "exchange_id" text,
                "tool_type" text,
                "context" text
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_agent_events_session_id" ON "agent_events" ("session_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_agent_events_exchange_id" ON "agent_events" ("exchange_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_conversation_session_id" ON "agent_conversation_message" ("session_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_conversation_exchange_id" ON "agent_conversation_message" ("exchange_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_file_cache_fs_file_path" ON "file_cache" ("fs_file_path")`);
        await queryRunner.query(`CREATE INDEX "IDX_git_log_fs_file_path" ON "git_log_statistics" ("fs_file_path")`);
        await queryRunner.query(`CREATE INDEX "IDX_llm_data_request_id" ON "llm_data" ("request_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_llm_data_request_id"`);
        await queryRunner.query(`DROP INDEX "IDX_git_log_fs_file_path"`);
        await queryRunner.query(`DROP INDEX "IDX_file_cache_fs_file_path"`);
        await queryRunner.query(`DROP INDEX "IDX_conversation_exchange_id"`);
        await queryRunner.query(`DROP INDEX "IDX_conversation_session_id"`);
        await queryRunner.query(`DROP INDEX "IDX_agent_events_exchange_id"`);
        await queryRunner.query(`DROP INDEX "IDX_agent_events_session_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "llm_data"`);
        await queryRunner.query(`DROP TABLE "git_log_statistics"`);
        await queryRunner.query(`DROP TABLE "file_cache"`);
        await queryRunner.query(`DROP TABLE "agent_conversation_message"`);
        await queryRunner.query(`DROP TABLE "agent_events"`);
    }
}