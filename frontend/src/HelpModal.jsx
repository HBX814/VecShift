// HelpModal.jsx — keyboard-shortcut cheat-sheet
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const ROWS = [
  ["Delete · Backspace", "Delete selected node"],
  ["Cmd / Ctrl + D", "Duplicate selected node"],
  ["Cmd / Ctrl + S", "Export pipeline as JSON"],
  ["Cmd / Ctrl + O", "Import pipeline from JSON"],
  ["Esc", "Deselect / Close panels"],
  ["Shift + ?", "Show this help"],
  ["Drag from handle", "Connect two nodes"],
  ["Click node", "Open Inspector panel"],
];

export const HelpModal = ({ open, onClose }) => {
  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
      data-testid="help-modal"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-violet-600 font-semibold">
                Shortcuts
              </div>
              <div className="text-lg font-semibold text-slate-800">
                Keyboard & mouse
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X size={16} />
            </button>
          </div>
          <ul className="divide-y divide-slate-100">
            {ROWS.map(([keys, label]) => (
              <li key={keys} className="flex items-center justify-between py-2.5">
                <span className="text-[12.5px] text-slate-600">{label}</span>
                <kbd className="font-mono text-[11px] text-slate-700 bg-slate-100 border border-slate-200 rounded px-2 py-0.5">
                  {keys}
                </kbd>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>,
    document.body,
  );
};
