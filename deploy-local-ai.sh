#!/bin/bash

# YYC³ AI小语智能成长守护系统 - 本地AI服务部署脚本
# Intelligent Pluggable Mobile AI System - Local AI Services Deployment Script
# Phase 2 Week 9-10: 本地AI模型集成

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# 配置变量
DEFAULT_OLLAMA_MODEL="llama3.1:8b"
DEFAULT_ENVIRONMENT="production"

# 显示帮助信息
show_help() {
    echo "YYC³ 本地AI服务部署管理脚本"
    echo ""
    echo "用法: $0 {command} [options]"
    echo ""
    echo "命令:"
    echo "  deploy [env]        部署本地AI服务"
    echo "  update [env]        更新本地AI服务"
    echo "  stop [env]          停止本地AI服务"
    echo "  restart [env]       重启本地AI服务"
    echo "  status [env]        显示服务状态"
    echo "  logs [service]      查看服务日志"
    echo "  models              管理AI模型"
    echo "  knowledge           管理知识库"
    echo "  monitor             监控面板"
    echo "  cleanup [env]       清理服务"
    echo "  health [env]        健康检查"
    echo ""
    echo "环境:"
    echo "  production          生产环境"
    echo "  development         开发环境(包含调试工具)"
    echo ""
    echo "示例:"
    echo "  $0 deploy production    # 部署生产环境"
    echo "  $0 pull llama3.1:8b     # 下载模型"
    echo "  $0 status production    # 查看状态"
    echo "  $0 logs ollama           # 查看Ollama日志"
    echo ""
    echo "模型管理:"
    echo "  pull <model>            下载指定模型"
    echo "  list                    列出可用模型"
    echo "  delete <model>          删除指定模型"
    echo "  switch <model>          切换当前模型"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."

    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    # 检查网络连接
    if ! docker network ls | grep -q "yyc3-network"; then
        log_warning "yyc3-network 不存在，将自动创建"
        docker network create yyc3-yxy-ai_yyc3-network || true
    fi

    # 检查GPU支持（可选）
    if command -v nvidia-smi &> /dev/null; then
        log_success "检测到NVIDIA GPU支持"
        nvidia-smi --query-gpu=name,memory.total,memory.used --format=csv,noheader,nounits
    else
        log_warning "未检测到GPU支持，将使用CPU推理"
    fi

    log_success "依赖检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    mkdir -p logs/ai
    mkdir -p monitoring
    mkdir -p chromadb/config
    mkdir -p redis
    mkdir -p data/knowledge

    log_success "目录创建完成"
}

# 生成配置文件
generate_configs() {
    log_info "生成配置文件..."

    # ChromaDB配置
    cat > chromadb/config/chromadb-config.yml << 'EOF'
# ChromaDB Configuration
chroma_server:
  host: 0.0.0.0
  port: 8000
  cors_allow_origins: "*"
  cors_allow_credentials: true
  log_level: "INFO"

chroma_db:
  persist_directory: "/chroma/chroma"
  allow_reset: true

embedding_function:
  provider: "sentence-transformers"
  model_name: "all-MiniLM-L6-v2"
EOF

    # Redis配置
    cat > redis/ai-redis.conf << 'EOF'
# Redis Configuration for AI Services
bind 0.0.0.0
port 6379
timeout 0
keepalive 300

# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Security
protected-mode no
EOF

    log_success "配置文件生成完成"
}

