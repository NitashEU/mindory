import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from '@lancedb/lancedb';

@Injectable()

export class LanceService {
	private readonly logger = new Logger(LanceService.name);

	constructor(private configService: ConfigService) {}

	async storeEmbeddings(tableName: string, data: { 
		vector: number[]; 
		type: string;
		name: string;
		content: string;
		filePath: string;
		startLine: number;
		endLine: number;
		dependencies: string[];
	}[]) {
		try {
			const uri = this.configService.getOrThrow('lancedb.uri');
			this.logger.log(`Connecting to LanceDB at ${uri}`);
			
			const db = await connect(uri);
			this.logger.log('Connected to LanceDB');

			// Create a simple sample record if no data provided
			const records = data.length > 0 ? data : [{
				vector: Array(1536).fill(0),
				type: 'sample',
				name: 'sample',
				content: 'sample',
				filePath: 'sample',
				startLine: 0,
				endLine: 0,
				dependencies: ['sample']
			}];

			let table;
			try {
				this.logger.log(`Attempting to open existing table ${tableName}`);
				table = await db.openTable(tableName);
				this.logger.log(`Table ${tableName} opened successfully`);
				await table.add(records);
				this.logger.log(`Added new records to existing table ${tableName}`);
			} catch (e) {
				this.logger.log(`Table ${tableName} does not exist, creating new table`);
				table = await db.createTable(tableName, records);
				this.logger.log(`Table ${tableName} created successfully`);
			}

			return table;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			this.logger.error(`Failed to store embeddings: ${errorMessage}`);
			this.logger.error(`Error details: ${JSON.stringify(error)}`);
			throw error;
		}
	}

	async search(tableName: string, vector: number[], limit: number = 5) {
		try {
			const uri = this.configService.getOrThrow('lancedb.uri');
			this.logger.log(`Connecting to LanceDB at ${uri}`);
			
			const db = await connect(uri);
			this.logger.log(`Opening table ${tableName}`);
			
			const table = await db.openTable(tableName);
			const results = [];
			
			for await (const batch of table.vectorSearch(vector).select(['*']).limit(limit)) {
				results.push(...batch);
			}
			
			return results;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			this.logger.error(`Failed to search: ${errorMessage}`);
			throw error;
		}
	}
}
