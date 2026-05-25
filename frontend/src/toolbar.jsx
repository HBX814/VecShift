// toolbar.jsx — grouped, scrollable, vectorshift-inspired sidebar
import { DraggableNode } from "./draggableNode";
import { NODE_REGISTRY } from "./nodes/registry";
import { Boxes } from "lucide-react";

export const PipelineToolbar = () => {
  const grouped = Object.entries(NODE_REGISTRY).reduce((acc, [type, cfg]) => {
    (acc[cfg.group] ||= []).push({ type, ...cfg });
    return acc;
  }, {});

  return (
    <aside
      data-testid="pipeline-toolbar"
      className="w-64 shrink-0 h-full border-r border-slate-200/80 bg-white/70 backdrop-blur-xl flex flex-col"
    >
      <div className="px-4 py-4 border-b border-slate-200/80 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center text-white shadow-sm">
          <Boxes size={16} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-slate-800 leading-tight">
            Node Library
          </div>
          <div className="text-[10.5px] uppercase tracking-wider text-slate-400">
            Drag onto canvas
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            <div className="px-1 mb-1.5 text-[10px] uppercase tracking-[0.14em] font-semibold text-slate-400">
              {group}
            </div>
            <div className="space-y-1.5">
              {items.map((it) => (
                <DraggableNode
                  key={it.type}
                  type={it.type}
                  label={it.label}
                  icon={it.icon}
                  accent={it.accent}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-slate-200/80 text-[10.5px] text-slate-400 leading-relaxed">
        <span className="font-mono text-slate-500">v0.1</span> ·  Built for
        the VectorShift assessment by{" "}
        <span className="text-slate-700 font-medium">Harsh Bhati</span>
      </div>
    </aside>
  );
};