# 部署本地AI服务
deploy_services() {
    local env=${1:-$DEFAULT_ENVIRONMENT}
    log_step "部署本地AI服务 (环境: $env)..."

    # 设置环境变量
    export OLLAMA_PORT=${OLLAMA_PORT:-11434}
    export CHROMA_PORT=${CHROMA_PORT:-8000}
    export LOCAL_AI_PORT=${LOCAL_AI_PORT:-8081}
    export EMBEDDING_PORT=${EMBEDDING_PORT:-8082}
    export AI_REDIS_PORT=${AI_REDIS_PORT:-6380}
    export AI_PROMETHEUS_PORT=${AI_PROMETHEUS_PORT:-9091}
    export AI_GRAFANA_PORT=${AI_GRAFANA_PORT:-3002}

    # 启动基础服务
    if [ "$env" = "development" ]; then
        log_info "启动开发环境服务..."
        docker-compose -f docker-compose.ollama.yml --profile development up -d
    else
        log_info "启动生产环境服务..."
        docker-compose -f docker-compose.ollama.yml up -d
    fi

    log_success "服务部署完成"
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."

    # 等待Ollama
    log_info "等待Ollama服务启动..."
    timeout 120 bash -c 'until curl -f http://localhost:11434/api/tags > /dev/null 2>&1; do sleep 5; done'
    if [ $? -eq 0 ]; then
        log_success "✓ Ollama服务已启动"
    else
        log_error "✗ Ollama服务启动超时"
        return 1
    fi

    # 等待ChromaDB
    log_info "等待ChromaDB服务启动..."
    timeout 60 bash -c 'until curl -f http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; do sleep 3; done'
    if [ $? -eq 0 ]; then
        log_success "✓ ChromaDB服务已启动"
    else
        log_error "✗ ChromaDB服务启动超时"
        return 1
    fi

    # 等待本地AI网关
    log_info "等待本地AI网关启动..."
    timeout 60 bash -c 'until curl -f http://localhost:8081/health > /dev/null 2>&1; do sleep 3; done'
    if [ $? -eq 0 ]; then
        log_success "✓ 本地AI网关已启动"
    else
        log_error "✗ 本地AI网关启动超时"
        return 1
    fi

    log_success "所有服务启动完成"
}

# 初始化默认模型
init_default_model() {
    log_step "初始化默认AI模型..."

    # 检查是否已有模型
    local models=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")

    if [ -z "$models" ]; then
        log_info "未检测到模型，开始下载默认模型: $DEFAULT_OLLAMA_MODEL"
        docker exec yyc3-ollama ollama pull "$DEFAULT_OLLAMA_MODEL"

        if [ $? -eq 0 ]; then
            log_success "✓ 默认模型下载完成"
        else
            log_error "✗ 默认模型下载失败"
            return 1
        fi
    else
        log_success "✓ 检测到现有模型: $(echo $models | tr '\n' ' ')"
    fi
}

# 显示服务状态
show_status() {
    log_info "本地AI服务状态:"
    echo ""

    # Docker服务状态
    echo "🐳 Docker服务:"
    docker-compose -f docker-compose.ollama.yml ps
    echo ""

    # 服务访问地址
    echo "🌐 服务访问地址:"
    echo "🤖 Ollama API:      http://localhost:11434"
    echo "🔍 ChromaDB:       http://localhost:8000"
    echo "🚪 AI网关:         http://localhost:8081"
    echo "📊 AI监控面板:     http://localhost:3002 (admin/aiadmin123)"

    if docker ps --format "table {{.Names}}" | grep -q "yyc3-ollama-webui"; then
        echo "🎨 Ollama WebUI:   http://localhost:3003"
    fi

    if docker ps --format "table {{.Names}}" | grep -q "yyc3-chromadb-admin"; then
        echo "🗂️ ChromaDB管理:  http://localhost:8001"
    fi

    echo ""

    # 健康检查
    echo "🏥 服务健康状态:"

    # Ollama健康检查
    if curl -f http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✓ Ollama: 健康"
    else
        echo "✗ Ollama: 不可用"
    fi

    # ChromaDB健康检查
    if curl -f http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
        echo "✓ ChromaDB: 健康"
    else
        echo "✗ ChromaDB: 不可用"
    fi

    # AI网关健康检查
    if curl -f http://localhost:8081/health > /dev/null 2>&1; then
        echo "✓ AI网关: 健康"
    else
        echo "✗ AI网关: 不可用"
    fi

    # 模型列表
    echo ""
    echo "🤖 可用模型:"
    local models=$(curl -s http://localhost:11434/api/tags 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "无")
    if [ "$models" = "无" ]; then
        echo "  无可用模型，请先下载模型"
    else
        echo "$models" | sed 's/^/  - /'
    fi
}

# 模型管理
manage_models() {
    local command=${1:-list}
    local model=${2:-}

    case $command in
        "list")
            log_info "列出可用模型:"
            curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "无可用模型"
            ;;
        "pull")
            if [ -z "$model" ]; then
                log_error "请指定模型名称"
                echo "可用模型:"
                echo "  llama3.1:8b"
                echo "  qwen2.5:7b"
                echo "  phi3.5:3.8b"
                echo "  gemma2:7b"
                return 1
            fi
            log_info "下载模型: $model"
            docker exec yyc3-ollama ollama pull "$model"
            ;;
        "delete")
            if [ -z "$model" ]; then
                log_error "请指定模型名称"
                return 1
            fi
            log_info "删除模型: $model"
            docker exec yyc3-ollama ollama rm "$model"
            ;;
        "switch")
            if [ -z "$model" ]; then
                log_error "请指定模型名称"
                return 1
            fi
            log_info "切换模型到: $model"
            # 这里需要调用AI网关的API来切换模型
            curl -X POST http://localhost:8081/api/models/switch \
                -H "Content-Type: application/json" \
                -d "{\"model\":\"$model\"}"
            ;;
        *)
            log_error "未知命令: $command"
            echo "可用命令: list, pull, delete, switch"
            return 1
            ;;
    esac
}

