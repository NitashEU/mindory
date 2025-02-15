import { Module } from '@nestjs/common';
import { CodebaseInputController } from './codebase-input.controller';
import { CodebaseInputService } from './codebase-input.service';
import { CommonModule } from '@/common/common.module';
import { CodeProcessingModule } from '../code-processing/code-processing.module';

@Module({
  controllers: [CodebaseInputController],
  providers: [CodebaseInputService],
  imports: [
    CommonModule,
    CodeProcessingModule
  ],
})
export class CodebaseInputModule { }
