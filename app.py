import random
import re
import os
import time
import csv
import sqlite3
from datetime import datetime
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import List, Dict, Any, Optional

from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
import requests
from neo4j import GraphDatabase


app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY", "windpower-demo-secret")

'''
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4:e2b")
OLLAMA_TIMEOUT = int(os.getenv("OLLAMA_TIMEOUT", "180"))
OLLAMA_FORCE_CPU = os.getenv("OLLAMA_FORCE_CPU", "1").strip().lower() not in {"0", "false", "no"}
OLLAMA_NUM_THREAD = int(os.getenv("OLLAMA_NUM_THREAD", str(max(2, (os.cpu_count() or 4) - 1))))
OLLAMA_NUM_GPU = int(os.getenv("OLLAMA_NUM_GPU", "0" if OLLAMA_FORCE_CPU else "1"))
'''

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "neo4j")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "neo4j")

# 移除 OLLAMA 相关的环境变量，添加 GROQ
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

LOGIN_DEFAULT_USER = "admin"
LOGIN_DEFAULT_PASSWORD = "123456"
LOGIN_DEFAULT_ROLE = "admin"

USER_ROLE_USER = "user"
USER_ROLE_ADMIN = "admin"


FAQ_POOL = [
    "什么是RAG，为什么适合工业故障问答？",
    "学生没有企业数据，如何零成本搭建系统？",
    "如何用Manualslib快速搭建文本知识库？",
    "有哪些免费工业故障图像数据集可直接使用？",
    "IBM FailureSensorIQ数据集可以怎么用？",
    "如果我想做多模态故障诊断，第一步应该做什么？",
    "振动信号研究可以使用哪些公开数据集？",
    "如何把FAQ和向量检索结合起来提高命中率？",
    "风电主轴振动过大的常见原因有哪些？",
    "主轴轴承温度超过80℃应该怎么处理？",
    "齿轮箱油温超过90℃有哪些危害与处理措施？",
    "变桨系统无响应时应如何排查？",
    "偏航制动器失效的危害及处理措施是什么？",
]

GLOSSARY = {
    "rag": "RAG是检索增强生成（Retrieval-Augmented Generation），先从知识库检索相关证据，再让模型基于证据回答，能显著降低幻觉。",
    "向量索引": "向量索引是把文本转换成向量后建立近邻检索结构，用于语义相似问题的快速召回。",
    "知识图谱": "知识图谱是把实体和关系结构化存储，适合做因果链路、部件关系和故障推理。",
    "faq": "FAQ是高频问答库，优先命中固定问题，响应快且稳定，适合作为工业场景第一层问答。",
    "多模态": "多模态指同时处理文本、图像、语音、传感器等多种输入，用于更真实的工业诊断场景。",
    "维护预测": "维护预测是根据历史与实时状态预测设备何时可能失效，从而提前安排检修。",
}


@dataclass
class Chunk:
    title: str
    text: str
    tokens: set
    source: str


