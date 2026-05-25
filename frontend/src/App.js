// App.js — top-level layout that glues everything together.
import { useCallback, useRef, useState } from "react";
import { PipelineToolbar } from "./toolbar";
import { PipelineUI } from "./ui";
import { SubmitButton, RunButton } from "./submit";
import { Inspector } from "./Inspector";
import { HelpModal } from "./HelpModal";
import { useStore } from "./store";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";
import {
  Trash2, Workflow, Download, Upload, Keyboard, CheckCircle2, AlertTriangle,
} from "lucide-react";
import "./App.css";

function App() {
  const reset = useStore((s) => s.resetPipeline);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const exportPipeline = useStore((s) => s.exportPipeline);
  const importPipeline = useStore((s) => s.importPipeline);
  const isDag = useStore((s) => s.isDag());

  const fileInputRef = useRef(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleExport = useCallback(() => {
    if (nodes.length === 0) return;
    const data = exportPipeline();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url; a.download = `vectorshift-pipeline-${stamp}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }, [nodes.length, exportPipeline]);

  const triggerImport = useCallback(() => fileInputRef.current?.click(), []);

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        importPipeline(payload);
      } catch {
        alert("Could not read this file — is it a valid pipeline JSON?");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-importing same file
  };

  useKeyboardShortcuts({
    onExport: handleExport,
    onImport: triggerImport,
    onHelp: () => setHelpOpen(true),
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-violet-50/40 text-slate-800 overflow-hidden">
      {/* Top bar */}
      <header className="h-14 shrink-0 px-5 flex items-center gap-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
            <Workflow size={16} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="text-[14px] font-semibold tracking-tight">
              VectorShift <span className="text-slate-400 font-normal">/ pipeline builder</span>
            </div>
            <div className="text-[10.5px] uppercase tracking-[0.16em] text-slate-400">
              Frontend Assessment · Harsh Bhati
            </div>
          </div>
        </div>

        <div className="mx-3 h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-4 text-[12px] text-slate-500">
          <span><span className="font-mono font-semibold text-slate-700">{nodes.length}</span> nodes</span>
          <span><span className="font-mono font-semibold text-slate-700">{edges.length}</span> edges</span>
          {nodes.length > 0 && (
            <span
              data-testid="live-dag-status"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                isDag
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isDag ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
              {isDag ? "DAG" : "Has cycle"}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
          <IconBtn onClick={triggerImport} title="Import (Cmd/Ctrl+O)" testid="import-btn"><Upload size={13} /></IconBtn>
          <IconBtn onClick={handleExport} disabled={nodes.length === 0} title="Export JSON (Cmd/Ctrl+S)" testid="export-btn"><Download size={13} /></IconBtn>
          <IconBtn onClick={() => setHelpOpen(true)} title="Keyboard shortcuts (Shift+?)" testid="help-btn"><Keyboard size={13} /></IconBtn>
          <button
            onClick={reset}
            disabled={nodes.length === 0 && edges.length === 0}
            data-testid="clear-canvas-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-medium text-slate-600 rounded-full border border-slate-200 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Trash2 size={13} /> Clear
          </button>
          <RunButton />
          <SubmitButton />
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <PipelineToolbar />
        <PipelineUI />
        <Inspector />
      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

const IconBtn = ({ children, onClick, title, disabled, testid }) => (
  <button
    onClick={onClick} title={title} disabled={disabled} data-testid={testid}
    className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
  >
    {children}
  </button>
);

export default App;
