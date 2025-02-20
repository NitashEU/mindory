import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AgenticController } from './agentic.controller';
import { AgenticService } from './agentic.service';
import { AgentToolController } from './controllers/agent-tool.controller';
import { AgentToolService } from './services/agent-tool.service';

@Module({
  imports: [SharedModule],
  controllers: [AgenticController, AgentToolController],
  providers: [AgenticService, AgentToolService],
  exports: [AgenticService, AgentToolService],
})
export class AgenticModule {}
