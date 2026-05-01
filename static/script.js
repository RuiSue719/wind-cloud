const moduleTabs = document.querySelectorAll(".side-nav-item");
const modules = document.querySelectorAll(".module");
const appShell = document.getElementById("appShell");
const moduleSidebar = document.querySelector(".module-sidebar");
const moduleSplitter = document.getElementById("moduleSplitter");
const historySidebar = document.getElementById("historySidebar");
const historySplitter = document.getElementById("historySplitter");
const topbarModelBlock = document.getElementById("topbarModelBlock");
const composer = document.getElementById("composer");
const runtimeStatus = document.getElementById("runtimeStatus");
const historyList = document.getElementById("historyList");
const newChatBtn = document.getElementById("newChatBtn");

const faqList = document.getElementById("faqList");
const refreshFaqBtn = document.getElementById("refreshFaqBtn");
const chatPanel = document.getElementById("chatPanel");
const modelSelect = document.getElementById("modelSelect");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const voiceBtn = document.getElementById("voiceBtn");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const citationBar = document.getElementById("citationBar");

const neo4jUri = document.getElementById("neo4jUri");
const neo4jUser = document.getElementById("neo4jUser");
const neo4jPassword = document.getElementById("neo4jPassword");
const neo4jDatabase = document.getElementById("neo4jDatabase");
const neo4jConnectBtn = document.getElementById("neo4jConnectBtn");
const kgKeyword = document.getElementById("kgKeyword");
const kgSearchBtn = document.getElementById("kgSearchBtn");
const kgReloadBtn = document.getElementById("kgReloadBtn");
const graphZoomInBtn = document.getElementById("graphZoomInBtn");
const graphZoomOutBtn = document.getElementById("graphZoomOutBtn");
const graphCanvas = document.getElementById("graphCanvas");
const tripletList = document.getElementById("tripletList");
const graphHoverAction = document.getElementById("graphHoverAction");
const nodeDetailModal = document.getElementById("nodeDetailModal");
const nodeDetailTitle = document.getElementById("nodeDetailTitle");
const nodeDetailBody = document.getElementById("nodeDetailBody");
const nodeDetailShrinkBtn = document.getElementById("nodeDetailShrinkBtn");
const nodeDetailGrowBtn = document.getElementById("nodeDetailGrowBtn");
const nodeDetailCloseBtn = document.getElementById("nodeDetailCloseBtn");
const kgConnPanel = document.getElementById("kgConnPanel");
const diagnoseFile = document.getElementById("diagnoseFile");
const diagnoseBtn = document.getElementById("diagnoseBtn");
const diagnoseResult = document.getElementById("diagnoseResult");

let selectedImage = null;
let recognition = null;
let graphNetwork = null;
let lastStatus = null;
let sessions = [];
let currentSessionId = "";
let pendingCitation = null;
let graphNodesDataSet = null;
let graphEdgesDataSet = null;
let graphNodesCache = [];
let graphEdgesCache = [];
let pinnedNodeId = null;
let isVoiceListening = false;

const CHAT_STORAGE_BASE = "industrial_qa_history_v1";
const activeUsername = document.body?.dataset?.username || "guest";
const CHAT_STORAGE_KEY = `${CHAT_STORAGE_BASE}:${activeUsername}`;
const CHAT_REQUEST_TIMEOUT_MS = 180000;
const GRAPH_AUTO_REQUEST_TIMEOUT_MS = 240000;
const SLOW_MODEL_REQUEST_TIMEOUT_MS = 180000;
const CITATION_REQUEST_TIMEOUT_MS = 220000;

function setCitation(citation) {
  pendingCitation = citation;
  renderCitation();
}

function clearCitation() {
  pendingCitation = null;
  if (messageInput) {
    messageInput.placeholder = "请输入文本，或上传图片后提问...";
  }
  renderCitation();
}

function renderCitation() {
  if (!citationBar) {
    return;
  }
  if (!pendingCitation || !pendingCitation.label) {
    citationBar.classList.add("hidden");
    citationBar.innerHTML = "";
    return;
  }

  const triples = Array.isArray(pendingCitation.triplets) ? pendingCitation.triplets.length : 0;
  citationBar.classList.remove("hidden");
  citationBar.innerHTML = `
    <div class="citation-content">已引用节点：${escapeHtml(pendingCitation.label)}（图谱关系 ${triples} 条）</div>
    <button class="citation-clear" type="button" id="citationClearBtn">清除引用</button>
  `;
  const clearBtn = document.getElementById("citationClearBtn");
  clearBtn?.addEventListener("click", clearCitation);
}

