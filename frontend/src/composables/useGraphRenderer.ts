import * as d3 from "d3";
import { onMounted, onUnmounted, ref, watch } from "vue";
import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: GraphNode;
  target: GraphNode;
  type: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

interface GraphRenderer {
  initializeGraph: (container: HTMLElement) => void;
  updateGraph: (data: GraphData) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  cleanup: () => void;
  onNodeClick: (handler: (node: GraphNode) => void) => void;
}

export function useGraphRenderer(): GraphRenderer {
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  let simulation: d3.Simulation<GraphNode, GraphLink>;
  let nodeClickHandler: ((node: GraphNode) => void) | null = null;

  const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
      document: "#4CAF50",
      topic: "#2196F3",
      entity: "#FFC107",
    };
    return colors[type] || "#999";
  };

  const initializeGraph = (container: HTMLElement): void => {
    // Clear existing SVG
    d3.select(container).selectAll("svg").remove();

    svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    g = svg.append("g");

    zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    simulation = d3
      .forceSimulation<GraphNode>()
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>()
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force(
        "center",
        d3.forceCenter(container.clientWidth / 2, container.clientHeight / 2)
      )
      .force("collision", d3.forceCollide().radius(50));
  };

  const updateGraph = (data: GraphData): void => {
    if (!g) return;

    const links = g
      .selectAll<SVGLineElement, GraphLink>(".link")
      .data(data.links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-width", (d) => Math.sqrt(d.weight));

    const nodes = g
      .selectAll<SVGGElement, GraphNode>(".node")
      .data(data.nodes)
      .join("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragStarted)
          .on("drag", dragged)
          .on("end", dragEnded)
      )
      .on("click", (_event: MouseEvent, d: GraphNode) => {
        if (nodeClickHandler) {
          nodeClickHandler(d);
        }
      });

    nodes
      .selectAll("circle")
      .data((d) => [d])
      .join("circle")
      .attr("r", 8)
      .attr("fill", (d) => getNodeColor(d.type));

    nodes
      .selectAll("text")
      .data((d) => [d])
      .join("text")
      .text((d) => d.label)
      .attr("x", 12)
      .attr("y", 4);

    simulation.nodes(data.nodes).on("tick", () => {
      links
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      nodes.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    simulation
      .force<d3.ForceLink<GraphNode, GraphLink>>("link")!
      .links(data.links);

    simulation.alpha(1).restart();
  };

  const dragStarted = (
    event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>
  ): void => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.dx = event.x;
    event.dy = event.y;
  };

  const dragged = (
    event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>
  ): void => {
    event.dx = event.x;
    event.dy = event.y;
  };

  const dragEnded = (
    event: d3.D3DragEvent<SVGGElement, GraphNode, unknown>
  ): void => {
    if (!event.active) simulation.alphaTarget(0);
    //event.dx = null;
    //event.dy = null;
  };

  const zoomIn = (): void => {
    svg?.transition().call(zoom.scaleBy, 1.5);
  };
  const zoomOut = (): void => {
    svg?.transition().call(zoom.scaleBy, 0.75);
  };
  const resetZoom = (): void => {
    svg?.transition().call(zoom.transform, d3.zoomIdentity);
  };

  const cleanup = (): void => {
    simulation?.stop();
  };

  const onNodeClick = (handler: (node: GraphNode) => void): void => {
    nodeClickHandler = handler;
  };

  return {
    initializeGraph,
    updateGraph,
    zoomIn,
    zoomOut,
    resetZoom,
    cleanup,
    onNodeClick,
  };
}
