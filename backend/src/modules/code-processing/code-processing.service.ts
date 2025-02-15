import Lua from "@tree-sitter-grammars/tree-sitter-lua";
import Parser from "tree-sitter";
import { Injectable, Logger } from "@nestjs/common";
import { SearchResult } from "./interfaces/search-result.interface";
import { Neo4jService } from "@/database/neo4j.service";
import { VoyageService } from "@/common/services";



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
    private readonly neo4jService: Neo4jService
  ) {

    this.parser = new Parser();
    this.parser.setLanguage(Lua as unknown as Parser.Language);
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
        this.storeInNeo4j(entities),
      ]);
    } catch (error) {
      this.logger.error(
        `Failed to process repository: ${(error as any).message}`
      );
      throw error;
    }
  }

  private async storeInNeo4j(entities: CodeEntity[]): Promise<void> {
    try {
      await this.neo4jService.createCodeEntityGraph(entities);
    } catch (error) {
      this.logger.error(`Failed to store in Neo4j: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

      const cypherQuery = `
        WITH $queryVector AS queryVector
        CALL db.index.vector.queryNodes('code-entity-embeddings', $limit, queryVector)
        YIELD node AS entity, score
        OPTIONAL MATCH (entity)-[:DEPENDS_ON]->(dependency)
        RETURN entity, score, collect(dependency) AS dependencies
      `;

      const result = await this.neo4jService.read(cypherQuery, {
        queryVector,
        limit,
      });

        const enrichedResults = result.records.map((record: Record<string, any>) => {
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
          score: score,
          dependencies: dependencies,
        };
      }) as SearchResult[];

      return enrichedResults;
    } catch (error) {
      this.logger.error(`Failed to search code: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}


