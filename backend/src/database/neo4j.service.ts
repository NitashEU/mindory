import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Result, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService {
	private readonly driver: Driver;

	constructor(private configService: ConfigService) {
		const url = this.configService.getOrThrow('neo4j.url');
		const username = this.configService.getOrThrow('neo4j.username');
		const password = this.configService.getOrThrow('neo4j.password');
		this.driver = neo4j.driver(url, neo4j.auth.basic(username, password));
	}

	async read(query: string, params?: Record<string, any>): Promise<Result> {
		const session: Session = this.driver.session();
		try {
			return await session.run(query, params);
		} finally {
			await session.close();
		}
	}

	async write(query: string, params?: Record<string, any>): Promise<Result> {
		const session: Session = this.driver.session();
		try {
			return await session.run(query, params);
		} finally {
			await session.close();
		}
	}

	async createCodeEntityGraph(entities: any[]): Promise<void> {
		const session: Session = this.driver.session();
		try {
			await session.run(`
				UNWIND $entities as entity
				MERGE (e:CodeEntity {
					name: entity.name,
					type: entity.type,
					content: entity.content,
					filePath: entity.filePath,
					startLine: entity.startLine,
					endLine: entity.endLine,
					vector: entity.vector
				})
				WITH e, entity
				UNWIND entity.dependencies as dep
				MERGE (d:CodeEntity {name: dep})
				MERGE (e)-[:DEPENDS_ON]->(d)
			`, { entities });
		} finally {
			await session.close();
		}
	}
}