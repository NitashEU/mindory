import { Module } from '@nestjs/common';
import { CodeProcessingService } from './code-processing.service';
import { CodeProcessingController } from './code-processing.controller';
import { CommonModule } from '@/common/common.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
  imports: [CommonModule, DatabaseModule],
  controllers: [CodeProcessingController],
  providers: [CodeProcessingService],
  exports: [CodeProcessingService],
})
export class CodeProcessingModule {}