class KnowledgeBase:
    def __init__(self, markdown_paths: List[Path], csv_dir: Optional[Path] = None) -> None:
        self.markdown_paths = markdown_paths
        self.csv_dir = csv_dir
        self.chunks: List[Chunk] = []
        self.csv_lookup: Dict[str, List[Dict[str, Any]]] = {}
        self.qa_pairs: List[Dict[str, str]] = []
        self.qa_lookup: Dict[str, Dict[str, str]] = {}
        for md in markdown_paths:
            if md.exists():
                raw_text = md.read_text(encoding="utf-8")
                self.chunks.extend(self._build_chunks(raw_text, md.stem))
                self._ingest_qa_pairs(raw_text, md.stem)
        if csv_dir and csv_dir.exists() and csv_dir.is_dir():
            for csv_path in sorted(csv_dir.glob("*.csv")):
                self._ingest_csv_file(csv_path)

    @staticmethod
    def _normalize_question(text: str) -> str:
        text = re.sub(r"[\s\u3000]+", "", text or "")
        text = re.sub(r"[：:？?。．，,、；;！!（）()\[\]【】<>《》‘’“”\"']", "", text)
        return text.lower().strip()

    def _ingest_qa_pairs(self, raw: str, source_name: str) -> None:
        pattern = re.compile(r"问：(.+?)\s*答：(.+?)(?=(?:\s*\d+\\.?\s*问：|\s*问：|\Z))", re.S)
        for match in pattern.finditer(raw):
            question = re.sub(r"^\s*\d+\\.?\s*", "", match.group(1)).strip()
            answer = match.group(2).strip()
            if not question or not answer:
                continue
            item = {"question": question, "answer": answer, "source": source_name}
            key = self._normalize_question(question)
            if key not in self.qa_lookup:
                self.qa_pairs.append(item)
                self.qa_lookup[key] = item

    @staticmethod
    def _clean_text(text: str) -> str:
        text = re.sub(r"```[\\s\\S]*?```", " ", text)
        text = re.sub(r"\|[-: ]+\|", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    @staticmethod
    def _tokenize(text: str) -> set:
        text = text.lower()
        cn_spans = re.findall(r"[\u4e00-\u9fff]+", text)
        en_tokens = re.findall(r"[a-z0-9_\-\.\+]+", text)

        tokens = set(en_tokens)
        for span in cn_spans:
            tokens.add(span)
            if len(span) >= 2:
                for i in range(len(span) - 1):
                    tokens.add(span[i : i + 2])
        return tokens

    def _build_chunks(self, raw: str, source_name: str) -> List[Chunk]:
        chunks: List[Chunk] = []
        current_title = "文档概览"
        buffer: List[str] = []

        for line in raw.splitlines():
            heading = re.match(r"^#{1,4}\s+(.+)$", line.strip())
            if heading:
                if buffer:
                    block = self._clean_text("\n".join(buffer))
                    if block:
                        chunks.append(
                            Chunk(
                                title=current_title,
                                text=block,
                                tokens=self._tokenize(block + " " + current_title),
                                source=source_name,
                            )
                        )
                current_title = heading.group(1).strip()
                buffer = []
            else:
                if line.strip():
                    buffer.append(line.strip())

        if buffer:
            block = self._clean_text("\n".join(buffer))
            if block:
                chunks.append(
                    Chunk(
                        title=current_title,
                        text=block,
                        tokens=self._tokenize(block + " " + current_title),
                        source=source_name,
                    )
                )
        return chunks

    @staticmethod
    def _csv_row_name_from_title(title: str) -> str:
        if "|" not in title:
            return title
        return title.split("|", 1)[1].strip()

    @staticmethod
    def _csv_row_text_fields(row: Dict[str, str]) -> str:
        priority_fields = ["name", ":LABEL", "描述", "操作内容", "知识来源", "易发工况", "影响等级", "步骤编号"]
        parts: List[str] = []
        for key in priority_fields:
            value = row.get(key)
            if value:
                parts.append(f"{key}={value}")
        if not parts:
            parts = [f"{k}={v}" for k, v in row.items()]
        return "；".join(parts)

    def _score(self, query: str, chunk: Chunk) -> float:
        q_tokens = self._tokenize(query)
        if not q_tokens:
            return 0.0
        overlap = len(q_tokens & chunk.tokens) / max(len(q_tokens), 1)
        fuzzy = SequenceMatcher(None, query.lower(), chunk.text.lower()).ratio()
        score = overlap * 0.72 + fuzzy * 0.18
        if chunk.source.startswith("csv:"):
            row_name = self._normalize_question(self._csv_row_name_from_title(chunk.title))
            norm_query = self._normalize_question(query)
            if row_name and norm_query:
                if norm_query == row_name:
                    score += 0.9
                elif row_name in norm_query or norm_query in row_name:
                    score += 0.45
            title_text = self._normalize_question(chunk.title + " " + chunk.text)
            if q_tokens and any(token in title_text for token in q_tokens if len(token) >= 2):
                score += 0.08
        return min(score, 1.0)

    def _ingest_csv_file(self, csv_path: Path) -> None:
        try:
            with csv_path.open("r", encoding="utf-8-sig", newline="") as fp:
                reader = csv.DictReader(fp)
                for idx, row in enumerate(reader, start=1):
                    if not row:
                        continue
                    clean_row = {str(k).strip(): str(v).strip() for k, v in row.items() if k and str(v or "").strip()}
                    if not clean_row:
                        continue
                    row_id = clean_row.get("id:ID") or clean_row.get("id") or f"row_{idx}"
                    row_name = clean_row.get("name") or row_id
                    text = self._csv_row_text_fields(clean_row)
                    title = f"CSV:{csv_path.stem} | {row_name}"
                    row_obj = {
                        "id": row_id,
                        "name": row_name,
                        "source": f"csv:{csv_path.stem}",
                        "title": title,
                        "text": text,
                        "fields": clean_row,
                    }
                    key = self._normalize_question(row_name)
                    if key:
                        self.csv_lookup.setdefault(key, []).append(row_obj)
                    self.chunks.append(
                        Chunk(
                            title=title,
                            text=text,
                            tokens=self._tokenize(title + " " + text),
                            source=f"csv:{csv_path.stem}",
                        )
                    )
        except Exception:
            # Keep startup resilient even if one CSV has encoding/format issues.
            return

    def exact_csv_matches(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        norm = self._normalize_question(query)
        if not norm:
            return []
        exact = self.csv_lookup.get(norm, [])
        if exact:
            return exact[:top_k]
        matches: List[Dict[str, Any]] = []
        for rows in self.csv_lookup.values():
            for row in rows:
                row_name = self._normalize_question(row.get("name", ""))
                if not row_name:
                    continue
                if row_name in norm or norm in row_name:
                    matches.append(row)
        return matches[:top_k]

    @staticmethod
    def _csv_text_to_points(text: str, limit: int = 6) -> List[str]:
        key_alias = {
            "name": "节点名称",
            ":LABEL": "节点标签",
            "描述": "描述",
            "知识来源": "知识来源",
            "易发工况": "易发工况",
            "影响等级": "影响等级",
            "发生频率": "发生频率",
            "故障频次": "故障频次",
        }
        points: List[str] = []
        for seg in re.split(r"[；;]\s*", text or ""):
            clean = seg.strip()
            if not clean:
                continue
            if "=" in clean:
                key, val = clean.split("=", 1)
                shown_key = key_alias.get(key.strip(), key.strip())
                item = f"{shown_key}：{val.strip()}"
            else:
                item = clean
            points.append(item)
            if len(points) >= limit:
                break
        return points

    def node_detail_cards(self, node_label: str, top_k: int = 4) -> List[Dict[str, Any]]:
        label = (node_label or "").strip()
        if not label:
            return []

        cards: List[Dict[str, Any]] = []
        seen_signatures = set()

        def add_card(title: str, source: str, score: float, points: List[str]) -> None:
            signature = (
                self._normalize_question(title),
                source,
                self._normalize_question("|".join(points)),
            )
            if signature in seen_signatures:
                return
            seen_signatures.add(signature)
            cards.append(
                {
                    "title": title,
                    "source": source,
                    "score": round(max(0.0, min(float(score or 0.0), 1.0)), 3),
                    "points": points,
                }
            )

        exact = self.exact_csv_matches(label, top_k=top_k)
        for row in exact:
            score = 1.0 if self._normalize_question(row.get("name", "")) == self._normalize_question(label) else 0.9
            add_card(
                row.get("name") or row.get("title") or label,
                row.get("source") or "csv",
                score,
                self._csv_text_to_points(row.get("text", ""), limit=7),
            )

        if len(cards) < top_k:
            retrieval = self.retrieve(label, top_k=8, focus_terms=[label])
            for hit in retrieval:
                if not str(hit.get("source", "")).startswith("csv:"):
                    continue
                title = hit.get("title") or label
                add_card(
                    self._csv_row_name_from_title(title),
                    hit.get("source") or "csv",
                    float(hit.get("score", 0.0)),
                    self._csv_text_to_points(hit.get("text", ""), limit=6),
                )
                if len(cards) >= top_k:
                    break

        cards.sort(key=lambda item: float(item.get("score", 0.0)), reverse=True)
        return cards[:top_k]

    def retrieve(self, query: str, top_k: int = 3, focus_terms: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        ranked = []
        focus_terms = [term for term in (focus_terms or []) if term]
        for chunk in self.chunks:
            score = self._score(query, chunk)
            if focus_terms:
                chunk_text = self._normalize_question(chunk.title + " " + chunk.text)
                for term in focus_terms:
                    norm_term = self._normalize_question(term)
                    if not norm_term:
                        continue
                    if norm_term == self._normalize_question(self._csv_row_name_from_title(chunk.title)):
                        score = max(score, 0.95) + 0.03
                        break
                    if norm_term in chunk_text or chunk_text in norm_term:
                        score += 0.18
            ranked.append({"score": score, "title": chunk.title, "text": chunk.text, "source": chunk.source})
        ranked.sort(key=lambda item: item["score"], reverse=True)
        return ranked[:top_k]

    def exact_qa_answer(self, query: str) -> Optional[Dict[str, Any]]:
        item = self.qa_lookup.get(self._normalize_question(query))
        if not item:
            return None
        return {
            "answer": item["answer"],
            "sources": [{"title": item["question"], "snippet": item["answer"][:160]}],
            "evidence": {
                "kb": [
                    {
                        "title": item["question"],
                        "text": item["answer"],
                        "score": 1.0,
                    }
                ],
                "kg": [],
                "llm": {
                    "model": "FAQ直答",
                    "used": False,
                    "latencyMs": 0,
                    "error": "命中问答对，未调用大模型",
                },
            },
        }

    def sample_questions(self, count: int = 3) -> List[str]:
        if self.qa_pairs:
            count = max(1, min(count, len(self.qa_pairs)))
            return [item["question"] for item in random.sample(self.qa_pairs, k=count)]
        fallback = [
            "什么是RAG，为什么适合工业故障问答？",
            "学生没有企业数据，如何零成本搭建系统？",
            "如何用Manualslib快速搭建文本知识库？",
        ]
        count = max(1, min(count, len(fallback)))
        return random.sample(fallback, k=count)

    @staticmethod
    def _extract_term(query: str) -> str:
        m = re.search(r"(?:什么是|解释一下|解释下|请解释|名词解释)\s*([\u4e00-\u9fffa-zA-Z\-]+)", query)
        if m:
            return m.group(1).lower()
        return ""

    def answer(self, query: str, image_name: str = "") -> Dict[str, Any]:
        query = (query or "").strip()

        if image_name and not query:
            return {
                "answer": "已收到图片输入。当前版本会记录图片元信息并继续结合文本问答；后续可直接接入视觉模型（如缺陷检测/分割）实现自动诊断。",
                "sources": [{"title": "多模态扩展说明", "snippet": "当前为可扩展接口，支持后续接入工业视觉检测模型。"}],
            }

        if not query:
            return {
                "answer": "请输入问题，或上传图片并补充一句描述，例如：这张图可能是什么缺陷？",
                "sources": [],
            }

        term = self._extract_term(query)
        if term:
            for key, value in GLOSSARY.items():
                if key in term or term in key:
                    return {
                        "answer": value,
                        "sources": [{"title": "名词解释", "snippet": f"术语：{term}"}],
                    }

        results = self.retrieve(query, top_k=3)
        if not results or results[0]["score"] < 0.12:
            return {
                "answer": "根据现有知识库，我无法回答这个问题。你可以换个问法，或补充关键词（如 RAG、Manualslib、NEU、FailureSensorIQ）。",
                "sources": [],
            }

        best = results[0]
        answer = (
            "基于知识库内容，建议如下：\n"
            f"{best['text'][:260]}...\n"
            "如果你希望，我可以继续把这部分整理成可执行的实施步骤或项目清单。"
        )

        sources = [
            {"title": item["title"], "snippet": item["text"][:120] + "..."}
            for item in results
        ]
        return {"answer": answer, "sources": sources}


class Neo4jService:
    def __init__(self, uri: str, user: str, password: str, database: str) -> None:
        self.uri = uri
        self.user = user
        self.password = password
        self.database = database
        self._driver = None
        self.last_error = ""

    def update_config(self, uri: str, user: str, password: str, database: str) -> None:
        self.uri = uri or self.uri
        self.user = user or self.user
        self.password = password or self.password
        self.database = database or self.database
        if self._driver is not None:
            try:
                self._driver.close()
            except Exception:
                pass
        self._driver = None
        self.last_error = ""

    def _driver_or_none(self):
        if self._driver is not None:
            return self._driver
        try:
            self._driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            self._driver.verify_connectivity()
            self.last_error = ""
            return self._driver
        except Exception as exc:
            self._driver = None
            self.last_error = str(exc)
            return None

    def available(self) -> bool:
        return self._driver_or_none() is not None

    def run_read(self, query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        driver = self._driver_or_none()
        if driver is None:
            return []
        params = params or {}
        with driver.session(database=self.database) as session:
            result = session.run(query, params)
            return [record.data() for record in result]

    def get_graph(self, limit: int = 120) -> Dict[str, Any]:
        rows = self.run_read(
            """
            MATCH (n)-[r]->(m)
            RETURN id(n) AS source_id,
                   coalesce(n.name, n.title, labels(n)[0] + '_' + toString(id(n))) AS source_name,
                   labels(n) AS source_labels,
                   type(r) AS rel_type,
                   id(m) AS target_id,
                   coalesce(m.name, m.title, labels(m)[0] + '_' + toString(id(m))) AS target_name,
                   labels(m) AS target_labels
            LIMIT $limit
            """,
            {"limit": max(10, min(limit, 500))},
        )

        nodes_map: Dict[int, Dict[str, Any]] = {}
        edges: List[Dict[str, Any]] = []

        for row in rows:
            s_id = row["source_id"]
            t_id = row["target_id"]

            if s_id not in nodes_map:
                nodes_map[s_id] = {
                    "id": s_id,
                    "label": row["source_name"],
                    "group": ":".join(row.get("source_labels") or ["Node"]),
                }
            if t_id not in nodes_map:
                nodes_map[t_id] = {
                    "id": t_id,
                    "label": row["target_name"],
                    "group": ":".join(row.get("target_labels") or ["Node"]),
                }
            edges.append({"from": s_id, "to": t_id, "label": row["rel_type"]})

        return {"nodes": list(nodes_map.values()), "edges": edges, "error": self.last_error}

    def get_node_neighbors(self, node_id: int, limit: int = 15) -> List[Dict[str, str]]:
        rows = self.run_read(
            """
            MATCH (n)-[r]-(m)
            WHERE id(n) = $node_id
            RETURN coalesce(n.name, n.title, labels(n)[0]) AS center,
                   type(r) AS rel,
                   coalesce(m.name, m.title, labels(m)[0]) AS neighbor
            LIMIT $limit
            """,
            {"node_id": node_id, "limit": max(1, min(limit, 40))},
        )
        return [{"head": r["center"], "rel": r["rel"], "tail": r["neighbor"]} for r in rows]

    def search_triplets(self, keyword: str, limit: int = 8) -> List[Dict[str, str]]:
        key = (keyword or "").strip()
        if not key:
            return []

        rows = self.run_read(
            """
            MATCH (a)-[r]->(b)
            WHERE toLower(coalesce(a.name, a.title, '')) CONTAINS toLower($kw)
               OR toLower(coalesce(b.name, b.title, '')) CONTAINS toLower($kw)
               OR toLower(type(r)) CONTAINS toLower($kw)
            RETURN coalesce(a.name, a.title, labels(a)[0]) AS head,
                   type(r) AS rel,
                   coalesce(b.name, b.title, labels(b)[0]) AS tail
            LIMIT $limit
            """,
            {"kw": key, "limit": max(1, min(limit, 20))},
        )
        return [{"head": r["head"], "rel": r["rel"], "tail": r["tail"]} for r in rows]

    def get_node_label(self, node_id: int) -> str:
        rows = self.run_read(
            """
            MATCH (n)
            WHERE id(n) = $node_id
            RETURN coalesce(n.name, n.title, labels(n)[0]) AS label
            LIMIT 1
            """,
            {"node_id": node_id},
        )
        if not rows:
            return ""
        return str(rows[0].get("label") or "").strip()

'''
class OllamaService:
    def __init__(self, base_url: str, default_model: str, timeout_seconds: int) -> None:
        self.base_url = base_url.rstrip("/")
        self.default_model = default_model
        self.last_error = ""
        self.timeout_seconds = max(8, timeout_seconds)
        self.force_cpu = OLLAMA_FORCE_CPU
        self.num_thread = max(1, OLLAMA_NUM_THREAD)
        self.num_gpu = max(0, OLLAMA_NUM_GPU)
        self.last_http_ok = False
        self.last_model = default_model

    def update_config(self, base_url: str = "", default_model: str = "") -> None:
        if base_url:
            self.base_url = base_url.rstrip("/")
        if default_model:
            self.default_model = default_model
        self.last_error = ""

    @staticmethod
    def _model_rank(model_name: str) -> float:
        text = (model_name or "").lower()
        match = re.search(r":(?:[a-z]+)?(\d+)b", text)
        if match:
            return float(match.group(1))
        if "e2b" in text:
            return 2.0
        if "1b" in text:
            return 1.0
        return 999.0

    @staticmethod
    def _thinking_to_brief(thinking_text: str, max_points: int = 3) -> str:
        raw = (thinking_text or "").strip()
        if not raw:
            return ""
        lines = re.split(r"[\n。；;]+", raw)
        points: List[str] = []
        for line in lines:
            clean = re.sub(r"^[\-\*\d\s\.:：]+", "", line).strip()
            clean = re.sub(r"\s+", " ", clean)
            if len(clean) < 8:
                continue
            if clean not in points:
                points.append(clean)
            if len(points) >= max_points:
                break
        if not points:
            raw = re.sub(r"\s+", " ", raw)
            return f"1. {raw[:90]}"
        return "\n".join([f"{i + 1}. {p[:60]}" for i, p in enumerate(points)])

    def recommended_model(self, models: Optional[List[str]] = None) -> str:
        candidates = models or self.list_models()
        if not candidates:
            return self.default_model
        return sorted(candidates, key=self._model_rank)[0]

    def chat(
        self,
        prompt: str,
        model: Optional[str] = None,
        system_prompt: str = "",
        max_models_to_try: int = 3,
        num_predict_override: Optional[int] = None,
        timeout_seconds_override: Optional[int] = None,
    ) -> Optional[str]:
        self.last_http_ok = False
        available_models = self.list_models()
        selected_model = model or self.default_model
        if available_models and selected_model not in available_models:
            selected_model = self.recommended_model(available_models)

        max_try = max(1, min(int(max_models_to_try or 1), 3))
        request_timeout = max(8, int(timeout_seconds_override or self.timeout_seconds))

        candidate_models: List[str] = []
        for name in [selected_model, self.recommended_model(available_models) if available_models else ""]:
            if name and name not in candidate_models:
                candidate_models.append(name)
        for name in available_models:
            if name not in candidate_models:
                candidate_models.append(name)

        payload = {
            "stream": False,
            "keep_alive": "30m",
            "options": {
                "num_predict": int(num_predict_override or 512),
                "temperature": 0.2,
                "top_p": 0.9,
            },
            "messages": [
                {"role": "system", "content": system_prompt or "你是工业设备故障问答助手。优先基于提供的上下文，结论简洁、可执行。"},
                {"role": "user", "content": prompt},
            ],
        }

        if self.force_cpu:
            payload["options"]["num_gpu"] = 0
            payload["options"]["num_thread"] = self.num_thread
            payload["options"]["low_vram"] = True
        elif self.num_gpu >= 0:
            payload["options"]["num_gpu"] = self.num_gpu

        last_exc: Optional[Exception] = None
        tried_models: List[str] = []
        for candidate in candidate_models[:max_try]:
            tried_models.append(candidate)
            self.last_model = candidate
            payload["model"] = candidate
            try:
                res = requests.post(f"{self.base_url}/api/chat", json=payload, timeout=request_timeout)
                res.raise_for_status()
                self.last_http_ok = True
                data = res.json()
                text = ((data.get("message") or {}).get("content") or "").strip()
                if text:
                    self.last_error = ""
                    return text
                thinking = ((data.get("message") or {}).get("thinking") or "").strip()
                # Some models can return HTTP 200 with empty content; retry next candidate model.
                done_reason = data.get("done_reason") or "unknown"
                self.last_error = f"{candidate}: 响应为空（done_reason={done_reason}），尝试后备模型"
                continue
            except Exception as exc:
                last_exc = exc
                self.last_error = f"{candidate}: {exc}"

        if last_exc is not None:
            self.last_error = f"已尝试模型 {', '.join(tried_models)}，最后错误：{last_exc}"
        elif tried_models:
            self.last_error = f"已尝试模型 {', '.join(tried_models)}，均返回空内容"
        return None

    def list_models(self) -> List[str]:
        try:
            res = requests.get(f"{self.base_url}/api/tags", timeout=8)
            res.raise_for_status()
            data = res.json()
            self.last_error = ""
            return [m.get("name") for m in data.get("models", []) if m.get("name")]
        except Exception as exc:
            self.last_error = str(exc)
            return []

    def available(self) -> bool:
        return len(self.list_models()) > 0
'''

class CloudLLMService:
    def __init__(self, api_key: str, default_model: str) -> None:
        self.api_key = api_key
        self.default_model = default_model
        self.last_error = ""
        self.last_http_ok = False
        self.last_model = default_model

    def chat(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_models_to_try: int = 1,
        num_predict_override: Optional[int] = None,
        timeout_seconds_override: Optional[int] = None,
    ) -> Optional[str]:
        """调用 Groq API（OpenAI 兼容）"""
        if not self.api_key:
            self.last_error = "未配置 GROQ_API_KEY"
            return None

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = [
            {"role": "system", "content": "你是工业设备故障问答助手。优先基于提供的上下文，结论简洁、可执行。"},
            {"role": "user", "content": prompt}
        ]

        payload = {
            "model": model or self.default_model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": num_predict_override or 512,
            "top_p": 0.9,
        }

        try:
            res = requests.post(url, headers=headers, json=payload,
                                timeout=timeout_seconds_override or 60)
            res.raise_for_status()
            data = res.json()
            self.last_http_ok = True
            self.last_model = model or self.default_model
            content = data["choices"][0]["message"]["content"].strip()
            if content:
                self.last_error = ""
                return content
            self.last_error = "Groq 返回空内容"
            return None
        except Exception as exc:
            self.last_error = f"Groq 调用失败: {exc}"
            return None

    def list_models(self) -> List[str]:
        # Groq 不需要动态获取模型列表，直接返回默认模型即可
        return [self.default_model] if self.api_key else []

    def available(self) -> bool:
        return bool(self.api_key)

BASE_DIR = Path(__file__).resolve().parent
KB_PATHS = [
    BASE_DIR / "data" / "knowledge.md",
    BASE_DIR / "data" / "wind_power_qa.md",
]
CSV_KB_DIR = BASE_DIR / "csv文件"
USER_DB_PATH = BASE_DIR / "users.sqlite3"
QA_ONLY_SOURCE = "wind_power_qa"
kb = KnowledgeBase(KB_PATHS, csv_dir=CSV_KB_DIR)
neo4j_service = Neo4jService(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE)
# ollama_service = OllamaService(OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT)
cloud_llm = CloudLLMService(GROQ_API_KEY, GROQ_MODEL)


def _db_connect():
    conn = sqlite3.connect(USER_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_user_db() -> None:
    with _db_connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                phone TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()

    seed_default_admin()


def seed_default_admin() -> None:
    existing = get_user_by_username(LOGIN_DEFAULT_USER)
    if existing:
        return
    create_user(
        username=LOGIN_DEFAULT_USER,
        password=LOGIN_DEFAULT_PASSWORD,
        role=LOGIN_DEFAULT_ROLE,
        phone="",
    )


def get_user_by_username(username: str) -> Optional[sqlite3.Row]:
    if not username:
        return None
    with _db_connect() as conn:
        cur = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
        return cur.fetchone()


def create_user(username: str, password: str, role: str, phone: str = "") -> None:
    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    with _db_connect() as conn:
        conn.execute(
            "INSERT INTO users (username, password_hash, role, phone, created_at) VALUES (?, ?, ?, ?, ?)",
            (username, password_hash, role, phone, created_at),
        )
        conn.commit()


init_user_db()

def ensure_complete_sentences(text: str) -> str:
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    if not lines:
        return ""

    completed: List[str] = []
    for line in lines:
        if line[-1] not in "。！？.!?":
            line = line + "。"
        completed.append(line)
    return "\n".join(completed)


def build_citation_fallback(
    query: str,
    graph_node: str,
    exact_csv_hits: List[Dict[str, Any]],
    kg_hits: List[Dict[str, str]],
    kb_hits: List[Dict[str, Any]],
) -> str:
    q = (query or "").strip()
    node = (graph_node or "当前节点").strip()

    symptom = f"{node}常见表现为运行参数异常波动"
    cause = "磨损、堵塞或参数偏差"
    action = "核对油路与执行机构后复测"
    fields: Dict[str, Any] = {}
    first_points: List[str] = []

    if exact_csv_hits:
        first = exact_csv_hits[0]
        fields = first.get("fields") or {}
        first_points = KnowledgeBase._csv_text_to_points(first.get("text", ""), limit=6)
        if first_points:
            symptom = first_points[0]
        if len(first_points) > 1:
            cause = first_points[1]
        if len(first_points) > 2:
            action = first_points[2]
    elif kg_hits:
        t = kg_hits[0]
        symptom = f"{t.get('head', node)}通常表现为{t.get('tail', '相关异常')}"
        cause = f"关联关系为{t.get('rel', '图谱关系')}"
    elif kb_hits:
        symptom = kb_hits[0].get("text", symptom)[:34]

    # Frequency questions should produce a very short direct answer.
    if re.search(r"频率|高吗|常见吗|多吗|易发", q):
        raw = ""
        for key in ["发生频率", "故障频次", "易发工况", "影响等级"]:
            value = str(fields.get(key, "")).strip()
            if value:
                raw = value
                break
        text = raw or (" ".join(first_points) if first_points else "")
        if re.search(r"低|少|罕见|偶发", text):
            return "较低。"
        if re.search(r"中|一般", text):
            return "中等。"
        if text:
            return "较高。"
        return "未知。"

    # If user explicitly asks for one word or very short answer.
    if re.search(r"一个词|只回答|简答|简述", q):
        return "正常。"

    short = re.search(r"(\d+)\s*字", q)
    if short:
        limit = max(18, min(int(short.group(1)), 90))
        sentence = f"{node}表现为{symptom}，常因{cause}，建议{action}"
        sentence = re.sub(r"\s+", "", sentence)
        if len(sentence) > limit:
            sentence = sentence[: max(0, limit - 1)]
        if not sentence.endswith("。"):
            sentence += "。"
        return sentence

    return f"{node}主要表现为{symptom}；常见原因为{cause}；建议先{action}。"


@app.before_request
def require_login():
    endpoint = request.endpoint or ""
    if endpoint in {"login", "register", "static"}:
        return None
    if session.get("logged_in"):
        return None
    if request.path.startswith("/api/"):
        return jsonify({"error": "未登录，请先使用默认账号 admin / 123456 登录。"}), 401
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    error = ""
    register_success = ""
    register_mode = False
    if request.method == "POST":
        username = (request.form.get("username") or "").strip()
        password = (request.form.get("password") or "").strip()
        user = get_user_by_username(username)
        if user and check_password_hash(user["password_hash"], password):
            session["logged_in"] = True
            session["username"] = user["username"]
            session["role"] = user["role"]
            return redirect(url_for("index"))
        error = "用户名或密码错误。"
    if request.args.get("register") == "ok":
        register_success = "注册成功，请登录。"
    if request.args.get("mode") == "register":
        register_mode = True
    return render_template("login.html", error=error, register_success=register_success, register_mode=register_mode)


@app.route("/register", methods=["POST"])
def register():
    username = (request.form.get("username") or "").strip()
    password = (request.form.get("password") or "").strip()
    role = (request.form.get("role") or "").strip().lower()
    phone = (request.form.get("phone") or "").strip()

    error = ""
    if not username or not password or not role:
        error = "注册信息不完整，请填写用户名、密码与身份类型。"
    elif role not in {USER_ROLE_USER, USER_ROLE_ADMIN}:
        error = "身份类型无效，请重新选择。"
    elif get_user_by_username(username):
        error = "用户名已存在，请更换。"

    if error:
        return render_template("login.html", error="", register_error=error, register_mode=True)

    create_user(username=username, password=password, role=role, phone=phone)
    return redirect(url_for("login", register="ok"))


@app.get("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/")
def index():
    role = session.get("role") or USER_ROLE_USER
    username = session.get("username") or ""
    return render_template("index.html", is_admin=(role == USER_ROLE_ADMIN), username=username)


@app.get("/api/faqs")
def get_faqs():
    count = request.args.get("count", default=3, type=int)
    count = min(max(count, 1), 6)
    selected = kb.sample_questions(count)
    return jsonify({"faqs": selected})


@app.get("/api/models")
def get_models():
    models = cloud_llm.list_models()
   
    return jsonify(
        {
            "models": models,
            "default": cloud_llm.default_model,
            "recommended": cloud_llm.default_model,
            "timeoutSeconds": 180,
            "error": cloud_llm.last_error,
        }
    )

@app.get("/api/status")
def get_status():
    neo_ok = neo4j_service.available()
    models = cloud_llm.list_models()
    return jsonify(
        {
            "neo4j": {
                "available": neo_ok,
                "uri": neo4j_service.uri,
                "user": neo4j_service.user,
                "database": neo4j_service.database,
                "error": neo4j_service.last_error,
            },
            "cloud_llm": {
                "available": cloud_llm.available(),
                #"baseUrl": cloud_llm.base_url,
                "defaultModel": cloud_llm.default_model,
                #"recommendedModel": cloud_llm.recommended_model(ollama_models),
                "models": models,
                "error": cloud_llm.last_error,
            },
        }
    )


@app.post("/api/neo4j/config")
def neo4j_config():
    payload = request.get_json(silent=True) or {}
    neo4j_service.update_config(
        uri=(payload.get("uri") or "").strip(),
        user=(payload.get("user") or "").strip(),
        password=(payload.get("password") or "").strip(),
        database=(payload.get("database") or "").strip(),
    )
    ok = neo4j_service.available()
    return jsonify({"ok": ok, "error": neo4j_service.last_error, "uri": neo4j_service.uri, "database": neo4j_service.database})

'''
@app.post("/api/ollama/config")
def ollama_config():
    payload = request.get_json(silent=True) or {}
    cloud_llm.update_config(
        base_url=(payload.get("baseUrl") or "").strip(),
        default_model=(payload.get("defaultModel") or "").strip(),
    )
    models = cloud_llm.list_models()
    return jsonify({"ok": len(models) > 0, "models": models, "error": cloud_llm.last_error, "default": cloud_llm.default_model})
'''

@app.get("/api/kg/graph")
def kg_graph():
    limit = request.args.get("limit", default=120, type=int)
    graph = neo4j_service.get_graph(limit=limit)
    return jsonify(graph)


@app.get("/api/kg/search")
def kg_search():
    keyword = request.args.get("keyword", default="", type=str)
    triplets = neo4j_service.search_triplets(keyword, limit=10)
    return jsonify({"triplets": triplets, "error": neo4j_service.last_error})


@app.get("/api/kg/node")
def kg_node():
    node_id = request.args.get("id", type=int)
    node_label = (request.args.get("label", default="", type=str) or "").strip()
    if node_id is None:
        return jsonify({"triplets": [], "error": "缺少节点ID参数"}), 400
    triplets = neo4j_service.get_node_neighbors(node_id=node_id, limit=15)
    if not node_label:
        node_label = neo4j_service.get_node_label(node_id)
    csv_details = kb.node_detail_cards(node_label, top_k=4) if node_label else []
    return jsonify({"triplets": triplets, "nodeLabel": node_label, "csvDetails": csv_details, "error": neo4j_service.last_error})


@app.post("/api/chat")
def chat():
    payload = request.get_json(silent=True) or {}
    message = payload.get("message", "")
    image_name = payload.get("imageName", "")
    model_name = payload.get("model", "")
    knowledge_mode = (payload.get("knowledgeMode") or "local").strip().lower()
    graph_node = (payload.get("graphNode") or "").strip()
    graph_triplets_payload = payload.get("graphTriplets") or []

    query = (message or "").strip()
    started_at = time.perf_counter()

    exact_hit = kb.exact_qa_answer(query)
    if exact_hit:
        return jsonify(exact_hit)

    if image_name and not query:
        return jsonify(kb.answer(query, image_name=image_name))

    focus_terms = [term for term in [graph_node] if term]
    kb_hits_all = kb.retrieve(query, top_k=10, focus_terms=focus_terms) if query else []
    exact_csv_hits = kb.exact_csv_matches(graph_node or query, top_k=3)
    kb_hits = exact_csv_hits + [
        it for it in kb_hits_all
        if it.get("source") == QA_ONLY_SOURCE or str(it.get("source", "")).startswith("csv:")
    ]
    dedup_kb: List[Dict[str, Any]] = []
    seen_titles = set()
    for item in kb_hits:
        key = item.get("title") or item.get("source") or item.get("text")
        if key in seen_titles:
            continue
        seen_titles.add(key)
        dedup_kb.append(item)
    kb_hits = dedup_kb[:5]

    if graph_triplets_payload and isinstance(graph_triplets_payload, list):
        kg_hits = [
            {"head": str(t.get("head", "")).strip(), "rel": str(t.get("rel", "")).strip(), "tail": str(t.get("tail", "")).strip()}
            for t in graph_triplets_payload
            if isinstance(t, dict) and (t.get("head") or t.get("rel") or t.get("tail"))
        ][:8]
    else:
        kg_hits = neo4j_service.search_triplets(graph_node or query, limit=8) if (graph_node or query) else []

    context_blocks = []
    if graph_node:
        context_blocks.append(f"【当前图谱节点】\n- {graph_node}")
    if kb_hits:
        context_blocks.append(
            "【文本知识库】\n" + "\n".join([f"- {it['title']}: {it['text'][:110]}" for it in kb_hits])
        )
    if kg_hits:
        context_blocks.append(
            "【知识图谱三元组】\n" + "\n".join([f"- ({t['head']})-[{t['rel']}]->({t['tail']})" for t in kg_hits])
        )

    if not context_blocks and query and knowledge_mode != "open":
        return jsonify(
            {
                "answer": "根据现有知识库与图谱，我暂时没有检索到相关内容。请补充设备名称、故障现象或关键词后重试。",
                "sources": [],
            }
        )

    if context_blocks:
        llm_prompt = (
            f"用户问题：{query}\n\n"
            + "\n\n".join(context_blocks)
            + "\n\n请仅根据以上上下文回答。若信息不足请明确指出缺口，并给出下一步需要补充的数据。"
        )
    else:
        llm_prompt = f"用户问题：{query}\n\n若需要，可结合通用知识给出简洁、可执行的建议。"

    request_mode = (payload.get("requestMode") or "").strip().lower()
    is_kg_auto_mode = request_mode == "kg-auto"
    is_citation_mode = bool(graph_node) and request_mode != "kg-auto"
    if is_kg_auto_mode:
        prompt_head = "你是风电设备故障诊断助手。只输出最终结论，不要分析过程。"
    elif is_citation_mode:
        prompt_head = "你是风电设备维护助手。必须在100字内给出完整结论，不要输出推理过程。"
    else:
        if knowledge_mode == "open":
            prompt_head = "你是工业设备故障问答助手。可结合通用知识与提供的上下文，结论简洁、可执行。"
        else:
            prompt_head = "你是工业设备故障问答助手。优先基于提供的上下文，结论简洁、可执行。"

    llm_num_predict = 220 if is_citation_mode else (256 if is_kg_auto_mode else None)
    llm_timeout = 180 if is_citation_mode else (180 if is_kg_auto_mode else None)
  
    llm_try_count = (2 if is_citation_mode else (1 if is_kg_auto_mode else 3))
    quick_citation = bool(is_citation_mode and len(query) <= 8 and (exact_csv_hits or kg_hits))

    if quick_citation:
        llm_text = build_citation_fallback(query, graph_node, exact_csv_hits, kg_hits, kb_hits)
        cloud_http_ok = False
        llm_generated = False
        llm_used = False
        response_state = "fallback"
        llm_error = "已基于引用证据快速生成答案。"
    else:
        llm_raw_text = cloud_llm.chat(
            prompt_head + "\n" + llm_prompt,
            model=model_name,
            max_models_to_try=1,
            num_predict_override=llm_num_predict,
            timeout_seconds_override=llm_timeout,
        )
        llm_text = (llm_raw_text or "").strip()
        cloud_http_ok = cloud_llm.last_http_ok
        llm_generated = bool(llm_text)
        llm_used = llm_generated
        response_state = "success" if llm_generated else ("fallback" if cloud_http_ok else "failed")
        llm_error = cloud_llm.last_error
    if not llm_text:
        if is_kg_auto_mode:
            lines = []
            if exact_csv_hits:
                first = exact_csv_hits[0]
                row_text = first.get("text", "")
                lines.append(f"1. 故障现象：{first.get('name', graph_node)[:18]}")
                lines.append(f"2. 可能原因：{row_text[:22]}")
                lines.append(f"3. 处理建议：{graph_node[:18]}建议结合图谱与CSV条目排查")
            elif kg_hits:
                lines = [f"1. 故障现象：{kg_hits[0]['head']}相关异常", f"2. 可能原因：{kg_hits[0]['rel']}链路相关", f"3. 处理建议：结合三元组继续排查"]
            if lines:
                llm_text = "\n".join(lines)
                response_state = "fallback"
                if not llm_error:
                    llm_error = "模型响应较慢，已使用图谱与CSV证据生成结构化结论。"
        elif is_citation_mode:
            llm_text = build_citation_fallback(query, graph_node, exact_csv_hits, kg_hits, kb_hits)
            response_state = "fallback"
            if not llm_error:
                llm_error = "模型未在限时内完成，已使用引用证据生成结论。"
        if not llm_text:
            if kb_hits:
                llm_text = "根据检索到的证据，建议如下：\n" + kb_hits[0]["text"][:320]
            elif kg_hits:
                lines = [f"({t['head']})-[{t['rel']}]->({t['tail']})" for t in kg_hits[:5]]
                llm_text = "根据知识图谱证据，相关三元组如下：\n" + "\n".join(lines)
            else:
                llm_text = "未检索到可用上下文。"
            if response_state == "fallback" and not llm_error:
                llm_error = "模型接口返回成功，但内容为空，已回退到检索摘要。"

    llm_text = ensure_complete_sentences(llm_text)

    sources = [
        {"title": it["title"], "snippet": it["text"][:120] + "..."}
        for it in kb_hits
    ]
    if kg_hits:
        sources.append({"title": "知识图谱", "snippet": f"命中 {len(kg_hits)} 条相关三元组"})

    evidence = {
        "kb": [
            {"title": it["title"], "text": it["text"][:220], "score": round(float(it.get("score", 1.0)), 4)}
            for it in kb_hits
        ],
        "kg": kg_hits,
        "llm": {
            "model": cloud_llm.last_model or model_name or cloud_llm.default_model,
            "used": llm_used,
            "httpOk": cloud_http_ok,
            "status": response_state,
            "latencyMs": int((time.perf_counter() - started_at) * 1000),
            "error": llm_error,
        },
    }

    return jsonify({"answer": llm_text, "sources": sources, "evidence": evidence})


if __name__ == "__main__":
    init_user_db()
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)
