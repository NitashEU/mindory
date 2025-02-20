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

export interface GraphNode {
  id: string;
  label: string;
  type: 'document' | 'topic' | 'entity';
  properties: Record<string, any>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

export interface CollaborationState {
  users: Map<string, CollaborationUser>;
  selectedNodes: Set<string>;
}