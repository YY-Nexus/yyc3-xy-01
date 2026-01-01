#!/bin/bash

# YYC³ 数据分析平台部署脚本
# 支持Kafka、Flink、ClickHouse、数据分析服务、可视化服务的一键部署

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
COMPOSE_FILE="$PROJECT_DIR/docker-compose.data-analytics.yml"
COMPOSE_FILE_MICROSERVICES="$PROJECT_DIR/docker-compose.microservices.yml"
COMPOSE_PROFILE="${1:-full}"

# 服务端口映射
declare -A SERVICE_PORTS=(
    ["kafka"]="9092"
    ["kafka-ui"]="8080"
    ["flink-jobmanager"]="8081"
    ["clickhouse"]="8123"
    ["elasticsearch"]="9200"
    ["kibana"]="5601"
    ["realtime-analytics"]="8101"
    ["analytics-report"]="8102"
    ["prediction"]="8103"
    ["business-insights"]="8104"
    ["event-collector"]="8105"
    ["analytics-dashboard"]="3100"
    ["superset"]="8088"
    ["redis-stream"]="6380"
)

# 检查系统依赖
check_system_dependencies() {
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

    # 检查系统资源
    local total_memory=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    local available_disk=$(df -BG / | awk 'NR==2{print $4}' | sed 's/G//')

    if [ "$total_memory" -lt 8192 ]; then
        log_warn "系统内存不足8GB，可能影响大数据分析平台性能"
    fi

    if [ "$available_disk" -lt 50 ]; then
        log_warn "磁盘可用空间不足50GB，可能影响数据存储"
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

    log_info "系统依赖检查完成"
}

