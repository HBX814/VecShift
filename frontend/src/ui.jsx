// ui.jsx — react-flow canvas (with node selection feeding the Inspector)
import { useState, useRef, useCallback } from "react";
import ReactFlow, {
  Controls, Background, MiniMap, BackgroundVariant,
} from "reactflow";
import { useStore } from "./store";
import { nodeTypes } from "./nodes/registry";
import "reactflow/dist/style.css";

const gridSize = 20;
const proOptions = { hideAttribution: true };

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const getNodeID = useStore((s) => s.getNodeID);
  const addNode = useStore((s) => s.addNode);
  const onNodesChange = useStore((s) => s.onNodesChange);
  const onEdgesChange = useStore((s) => s.onEdgesChange);
  const onConnect = useStore((s) => s.onConnect);
  const setSelectedNodeId = useStore((s) => s.setSelectedNodeId);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const raw = event.dataTransfer.getData("application/reactflow");
      if (!raw) return;
      const { nodeType } = JSON.parse(raw);
      if (!nodeType) return;
      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      const nodeID = getNodeID(nodeType);
      addNode({ id: nodeID, type: nodeType, position, data: { id: nodeID, nodeType } });
    },
    [reactFlowInstance, getNodeID, addNode],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div ref={reactFlowWrapper} data-testid="pipeline-canvas" className="relative flex-1 h-full">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="vs-edge-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        onNodeClick={(_, n) => setSelectedNodeId(n.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType="smoothstep"
        defaultEdgeOptions={{ type: "smoothstep", animated: true }}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={gridSize} size={1.4} color="#cbd5e1" />
        <Controls showInteractive={false}
          className="!bg-white !border !border-slate-200 !rounded-xl !shadow-sm overflow-hidden" />
        <MiniMap pannable zoomable
          nodeColor={() => "#a78bfa"}
          maskColor="rgba(15, 23, 42, 0.06)"
          className="!bg-white/80 !border !border-slate-200 !rounded-xl" />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-[13px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Empty canvas</div>
            <div className="mt-1 text-slate-500 text-[14px]">
              Drag a node from the left panel to start building →
            </div>
            <div className="mt-2 text-[11.5px] text-slate-400">
              Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">Shift</kbd> +{" "}
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">?</kbd> for shortcuts
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