function switchModule(targetId) {
  moduleTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.target === targetId);
  });
  modules.forEach((m) => {
    m.classList.toggle("active", m.id === targetId);
  });
  composer.style.display = targetId === "qaModule" ? "block" : "none";
  const isQa = targetId === "qaModule";
  appShell?.classList.toggle("non-qa", !isQa);
  if (historySidebar) {
    historySidebar.style.display = isQa ? "flex" : "none";
  }
  if (topbarModelBlock) {
    topbarModelBlock.style.display = isQa ? "inline-flex" : "none";
  }

  if (targetId === "kgModule") {
    loadGraph();
  }
}

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appendMessage(role, text, sources = []) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;

  if (role === "bot" && Array.isArray(sources) && sources.length > 0) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "source-box";
    sourceBox.textContent = "参考来源：" + sources.map((s) => s.title).join(" | ");
    item.appendChild(sourceBox);
  }

  chatPanel.appendChild(item);
  chatPanel.scrollTop = chatPanel.scrollHeight;
}

function appendMessageNode(role, node, sources = []) {
  node.classList.add("message", role);
  if (role === "bot" && Array.isArray(sources) && sources.length > 0) {
    const sourceBox = document.createElement("div");
    sourceBox.className = "source-box";
    sourceBox.textContent = "参考来源：" + sources.map((s) => s.title).join(" | ");
    node.appendChild(sourceBox);
  }
  chatPanel.appendChild(node);
  chatPanel.scrollTop = chatPanel.scrollHeight;
}

function nowText(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

function saveSessions() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    sessions = raw ? JSON.parse(raw) : [];
  } catch (e) {
    sessions = [];
  }
  if (sessions.length === 0) {
    createNewSession(false);
  } else {
    currentSessionId = sessions[0].id;
  }
}

function getCurrentSession() {
  return sessions.find((s) => s.id === currentSessionId);
}

function createNewSession(render = true) {
  const id = `s_${Date.now()}`;
  const item = {
    id,
    title: "新对话",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    lastEvidence: null,
  };
  sessions.unshift(item);
  currentSessionId = id;
  saveSessions();
  renderHistory();
  if (render) {
    renderCurrentSession();
  }
}

function renderHistory() {
  if (!historyList) {
    return;
  }
  historyList.innerHTML = "";
  sessions
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((s) => {
      const div = document.createElement("div");
      div.className = `history-item ${s.id === currentSessionId ? "active" : ""}`;
      const title = escapeHtml(s.title || "新对话");
      div.innerHTML = `<div class="history-title">${title}</div><div class="history-time">${nowText(s.updatedAt)}</div>`;
      div.addEventListener("click", () => {
        currentSessionId = s.id;
        renderHistory();
        renderCurrentSession();
      });
      historyList.appendChild(div);
    });
}

function renderCurrentSession() {
  chatPanel.innerHTML = "";
  const s = getCurrentSession();
  if (!s) {
    return;
  }
  s.messages.forEach((m) => appendMessage(m.role, m.text, m.sources || []));
  renderEvidence(s.lastEvidence || null);
}

function addSessionMessage(role, text, sources = [], evidence = null) {
  const s = getCurrentSession();
  if (!s) {
    return;
  }
  s.messages.push({ role, text, sources, ts: Date.now() });
  s.updatedAt = Date.now();
  if (s.title === "新对话" && role === "user") {
    s.title = text.slice(0, 18) || "新对话";
  }
  if (evidence) {
    s.lastEvidence = evidence;
  }
  saveSessions();
  renderHistory();
}

function renderStatus() {
  if (!runtimeStatus) {
    return;
  }
  if (!lastStatus) {
    runtimeStatus.className = "status-chip";
    runtimeStatus.textContent = "neo4j连接中";
    return;
  }

  const neo = lastStatus.neo4j || {};
  const ok = Boolean(neo.available);

  runtimeStatus.className = `status-chip ${ok ? "ok" : "bad"}`;
  runtimeStatus.textContent = ok
    ? "neo4j已连接"
    : "neo4j未连接，请进入图谱可视化连接neo4j";
  if (kgConnPanel) {
    kgConnPanel.style.display = ok ? "none" : "grid";
  }
}

function initLayoutResizer() {
  if (!appShell) {
    return;
  }
  let draggingType = "";

  const onMove = (evt) => {
    if (!draggingType) {
      return;
    }
    const rect = appShell.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    if (draggingType === "module") {
      const moduleW = Math.max(120, Math.min(280, x));
      appShell.style.setProperty("--module-w", `${moduleW}px`);
      return;
    }
    if (draggingType === "history") {
      const moduleW = moduleSidebar ? moduleSidebar.getBoundingClientRect().width : 160;
      const historyW = Math.max(170, Math.min(420, x - moduleW - 8));
      appShell.style.setProperty("--history-w", `${historyW}px`);
    }
  };

  const onUp = () => {
    draggingType = "";
    document.body.style.userSelect = "";
  };

  moduleSplitter?.addEventListener("mousedown", () => {
    draggingType = "module";
    document.body.style.userSelect = "none";
  });
  historySplitter?.addEventListener("mousedown", () => {
    draggingType = "history";
    document.body.style.userSelect = "none";
  });
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
}

