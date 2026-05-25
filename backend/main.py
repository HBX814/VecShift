"""
VectorShift Frontend Technical Assessment — Backend.

Endpoints:
  POST /pipelines/parse  →  { num_nodes, num_edges, is_dag }       (Part 4)
  POST /pipelines/run    →  { outputs, order, used_model }         (bonus: live LLM)
  GET  /                 →  health-check

Set the `GROQ_API_KEY` env var (a `.env` file at the same level works) to enable
the optional /pipelines/run endpoint that drives any LLM node via Groq.

Run:  uvicorn main:app --reload
"""


from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from collections import defaultdict, deque
from dotenv import load_dotenv
from pathlib import Path
import os, re

load_dotenv(Path(__file__).parent / ".env")

app = FastAPI(title="VectorShift Pipeline API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Pydantic models ----------
class NodeModel(BaseModel):
    id: str
    type: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, float]] = None

    class Config:
        extra = "allow"


class EdgeModel(BaseModel):
    id: Optional[str] = None
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

    class Config:
        extra = "allow"


class PipelinePayload(BaseModel):
    nodes: List[NodeModel] = Field(default_factory=list)
    edges: List[EdgeModel] = Field(default_factory=list)


class PipelineResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool


class RunResponse(BaseModel):
    outputs: Dict[str, str]
    order: List[str]
    used_model: Optional[str] = None


# ---------- DAG via Kahn's algorithm ----------
def _topo_order(nodes: List[NodeModel], edges: List[EdgeModel]):
    ids = {n.id for n in nodes}
    indeg: Dict[str, int] = {nid: 0 for nid in ids}
    adj: Dict[str, List[str]] = defaultdict(list)
    for e in edges:
        if e.source in ids and e.target in ids:
            adj[e.source].append(e.target)
            indeg[e.target] = indeg.get(e.target, 0) + 1
    q = deque([n for n, d in indeg.items() if d == 0])
    order: List[str] = []
    while q:
        cur = q.popleft()
        order.append(cur)
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return len(order) == len(ids), order


# ---------- Routes ----------
@app.get("/")
def read_root():
    return {"Ping": "Pong"}


@app.post("/pipelines/parse", response_model=PipelineResponse)
def parse_pipeline(payload: PipelinePayload):
    is_dag, _ = _topo_order(payload.nodes, payload.edges) if payload.nodes else (True, [])
    return PipelineResponse(
        num_nodes=len(payload.nodes),
        num_edges=len(payload.edges),
        is_dag=is_dag,
    )


# ---------- Bonus: live execution (Groq) ----------
VAR_RE = re.compile(r"\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)[\s\S]*?\}\}")


def _node_by_id(nodes, nid):
    return next((n for n in nodes if n.id == nid), None)


def _incoming(edges, nid):
    return [e for e in edges if e.target == nid]


def _render_text(template, var_values):
    def repl(m):
        return var_values.get(m.group(1), m.group(0))
    return VAR_RE.sub(repl, template)


def _call_groq(system, prompt, model="llama-3.3-70b-versatile"):
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return "[Groq API key missing on server]"
    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        msgs = []
        if system: msgs.append({"role": "system", "content": system})
        msgs.append({"role": "user", "content": prompt or ""})
        resp = client.chat.completions.create(model=model, messages=msgs, temperature=0.7, max_tokens=512)
        return (resp.choices[0].message.content or "").strip()
    except Exception as e:
        return f"[Groq error: {type(e).__name__}: {e}]"


@app.post("/pipelines/run", response_model=RunResponse)
def run_pipeline(payload: PipelinePayload):
    is_dag, order = _topo_order(payload.nodes, payload.edges)
    if not is_dag:
        raise HTTPException(400, "Pipeline contains a cycle.")

    outputs: Dict[str, str] = {}
    used_model: Optional[str] = None
    handle_value: Dict[tuple, str] = {}

    model_map = {
        "gpt-4o": "llama-3.3-70b-versatile",
        "gpt-4o-mini": "llama-3.1-8b-instant",
        "claude-sonnet-4.5": "llama-3.3-70b-versatile",
        "gemini-3-pro": "llama-3.3-70b-versatile",
    }

    for nid in order:
        node = _node_by_id(payload.nodes, nid)
        if not node: continue
        data, t = node.data or {}, node.type

        if t == "customInput":
            v = str(data.get("value") or data.get("inputName") or nid)
            outputs[nid] = v; handle_value[(nid, f"{nid}-value")] = v

        elif t == "text":
            template = str(data.get("text") or "")
            var_vals = {}
            for e in _incoming(payload.edges, nid):
                var = (e.targetHandle or "").replace(f"{nid}-", "", 1)
                var_vals[var] = handle_value.get((e.source, e.sourceHandle), outputs.get(e.source, ""))
            rendered = _render_text(template, var_vals)
            outputs[nid] = rendered; handle_value[(nid, f"{nid}-output")] = rendered

        elif t == "llm":
            system_txt, prompt_txt = "", ""
            for e in _incoming(payload.edges, nid):
                src = handle_value.get((e.source, e.sourceHandle), outputs.get(e.source, ""))
                if (e.targetHandle or "").endswith("-system"): system_txt = src
                elif (e.targetHandle or "").endswith("-prompt"): prompt_txt = src
            model = str(data.get("model") or "llama-3.3-70b-versatile")
            real = model_map.get(model, model); used_model = real
            ans = _call_groq(system_txt, prompt_txt, real)
            outputs[nid] = ans; handle_value[(nid, f"{nid}-response")] = ans

        elif t == "customOutput":
            for e in _incoming(payload.edges, nid):
                outputs[nid] = handle_value.get((e.source, e.sourceHandle), outputs.get(e.source, ""))
                break

        else:
            vals = [handle_value.get((e.source, e.sourceHandle), outputs.get(e.source, ""))
                    for e in _incoming(payload.edges, nid)]
            outputs[nid] = " | ".join(v for v in vals if v) or f"[{t} executed]"

    return RunResponse(outputs=outputs, order=order, used_model=used_model)
