import { Module, OnModuleInit } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';

@Module({
	providers: [Neo4jService],
	exports: [Neo4jService],
})

export class DatabaseModule implements OnModuleInit {
	constructor(private readonly neo4jService: Neo4jService) {}

	async onModuleInit() {
		// Create indexes for efficient querying
		await this.neo4jService.write(`
			CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE
		`);

		await this.neo4jService.write(`
			CREATE CONSTRAINT IF NOT EXISTS FOR (r:Repository) REQUIRE r.id IS UNIQUE
		`);

		await this.neo4jService.write(`
			CREATE CONSTRAINT IF NOT EXISTS FOR (e:CodeEntity) REQUIRE e.name IS UNIQUE
		`);

		// Create vector index for semantic search
		await this.neo4jService.write(`
			CALL db.index.vector.createNodeIndex(
				'code-entity-embeddings',
				'CodeEntity',
				'vector',
				1536,
				'cosine'
			)
		`);
	}
}
