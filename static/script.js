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
const kgModuleEl = document.getElementById("kgModule");
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
const kgUploadBtn = document.getElementById("kgUploadBtn");
const kgUploadInput = document.getElementById("kgUploadInput");
const kgCategoryFilter = document.getElementById("kgCategoryFilter");
const kgSearchInput = document.getElementById("kgSearchInput");
const kgSearchBtnManage = document.getElementById("kgSearchBtnManage");
const kgResetBtnManage = document.getElementById("kgResetBtnManage");
const kgManageMeta = document.getElementById("kgManageMeta");
const kgManageListWrap = document.getElementById("kgManageListWrap");
const kgManageDetailBlock = document.getElementById("kgManageDetailBlock");
const kgManageDetailTitle = document.getElementById("kgManageDetailTitle");
const kgManagePagination = document.getElementById("kgManagePagination");
const kgManageTableWrap = document.getElementById("kgManageTableWrap");
const consoleUserTotal = document.getElementById("consoleUserTotal");
const consoleNodeTotal = document.getElementById("consoleNodeTotal");
const consoleCaseTotal = document.getElementById("consoleCaseTotal");
const consoleTop10List = document.getElementById("consoleTop10List");
const consoleFreqDonut = document.getElementById("consoleFreqDonut");
const consoleFreqLegend = document.getElementById("consoleFreqLegend");
const caseModuleMeta = document.getElementById("caseModuleMeta");
const caseModuleTableWrap = document.getElementById("caseModuleTableWrap");
const casePagination = document.getElementById("casePagination");
const caseAddBtn = document.getElementById("caseAddBtn");
const caseSearchInput = document.getElementById("caseSearchInput");
const caseSearchBtn = document.getElementById("caseSearchBtn");
const caseResetBtn = document.getElementById("caseResetBtn");
const caseSourceFilter = document.getElementById("caseSourceFilter");
const caseEditModal = document.getElementById("caseEditModal");
const caseModalTitle = document.getElementById("caseModalTitle");
const caseModalCloseBtn = document.getElementById("caseModalCloseBtn");
const caseManualTabBtn = document.getElementById("caseManualTabBtn");
const caseImportTabBtn = document.getElementById("caseImportTabBtn");
const caseManualPane = document.getElementById("caseManualPane");
const caseImportPane = document.getElementById("caseImportPane");
const caseFaultInput = document.getElementById("caseFaultInput");
const caseRelationInput = document.getElementById("caseRelationInput");
const caseConsequenceInput = document.getElementById("caseConsequenceInput");
const caseSourceInput = document.getElementById("caseSourceInput");
const caseImportFileInput = document.getElementById("caseImportFileInput");
const caseImportModeSelect = document.getElementById("caseImportModeSelect");
const caseImportStartInput = document.getElementById("caseImportStartInput");
const caseImportEndInput = document.getElementById("caseImportEndInput");
const caseModalSaveBtn = document.getElementById("caseModalSaveBtn");
const caseModalMessage = document.getElementById("caseModalMessage");
const profileAvatarPreview = document.getElementById("profileAvatarPreview");
const profileAvatarInput = document.getElementById("profileAvatarInput");
const profileUsernameInput = document.getElementById("profileUsernameInput");
const profilePhoneInput = document.getElementById("profilePhoneInput");
const profileEmailInput = document.getElementById("profileEmailInput");
const profileRoleInput = document.getElementById("profileRoleInput");
const profileStatusInput = document.getElementById("profileStatusInput");
const profileSaveBtn = document.getElementById("profileSaveBtn");
const profileMessage = document.getElementById("profileMessage");
const profileOldPwdInput = document.getElementById("profileOldPwdInput");
const profileNewPwdInput = document.getElementById("profileNewPwdInput");
const profileConfirmPwdInput = document.getElementById("profileConfirmPwdInput");
const profilePwdBtn = document.getElementById("profilePwdBtn");
const profilePwdMessage = document.getElementById("profilePwdMessage");
const diagDatasetCards = document.getElementById("diagDatasetCards");
const diagModelButtons = document.getElementById("diagModelButtons");
const diagModelTip = document.getElementById("diagModelTip");
const diagFileSelect = document.getElementById("diagFileSelect");
const diagFileMeta = document.getElementById("diagFileMeta");
const diagRunBtn = document.getElementById("diagRunBtn");
const diagResultEmpty = document.getElementById("diagResultEmpty");
const diagResultGrid = document.getElementById("diagResultGrid");
const diagConclusionMain = document.getElementById("diagConclusionMain");
const diagConclusionIndex = document.getElementById("diagConclusionIndex");
const diagConfidenceBar = document.getElementById("diagConfidenceBar");
const diagConfidenceText = document.getElementById("diagConfidenceText");
const diagDetailList = document.getElementById("diagDetailList");
const diagWaveCanvas = document.getElementById("diagWaveCanvas");
const diagFftCanvas = document.getElementById("diagFftCanvas");
const diagCustomTip = document.getElementById("diagCustomTip");
const diagBackendStatus = document.getElementById("diagBackendStatus");
const diagSaveDecisionBtn = document.getElementById("diagSaveDecisionBtn");
const diagSaveDecisionMsg = document.getElementById("diagSaveDecisionMsg");
const decisionFaultInput = document.getElementById("decisionFaultInput");
const decisionConfidenceInput = document.getElementById("decisionConfidenceInput");
const decisionGenerateBtn = document.getElementById("decisionGenerateBtn");
const decisionSearchInput = document.getElementById("decisionSearchInput");
const decisionSearchBtn = document.getElementById("decisionSearchBtn");
const decisionResetBtn = document.getElementById("decisionResetBtn");
const decisionModuleMeta = document.getElementById("decisionModuleMeta");
const decisionMessage = document.getElementById("decisionMessage");
const decisionTableWrap = document.getElementById("decisionTableWrap");
const decisionPagination = document.getElementById("decisionPagination");

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
let graphAutoRetryTimer = null;
let graphAutoRetryCount = 0;
let isVoiceListening = false;
const diagState = {
  initialized: false,
  dataset: "",
  model: "",
  filePath: "",
  filesByDataset: {},
  optionsLoaded: false,
  diagnosticLocked: false,
  lastSignal: [],
  lastFft: [],
  lastResultLabel: "",
  lastInference: null,
};
const caseState = {
  page: 1,
  pageSize: 10,
  total: 0,
  pages: 1,
  keyword: "",
  source: "",
  editId: null,
  modalMode: "manual",
  sourceOptions: [],
};
const kbManageState = {
  page: 1,
  pageSize: 10,
  total: 0,
  pages: 1,
  keyword: "",
  category: "all",
  categoryOptions: [],
  selectedFile: "",
};
const decisionState = {
  page: 1,
  pageSize: 10,
  total: 0,
  pages: 1,
  keyword: "",
};
let DIAG_MODEL_TIPS = {
  cnn: "专为一维时序振动信号设计，通过浅层卷积快速提取局部时域特征，适合数据量中等、追求轻量化快速推理的轴承故障诊断。",
  wdcnn: "基于小波变换与深度 1D-CNN 结合的网络，能在强噪声下自适应提取轴承故障的时频特征，对 CWRU、JNU 等含噪实测数据鲁棒性更强。",
  "cnn-lstm": "先用 CNN 提取空间局部特征，再用 LSTM 捕捉时序依赖关系，适合长序列轴承振动信号，能更好建模故障随时间演变的动态模式。",
  "cnn-transformer": "以 CNN 做局部特征提取、Transformer 建模全局时序依赖，擅长捕捉长距离故障相关特征，在复杂变工况、多故障耦合轴承数据上表现更稳定。",
};

