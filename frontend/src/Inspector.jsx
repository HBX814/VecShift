// Inspector.jsx — right-side panel showing details of the selected node.
// Click empty space to clear selection. Edit name, view ID & connections.
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Copy, Link2 } from "lucide-react";
import { useStore } from "./store";
import { NODE_REGISTRY } from "./nodes/registry";

export const Inspector = () => {
  const selectedId = useStore((s) => s.selectedNodeId);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const setSelected = useStore((s) => s.setSelectedNodeId);
  const deleteNode = useStore((s) => s.deleteNode);
  const duplicateNode = useStore((s) => s.duplicateNode);

  const node = nodes.find((n) => n.id === selectedId);
  const cfg = node ? NODE_REGISTRY[node.type] : null;
  const Icon = cfg?.icon;

  const incoming = edges.filter((e) => e.target === selectedId);
  const outgoing = edges.filter((e) => e.source === selectedId);

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          data-testid="inspector-panel"
          className="w-80 shrink-0 h-full border-l border-slate-200/80 bg-white/80 backdrop-blur-xl flex flex-col"
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-200/80 flex items-center gap-2.5">
            {Icon && (
              <div
                className={`h-8 w-8 rounded-lg bg-gradient-to-br ${cfg.accent} flex items-center justify-center text-white shadow-sm`}
              >
                <Icon size={15} strokeWidth={2.5} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
                {cfg?.label || node.type} Node
              </div>
              <div className="text-[10.5px] uppercase tracking-wider text-slate-400 font-mono truncate">
                {node.id}
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              data-testid="inspector-close-btn"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close (Esc)"
            >
              <X size={14} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 text-[13px]">
            <Section title="Position">
              <div className="grid grid-cols-2 gap-2 font-mono text-[12px] text-slate-600">
                <Field label="X">{Math.round(node.position.x)}</Field>
                <Field label="Y">{Math.round(node.position.y)}</Field>
              </div>
            </Section>

            <Section title={`Connections · ${incoming.length + outgoing.length}`}>
              <div className="space-y-2">
                <ConnList icon="←" label="Incoming" items={incoming.map((e) => `${e.source} → ${e.targetHandle ?? "in"}`)} />
                <ConnList icon="→" label="Outgoing" items={outgoing.map((e) => `${e.sourceHandle ?? "out"} → ${e.target}`)} />
              </div>
            </Section>

            <Section title="Data">
              <pre className="rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono p-3 max-h-56 overflow-auto">
{JSON.stringify(node.data, null, 2)}
              </pre>
            </Section>
          </div>

          {/* Footer actions */}
          <div className="px-4 py-3 border-t border-slate-200/80 flex gap-2">
            <button
              onClick={() => duplicateNode(node.id)}
              data-testid="inspector-duplicate-btn"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <Copy size={13} /> Duplicate
            </button>
            <button
              onClick={() => deleteNode(node.id)}
              data-testid="inspector-delete-btn"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12.5px] font-medium text-white bg-rose-500 hover:bg-rose-600 transition"
            >
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const Section = ({ title, children }) => (
  <div>
    <div className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-slate-400 mb-2">
      {title}
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className="rounded-md border border-slate-200 px-2 py-1.5 bg-slate-50">
    <div className="text-[9.5px] uppercase tracking-wider text-slate-400">
      {label}
    </div>
    <div className="text-slate-800 font-mono">{children}</div>
  </div>
);

const ConnList = ({ icon, label, items }) => (
  <div>
    <div className="text-[10.5px] text-slate-500 mb-1 flex items-center gap-1.5">
      <Link2 size={11} className="text-violet-500" /> {label}
    </div>
    {items.length === 0 ? (
      <div className="text-[11.5px] text-slate-400 italic pl-4">None</div>
    ) : (
      <ul className="space-y-1 pl-4">
        {items.map((t, i) => (
          <li key={i} className="text-[11.5px] font-mono text-slate-600 truncate">
            <span className="text-violet-500 mr-1">{icon}</span>{t}
          </li>
        ))}
      </ul>
    )}
  </div>
);
