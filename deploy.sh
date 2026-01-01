#!/bin/bash

# YYC³ 智能插拔式移动AI系统 - 一键部署脚本
# Intelligent Pluggable Mobile AI System One-Click Deployment Script

set -e

# 颜色定义
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

# 显示横幅
show_banner() {
    echo -e "${BLUE}"
    echo "=================================================="
    echo "  YYC³ 智能插拔式移动AI系统"
    echo "  Intelligent Pluggable Mobile AI System"
    echo "  One-Click Deployment Script"
    echo "=================================================="
    echo -e "${NC}"
}

# 检查系统依赖
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

    # 检查Bun
    if ! command -v bun &> /dev/null; then
        log_warning "Bun 未安装，将使用 Docker 构建"
    fi

    log_success "系统依赖检查完成"
}

# 检查环境变量
check_env() {
    log_info "检查环境变量..."

    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            log_warning "未找到 .env.local 文件，将从 .env.example 复制"
            cp .env.example .env.local
            log_warning "请编辑 .env.local 文件并填入正确的配置值"
            read -p "是否现在编辑 .env.local 文件？(y/n): " edit_env
            if [ "$edit_env" = "y" ] || [ "$edit_env" = "Y" ]; then
                ${EDITOR:-nano} .env.local
            fi
        else
            log_error "未找到 .env.example 文件"
            exit 1
        fi
    fi

    log_success "环境变量检查完成"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    mkdir -p data logs uploads knowledge config/{nginx,redis,monitoring} backups

    log_success "目录创建完成"
}

# 构建和启动服务
build_and_start() {
    log_info "构建和启动服务..."

    # 停止现有服务
    docker-compose down --remove-orphans 2>/dev/null || true

    # 构建镜像
    log_info "构建 Docker 镜像..."
    docker-compose build --no-cache

    # 启动服务
    log_info "启动服务..."
    docker-compose up -d

    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."

    # 等待数据库启动
    log_info "等待 PostgreSQL 启动..."
    timeout 60 bash -c 'until docker-compose exec -T postgres pg_isready -U postgres; do sleep 2; done'

    # 等待Redis启动
    log_info "等待 Redis 启动..."
    timeout 30 bash -c 'until docker-compose exec -T redis redis-cli ping; do sleep 2; done'

    # 等待Elasticsearch启动
    log_info "等待 Elasticsearch 启动..."
    timeout 60 bash -c 'until curl -s http://localhost:9200/_cluster/health | grep -q '"green'"'"''; do sleep 5; done'

    # 等待主应用启动
    log_info "等待主应用启动..."
    timeout 120 bash -c 'until curl -s http://localhost:1229/api/health | grep -q '"ok"''; do sleep 5; done'

    log_success "所有服务已就绪"
}

# 初始化数据库
init_database() {
    log_info "初始化数据库..."

    # 运行数据库迁移
    if [ -f "scripts/init-db.sql" ]; then
        docker-compose exec -T postgres psql -U postgres -d yyc3_ai -f /docker-entrypoint-initdb.d/init.sql
    fi

    log_success "数据库初始化完成"
}

# 运行健康检查
health_check() {
    log_info "运行健康检查..."

    # 检查主应用
    if curl -s http://localhost:1229/api/health | grep -q "ok"; then
        log_success "主应用健康检查通过"
    else
        log_error "主应用健康检查失败"
    fi

    # 检查API网关
    if curl -s http://localhost:1229/api/gateway/health | grep -q "ok"; then
        log_success "API网关健康检查通过"
    else
        log_warning "API网关健康检查失败"
    fi

    # 检查各个服务状态
    docker-compose ps
}

# 显示部署信息
show_deployment_info() {
    log_success "🎉 YYC³ 智能插拔式移动AI系统部署完成！"
    echo ""
    echo "访问地址："
    echo "  主应用: http://localhost:1229"
    echo "  API网关: http://localhost:1229/api"
    echo "  Nginx代理: http://localhost"
    echo ""
    echo "管理工具："
    echo "  Grafana监控: http://localhost:3001 (admin/admin123)"
    echo "  Prometheus: http://localhost:9090"
    echo "  Jaeger追踪: http://localhost:16686"
    echo "  Kibana日志: http://localhost:5601"
    echo ""
    echo "数据库连接："
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis: localhost:6379"
    echo "  Elasticsearch: localhost:9200"
    echo ""
    echo "常用命令："
    echo "  查看日志: docker-compose logs -f yyc3-main"
    echo "  重启服务: docker-compose restart yyc3-main"
    echo "  停止服务: docker-compose down"
    echo "  查看状态: docker-compose ps"
    echo ""
}

# 主函数
main() {
    show_banner

    # 检查是否为root用户
    if [ "$EUID" -eq 0 ]; then
        log_warning "不建议以 root 用户运行此脚本"
        read -p "是否继续？(y/n): " continue_as_root
        if [ "$continue_as_root" != "y" ] && [ "$continue_as_root" != "Y" ]; then
            exit 1
        fi
    fi

    # 解析命令行参数
    case "${1:-deploy}" in
        "deploy")
            check_dependencies
            check_env
            create_directories
            build_and_start
            wait_for_services
            init_database
            health_check
            show_deployment_info
            ;;
        "stop")
            log_info "停止所有服务..."
            docker-compose down
            log_success "服务已停止"
            ;;
        "restart")
            log_info "重启所有服务..."
            docker-compose restart
            log_success "服务已重启"
            ;;
        "logs")
            docker-compose logs -f yyc3-main
            ;;
        "status")
            docker-compose ps
            ;;
        "clean")
            log_warning "这将删除所有容器、镜像和数据卷"
            read -p "确定要继续吗？(y/n): " confirm_clean
            if [ "$confirm_clean" = "y" ] || [ "$confirm_clean" = "Y" ]; then
                docker-compose down -v --rmi all
                docker system prune -f
                log_success "清理完成"
            fi
            ;;
        "dev")
            log_info "启动开发环境..."
            if command -v bun &> /dev/null; then
                bun install
                bun run dev
            else
                log_error "需要安装 Bun 来运行开发环境"
                exit 1
            fi
            ;;
        "help"|"-h"|"--help")
            echo "用法: $0 [command]"
            echo ""
            echo "命令:"
            echo "  deploy   - 部署生产环境 (默认)"
            echo "  stop     - 停止所有服务"
            echo "  restart  - 重启所有服务"
            echo "  logs     - 查看主应用日志"
            echo "  status   - 查看服务状态"
            echo "  clean    - 清理所有容器和数据"
            echo "  dev      - 启动开发环境"
            echo "  help     - 显示此帮助信息"
            ;;
        *)
            log_error "未知命令: $1"
            echo "使用 '$0 help' 查看可用命令"
            exit 1
            ;;
    esac
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"