const CHAT_REQUEST_TIMEOUT_MS = 180000;
const GRAPH_AUTO_REQUEST_TIMEOUT_MS = 240000;
const SLOW_MODEL_REQUEST_TIMEOUT_MS = 180000;
const CITATION_REQUEST_TIMEOUT_MS = 220000;
const isAdminUser = (document.body?.dataset?.isAdmin || "0") === "1";

function getChatStorageKey() {
  const username = (document.body?.dataset?.username || "guest").trim() || "guest";
  return `industrial_qa_history_v1_${username}`;
}

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

function scheduleGraphAutoRetry() {
  if (graphAutoRetryTimer) {
    return;
  }
  const delayMs = Math.min(12000, 2000 * (graphAutoRetryCount + 1));
  graphAutoRetryTimer = window.setTimeout(async () => {
    graphAutoRetryTimer = null;
    graphAutoRetryCount += 1;
    await loadStatus();
    await loadGraph();
  }, delayMs);
}

function clearGraphAutoRetry() {
  if (graphAutoRetryTimer) {
    window.clearTimeout(graphAutoRetryTimer);
    graphAutoRetryTimer = null;
  }
  graphAutoRetryCount = 0;
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
  } else if (targetId === "consoleModule") {
    loadAdminConsole();
  } else if (targetId === "diagModule") {
    initDiagnosisModule();
  } else if (targetId === "decisionModule") {
    loadDecisionModule();
  } else if (targetId === "homeModule") {
    const dateEl = document.getElementById("homeTodayDate");
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = `${now.getMonth() + 1}/${now.getDate()}`;
    }
  } else if (targetId === "kgManageModule") {
    loadAdminKbFiles();
  } else if (targetId === "caseModule") {
    loadAdminCaseModule();
  } else if (targetId === "profileModule") {
    loadUserProfile();
  }
}

function updateDiagRunButtonState() {
  if (!diagRunBtn) return;
  if (diagState.diagnosticLocked) {
    diagRunBtn.disabled = false;
    diagRunBtn.classList.add("ready");
    diagRunBtn.textContent = "开始下一个诊断";
    return;
  }
  const ready = Boolean(diagState.dataset && diagState.model && diagState.filePath);
  diagRunBtn.disabled = !ready;
  diagRunBtn.classList.toggle("ready", ready);
  diagRunBtn.textContent = "开始诊断";
}

function setActiveDiagButton(container, attrName, value) {
  if (!container) return;
  container.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute(attrName) === value);
  });
}

function setDiagControlsEnabled(enabled) {
  if (diagDatasetCards) {
    diagDatasetCards.querySelectorAll(".diag-card").forEach((btn) => {
      btn.disabled = !enabled;
      btn.classList.toggle("disabled", !enabled);
    });
  }
  if (diagModelButtons) {
    diagModelButtons.querySelectorAll(".diag-seg").forEach((btn) => {
      btn.disabled = !enabled;
      btn.classList.toggle("disabled", !enabled);
    });
  }
  if (diagFileSelect) {
    const canSelect = enabled && diagState.dataset && diagState.dataset !== "CUSTOM";
    diagFileSelect.disabled = !canSelect;
  }
}

function resetDiagFileSelect(text = "请先选择数据集") {
  if (!diagFileSelect) return;
  diagFileSelect.innerHTML = `<option value="">${text}</option>`;
  diagFileSelect.disabled = true;
  diagState.filePath = "";
  if (diagFileMeta) diagFileMeta.textContent = "当前未选择样本";
  updateDiagRunButtonState();
}

function createSeriesPoints(values, width, height, padding) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = padding + ((width - padding * 2) * index) / Math.max(values.length - 1, 1);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return { x, y };
  });
}

function drawDiagWave(values, label) {
  if (!diagWaveCanvas || !Array.isArray(values) || values.length === 0) return;
  const ctx = diagWaveCanvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = diagWaveCanvas.clientWidth || 720;
  const height = 260;
  diagWaveCanvas.width = width * ratio;
  diagWaveCanvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const padding = 26;
  const points = createSeriesPoints(values, width, height, padding);
  ctx.strokeStyle = "rgba(86, 124, 218, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = padding + ((height - padding * 2) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = "#4d79df";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#3f63b0";
  ctx.font = "13px 'Noto Sans SC', sans-serif";
  ctx.fillText(`振动波形 · ${label || "-"}`, 14, 18);
}

function drawDiagFFT(values, label) {
  if (!diagFftCanvas || !Array.isArray(values) || values.length === 0) return;
  const ctx = diagFftCanvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = diagFftCanvas.clientWidth || 720;
  const height = 260;
  diagFftCanvas.width = width * ratio;
  diagFftCanvas.height = height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const padding = 26;
  const max = Math.max(...values) || 1;
  const barW = (width - padding * 2) / values.length;
  ctx.strokeStyle = "rgba(86, 124, 218, 0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = padding + ((height - padding * 2) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  values.forEach((value, idx) => {
    const h = (value / max) * (height - padding * 2);
    const x = padding + idx * barW;
    const y = height - padding - h;
    ctx.fillStyle = "rgba(74, 111, 205, 0.58)";
    ctx.fillRect(x, y, Math.max(1, barW - 1), h);
  });
  ctx.fillStyle = "#3f63b0";
  ctx.font = "13px 'Noto Sans SC', sans-serif";
  ctx.fillText(`FFT 频谱 · ${label || "-"}`, 14, 18);
}

function resetDiagReportView() {
  if (diagResultEmpty) {
    diagResultEmpty.classList.remove("hidden");
    diagResultEmpty.textContent = "请选择数据集、模型和样本后开始诊断。";
  }
  if (diagResultGrid) {
    diagResultGrid.classList.add("hidden");
  }
  if (diagConclusionMain) diagConclusionMain.textContent = "-";
  if (diagConclusionIndex) diagConclusionIndex.textContent = "模型输出类别索引：-";
  if (diagConfidenceBar) diagConfidenceBar.style.width = "0%";
  if (diagConfidenceText) diagConfidenceText.textContent = "0%";
  if (diagDetailList) diagDetailList.innerHTML = "";
  if (diagWaveCanvas) {
    const ctx = diagWaveCanvas.getContext("2d");
    ctx.clearRect(0, 0, diagWaveCanvas.width, diagWaveCanvas.height);
  }
  if (diagFftCanvas) {
    const ctx = diagFftCanvas.getContext("2d");
    ctx.clearRect(0, 0, diagFftCanvas.width, diagFftCanvas.height);
  }
  diagState.lastSignal = [];
  diagState.lastFft = [];
  diagState.lastResultLabel = "";
  diagState.lastInference = null;
  if (diagSaveDecisionMsg) {
    diagSaveDecisionMsg.textContent = "未保存诊断结果";
  }
}

