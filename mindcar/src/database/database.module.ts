import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfigService } from './database.config';
import { AgentEvent } from './entities/agent-event.entity';
import { ConversationMessage } from './entities/conversation-message.entity';
import { FileCache } from './entities/file-cache.entity';
import { GitLogStatistic } from './entities/git-log.entity';
import { LLMData } from './entities/llm-data.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfigService,
      inject: [DatabaseConfigService],
    }),
    TypeOrmModule.forFeature([
      AgentEvent,
      ConversationMessage,
      FileCache,
      GitLogStatistic,
      LLMData,
    ]),
  ],
  providers: [DatabaseConfigService],
  exports: [
    TypeOrmModule.forFeature([
      AgentEvent,
      ConversationMessage,
      FileCache,
      GitLogStatistic,
      LLMData,
    ]),
    DatabaseConfigService,
  ],
})
export class DatabaseModule {}

// Export entities for use in other modules
export {
  AgentEvent,
  ConversationMessage,
  FileCache,
  GitLogStatistic,
  LLMData,
};