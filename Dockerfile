# YYC³ 智能插拔式移动AI系统 - Docker 部署配置
# Intelligent Pluggable Mobile AI System Docker Configuration

# 使用官方 Node.js 运行时作为基础镜像
FROM node:20-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    dumb-init \
    sqlite \
    postgresql-client

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 bun.lockb
COPY package.json bun.lockb* ./

# 安装 Bun
FROM oven/bun:1-alpine AS bun-installer

# 将 Bun 复制到基础镜像
FROM base AS dependencies
COPY --from=bun-installer /usr/local/bin/bun /usr/local/bin/

# 安装依赖
RUN bun install --frozen-lockfile --production=false

# ========================
# 开发阶段
# ========================
FROM dependencies AS development

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 1229 3000 3001 3002

# 设置环境变量
ENV NODE_ENV=development
ENV NEXT_PUBLIC_ENVIRONMENT=development
ENV PORT=1229
ENV API_GATEWAY_PORT=1229
ENV TOOL_SERVICE_PORT=3001
ENV KNOWLEDGE_SERVICE_PORT=3002

# 启动开发服务器
CMD ["bun", "run", "dev"]

# ========================
# 构建阶段
# ========================
FROM dependencies AS builder

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 复制源代码
COPY . .

# 构建应用
RUN bun run build

# ========================
# 生产阶段
# ========================
FROM base AS production

# 安装 dumb-init 用于信号处理
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup --system --gid 1001 yyc3
RUN adduser --system --uid 1001 yyc3

# 复制 bun
COPY --from=bun-installer /usr/local/bin/bun /usr/local/bin/

# 复制 package.json 和 bun.lockb
COPY package.json bun.lockb* ./

# 安装生产依赖
RUN bun install --frozen-lockfile --production

# 创建必要的目录
RUN mkdir -p /app/logs /app/data /app/uploads /app/knowledge && \
    chown -R yyc3:yyc3 /app

# 复制构建产物
COPY --from=builder --chown=yyc3:yyc3 /app/dist ./dist
COPY --from=builder --chown=yyc3:yyc3 /app/public ./public

# 切换到非 root 用户
USER yyc3

# 暴露端口
EXPOSE 8080 3000 3001 3002

# 设置环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=1229
ENV API_GATEWAY_PORT=1229
ENV TOOL_SERVICE_PORT=3001
ENV KNOWLEDGE_SERVICE_PORT=3002
ENV HOSTNAME=0.0.0.0

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:1229/api/health').then(r=>r.ok?process.exit(0):process.exit(1))" || exit 1

# 使用 dumb-init 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["bun", "run", "start"]

# ========================
# 静态导出阶段 (可选)
# ========================
FROM builder AS static

# 生成静态文件
RUN bun run export

# 使用 nginx 提供静态文件服务
FROM nginx:alpine AS static-server

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制静态文件
COPY --from=static /app/out/ /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]