function renderDiagResult(result) {
  if (!diagResultEmpty || !diagResultGrid) return;
  const confidence = Number(result.confidence || 0) * 100;
  const probs = Array.isArray(result.probabilities) ? result.probabilities : [];
  const sorted = probs
    .slice()
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
    .slice(0, 3);
  const top3 = sorted
    .map((it) => `${escapeHtml(it.label)}：${(Number(it.value || 0) * 100).toFixed(2)}%`)
    .join(" | ");
  diagResultEmpty.classList.add("hidden");
  diagResultGrid.classList.remove("hidden");
  if (diagConclusionMain) diagConclusionMain.textContent = result.prediction || "未知";
  if (diagConclusionIndex) diagConclusionIndex.textContent = `模型输出类别索引：${result.predictionIndex ?? "-"}`;
  if (diagConfidenceBar) diagConfidenceBar.style.width = `${confidence.toFixed(2)}%`;
  if (diagConfidenceText) diagConfidenceText.textContent = `${confidence.toFixed(2)}%`;
  if (diagDetailList) {
    const details = [
      `所选模型：${result.modelCanonical || "-"}`,
      `所选数据源：${result.dataset || diagState.dataset || "-"}`,
      `测试样本：${result.filePath || "-"}`,
      `推断故障：${result.prediction || "-"}`,
      `类别概率分布：${top3 || "-"}`,
    ];
    diagDetailList.innerHTML = details.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }
  diagState.lastSignal = Array.isArray(result.signal) ? result.signal : [];
  diagState.lastFft = Array.isArray(result.fft) ? result.fft : [];
  diagState.lastResultLabel = result.prediction || "-";
  diagState.lastInference = { ...result };
  if (diagSaveDecisionMsg) {
    diagSaveDecisionMsg.textContent = "可将当前诊断结果保存到智能决策";
  }
  drawDiagWave(diagState.lastSignal, diagState.lastResultLabel);
  drawDiagFFT(diagState.lastFft, diagState.lastResultLabel);
}

function resetForNextDiagnosis() {
  diagState.dataset = "";
  diagState.model = "";
  diagState.filePath = "";
  diagState.diagnosticLocked = false;
  setActiveDiagButton(diagDatasetCards, "data-dataset", "");
  setActiveDiagButton(diagModelButtons, "data-model", "");
  if (diagModelTip) {
    diagModelTip.textContent = "将鼠标悬停在模型按钮上查看特点。";
  }
  if (diagCustomTip) {
    diagCustomTip.classList.add("hidden");
  }
  resetDiagFileSelect("请先选择数据集");
  resetDiagReportView();
  setDiagControlsEnabled(true);
  if (diagBackendStatus) {
    diagBackendStatus.textContent = "推理状态：待机";
  }
  updateDiagRunButtonState();
}

