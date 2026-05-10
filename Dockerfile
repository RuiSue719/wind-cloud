# 使用官方 Python 3.12 镜像,AI辅助生成，deepseek,2026-05-02
FROM python:3.12-slim-bullseye

# 设置工作目录
WORKDIR /app

# 安装系统依赖（gfortran 确保 scipy 能编译，同时也支持预编译 wheel）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gfortran \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements.txt 并安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制整个项目
COPY . .

# 暴露端口（Railway 会通过环境变量 PORT 自动设置）
EXPOSE $PORT

# 启动命令（与你的项目一致，使用 gunicorn）,AI辅助生成，deepseek,2026-05-02
CMD ["gunicorn", "app:app", "--timeout", "120", "--bind", "0.0.0.0:8080"]