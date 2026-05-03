# 工业机械故障智能问答系统（wendaxitong）

这是一个可扩展的智能问答原型，已实现：

- 智能问答/知识图谱双模块界面切换
- 高频问题推荐与一键刷新
- 点击问题直接调用知识库与图谱问答
- 文本、语音、图片三种输入通道
- 右上角Q版女性工程师形象（随页面整体滚动）
- Neo4j 图谱数据可视化展示
- 图谱优先的混合检索：先取知识图谱结构化证据，再用文档片段补充细节（支持 Chroma 向量库并可降级）
- 意图识别分流：日常对话直连云端大模型，故障问题走“图谱+检索增强”流程
- 管理员后台：控制台统计、图谱管理（CSV 上传/检索/筛选/分页/明细查看）、诊断案例管理（增删改查/导入/分页）
- 普通用户端：首页、个人中心、数据诊断（CWRU/MFPT + 本地 .pth 推理）
- 可扩展后端结构，便于接入多模态工业故障检测/维护预测模块

## 环境要求

- 操作系统：Windows（当前项目在 Windows 路径下开发，Linux/macOS 同样可运行）
- Python：建议 3.10（3.9+ 一般可用，需与本机 torch 版本兼容）
- Neo4j：可选（本地 Neo4j 或 Neo4j Aura，建议启用用于图谱功能）
- 云端大模型：可选（SiliconFlow，配置后可获得更完整自然语言回答）

## 目录结构

- `app.py`：Flask 后端服务（鉴权、问答、检索、Neo4j、数据诊断、管理员接口）
- `requirements.txt`：Python 依赖（含 numpy/scipy/torch/chromadb 等）
- `data/knowledge.md` / `data/wind_power_qa.md`：本地知识库文档
- `csv文件/`：CSV 知识库来源（可在“图谱管理”中上传新 CSV 扩充）
- `templates/index.html`：页面结构
- `static/style.css`：页面样式
- `static/script.js`：前端交互逻辑
- `static/assets/engineer.png`：Q版工程师形象
- `users.sqlite3`：用户与诊断案例数据（首次启动自动生成）

## 默认安装（推荐）

1. 创建并激活虚拟环境（Windows PowerShell）：

   ```powershell
   cd "d:\大学资料\计算机设计大赛26\0502\0502"
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. 安装依赖：

   ```powershell
   pip install -r requirements.txt
   ```

3. 配置环境变量（可选但推荐）

   ```powershell
   $env:SILICONFLOW_API_KEY="你的SiliconFlowKey"
   $env:SILICONFLOW_MODEL="Qwen/Qwen3-8B"

   $env:NEO4J_URI="neo4j+s://<你的aura实例>.databases.neo4j.io"
   $env:NEO4J_USER="<你的neo4j用户名>"
   $env:NEO4J_PASSWORD="<你的neo4j密码>"
   $env:NEO4J_DATABASE="<你的数据库名>"
   ```

4. 启动服务（默认端口 7860）：

   ```powershell
   python app.py
   ```

5. 打开浏览器访问：

   - `http://127.0.0.1:7860`

## 典型使用流程

- 登录
  - 默认管理员：`admin / 123456`
  - 默认普通用户：`11 / 123`
- 普通用户
  - 首页：进入系统概览
  - 智能问答：直接输入问题；日常对话会直连云端大模型；故障类问题会自动走“图谱+检索增强”
  - 图谱可视化：点击节点可引用到问答；节点详情支持查看 CSV 证据卡片
  - 数据诊断：选择数据集与模型，选择 `.mat` 样本后推理输出结论/置信度/可视化
- 管理员
  - 控制台：查看用户数、图谱节点数、案例数、Top10 与频率分布
  - 图谱管理：上传 CSV 扩充知识库参考；支持按类型/文件名检索筛选与分页；可查看内容明细
  - 诊断案例：新增/编辑/删除/导入 CSV；支持搜索筛选与分页

## 主要流程（简述）

- 意图识别：将问题分为“日常对话/故障诊断”两类
- 故障诊断链路（默认）
  - 优先从 Neo4j 获取结构化三元组证据
  - 再从文档片段检索补充细节（优先 Chroma，失败则降级到本地轻量检索）
  - 最后将证据拼接为上下文，调用云端大模型生成回答；若模型不可用则回退到证据摘要回答
- 日常对话链路
  - 直接调用云端大模型生成短回答

## 可扩展建议

1. 接入向量数据库（Chroma/Faiss）替换当前轻量检索。
2. 图片输入接入缺陷检测模型（YOLO/SegFormer）返回缺陷类别与置信度，再映射到图谱节点。
3. 语音输入增加离线ASR服务（Whisper/FunASR）提升兼容性。
4. 增加维护预测模块接口（时序模型 + 告警策略）。
