// useKeyboardShortcuts.js — global keybindings for the canvas.
// Esc: deselect | Del/Backspace: delete selected | Cmd/Ctrl+D: duplicate
// Cmd/Ctrl+S: export to JSON | Cmd/Ctrl+O: import | Shift+?: show help
import { useEffect } from "react";
import { useStore } from "./store";

export const useKeyboardShortcuts = ({ onExport, onImport, onHelp }) => {
  const selectedId = useStore((s) => s.selectedNodeId);
  const setSelected = useStore((s) => s.setSelectedNodeId);
  const deleteNode = useStore((s) => s.deleteNode);
  const duplicateNode = useStore((s) => s.duplicateNode);

  useEffect(() => {
    const handler = (e) => {
      // Skip when typing inside an input / textarea / select
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      ) {
        return;
      }

      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape") {
        setSelected(null);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        deleteNode(selectedId);
        return;
      }
      if (mod && e.key.toLowerCase() === "d" && selectedId) {
        e.preventDefault();
        duplicateNode(selectedId);
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onExport?.();
        return;
      }
      if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault();
        onImport?.();
        return;
      }
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        onHelp?.();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, setSelected, deleteNode, duplicateNode, onExport, onImport, onHelp]);
};
