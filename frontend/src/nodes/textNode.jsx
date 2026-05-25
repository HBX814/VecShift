// textNode.jsx — Part 3: auto-resize + {{ variable }} → dynamic handles
import { useEffect, useMemo, useRef, useState } from "react";
import { Type } from "lucide-react";
import { BaseNode, NodeField } from "./BaseNode";

// Lenient: extract the first valid JS identifier inside {{ ... }}.
// Allows the user to keep typing inside braces without losing the chip:
//   {{ product }}                 -> ['product']
//   {{ product extra stuff }}     -> ['product']
//   {{ 123abc }}                  -> []  (must start with letter/_/$)
const VAR_REGEX = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)[\s\S]*?\}\}/g;

const extractVariables = (text) => {
  const found = new Set();
  let m;
  while ((m = VAR_REGEX.exec(text)) !== null) found.add(m[1]);
  return Array.from(found);
};

export const TextNode = ({ id, data, selected }) => {
  const [text, setText] = useState(
    data?.text ?? "Hi {{ name }}, welcome to {{ product }}!",
  );
  const textareaRef = useRef(null);
  const [size, setSize] = useState({ w: 280, h: 90 });

  const variables = useMemo(() => extractVariables(text), [text]);

  // Auto-resize: grow with content (both width based on longest line, height by scrollHeight)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(Math.max(ta.scrollHeight, 60), 360) + "px";

    const longest = text.split("\n").reduce((a, b) => (b.length > a.length ? b : a), "");
    const approxChar = 7.0;
    const targetW = Math.min(
      Math.max(280, longest.length * approxChar + 40),
      420,
    );
    setSize({ w: targetW, h: ta.scrollHeight + 110 });
  }, [text]);

  const inputs = variables.map((v) => ({ id: `${id}-${v}`, label: v }));

  return (
    <BaseNode
      id={id}
      selected={selected}
      title="Text"
      subtitle="Template · {{vars}}"
      icon={Type}
      accent="from-sky-500 to-cyan-500"
      width={size.w}
      inputs={inputs}
      outputs={[{ id: `${id}-output`, label: "text" }]}
      footer={
        variables.length > 0 ? (
          <div className="flex flex-wrap gap-1 pt-1 max-w-full">
            {variables.map((v) => (
              <span
                key={v}
                className="px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 text-[10px] font-mono max-w-[140px] truncate"
                title={`{{ ${v} }}`}
                data-testid={`text-var-chip-${v}`}
              >
                {`{{ ${v} }}`}
              </span>
            ))}
          </div>
        ) : null
      }
    >
      <NodeField label="Prompt">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          spellCheck={false}
          data-testid={`textnode-textarea-${id}`}
          className="w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[12px] font-mono text-slate-800 outline-none focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 transition leading-snug break-words"
          style={{ minHeight: 60, overflow: "hidden", wordBreak: "break-word", overflowWrap: "anywhere" }}
        />
      </NodeField>
    </BaseNode>
  );
};
