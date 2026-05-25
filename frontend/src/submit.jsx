// submit.jsx — Part 4 (Submit) + bonus (Run pipeline via Groq)
import { useState } from "react";
import { createPortal } from "react-dom";
import { Play, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "./store";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const serialize = (nodes, edges) => ({
  nodes: nodes.map((n) => ({
    id: n.id, type: n.type, position: n.position, data: n.data,
  })),
  edges: edges.map((e) => ({
    id: e.id, source: e.source, target: e.target,
    sourceHandle: e.sourceHandle, targetHandle: e.targetHandle,
  })),
});

export const SubmitButton = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/pipelines/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialize(nodes, edges)),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setResult(await res.json());
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={loading}
        data-testid="submit-pipeline-btn"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white px-5 py-2.5 text-[13px] font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 disabled:opacity-70 transition-all"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={14} strokeWidth={2.5} fill="currentColor" />}
        {loading ? "Analyzing…" : "Submit Pipeline"}
      </motion.button>
      {(result || error) &&
        createPortal(
          <ResultModal result={result} error={error} onClose={() => { setResult(null); setError(null); }} />,
          document.body,
        )}
    </>
  );
};

export const RunButton = () => {
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const [loading, setLoading] = useState(false);
  const [run, setRun] = useState(null);
  const [error, setError] = useState(null);

  const onRun = async () => {
    setLoading(true); setError(null); setRun(null);
    try {
      const res = await fetch(`${BACKEND_URL}/pipelines/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serialize(nodes, edges)),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Run failed (${res.status}): ${t}`);
      }
      setRun(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRun}
        disabled={loading || nodes.length === 0}
        data-testid="run-pipeline-btn"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2.5 text-[13px] font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        title="Execute the pipeline (uses Groq LLM)"
      >
        {loading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={14} strokeWidth={2.5} fill="currentColor" />}
        {loading ? "Running…" : "Run"}
      </motion.button>
      {(run || error) &&
        createPortal(
          <RunResultModal run={run} error={error} nodes={nodes} onClose={() => { setRun(null); setError(null); }} />,
          document.body,
        )}
    </>
  );
};

// ---------------- Result modals ----------------
const Stat = ({ label, value, accent }) => (
  <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
    <div className="text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
    <div className={`text-2xl font-semibold ${accent || "text-slate-800"} mt-0.5`}>{value}</div>
  </div>
);

const ModalShell = ({ children, onClose, testid }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
    onClick={onClose} data-testid={testid}
  >
    <motion.div
      initial={{ scale: 0.95, y: 10, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
      <div className="p-6">{children}</div>
    </motion.div>
  </motion.div>
);

const ResultModal = ({ result, error, onClose }) => (
  <ModalShell onClose={onClose} testid="result-modal">
    {error ? (
      <>
        <div className="text-[11px] uppercase tracking-wider text-rose-500 font-semibold">Error</div>
        <div className="text-lg font-semibold text-slate-800 mt-1">Could not analyze pipeline</div>
        <div className="mt-3 text-[13px] text-slate-600">{error}</div>
      </>
    ) : (
      <>
        <div className="text-[11px] uppercase tracking-wider text-violet-600 font-semibold">Pipeline Analysis</div>
        <div className="text-lg font-semibold text-slate-800 mt-1">
          {result.is_dag ? "Valid pipeline — it's a DAG" : "Cycle detected — not a DAG"}
        </div>
        <div className="mt-4 flex gap-3">
          <Stat label="Nodes" value={result.num_nodes} accent="text-indigo-600" />
          <Stat label="Edges" value={result.num_edges} accent="text-fuchsia-600" />
          <Stat label="DAG" value={result.is_dag ? "Yes" : "No"} accent={result.is_dag ? "text-emerald-600" : "text-rose-600"} />
        </div>
        <div className="mt-4 text-[12px] text-slate-500 leading-relaxed">
          {result.is_dag
            ? "Your pipeline has no cycles and can be executed top-down."
            : "There's a directed cycle in your graph. Remove a back-edge before running."}
        </div>
      </>
    )}
    <div className="mt-5 flex justify-end">
      <button onClick={onClose} data-testid="result-modal-close"
        className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[12.5px] font-medium hover:bg-slate-800 transition">
        Close
      </button>
    </div>
  </ModalShell>
);

const RunResultModal = ({ run, error, nodes, onClose }) => (
  <ModalShell onClose={onClose} testid="run-result-modal">
    {error ? (
      <>
        <div className="text-[11px] uppercase tracking-wider text-rose-500 font-semibold">Run failed</div>
        <div className="text-lg font-semibold text-slate-800 mt-1">Pipeline did not execute</div>
        <div className="mt-3 text-[12.5px] text-slate-600 font-mono bg-slate-50 p-3 rounded-lg">{error}</div>
      </>
    ) : (
      <>
        <div className="text-[11px] uppercase tracking-wider text-orange-600 font-semibold">Execution</div>
        <div className="text-lg font-semibold text-slate-800 mt-1">Pipeline ran successfully</div>
        {run.used_model && (
          <div className="mt-1 text-[12px] text-slate-500">
            LLM nodes executed with <span className="font-mono text-slate-700">{run.used_model}</span>
          </div>
        )}
        <div className="mt-4 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
          {run.order.map((nid) => {
            const n = nodes.find((x) => x.id === nid);
            const out = run.outputs[nid] ?? "";
            return (
              <div key={nid} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[11px] uppercase tracking-wider text-violet-600 font-semibold">
                    {n?.type || "node"}
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-400">{nid}</div>
                </div>
                <pre className="text-[12.5px] text-slate-800 whitespace-pre-wrap font-sans leading-snug">{out || <span className="text-slate-400 italic">(empty)</span>}</pre>
              </div>
            );
          })}
        </div>
      </>
    )}
    <div className="mt-5 flex justify-end">
      <button onClick={onClose}
        className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[12.5px] font-medium hover:bg-slate-800 transition">
        Close
      </button>
    </div>
  </ModalShell>
);