function resizeNodeDetailModal(deltaW, deltaH) {
  if (!nodeDetailModal) {
    return;
  }
  const rect = nodeDetailModal.getBoundingClientRect();
  const width = Math.max(320, Math.min(window.innerWidth * 0.92, rect.width + deltaW));
  const height = Math.max(240, Math.min(window.innerHeight * 0.86, rect.height + deltaH));
  nodeDetailModal.style.width = `${Math.round(width)}px`;
  nodeDetailModal.style.height = `${Math.round(height)}px`;
}

async function loadStatus() {
  try {
    const res = await fetch("/api/status");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    lastStatus = await res.json();
    const neo = lastStatus.neo4j || {};
    if (neo4jUri) neo4jUri.value = neo.uri || "bolt://127.0.0.1:7687";
    if (neo4jUser) neo4jUser.value = neo.user || "neo4j";
    if (neo4jDatabase) neo4jDatabase.value = neo.database || "neo4j";
  } catch (e) {
    lastStatus = null;
  }
  renderStatus();
}

function ensureEvidencePanel() {
  let panel = chatPanel.querySelector(".evidence-panel-inline");
  if (panel) {
    return panel;
  }
  panel = document.createElement("section");
  panel.className = "evidence-panel evidence-panel-inline";
  chatPanel.appendChild(panel);
  return panel;
}

function renderEvidence(evidence) {
  if (!chatPanel) {
    return;
  }
  const kb = (evidence && evidence.kb) || [];
  const kg = (evidence && evidence.kg) || [];
  const llm = (evidence && evidence.llm) || {};
  const directAnswer = llm.model === "FAQ直答";
  const llmOk = llm.status === "success";
  const hasEvidence = kb.length > 0 || kg.length > 0 || Boolean(llm.model || llm.error || llm.latencyMs);

  const existing = chatPanel.querySelector(".evidence-panel-inline");
  if (!hasEvidence) {
    if (existing) {
      existing.remove();
    }
    return;
  }

  const panel = ensureEvidencePanel();
  panel.innerHTML = `
    <div class="evidence-title">证据链面板</div>
    <div class="evidence-meta"></div>
    <div class="evidence-grid">
      <div>
        <h3>文本证据（RAG）</h3>
        <div class="evidence-list kb-evidence-list"></div>
      </div>
      ${directAnswer ? "" : `
      <div>
        <h3>图谱证据（Cypher）</h3>
        <div class="evidence-list kg-evidence-list"></div>
      </div>`}
    </div>
  `;

  const evidenceMeta = panel.querySelector(".evidence-meta");
  const kbEvidenceList = panel.querySelector(".kb-evidence-list");
  const kgEvidenceList = panel.querySelector(".kg-evidence-list");

  if (!evidenceMeta || !kbEvidenceList) {
    return;
  }

  evidenceMeta.textContent = directAnswer
    ? `模型：${llm.model || "-"} | 直接命中问答对，未展示图谱印证 | 耗时：${llm.latencyMs || 0}ms`
    : `模型：${llm.model || "-"} | LLM调用：${llmOk ? "成功" : (llm.status === "fallback" ? "已回退(已改用证据生成答案)" : "失败(接口异常)")} | 耗时：${llm.latencyMs || 0}ms${llm.error ? ` | 提示：${llm.error}` : ""}`;

  kbEvidenceList.innerHTML = kb.length
    ? kb
        .map(
          (it, idx) =>
            `<div class="evidence-item"><div class="ev-title">${idx + 1}. ${escapeHtml(it.title)}（score=${it.score}）</div><div>${escapeHtml(it.text)}</div></div>`
        )
        .join("")
    : "<div class='evidence-item'>无文本证据命中</div>";

  if (kgEvidenceList) {
    kgEvidenceList.innerHTML = kg.length
      ? kg
          .map(
            (it) => `<div class="evidence-item">(${escapeHtml(it.head)})-[${escapeHtml(it.rel)}]->(${escapeHtml(it.tail)})</div>`
          )
          .join("")
      : "<div class='evidence-item'>无图谱三元组命中</div>";
  }

  chatPanel.appendChild(panel);
}

async function loadModels() {
  try {
    const res = await fetch("/api/models");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    modelSelect.innerHTML = "";

    const models = data.models && data.models.length > 0 ? data.models : [data.default || "qwen3:4b"];
    models.forEach((name) => {
      const op = document.createElement("option");
      op.value = name;
      const fast = /:1b|:2b|:4b|:7b|:8b/i.test(name);
      op.textContent = name === data.recommended ? `${name} (推荐)` : fast ? `${name} (推荐快)` : name;
      modelSelect.appendChild(op);
    });
    modelSelect.value = models.includes(data.default)
      ? data.default
      : (data.recommended && models.includes(data.recommended) ? data.recommended : models[0]);
  } catch (e) {
    modelSelect.innerHTML = "<option value='qwen3:4b'>qwen3:4b</option>";
  }
}

async function loadFaqs() {
  const res = await fetch("/api/faqs?count=3");
  if (res.status === 401) {
    window.location.href = "/login";
    return;
  }
  const data = await res.json();
  faqList.innerHTML = "";
  data.faqs.forEach((q) => {
    const card = document.createElement("button");
    card.className = "faq-item";
    card.textContent = q;
    card.addEventListener("click", () => {
      sendMessage(q);
    });
    faqList.appendChild(card);
  });
}

