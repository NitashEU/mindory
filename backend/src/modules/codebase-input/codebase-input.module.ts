import { Module } from '@nestjs/common';
import { CodebaseInputController } from './codebase-input.controller';
import { CodebaseInputService } from './codebase-input.service';

@Module({
  controllers: [CodebaseInputController],
  providers: [CodebaseInputService],
})
export class CodebaseInputModule {}
