import { AgenticController } from './agentic.controller';
import { AgenticService } from './agentic.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AgenticController],
  providers: [AgenticService],
  exports: [AgenticService],
})
export class AgenticModule {}