function updateImagePreview() {
  if (!selectedImage) {
    imagePreview.classList.add("hidden");
    imagePreview.innerHTML = "";
    return;
  }

  imagePreview.classList.remove("hidden");
  imagePreview.innerHTML = `
    <img src="${selectedImage.dataUrl}" alt="preview" />
    <span>已选择图片：${selectedImage.name}</span>
  `;
}

async function diagnoseTimeseries() {
  if (!diagnoseFile || !diagnoseResult) {
    return;
  }
  const file = diagnoseFile.files && diagnoseFile.files[0];
  if (!file) {
    diagnoseResult.textContent = "请先选择 CSV 或 TXT 文件。";
    return;
  }
  diagnoseResult.textContent = "正在解析并诊断，请稍候...";
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch("/api/diagnose", { method: "POST", body: formData });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      diagnoseResult.textContent = data.error || "诊断失败。";
      return;
    }
    diagnoseResult.textContent = data.summary || "诊断完成。";
    appendMessage("bot", data.summary || "诊断完成。", []);
    addSessionMessage("bot", data.summary || "诊断完成。", [], null);
  } catch (e) {
    diagnoseResult.textContent = "诊断请求失败，请稍后重试。";
  }
}

async function sendMessage(prefill = "") {
  return sendMessageWithOptions(prefill, {});
}

function resolveTimeoutMs(text, options = {}) {
  if (options.timeoutMs && Number.isFinite(options.timeoutMs)) {
    return options.timeoutMs;
  }
  const modelName = (modelSelect?.value || "").toLowerCase();
  const isCitation = !!(pendingCitation && pendingCitation.label);
  const isGraphAuto = options.source === "kg-auto";
  const isSlowModel = modelName.includes("deepseek-r1") || modelName.includes("gemma");
  if (isCitation) {
    return CITATION_REQUEST_TIMEOUT_MS;
  }
  if (isGraphAuto) {
    return GRAPH_AUTO_REQUEST_TIMEOUT_MS;
  }
  if (isSlowModel) {
    return SLOW_MODEL_REQUEST_TIMEOUT_MS;
  }
  return CHAT_REQUEST_TIMEOUT_MS;
}

async function sendMessageWithOptions(prefill = "", options = {}) {
  const text = (prefill || messageInput.value).trim();
  if (!text && !selectedImage) {
    return;
  }

  let userText = text || `【图片】${selectedImage.name}`;
  if (pendingCitation && pendingCitation.label && text) {
    userText = `「引用：${pendingCitation.label}」\n${text}`;
  }

  appendMessage("user", userText);
  addSessionMessage("user", userText);

  const activeCitation = options.graphNode
    ? { label: options.graphNode, triplets: Array.isArray(options.graphTriplets) ? options.graphTriplets : [] }
    : pendingCitation;

  const payload = {
    message: text,
    imageName: selectedImage ? selectedImage.name : "",
    model: options.model || modelSelect.value,
    source: options.source || "manual",
    requestMode: options.requestMode || "normal",
    graphNode: activeCitation?.label || "",
    graphTriplets: Array.isArray(activeCitation?.triplets) ? activeCitation.triplets : [],
  };

  messageInput.value = "";
  selectedImage = null;
  updateImagePreview();

  const loadingNode = document.createElement("div");
  loadingNode.textContent = "正在调用模型，请稍候...";
  appendMessageNode("bot", loadingNode, []);

  try {
    const timeoutMs = resolveTimeoutMs(text, options);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    clearTimeout(timer);

    const data = await res.json();
    loadingNode.remove();
    if (data.evidence && data.evidence.llm && data.evidence.llm.model === "FAQ直答") {
      appendMessage("bot", data.answer, data.sources || []);
      addSessionMessage("bot", data.answer, data.sources || [], data.evidence || {});
      renderEvidence(data.evidence || {});
      loadStatus();
      return;
    }
    appendMessage("bot", data.answer, data.sources || []);
    addSessionMessage("bot", data.answer, data.sources || [], data.evidence || {});
    renderEvidence(data.evidence || {});
    loadStatus();
  } catch (err) {
    loadingNode.remove();
    const msg = err && err.name === "AbortError"
      ? "等待超时。系统已限制在3分钟内返回；请重试或更换更短问题。"
      : "请求失败，请检查服务是否正常启动。";
    appendMessage("bot", msg, []);
    addSessionMessage("bot", msg, [], null);
  }
}

function buildNodeAdjacency(edges) {
  const map = new Map();
  (edges || []).forEach((e) => {
    if (!map.has(e.from)) map.set(e.from, new Set());
    if (!map.has(e.to)) map.set(e.to, new Set());
    map.get(e.from).add(e.to);
    map.get(e.to).add(e.from);
  });
  return map;
}

