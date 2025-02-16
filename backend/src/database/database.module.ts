import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { LanceService } from './lance.service';

@Module({
	providers: [Neo4jService, LanceService],
	exports: [Neo4jService, LanceService],
})
export class DatabaseModule implements OnModuleInit {
	private readonly logger = new Logger(DatabaseModule.name);

	constructor(
		private readonly neo4jService: Neo4jService,
		private readonly lanceService: LanceService
	) {}

	async onModuleInit() {
		try {
			// Initialize LanceDB first
			await this.lanceService.storeEmbeddings('code-entities', []);
			this.logger.log('LanceDB initialized successfully');

			// Then initialize Neo4j
			await this.initializeNeo4j();
			this.logger.log('Neo4j initialized successfully');
		} catch (error) {
			this.logger.error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
			throw error;
		}
	}

	private async initializeNeo4j() {
		await this.neo4jService.write(`
			CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE
		`);

		await this.neo4jService.write(`
			CREATE CONSTRAINT IF NOT EXISTS FOR (r:Repository) REQUIRE r.id IS UNIQUE
		`);

		await this.neo4jService.write(`
			CREATE CONSTRAINT IF NOT EXISTS FOR (e:CodeEntity) REQUIRE e.name IS UNIQUE
		`);

		const indexName = 'code-entity-embeddings';
		const existingIndexes = await this.neo4jService.read(`SHOW indexes`);
		const indexExists = existingIndexes.records.some(record => record.get('name') === indexName);

		if (!indexExists) {
			await this.neo4jService.write(`
				CALL db.index.vector.createNodeIndex(
					'code-entity-embeddings',
					'CodeEntity',
					'vector',
					1536,
					'cosine'
				)
			`);
			this.logger.log(`Vector index '${indexName}' created successfully.`);
		} else {
			this.logger.log(`Vector index '${indexName}' already exists.`);
		}
	}
}

