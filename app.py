import random
import re
import os
import time
import csv
import sqlite3
from collections import Counter
from datetime import datetime
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import List, Dict, Any, Optional

from flask import Flask, jsonify, render_template, request, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import requests
from neo4j import GraphDatabase
try:
    import numpy as np
except Exception:
    np = None
try:
    import torch
    import torch.nn as nn
except Exception:
    torch = None
    nn = None
try:
    from scipy.io import loadmat
except Exception:
    loadmat = None


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

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+s://d2ad0ef8.databases.neo4j.io")
NEO4J_USER = os.getenv("NEO4J_USER", "d2ad0ef8")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "xbTpmrOemDMi4JvGvdnVz55oznmMppoC6tRcQ5yZGw")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "d2ad0ef8")
NEO4J_URI_FALLBACK = "neo4j+s://d2ad0ef8.databases.neo4j.io"
NEO4J_USER_FALLBACK = "d2ad0ef8"
NEO4J_PASSWORD_FALLBACK = "xbTpmrOemDMi4JvGvdnVz55oznmMppoC6tRcQ5yZGw"
NEO4J_DATABASE_FALLBACK = "d2ad0ef8"

# 移除 OLLAMA 相关的环境变量，添加 SILICONFLOW
SILICONFLOW_API_KEY = os.environ.get("SILICONFLOW_API_KEY", "") or os.environ.get("GROQ_API_KEY", "")
SILICONFLOW_MODEL = os.environ.get("SILICONFLOW_MODEL", "Qwen/Qwen3-8B")

LOGIN_DEFAULT_USER = "admin"
LOGIN_DEFAULT_PASSWORD = "123456"
LOGIN_DEFAULT_ROLE = "admin"
LOGIN_DEFAULT_COMMON_USER = "11"
LOGIN_DEFAULT_COMMON_PASSWORD = "123"

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
            err_text = str(exc)
            self.last_error = err_text
            unauthorized = "unauthorized" in err_text.lower() or "authentication failure" in err_text.lower()
            should_try_fallback = unauthorized and (
                self.uri != NEO4J_URI_FALLBACK
                or self.user != NEO4J_USER_FALLBACK
                or self.password != NEO4J_PASSWORD_FALLBACK
                or self.database != NEO4J_DATABASE_FALLBACK
            )
            if should_try_fallback:
                try:
                    self.uri = NEO4J_URI_FALLBACK
                    self.user = NEO4J_USER_FALLBACK
                    self.password = NEO4J_PASSWORD_FALLBACK
                    self.database = NEO4J_DATABASE_FALLBACK
                    self._driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
                    self._driver.verify_connectivity()
                    self.last_error = ""
                    return self._driver
                except Exception as fallback_exc:
                    self._driver = None
                    self.last_error = str(fallback_exc)
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

    def count_nodes(self) -> int:
        rows = self.run_read("MATCH (n) RETURN count(n) AS cnt")
        if not rows:
            return 0
        try:
            return int(rows[0].get("cnt", 0) or 0)
        except Exception:
            return 0

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
        """调用 SiliconFlow API（OpenAI 兼容）"""
        if not self.api_key:
            self.last_error = "未配置 SILICONFLOW_API_KEY"
            return None

        url = "https://api.siliconflow.cn/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = [
            {"role": "system", "content": "你是工业设备故障问答助手。优先基于提供的上下文，结论简洁、可执行。回复不超过300字。"},
            {"role": "user", "content": prompt}
        ]

        selected_model = (model or self.default_model or "Qwen/Qwen3-8B").strip()
        payload = {
            "model": selected_model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": num_predict_override or 512,
            "top_p": 0.9,
            "stream": False,
        }

        # 强烈建议保留这些调试输出，会在 Railway 日志中显示
        print(f"[DEBUG] 请求模型: {selected_model}")
        print(f"[DEBUG] API Key 前缀: {self.api_key[:15]}...")
        print(f"[DEBUG] 超时设置: {timeout_seconds_override or 60} 秒")

        timeout_seconds = timeout_seconds_override or 60
        try:
            res = requests.post(url, headers=headers, json=payload, timeout=timeout_seconds)
            print(f"[DEBUG] HTTP 状态码: {res.status_code}")
            if res.status_code != 200:
                self.last_error = f"HTTP {res.status_code}: {res.text[:200]}"
                print(f"[DEBUG] 错误响应: {self.last_error}")
                return None
            data = res.json()
            self.last_http_ok = True
            self.last_model = selected_model
            choices = data.get("choices") or []
            if not choices:
                self.last_error = f"SiliconFlow 返回异常：{str(data)[:200]}"
                print(f"[DEBUG] {self.last_error}")
                return None
            msg = choices[0].get("message") or {}
            content = msg.get("content")
            if isinstance(content, list):
                content = "".join(
                    str(part.get("text", "")) if isinstance(part, dict) else str(part)
                    for part in content
                )
            content = str(content or "").strip()
            if not content:
                content = str(msg.get("reasoning_content") or "").strip()
            if content:
                self.last_error = ""
                print(f"[DEBUG] 成功获取内容，长度 {len(content)}")
                return content
            self.last_error = "SiliconFlow 返回空内容"
            return None
        except requests.exceptions.Timeout:
            self.last_error = f"请求超时 ({timeout_seconds} 秒)"
            print(f"[DEBUG] {self.last_error}")
            return None
        except Exception as exc:
            self.last_error = f"SiliconFlow 调用失败: {exc}"
            print(f"[DEBUG] 异常: {self.last_error}")
            return None
        
    def list_models(self) -> List[str]:
        # 当前固定使用环境变量指定模型
        return [self.default_model] if self.api_key else []

    def available(self) -> bool:
        return bool(self.api_key)