async function loadDiagFiles(dataset) {
  if (!diagFileSelect) return;
  if (diagState.filesByDataset[dataset]) {
    const cached = diagState.filesByDataset[dataset];
    diagFileSelect.innerHTML = `<option value="">请选择样本文件</option>${cached
      .map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`)
      .join("")}`;
    diagFileSelect.disabled = false;
    return;
  }
  diagFileSelect.innerHTML = "<option value=''>正在加载样本...</option>";
  diagFileSelect.disabled = true;
  const res = await fetch(`/api/diag/files?dataset=${encodeURIComponent(dataset)}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "样本加载失败");
  }
  const files = Array.isArray(data.files) ? data.files : [];
  diagState.filesByDataset[dataset] = files;
  diagFileSelect.innerHTML = `<option value="">请选择样本文件</option>${files
    .map((f) => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`)
    .join("")}`;
  diagFileSelect.disabled = files.length === 0;
  if (!files.length && diagFileMeta) {
    diagFileMeta.textContent = "该数据集下未找到 .mat 样本";
  }
}

async function ensureDiagOptions() {
  if (diagState.optionsLoaded || !diagBackendStatus) return;
  try {
    const res = await fetch("/api/diag/options");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "加载失败");
    try {
      const tipRes = await fetch("/api/diag/model-tips");
      const tipData = await tipRes.json();
      if (tipRes.ok && tipData && tipData.tips) {
        DIAG_MODEL_TIPS = { ...DIAG_MODEL_TIPS, ...tipData.tips };
      }
    } catch (_) {}
    if (data.ready) {
      diagBackendStatus.textContent = "推理状态：就绪";
    } else {
      diagBackendStatus.textContent = `推理状态：${data.dependencyError || "依赖缺失"}`;
    }
    diagState.optionsLoaded = true;
  } catch (e) {
    diagBackendStatus.textContent = "推理状态：接口不可用";
  }
}

function initDiagnosisModule() {
  if (!diagDatasetCards || !diagModelButtons || !diagFileSelect || !diagRunBtn) return;
  ensureDiagOptions();
  if (diagState.initialized) return;
  diagState.initialized = true;

  diagDatasetCards.querySelectorAll(".diag-card").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (diagState.diagnosticLocked) return;
      const dataset = btn.getAttribute("data-dataset") || "";
      diagState.dataset = dataset;
      diagState.filePath = "";
      setActiveDiagButton(diagDatasetCards, "data-dataset", dataset);
      if (diagCustomTip) diagCustomTip.classList.toggle("hidden", dataset !== "CUSTOM");
      if (dataset === "CUSTOM") {
        resetDiagFileSelect("当前功能开发中");
        if (diagBackendStatus) diagBackendStatus.textContent = "推理状态：当前功能开发中";
        return;
      }
      if (diagBackendStatus) diagBackendStatus.textContent = "推理状态：正在加载样本列表...";
      try {
        await loadDiagFiles(dataset);
        if (diagBackendStatus) diagBackendStatus.textContent = "推理状态：就绪";
      } catch (e) {
        resetDiagFileSelect("样本加载失败");
        if (diagBackendStatus) diagBackendStatus.textContent = `推理状态：${e.message || "失败"}`;
      }
      updateDiagRunButtonState();
    });
  });

  diagModelButtons.querySelectorAll(".diag-seg").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      const model = btn.getAttribute("data-model") || "";
      if (diagModelTip) {
        diagModelTip.textContent = DIAG_MODEL_TIPS[model] || "将鼠标悬停在模型按钮上查看特点。";
      }
    });
    btn.addEventListener("mouseleave", () => {
      if (!diagModelTip) return;
      const current = diagState.model;
      diagModelTip.textContent = current ? (DIAG_MODEL_TIPS[current] || "将鼠标悬停在模型按钮上查看特点。") : "将鼠标悬停在模型按钮上查看特点。";
    });
    btn.addEventListener("click", () => {
      if (diagState.diagnosticLocked) return;
      const model = btn.getAttribute("data-model") || "";
      diagState.model = model;
      setActiveDiagButton(diagModelButtons, "data-model", model);
      if (diagModelTip) {
        diagModelTip.textContent = DIAG_MODEL_TIPS[model] || "将鼠标悬停在模型按钮上查看特点。";
      }
      updateDiagRunButtonState();
    });
  });

  diagFileSelect.addEventListener("change", () => {
    if (diagState.diagnosticLocked) return;
    diagState.filePath = diagFileSelect.value || "";
    if (diagFileMeta) {
      diagFileMeta.textContent = diagState.filePath ? `当前样本：${diagState.filePath}` : "当前未选择样本";
    }
    updateDiagRunButtonState();
  });

  diagRunBtn.addEventListener("click", async () => {
    if (diagRunBtn.disabled) return;
    if (diagState.diagnosticLocked) {
      resetForNextDiagnosis();
      return;
    }
    diagRunBtn.disabled = true;
    diagRunBtn.textContent = "诊断中...";
    if (diagBackendStatus) diagBackendStatus.textContent = "推理状态：处理中...";
    try {
      const res = await fetch("/api/diag/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset: diagState.dataset,
          model: diagState.model,
          filePath: diagState.filePath,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "推理失败");
      }
      renderDiagResult(data);
      diagState.diagnosticLocked = true;
      setDiagControlsEnabled(false);
      if (diagBackendStatus) diagBackendStatus.textContent = "推理状态：完成";
    } catch (e) {
      if (diagResultEmpty) {
        diagResultEmpty.classList.remove("hidden");
        if (diagResultGrid) {
          diagResultGrid.classList.add("hidden");
        }
        diagResultEmpty.textContent = `诊断失败：${e.message || "未知错误"}`;
      }
      if (diagBackendStatus) diagBackendStatus.textContent = "推理状态：失败";
    } finally {
      updateDiagRunButtonState();
    }
  });

  window.addEventListener("resize", () => {
    if (diagResultGrid && !diagResultGrid.classList.contains("hidden")) {
      drawDiagWave(diagState.lastSignal, diagState.lastResultLabel || "-");
      drawDiagFFT(diagState.lastFft, diagState.lastResultLabel || "-");
    }
  });

  resetDiagFileSelect("请先选择数据集");
  resetDiagReportView();
  setDiagControlsEnabled(true);
  updateDiagRunButtonState();
}

function renderAdminTable(container, columns, rows) {
  if (!container) {
    return;
  }
  if (!Array.isArray(columns) || columns.length === 0) {
    container.innerHTML = "<div class='admin-empty'>当前文件无可展示列。</div>";
    return;
  }
  const safeRows = Array.isArray(rows) ? rows : [];
  const thead = `<tr>${columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("")}</tr>`;
  const tbody = safeRows.length
    ? safeRows
        .map((row) => {
          if (Array.isArray(row)) {
            return `<tr>${columns.map((_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`).join("")}</tr>`;
          }
          return `<tr>${columns.map((c) => `<td>${escapeHtml((row && row[c]) ?? "")}</td>`).join("")}</tr>`;
        })
        .join("")
    : `<tr><td colspan="${columns.length}">暂无数据</td></tr>`;
  container.innerHTML = `<div class="admin-table-scroll"><table class="admin-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}

async function loadAdminConsole() {
  if (!consoleTop10List || !consoleFreqDonut || !consoleFreqLegend) return;
  consoleTop10List.innerHTML = "<div class='admin-empty'>正在加载统计...</div>";
  try {
    const res = await fetch("/api/admin/console");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "加载失败");
    }
    const summary = data.summary || {};
    if (consoleUserTotal) consoleUserTotal.textContent = String(summary.users ?? 0);
    if (consoleNodeTotal) consoleNodeTotal.textContent = String(summary.nodes ?? 0);
    if (consoleCaseTotal) consoleCaseTotal.textContent = String(summary.cases ?? 0);

    const top10 = Array.isArray(data.componentFaultTop10) ? data.componentFaultTop10 : [];
    if (top10.length === 0) {
      consoleTop10List.innerHTML = "<div class='admin-empty'>未获取到部件相关故障数据。</div>";
    } else {
      const maxCount = Math.max(...top10.map((item) => Number(item.count || 0)), 1);
      consoleTop10List.innerHTML = top10
        .map((item) => {
          const cnt = Number(item.count || 0);
          const width = Math.max(8, Math.round((cnt / maxCount) * 100));
          return `
            <div class="console-top-item">
              <div class="console-top-name">${escapeHtml(item.name || "-")}</div>
              <div class="console-top-bar-wrap">
                <div class="console-top-bar" style="width:${width}%"></div>
              </div>
              <div class="console-top-count">${cnt}</div>
            </div>
          `;
        })
        .join("");
    }

    const freq = Array.isArray(data.frequencyDistribution) ? data.frequencyDistribution : [];
    const total = freq.reduce((acc, item) => acc + Number(item.count || 0), 0);
    const fallbackColors = ["#ff8c8c", "#ffe27a", "#92e28f"];
    const segments = [];
    let acc = 0;
    freq.forEach((item, idx) => {
      const count = Number(item.count || 0);
      if (count <= 0 || total <= 0) return;
      const start = (acc / total) * 360;
      acc += count;
      const end = (acc / total) * 360;
      const color = item.color || fallbackColors[idx % fallbackColors.length];
      segments.push(`${color} ${start}deg ${end}deg`);
    });
    consoleFreqDonut.style.background =
      segments.length > 0 ? `conic-gradient(${segments.join(",")})` : "conic-gradient(#e7eefb 0deg 360deg)";
    consoleFreqLegend.innerHTML = freq
      .map((item, idx) => {
        const count = Number(item.count || 0);
        const color = item.color || fallbackColors[idx % fallbackColors.length];
        return `
          <div class="console-legend-item">
            <span class="console-dot" style="background:${color}"></span>
            <span>${escapeHtml(item.label || "-")}：${count}件</span>
          </div>
        `;
      })
      .join("");
  } catch (e) {
    consoleTop10List.innerHTML = `<div class='admin-empty'>${escapeHtml(e.message || "控制台加载失败。")}</div>`;
    if (consoleFreqLegend) consoleFreqLegend.innerHTML = "";
  }
}

async function loadAdminCaseModule() {
  if (!caseModuleTableWrap || !casePagination) {
    return;
  }
  caseModuleTableWrap.innerHTML = "<div class='admin-empty'>正在加载案例数据...</div>";
  try {
    const params = new URLSearchParams({
      page: String(caseState.page),
      pageSize: String(caseState.pageSize),
      keyword: caseState.keyword || "",
      source: caseState.source || "",
    });
    const res = await fetch(`/api/admin/case-records?${params.toString()}`);
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      caseModuleTableWrap.innerHTML = `<div class='admin-empty'>${escapeHtml(data.error || "加载失败")}</div>`;
      return;
    }
    const pg = data.pagination || {};
    caseState.page = Number(pg.page || 1);
    caseState.pageSize = Number(pg.pageSize || 10);
    caseState.total = Number(pg.total || 0);
    caseState.pages = Math.max(1, Number(pg.pages || 1));
    caseState.sourceOptions = Array.isArray(data.sourceOptions) ? data.sourceOptions : [];
    renderCaseSourceFilter();
    if (caseModuleMeta) {
      caseModuleMeta.textContent = `共 ${caseState.total} 条记录，每页 ${caseState.pageSize} 条`;
    }
    renderCaseTable(data.rows || []);
    renderCasePagination();
  } catch (e) {
    caseModuleTableWrap.innerHTML = "<div class='admin-empty'>案例数据加载失败。</div>";
  }
}

function renderCaseSourceFilter() {
  if (!caseSourceFilter) return;
  const options = [`<option value="">全部来源</option>`]
    .concat(caseState.sourceOptions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`))
    .join("");
  caseSourceFilter.innerHTML = options;
  caseSourceFilter.value = caseState.source || "";
}

