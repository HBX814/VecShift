// filterNode.jsx — NEW (1/5)
import { useState } from "react";
import { Filter } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const FilterNode = ({ id, data, selected }) => {
  const [cond, setCond] = useState(data?.condition || "item.score > 0.7");
  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Filter"
      subtitle="Conditional pass-through"
      icon={Filter}
      accent="from-amber-500 to-orange-500"
      inputs={[{ id: `${id}-data`, label: "data" }]}
      outputs={[
        { id: `${id}-pass`, label: "pass" },
        { id: `${id}-drop`, label: "drop" },
      ]}
    >
      <NodeField label="Condition">
        <input
          className={inputCls + " font-mono"}
          value={cond}
          onChange={(e) => setCond(e.target.value)}
          data-testid={`filter-cond-${id}`}
        />
      </NodeField>
    </BaseNode>
  );
};
