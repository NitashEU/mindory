export interface SearchResult {
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
	dependencies?: Array<{
		dependency_name: string;
		dependency_type: string;
	}>;
}