function collectBranchNodes(centerId, adjacency, depth = 2) {
  const visited = new Set([centerId]);
  let frontier = new Set([centerId]);
  for (let i = 0; i < depth; i += 1) {
    const next = new Set();
    frontier.forEach((nodeId) => {
      const links = adjacency.get(nodeId) || new Set();
      links.forEach((v) => {
        if (!visited.has(v)) {
          visited.add(v);
          next.add(v);
        }
      });
    });
    frontier = next;
    if (frontier.size === 0) {
      break;
    }
  }
  return visited;
}

function applyGraphFocus(centerId) {
  if (!graphNodesDataSet || !graphEdgesDataSet) {
    return;
  }
  const adjacency = buildNodeAdjacency(graphEdgesCache);
  const branchNodes = collectBranchNodes(centerId, adjacency, 2);

  const nodeUpdates = graphNodesCache.map((n) => {
    const isOnBranch = branchNodes.has(n.id);
    if (n.id === centerId) {
      return {
        id: n.id,
        color: {
          background: "#4c75ff",
          border: "#3558d8",
          highlight: { background: "#4c75ff", border: "#3558d8" },
        },
        font: { color: "#ffffff", size: 12 },
      };
    }
    if (isOnBranch) {
      return {
        id: n.id,
        color: {
          background: "#e5edff",
          border: "#9cb5f4",
          highlight: { background: "#e5edff", border: "#9cb5f4" },
        },
        font: { color: "#233a66", size: 12 },
      };
    }
    return {
      id: n.id,
      color: {
        background: "#eeeeee",
        border: "#cfcfcf",
        highlight: { background: "#eeeeee", border: "#cfcfcf" },
      },
      font: { color: "#9a9a9a", size: 11 },
    };
  });

  const edgeUpdates = graphEdgesCache.map((e) => {
    const keep = branchNodes.has(e.from) && branchNodes.has(e.to);
    return {
      id: e.id,
      color: { color: keep ? "#6b87cc" : "#d8d8d8" },
      font: { color: keep ? "#3b4b6f" : "#c4c4c4" },
      width: keep ? 1.6 : 1,
    };
  });

  graphNodesDataSet.update(nodeUpdates);
  graphEdgesDataSet.update(edgeUpdates);
}

function resetGraphFocus() {
  if (!graphNodesDataSet || !graphEdgesDataSet) {
    return;
  }
  graphNodesDataSet.update(
    graphNodesCache.map((n) => ({
      id: n.id,
      color: {
        background: "#dce6ff",
        border: "#8fa8e3",
        highlight: { background: "#dce6ff", border: "#8fa8e3" },
      },
      font: { color: "#1e2b49", size: 12 },
    }))
  );
  graphEdgesDataSet.update(
    graphEdgesCache.map((e) => ({
      id: e.id,
      color: { color: "#9aabcf" },
      font: { color: "#3b4b6f" },
      width: 1,
    }))
  );
}

function normalizeText(s) {
  return String(s || "").trim().toLowerCase();
}

function applyTripletSearchHighlight(rows, keyword) {
  if (!graphNodesDataSet || !graphEdgesDataSet) {
    return;
  }
  const kw = normalizeText(keyword);
  const nodeLabelById = new Map(graphNodesCache.map((n) => [n.id, String(n.label || "")]));
  const rowsNorm = (rows || []).map((t) => ({
    head: normalizeText(t.head),
    rel: normalizeText(t.rel),
    tail: normalizeText(t.tail),
  }));

  const matchedNodeIds = new Set();
  graphNodesCache.forEach((n) => {
    const labelNorm = normalizeText(n.label);
    const hitByKw = kw && labelNorm.includes(kw);
    const hitByRow = rowsNorm.some((r) => labelNorm === r.head || labelNorm === r.tail);
    if (hitByKw || hitByRow) {
      matchedNodeIds.add(n.id);
    }
  });

  const matchedEdgeIds = new Set();
  graphEdgesCache.forEach((e) => {
    const fromLabel = normalizeText(nodeLabelById.get(e.from));
    const toLabel = normalizeText(nodeLabelById.get(e.to));
    const rel = normalizeText(e.label || e.rel || "");
    const hitByKw = Boolean(kw && (fromLabel.includes(kw) || toLabel.includes(kw) || rel.includes(kw)));
    const hitByRow = rowsNorm.some((r) => {
      const nodeMatch = fromLabel === r.head && toLabel === r.tail;
      if (!nodeMatch) {
        return false;
      }
      return !r.rel || rel.includes(r.rel);
    });
    if (hitByKw || hitByRow) {
      matchedEdgeIds.add(e.id);
      matchedNodeIds.add(e.from);
      matchedNodeIds.add(e.to);
    }
  });

  graphNodesDataSet.update(
    graphNodesCache.map((n) => {
      if (matchedNodeIds.has(n.id)) {
        return {
          id: n.id,
          color: {
            background: "#4c75ff",
            border: "#3558d8",
            highlight: { background: "#4c75ff", border: "#3558d8" },
          },
          font: { color: "#ffffff", size: 12 },
        };
      }
      return {
        id: n.id,
        color: {
          background: "#edf1f8",
          border: "#cfd8ea",
          highlight: { background: "#edf1f8", border: "#cfd8ea" },
        },
        font: { color: "#8090ad", size: 11 },
      };
    })
  );

  graphEdgesDataSet.update(
    graphEdgesCache.map((e) => ({
      id: e.id,
      color: { color: matchedEdgeIds.has(e.id) ? "#3558d8" : "#d3dbe9" },
      font: { color: matchedEdgeIds.has(e.id) ? "#2f4270" : "#b1bdd5" },
      width: matchedEdgeIds.has(e.id) ? 2.2 : 1,
    }))
  );

  if (graphNetwork && matchedNodeIds.size > 0) {
    graphNetwork.fit({
      nodes: Array.from(matchedNodeIds),
      animation: { duration: 260, easingFunction: "easeInOutQuad" },
    });
  }
}

