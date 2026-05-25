// mathNode.jsx — NEW (4/5): Math operator
import { useState } from "react";
import { Calculator } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const MathNode = ({ id, data, selected }) => {
  const [op, setOp] = useState(data?.op || "add");
  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Math"
      subtitle="Numeric op"
      icon={Calculator}
      accent="from-lime-500 to-green-500"
      inputs={[
        { id: `${id}-a`, label: "a" },
        { id: `${id}-b`, label: "b" },
      ]}
      outputs={[{ id: `${id}-result`, label: "result" }]}
    >
      <NodeField label="Operation">
        <select
          className={inputCls}
          value={op}
          onChange={(e) => setOp(e.target.value)}
          data-testid={`math-op-${id}`}
        >
          <option value="add">a + b</option>
          <option value="sub">a − b</option>
          <option value="mul">a × b</option>
          <option value="div">a ÷ b</option>
          <option value="mod">a mod b</option>
          <option value="pow">a ^ b</option>
        </select>
      </NodeField>
    </BaseNode>
  );
};
