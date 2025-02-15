import { Module, OnModuleInit, Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '@/common/services/supabase.service';
import { CommonModule } from '@/common/common.module';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
class DatabaseInitializer implements OnModuleInit {
	private readonly logger = new Logger('DatabaseInitializer');

	constructor(private readonly supabaseService: SupabaseService) {}

	async onModuleInit() {
		try {
			const migrationPath = path.join(__dirname, 'migrations', 'create_code_entity_graph.sql');
			const migrationSql = fs.readFileSync(migrationPath, 'utf8');

			const { error } = await this.supabaseService.getClient().rpc('exec_sql', {
				sql_string: migrationSql
			});

			if (error) {
				this.logger.error(`Failed to run migration: ${error.message}`);
				throw error;
			}

			this.logger.log('Database migrations completed successfully');
		} catch (error) {
			this.logger.error(`Failed to initialize database: ${error.message}`);
			throw error;
		}
	}
}

@Module({
	imports: [CommonModule],
	providers: [DatabaseInitializer],
})
export class DatabaseModule {}