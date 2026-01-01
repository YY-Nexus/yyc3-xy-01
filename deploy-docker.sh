#!/bin/bash

# YYC³ AI小语智能成长守护系统 - Docker部署脚本
# Intelligent Pluggable Mobile AI System - Docker Deployment Script
# Phase 1 Week 7-8: DevOps与部署优化

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# 检查Docker和Docker Compose
check_dependencies() {
    log_info "检查依赖项..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    log_success "依赖项检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    mkdir -p data logs uploads knowledge
    mkdir -p logs/nginx logs/app
    mkdir -p backups
    mkdir -p config/nginx/ssl
    mkdir -p monitoring/grafana/dashboards monitoring/grafana/datasources
    mkdir -p database/init
    mkdir -p redis

    log_success "目录创建完成"
}

# 检查环境变量文件
check_env_file() {
    log_info "检查环境变量文件..."

    if [ ! -f .env.docker ]; then
        log_error ".env.docker 文件不存在，请先创建环境变量文件"
        exit 1
    fi

    # 检查必需的环境变量
    source .env.docker

    required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "OPENAI_API_KEY")
    missing_vars=()

    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] || [ "${!var}" = "your_${,,var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "以下环境变量需要配置: ${missing_vars[*]}"
        exit 1
    fi

    log_success "环境变量检查完成"
}

# 生成SSL证书（自签名，生产环境请使用正式证书）
generate_ssl_cert() {
    log_info "生成SSL证书..."

    if [ ! -f config/nginx/ssl/cert.pem ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout config/nginx/ssl/key.pem \
            -out config/nginx/ssl/cert.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=YYC3/OU=AI/CN=localhost" \
            2>/dev/null || true

        if [ -f config/nginx/ssl/cert.pem ]; then
            log_success "SSL证书生成完成"
        else
            log_warning "SSL证书生成失败，将使用HTTP"
        fi
    else
        log_success "SSL证书已存在"
    fi
}

# 创建数据库初始化脚本
create_database_init() {
    log_info "创建数据库初始化脚本..."

    cat > database/init.sql << 'EOF'
-- YYC³ AI小语智能成长守护系统 - 数据库初始化脚本
-- Intelligent Pluggable Mobile AI System - Database Initialization

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'parent',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建儿童档案表
CREATE TABLE IF NOT EXISTS children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10),
    avatar_url TEXT,
    interests JSONB DEFAULT '[]',
    learning_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建AI会话表
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    ai_role VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建AI消息表
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user' or 'ai'
    content TEXT NOT NULL,
    ai_role VARCHAR(50),
    sentiment_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建成长记录表
CREATE TABLE IF NOT EXISTS growth_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID REFERENCES children(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    media_urls JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    record_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_child_id ON ai_conversations(child_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_child_id ON growth_records(child_id);
CREATE INDEX IF NOT EXISTS idx_growth_record_record_date ON growth_records(record_date);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_records_updated_at BEFORE UPDATE ON growth_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF

    log_success "数据库初始化脚本创建完成"
}

# 构建和启动服务
deploy_services() {
    local env=${1:-production}

    log_info "开始部署服务 (环境: $env)..."

    # 加载环境变量
    source .env.docker

    if [ "$env" = "production" ]; then
        # 生产环境
        docker-compose -f docker-compose.yml up -d --build
    elif [ "$env" = "development" ]; then
        # 开发环境，包含调试工具
        docker-compose -f docker-compose.yml --profile development up -d --build
    else
        log_error "不支持的环境: $env"
        exit 1
    fi

    log_success "服务部署完成"
}

# 等待服务启动
wait_for_services() {
    log_info "等待服务启动..."

    # 等待数据库启动
    log_info "等待数据库启动..."
    timeout 60 bash -c 'until docker exec yyc3-postgres pg_isready -U yyc3; do sleep 2; done'

    # 等待Redis启动
    log_info "等待Redis启动..."
    timeout 30 bash -c 'until docker exec yyc3-redis redis-cli ping; do sleep 2; done'

    # 等待主应用启动
    log_info "等待主应用启动..."
    timeout 120 bash -c 'until curl -f http://localhost:8080/api/health; do sleep 5; done'

    log_success "所有服务启动完成"
}

# 运行健康检查
health_check() {
    log_info "执行健康检查..."

    # 检查主应用
    if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
        log_success "✓ 主应用健康检查通过"
    else
        log_error "✗ 主应用健康检查失败"
        return 1
    fi

    # 检查Nginx
    if curl -f http://localhost > /dev/null 2>&1; then
        log_success "✓ Nginx健康检查通过"
    else
        log_warning "✗ Nginx健康检查失败"
    fi

    # 检查数据库连接
    if docker exec yyc3-postgres pg_isready -U yyc3 > /dev/null 2>&1; then
        log_success "✓ 数据库连接正常"
    else
        log_error "✗ 数据库连接失败"
        return 1
    fi

    # 检查Redis连接
    if docker exec yyc3-redis redis-cli ping > /dev/null 2>&1; then
        log_success "✓ Redis连接正常"
    else
        log_error "✗ Redis连接失败"
        return 1
    fi

    log_success "健康检查完成"
}

# 显示服务状态
show_status() {
    log_info "服务状态:"
    docker-compose ps

    echo ""
    log_info "服务访问地址:"
    echo "🌐 主应用: http://localhost:8080"
    echo "🌐 Nginx: http://localhost"
    echo "📊 Grafana: http://localhost:3001 (admin: admin)"
    echo "📈 Prometheus: http://localhost:9090"
    echo "🔍 Kibana: http://localhost:5601"

    if docker ps --format "table {{.Names}}" | grep -q "yyc3-adminer"; then
        echo "🗄️  数据库管理: http://localhost:8080"
    fi

    if docker ps --format "table {{.Names}}" | grep -q "yyc3-redis-commander"; then
        echo "🔴 Redis管理: http://localhost:8081"
    fi
}

# 清理函数
cleanup() {
    log_info "清理旧容器和镜像..."
    docker-compose down
    docker system prune -f
    log_success "清理完成"
}

# 主函数
main() {
    local command=${1:-deploy}
    local env=${2:-production}

    echo "🚀 YYC³ AI小语智能成长守护系统 - Docker部署管理"
    echo "=================================================="

    case $command in
        "deploy")
            check_dependencies
            create_directories
            check_env_file
            generate_ssl_cert
            create_database_init
            deploy_services $env
            wait_for_services
            health_check
            show_status
            ;;
        "update")
            log_info "更新服务..."
            deploy_services $env
            wait_for_services
            health_check
            show_status
            ;;
        "stop")
            log_info "停止服务..."
            docker-compose down
            log_success "服务已停止"
            ;;
        "restart")
            log_info "重启服务..."
            docker-compose restart
            wait_for_services
            health_check
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "health")
            health_check
            ;;
        *)
            echo "用法: $0 {deploy|update|stop|restart|logs|status|cleanup|health} [production|development]"
            echo ""
            echo "命令说明:"
            echo "  deploy     - 首次部署所有服务"
            echo "  update     - 更新现有服务"
            echo "  stop       - 停止所有服务"
            echo "  restart    - 重启所有服务"
            echo "  logs       - 查看服务日志"
            echo "  status     - 显示服务状态"
            echo "  cleanup    - 清理容器和镜像"
            echo "  health     - 执行健康检查"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"