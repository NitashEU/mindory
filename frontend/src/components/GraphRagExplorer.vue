<template>
  <div class="h-full flex flex-col bg-white">
    <div class="border-b border-gray-200 p-4">
      <div class="flex items-center space-x-4">
        <input
          v-model="searchQuery"
          @keyup.enter="performSearch"
          placeholder="Search repository..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button 
          @click="performSearch" 
          :disabled="isLoading" 
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          <span v-if="isLoading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          {{ isLoading ? 'Searching...' : 'Search' }}
        </button>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Graph Panel -->
      <div class="flex-1 relative" ref="graphContainer">
        <!-- Collaboration Overlay -->
        <div class="absolute inset-0 pointer-events-none">
          <div
            v-for="user in collaborationState.users.values()"
            :key="user.id"
            class="absolute px-2 py-1 rounded-full text-xs text-white transform -translate-x-1/2 -translate-y-1/2"
            :style="{
              left: `${user.cursor?.x}px`,
              top: `${user.cursor?.y}px`,
              backgroundColor: user.color
            }"
          >
            {{ user.name }}
          </div>
        </div>
        
        <!-- Graph Controls -->
        <div class="absolute top-4 right-4 flex space-x-2">
          <button @click="zoomIn" class="p-2 bg-white rounded-lg shadow hover:shadow-md">
            <span class="sr-only">Zoom in</span>
            +
          </button>
          <button @click="zoomOut" class="p-2 bg-white rounded-lg shadow hover:shadow-md">
            <span class="sr-only">Zoom out</span>
            -
          </button>
          <button @click="resetZoom" class="p-2 bg-white rounded-lg shadow hover:shadow-md">
            <span class="sr-only">Reset zoom</span>
            ↺
          </button>
        </div>
      </div>

        <!-- Search Results Panel -->
        <div v-if="searchResults.length > 0" class="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
        <div class="p-4">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
          <ul>
          <li v-for="(result, index) in searchResults" :key="index" class="mb-6 p-4 bg-white rounded-lg shadow hover:shadow-md">
            <h4 class="text-md font-semibold text-blue-600">{{ result.entity.name }} ({{ result.entity.type }})</h4>
            <p class="text-sm text-gray-500 mb-2">File: {{ result.entity.filePath }} (Lines: {{ result.entity.startLine }}-{{ result.entity.endLine }})</p>
            <p class="text-sm text-gray-700 mb-2">Score: {{ result.score.toFixed(2) }}</p>
            <pre class="bg-gray-100 p-2 rounded text-xs overflow-x-auto"><code>{{ result.entity.content }}</code></pre>
            <div v-if="result.dependencies && result.dependencies.length > 0" class="mt-2">
            <p class="text-sm font-semibold text-gray-700">Dependencies:</p>
            <ul class="list-disc pl-4 text-sm text-gray-600">
              <li v-for="(dep, depIndex) in result.dependencies" :key="depIndex">{{ dep.dependency_name }} ({{ dep.dependency_type }})</li>
            </ul>
            </div>
          </li>
          </ul>
        </div>
        </div>
        <div v-else-if="searchQuery && !isLoading" class="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto p-4 text-center text-gray-500">
        No results found for "{{ searchQuery }}"
        </div>
        
        <!-- Preview Panel -->
        <div v-if="!searchResults.length" class="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
        <div v-if="selectedNode" class="p-4">
          <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">{{ selectedNode.label }}</h3>
          <span 
            class="px-2 py-1 text-xs rounded-full"
            :class="{
            'bg-green-100 text-green-800': selectedNode.type === 'document',
            'bg-blue-100 text-blue-800': selectedNode.type === 'topic',
            'bg-yellow-100 text-yellow-800': selectedNode.type === 'entity'
            }"
          >
            {{ selectedNode.type }}
          </span>
          </div>
          <pre class="mt-4 p-3 bg-gray-100 rounded-lg overflow-x-auto text-sm"><code>{{ formatPreview(selectedNode) }}</code></pre>
        </div>
        <div v-else class="p-4 text-gray-500 text-center">
          Select a node to view details
        </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as d3 from 'd3';
import { useSupabaseClient } from '@/composables/useSupabase';
import type { GraphData as RagGraphData, GraphNode as RagGraphNode, SearchResult, CollaborationState } from '@/types/graph-rag';
import { useGraphRenderer } from '@/composables/useGraphRenderer';
import type { GraphData, GraphNode } from '@/composables/useGraphRenderer';

