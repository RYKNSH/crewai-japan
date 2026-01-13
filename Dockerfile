# Railway用 Node.js + Python マルチランタイム Dockerfile
# CrewAI Japan - 本番環境

# ============================================
# Stage 1: Node.js ビルド
# ============================================
FROM node:20-slim AS node-builder

WORKDIR /app

# pnpm のインストール
RUN npm install -g pnpm

# 依存関係のインストール
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ソースコードをコピー
COPY . .

# ビルド
RUN pnpm run build

# ============================================
# Stage 2: 本番環境 (Node.js + Python)
# ============================================
FROM node:20-slim

# Python 3 と必要なパッケージをインストール
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Python venv を作成
RUN python3 -m venv /app/venv

# Python パッケージをインストール
RUN /app/venv/bin/pip install --no-cache-dir \
    crewai==1.8.0 \
    langchain-openai \
    pydantic \
    python-dotenv

WORKDIR /app

# pnpm のインストール
RUN npm install -g pnpm

# Node.js 依存関係をコピー
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ビルド成果物をコピー
COPY --from=node-builder /app/dist ./dist

# Python スクリプトをコピー
COPY python ./python

# patches ディレクトリをコピー（必要な場合）
COPY patches ./patches

# drizzle ディレクトリをコピー
COPY drizzle ./drizzle

# 環境変数
ENV NODE_ENV=production
ENV PYTHON_PATH=/app/venv/bin/python

# ポート
EXPOSE 3000

# 起動コマンド
CMD ["node", "dist/index.js"]
