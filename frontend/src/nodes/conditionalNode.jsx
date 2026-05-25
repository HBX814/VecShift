// conditionalNode.jsx — NEW (3/5): If / Else router
import { useState } from "react";
import { GitBranch } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const ConditionalNode = ({ id, data, selected }) => {
  const [expr, setExpr] = useState(data?.expression || "value === true");
  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Conditional"
      subtitle="If / Else router"
      icon={GitBranch}
      accent="from-purple-500 to-violet-500"
      inputs={[{ id: `${id}-value`, label: "value" }]}
      outputs={[
        { id: `${id}-true`, label: "true" },
        { id: `${id}-false`, label: "false" },
      ]}
    >
      <NodeField label="Expression">
        <input
          className={inputCls + " font-mono"}
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          data-testid={`cond-expr-${id}`}
        />
      </NodeField>
    </BaseNode>
  );
};
