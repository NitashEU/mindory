import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AgentEvent } from './entities/agent-event.entity';
import { ConversationMessage } from './entities/conversation-message.entity';
import { FileCache } from './entities/file-cache.entity';
import { GitLogStatistic } from './entities/git-log.entity';
import { LLMData } from './entities/llm-data.entity';

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  getDatabaseConfig(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: this.configService.get<string>('DATABASE_PATH', 'codestory.db'),
      entities: [
        AgentEvent,
        ConversationMessage,
        FileCache,
        GitLogStatistic,
        LLMData,
      ],
      migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
      migrationsRun: true, // Automatically run migrations on startup
      synchronize: false, // Disable synchronize in production
      logging: this.configService.get<boolean>('DATABASE_LOGGING', false),
      maxQueryExecutionTime: this.configService.get<number>('DATABASE_TIMEOUT', 1000),
      // SQLite-specific options
      enableWAL: true, // Enable Write-Ahead Logging
      busyTimeout: 3000, // Wait up to 3s when the database is busy
    };
  }

  getDataSourceOptions() {
    return {
      ...this.getDatabaseConfig(),
      migrations: ['src/database/migrations/**/*{.ts,.js}'],
      migrationsTableName: 'migrations',
    };
  }
}