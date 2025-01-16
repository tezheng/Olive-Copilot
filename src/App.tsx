// import "@xyflow/react/dist/style.css";
import "@xyflow/react/dist/base.css";

import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";

import { ZoomSlider } from "@/components/workflow/zoom-slider";

import { initNodesAndEdges } from "@/features/workflow";
import { PassNode } from "./components/PassNode";

// FIXME: This is a demo data, replace it file/folder selection
import workflowData from "./demo_footprints.json";

export default function App() {
  const { nodes: initialNodes, edges: initialEdges } =
    initNodesAndEdges(workflowData);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{
          default: PassNode,
        }}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        <ZoomSlider position="top-center" />
      </ReactFlow>
    </div>
  );
}
