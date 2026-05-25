// outputNode.jsx
import { useState } from "react";
import { LogOut } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const OutputNode = ({ id, data, selected }) => {
  const [name, setName] = useState(
    data?.outputName || id.replace("customOutput-", "output_"),
  );
  const [type, setType] = useState(data?.outputType || "Text");

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Output"
      subtitle="Pipeline result"
      icon={LogOut}
      accent="from-rose-500 to-pink-500"
      inputs={[{ id: `${id}-value`, label: "value" }]}
    >
      <NodeField label="Name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid={`output-name-${id}`}
        />
      </NodeField>
      <NodeField label="Type">
        <select
          className={inputCls}
          value={type}
          onChange={(e) => setType(e.target.value)}
          data-testid={`output-type-${id}`}
        >
          <option>Text</option>
          <option>Image</option>
        </select>
      </NodeField>
    </BaseNode>
  );
};