function pinActionToNode(nodeId) {
  if (!graphHoverAction || !graphCanvas || !graphNetwork) {
    return;
  }
  const positions = graphNetwork.getPositions([nodeId]);
  const pos = positions && positions[nodeId];
  if (!pos) {
    return;
  }
  const dom = graphNetwork.canvasToDOM(pos);
  if (!graphHoverAction || !graphCanvas) {
    return;
  }
  const maxX = graphCanvas.clientWidth - 88;
  const maxY = graphCanvas.clientHeight - 42;
  const left = Math.max(8, Math.min(maxX, (dom?.x || 0) + 14));
  const top = Math.max(8, Math.min(maxY, (dom?.y || 0) + 10));
  graphHoverAction.style.left = `${left}px`;
  graphHoverAction.style.top = `${top}px`;
  graphHoverAction.classList.remove("hidden");
}

function hideHoverAction() {
  graphHoverAction?.classList.add("hidden");
  graphHoverAction.textContent = "双击查看详情";
}

function scaleGraph(factor) {
  if (!graphNetwork) {
    return;
  }
  const scale = graphNetwork.getScale();
  const target = Math.max(0.2, Math.min(3.5, scale * factor));
  graphNetwork.moveTo({ scale: target, animation: { duration: 220, easingFunction: "easeInOutQuad" } });
}

function pinNodeForDetail(nodeId) {
  pinnedNodeId = nodeId;
  applyGraphFocus(nodeId);
  pinActionToNode(nodeId);
}

function unpinNodeDetail() {
  pinnedNodeId = null;
  hideHoverAction();
  resetGraphFocus();
}

function renderNodeDetail(nodeLabel, nodePayload) {
  if (!nodeDetailModal || !nodeDetailBody || !nodeDetailTitle) {
    return;
  }
  const cards = Array.isArray(nodePayload?.csvDetails) ? nodePayload.csvDetails : [];
  const triplets = Array.isArray(nodePayload?.triplets) ? nodePayload.triplets : [];
  nodeDetailTitle.textContent = `节点详情：${nodeLabel || "未知节点"}`;

  const cardHtml = cards.length
    ? cards
        .map(
          (card, idx) => `
        <article class="node-detail-card">
          <h4>${idx + 1}. ${escapeHtml(card.title || nodeLabel)}</h4>
          <div class="node-detail-meta">来源：${escapeHtml(card.source || "csv")} | 匹配分：${Number(card.score || 0).toFixed(3)}</div>
          <ul class="node-detail-list">${(card.points || []).map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        </article>`,
        )
        .join("")
    : `<article class="node-detail-card"><h4>未命中 CSV 详情</h4><div class="node-detail-meta">可检查节点命名与 CSV 行名称是否一致</div></article>`;

  const tripletHtml = triplets.length
    ? `
      <article class="node-detail-card">
        <h4>图谱关系</h4>
        <ul class="node-detail-list">
          ${triplets.slice(0, 8).map((t) => `<li>(${escapeHtml(t.head)})-[${escapeHtml(t.rel)}]->(${escapeHtml(t.tail)})</li>`).join("")}
        </ul>
      </article>`
    : "";

  nodeDetailBody.innerHTML = cardHtml + tripletHtml;
  nodeDetailModal.classList.remove("hidden");
}

async function openNodeDetail(nodeId, fallbackLabel = "") {
  if (nodeId === undefined || nodeId === null) {
    return;
  }
  const label = (fallbackLabel || "").trim();
  try {
    const resp = await fetch(`/api/kg/node?id=${nodeId}&label=${encodeURIComponent(label)}`);
    const data = await resp.json();
    renderNodeDetail(data.nodeLabel || label, data || {});
  } catch (e) {
    renderNodeDetail(label || String(nodeId), { csvDetails: [], triplets: [] });
  }
}