# 环境准备
prepare_environment() {
    log_step "准备数据分析平台环境..."

    # 创建必要的目录
    mkdir -p "$PROJECT_DIR/analytics/services/realtime-analytics/logs"
    mkdir -p "$PROJECT_DIR/analytics/services/analytics-report/logs"
    mkdir -p "$PROJECT_DIR/analytics/services/prediction/logs"
    mkdir -p "$PROJECT_DIR/analytics/services/business-insights/logs"
    mkdir -p "$PROJECT_DIR/analytics/collectors/event-collector/logs"
    mkdir -p "$PROJECT_DIR/analytics/dashboard/logs"
    mkdir -p "$PROJECT_DIR/analytics/clickhouse/config"
    mkdir -p "$PROJECT_DIR/analytics/clickhouse/init"
    mkdir -p "$PROJECT_DIR/analytics/flink/jobs"
    mkdir -p "$PROJECT_DIR/analytics/superset/config"
    mkdir -p "$PROJECT_DIR/analytics/superset/dashboards"
    mkdir -p "$PROJECT_DIR/analytics/reports/templates"
    mkdir -p "$PROJECT_DIR/analytics/reports/output"

    # 创建ClickHouse配置
    cat > "$PROJECT_DIR/analytics/clickhouse/config/config.xml" << 'EOF'
<?xml version="1.0"?>
<yandex>
    <logger>
        <level>information</level>
        <console>true</console>
    </logger>

    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <mysql_port>9004</mysql_port>

    <listen_host>::</listen_host>
    <listen_host>0.0.0.0</listen_host>

    <max_connections>4096</max_connections>
    <keep_alive_timeout>3</keep_alive_timeout>
    <max_concurrent_queries>100</max_concurrent_queries>

    <uncompressed_cache_size>8589934592</uncompressed_cache_size>
    <mark_cache_size>5368709120</mark_cache_size>

    <path>/var/lib/clickhouse/</path>
    <tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

    <users_config>users.xml</users_config>
    <default_profile>default</default_profile>
    <default_database>default</default_database>

    <timezone>Asia/Shanghai</timezone>

    <remote_servers incl="clickhouse_remote_servers" />
    <zookeeper incl="zookeeper-servers" optional="true" />
    <macros incl="macros" optional="true" />

    <builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>

    <max_session_timeout>3600</max_session_timeout>
    <default_session_timeout>60</default_session_timeout>
</yandex>
EOF

    # 创建ClickHouse用户配置
    cat > "$PROJECT_DIR/analytics/clickhouse/config/users.xml" << 'EOF'
<?xml version="1.0"?>
<yandex>
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>random</load_balancing>
        </default>
        <readonly>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>random</load_balancing>
            <readonly>1</readonly>
        </readonly>
    </profiles>

    <users>
        <default>
            <password></password>
            <networks incl="networks" replace="replace">
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <quota>default</quota>
            <databases>
                <database_name>
                    <filter_expression>.*</filter_expression>
                </database_name>
            </databases>
        </default>
        <yyc3>
            <password>analytics_password</password>
            <networks incl="networks" replace="replace">
                <ip>::/0</ip>
            </networks>
            <profile>default</profile>
            <quota>default</quota>
            <databases>
                <yyc3_analytics>
                    <filter_expression>.*</filter_expression>
                </yyc3_analytics>
            </databases>
        </yyc3>
    </users>

    <networks>
        <ip>::/0</ip>
    </networks>
</yandex>
EOF

    # 创建ClickHouse初始化脚本
    cat > "$PROJECT_DIR/analytics/clickhouse/init/01-init-database.sql" << 'EOF'
-- 创建YYC³分析数据库
CREATE DATABASE IF NOT EXISTS yyc3_analytics;

-- 使用数据库
USE yyc3_analytics;

-- 用户行为事件表
CREATE TABLE IF NOT EXISTS user_events_local (
    event_uuid UUID,
    user_id String,
    session_id String,
    event_type Enum8('click' = 1, 'view' = 2, 'search' = 3, 'chat' = 4, 'page_view' = 5),
    event_timestamp DateTime,
    properties Map(String, String),
    source String,
    created_date Date MATERIALIZED toDate(event_timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_date)
ORDER BY (user_id, event_timestamp, event_type)
TTL created_date + INTERVAL 90 DAY;

-- AI对话表
CREATE TABLE IF NOT EXISTS ai_conversations_local (
    conversation_id UUID,
    user_id String,
    message_type Enum8('user' = 1, 'assistant' = 2),
    content String,
    sentiment_score Float32,
    topics Array(String),
    response_time_ms UInt32,
    satisfaction_score Float32,
    timestamp DateTime,
    created_date Date MATERIALIZED toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_date)
ORDER BY (conversation_id, timestamp);

-- 成长记录表
CREATE TABLE IF NOT EXISTS growth_updates_local (
    update_id UUID,
    user_id String,
    growth_type Enum8('learning_time' = 1, 'skill_improvement' = 2, 'milestone' = 3),
    improvement_value Float32,
    previous_value Float32,
    timestamp DateTime,
    created_date Date MATERIALIZED toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_date)
ORDER BY (user_id, growth_type, timestamp);

-- 推荐反馈表
CREATE TABLE IF NOT EXISTS recommendation_feedback_local (
    feedback_id UUID,
    user_id String,
    recommendation_id String,
    rating UInt8,
    feedback_text String,
    timestamp DateTime,
    created_date Date MATERIALIZED toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_date)
ORDER BY (user_id, recommendation_id, timestamp);

-- 系统指标表
CREATE TABLE IF NOT EXISTS system_metrics_local (
    metric_id UUID,
    metric_name String,
    metric_value Float64,
    threshold Float64,
    unit String,
    timestamp DateTime,
    created_date Date MATERIALIZED toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(created_date)
ORDER BY (metric_name, timestamp);
EOF

    # 创建Flink作业配置
    cat > "$PROJECT_DIR/analytics/flink/jobs/data-analytics-job.properties" << 'EOF'
# Flink作业配置
flink.job.name: YYC3-Data-Analytics-Job
flink.parallelism: 4
flink.checkpoint.interval: 60000
flink.checkpoint.timeout: 300000
flink.restart-strategy: fixed-delay
flink.restart-strategy.fixed-delay.attempts: 3
flink.restart-strategy.fixed-delay.delay: 10000
EOF

    # 创建Superset配置
    cat > "$PROJECT_DIR/analytics/superset/config/superset_config.py" << 'EOF'
from celery.schedules import crontab

# Superset配置
FEATURE_FLAGS = {
    'ALERT_REPORTS': True,
    'DASHBOARD_RBAC': True,
    'ENABLE_CHART_ASYNC_EXPORT': True,
    'DYNAMIC_PLUGINS': True,
}

# 数据库配置
SQLALCHEMY_DATABASE_URI = 'clickhouse+yyc3:yyc3:analytics_password@clickhouse:9000/yyc3_analytics'

# Redis配置
REDIS_URL = 'redis://redis-stream:6379/0'

# Celery配置
CELERY_CONFIG = {
    'BROKER_URL': 'redis://redis-stream:6379/1',
    'RESULT_BACKEND': 'redis://redis-stream:6379/2',
    'CELERYBEAT_SCHEDULE': {
        'analytics.daily_report': {
            'task': 'analytics.reports.daily',
            'schedule': crontab(hour=8, minute=0),
        },
    }
}

# 邮件配置
SMTP_HOST = os.environ.get('SMTP_HOST', 'localhost')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USER = os.environ.get('SMTP_USER', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASS', '')
SMTP_MAIL_FROM = os.environ.get('SMTP_MAIL_FROM', 'noreply@yyc3.app')

# 安全配置
SECRET_KEY = os.environ.get('SUPERSET_SECRET_KEY', 'yyc3-superset-secret-key-2023')
ENABLE_PROXY_FIX = True
ENABLE_CORS = True
CORS_ALLOW_ORIGIN = ['http://localhost:3100', 'https://yyc3.app']
EOF

    log_info "环境准备完成"
}

# 构建数据分析服务
build_analytics_services() {
    log_step "构建数据分析服务..."

    local services=(
        "analytics/services/realtime-analytics"
        "analytics/services/analytics-report"
        "analytics/services/prediction"
        "analytics/services/business-insights"
        "analytics/collectors/event-collector"
        "analytics/dashboard"
    )

    for service in "${services[@]}"; do
        if [ -f "$PROJECT_DIR/$service/Dockerfile" ]; then
            log_info "构建服务: $service"
            cd "$PROJECT_DIR/$service"
            docker build -t "yyc3-$(basename $service)" .
            cd "$PROJECT_DIR"
        else
            log_warn "Dockerfile不存在，跳过: $service"
        fi
    done

    log_info "数据分析服务构建完成"
}

# 部署数据分析平台
deploy_analytics_platform() {
    log_step "部署数据分析平台..."

    cd "$PROJECT_DIR"

    # 根据配置文件选择部署的配置文件
    local compose_cmd="docker-compose"
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi

    # 先启动微服务基础架构
    if [ -f "$COMPOSE_FILE_MICROSERVICES" ]; then
        log_info "启动微服务基础架构..."
        $compose_cmd -f "$COMPOSE_FILE_MICROSERVICES" up -d consul postgres redis neo4j
        sleep 30
    fi

    # 部署数据分析基础设施
    log_info "部署数据分析基础设施..."
    $compose_cmd -f "$COMPOSE_FILE" up -d zookeeper kafka

    # 等待Kafka就绪
    log_info "等待Kafka启动..."
    sleep 30

    # 部署数据处理层
    log_info "部署数据处理层..."
    $compose_cmd -f "$COMPOSE_FILE" up -d flink-jobmanager flink-taskmanager clickhouse redis-stream elasticsearch

    # 等待数据处理层就绪
    log_info "等待数据处理服务启动..."
    sleep 45

    # 部署分析服务
    log_info "部署分析服务..."
    $compose_cmd -f "$COMPOSE_FILE" up -d \
        event-collector \
        realtime-analytics-service \
        analytics-report-service \
        prediction-service \
        business-insights-service

    # 等待分析服务就绪
    log_info "等待分析服务启动..."
    sleep 30

    # 部署可视化层
    log_info "部署可视化层..."
    $compose_cmd -f "$COMPOSE_FILE" up -d kafka-ui kibana analytics-dashboard superset

    log_info "数据分析平台部署完成"
}

# 初始化数据
initialize_data() {
    log_step "初始化数据分析平台..."

    # 等待ClickHouse就绪
    log_info "等待ClickHouse就绪..."
    local clickhouse_ready=false
    for i in {1..30}; do
        if curl -f http://localhost:8123/ping &>/dev/null; then
            clickhouse_ready=true
            break
        fi
        sleep 2
    done

    if [ "$clickhouse_ready" = true ]; then
        log_info "ClickHouse已就绪，执行初始化脚本..."

        # 创建数据库和表
        curl -X POST http://localhost:8123 --data "CREATE DATABASE IF NOT EXISTS yyc3_analytics"

        # 执行初始化SQL
        if [ -f "$PROJECT_DIR/analytics/clickhouse/init/01-init-database.sql" ]; then
            curl -X POST http://localhost:8123 \
                 -H "Content-Type: text/plain" \
                 --data-binary @"$PROJECT_DIR/analytics/clickhouse/init/01-init-database.sql"
        fi

        log_info "ClickHouse初始化完成"
    else
        log_error "ClickHouse启动超时"
    fi

    # 初始化Superset
    log_info "初始化Superset..."
    if docker ps | grep -q yyc3-superset; then
        # 创建管理员用户
        docker exec yyc3-superset superset fab create-admin \
            --username admin \
            --firstname Admin \
            --lastname User \
            --email admin@yyc3.app \
            --password admin

        # 初始化数据库
        docker exec yyc3-superset superset db upgrade

        # 创建示例数据和角色
        docker exec yyc3-superset superset init

        log_info "Superset初始化完成"
    fi

    log_info "数据初始化完成"
}

# 验证部署
verify_deployment() {
    log_step "验证数据分析平台部署..."

    local compose_cmd="docker-compose"
    if docker compose version &> /dev/null; then
        compose_cmd="docker compose"
    fi

    # 检查服务状态
    log_info "检查服务健康状态..."
    local failed_services=()

    # 核心服务健康检查
    local services=(
        "kafka:9092"
        "clickhouse:8123"
        "flink-jobmanager:8081"
        "elasticsearch:9200"
        "realtime-analytics:8101"
        "analytics-dashboard:3100"
    )

    for service in "${services[@]}"; do
        local service_name="${service%%:*}"
        local port="${service##*:}"

        log_info "检查 $service_name (端口 $port)..."

        case $service_name in
            "kafka")
                if docker exec yyc3-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 &>/dev/null; then
                    log_info "✅ $service_name 运行正常"
                else
                    failed_services+=("$service_name")
                    log_error "❌ $service_name 健康检查失败"
                fi
                ;;
            "clickhouse")
                if curl -f http://localhost:$port/ping &>/dev/null; then
                    log_info "✅ $service_name 运行正常"
                else
                    failed_services+=("$service_name")
                    log_error "❌ $service_name 健康检查失败"
                fi
                ;;
            "flink-jobmanager")
                if curl -f http://localhost:$port &>/dev/null; then
                    log_info "✅ $service_name 运行正常"
                else
                    failed_services+=("$service_name")
                    log_error "❌ $service_name 健康检查失败"
                fi
                ;;
            "elasticsearch")
                if curl -f http://localhost:$port/_cluster/health &>/dev/null; then
                    log_info "✅ $service_name 运行正常"
                else
                    failed_services+=("$service_name")
                    log_error "❌ $service_name 健康检查失败"
                fi
                ;;
            *)
                if curl -f http://localhost:$port/health &>/dev/null; then
                    log_info "✅ $service_name 运行正常"
                else
                    failed_services+=("$service_name")
                    log_error "❌ $service_name 健康检查失败"
                fi
                ;;
        esac
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
    log_info "数据分析平台访问地址："
    echo "  📊 数据分析仪表板:   http://localhost:3100"
    echo "  🔄 Kafka UI:        http://localhost:8080"
    echo "  ⚡ Flink UI:         http://localhost:8081"
    echo "  🗄️ ClickHouse:      http://localhost:8123"
    echo "  🔍 Elasticsearch:  http://localhost:9200"
    echo "  📈 Kibana:           http://localhost:5601"
    echo "  🎯 Superset:        http://localhost:8088 (admin/admin)"
    echo "  📡 实时分析API:      http://localhost:8101"
    echo "  📋 报表服务API:      http://localhost:8102"
    echo "  🔮 预测分析API:      http://localhost:8103"
    echo "  💡 业务洞察API:      http://localhost:8104"
    echo "  📥 事件收集器:       http://localhost:8105"
    echo

    log_info "API服务端点："
    echo "  📊 实时指标:         http://localhost:8101/api/v1/realtime/metrics"
    echo "  📈 趋势分析:         http://localhost:8101/api/v1/analytics/trends"
    echo "  🔍 异常检测:         http://localhost:8101/api/v1/analytics/anomalies"
    echo "  📋 生成报表:         http://localhost:8102/api/v1/reports/generate"
    echo "  🔮 预测分析:         http://localhost:8103/api/v1/prediction/forecast"
    echo "  💡 业务洞察:         http://localhost:8104/api/v1/insights"
}

# 显示帮助信息
show_help() {
    cat << EOF
YYC³ 数据分析平台部署脚本

用法: $0 [COMMAND] [OPTIONS]

命令:
  deploy     部署完整的数据分析平台
  build      构建所有分析服务镜像
  status     显示服务状态
  logs       显示服务日志
  stop       停止所有服务
  restart    重启所有服务
  clean      清理所有容器和数据
  health     健康检查
  help       显示此帮助信息

示例:
  $0 deploy           # 部署完整平台
  $0 status           # 查看服务状态
  $0 logs clickhouse  # 查看ClickHouse日志
  $0 restart          # 重启所有服务
  $0 clean            # 清理环境

更多信息请查看文档: PHASE2-WEEK15-16-DATA-ANALYTICS-PLAN.md
EOF
}

# 主函数
main() {
    case "${1:-deploy}" in
        "deploy")
            log_info "开始部署YYC³数据分析平台..."
            check_system_dependencies
            prepare_environment
            build_analytics_services
            deploy_analytics_platform
            initialize_data
            verify_deployment
            ;;
        "build")
            log_info "构建数据分析服务..."
            build_analytics_services
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