// In setup:
const graphRenderer = useGraphRenderer();

// Types
interface GraphNodeData {
  id: string;
  label: string;
  type: 'document' | 'topic' | 'entity';
  properties: Record<string, any>;
}

interface D3Node extends d3.SimulationNodeDatum, GraphNodeData {
  x: number;
  y: number;
  fx: number | null;
  fy: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: D3Node;
  target: D3Node;
  type: string;
  weight: number;
}

interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

// State
const searchQuery = ref('');
const isLoading = ref(false);
const graphContainer = ref<HTMLElement | null>(null);
const selectedNode = ref<GraphNode | null>(null);
const graphData = ref<RagGraphData>({ nodes: [], links: [] });
const searchResults = ref<SearchResult[]>([]);
const collaborationState = ref<CollaborationState>({
  users: new Map(),
  selectedNodes: new Set()
});

// Supabase
const supabase = useSupabaseClient();
const room = ref<string>('graph-rag-' + Math.random().toString(36).substring(2, 9));

// D3 Setup
let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
let g: d3.Selection<SVGGElement, unknown, null, undefined>;
let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
let simulation: d3.Simulation<D3Node, D3Link>;

// Initialize D3 Graph
const initializeGraph = () => {
  if (!graphContainer.value) return;

  // Clear existing SVG
  d3.select(graphContainer.value).selectAll('svg').remove();

  svg = d3.select(graphContainer.value)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%');

  g = svg.append('g');

  // Initialize zoom behavior
  zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Initialize simulation
  simulation = d3.forceSimulation<D3Node>()
    .force('link', d3.forceLink<D3Node, D3Link>().id(d => d.id).distance(100))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(
      graphContainer.value.clientWidth / 2,
      graphContainer.value.clientHeight / 2
    ))
    .force('collision', d3.forceCollide().radius(50));

  return { svg, g };
};

// Update Graph
const updateGraph = () => {
  if (!g) return;

  // Create links
  const links = g.selectAll<SVGLineElement, D3Link>('.link')
    .data(graphData.value.links)
    .join('line')
    .attr('class', 'link')
    .attr('stroke', '#999')
    .attr('stroke-width', d => Math.sqrt(d.weight));

  // Create nodes
  const nodes = g.selectAll<SVGGElement, D3Node>('.node')
    .data(graphData.value.nodes as D3Node[])
    .join('g')
    .attr('class', 'node')
    .call(d3.drag<SVGGElement, D3Node>()
      .on('start', (event: d3.D3DragEvent<SVGGElement, D3Node, unknown>, d: D3Node) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: d3.D3DragEvent<SVGGElement, D3Node, unknown>, d: D3Node) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: d3.D3DragEvent<SVGGElement, D3Node, unknown>, d: D3Node) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }))
    .on('click', (_: MouseEvent, d: D3Node) => handleNodeClick(d));

  // Add circles to nodes
  nodes.append('circle')
    .attr('r', 8)
    .attr('fill', d => getNodeColor(d.type));

  // Add labels to nodes
  nodes.append('text')
    .text(d => d.label)
    .attr('x', 12)
    .attr('y', 4)
    .attr('class', 'node-label');

  // Update simulation
  simulation
    .nodes(graphData.value.nodes.map(n => ({
      ...n,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      index: undefined
    })) as D3Node[])
    .on('tick', () => {
      links
        .attr('x1', d => (d.source as unknown as D3Node).x)
        .attr('y1', d => (d.source as unknown as D3Node).y)
        .attr('x2', d => (d.target as unknown as D3Node).x)
        .attr('y2', d => (d.target as unknown as D3Node).y);

      nodes.attr('transform', d => `translate(${(d as D3Node).x},${(d as D3Node).y})`);
    });

  simulation.force<d3.ForceLink<D3Node, D3Link>>('link')!
    .links(graphData.value.links.map(link => ({
      ...link,
      source: graphData.value.nodes.find(n => n.id === link.source) as D3Node,
      target: graphData.value.nodes.find(n => n.id === link.target) as D3Node
    })) as D3Link[]);
};

// Graph Controls
const zoomIn = () => svg.transition().call(zoom.scaleBy, 1.5);
const zoomOut = () => svg.transition().call(zoom.scaleBy, 0.75);
const resetZoom = () => svg.transition().call(zoom.transform, d3.zoomIdentity);




