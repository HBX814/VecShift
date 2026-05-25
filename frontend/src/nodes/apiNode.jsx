// apiNode.jsx — NEW (2/5): HTTP Request
import { useState } from "react";
import { Globe2 } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const ApiNode = ({ id, data, selected }) => {
  const [method, setMethod] = useState(data?.method || "GET");
  const [url, setUrl] = useState(data?.url || "https://api.example.com/v1/data");

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="API Request"
      subtitle="HTTP call"
      icon={Globe2}
      accent="from-blue-500 to-indigo-500"
      inputs={[
        { id: `${id}-headers`, label: "headers" },
        { id: `${id}-body`, label: "body" },
      ]}
      outputs={[
        { id: `${id}-response`, label: "200" },
        { id: `${id}-error`, label: "err" },
      ]}
      width={280}
    >
      <NodeField label="Method">
        <select
          className={inputCls}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          data-testid={`api-method-${id}`}
        >
          {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </NodeField>
      <NodeField label="URL">
        <input
          className={inputCls + " font-mono"}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          data-testid={`api-url-${id}`}
        />
      </NodeField>
    </BaseNode>
  );
};