BASE_DIR = Path(__file__).resolve().parent
KB_PATHS = [
    BASE_DIR / "data" / "knowledge.md",
    BASE_DIR / "data" / "wind_power_qa.md",
]
CSV_KB_DIR = BASE_DIR / "csv文件"
CASE_SOURCE_CSV_PATH = BASE_DIR / "csv新" / "风电故障诊断图谱说明.csv"
NETWORK_FEATURE_PATH = BASE_DIR / "网络特点.txt"
USER_DB_PATH = BASE_DIR / "users.sqlite3"
AVATAR_UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "avatars"
ALLOWED_AVATAR_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
DIAG_INPUT_LEN = 1024
DIAG_DATASET_ROOTS = {
    "CWRU": BASE_DIR / "CRWU",
    "MFPT": BASE_DIR / "MFPT Fault Data Sets",
}
DIAG_PTH_ROOTS = {
    "CWRU": BASE_DIR / "pth" / "CWRU-12K",
    "MFPT": BASE_DIR / "pth" / "mfpt",
}
DIAG_MODEL_ALIASES = {
    "cnn": "1D-CNN",
    "wdcnn": "WDCNN",
    "cnn-lstm": "CNN-LSTM",
    "cnn-transformer": "CNN-Transformer",
}
DIAG_MODEL_TO_FILENAME = {
    "1D-CNN": "1D-CNN-Opt_best.pth",
    "WDCNN": "WDCNN-Opt_best.pth",
    "CNN-LSTM": "CNN-LSTM-Opt_best.pth",
    "CNN-Transformer": "CNN-Transformer-Opt_best.pth",
}
DIAG_MODEL_TIPS_DEFAULT = {
    "cnn": "专为一维时序振动信号设计，通过浅层卷积快速提取局部时域特征，适合数据量中等、追求轻量化快速推理的轴承故障诊断。",
    "wdcnn": "基于小波变换与深度 1D-CNN 结合的网络，能在强噪声下自适应提取轴承故障的时频特征，对 CWRU、JNU 等含噪实测数据鲁棒性更强。",
    "cnn-lstm": "先用 CNN 提取空间局部特征，再用 LSTM 捕捉时序依赖关系，适合长序列轴承振动信号，能更好建模故障随时间演变的动态模式。",
    "cnn-transformer": "以 CNN 做局部特征提取、Transformer 建模全局时序依赖，擅长捕捉长距离故障相关特征，在复杂变工况、多故障耦合轴承数据上表现更稳定。",
}
DIAG_CLASS_NAMES = {
    "CWRU": [
        "正常",
        "内圈故障-轻度(0.007in)",
        "内圈故障-中度(0.014in)",
        "内圈故障-重度(0.021in)",
        "外圈故障-轻度(0.007in)",
        "外圈故障-中度(0.014in)",
        "外圈故障-重度(0.021in)",
        "滚动体故障-轻度(0.007in)",
        "滚动体故障-中度(0.014in)",
        "滚动体故障-重度(0.021in)",
    ],
    "MFPT": ["正常", "外圈故障", "内圈故障"],
}
DIAG_MODEL_CACHE: Dict[str, Any] = {}
QA_ONLY_SOURCE = "wind_power_qa"
kb = KnowledgeBase(KB_PATHS, csv_dir=CSV_KB_DIR)
neo4j_service = Neo4jService(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD, NEO4J_DATABASE)
# ollama_service = OllamaService(OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT)
cloud_llm = CloudLLMService(SILICONFLOW_API_KEY, SILICONFLOW_MODEL)


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
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        if "email" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN email TEXT DEFAULT ''")
        if "avatar_path" not in columns:
            conn.execute("ALTER TABLE users ADD COLUMN avatar_path TEXT DEFAULT ''")
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS case_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fault_location TEXT NOT NULL,
                relation_text TEXT NOT NULL,
                consequence TEXT NOT NULL,
                case_source TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    seed_default_admin()
    seed_case_records()


def seed_default_admin() -> None:
    existing = get_user_by_username(LOGIN_DEFAULT_USER)
    if not existing:
        create_user(
            username=LOGIN_DEFAULT_USER,
            password=LOGIN_DEFAULT_PASSWORD,
            role=LOGIN_DEFAULT_ROLE,
            phone="",
        )

    default_common = get_user_by_username(LOGIN_DEFAULT_COMMON_USER)
    if not default_common:
        create_user(
            username=LOGIN_DEFAULT_COMMON_USER,
            password=LOGIN_DEFAULT_COMMON_PASSWORD,
            role=USER_ROLE_USER,
            phone="",
        )


def get_user_by_username(username: str) -> Optional[sqlite3.Row]:
    if not username:
        return None
    with _db_connect() as conn:
        cur = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
        return cur.fetchone()


def create_user(username: str, password: str, role: str, phone: str = "", email: str = "", avatar_path: str = "") -> None:
    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    with _db_connect() as conn:
        conn.execute(
            "INSERT INTO users (username, password_hash, role, phone, email, avatar_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (username, password_hash, role, phone, email, avatar_path, created_at),
        )
        conn.commit()


def current_user_row() -> Optional[sqlite3.Row]:
    username = (session.get("username") or "").strip()
    if not username:
        return None
    return get_user_by_username(username)


def user_row_to_profile(user: Optional[sqlite3.Row]) -> Dict[str, Any]:
    if not user:
        return {}
    role = (user["role"] or "").strip().lower()
    return {
        "username": user["username"] or "",
        "phone": user["phone"] or "",
        "email": user["email"] or "",
        "role": role,
        "roleLabel": "管理员" if role == USER_ROLE_ADMIN else "普通用户",
        "status": "正常",
        "avatarUrl": user["avatar_path"] or "",
    }


