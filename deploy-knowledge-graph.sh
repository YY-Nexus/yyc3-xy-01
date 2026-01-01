#!/bin/bash

# YYC³ AI小语智能成长守护系统 - 知识图谱部署脚本
# Intelligent Pluggable Mobile AI System - Knowledge Graph Deployment Script
# Phase 2 Week 11-12: 知识图谱构建

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_highlight() {
    echo -e "${CYAN}[HIGHLIGHT]${NC} $1"
}

# 配置变量
DEFAULT_ENVIRONMENT="production"
NEO4J_VERSION="5.12-community"
REDIS_VERSION="7-alpine"

# 显示帮助信息
show_help() {
    echo "YYC³ 知识图谱部署管理脚本"
    echo ""
    echo "用法: $0 {command} [options]"
    echo ""
    echo "命令:"
    echo "  deploy [env]           部署知识图谱服务"
    echo "  update [env]           更新知识图谱服务"
    echo "  stop [env]             停止知识图谱服务"
    echo "  restart [env]          重启知识图谱服务"
    echo "  status [env]           显示服务状态"
    echo "  logs [service]         查看服务日志"
    echo "  health [env]           健康检查"
    echo "  init [env]             初始化知识图谱数据"
    echo "  import [type]          导入知识图谱数据"
    echo "  export [type]          导出知识图谱数据"
    echo "  quality-check          数据质量检查"
    echo "  backup                 备份数据"
    echo "  restore [backup]       恢复数据"
    echo "  cleanup [env]          清理服务"
    echo "  monitor                打开监控面板"
    echo ""
    echo "环境:"
    echo "  production             生产环境"
    echo "  development            开发环境"
    echo ""
    echo "数据导入类型:"
    echo "  children               儿童数据"
    echo "  knowledge              知识数据"
    echo "  abilities              能力数据"
    echo "  activities             活动数据"
    echo "  sample                 示例数据"
    echo ""
    echo "示例:"
    echo "  $0 deploy production    # 部署生产环境"
    echo "  $0 init production      # 初始化数据结构"
    echo "  $0 import sample        # 导入示例数据"
    echo "  $0 status production    # 查看状态"
    echo "  $0 logs neo4j           # 查看Neo4j日志"
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

    # 检查网络
    if ! docker network ls | grep -q "yyc3-knowledge-network"; then
        log_warning "yyc3-knowledge-network 不存在，将自动创建"
    fi

    # 检查端口占用
    check_port_availability

    log_success "依赖检查完成"
}

# 检查端口可用性
check_port_availability() {
    local ports=("7474" "7687" "8082" "6380" "3004" "9093" "3005")

    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "端口 $port 已被占用，可能会导致服务启动失败"
        fi
    done
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    # 知识图谱目录结构
    mkdir -p knowledge-graph/config
    mkdir -p knowledge-graph/models
    mkdir -p knowledge-graph/scripts
    mkdir -p knowledge-graph/data
    mkdir -p knowledge-graph/logs
    mkdir -p knowledge-graph/monitoring/rules
    mkdir -p knowledge-graph/monitoring/grafana/provisioning
    mkdir -p knowledge-graph/monitoring/grafana/dashboards
    mkdir -p knowledge-graph/sync/scripts
    mkdir -p knowledge-graph/sync/config
    mkdir -p knowledge-graph/training/scripts
    mkdir -p knowledge-graph/training/config
    mkdir -p knowledge-graph/visualization

    # 日志目录
    mkdir -p logs/knowledge-graph
    mkdir -p logs/neo4j
    mkdir -p logs/redis
    mkdir -p logs/sync
    mkdir -p logs/training

    log_success "目录创建完成"
}

