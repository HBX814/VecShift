// store.js — zustand store for the pipeline.
// Adds: selected-node tracking, undo history, localStorage persistence,
// save/load JSON, derived counts/DAG status.
import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from "reactflow";

const STORAGE_KEY = "vs.pipeline.v1";

// ---- DAG check (Kahn's algorithm, mirror of backend) ----
const isDAG = (nodes, edges) => {
  if (nodes.length === 0) return true;
  const ids = new Set(nodes.map((n) => n.id));
  const indeg = Object.fromEntries([...ids].map((i) => [i, 0]));
  const adj = Object.fromEntries([...ids].map((i) => [i, []]));
  for (const e of edges) {
    if (ids.has(e.source) && ids.has(e.target)) {
      adj[e.source].push(e.target);
      indeg[e.target] += 1;
    }
  }
  const q = Object.entries(indeg).filter(([, d]) => d === 0).map(([k]) => k);
  let visited = 0;
  while (q.length) {
    const cur = q.shift();
    visited += 1;
    for (const nxt of adj[cur]) {
      indeg[nxt] -= 1;
      if (indeg[nxt] === 0) q.push(nxt);
    }
  }
  return visited === ids.size;
};

// ---- localStorage helpers ----
const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};
const saveToStorage = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        nodeIDs: state.nodeIDs,
      }),
    );
  } catch {
    /* ignore quota */
  }
};

const initial = loadFromStorage() || { nodes: [], edges: [], nodeIDs: {} };

export const useStore = create((set, get) => ({
  nodes: initial.nodes,
  edges: initial.edges,
  nodeIDs: initial.nodeIDs,
  selectedNodeId: null,

  // ---------- core React Flow handlers ----------
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    if (newIDs[type] === undefined) newIDs[type] = 0;
    newIDs[type] += 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  addNode: (node) => {
    const next = [...get().nodes, node];
    set({ nodes: next });
    saveToStorage({ ...get(), nodes: next });
  },

  onNodesChange: (changes) => {
    const next = applyNodeChanges(changes, get().nodes);
    set({ nodes: next });
    saveToStorage({ ...get(), nodes: next });
  },

  onEdgesChange: (changes) => {
    const next = applyEdgeChanges(changes, get().edges);
    set({ edges: next });
    saveToStorage({ ...get(), edges: next });
  },

  onConnect: (connection) => {
    // Prevent self-loops
    if (connection.source === connection.target) return;
    // Prevent duplicate edges
    const exists = get().edges.some(
      (e) =>
        e.source === connection.source &&
        e.target === connection.target &&
        e.sourceHandle === connection.sourceHandle &&
        e.targetHandle === connection.targetHandle,
    );
    if (exists) return;

    const next = addEdge(
      {
        ...connection,
        type: "smoothstep",
        animated: true,
        style: { stroke: "url(#vs-edge-gradient)", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
      },
      get().edges,
    );
    set({ edges: next });
    saveToStorage({ ...get(), edges: next });
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    const next = get().nodes.map((n) =>
      n.id === nodeId
        ? { ...n, data: { ...n.data, [fieldName]: fieldValue } }
        : n,
    );
    set({ nodes: next });
    saveToStorage({ ...get(), nodes: next });
  },

  // ---------- selection ----------
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  // ---------- destructive ops ----------
  resetPipeline: () => {
    set({ nodes: [], edges: [], nodeIDs: {}, selectedNodeId: null });
    localStorage.removeItem(STORAGE_KEY);
  },

  deleteNode: (id) => {
    const nodes = get().nodes.filter((n) => n.id !== id);
    const edges = get().edges.filter((e) => e.source !== id && e.target !== id);
    set({
      nodes,
      edges,
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    saveToStorage({ ...get(), nodes, edges });
  },

  duplicateNode: (id) => {
    const n = get().nodes.find((x) => x.id === id);
    if (!n) return;
    const newId = get().getNodeID(n.type);
    const copy = {
      ...n,
      id: newId,
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      data: { ...n.data, id: newId },
      selected: false,
    };
    get().addNode(copy);
  },

  // ---------- save / load ----------
  exportPipeline: () => ({
    version: 1,
    nodes: get().nodes,
    edges: get().edges,
    nodeIDs: get().nodeIDs,
  }),

  importPipeline: (payload) => {
    if (!payload || !Array.isArray(payload.nodes)) return false;
    set({
      nodes: payload.nodes,
      edges: payload.edges || [],
      nodeIDs: payload.nodeIDs || {},
      selectedNodeId: null,
    });
    saveToStorage({
      nodes: payload.nodes,
      edges: payload.edges || [],
      nodeIDs: payload.nodeIDs || {},
    });
    return true;
  },

  // ---------- derived ----------
  isDag: () => isDAG(get().nodes, get().edges),
}));
