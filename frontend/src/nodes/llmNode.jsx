// llmNode.jsx
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const LLMNode = ({ id, data, selected }) => {
  const [model, setModel] = useState(data?.model || "gpt-4o");
  const [temp, setTemp] = useState(data?.temperature ?? 0.7);

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="LLM"
      subtitle="Language model"
      icon={Sparkles}
      accent="from-violet-500 to-fuchsia-500"
      inputs={[
        { id: `${id}-system`, label: "system" },
        { id: `${id}-prompt`, label: "prompt" },
      ]}
      outputs={[{ id: `${id}-response`, label: "response" }]}
      width={280}
    >
      <NodeField label="Model">
        <select
          className={inputCls}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          data-testid={`llm-model-${id}`}
        >
          <option>gpt-4o</option>
          <option>gpt-4o-mini</option>
          <option>claude-sonnet-4.5</option>
          <option>gemini-3-pro</option>
        </select>
      </NodeField>
      <NodeField label={`Temperature · ${temp}`}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={temp}
          onChange={(e) => setTemp(parseFloat(e.target.value))}
          className="accent-violet-500"
          data-testid={`llm-temp-${id}`}
        />
      </NodeField>
    </BaseNode>
  );
};
