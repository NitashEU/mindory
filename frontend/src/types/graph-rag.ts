export interface SearchResult {
  id: string;
  score: number;
  source: 'neo4j' | 'weaviate';
  data: Record<string, any>;
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