def _utc_now_iso() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def seed_case_records() -> None:
    with _db_connect() as conn:
        cur = conn.execute("SELECT COUNT(1) AS cnt FROM case_records")
        row = cur.fetchone()
        cnt = int(row["cnt"]) if row else 0
        if cnt > 0:
            return
        seed_rows = load_case_rows_from_source(start_line=6, end_line=23)
        now = _utc_now_iso()
        for row in seed_rows:
            conn.execute(
                """
                INSERT INTO case_records (fault_location, relation_text, consequence, case_source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    (row.get("故障位置") or "").strip(),
                    (row.get("关联") or "").strip(),
                    (row.get("后果") or "").strip(),
                    (row.get("案例来源") or "").strip(),
                    now,
                    now,
                ),
            )
        conn.commit()


def _case_row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": int(row["id"]),
        "故障位置": row["fault_location"] or "",
        "关联": row["relation_text"] or "",
        "后果": row["consequence"] or "",
        "案例来源": row["case_source"] or "",
        "updatedAt": row["updated_at"] or "",
    }


def is_admin_session() -> bool:
    return (session.get("role") or "").strip().lower() == USER_ROLE_ADMIN


def load_case_rows_from_source(start_line: int = 6, end_line: int = 23) -> List[Dict[str, str]]:
    if not CASE_SOURCE_CSV_PATH.exists():
        return []
    rows: List[Dict[str, str]] = []
    with CASE_SOURCE_CSV_PATH.open("r", encoding="utf-8-sig", newline="") as fp:
        for idx, line in enumerate(fp, start=1):
            if idx < start_line or idx > end_line:
                continue
            raw = (line or "").strip()
            if not raw:
                continue
            parts = [item.strip() for item in raw.split(",")]
            while len(parts) < 4:
                parts.append("")
            rows.append(
                {
                    "故障位置": parts[0],
                    "关联": parts[1],
                    "后果": parts[2],
                    "案例来源": parts[3],
                }
            )
    return rows


def read_csv_rows(csv_path: Path) -> Dict[str, Any]:
    rows: List[List[str]] = []
    for enc in ("utf-8-sig", "gbk", "utf-8"):
        try:
            with csv_path.open("r", encoding=enc, newline="") as fp:
                reader = csv.reader(fp)
                rows = [list(r) for r in reader if any((cell or "").strip() for cell in r)]
            break
        except Exception:
            rows = []
            continue

    if not rows:
        return {"columns": [], "rows": []}

    header = [str(c).strip() for c in rows[0]]
    data_rows = rows[1:]
    col_len = len(header)
    normalized_rows: List[List[str]] = []
    for r in data_rows:
        normalized = [str(c).strip() for c in r]
        if len(normalized) < col_len:
            normalized.extend([""] * (col_len - len(normalized)))
        elif len(normalized) > col_len:
            normalized = normalized[:col_len]
        normalized_rows.append(normalized)
    return {"columns": header, "rows": normalized_rows}


def read_csv_raw_rows(csv_path: Path) -> List[List[str]]:
    for enc in ("utf-8-sig", "gbk", "utf-8"):
        try:
            with csv_path.open("r", encoding=enc, newline="") as fp:
                reader = csv.reader(fp)
                return [list(r) for r in reader if any((cell or "").strip() for cell in r)]
        except Exception:
            continue
    return []


def normalize_case_record_payload(payload: Dict[str, Any]) -> Dict[str, str]:
    fault_location = str(payload.get("故障位置", "") or "").strip()
    relation_text = str(payload.get("关联", "") or "").strip()
    consequence = str(payload.get("后果", "") or "").strip()
    case_source = str(payload.get("案例来源", "") or "").strip()
    if not fault_location or not relation_text or not consequence or not case_source:
        raise ValueError("请完整填写“故障位置、关联、后果、案例来源”四项内容。")
    return {
        "fault_location": fault_location,
        "relation_text": relation_text,
        "consequence": consequence,
        "case_source": case_source,
    }


init_user_db()


def build_admin_console_stats() -> Dict[str, Any]:
    equipment_csv = CSV_KB_DIR / "equipment.csv"
    fault_mode_csv = CSV_KB_DIR / "fault_mode.csv"

    equipment_rows = read_csv_raw_rows(equipment_csv) if equipment_csv.exists() else []
    fault_mode_rows = read_csv_raw_rows(fault_mode_csv) if fault_mode_csv.exists() else []

    equipment_names: List[str] = []
    if len(equipment_rows) > 1:
        for row in equipment_rows[1:]:
            if len(row) < 2:
                continue
            name = str(row[1] or "").strip()
            if name and not name.startswith("#"):
                equipment_names.append(name)

    fault_names: List[str] = []
    freq_counter: Counter = Counter()
    if len(fault_mode_rows) > 1:
        for row in fault_mode_rows[1:]:
            if len(row) < 4:
                continue
            fault_name = str(row[1] or "").strip()
            freq_text = str(row[3] or "").strip()
            if fault_name:
                fault_names.append(fault_name)
            if freq_text:
                freq_counter[freq_text] += 1

    comp_counter: Counter = Counter()
    for eq in equipment_names:
        count = 0
        for fault_name in fault_names:
            if eq and eq in fault_name:
                count += 1
        if count > 0:
            comp_counter[eq] = count

    top_components = [
        {"name": name, "count": int(count)}
        for name, count in sorted(comp_counter.items(), key=lambda item: item[1], reverse=True)[:10]
    ]

    with _db_connect() as conn:
        user_row = conn.execute("SELECT COUNT(1) AS cnt FROM users").fetchone()
        case_row = conn.execute("SELECT COUNT(1) AS cnt FROM case_records").fetchone()
        user_total = int(user_row["cnt"]) if user_row else 0
        case_total = int(case_row["cnt"]) if case_row else 0

    node_total = 0
    try:
        node_total = neo4j_service.count_nodes()
    except Exception:
        node_total = 0

    freq_distribution = [
        {"label": "高", "count": int(freq_counter.get("高", 0)), "color": "#ff8c8c"},
        {"label": "中", "count": int(freq_counter.get("中", 0)), "color": "#ffe27a"},
        {"label": "低", "count": int(freq_counter.get("低", 0)), "color": "#92e28f"},
    ]

    return {
        "summary": {"users": user_total, "nodes": node_total, "cases": case_total},
        "componentFaultTop10": top_components,
        "frequencyDistribution": freq_distribution,
    }


def diag_dependencies_ready() -> Optional[str]:
    if np is None:
        return "缺少 numpy 依赖，请先安装。"
    if torch is None or nn is None:
        return "缺少 torch 依赖，请先安装。"
    if loadmat is None:
        return "缺少 scipy 依赖，请先安装。"
    return None


if nn is not None:
    class DiagOneDCNN(nn.Module):
        def __init__(self, num_classes: int) -> None:
            super().__init__()
            self.net = nn.Sequential(
                nn.Conv1d(1, 64, kernel_size=11, padding=5),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.MaxPool1d(4),
                nn.Conv1d(64, 128, kernel_size=3, padding=1),
                nn.BatchNorm1d(128),
                nn.ReLU(),
                nn.MaxPool1d(4),
                nn.Flatten(),
                nn.Linear(128 * 64, 256),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(256, num_classes),
            )

        def forward(self, x):
            return self.net(x)


    class DiagOneDCNN_MFPT(nn.Module):
        def __init__(self, num_classes: int) -> None:
            super().__init__()
            self.net = nn.Sequential(
                nn.Conv1d(1, 64, kernel_size=11, padding=5),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.MaxPool1d(4),
                nn.Conv1d(64, 128, kernel_size=3, padding=1),
                nn.BatchNorm1d(128),
                nn.ReLU(),
                nn.MaxPool1d(4),
            )
            self.fc = nn.Sequential(
                nn.Linear(128 * 64, 256),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(256, num_classes),
            )

        def forward(self, x):
            x = self.net(x)
            x = x.flatten(1)
            return self.fc(x)


    class DiagWDCNN(nn.Module):
        def __init__(self, num_classes: int) -> None:
            super().__init__()
            self.layer1 = nn.Sequential(
                nn.Conv1d(1, 16, kernel_size=64, stride=16, padding=24),
                nn.BatchNorm1d(16),
                nn.ReLU(),
                nn.MaxPool1d(2, 2),
            )
            self.layer2 = nn.Sequential(
                nn.Conv1d(16, 32, 3, padding=1),
                nn.BatchNorm1d(32),
                nn.ReLU(),
                nn.MaxPool1d(2, 2),
                nn.Conv1d(32, 64, 3, padding=1),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.MaxPool1d(2, 2),
                nn.Flatten(),
                nn.Linear(64 * 8, 256),
                nn.ReLU(),
                nn.Linear(256, num_classes),
            )

        def forward(self, x):
            return self.layer2(self.layer1(x))


    class DiagWDCNN_MFPT(nn.Module):
        def __init__(self, num_classes: int) -> None:
            super().__init__()
            self.features = nn.Sequential(
                nn.Conv1d(1, 16, kernel_size=64, stride=16, padding=24),
                nn.BatchNorm1d(16),
                nn.ReLU(),
                nn.MaxPool1d(2, 2),
                nn.Conv1d(16, 32, 3, padding=1),
                nn.BatchNorm1d(32),
                nn.ReLU(),
                nn.MaxPool1d(2, 2),
                nn.Conv1d(32, 64, 3, padding=1),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.MaxPool1d(2, 2),
            )
            self.fc = nn.Sequential(
                nn.Linear(64 * 8, 256),
                nn.ReLU(),
                nn.Linear(256, num_classes),
            )

        def forward(self, x):
            x = self.features(x)
            x = x.flatten(1)
            return self.fc(x)


    class DiagCNNLSTM(nn.Module):
        def __init__(self, num_classes: int) -> None:
            super().__init__()
            self.cnn = nn.Sequential(
                nn.Conv1d(1, 64, kernel_size=7, stride=2, padding=3),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.MaxPool1d(2),
            )
            self.lstm = nn.LSTM(
                input_size=64,
                hidden_size=128,
                num_layers=2,
                batch_first=True,
                bidirectional=True,
            )
            self.fc = nn.Sequential(nn.Linear(128 * 2, 64), nn.ReLU(), nn.Linear(64, num_classes))

        def forward(self, x):
            x = self.cnn(x).transpose(1, 2)
            x, _ = self.lstm(x)
            return self.fc(x[:, -1, :])


    class DiagCNNTransformer(nn.Module):
        def __init__(self, num_classes: int) -> None:
            super().__init__()
            self.cnn = nn.Sequential(
                nn.Conv1d(1, 64, kernel_size=15, stride=2, padding=7),
                nn.BatchNorm1d(64),
                nn.ReLU(),
                nn.MaxPool1d(2),
            )
            encoder_layer = nn.TransformerEncoderLayer(d_model=64, nhead=8, batch_first=True)
            self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=2)
            self.classifier = nn.Sequential(
                nn.Flatten(),
                nn.Linear(64 * 256, 128),
                nn.ReLU(),
                nn.Linear(128, num_classes),
            )

        def forward(self, x):
            x = self.cnn(x).transpose(1, 2)
            x = self.transformer(x)
            return self.classifier(x)


    DIAG_MODEL_BUILDERS = {
        "1D-CNN": DiagOneDCNN,
        "WDCNN": DiagWDCNN,
        "CNN-LSTM": DiagCNNLSTM,
        "CNN-Transformer": DiagCNNTransformer,
    }
else:
    DIAG_MODEL_BUILDERS = {}


def diag_extract_signal_from_mat(mat_data: Dict[str, Any]) -> Any:
    for key, value in mat_data.items():
        if str(key).startswith("__"):
            continue
        if isinstance(value, np.ndarray) and value.dtype.names is not None:
            try:
                if "gs" in value.dtype.names:
                    arr = np.asarray(value["gs"][0, 0]).squeeze()
                    if arr.ndim == 1 and arr.size >= 16:
                        return arr.astype(np.float32)
            except Exception:
                pass
            for field in ["data", "signal", "vibration", "bearing"]:
                try:
                    if field in value.dtype.names:
                        arr = np.asarray(value[field][0, 0]).squeeze()
                        if arr.ndim == 1 and arr.size >= 16:
                            return arr.astype(np.float32)
                except Exception:
                    continue

    best_score = -1
    best_arr = None
    for key, value in mat_data.items():
        if str(key).startswith("__"):
            continue
        arr = np.asarray(value).squeeze()
        if arr.ndim != 1 or arr.size < 16:
            continue
        if not np.issubdtype(arr.dtype, np.number):
            continue
        score = int(arr.size)
        k = str(key).lower()
        if "de" in k:
            score += 5000
        if "fe" in k:
            score += 3000
        if score > best_score:
            best_score = score
            best_arr = arr.astype(np.float32)
    if best_arr is None:
        raise ValueError("MAT 文件中未找到可用的一维振动信号")
    return best_arr


def diag_load_signal_from_mat(file_path: Path) -> Any:
    mat_data = loadmat(str(file_path))
    return diag_extract_signal_from_mat(mat_data)


def diag_normalize_signal(signal: Any) -> Any:
    x = np.asarray(signal, dtype=np.float32).reshape(-1)
    if x.size == 0:
        raise ValueError("信号为空")
    if x.size < DIAG_INPUT_LEN:
        x = np.pad(x, (0, DIAG_INPUT_LEN - x.size), mode="edge")
    elif x.size > DIAG_INPUT_LEN:
        x = x[:DIAG_INPUT_LEN]
    mean = float(np.mean(x))
    std = float(np.std(x))
    if std < 1e-8:
        std = 1.0
    return (x - mean) / std


def diag_validate_dataset_and_model(dataset: str, model: str) -> Dict[str, str]:
    ds = (dataset or "").strip().upper()
    if ds not in DIAG_DATASET_ROOTS:
        raise ValueError("不支持的数据集，仅支持 CWRU 或 MFPT。")
    model_key = (model or "").strip().lower()
    canonical = DIAG_MODEL_ALIASES.get(model_key, "")
    if not canonical:
        raise ValueError("不支持的模型，仅支持 cnn、cnn-lstm、wdcnn、cnn-transformer。")
    return {"dataset": ds, "modelKey": model_key, "modelCanonical": canonical}


def diag_resolve_model(dataset: str, model_canonical: str):
    cache_key = f"{dataset}:{model_canonical}"
    if cache_key in DIAG_MODEL_CACHE:
        return DIAG_MODEL_CACHE[cache_key]

    if model_canonical not in DIAG_MODEL_BUILDERS:
        raise ValueError("模型结构不可用")
    pth_dir = DIAG_PTH_ROOTS[dataset]
    pth_file = DIAG_MODEL_TO_FILENAME[model_canonical]
    pth_path = pth_dir / pth_file
    if not pth_path.exists():
        raise FileNotFoundError(f"未找到权重文件: {pth_path}")

    class_count = len(DIAG_CLASS_NAMES[dataset])
    if dataset == "MFPT" and model_canonical == "1D-CNN":
        model = DiagOneDCNN_MFPT(num_classes=class_count)
    elif dataset == "MFPT" and model_canonical == "WDCNN":
        model = DiagWDCNN_MFPT(num_classes=class_count)
    else:
        model = DIAG_MODEL_BUILDERS[model_canonical](num_classes=class_count)
    device = torch.device("cpu")
    state = torch.load(str(pth_path), map_location=device)
    if isinstance(state, dict) and "state_dict" in state and isinstance(state["state_dict"], dict):
        state = state["state_dict"]
    if isinstance(state, dict):
        cleaned = {}
        for k, v in state.items():
            nk = k[7:] if str(k).startswith("module.") else k
            cleaned[nk] = v
        state = cleaned
    model.load_state_dict(state, strict=True)
    model.to(device)
    model.eval()
    DIAG_MODEL_CACHE[cache_key] = model
    return model


def diag_list_mat_files(dataset: str) -> List[str]:
    root = DIAG_DATASET_ROOTS[dataset]
    files = [p for p in root.rglob("*.mat") if p.is_file()]
    rels = [str(p.relative_to(root)).replace("\\", "/") for p in files]
    return sorted(rels)


def diag_infer(dataset: str, model_canonical: str, file_path: str) -> Dict[str, Any]:
    root = DIAG_DATASET_ROOTS[dataset].resolve()
    target = (root / file_path).resolve()
    if not str(target).startswith(str(root)):
        raise ValueError("文件路径越界")
    if not target.exists() or not target.is_file():
        raise FileNotFoundError("样本文件不存在")

    signal = diag_load_signal_from_mat(target)
    x = diag_normalize_signal(signal)
    tensor = torch.from_numpy(x).float().unsqueeze(0).unsqueeze(0)
    model = diag_resolve_model(dataset, model_canonical)
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.softmax(logits, dim=1).cpu().numpy()[0]

    pred_idx = int(np.argmax(probs))
    labels = DIAG_CLASS_NAMES[dataset]
    pred_label = labels[pred_idx] if pred_idx < len(labels) else "未知"
    fft = np.abs(np.fft.rfft(x))[:256]
    return {
        "prediction": pred_label,
        "predictionIndex": pred_idx,
        "confidence": float(probs[pred_idx]),
        "probabilities": [{"label": labels[i], "value": float(probs[i])} for i in range(len(labels))],
        "filePath": str(file_path),
        "modelCanonical": model_canonical,
        "signal": [float(v) for v in x[:512]],
        "fft": [float(v) for v in fft],
    }


def load_diag_model_tips() -> Dict[str, str]:
    tips = dict(DIAG_MODEL_TIPS_DEFAULT)
    if not NETWORK_FEATURE_PATH.exists():
        return tips
    try:
        lines = [line.strip() for line in NETWORK_FEATURE_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]
        current = ""
        key_map = {
            "1D-CNN": "cnn",
            "WDCNN": "wdcnn",
            "CNN-LSTM": "cnn-lstm",
            "CNN-Transformer": "cnn-transformer",
        }
        for line in lines:
            normalized = line
            for prefix in ("1.", "2.", "3.", "4."):
                if normalized.startswith(prefix):
                    normalized = normalized[len(prefix):].strip()
                    break
            if normalized in key_map:
                current = key_map[normalized]
                continue
            if current and normalized:
                tips[current] = normalized
                current = ""
    except Exception:
        return tips
    return tips

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


@app.get("/api/user/profile")
def user_profile():
    user = current_user_row()
    if not user:
        return jsonify({"error": "用户不存在，请重新登录。"}), 401
    return jsonify({"profile": user_row_to_profile(user)})


@app.post("/api/user/profile")
def update_user_profile():
    user = current_user_row()
    if not user:
        return jsonify({"error": "用户不存在，请重新登录。"}), 401
    payload = request.get_json(silent=True) or {}
    new_username = str(payload.get("username", user["username"]) or "").strip()
    phone = str(payload.get("phone", "") or "").strip()
    email = str(payload.get("email", "") or "").strip()
    if not new_username:
        return jsonify({"error": "用户名不能为空。"}), 400
    if len(new_username) > 64:
        return jsonify({"error": "用户名长度不能超过64个字符。"}), 400
    if len(phone) > 64 or len(email) > 128:
        return jsonify({"error": "手机号或邮箱长度超出限制。"}), 400

    if new_username != user["username"]:
        same_name_user = get_user_by_username(new_username)
        if same_name_user:
            return jsonify({"error": "该用户名已存在，请更换。"}), 400

    with _db_connect() as conn:
        conn.execute(
            "UPDATE users SET username = ?, phone = ?, email = ? WHERE id = ?",
            (new_username, phone, email, user["id"]),
        )
        conn.commit()
    session["username"] = new_username
    refreshed = get_user_by_username(new_username)
    return jsonify({"ok": True, "profile": user_row_to_profile(refreshed)})


@app.post("/api/user/avatar")
def upload_user_avatar():
    user = current_user_row()
    if not user:
        return jsonify({"error": "用户不存在，请重新登录。"}), 401
    upload = request.files.get("avatar")
    if not upload or not upload.filename:
        return jsonify({"error": "请先选择头像文件。"}), 400
    ext = Path(upload.filename).suffix.lower()
    if ext not in ALLOWED_AVATAR_EXT:
        return jsonify({"error": "仅支持 png/jpg/jpeg/webp/gif 格式头像。"}), 400

    AVATAR_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_stem = secure_filename(Path(upload.filename).stem) or "avatar"
    file_name = f"{secure_filename(user['username'])}_{int(time.time())}_{safe_stem}{ext}"
    target_path = AVATAR_UPLOAD_DIR / file_name
    upload.save(target_path)
    rel_path = f"/static/uploads/avatars/{file_name}"

    with _db_connect() as conn:
        conn.execute("UPDATE users SET avatar_path = ? WHERE id = ?", (rel_path, user["id"]))
        conn.commit()
    refreshed = get_user_by_username(user["username"])
    return jsonify({"ok": True, "avatarUrl": rel_path, "profile": user_row_to_profile(refreshed)})


@app.post("/api/user/password")
def update_user_password():
    user = current_user_row()
    if not user:
        return jsonify({"error": "用户不存在，请重新登录。"}), 401
    payload = request.get_json(silent=True) or {}
    old_password = str(payload.get("oldPassword", "") or "")
    new_password = str(payload.get("newPassword", "") or "")
    confirm_password = str(payload.get("confirmPassword", "") or "")
    if not old_password or not new_password or not confirm_password:
        return jsonify({"error": "请完整填写原密码、新密码、确认密码。"}), 400
    if new_password != confirm_password:
        return jsonify({"error": "两次输入的新密码不一致。"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "新密码长度至少为6位。"}), 400
    if not check_password_hash(user["password_hash"], old_password):
        return jsonify({"error": "原密码错误。"}), 400
    with _db_connect() as conn:
        conn.execute("UPDATE users SET password_hash = ? WHERE id = ?", (generate_password_hash(new_password), user["id"]))
        conn.commit()
    return jsonify({"ok": True, "message": "密码修改成功。"})


@app.get("/api/admin/case-module")
def admin_case_module():
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    with _db_connect() as conn:
        cur = conn.execute(
            "SELECT id, fault_location, relation_text, consequence, case_source, updated_at FROM case_records ORDER BY id DESC LIMIT 10"
        )
        rows = [_case_row_to_dict(r) for r in cur.fetchall()]
    return jsonify({"columns": ["故障位置", "关联", "后果", "案例来源"], "rows": rows, "pageSize": 10})


@app.get("/api/admin/case-records")
def admin_case_records():
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    page = max(1, request.args.get("page", default=1, type=int))
    page_size = min(50, max(1, request.args.get("pageSize", default=10, type=int)))
    keyword = (request.args.get("keyword") or "").strip()
    source_filter = (request.args.get("source") or "").strip()

    where_sql = []
    where_args: List[Any] = []
    if keyword:
        where_sql.append("(fault_location LIKE ? OR relation_text LIKE ? OR consequence LIKE ? OR case_source LIKE ?)")
        like_kw = f"%{keyword}%"
        where_args.extend([like_kw, like_kw, like_kw, like_kw])
    if source_filter:
        where_sql.append("case_source = ?")
        where_args.append(source_filter)
    where_clause = f"WHERE {' AND '.join(where_sql)}" if where_sql else ""
    offset = (page - 1) * page_size

    with _db_connect() as conn:
        count_row = conn.execute(f"SELECT COUNT(1) AS cnt FROM case_records {where_clause}", tuple(where_args)).fetchone()
        total = int(count_row["cnt"]) if count_row else 0
        cur = conn.execute(
            f"""
            SELECT id, fault_location, relation_text, consequence, case_source, updated_at
            FROM case_records
            {where_clause}
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            tuple(where_args + [page_size, offset]),
        )
        rows = [_case_row_to_dict(r) for r in cur.fetchall()]
        source_rows = conn.execute("SELECT DISTINCT case_source FROM case_records ORDER BY case_source ASC").fetchall()
        source_options = [str(r["case_source"] or "").strip() for r in source_rows if str(r["case_source"] or "").strip()]

    pages = (total + page_size - 1) // page_size if total else 1
    return jsonify(
        {
            "columns": ["故障位置", "关联", "后果", "案例来源"],
            "rows": rows,
            "pagination": {"page": page, "pageSize": page_size, "total": total, "pages": pages},
            "sourceOptions": source_options,
        }
    )