# 查看日志
show_logs() {
    local service=${1:-all}

    case $service in
        "ollama")
            docker-compose -f docker-compose.ollama.yml logs -f ollama
            ;;
        "chromadb")
            docker-compose -f docker-compose.ollama.yml logs -f chromadb
            ;;
        "gateway")
            docker-compose -f docker-compose.ollama.yml logs -f local-ai-gateway
            ;;
        "all")
            docker-compose -f docker-compose.ollama.yml logs -f
            ;;
        *)
            log_error "未知服务: $service"
            echo "可用服务: ollama, chromadb, gateway, all"
            return 1
            ;;
    esac
}

# 健康检查
health_check() {
    log_info "执行健康检查..."

    local services=("ollama:11434/api/tags" "chromadb:8000/api/v1/heartbeat" "gateway:8081/health")
    local all_healthy=true

    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port_path=$(echo $service | cut -d: -f2-)
        local url="http://localhost:$port_path"

        if curl -f "$url" > /dev/null 2>&1; then
            log_success "✓ $name: 健康"
        else
            log_error "✗ $name: 不健康"
            all_healthy=false
        fi
    done

    if [ "$all_healthy" = true ]; then
        log_success "🎉 所有服务健康！"
        return 0
    else
        log_error "❌ 部分服务不健康"
        return 1
    fi
}

# 停止服务
stop_services() {
    log_info "停止本地AI服务..."
    docker-compose -f docker-compose.ollama.yml down
    log_success "服务已停止"
}

# 清理服务
cleanup_services() {
    log_info "清理本地AI服务..."
    docker-compose -f docker-compose.ollama.yml down -v
    docker system prune -f
    log_success "清理完成"
}

# 重启服务
restart_services() {
    log_info "重启本地AI服务..."
    docker-compose -f docker-compose.ollama.yml restart
    log_success "服务重启完成"
}

# 更新服务
update_services() {
    log_info "更新本地AI服务..."
    docker-compose -f docker-compose.ollama.yml pull
    docker-compose -f docker-compose.ollama.yml up -d
    log_success "服务更新完成"
}

# 主函数
main() {
    local command=${1:-help}
    local env_or_option=${2:-$DEFAULT_ENVIRONMENT}

    echo "🤖 YYC³ 本地AI服务部署管理"
    echo "================================="

    case $command in
        "deploy")
            check_dependencies
            create_directories
            generate_configs
            deploy_services "$env_or_option"
            wait_for_services
            init_default_model
            show_status
            ;;
        "update")
            update_services
            wait_for_services
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            wait_for_services
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$env_or_option"
            ;;
        "models")
            manage_models "$env_or_option" "${3:-}"
            ;;
        "monitor")
            log_info "打开监控面板: http://localhost:3002"
            if command -v open &> /dev/null; then
                open http://localhost:3002
            elif command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:3002
            fi
            ;;
        "health")
            health_check
            ;;
        "cleanup")
            cleanup_services
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"