function renderCaseTable(rows) {
  if (!caseModuleTableWrap) return;
  const columns = ["故障位置", "关联", "后果", "案例来源"];
  const thead = `<tr>${columns.map((c) => `<th>${c}</th>`).join("")}<th>操作</th></tr>`;
  const safeRows = Array.isArray(rows) ? rows : [];
  const tbody = safeRows.length
    ? safeRows
        .map(
          (row) => `
          <tr>
            <td>${escapeHtml(row["故障位置"] || "")}</td>
            <td>${escapeHtml(row["关联"] || "")}</td>
            <td>${escapeHtml(row["后果"] || "")}</td>
            <td>${escapeHtml(row["案例来源"] || "")}</td>
            <td>
              <button class="case-op-btn" data-op="edit" data-id="${Number(row.id || 0)}">编辑</button>
              <button class="case-op-btn danger" data-op="delete" data-id="${Number(row.id || 0)}">删除</button>
            </td>
          </tr>`,
        )
        .join("")
    : `<tr><td colspan="5">暂无数据</td></tr>`;
  caseModuleTableWrap.innerHTML = `<div class="admin-table-scroll"><table class="admin-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
  caseModuleTableWrap.querySelectorAll(".case-op-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const op = btn.getAttribute("data-op");
      const recordId = Number(btn.getAttribute("data-id") || 0);
      if (!recordId) return;
      if (op === "edit") {
        const tr = btn.closest("tr");
        openCaseModal("manual", "edit", {
          id: recordId,
          "故障位置": tr?.children?.[0]?.textContent || "",
          关联: tr?.children?.[1]?.textContent || "",
          后果: tr?.children?.[2]?.textContent || "",
          案例来源: tr?.children?.[3]?.textContent || "",
        });
        return;
      }
      if (op === "delete") {
        const ok = window.confirm("确定删除该条诊断案例记录吗？");
        if (!ok) return;
        try {
          const res = await fetch(`/api/admin/case-records/${recordId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "删除失败");
          await loadAdminCaseModule();
        } catch (e) {
          window.alert(e.message || "删除失败");
        }
      }
    });
  });
}

function renderCasePagination() {
  if (!casePagination) return;
  const page = caseState.page;
  const pages = caseState.pages;
  casePagination.innerHTML = `
    <span>第 ${page} / ${pages} 页</span>
    <select id="casePageSizeSelect" class="case-page-select">
      <option value="10" ${caseState.pageSize === 10 ? "selected" : ""}>10条/页</option>
      <option value="20" ${caseState.pageSize === 20 ? "selected" : ""}>20条/页</option>
      <option value="50" ${caseState.pageSize === 50 ? "selected" : ""}>50条/页</option>
      <option value="100" ${caseState.pageSize === 100 ? "selected" : ""}>100条/页</option>
    </select>
    <button class="case-page-btn" id="casePrevPageBtn" ${page <= 1 ? "disabled" : ""}>上一页</button>
    <button class="case-page-btn" id="caseNextPageBtn" ${page >= pages ? "disabled" : ""}>下一页</button>
    <span>跳至</span>
    <input id="casePageJumpInput" class="case-page-input" type="number" min="1" max="${pages}" value="${page}" />
    <button class="case-page-btn" id="casePageJumpBtn">确定</button>
  `;
  document.getElementById("casePageSizeSelect")?.addEventListener("change", async (e) => {
    const size = Number(e?.target?.value || 10);
    caseState.pageSize = [10, 20, 50, 100].includes(size) ? size : 10;
    caseState.page = 1;
    await loadAdminCaseModule();
  });
  document.getElementById("casePrevPageBtn")?.addEventListener("click", async () => {
    if (caseState.page <= 1) return;
    caseState.page -= 1;
    await loadAdminCaseModule();
  });
  document.getElementById("caseNextPageBtn")?.addEventListener("click", async () => {
    if (caseState.page >= caseState.pages) return;
    caseState.page += 1;
    await loadAdminCaseModule();
  });
  document.getElementById("casePageJumpBtn")?.addEventListener("click", async () => {
    const input = document.getElementById("casePageJumpInput");
    const target = Number(input?.value || page);
    if (!Number.isFinite(target)) return;
    caseState.page = Math.max(1, Math.min(caseState.pages, Math.round(target)));
    await loadAdminCaseModule();
  });
}

function setDecisionMessage(text = "") {
  if (decisionMessage) {
    decisionMessage.textContent = text;
  }
}

async function loadDecisionModule() {
  if (!decisionTableWrap || !decisionPagination) {
    return;
  }
  decisionTableWrap.innerHTML = "<div class='admin-empty'>正在加载智能决策记录...</div>";
  setDecisionMessage("");
  try {
    const params = new URLSearchParams({
      page: String(decisionState.page),
      pageSize: String(decisionState.pageSize),
      keyword: decisionState.keyword || "",
    });
    const res = await fetch(`/api/intelligent-decisions?${params.toString()}`);
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "加载失败");
    }
    const pg = data.pagination || {};
    decisionState.page = Number(pg.page || 1);
    decisionState.pageSize = Number(pg.pageSize || 10);
    decisionState.total = Number(pg.total || 0);
    decisionState.pages = Math.max(1, Number(pg.pages || 1));
    if (decisionModuleMeta) {
      decisionModuleMeta.textContent = `共 ${decisionState.total} 条智能决策记录，每页 ${decisionState.pageSize} 条`;
    }
    renderDecisionTable(Array.isArray(data.rows) ? data.rows : []);
    renderDecisionPagination();
  } catch (e) {
    decisionTableWrap.innerHTML = `<div class='admin-empty'>${escapeHtml(e.message || "加载失败")}</div>`;
  }
}