async function citeNodeById(nodeId) {
  const selectedNode = graphNodesCache.find((n) => n.id === nodeId);
  const label = selectedNode ? selectedNode.label : String(nodeId);
  let triples = [];

  try {
    const resp = await fetch(`/api/kg/node?id=${nodeId}&label=${encodeURIComponent(label)}`);
    if (resp.status === 401) {
      window.location.href = "/login";
      return;
    }
    const nodeData = await resp.json();
    triples = nodeData.triplets || [];
    tripletList.innerHTML = triples.length
      ? triples.map((t) => `<div class="triplet-item">(${escapeHtml(t.head)})-[${escapeHtml(t.rel)}]->(${escapeHtml(t.tail)})</div>`).join("")
      : "该节点暂无邻接关系。";
  } catch (e) {
    tripletList.textContent = "节点关系加载失败。";
  }

  switchModule("qaModule");
  setCitation({ label, triplets: triples });
  messageInput.focus();
  messageInput.placeholder = `已引用节点“${label}”，请输入你的问题...`;
  appendMessage("bot", `已引用图谱节点“${label}”。请输入你的问题，我会优先结合该节点与CSV证据回答。`, []);
  addSessionMessage("bot", `已引用图谱节点“${label}”。请输入你的问题，我会优先结合该节点与CSV证据回答。`, []);
}

function initVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.disabled = true;
    voiceBtn.title = "当前浏览器不支持语音输入";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.interimResults = false;
  recognition.continuous = false;
  voiceBtn.title = "点击开始语音输入，再点一次可停止";

  recognition.onstart = () => {
    isVoiceListening = true;
    voiceBtn.classList.add("listening");
  };

  recognition.onend = () => {
    isVoiceListening = false;
    voiceBtn.classList.remove("listening");
  };

  recognition.onerror = (event) => {
    const errorType = event?.error || "unknown";
    appendMessage("bot", `语音输入不可用：${errorType}。请检查麦克风权限或改用键盘输入。`, []);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript || "";
    messageInput.value = transcript;
    messageInput.focus();
  };
}

async function loadGraph() {
  try {
    const res = await fetch("/api/kg/graph?limit=150");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();

    if (!data.nodes || data.nodes.length === 0) {
      graphCanvas.textContent = `当前未从 Neo4j 读取到关系数据。${data.error || "请先检查数据库连接与图谱内容。"}`;
      return;
    }

    graphNodesCache = (data.nodes || []).map((n) => ({ ...n, title: "查看详情" }));
    graphEdgesCache = (data.edges || []).map((e, idx) => ({ ...e, id: e.id || `e_${idx}` }));
    graphNodesDataSet = new vis.DataSet(graphNodesCache);
    graphEdgesDataSet = new vis.DataSet(graphEdgesCache);
    const dataset = {
      nodes: graphNodesDataSet,
      edges: graphEdgesDataSet,
    };
    const options = {
      physics: {
        stabilization: true,
        barnesHut: { springLength: 130 },
      },
      edges: {
        arrows: "to",
        font: { size: 10, color: "#3b4b6f" },
        color: { color: "#9aabcf" },
      },
      nodes: {
        shape: "dot",
        size: 14,
        color: {
          background: "#dce6ff",
          border: "#8fa8e3",
          highlight: { background: "#dce6ff", border: "#8fa8e3" },
        },
        font: { color: "#1e2b49", size: 12 },
      },
      interaction: {
        hover: true,
      },
    };

    graphCanvas.innerHTML = "";
    graphNetwork = new vis.Network(graphCanvas, dataset, options);

    graphNetwork.on("hoverNode", (params) => {
      if (pinnedNodeId !== null && pinnedNodeId !== undefined) {
        return;
      }
      applyGraphFocus(params.node);
    });

    graphNetwork.on("blurNode", () => {
      if (pinnedNodeId !== null && pinnedNodeId !== undefined) {
        return;
      }
      resetGraphFocus();
    });

    graphNetwork.on("selectNode", (params) => {
      const selectedId = params.nodes && params.nodes[0];
      if (selectedId === undefined) {
        return;
      }
      pinNodeForDetail(selectedId);
    });

    graphNetwork.on("doubleClick", async (params) => {
      const selectedId = params.nodes && params.nodes[0];
      if (selectedId === undefined) {
        return;
      }
      await citeNodeById(selectedId);
    });

    graphNetwork.on("deselectNode", () => {
      unpinNodeDetail();
    });

    graphNetwork.on("zoom", () => {
      if (pinnedNodeId !== null && pinnedNodeId !== undefined) {
        pinActionToNode(pinnedNodeId);
      }
    });

    graphNetwork.on("dragEnd", () => {
      if (pinnedNodeId !== null && pinnedNodeId !== undefined) {
        pinActionToNode(pinnedNodeId);
      }
    });

    resetGraphFocus();
  } catch (e) {
    graphCanvas.textContent = "图谱加载失败，请检查后端服务或 Neo4j 连接状态。";
  }
}