# 生成配置文件
generate_configs() {
    log_info "生成配置文件..."

    # Neo4j配置
    cat > knowledge-graph/config/neo4j.conf << 'EOF'
# YYC³ Neo4j Configuration
# 核心配置
server.bolt.enabled=true
server.bolt.listen_address=0.0.0.0:7687
server.http.enabled=true
server.http.listen_address=0.0.0.0:7474

# 数据库配置
dbms.default_database=yyc3_knowledge_graph
dbms.default_listen_address=0.0.0.0

# 内存配置
server.memory.heap.initial_size=2G
server.memory.heap.max_size=4G
server.memory.pagecache.size=2G

# 安全配置
dbms.security.auth_enabled=true
dbms.security.procedures.unrestricted=apoc.*,gds.*
dbms.security.procedures.allowlist=apoc.*,gds.*

# 日志配置
dbms.logs.query.enabled=true
dbms.logs.query.threshold=1s
dbms.logs.query.parameter_logging_enabled=true

# 事务配置
dbms.transaction.timeout=60s
dbms.transaction.concurrent.maximum=1000

# 连接配置
dbms.default_advertised_address=neo4j
dbms.connector.bolt.advertised_address=neo4j:7687
dbms.connector.http.advertised_address=neo4j:7474
EOF

    # Redis配置
    cat > knowledge-graph/config/redis.conf << 'EOF'
# YYC³ Redis Configuration
bind 0.0.0.0
port 6379
timeout 0
keepalive 300

# 安全配置
requirepass yyc3-redis-2025
protected-mode no

# 内存管理
maxmemory 1G
maxmemory-policy allkeys-lru

# 持久化配置
save 900 1
save 300 10
save 60 10000

# 日志配置
loglevel notice
logfile ""

# 性能配置
tcp-keepalive 60
tcp-backlog 511
databases 16
EOF

    # Prometheus配置
    cat > knowledge-graph/monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "/etc/prometheus/rules/*.yml"

scrape_configs:
  - job_name: 'knowledge-graph-api'
    static_configs:
      - targets: ['knowledge-graph-api:8082']
    metrics_path: '/api/metrics'
    scrape_interval: 10s

  - job_name: 'neo4j'
    static_configs:
      - targets: ['neo4j:2004']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'redis'
    static_configs:
      - targets: ['knowledge-redis:6379']
    scrape_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
EOF

    # Grafana数据源配置
    cat > knowledge-graph/monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://knowledge-monitoring:9090
    isDefault: true
    editable: true
EOF

    # 监控规则
    cat > knowledge-graph/monitoring/rules/knowledge-graph.yml << 'EOF'
groups:
  - name: knowledge-graph
    rules:
      - alert: KnowledgeGraphDown
        expr: up{job="knowledge-graph-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Knowledge Graph API is down"
          description: "Knowledge Graph API has been down for more than 1 minute."

      - alert: Neo4jDown
        expr: up{job="neo4j"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Neo4j is down"
          description: "Neo4j database has been down for more than 1 minute."

      - alert: RedisDown
        expr: up{job="redis"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis cache has been down for more than 1 minute."

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Container memory usage is above 90%."

      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "Container CPU usage is above 80%."
EOF

    log_success "配置文件生成完成"
}

# 部署知识图谱服务
deploy_services() {
    local env=${1:-$DEFAULT_ENVIRONMENT}
    log_step "部署知识图谱服务 (环境: $env)..."

    # 设置环境变量
    export KNOWLEDGE_GRAPH_ENV=$env
    export NEO4J_AUTH="neo4j/yyc3-ai-neo4j-2025"
    export REDIS_PASSWORD="yyc3-redis-2025"

    # 启动服务
    if [ "$env" = "development" ]; then
        log_info "启动开发环境服务..."
        docker-compose -f docker-compose.knowledge-graph.yml --profile development up -d
    else
        log_info "启动生产环境服务..."
        docker-compose -f docker-compose.knowledge-graph.yml up -d
    fi

    log_success "知识图谱服务部署完成"
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."

    # 等待Neo4j
    log_info "等待Neo4j服务启动..."
    timeout 300 bash -c 'until curl -f http://localhost:7474 > /dev/null 2>&1; do sleep 10; done'
    if [ $? -eq 0 ]; then
        log_success "✓ Neo4j服务已启动"
    else
        log_error "✗ Neo4j服务启动超时"
        return 1
    fi

    # 等待知识图谱API
    log_info "等待知识图谱API服务启动..."
    timeout 120 bash -c 'until curl -f http://localhost:8082/health > /dev/null 2>&1; do sleep 5; done'
    if [ $? -eq 0 ]; then
        log_success "✓ 知识图谱API服务已启动"
    else
        log_error "✗ 知识图谱API服务启动超时"
        return 1
    fi

    # 等待Redis
    log_info "等待Redis服务启动..."
    timeout 60 bash -c 'until docker exec yyc3-knowledge-redis redis-cli ping > /dev/null 2>&1; do sleep 3; done'
    if [ $? -eq 0 ]; then
        log_success "✓ Redis服务已启动"
    else
        log_error "✗ Redis服务启动超时"
        return 1
    fi

    log_success "所有服务启动完成"
}

# 初始化知识图谱
init_knowledge_graph() {
    log_step "初始化知识图谱数据结构..."

    # 调用知识图谱管理器初始化
    log_info "创建约束和索引..."

    # 这里可以调用Node.js脚本进行初始化
    if [ -f "services/knowledge/initialize.js" ]; then
        node services/knowledge/initialize.js
    elif command -v bun &> /dev/null; then
        bun run services/knowledge/initialize.ts
    else
        log_warning "未找到初始化脚本，请手动初始化知识图谱"
        return 1
    fi

    log_success "知识图谱初始化完成"
}

# 导入数据
import_data() {
    local type=${1:-"sample"}
    log_step "导入知识图谱数据 (类型: $type)..."

    case $type in
        "children")
            import_children_data
            ;;
        "knowledge")
            import_knowledge_data
            ;;
        "abilities")
            import_abilities_data
            ;;
        "activities")
            import_activities_data
            ;;
        "sample")
            import_sample_data
            ;;
        *)
            log_error "未知的数据类型: $type"
            echo "可用类型: children, knowledge, abilities, activities, sample"
            return 1
            ;;
    esac

    log_success "数据导入完成"
}