function renderDecisionTable(rows) {
  if (!decisionTableWrap) return;
  const columns = ["故障名称", "机理", "建议", "不维修可能后果"];
  const thead = `<tr>${columns.map((c) => `<th>${c}</th>`).join("")}<th>操作</th></tr>`;
  const safeRows = Array.isArray(rows) ? rows : [];
  const tbody = safeRows.length
    ? safeRows
        .map(
          (row) => `
      <tr>
        <td>${escapeHtml(row["故障名称"] || "")}</td>
        <td>${escapeHtml(row["机理"] || "")}</td>
        <td>${escapeHtml(row["建议"] || "")}</td>
        <td>${escapeHtml(row["不维修可能后果"] || "")}</td>
        <td>
          <button class="case-op-btn" data-op="detail" data-id="${Number(row.id || 0)}">详情</button>
          <button class="case-op-btn" data-op="edit" data-id="${Number(row.id || 0)}">编辑</button>
          <button class="case-op-btn danger" data-op="delete" data-id="${Number(row.id || 0)}">删除</button>
          <button class="case-op-btn" data-op="download" data-id="${Number(row.id || 0)}">下载MD</button>
        </td>
      </tr>`,
        )
        .join("")
    : `<tr><td colspan="5">暂无数据</td></tr>`;
  decisionTableWrap.innerHTML = `<div class="admin-table-scroll"><table class="admin-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;

  decisionTableWrap.querySelectorAll(".case-op-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const op = btn.getAttribute("data-op") || "";
      const recordId = Number(btn.getAttribute("data-id") || 0);
      if (!recordId) return;
      if (op === "download") {
        window.open(`/api/intelligent-decisions/${recordId}/export-md`, "_blank");
        return;
      }
      if (op === "detail") {
        await showDecisionDetail(recordId);
        return;
      }
      if (op === "delete") {
        const ok = window.confirm("确定删除该条智能决策记录吗？");
        if (!ok) return;
        try {
          const res = await fetch(`/api/intelligent-decisions/${recordId}`, { method: "DELETE" });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "删除失败");
          await loadDecisionModule();
        } catch (e) {
          setDecisionMessage(e.message || "删除失败");
        }
        return;
      }
      if (op === "edit") {
        await editDecisionRecord(recordId);
      }
    });
  });
}

function renderDecisionPagination() {
  if (!decisionPagination) return;
  const page = decisionState.page;
  const pages = decisionState.pages;
  decisionPagination.innerHTML = `
    <span>第 ${page} / ${pages} 页</span>
    <button class="case-page-btn" id="decisionPrevPageBtn" ${page <= 1 ? "disabled" : ""}>上一页</button>
    <button class="case-page-btn" id="decisionNextPageBtn" ${page >= pages ? "disabled" : ""}>下一页</button>
  `;
  document.getElementById("decisionPrevPageBtn")?.addEventListener("click", async () => {
    if (decisionState.page <= 1) return;
    decisionState.page -= 1;
    await loadDecisionModule();
  });
  document.getElementById("decisionNextPageBtn")?.addEventListener("click", async () => {
    if (decisionState.page >= decisionState.pages) return;
    decisionState.page += 1;
    await loadDecisionModule();
  });
}

async function showDecisionDetail(recordId) {
  try {
    const res = await fetch(`/api/intelligent-decisions/${recordId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "读取详情失败");
    const row = data.record || {};
    const text =
      `故障名称：${row["故障名称"] || ""}\n` +
      `风险程度：${row.riskLevel || ""}\n` +
      `置信度：${row.confidence ?? 0}%\n` +
      `机理：${row["机理"] || ""}\n\n` +
      `建议：\n${row["建议"] || ""}\n\n` +
      `不维修可能后果：\n${row["不维修可能后果"] || ""}`;
    window.alert(text);
  } catch (e) {
    setDecisionMessage(e.message || "读取详情失败");
  }
}

async function editDecisionRecord(recordId) {
  try {
    const res = await fetch(`/api/intelligent-decisions/${recordId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "读取记录失败");
    const row = data.record || {};
    const faultName = window.prompt("故障名称", row["故障名称"] || "");
    if (faultName === null) return;
    const mechanism = window.prompt("机理", row["机理"] || "");
    if (mechanism === null) return;
    const suggestions = window.prompt("建议", row["建议"] || "");
    if (suggestions === null) return;
    const consequence = window.prompt("不维修可能后果", row["不维修可能后果"] || "");
    if (consequence === null) return;
    const confidenceRaw = window.prompt("置信度（0-100）", String(row.confidence ?? 0));
    if (confidenceRaw === null) return;
    const confidence = Number(confidenceRaw || 0);
    const updateRes = await fetch(`/api/intelligent-decisions/${recordId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        故障名称: faultName.trim(),
        机理: mechanism.trim(),
        建议: suggestions.trim(),
        不维修可能后果: consequence.trim(),
        confidence: Number.isFinite(confidence) ? confidence : 0,
      }),
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error(updateData.error || "更新失败");
    await loadDecisionModule();
    setDecisionMessage("记录已更新。");
  } catch (e) {
    setDecisionMessage(e.message || "更新失败");
  }
}

async function generateDecisionByInput() {
  setDecisionMessage("");
  const faultName = (decisionFaultInput?.value || "").trim();
  const confidenceValue = Number(decisionConfidenceInput?.value || 0);
  if (!faultName) {
    setDecisionMessage("请先输入故障名称。");
    return;
  }
  try {
    const res = await fetch("/api/intelligent-decisions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        faultName,
        confidence: Number.isFinite(confidenceValue) ? confidenceValue : 0,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "生成失败");
    setDecisionMessage(`已生成并保存，风险程度：${data.record?.riskLevel || "-"}`);
    decisionState.page = 1;
    await loadDecisionModule();
  } catch (e) {
    setDecisionMessage(e.message || "生成失败");
  }
}

async function saveDiagToDecision() {
  if (!diagState.lastInference) {
    if (diagSaveDecisionMsg) diagSaveDecisionMsg.textContent = "当前无可保存的诊断结果，请先执行诊断";
    return;
  }
  const result = diagState.lastInference;
  if (diagSaveDecisionMsg) {
    diagSaveDecisionMsg.textContent = "正在保存到智能决策...";
  }
  try {
    const res = await fetch("/api/intelligent-decisions/from-diagnosis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prediction: result.prediction || "",
        confidence: result.confidence || 0,
        dataset: result.dataset || diagState.dataset || "",
        model: result.modelCanonical || result.model || diagState.model || "",
        filePath: result.filePath || diagState.filePath || "",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "保存失败");
    if (diagSaveDecisionMsg) {
      diagSaveDecisionMsg.textContent = `保存成功：风险程度 ${data.record?.riskLevel || "-"}`;
    }
    switchModule("decisionModule");
  } catch (e) {
    if (diagSaveDecisionMsg) {
      diagSaveDecisionMsg.textContent = e.message || "保存失败";
    }
  }
}

function resetCaseModalMessage(text = "") {
  if (caseModalMessage) {
    caseModalMessage.textContent = text;
  }
}

function setCaseModalTab(mode) {
  caseState.modalMode = mode;
  caseManualTabBtn?.classList.toggle("active", mode === "manual");
  caseImportTabBtn?.classList.toggle("active", mode === "import");
  caseManualPane?.classList.toggle("hidden", mode !== "manual");
  caseImportPane?.classList.toggle("hidden", mode !== "import");
}

function openCaseModal(mode = "manual", action = "create", row = null) {
  if (!caseEditModal) return;
  caseState.editId = action === "edit" && row ? Number(row.id || 0) : null;
  caseModalTitle.textContent = action === "edit" ? "编辑记录" : "添加记录";
  caseFaultInput.value = row ? row["故障位置"] || "" : "";
  caseRelationInput.value = row ? row["关联"] || "" : "";
  caseConsequenceInput.value = row ? row["后果"] || "" : "";
  caseSourceInput.value = row ? row["案例来源"] || "" : "";
  if (caseImportFileInput) caseImportFileInput.value = "";
  if (caseImportModeSelect) caseImportModeSelect.value = "all";
  if (caseImportStartInput) caseImportStartInput.value = "1";
  if (caseImportEndInput) caseImportEndInput.value = "1";
  setCaseModalTab(mode);
  resetCaseModalMessage("");
  caseEditModal.classList.remove("hidden");
}

function closeCaseModal() {
  caseEditModal?.classList.add("hidden");
  caseState.editId = null;
}

