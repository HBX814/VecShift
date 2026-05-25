// BaseNode.jsx
// Reusable node shell — Part 1: Node Abstraction.
// All node types compose this. Adds: header (icon + title + accent),
// handles (in/out), body slot, hover glow, and a subtle gradient ring.

import { Handle, Position } from "reactflow";
import { motion } from "framer-motion";

export const BaseNode = ({
  id,
  title,
  subtitle,
  icon: Icon,
  accent = "from-indigo-500 to-fuchsia-500",
  inputs = [], // [{ id, label, style? }]
  outputs = [], // [{ id, label, style? }]
  width = 260,
  selected = false,
  children,
  footer,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      data-testid={`node-${id}`}
      className={`group relative rounded-2xl bg-white/95 backdrop-blur-sm shadow-[0_4px_24px_rgba(20,20,40,0.08)] border border-slate-200/80 hover:shadow-[0_10px_40px_rgba(124,58,237,0.18)] hover:border-violet-300 transition-all duration-200 ${
        selected ? "ring-2 ring-violet-400/60" : ""
      }`}
      style={{ width }}
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r ${accent}`} />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${accent} text-white shadow-sm`}
        >
          {Icon ? <Icon size={14} strokeWidth={2.5} /> : null}
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-slate-800 leading-tight truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-[10.5px] uppercase tracking-wider text-slate-400 leading-tight truncate">
              {subtitle}
            </div>
          )}
        </div>
        <div className="ml-auto text-[10px] font-mono text-slate-300">
          {id.split("-").pop()}
        </div>
      </div>

      {/* Body */}
      {children && (
        <div className="px-3.5 pb-3 pt-1 space-y-2 text-[12px] text-slate-700">
          {children}
        </div>
      )}

      {footer && (
        <div className="px-3.5 pb-3 pt-0 text-[10.5px] text-slate-400">
          {footer}
        </div>
      )}

      {/* Input handles (left) */}
      {inputs.map((h, i) => {
        const top = ((i + 1) / (inputs.length + 1)) * 100;
        return (
          <div key={h.id} style={{ position: "absolute", left: 0, top: `${top}%` }}>
            <Handle
              type="target"
              position={Position.Left}
              id={h.id}
              style={{
                background: "#fff",
                border: "2px solid #8b5cf6",
                width: 11,
                height: 11,
                left: -6,
                ...h.style,
              }}
            />
            {h.label && (
              <span className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9.5px] font-mono font-medium text-slate-500 whitespace-nowrap pointer-events-none shadow-sm max-w-[120px] overflow-hidden text-ellipsis">
                {h.label}
              </span>
            )}
          </div>
        );
      })}

      {/* Output handles (right) */}
      {outputs.map((h, i) => {
        const top = ((i + 1) / (outputs.length + 1)) * 100;
        return (
          <div key={h.id} style={{ position: "absolute", right: 0, top: `${top}%` }}>
            <Handle
              type="source"
              position={Position.Right}
              id={h.id}
              style={{
                background: "#fff",
                border: "2px solid #ec4899",
                width: 11,
                height: 11,
                right: -6,
                ...h.style,
              }}
            />
            {h.label && (
              <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9.5px] font-mono font-medium text-slate-500 whitespace-nowrap pointer-events-none shadow-sm">
                {h.label}
              </span>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

/** Tiny styled input — used by all derived nodes */
export const NodeField = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-[10.5px] uppercase tracking-wider text-slate-400 font-semibold">
      {label}
    </span>
    {children}
  </label>
);

export const inputCls =
  "w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] text-slate-800 outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-200 transition";
