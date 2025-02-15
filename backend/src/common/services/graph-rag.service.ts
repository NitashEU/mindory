import weaviate, { WeaviateClient } from "weaviate-ts-client";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import neo4j, { Driver } from "neo4j-driver";

interface SearchResult {
  id: string;
  score: number;
  source: "neo4j" | "weaviate";
  data: Record<string, any>;
}

interface WeaviateDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  _additional?: {
    certainty: number;
  };
}

@Injectable()
export class GraphRagService {
  private neo4jDriver: Driver;
  private weaviateClient: WeaviateClient;

  constructor(private configService: ConfigService) {
    this.weaviateClient = weaviate.client({
      scheme: this.configService.getOrThrow("WEAVIATE_SCHEME"),
      host: this.configService.getOrThrow("WEAVIATE_HOST"),
    });

    this.neo4jDriver = neo4j.driver(
      this.configService.getOrThrow("NEO4J_URL"),
      neo4j.auth.basic(
        this.configService.getOrThrow("NEO4J_USERNAME"),
        this.configService.getOrThrow("NEO4J_PASSWORD")
      )
    );
  }

  async hybridRetrieve(query: string): Promise<SearchResult[]> {
    try {
      const [weaviateResults, neo4jResults] = await Promise.all([
        this.performVectorSearch(query),
        this.performGraphSearch(query),
      ]);

      return this.mergeResults(weaviateResults, neo4jResults);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to perform hybrid retrieval: ${error.message}`);
      }
      throw new Error('Failed to perform hybrid retrieval');
    }
  }

  private async performVectorSearch(query: string): Promise<SearchResult[]> {
    try {
      const result = await this.weaviateClient.graphql
        .get()
        .withNearText({
          concepts: [query],
          distance: 0.7,
        })
        .withClassName("Document")
        .withFields("content id metadata")
        .do();

      return (result.data.Get.Document as WeaviateDocument[]).map((item) => ({
        id: item.id,
        score: item._additional?.certainty || 0,
        source: "weaviate" as const,
        data: item,
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Weaviate search failed: ${error.message}`);
      }
      throw new Error('Weaviate search failed');
    }
  }

  private async performGraphSearch(query: string): Promise<SearchResult[]> {
    try {
      const session = this.neo4jDriver.session();
      const result = await session.run(
        `
        MATCH (d:Document)-[:RELATES_TO]->(t:Topic)
        WHERE t.name CONTAINS $query
        RETURN d, t, score(d) as relevance
        ORDER BY relevance DESC
        LIMIT 5
        `,
        { query }
      );

      await session.close();

      return result.records.map((record) => ({
        id: record.get("d").properties.id,
        score: record.get("relevance"),
        source: "neo4j" as const,
        data: {
          document: record.get("d").properties,
          topic: record.get("t").properties,
        },
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Neo4j search failed: ${error.message}`);
      }
      throw new Error('Neo4j search failed');
    }
  }

  private mergeResults(
    weaviateResults: SearchResult[],
    neo4jResults: SearchResult[]
  ): SearchResult[] {
    const combined = [...weaviateResults, ...neo4jResults];
    combined.sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }
}