async function submitCaseModal() {
  resetCaseModalMessage("");
  if (caseState.modalMode === "import") {
    if (!caseImportFileInput?.files?.[0]) {
      resetCaseModalMessage("请先选择CSV文件。");
      return;
    }
    const form = new FormData();
    form.append("file", caseImportFileInput.files[0]);
    form.append("importMode", caseImportModeSelect?.value || "all");
    form.append("startRow", caseImportStartInput?.value || "1");
    form.append("endRow", caseImportEndInput?.value || "1");
    try {
      const res = await fetch("/api/admin/case-records/import", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "导入失败");
      closeCaseModal();
      caseState.page = 1;
      await loadAdminCaseModule();
      return;
    } catch (e) {
      resetCaseModalMessage(e.message || "导入失败");
      return;
    }
  }

  const payload = {
    故障位置: (caseFaultInput?.value || "").trim(),
    关联: (caseRelationInput?.value || "").trim(),
    后果: (caseConsequenceInput?.value || "").trim(),
    案例来源: (caseSourceInput?.value || "").trim(),
  };
  try {
    const isEdit = Boolean(caseState.editId);
    const endpoint = isEdit ? `/api/admin/case-records/${caseState.editId}` : "/api/admin/case-records";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "保存失败");
    closeCaseModal();
    caseState.page = 1;
    await loadAdminCaseModule();
  } catch (e) {
    resetCaseModalMessage(e.message || "保存失败");
  }
}

async function loadAdminKbFileDetail(filename) {
  if (!kgManageTableWrap || !kgManageDetailTitle || !kgManageDetailBlock || !filename) {
    return;
  }
  kgManageDetailBlock.classList.remove("hidden");
  kgManageDetailTitle.textContent = `正在读取 ${filename} ...`;
  kgManageTableWrap.innerHTML = "<div class='admin-empty'>正在读取CSV内容...</div>";
  try {
    const res = await fetch(`/api/admin/kb-files/${encodeURIComponent(filename)}`);
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      kgManageTableWrap.innerHTML = `<div class='admin-empty'>${escapeHtml(data.error || "读取失败")}</div>`;
      return;
    }
    kbManageState.selectedFile = data.file || filename;
    kgManageDetailTitle.textContent = `${data.file}（${data.category || "other"}，数据行 ${data.rowCount || 0}）`;
    renderAdminTable(kgManageTableWrap, data.columns || [], data.rows || []);
  } catch (e) {
    kgManageTableWrap.innerHTML = "<div class='admin-empty'>CSV内容加载失败。</div>";
  }
}

function renderKbCategoryFilter() {
  if (!kgCategoryFilter) return;
  const options = (kbManageState.categoryOptions || [])
    .map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`)
    .join("");
  kgCategoryFilter.innerHTML = options || `<option value="all">全部类型</option>`;
  kgCategoryFilter.value = kbManageState.category || "all";
}

function renderKbManageTable(rows) {
  if (!kgManageListWrap) return;
  const columns = ["文件名", "类型", "行数", "列数", "大小(KB)", "更新时间", "操作"];
  const safeRows = Array.isArray(rows) ? rows : [];
  const thead = `<tr>${columns.map((c) => `<th>${c}</th>`).join("")}</tr>`;
  const tbody = safeRows.length
    ? safeRows.map((row) => `
      <tr>
        <td>${escapeHtml(row.file || "")}</td>
        <td>${escapeHtml(row.category || "")}</td>
        <td>${Number(row.rowCount || 0)}</td>
        <td>${Number(row.columnCount || 0)}</td>
        <td>${Number(row.sizeKB || 0).toFixed(2)}</td>
        <td>${escapeHtml(row.updatedAt || "")}</td>
        <td><button class="case-op-btn" data-file="${escapeHtml(row.file || "")}">查看内容</button></td>
      </tr>
    `).join("")
    : `<tr><td colspan="7">暂无数据</td></tr>`;
  kgManageListWrap.innerHTML = `<div class="admin-table-scroll"><table class="admin-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
  kgManageListWrap.querySelectorAll(".case-op-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const f = btn.getAttribute("data-file") || "";
      await loadAdminKbFileDetail(f);
    });
  });
}

function renderKbManagePagination() {
  if (!kgManagePagination) return;
  const page = kbManageState.page;
  const pages = kbManageState.pages;
  kgManagePagination.innerHTML = `
    <span>第 ${page} / ${pages} 页</span>
    <button class="case-page-btn" id="kgPrevPageBtn" ${page <= 1 ? "disabled" : ""}>上一页</button>
    <button class="case-page-btn" id="kgNextPageBtn" ${page >= pages ? "disabled" : ""}>下一页</button>
  `;
  document.getElementById("kgPrevPageBtn")?.addEventListener("click", async () => {
    if (kbManageState.page <= 1) return;
    kbManageState.page -= 1;
    await loadAdminKbFiles();
  });
  document.getElementById("kgNextPageBtn")?.addEventListener("click", async () => {
    if (kbManageState.page >= kbManageState.pages) return;
    kbManageState.page += 1;
    await loadAdminKbFiles();
  });
}

async function loadAdminKbFiles() {
  if (!kgManageListWrap || !kgManageTableWrap || !kgManageDetailTitle || !kgManageDetailBlock) {
    return;
  }
  kgManageDetailBlock.classList.add("hidden");
  kgManageTableWrap.innerHTML = "";
  kgManageDetailTitle.textContent = "CSV 内容预览";
  kgManageListWrap.innerHTML = "<div class='admin-empty'>正在加载知识库CSV列表...</div>";
  try {
    const params = new URLSearchParams({
      page: String(kbManageState.page),
      pageSize: String(kbManageState.pageSize),
      keyword: kbManageState.keyword || "",
      category: kbManageState.category || "all",
    });
    const res = await fetch(`/api/admin/kb-files?${params.toString()}`);
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      kgManageListWrap.innerHTML = `<div class='admin-empty'>${escapeHtml(data.error || "加载失败")}</div>`;
      return;
    }
    const pg = data.pagination || {};
    kbManageState.page = Number(pg.page || 1);
    kbManageState.pageSize = Number(pg.pageSize || 10);
    kbManageState.total = Number(pg.total || 0);
    kbManageState.pages = Math.max(1, Number(pg.pages || 1));
    kbManageState.categoryOptions = Array.isArray(data.categoryOptions) ? data.categoryOptions : [];
    renderKbCategoryFilter();
    if (kgManageMeta) {
      kgManageMeta.textContent = `共 ${kbManageState.total} 个 CSV 参考文件，每页 ${kbManageState.pageSize} 条`;
    }
    const rows = Array.isArray(data.rows) ? data.rows : [];
    renderKbManageTable(rows);
    renderKbManagePagination();
  } catch (e) {
    kgManageListWrap.innerHTML = "<div class='admin-empty'>知识库文件列表加载失败。</div>";
  }
}

async function loadUserProfile() {
  if (!profileUsernameInput) return;
  try {
    const res = await fetch("/api/user/profile");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "加载失败");
    }
    const profile = data.profile || {};
    profileUsernameInput.value = profile.username || "";
    profilePhoneInput.value = profile.phone || "";
    profileEmailInput.value = profile.email || "";
    profileRoleInput.value = profile.roleLabel || "";
    profileStatusInput.value = profile.status || "正常";
    if (profileAvatarPreview && profile.avatarUrl) {
      profileAvatarPreview.src = profile.avatarUrl;
    }
    document.body.dataset.username = profile.username || document.body.dataset.username || "";
    const homeUserLine = document.querySelector(".home-user-line");
    if (homeUserLine && profile.username) {
      homeUserLine.textContent = `您好，${profile.username}`;
    }
  } catch (e) {
    if (profileMessage) profileMessage.textContent = e.message || "个人信息加载失败";
  }
}