// Node Click Handler
const handleNodeClick = (d: D3Node) => {
  selectedNode.value = {
    id: d.id,
    label: d.label,
    type: d.type,
    properties: d.properties
  };
  broadcastNodeSelection(d.id);
};

// Search
const performSearch = async () => {
  if (!searchQuery.value.trim()) return;
  
  isLoading.value = true;
  searchResults.value = [];
  
  try {
    const response = await fetch(`/api/code/search?query=${encodeURIComponent(searchQuery.value)}`);
    if (!response.ok) throw new Error('Search failed');
    
    const results = await response.json();
    searchResults.value = results;
    
    // Update graph with search results
    graphData.value = transformSearchResults(results);
    updateGraph();
    
    // Broadcast search to collaborators
    await broadcastSearch(searchQuery.value);
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    isLoading.value = false;
  }
};

// Collaboration
const initializeCollaboration = async () => {
  const channel = supabase
    .channel(`room:${room.value}`)
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = new Map<string, CollaborationUser>();
      
      Object.entries(state).forEach(([id, data]) => {
        const presenceData = data[0] as any;
        users.set(id, {
          id,
          name: presenceData.user_name || 'Anonymous',
          color: presenceData.color || '#' + Math.floor(Math.random()*16777215).toString(16),
          cursor: undefined
        });
      });
      
      collaborationState.value.users = users;
    })
    .on('broadcast', { event: 'cursor' }, ({ payload }) => {
      if (payload.userId && collaborationState.value.users.has(payload.userId)) {
        const user = collaborationState.value.users.get(payload.userId)!;
        user.cursor = payload.position;
      }
    })
    .on('broadcast', { event: 'node-select' }, ({ payload }) => {
      if (payload.nodeId) {
        collaborationState.value.selectedNodes.add(payload.nodeId);
      }
    })
    .subscribe();

  // Track cursor movement
  const trackCursor = async (e: MouseEvent) => {
    if (!graphContainer.value) return;
    const rect = graphContainer.value.getBoundingClientRect();
    const { data: { user } } = await supabase.auth.getUser();
    channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: {
        position: {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        },
        userId: user?.id
      }
    });
  };

  graphContainer.value?.addEventListener('mousemove', trackCursor);
  onUnmounted(() => {
    graphContainer.value?.removeEventListener('mousemove', trackCursor);
    channel.unsubscribe();
  });
};

// Broadcast events
const broadcastSearch = async (query: string) => {
  await supabase
    .from('collaboration')
    .insert({
      room: room.value,
      action: 'search',
      query
    });
};

const broadcastNodeSelection = async (nodeId: string) => {
  await supabase.channel(`room:${room.value}`).send({
    type: 'broadcast',
    event: 'node-select',
    payload: { nodeId }
  });
};

// Utility functions
const getNodeColor = (type: string): string => {
  const colors: Record<string, string> = {
    document: '#4CAF50',
    topic: '#2196F3',
    entity: '#FFC107'
  };
  return colors[type] || '#999';
};

const formatPreview = (node: GraphNode): string => {
  return JSON.stringify(node.properties, null, 2);
};

const transformSearchResults = (results: SearchResult[]): RagGraphData => {
  const nodes: RagGraphNode[] = results.map(r => ({
    id: r.id,
    label: r.data.title || r.id,
    type: r.source === 'neo4j' ? 'document' : 'entity',
    properties: r.data
  }));

  return { nodes, links: [] };
};


// Lifecycle hooks
onMounted(() => {
  initializeGraph();
  initializeCollaboration();
  if (graphContainer.value) {
    graphRenderer.initializeGraph(graphContainer.value);
    graphRenderer.onNodeClick((node: GraphNode) => {
      selectedNode.value = {
      id: node.id,
      label: node.label,
      type: node.type as 'document' | 'topic' | 'entity',
      properties: node.properties
      };
      broadcastNodeSelection(node.id);
    });
  }
});

watch(graphData, (newData) => {
  const rendererData: GraphData = {
    nodes: newData.nodes.map(n => ({
      ...n,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      index: undefined
    })),
    links: newData.links.map(l => ({
      source: newData.nodes.find(n => n.id === (l.source as string))!,
      target: newData.nodes.find(n => n.id === (l.target as string))!,
      type: l.type,
      weight: l.weight,
      index: undefined
    }))
  };
  
  graphRenderer.updateGraph(rendererData);
}, { deep: true });


onUnmounted(() => {
  simulation?.stop();
  graphRenderer.cleanup();
});
</script>