async function searchTriplets() {
  const kw = (kgKeyword.value || "").trim();
  if (!kw) {
    tripletList.textContent = "请输入关键词后检索。";
    if (pinnedNodeId === null || pinnedNodeId === undefined) {
      resetGraphFocus();
    }
    return;
  }
  try {
    const res = await fetch(`/api/kg/search?keyword=${encodeURIComponent(kw)}`);
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    const rows = data.triplets || [];
    if (rows.length === 0) {
      tripletList.textContent = `未检索到相关三元组。${data.error ? ` 错误：${data.error}` : ""}`;
      if (pinnedNodeId === null || pinnedNodeId === undefined) {
        resetGraphFocus();
      }
      return;
    }
    tripletList.innerHTML = rows
      .map((t) => `<div class="triplet-item hit">(${escapeHtml(t.head)})-[${escapeHtml(t.rel)}]->(${escapeHtml(t.tail)})</div>`)
      .join("");
    tripletList.scrollTop = 0;
    tripletList.scrollIntoView({ block: "nearest", behavior: "smooth" });
    pinnedNodeId = null;
    hideHoverAction();
    applyTripletSearchHighlight(rows, kw);
  } catch (e) {
    tripletList.textContent = "检索失败，请检查 Neo4j 连接。";
  }
}

async function connectNeo4j() {
  const payload = {
    uri: (neo4jUri.value || "").trim(),
    user: (neo4jUser.value || "").trim(),
    password: (neo4jPassword.value || "").trim(),
    database: (neo4jDatabase.value || "").trim(),
  };
  try {
    const res = await fetch("/api/neo4j/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (data.ok) {
      neo4jPassword.value = "";
      await loadStatus();
      await loadGraph();
    } else {
      appendMessage("bot", `Neo4j连接失败：${data.error || "未知错误"}`, []);
    }
  } catch (e) {
    appendMessage("bot", "Neo4j连接失败：后端接口不可用。", []);
  }
}

newChatBtn?.addEventListener("click", () => createNewSession(true));

moduleTabs.forEach((tab) => {
  tab.addEventListener("click", () => switchModule(tab.dataset.target));
});

refreshFaqBtn?.addEventListener("click", loadFaqs);
sendBtn?.addEventListener("click", () => sendMessage());

messageInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

voiceBtn?.addEventListener("click", () => {
  if (recognition) {
    try {
      if (isVoiceListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } catch (e) {
      appendMessage("bot", "语音启动失败，请检查浏览器麦克风权限或使用 HTTPS 页面。", []);
    }
  }
});

imageInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    selectedImage = {
      name: file.name,
      dataUrl: reader.result,
    };
    updateImagePreview();
  };
  reader.readAsDataURL(file);
});

kgSearchBtn?.addEventListener("click", searchTriplets);
kgReloadBtn?.addEventListener("click", loadGraph);
tripletList?.addEventListener("click", (e) => {
  const item = e.target && e.target.closest ? e.target.closest(".triplet-item") : null;
  if (!item || !item.textContent) {
    return;
  }
  const text = item.textContent;
  const headMatch = text.match(/^\((.*?)\)-\[/);
  const head = (headMatch?.[1] || "").trim();
  if (!head) {
    return;
  }
  const node = graphNodesCache.find((n) => normalizeText(n.label) === normalizeText(head));
  if (node && graphNetwork) {
    graphNetwork.focus(node.id, { scale: 1.1, animation: { duration: 240, easingFunction: "easeInOutQuad" } });
    pinNodeForDetail(node.id);
  }
});
graphHoverAction?.addEventListener("click", async () => {
  if (pinnedNodeId === null || pinnedNodeId === undefined) {
    return;
  }
  const node = graphNodesCache.find((n) => n.id === pinnedNodeId);
  if (node) {
    pinNodeForDetail(node.id);
    graphHoverAction.textContent = "双击查看详情";
  }
});

graphHoverAction?.addEventListener("dblclick", async () => {
  if (pinnedNodeId === null || pinnedNodeId === undefined) {
    return;
  }
  const node = graphNodesCache.find((n) => n.id === pinnedNodeId);
  await openNodeDetail(pinnedNodeId, node?.label || String(pinnedNodeId));
});
graphZoomInBtn?.addEventListener("click", () => scaleGraph(1.2));
graphZoomOutBtn?.addEventListener("click", () => scaleGraph(1 / 1.2));
nodeDetailCloseBtn?.addEventListener("click", () => nodeDetailModal?.classList.add("hidden"));
nodeDetailShrinkBtn?.addEventListener("click", () => resizeNodeDetailModal(-80, -70));
nodeDetailGrowBtn?.addEventListener("click", () => resizeNodeDetailModal(80, 70));
neo4jConnectBtn?.addEventListener("click", connectNeo4j);
diagnoseBtn?.addEventListener("click", diagnoseTimeseries);
kgKeyword?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchTriplets();
  }
});

loadSessions();
renderHistory();
renderCurrentSession();

const cur = getCurrentSession();
if (!cur || cur.messages.length === 0) {
  const greet = "你好，我是你的工业故障问答助手。现在可同时结合文本知识库、Neo4j知识图谱和qwen模型回答问题。";
  appendMessage("bot", greet, []);
  addSessionMessage("bot", greet, []);
}

initVoice();
loadStatus();
loadModels();
loadFaqs();
renderCitation();
initLayoutResizer();
switchModule("qaModule");
