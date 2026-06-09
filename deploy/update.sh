#!/bin/bash
set -e

# ========== 配置区 ==========
GIT_REPO="git@github.com:CAPTURE760/-.git"
PROJECT_DIR="$HOME/gomoku"
DOCKER_IMAGE="gomoku:latest"
CONTAINER_NAME="gomoku-container"
HOST_PORT=3002
CONTAINER_PORT=3000
# ============================

echo "=== 五子棋部署脚本 ==="
echo "仓库: $GIT_REPO"
echo "端口: $HOST_PORT"
echo ""

# 1. 拉取最新代码
if [ -d "$PROJECT_DIR/.git" ]; then
    echo "[1/4] 拉取最新代码..."
    cd "$PROJECT_DIR"
    git pull origin master
else
    echo "[1/4] 克隆仓库..."
    git clone "$GIT_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# 2. 构建 Docker 镜像
echo "[2/4] 构建 Docker 镜像..."
docker build -t "$DOCKER_IMAGE" "$PROJECT_DIR"

# 3. 停止旧容器（如果存在）
echo "[3/4] 停止旧容器..."
docker stop "$CONTAINER_NAME" 2>/dev/null && docker rm "$CONTAINER_NAME" 2>/dev/null || true

# 4. 启动新容器
echo "[4/4] 启动容器 on port $HOST_PORT..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  --restart unless-stopped \
  "$DOCKER_IMAGE"

echo ""
echo "=== 部署完成 ==="
echo "访问地址: http://你的服务器IP:$HOST_PORT"
echo ""

# 显示容器状态
docker ps --filter "name=$CONTAINER_NAME" --no-trunc
