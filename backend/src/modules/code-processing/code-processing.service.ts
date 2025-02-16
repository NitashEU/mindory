import { Injectable, Logger } from "@nestjs/common";
import { Neo4jService } from "@/database/neo4j.service";
import { LanceService } from "@/database/lance.service";
import { VoyageService } from "@/common/services";
import { SearchResult } from "./interfaces/search-result.interface";
import Lua from "@tree-sitter-grammars/tree-sitter-lua";
import Parser from "tree-sitter";

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
export class CodeProcessingService {
  private readonly logger = new Logger(CodeProcessingService.name);
  private readonly parser: Parser;

  constructor(
    private readonly voyageService: VoyageService,
    private readonly neo4jService: Neo4jService,
    private readonly lanceService: LanceService
  ) {
    this.parser = new Parser();
    this.parser.setLanguage(Lua as any);
  }

  async processRepository(files: { path: string; content: string }[]): Promise<void> {
    try {
      const entities: CodeEntity[] = [];

      for (const file of files) {
        if (!file.path.endsWith(".lua")) continue;

        const fileEntities = await this.parseFile(file.path, file.content);
        entities.push(...fileEntities);

        const embeddings = await this.voyageService.generateEmbeddings(
          fileEntities.map((e) => e.content),
          "voyage-code-3"
        );

        for (let i = 0; i < fileEntities.length; i++) {
          fileEntities[i].vector = embeddings.data![i].embedding;
        }
      }

      await this.storeEmbeddings(entities);
    } catch (error) {
      this.logger.error(`Failed to process repository: ${(error as any).message}`);
      throw error;
    }
  }

  private async storeEmbeddings(entities: CodeEntity[]): Promise<void> {
    try {
      await this.neo4jService.createCodeEntityGraph(entities);

      const lanceData = entities.map(entity => ({
        vector: entity.vector!,
        type: entity.type,
        name: entity.name,
        content: entity.content,
        filePath: entity.filePath,
        startLine: entity.startLine,
        endLine: entity.endLine,
        dependencies: entity.dependencies
      }));
      await this.lanceService.storeEmbeddings('code-entities', lanceData);
    } catch (error) {
      this.logger.error(`Failed to store embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }


  private async parseFile(filePath: string, content: string): Promise<CodeEntity[]> {
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
            dependencies: [],
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
      this.logger.error(`Failed to parse file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private createTreeSitterQuery(): any {
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
    return new Parser.Query(Lua as any, queryString);
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
    const nameNode = node.childForFieldName("name");
    return nameNode ? nameNode.text : "anonymous";
  }

  private extractDependencyName(node: Parser.SyntaxNode): string {
    return node.text.split(".")[0];
  }

  private async searchNeo4j(queryVector: number[], limit: number): Promise<SearchResult[]> {
    const cypherQuery = `
      WITH $queryVector AS queryVector
      CALL db.index.vector.queryNodes('code-entity-embeddings', $limit, queryVector)
      YIELD node AS entity, score
      OPTIONAL MATCH (entity)-[:DEPENDS_ON]->(dependency)
      RETURN entity, score, collect(dependency) AS dependencies
    `;

    const result = await this.neo4jService.read(cypherQuery, { queryVector, limit });

    return result.records.map((record: Record<string, any>) => {
      const entity = record.get('entity').properties;
      const score = record.get('score');
      const dependencies = record.get('dependencies').map((dep: { properties: { name: string } }) => dep.properties.name);

      return {
        entity: {
          type: entity.type,
          name: entity.name,
          content: entity.content,
          filePath: entity.filePath,
          startLine: entity.startLine,
          endLine: entity.endLine,
          dependencies: entity.dependencies,
        },
        score,
        dependencies,
      };
    });
  }

  private mergeSearchResults(neo4jResults: SearchResult[], lanceResults: any[]): SearchResult[] {
    const formattedLanceResults = lanceResults.map(result => ({
      entity: {
        type: result.type,
        name: result.name,
        content: result.content,
        filePath: result.filePath,
        startLine: result.startLine,
        endLine: result.endLine,
        dependencies: result.dependencies
      },
      score: result.score,
      dependencies: result.dependencies
    }));

    const allResults = [...neo4jResults, ...formattedLanceResults];
    const uniqueResults = new Map();

    allResults.forEach(result => {
      const key = result.entity.name;
      if (!uniqueResults.has(key) || uniqueResults.get(key).score < result.score) {
        uniqueResults.set(key, result);
      }
    });

    return Array.from(uniqueResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(neo4jResults.length, lanceResults.length));
  }

  async searchCode(query: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const embeddings = await this.voyageService.generateEmbeddings(
        [query],
        "voyage-code-3"
      );
      const queryVector = embeddings.data![0].embedding;

      if (!queryVector) {
        throw new Error('Failed to generate embeddings for query');
      }

      const [neo4jResults, lanceResults] = await Promise.all([
        this.searchNeo4j(queryVector, limit),
        this.lanceService.search('code-entities', queryVector, limit)
      ]);

      // Ensure lanceResults is an array
      const lanceResultsArray = Array.isArray(lanceResults) ? lanceResults : [];

      return this.mergeSearchResults(neo4jResults, lanceResultsArray);
    } catch (error) {
      this.logger.error(`Failed to search code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}



