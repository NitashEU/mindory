import { Module } from '@nestjs/common';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';
import { CommonModule } from '@/common/common.module';
import { DatabaseModule } from '@/database/database.module';

@Module({
	imports: [CommonModule, DatabaseModule],
	controllers: [RepositoriesController],
	providers: [RepositoriesService],
	exports: [RepositoriesService]
})
export class RepositoriesModule {}