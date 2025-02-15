import { Module } from '@nestjs/common';
import { CodeProcessingService } from './code-processing.service';
import { CodeProcessingController } from './code-processing.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [CodeProcessingController],
  providers: [CodeProcessingService],
  exports: [CodeProcessingService],
})
export class CodeProcessingModule {}