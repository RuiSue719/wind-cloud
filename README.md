# 工业机械故障智能问答系统（wendaxitong）

这是一个可扩展的智能问答原型，已实现：

- 智能问答/知识图谱双模块界面切换
- 高频问题推荐与一键刷新
- 点击问题直接调用知识库与图谱问答
- 文本、语音、图片三种输入通道
- 右上角Q版女性工程师形象（随页面整体滚动）
- Neo4j 图谱数据可视化展示
- Ollama 本地模型调用（默认按 CPU 友好方式配置）
- 可扩展后端结构，便于接入多模态工业故障检测/维护预测模块

## 目录结构

- `app.py`：Flask后端服务（问答、FAQ、Neo4j、Ollama接口）
- `data/knowledge.md`：本地知识库文档
- `templates/index.html`：页面结构
- `static/style.css`：页面样式
- `static/script.js`：前端交互逻辑
- `static/assets/engineer.png`：Q版工程师形象
- `NEO4J_OLLAMA使用说明.md`：图谱与大模型接入说明

## 运行方式

1. 进入项目目录：

   ```bash
   cd wendaxitong
   ```

2. 安装依赖：

   ```bash
   pip install -r requirements.txt
   ```

3. 可选：配置 Neo4j/Ollama 环境变量（建议，CPU 机器可直接照抄）

   ```powershell
   $env:NEO4J_URI="bolt://127.0.0.1:7687"
   $env:NEO4J_USER="neo4j"
   $env:NEO4J_PASSWORD="你的Neo4j密码"
   $env:NEO4J_DATABASE="neo4j"
   $env:OLLAMA_BASE_URL="http://127.0.0.1:11434"
   $env:OLLAMA_MODEL="gemma4:e2b"
   $env:OLLAMA_FORCE_CPU="1"
   $env:OLLAMA_NUM_THREAD="8"
   $env:OLLAMA_NUM_GPU="0"
   ```

   如果你想单独启动 Ollama 服务，也可以先运行 `start_ollama_cpu.bat`，它会把 Ollama 固定到 CPU 模式。

4. 启动服务：

   ```bash
   python app.py
   ```

5. 打开浏览器访问：

   - `http://127.0.0.1:7860`

## 可扩展建议

1. 接入向量数据库（Chroma/Faiss）替换当前轻量检索。
2. 图片输入接入缺陷检测模型（YOLO/SegFormer）返回缺陷类别与置信度，再映射到图谱节点。
3. 语音输入增加离线ASR服务（Whisper/FunASR）提升兼容性。
4. 增加维护预测模块接口（时序模型 + 告警策略）。
