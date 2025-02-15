import { Injectable } from '@nestjs/common';
import { CreateRepositoryDto, UpdateRepositoryDto, Repository } from './dto/repository.dto';
import { Neo4jService } from '@/database/neo4j.service';


@Injectable()
export class RepositoriesService {
	constructor(private readonly neo4jService: Neo4jService) {}

	async create(userId: string, createRepositoryDto: CreateRepositoryDto): Promise<Repository> {
		const result = await this.neo4jService.write(`
			MATCH (u:User {id: $userId})
			CREATE (r:Repository {
				id: randomUUID(),
				name: $name,
				url: $url,
				description: $description,
				user_id: $userId,
				created_at: datetime(),
				updated_at: datetime()
			})
			CREATE (u)-[:OWNS]->(r)
			RETURN r
		`, {
			userId,
			...createRepositoryDto
		});

		return result.records[0].get('r').properties;
	}

	async findAll(userId: string): Promise<Repository[]> {
		const result = await this.neo4jService.read(`
			MATCH (u:User {id: $userId})-[:OWNS]->(r:Repository)
			RETURN r
			ORDER BY r.updated_at DESC
		`, { userId });

		interface RecordType {
			get: (key: 'r') => { properties: Repository };
		}

		return result.records.map((record: RecordType) => record.get('r').properties);
	}

	async update(userId: string, id: string, updateRepositoryDto: UpdateRepositoryDto): Promise<Repository> {
		const result = await this.neo4jService.write(`
			MATCH (u:User {id: $userId})-[:OWNS]->(r:Repository {id: $id})
			SET r += $updates, r.updated_at = datetime()
			RETURN r
		`, {
			userId,
			id,
			updates: updateRepositoryDto
		});

		if (result.records.length === 0) {
			throw new Error('Repository not found');
		}

		return result.records[0].get('r').properties;
	}

	async remove(userId: string, id: string): Promise<void> {
		const result = await this.neo4jService.write(`
			MATCH (u:User {id: $userId})-[:OWNS]->(r:Repository {id: $id})
			DETACH DELETE r
		`, { userId, id });

		if (result.summary.counters.updates().nodesDeleted === 0) {
			throw new Error('Repository not found');
		}
	}
}