# 导入示例数据
import_sample_data() {
    log_info "导入示例知识图谱数据..."

    # 创建示例数据
    cat > /tmp/sample_knowledge_data.json << 'EOF'
{
  "children": [
    {
      "id": "child_sample_001",
      "name": "小明",
      "age": 8,
      "gender": "male",
      "interests": ["数学", "科学", "绘画"],
      "learning_style": "visual"
    }
  ],
  "knowledge": [
    {
      "id": "knowledge_001",
      "title": "基础加减法",
      "description": "10以内的加减法运算",
      "category": "math",
      "difficulty_level": 0.3,
      "importance": 0.8,
      "age_range": {"min": 5, "max": 8}
    }
  ],
  "abilities": [
    {
      "id": "ability_001",
      "title": "逻辑思维能力",
      "description": "分析和解决问题的能力",
      "dimension": "cognitive",
      "level": 0.4
    }
  ],
  "activities": [
    {
      "id": "activity_001",
      "title": "数学游戏时间",
      "description": "通过游戏学习数学概念",
      "category": "educational",
      "difficulty_level": 0.3,
      "min_age": 5,
      "max_age": 8,
      "duration_minutes": 30
    }
  ]
}
EOF

    # 调用数据导入API
    curl -X POST http://localhost:8082/api/import/sample \
        -H "Content-Type: application/json" \
        -d @/tmp/sample_knowledge_data.json

    # 清理临时文件
    rm -f /tmp/sample_knowledge_data.json
}

# 数据质量检查
perform_quality_check() {
    log_step "执行知识图谱数据质量检查..."

    local response=$(curl -s -X POST http://localhost:8082/api/quality-check \
        -H "Content-Type: application/json" \
        -d '{}')

    if echo "$response" | jq -e '.quality_score' > /dev/null 2>&1; then
        local quality_score=$(echo "$response" | jq -r '.quality_score')
        local total_nodes=$(echo "$response" | jq -r '.total_nodes')
        local total_relationships=$(echo "$response" | jq -r '.total_relationships')
        local issue_count=$(echo "$response" | jq -r '.issues | length')

        log_highlight "数据质量报告:"
        echo "  📊 质量分数: ${quality_score}"
        echo "  🔢 节点数量: ${total_nodes}"
        echo "  🔗 关系数量: ${total_relationships}"
        echo "  ⚠️  问题数量: ${issue_count}"

        if (( $(echo "$quality_score >= 90" | bc -l) )); then
            log_success "✅ 数据质量优秀"
        elif (( $(echo "$quality_score >= 80" | bc -l) )); then
            log_warning "⚠️  数据质量良好"
        else
            log_error "❌ 数据质量需要改进"
        fi

        # 显示问题详情
        if [ "$issue_count" -gt 0 ]; then
            echo ""
            log_highlight "发现的问题:"
            echo "$response" | jq -r '.issues[] | "  - \(.type): \(.description) (严重程度: \(.severity))"'
        fi
    else
        log_error "无法获取数据质量报告"
        return 1
    fi
}

