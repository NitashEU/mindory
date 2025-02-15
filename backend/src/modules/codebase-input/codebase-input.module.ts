import { Module } from '@nestjs/common';
import { CodebaseInputController } from './codebase-input.controller';
import { CodebaseInputService } from './codebase-input.service';
import { CommonModule } from '@/common/common.module';

@Module({
  controllers: [CodebaseInputController],
  providers: [CodebaseInputService],
  imports: [
    CommonModule
  ],
})
export class CodebaseInputModule { }
