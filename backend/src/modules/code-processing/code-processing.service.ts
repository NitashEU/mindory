import Lua from "@tree-sitter-grammars/tree-sitter-lua";
import Parser from "tree-sitter";
import { connect, Connection } from "@lancedb/lancedb";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { VoyageService } from "@/common/services/voyage.service";
import { SupabaseService } from "@/common/services/supabase.service";

import { SearchResult } from './interfaces/search-result.interface';

interface CodeEntity {

  type: "function" | "class" | "method" | "table";
  name: string;
  content: string;
  filePath: string;
  startLine: number;
  endLine: number;
  dependencies: string[];
  vector?: number[];
}

@Injectable()
export class CodeProcessingService implements OnModuleInit {
  private readonly logger = new Logger(CodeProcessingService.name);
  private readonly parser: Parser;
  private lanceDb: Connection;
  private readonly supabase;

  constructor(
    private readonly configService: ConfigService,
    private readonly voyageService: VoyageService,
    private readonly supabaseService: SupabaseService
  ) {
    this.parser = new Parser();
    this.parser.setLanguage(Lua as unknown as Parser.Language);
    this.supabase = this.supabaseService.client;
  }

  async onModuleInit() {
    try {
      const lanceDbPath = this.configService.get('lancedb.path');
      this.lanceDb = await connect(lanceDbPath);
      this.logger.log('LanceDB initialized successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize LanceDB: ${errorMessage}`);
      throw error;
    }
  }

  async processRepository(
    files: { path: string; content: string }[]
  ): Promise<void> {
    try {
      const entities: CodeEntity[] = [];

      for (const file of files) {
        if (!file.path.endsWith(".lua")) continue;

        const fileEntities = await this.parseFile(file.path, file.content);
        entities.push(...fileEntities);

        // Generate embeddings for entities
        const embeddings = await this.voyageService.generateEmbeddings(
          fileEntities.map((e) => e.content),
          "voyage-code-3"
        );

        // Attach embeddings to entities
        for (let i = 0; i < fileEntities.length; i++) {
          fileEntities[i].vector = embeddings.data![i].embedding;
        }
      }

      await Promise.all([
        this.storeInLanceDb(entities),
        this.storeInPgGraph(entities),
      ]);
    } catch (error) {
      this.logger.error(
        `Failed to process repository: ${(error as any).message}`
      );
      throw error;
    }
  }

  private async storeInLanceDb(entities: CodeEntity[]): Promise<void> {
    try {
      const tableName = 'code_entities';
      let table;
      
      try {
        table = await this.lanceDb.openTable(tableName);
      } catch {
        if (entities.length > 0) {
          table = await this.lanceDb.createTable(tableName, entities);
        } else {
          this.logger.warn("No entities to create LanceDB table");
          return;
        }
      }

      if (entities.length > 0) {
        await table.add(entities);
      }
    } catch (error) {
        this.logger.error(`Failed to store in LanceDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async storeInPgGraph(entities: CodeEntity[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('create_code_entity_graph', {
          entities: entities
        });

      if (error) {
        throw new Error(`Failed to store in pggraph: ${error.message}`);
      }
    } catch (error) {
        this.logger.error(`Failed to store in Supabase pggraph: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async parseFile(
    filePath: string,
    content: string
  ): Promise<CodeEntity[]> {
    try {
      const tree = this.parser.parse(content);
      const entities: CodeEntity[] = [];
      const query = this.createTreeSitterQuery();

      const captures = query.captures(tree.rootNode);
      let currentEntity: Partial<CodeEntity> | null = null;

      for (const capture of captures) {
        const { node, name } = capture;

        if (name.startsWith("definition")) {
          if (currentEntity) {
            entities.push(currentEntity as CodeEntity);
          }

          currentEntity = {
            type: this.determineEntityType(name),
            name: this.extractNodeName(node),
            content: node.text,
            filePath,
            startLine: node.startPosition.row,
            endLine: node.endPosition.row,
            dependencies: [] as string[],
          };
        } else if (name === "reference.call" && currentEntity) {
          currentEntity.dependencies!.push(this.extractDependencyName(node));
        }
      }

      if (currentEntity) {
        entities.push(currentEntity as CodeEntity);
      }

      return entities;
    } catch (error) {
      this.logger.error(
        `Failed to parse file ${filePath}: ${(error as any).message}`
      );
      throw error;
    }
  }

  private createTreeSitterQuery(): Parser.Query {
    const queryString = `
      (function_declaration
        name: [
          (identifier) @name
          (dot_index_expression field: (identifier) @name)
        ]) @definition.function

      (function_declaration
        name: (method_index_expression
          method: (identifier) @name)) @definition.method

      (table_constructor
        (field
          name: (identifier) @name
          value: (function_definition))) @definition.table

      (function_call
        name: [
          (identifier) @name
          (dot_index_expression field: (identifier) @name)
          (method_index_expression method: (identifier) @name)
        ]) @reference.call
    `;
    return new Parser.Query(Lua as unknown as Parser.Language, queryString);
  }

  private determineEntityType(definitionType: string): CodeEntity["type"] {
    const typeMap: Record<string, CodeEntity["type"]> = {
      "definition.function": "function",
      "definition.method": "method",
      "definition.table": "table",
    };
    return typeMap[definitionType] || "function";
  }

  private extractNodeName(node: Parser.SyntaxNode): string {
    // Extract name based on node type and structure
    const nameNode = node.childForFieldName("name");
    return nameNode ? nameNode.text : "anonymous";
  }

  private extractDependencyName(node: Parser.SyntaxNode): string {
    // Extract dependency name from function call node
    return node.text.split(".")[0];
  }

  async searchCode(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const embeddings = await this.voyageService.generateEmbeddings(
        [query],
        "voyage-code-3"
      );
      const queryVector = embeddings.data![0].embedding;

      const table = await this.lanceDb.openTable('code_entities');
      const results = await table.search(queryVector).limit(limit).execute();

      const enrichedResults = await Promise.all(
        results.map(async (result): Promise<SearchResult> => {
          const { data, error } = await this.supabase
            .rpc('get_entity_dependencies', {
              entity_name: result.name
            });

          return {
            entity: {
              type: result.type,
              name: result.name,
              content: result.content,
              filePath: result.filePath,
              startLine: result.startLine,
              endLine: result.endLine,
              dependencies: result.dependencies,
            },
            score: result.score,
            dependencies: error ? [] : data
          };
        })
      );

      return enrichedResults;
    } catch (error) {
      this.logger.error(`Failed to search code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