# 显示服务状态
show_status() {
    log_info "知识图谱服务状态:"
    echo ""

    # Docker服务状态
    echo "🐳 Docker服务:"
    docker-compose -f docker-compose.knowledge-graph.yml ps
    echo ""

    # 服务访问地址
    echo "🌐 服务访问地址:"
    echo "📊 Neo4j Browser:    http://localhost:7474 (neo4j/yyc3-ai-neo4j-2025)"
    echo "🧠 知识图谱API:      http://localhost:8082"
    echo "📚 知识图谱可视化:   http://localhost:3004"
    echo "📈 监控面板:         http://localhost:3005 (admin/yyc3-grafana-2025)"
    echo ""

    # 健康检查
    echo "🏥 服务健康状态:"

    # Neo4j健康检查
    if curl -f http://localhost:7474 > /dev/null 2>&1; then
        echo "✓ Neo4j: 健康"
    else
        echo "✗ Neo4j: 不可用"
    fi

    # 知识图谱API健康检查
    if curl -f http://localhost:8082/health > /dev/null 2>&1; then
        echo "✓ 知识图谱API: 健康"
    else
        echo "✗ 知识图谱API: 不可用"
    fi

    # Redis健康检查
    if docker exec yyc3-knowledge-redis redis-cli ping > /dev/null 2>&1; then
        echo "✓ Redis: 健康"
    else
        echo "✗ Redis: 不可用"
    fi

    echo ""

    # 数据统计
    echo "📊 数据统计:"
    if curl -f http://localhost:8082/api/stats > /dev/null 2>&1; then
        local stats=$(curl -s http://localhost:8082/api/stats)
        echo "$stats" | jq -r 'to_entries[] | "  \(.key): \(.value)"'
    else
        echo "  无法获取数据统计"
    fi
}

# 查看日志
show_logs() {
    local service=${1:-"all"}

    case $service in
        "neo4j")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f neo4j
            ;;
        "knowledge-graph-api"|"api")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f knowledge-graph-api
            ;;
        "redis")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f knowledge-redis
            ;;
        "visualization")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f knowledge-visualization
            ;;
        "monitoring")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f knowledge-monitoring
            ;;
        "grafana")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f knowledge-grafana
            ;;
        "all")
            docker-compose -f docker-compose.knowledge-graph.yml logs -f
            ;;
        *)
            log_error "未知服务: $service"
            echo "可用服务: neo4j, api, redis, visualization, monitoring, grafana, all"
            return 1
            ;;
    esac
}

# 健康检查
health_check() {
    log_info "执行知识图谱健康检查..."

    local services=("neo4j:7474" "knowledge-graph-api:8082" "visualization:3004" "monitoring:9093")
    local all_healthy=true

    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)

        if [ "$name" = "neo4j" ]; then
            if curl -f http://localhost:$port > /dev/null 2>&1; then
                log_success "✓ $name: 健康"
            else
                log_error "✗ $name: 不健康"
                all_healthy=false
            fi
        elif [ "$name" = "knowledge-graph-api" ]; then
            if curl -f http://localhost:$port/health > /dev/null 2>&1; then
                log_success "✓ $name: 健康"
            else
                log_error "✗ $name: 不健康"
                all_healthy=false
            fi
        elif [ "$name" = "visualization" ]; then
            if curl -f http://localhost:$port > /dev/null 2>&1; then
                log_success "✓ $name: 健康"
            else
                log_warning "⚠️  $name: 不可用 (可选服务)"
            fi
        elif [ "$name" = "monitoring" ]; then
            if curl -f http://localhost:$port > /dev/null 2>&1; then
                log_success "✓ $name: 健康"
            else
                log_warning "⚠️  $name: 不可用 (可选服务)"
            fi
        fi
    done

    # Redis健康检查
    if docker exec yyc3-knowledge-redis redis-cli ping > /dev/null 2>&1; then
        log_success "✓ Redis: 健康"
    else
        log_error "✗ Redis: 不健康"
        all_healthy=false
    fi

    if [ "$all_healthy" = true ]; then
        log_success "🎉 核心服务全部健康！"
        return 0
    else
        log_error "❌ 部分服务不健康"
        return 1
    fi
}

# 备份数据
backup_data() {
    log_step "备份知识图谱数据..."

    local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    # 备份Neo4j数据
    log_info "备份Neo4j数据..."
    docker exec yyc3-neo4j neo4j-admin database dump yyc3_knowledge_graph \
        --to-path=/tmp/backup.dump
    docker cp yyc3-neo4j:/tmp/backup.dump "$backup_dir/neo4j_backup.dump"

    # 备份Redis数据
    log_info "备份Redis数据..."
    docker exec yyc3-knowledge-redis redis-cli BGSAVE
    sleep 5
    docker cp yyc3-knowledge-redis:/data/dump.rdb "$backup_dir/redis_backup.rdb"

    # 导出知识图谱数据
    log_info "导出知识图谱结构..."
    local export_data=$(curl -s -X POST http://localhost:8082/api/export \
        -H "Content-Type: application/json" \
        -d '{"format": "json"}')
    echo "$export_data" > "$backup_dir/knowledge_graph_export.json"

    # 创建备份清单
    cat > "$backup_dir/README.md" << EOF
# YYC³ 知识图谱备份
备份时间: $(date)
备份版本: Phase 2 Week 11-12

## 文件说明:
- neo4j_backup.dump: Neo4j数据库备份
- redis_backup.rdb: Redis缓存备份
- knowledge_graph_export.json: 知识图谱结构导出

## 恢复方法:
./deploy-knowledge-graph.sh restore $(basename $backup_dir)
EOF

    log_success "数据备份完成: $backup_dir"
}