async function saveUserProfile() {
  if (!profileUsernameInput) return;
  if (profileMessage) profileMessage.textContent = "";
  try {
    const payload = {
      username: (profileUsernameInput.value || "").trim(),
      phone: (profilePhoneInput.value || "").trim(),
      email: (profileEmailInput.value || "").trim(),
    };
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "保存失败");
    if (profileMessage) profileMessage.textContent = "资料保存成功";
    await loadUserProfile();
  } catch (e) {
    if (profileMessage) profileMessage.textContent = e.message || "保存失败";
  }
}

async function uploadUserAvatar(file) {
  if (!file) return;
  if (profileMessage) profileMessage.textContent = "";
  const form = new FormData();
  form.append("avatar", file);
  try {
    const res = await fetch("/api/user/avatar", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "头像上传失败");
    if (profileAvatarPreview && data.avatarUrl) {
      profileAvatarPreview.src = data.avatarUrl;
    }
    if (profileMessage) profileMessage.textContent = "头像更新成功";
  } catch (e) {
    if (profileMessage) profileMessage.textContent = e.message || "头像上传失败";
  }
}

async function changeUserPassword() {
  if (!profilePwdMessage) return;
  profilePwdMessage.textContent = "";
  try {
    const payload = {
      oldPassword: profileOldPwdInput?.value || "",
      newPassword: profileNewPwdInput?.value || "",
      confirmPassword: profileConfirmPwdInput?.value || "",
    };
    const res = await fetch("/api/user/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "修改失败");
    profilePwdMessage.textContent = "密码修改成功";
    if (profileOldPwdInput) profileOldPwdInput.value = "";
    if (profileNewPwdInput) profileNewPwdInput.value = "";
    if (profileConfirmPwdInput) profileConfirmPwdInput.value = "";
  } catch (e) {
    profilePwdMessage.textContent = e.message || "密码修改失败";
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
  localStorage.setItem(getChatStorageKey(), JSON.stringify(sessions));
}

function loadSessions() {
  try {
    const raw = localStorage.getItem(getChatStorageKey());
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

  runtimeStatus.className = `status-chip ${ok ? "ok" : "error"}`;
  runtimeStatus.textContent = ok ? "neo4j已连接" : "neo4j未连接";
}

function setKgSearchMode(enabled) {
  if (!kgModuleEl) return;
  kgModuleEl.classList.toggle("kg-search-mode", Boolean(enabled));
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

    const models = data.models && data.models.length > 0 ? data.models : [data.default || "Qwen/Qwen3-8B"];
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
    modelSelect.innerHTML = "<option value='Qwen/Qwen3-8B'>Qwen/Qwen3-8B</option>";
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
    setKgSearchMode(false);
    const res = await fetch("/api/kg/graph?limit=150");
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    const data = await res.json();

    if (!data.nodes || data.nodes.length === 0) {
      graphCanvas.textContent = `当前未从 Neo4j 读取到关系数据。${data.error || "请先检查数据库连接与图谱内容。"}`;
      scheduleGraphAutoRetry();
      return;
    }
    clearGraphAutoRetry();

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
    scheduleGraphAutoRetry();
  }
}

async function searchTriplets() {
  const kw = (kgKeyword.value || "").trim();
  if (!kw) {
    setKgSearchMode(false);
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
    setKgSearchMode(true);
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
    setKgSearchMode(true);
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

caseAddBtn?.addEventListener("click", () => openCaseModal("manual", "create"));
caseModalCloseBtn?.addEventListener("click", closeCaseModal);
caseManualTabBtn?.addEventListener("click", () => setCaseModalTab("manual"));
caseImportTabBtn?.addEventListener("click", () => setCaseModalTab("import"));
caseModalSaveBtn?.addEventListener("click", submitCaseModal);
caseSearchBtn?.addEventListener("click", async () => {
  caseState.keyword = (caseSearchInput?.value || "").trim();
  caseState.source = caseSourceFilter?.value || "";
  caseState.page = 1;
  await loadAdminCaseModule();
});
caseResetBtn?.addEventListener("click", async () => {
  caseState.keyword = "";
  caseState.source = "";
  caseState.page = 1;
  if (caseSearchInput) caseSearchInput.value = "";
  if (caseSourceFilter) caseSourceFilter.value = "";
  await loadAdminCaseModule();
});
caseSourceFilter?.addEventListener("change", async () => {
  caseState.source = caseSourceFilter.value || "";
  caseState.page = 1;
  await loadAdminCaseModule();
});
decisionGenerateBtn?.addEventListener("click", generateDecisionByInput);
decisionSearchBtn?.addEventListener("click", async () => {
  decisionState.keyword = (decisionSearchInput?.value || "").trim();
  decisionState.page = 1;
  await loadDecisionModule();
});
decisionResetBtn?.addEventListener("click", async () => {
  decisionState.keyword = "";
  decisionState.page = 1;
  if (decisionSearchInput) decisionSearchInput.value = "";
  await loadDecisionModule();
});
decisionSearchInput?.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    decisionState.keyword = (decisionSearchInput?.value || "").trim();
    decisionState.page = 1;
    await loadDecisionModule();
  }
});
diagSaveDecisionBtn?.addEventListener("click", saveDiagToDecision);

kgUploadBtn?.addEventListener("click", () => kgUploadInput?.click());
kgUploadInput?.addEventListener("change", async () => {
  const file = kgUploadInput?.files?.[0];
  if (!file) return;
  const form = new FormData();
  form.append("file", file);
  try {
    const res = await fetch("/api/admin/kb-files/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "上传失败");
    kbManageState.page = 1;
    kbManageState.selectedFile = data.file || "";
    await loadAdminKbFiles();
  } catch (e) {
    window.alert(e.message || "上传失败");
  } finally {
    if (kgUploadInput) kgUploadInput.value = "";
  }
});
kgSearchBtnManage?.addEventListener("click", async () => {
  kbManageState.keyword = (kgSearchInput?.value || "").trim();
  kbManageState.category = kgCategoryFilter?.value || "all";
  kbManageState.page = 1;
  await loadAdminKbFiles();
});
kgResetBtnManage?.addEventListener("click", async () => {
  kbManageState.keyword = "";
  kbManageState.category = "all";
  kbManageState.page = 1;
  kbManageState.selectedFile = "";
  if (kgSearchInput) kgSearchInput.value = "";
  if (kgCategoryFilter) kgCategoryFilter.value = "all";
  await loadAdminKbFiles();
});
kgCategoryFilter?.addEventListener("change", async () => {
  kbManageState.category = kgCategoryFilter.value || "all";
  kbManageState.page = 1;
  await loadAdminKbFiles();
});

profileSaveBtn?.addEventListener("click", saveUserProfile);
profileAvatarInput?.addEventListener("change", (e) => {
  const file = e?.target?.files?.[0];
  uploadUserAvatar(file);
});
profilePwdBtn?.addEventListener("click", changeUserPassword);

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
  const greet = "你好，我是你的工业故障问答助手。现在可同时结合文本知识库、Neo4j知识图谱与云端大模型回答问题。";
  appendMessage("bot", greet, []);
  addSessionMessage("bot", greet, []);
}

initVoice();
loadStatus();
loadModels();
loadFaqs();
renderCitation();
initLayoutResizer();
switchModule(isAdminUser ? "consoleModule" : "homeModule");