@app.post("/api/admin/case-records")
def admin_case_record_create():
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    payload = request.get_json(silent=True) or {}
    try:
        normalized = normalize_case_record_payload(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    now = _utc_now_iso()
    with _db_connect() as conn:
        conn.execute(
            """
            INSERT INTO case_records (fault_location, relation_text, consequence, case_source, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                normalized["fault_location"],
                normalized["relation_text"],
                normalized["consequence"],
                normalized["case_source"],
                now,
                now,
            ),
        )
        conn.commit()
    return jsonify({"ok": True})


@app.put("/api/admin/case-records/<int:record_id>")
def admin_case_record_update(record_id: int):
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    payload = request.get_json(silent=True) or {}
    try:
        normalized = normalize_case_record_payload(payload)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    with _db_connect() as conn:
        cur = conn.execute("SELECT id FROM case_records WHERE id = ?", (record_id,))
        if not cur.fetchone():
            return jsonify({"error": "记录不存在。"}), 404
        conn.execute(
            """
            UPDATE case_records
            SET fault_location = ?, relation_text = ?, consequence = ?, case_source = ?, updated_at = ?
            WHERE id = ?
            """,
            (
                normalized["fault_location"],
                normalized["relation_text"],
                normalized["consequence"],
                normalized["case_source"],
                _utc_now_iso(),
                record_id,
            ),
        )
        conn.commit()
    return jsonify({"ok": True})


@app.delete("/api/admin/case-records/<int:record_id>")
def admin_case_record_delete(record_id: int):
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    with _db_connect() as conn:
        conn.execute("DELETE FROM case_records WHERE id = ?", (record_id,))
        conn.commit()
    return jsonify({"ok": True})


@app.post("/api/admin/case-records/import")
def admin_case_record_import():
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    upload = request.files.get("file")
    if not upload or not upload.filename:
        return jsonify({"error": "请上传CSV文件。"}), 400
    if Path(upload.filename).suffix.lower() != ".csv":
        return jsonify({"error": "仅支持导入CSV文件。"}), 400
    import_mode = (request.form.get("importMode") or "all").strip().lower()
    try:
        start_row = max(1, int(request.form.get("startRow", "1") or "1"))
        end_row = max(1, int(request.form.get("endRow", "1") or "1"))
    except Exception:
        return jsonify({"error": "行范围参数无效，请输入正整数。"}), 400

    tmp_name = f"tmp_case_import_{int(time.time() * 1000)}.csv"
    tmp_path = BASE_DIR / tmp_name
    upload.save(tmp_path)
    try:
        rows = read_csv_raw_rows(tmp_path)
    finally:
        if tmp_path.exists():
            try:
                tmp_path.unlink()
            except Exception:
                pass

    if not rows:
        return jsonify({"error": "CSV文件为空或读取失败。"}), 400

    header = [str(c).strip() for c in rows[0]]
    if {"故障位置", "关联", "后果", "案例来源"}.issubset(set(header)):
        rows = rows[1:]
    if not rows:
        return jsonify({"error": "CSV文件没有可导入的数据行。"}), 400

    picked_rows = rows
    if import_mode == "range":
        if start_row > end_row:
            return jsonify({"error": "起始行不能大于结束行。"}), 400
        if start_row > len(rows):
            return jsonify({"error": "起始行超出CSV有效数据行范围。"}), 400
        picked_rows = rows[start_row - 1 : min(end_row, len(rows))]

    if not picked_rows:
        return jsonify({"error": "未选中任何可导入行。"}), 400

    now = _utc_now_iso()
    inserted = 0
    with _db_connect() as conn:
        for row in picked_rows:
            normalized = [str(c or "").strip() for c in row]
            while len(normalized) < 4:
                normalized.append("")
            payload = {
                "故障位置": normalized[0],
                "关联": normalized[1],
                "后果": normalized[2],
                "案例来源": normalized[3],
            }
            try:
                rec = normalize_case_record_payload(payload)
            except ValueError:
                continue
            conn.execute(
                """
                INSERT INTO case_records (fault_location, relation_text, consequence, case_source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (rec["fault_location"], rec["relation_text"], rec["consequence"], rec["case_source"], now, now),
            )
            inserted += 1
        conn.commit()

    if inserted == 0:
        return jsonify({"error": "导入失败：所选行缺少必要字段。"}), 400
    return jsonify({"ok": True, "imported": inserted})


@app.get("/api/admin/console")
def admin_console():
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    return jsonify(build_admin_console_stats())


@app.get("/api/admin/csv-files")
def admin_csv_files():
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    files = sorted([p.name for p in CSV_KB_DIR.glob("*.csv")])
    return jsonify({"files": files, "count": len(files), "folder": str(CSV_KB_DIR)})


@app.get("/api/admin/csv-files/<path:filename>")
def admin_csv_file_detail(filename: str):
    if not is_admin_session():
        return jsonify({"error": "仅管理员可访问"}), 403
    safe_name = Path(filename).name
    if not safe_name.lower().endswith(".csv"):
        return jsonify({"error": "仅支持查看CSV文件"}), 400
    target = CSV_KB_DIR / safe_name
    if not target.exists() or not target.is_file():
        return jsonify({"error": "文件不存在"}), 404

    parsed = read_csv_rows(target)
    return jsonify(
        {
            "file": safe_name,
            "columns": parsed["columns"],
            "rows": parsed["rows"],
            "rowCount": len(parsed["rows"]),
        }
    )


@app.get("/api/diag/options")
def diag_options():
    dep_error = diag_dependencies_ready()
    return jsonify(
        {
            "datasets": [
                {"key": "CWRU", "label": "CWRU（凯斯西储大学数据集）"},
                {"key": "MFPT", "label": "MFPT"},
                {"key": "CUSTOM", "label": "自定义上传"},
            ],
            "models": [
                {"key": "cnn", "label": "CNN"},
                {"key": "wdcnn", "label": "WDCNN"},
                {"key": "cnn-lstm", "label": "CNN-LSTM"},
                {"key": "cnn-transformer", "label": "CNN-Transformer"},
            ],
            "customTip": "当前功能开发中",
            "ready": dep_error is None,
            "dependencyError": dep_error or "",
        }
    )


@app.get("/api/diag/model-tips")
def diag_model_tips():
    return jsonify({"tips": load_diag_model_tips()})


@app.get("/api/diag/files")
def diag_files():
    dataset = (request.args.get("dataset", "") or "").strip().upper()
    if dataset not in {"CWRU", "MFPT"}:
        return jsonify({"error": "dataset 参数无效，仅支持 CWRU/MFPT。"}), 400
    root = DIAG_DATASET_ROOTS.get(dataset)
    if not root or not root.exists():
        return jsonify({"error": f"未找到数据集目录：{root}"}), 404
    files = diag_list_mat_files(dataset)
    return jsonify({"dataset": dataset, "count": len(files), "files": files})


@app.post("/api/diag/infer")
def diag_infer_api():
    payload = request.get_json(silent=True) or {}
    dataset = str(payload.get("dataset", "") or "").strip()
    model = str(payload.get("model", "") or "").strip()
    file_path = str(payload.get("filePath", "") or "").strip()

    if dataset.upper() == "CUSTOM":
        return jsonify({"error": "当前功能开发中"}), 400

    dep_error = diag_dependencies_ready()
    if dep_error:
        return jsonify({"error": dep_error}), 500

    try:
        info = diag_validate_dataset_and_model(dataset, model)
        if not file_path:
            return jsonify({"error": "缺少样本文件路径"}), 400
        infer_result = diag_infer(info["dataset"], info["modelCanonical"], file_path)
        return jsonify(
            {
                "ok": True,
                "dataset": info["dataset"],
                "model": info["modelKey"],
                "modelCanonical": info["modelCanonical"],
                **infer_result,
            }
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


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

    if not context_blocks and query:
        return jsonify(
            {
                "answer": "根据现有知识库与图谱，我暂时没有检索到相关内容。请补充设备名称、故障现象或关键词后重试。",
                "sources": [],
            }
        )

    llm_prompt = (
        f"用户问题：{query}\n\n"
        + "\n\n".join(context_blocks)
        + "\n\n请仅根据以上上下文回答。若信息不足请明确指出缺口，并给出下一步需要补充的数据。"
    )

    request_mode = (payload.get("requestMode") or "").strip().lower()
    is_kg_auto_mode = request_mode == "kg-auto"
    is_citation_mode = bool(graph_node) and request_mode != "kg-auto"
    if is_kg_auto_mode:
        prompt_head = "你是风电设备故障诊断助手。只输出最终结论，不要分析过程。"
    elif is_citation_mode:
        prompt_head = "你是风电设备维护助手。必须在100字内给出完整结论，不要输出推理过程。"
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
        print(f"[DEBUG] 开始调用 LLM，超时设置: {llm_timeout}")
        llm_raw_text = cloud_llm.chat(
            prompt_head + "\n" + llm_prompt,
            model=model_name,
            max_models_to_try=1,
            num_predict_override=llm_num_predict,
            timeout_seconds_override=llm_timeout,
        )
        print(f"[DEBUG] LLM 原始返回: {llm_raw_text[:100] if llm_raw_text else 'None'}")
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
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)
