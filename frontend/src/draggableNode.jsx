// draggableNode.jsx
import { motion } from "framer-motion";

export const DraggableNode = ({ type, label, icon: Icon, accent }) => {
  const onDragStart = (event) => {
    event.target.style.cursor = "grabbing";
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify({ nodeType: type }),
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={(e) => (e.target.style.cursor = "grab")}
      data-testid={`draggable-${type}`}
      className="group flex items-center gap-2 cursor-grab select-none rounded-xl border border-slate-200 bg-white/80 hover:bg-white px-3 py-2 shadow-sm hover:shadow-md hover:border-violet-300 transition-all"
    >
      <div
        className={`h-7 w-7 shrink-0 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-sm`}
      >
        {Icon ? <Icon size={14} strokeWidth={2.5} /> : null}
      </div>
      <span className="text-[13px] font-medium text-slate-700">{label}</span>
    </motion.div>
  );
};
