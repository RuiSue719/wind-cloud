# Neo4j 与 Ollama 接入说明

## 1. 先说明关键点

你提供的 Neo4j data 目录是数据库底层存储文件，问答系统不能直接读取这些二进制文件来做检索。
正确方式是：

1. 启动 Neo4j 服务。
2. 通过 Bolt 协议（bolt://127.0.0.1:7687）连接数据库。
3. 用 Cypher 查询图谱三元组，再把结果拼接到问答上下文，交给大模型生成答案。

本项目已经按这条链路实现。

## 2. 两种配置方式

### 方式A：不配环境变量（推荐给初学者）

1. 先启动系统：Neo4j + Ollama + 本项目 Flask。
2. 打开页面后，切到“知识图谱”页。
3. 在页面里的 Neo4j 连接输入框填写 URI、用户名、密码、数据库名，点击“连接Neo4j”。
4. 连接成功后可直接刷新图谱并问答。

这个方式不会改你电脑任何全局配置。

### 方式B：终端里临时设置环境变量（可选）

在运行前设置：

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

注意：用 `$env:xxx=...` 这种写法，只在当前 PowerShell 窗口生效。关闭窗口就失效，不会影响你电脑上的其他软件。

如果你用的是 `setx` 才会写入长期环境变量（当前说明里没有让你用 `setx`）。

## 3. 运行顺序

1. 启动 Neo4j。
2. 启动 Ollama（CPU 机器建议使用 `start_ollama_cpu.bat`，并保证已有轻量模型可用，例如 gemma4:e2b 或 qwen3:4b）。
3. 在项目目录安装依赖并启动 Flask：

```powershell
pip install -r requirements.txt
python app.py
```

4. 打开浏览器访问：

- http://127.0.0.1:7860

## 4. 目前接口

- GET /api/models
  - 获取本地 Ollama 模型列表
- POST /api/chat
  - 输入：message, imageName, model
  - 行为：文本知识库检索 + Neo4j 三元组检索 + Ollama 生成
- GET /api/kg/graph
  - 输出图谱可视化节点边数据
- GET /api/kg/search?keyword=xxx
  - 输出关键词命中的三元组

## 5. 你可以怎么扩展

1. 按设备类型建立节点标签，例如 Bearing, Sensor, Fault, Action。
2. 给关系加属性，例如 confidence, source, timestamp。
3. 在回答里增加“证据链”展示：返回命中的三元组明细和来源。
4. 图片上传后先走视觉模型推理，再把推理结果映射为图谱节点做联合问答。
