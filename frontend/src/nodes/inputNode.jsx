// inputNode.jsx — refactored on top of BaseNode
import { useState } from "react";
import { LogIn } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const InputNode = ({ id, data, selected }) => {
  const [name, setName] = useState(
    data?.inputName || id.replace("customInput-", "input_"),
  );
  const [type, setType] = useState(data?.inputType || "Text");

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Input"
      subtitle="Pipeline entry"
      icon={LogIn}
      accent="from-emerald-500 to-teal-500"
      outputs={[{ id: `${id}-value`, label: "value" }]}
    >
      <NodeField label="Name">
        <input
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid={`input-name-${id}`}
        />
      </NodeField>
      <NodeField label="Type">
        <select
          className={inputCls}
          value={type}
          onChange={(e) => setType(e.target.value)}
          data-testid={`input-type-${id}`}
        >
          <option>Text</option>
          <option>File</option>
        </select>
      </NodeField>
    </BaseNode>
  );
};
