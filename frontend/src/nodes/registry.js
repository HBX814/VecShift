// registry.js — central catalog of all node types.
// Adding a new node = 1 file + 1 entry here. That's the abstraction.

import {
  LogIn,
  LogOut,
  Sparkles,
  Type,
  Filter,
  Globe2,
  GitBranch,
  Calculator,
  ImagePlus,
} from "lucide-react";

import { InputNode } from "./inputNode";
import { OutputNode } from "./outputNode";
import { LLMNode } from "./llmNode";
import { TextNode } from "./textNode";
import { FilterNode } from "./filterNode";
import { ApiNode } from "./apiNode";
import { ConditionalNode } from "./conditionalNode";
import { MathNode } from "./mathNode";
import { ImageGenNode } from "./imageGenNode";

export const NODE_REGISTRY = {
  customInput: {
    label: "Input",
    component: InputNode,
    icon: LogIn,
    accent: "from-emerald-500 to-teal-500",
    group: "Core",
  },
  customOutput: {
    label: "Output",
    component: OutputNode,
    icon: LogOut,
    accent: "from-rose-500 to-pink-500",
    group: "Core",
  },
  llm: {
    label: "LLM",
    component: LLMNode,
    icon: Sparkles,
    accent: "from-violet-500 to-fuchsia-500",
    group: "Core",
  },
  text: {
    label: "Text",
    component: TextNode,
    icon: Type,
    accent: "from-sky-500 to-cyan-500",
    group: "Core",
  },
  filter: {
    label: "Filter",
    component: FilterNode,
    icon: Filter,
    accent: "from-amber-500 to-orange-500",
    group: "Logic",
  },
  api: {
    label: "API",
    component: ApiNode,
    icon: Globe2,
    accent: "from-blue-500 to-indigo-500",
    group: "Logic",
  },
  conditional: {
    label: "If/Else",
    component: ConditionalNode,
    icon: GitBranch,
    accent: "from-purple-500 to-violet-500",
    group: "Logic",
  },
  math: {
    label: "Math",
    component: MathNode,
    icon: Calculator,
    accent: "from-lime-500 to-green-500",
    group: "Logic",
  },
  imageGen: {
    label: "Image",
    component: ImageGenNode,
    icon: ImagePlus,
    accent: "from-pink-500 to-rose-500",
    group: "Generative",
  },
};

// reactflow nodeTypes map
export const nodeTypes = Object.fromEntries(
  Object.entries(NODE_REGISTRY).map(([k, v]) => [k, v.component]),
);
