import { Module } from '@nestjs/common';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';
import { CommonModule } from '../../common/common.module';

@Module({
	imports: [CommonModule],
	controllers: [RepositoriesController],
	providers: [RepositoriesService],
	exports: [RepositoriesService]
})
export class RepositoriesModule {}