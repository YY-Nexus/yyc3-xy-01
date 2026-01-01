#!/bin/bash

# YYC³ 微服务架构部署脚本
# 支持6+核心微服务、API网关、服务发现、监控和可观测性的一键部署

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.microservices.yml"
COMPOSE_PROFILE="${1:-full}"

# 服务端口映射
declare -A SERVICE_PORTS=(
    ["consul"]="8500"
    ["kong"]="8000"
    ["user-service"]="8001"
    ["ai-service"]="8002"
    ["growth-service"]="8003"
    ["recommendation-service"]="8004"
    ["knowledge-service"]="8005"
    ["notification-service"]="8006"
    ["ollama"]="11434"
    ["chromadb"]="8000"
    ["postgres"]="5432"
    ["neo4j"]="7474"
    ["redis"]="6379"
    ["kafka"]="9092"
    ["prometheus"]="9090"
    ["grafana"]="3000"
    ["jaeger"]="16686"
    ["alertmanager"]="9093"
)

# 检查依赖
check_dependencies() {
    log_step "检查系统依赖..."

    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    # 检查端口占用
    log_info "检查端口占用情况..."
    local occupied_ports=()

    for service in "${!SERVICE_PORTS[@]}"; do
        local port="${SERVICE_PORTS[$service]}"
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied_ports+=("$port ($service)")
        fi
    done

    if [ ${#occupied_ports[@]} -gt 0 ]; then
        log_warn "以下端口已被占用："
        for port in "${occupied_ports[@]}"; do
            echo "  - $port"
        done
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "部署已取消"
            exit 0
        fi
    fi

    log_info "依赖检查完成"
}

# 环境准备
prepare_environment() {
    log_step "准备部署环境..."

    # 创建必要的目录
    mkdir -p "$PROJECT_DIR/microservices/kong/config"
    mkdir -p "$PROJECT_DIR/microservices/consul/config"
    mkdir -p "$PROJECT_DIR/microservices/postgres/init"
    mkdir -p "$PROJECT_DIR/microservices/monitoring/prometheus/rules"
    mkdir -p "$PROJECT_DIR/microservices/monitoring/grafana/dashboards"
    mkdir -p "$PROJECT_DIR/microservices/monitoring/grafana/datasources"
    mkdir -p "$PROJECT_DIR/microservices/monitoring"

    # 创建Kong配置
    cat > "$PROJECT_DIR/microservices/kong/config/kong.yml" << 'EOF'
_format_version: "3.0"
transformations:
  - tag: no-transformer
services:
  - name: user-service
    url: http://user-service:8001
    plugins:
      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
      - name: prometheus
  - name: ai-service
    url: http://ai-service:8002
    plugins:
      - name: prometheus
      - name: request-size-limiting
        config:
          allowed_payload_size: 10
  - name: growth-service
    url: http://growth-service:8003
    plugins:
      - name: prometheus
  - name: recommendation-service
    url: http://recommendation-service:8004
    plugins:
      - name: prometheus
  - name: knowledge-service
    url: http://knowledge-service:8005
    plugins:
      - name: prometheus
  - name: notification-service
    url: http://notification-service:8006
    plugins:
      - name: prometheus
routes:
  - name: user-service-route
    service: user-service
    paths: ["/api/v1/users", "/api/v1/auth"]
  - name: ai-service-route
    service: ai-service
    paths: ["/api/v1/ai"]
  - name: growth-service-route
    service: growth-service
    paths: ["/api/v1/growth"]
  - name: recommendation-service-route
    service: recommendation-service
    paths: ["/api/v1/recommendations"]
  - name: knowledge-service-route
    service: knowledge-service
    paths: ["/api/v1/knowledge"]
  - name: notification-service-route
    service: notification-service
    paths: ["/api/v1/notifications"]
consumers:
  - username: yyc3-frontend
    custom_id: web-client
    keyauth_credentials:
      - key: ${KONG_API_KEY}
EOF

    # 创建Prometheus配置
    cat > "$PROJECT_DIR/microservices/monitoring/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'yyc3-monitor'
scrape_configs:
  - job_name: 'kong'
    static_configs:
      - targets: ['kong:9090']
    metrics_path: /metrics
    scrape_interval: 5s
  - job_name: 'microservices'
    consul_sd_configs:
      - server: 'consul:8500'
        services: ['user-service', 'ai-service', 'growth-service', 'recommendation-service', 'knowledge-service', 'notification-service']
    relabel_configs:
      - source_labels: [__meta_consul_service]
        target_label: service
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
rule_files:
  - "/etc/prometheus/rules/*.yml"
EOF

    # 创建Alertmanager配置
    cat > "$PROJECT_DIR/microservices/monitoring/alertmanager.yml" << 'EOF'
global:
  smtp_smarthost: '${SMTP_HOST}:${SMTP_PORT}'
  smtp_from: '${SMTP_FROM}'
  smtp_auth_username: '${SMTP_USER}'
  smtp_auth_password: '${SMTP_PASS}'
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://127.0.0.1:5001/'
EOF

    log_info "环境准备完成"
}

# 部署服务
deploy_services() {
    log_step "部署微服务..."

    cd "$PROJECT_DIR"

    # 根据配置文件选择部署的配置文件
    local compose_cmd="docker-compose"
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi

    # 停止现有服务
    log_info "停止现有服务..."
    $compose_cmd -f "$COMPOSE_FILE" down -v --remove-orphans || true

    # 拉取最新镜像
    log_info "拉取Docker镜像..."
    $compose_cmd -f "$COMPOSE_FILE" pull

    # 启动基础设施服务
    log_info "启动基础设施服务..."
    $compose_cmd -f "$COMPOSE_FILE" up -d consul postgres redis neo4j zookeeper

    # 等待基础设施服务就绪
    log_info "等待基础设施服务启动..."
    sleep 30

    # 启动AI基础设施
    log_info "启动AI基础设施..."
    $compose_cmd -f "$COMPOSE_FILE" up -d ollama chromadb

    # 等待AI服务就绪
    log_info "等待AI服务启动..."
    sleep 60

    # 启动微服务
    log_info "启动核心微服务..."
    $compose_cmd -f "$COMPOSE_FILE" up -d user-service ai-service growth-service recommendation-service knowledge-service notification-service

    # 等待微服务就绪
    log_info "等待微服务启动..."
    sleep 30

    # 启动API网关
    log_info "启动API网关..."
    $compose_cmd -f "$COMPOSE_FILE" up -d kong

    # 启动监控服务
    log_info "启动监控服务..."
    $compose_cmd -f "$COMPOSE_FILE" up -d prometheus grafana jaeger alertmanager

    log_info "微服务部署完成"
}

# 验证部署
verify_deployment() {
    log_step "验证部署状态..."

    local compose_cmd="docker-compose"
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi

    # 检查服务状态
    log_info "检查服务健康状态..."
    local failed_services=()

    # 核心服务健康检查
    local services=("consul:8500" "kong:8000" "user-service:8001" "ai-service:8002"
                   "growth-service:8003" "recommendation-service:8004" "knowledge-service:8005"
                   "notification-service:8006" "prometheus:9090" "grafana:3000")

    for service in "${services[@]}"; do
        local service_name="${service%%:*}"
        local port="${service##*:}"

        log_info "检查 $service_name (端口 $port)..."
        if curl -f "http://localhost:$port/health" &>/dev/null ||
           [[ "$service_name" == "prometheus" && curl -f "http://localhost:$port/-/healthy" &>/dev/null ]] ||
           [[ "$service_name" == "grafana" && curl -f "http://localhost:$port/api/health" &>/dev/null ]]; then
            log_info "✅ $service_name 运行正常"
        else
            failed_services+=("$service_name")
            log_error "❌ $service_name 健康检查失败"
        fi
    done

    if [ ${#failed_services[@]} -gt 0 ]; then
        log_warn "以下服务未就绪："
        for service in "${failed_services[@]}"; do
            echo "  - $service"
        done
        log_warn "请检查服务日志："
        echo "  $compose_cmd -f $COMPOSE_FILE logs [service-name]"
    else
        log_info "🎉 所有服务部署成功！"
    fi

    # 显示访问信息
    echo
    log_info "服务访问地址："
    echo "  🌐 Kong API网关:     http://localhost:8000"
    echo "  🔧 Kong管理界面:    http://localhost:8001"
    echo "  🔍 Consul服务发现:  http://localhost:8500"
    echo "  📊 Prometheus监控: http://localhost:9090"
    echo "  📈 Grafana可视化: http://localhost:3000 (admin/admin)"
    echo "  🔍 Jaeger链路追踪: http://localhost:16686"
    echo "  🤖 Ollama AI:       http://localhost:11434"
    echo "  🗄️ Neo4j图数据库:   http://localhost:7474 (neo4j/password)"
    echo
    log_info "API服务端点："
    echo "  👤 用户服务:         http://localhost:8000/api/v1/users"
    echo "  🔐 认证服务:         http://localhost:8000/api/v1/auth"
    echo "  🤖 AI服务:          http://localhost:8000/api/v1/ai"
    echo "  📈 推荐服务:        http://localhost:8000/api/v1/recommendations"
    echo "  🧠 知识图谱:        http://localhost:8000/api/v1/knowledge"
    echo "  📚 成长记录:        http://localhost:8000/api/v1/growth"
    echo "  🔔 通知服务:        http://localhost:8000/api/v1/notifications"
}

# 显示帮助信息
show_help() {
    cat << EOF
YYC³ 微服务架构部署脚本

用法: $0 [COMMAND] [OPTIONS]

命令:
  deploy     部署所有微服务
  status     显示服务状态
  logs       显示服务日志
  stop       停止所有服务
  restart    重启所有服务
  clean      清理所有容器和数据
  health     健康检查
  help       显示此帮助信息

示例:
  $0 deploy           # 部署所有服务
  $0 status           # 查看服务状态
  $0 logs kong        # 查看Kong日志
  $0 restart          # 重启所有服务
  $0 clean            # 清理环境

更多信息请查看文档: PHASE2-WEEK13-14-MICROSERVICES-PLAN.md
EOF
}

# 主函数
main() {
    case "${1:-deploy}" in
        "deploy")
            log_info "开始部署YYC³微服务架构..."
            check_dependencies
            prepare_environment
            deploy_services
            verify_deployment
            ;;
        "status")
            log_info "显示服务状态..."
            cd "$PROJECT_DIR"
            docker-compose -f "$COMPOSE_FILE" ps
            ;;
        "logs")
            local service="${2:-}"
            if [ -z "$service" ]; then
                cd "$PROJECT_DIR"
                docker-compose -f "$COMPOSE_FILE" logs -f
            else
                cd "$PROJECT_DIR"
                docker-compose -f "$COMPOSE_FILE" logs -f "$service"
            fi
            ;;
        "stop")
            log_info "停止所有服务..."
            cd "$PROJECT_DIR"
            docker-compose -f "$COMPOSE_FILE" down
            ;;
        "restart")
            log_info "重启所有服务..."
            cd "$PROJECT_DIR"
            docker-compose -f "$COMPOSE_FILE" restart
            ;;
        "clean")
            log_warn "清理所有容器和数据..."
            read -p "确定要清理所有数据吗？(y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                cd "$PROJECT_DIR"
                docker-compose -f "$COMPOSE_FILE" down -v --remove-orphans
                docker system prune -f
                log_info "清理完成"
            else
                log_info "清理已取消"
            fi
            ;;
        "health")
            log_info "执行健康检查..."
            verify_deployment
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi