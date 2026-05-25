// imageGenNode.jsx — NEW (5/5): Image generation
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { BaseNode, NodeField, inputCls } from "./BaseNode";

export const ImageGenNode = ({ id, data, selected }) => {
  const [model, setModel] = useState(data?.model || "nano-banana");
  const [size, setSize] = useState(data?.size || "1024x1024");
  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Image"
      subtitle="Generate image"
      icon={ImagePlus}
      accent="from-pink-500 to-rose-500"
      inputs={[{ id: `${id}-prompt`, label: "prompt" }]}
      outputs={[{ id: `${id}-image`, label: "image" }]}
      width={280}
    >
      <NodeField label="Model">
        <select
          className={inputCls}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          data-testid={`img-model-${id}`}
        >
          <option value="nano-banana">Gemini Nano Banana</option>
          <option value="gpt-image-1">GPT Image 1</option>
          <option value="sdxl">SDXL</option>
        </select>
      </NodeField>
      <NodeField label="Size">
        <select
          className={inputCls}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          data-testid={`img-size-${id}`}
        >
          <option>512x512</option>
          <option>1024x1024</option>
          <option>1280x720</option>
        </select>
      </NodeField>
    </BaseNode>
  );
};
