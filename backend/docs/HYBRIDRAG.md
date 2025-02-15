# HybridRAG Implementation

This document describes the HybridRAG (Hybrid Retrieval Augmented Generation) implementation in Mindory, which combines vector similarity search with graph-based code relationships.

## Architecture

### Vector Storage (LanceDB)
- Stores code entities with their embeddings
- Enables semantic similarity search
- Local file-based storage
- Used for finding semantically similar code snippets

### Graph Storage (Supabase pgraph)
- Stores code dependencies and relationships
- Enables graph traversal queries
- Tracks function calls and dependencies
- Used for understanding code relationships

### Code Processing Flow
1. Parse code using Tree-sitter
2. Extract code entities (functions, methods, tables)
3. Generate embeddings via Voyage AI
4. Store vectors in LanceDB
5. Store relationships in pgraph

### Search Flow
1. Convert search query to embedding
2. Find similar code in LanceDB
3. Enrich results with dependencies from pgraph
4. Return combined results

## API Usage

```typescript
// Search for code with dependencies
GET /code/search?query=your search query&limit=5

// Response format
interface SearchResult {
	entity: {
		type: "function" | "class" | "method" | "table";
		name: string;
		content: string;
		filePath: string;
		startLine: number;
		endLine: number;
		dependencies: string[];
	};
	score: number;
	dependencies: Array<{
		dependency_name: string;
		dependency_type: string;
	}>;
}
```

## Configuration
Required environment variables:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
VOYAGE_API_KEY=your_voyage_api_key
LANCEDB_PATH=./data/lancedb
```