# 恢复数据
restore_data() {
    local backup_name=${1:-""}

    if [ -z "$backup_name" ]; then
        log_error "请指定备份名称"
        echo "可用备份:"
        ls -la backups/ | grep "^d" | awk '{print "  " $9}'
        return 1
    fi

    local backup_dir="backups/$backup_name"

    if [ ! -d "$backup_dir" ]; then
        log_error "备份目录不存在: $backup_dir"
        return 1
    fi

    log_step "恢复知识图谱数据..."

    # 停止服务
    log_info "停止服务..."
    docker-compose -f docker-compose.knowledge-graph.yml stop neo4j knowledge-redis

    # 恢复Neo4j数据
    if [ -f "$backup_dir/neo4j_backup.dump" ]; then
        log_info "恢复Neo4j数据..."
        docker cp "$backup_dir/neo4j_backup.dump" yyc3-neo4j:/tmp/restore.dump
        docker exec yyc3-neo4j neo4j-admin database load yyc3_knowledge_graph \
            --from-path=/tmp/restore.dump --overwrite-destination=true
    fi

    # 恢复Redis数据
    if [ -f "$backup_dir/redis_backup.rdb" ]; then
        log_info "恢复Redis数据..."
        docker cp "$backup_dir/redis_backup.rdb" yyc3-knowledge-redis:/data/dump.rdb
    fi

    # 重启服务
    log_info "重启服务..."
    docker-compose -f docker-compose.knowledge-graph.yml start neo4j knowledge-redis

    wait_for_services

    log_success "数据恢复完成"
}

# 停止服务
stop_services() {
    log_info "停止知识图谱服务..."
    docker-compose -f docker-compose.knowledge-graph.yml down
    log_success "知识图谱服务已停止"
}

# 清理服务
cleanup_services() {
    log_info "清理知识图谱服务..."
    docker-compose -f docker-compose.knowledge-graph.yml down -v --remove-orphans
    docker system prune -f
    log_success "知识图谱服务清理完成"
}

# 重启服务
restart_services() {
    log_info "重启知识图谱服务..."
    docker-compose -f docker-compose.knowledge-graph.yml restart
    wait_for_services
    log_success "知识图谱服务重启完成"
}

# 更新服务
update_services() {
    log_info "更新知识图谱服务..."
    docker-compose -f docker-compose.knowledge-graph.yml pull
    docker-compose -f docker-compose.knowledge-graph.yml up -d
    wait_for_services
    log_success "知识图谱服务更新完成"
}

# 打开监控面板
open_monitoring() {
    log_info "打开监控面板..."

    # 打开Grafana
    if command -v open &> /dev/null; then
        open http://localhost:3005
    elif command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3005
    else
        log_info "请手动访问监控面板: http://localhost:3005"
        log_info "用户名: admin, 密码: yyc3-grafana-2025"
    fi
}

# 主函数
main() {
    local command=${1:-help}
    local env_or_option=${2:-$DEFAULT_ENVIRONMENT}

    echo "🧠 YYC³ 知识图谱部署管理"
    echo "============================="

    case $command in
        "deploy")
            check_dependencies
            create_directories
            generate_configs
            deploy_services "$env_or_option"
            wait_for_services
            init_knowledge_graph
            show_status
            ;;
        "init")
            init_knowledge_graph
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
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$env_or_option"
            ;;
        "health")
            health_check
            ;;
        "import")
            import_data "$env_or_option"
            ;;
        "export")
            # 实现导出功能
            log_info "导出知识图谱数据..."
            ;;
        "quality-check")
            perform_quality_check
            ;;
        "backup")
            backup_data
            ;;
        "restore")
            restore_data "$env_or_option"
            ;;
        "cleanup")
            cleanup_services
            ;;
        "monitor")
            open_monitoring
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