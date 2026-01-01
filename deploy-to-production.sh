#!/bin/bash

# YYC³ AI小语守护系统 - 生产环境一键部署脚本
# 服务器: yyc3-33 (8.152.195.33)

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# 服务器配置
SERVER_IP="8.152.195.33"
SERVER_USER="root"
DOMAIN="xiaoyu.0379.email"

# 显示启动信息
show_banner() {
    clear
    echo -e "${PURPLE}"
    echo "███████╗ ██████╗ ██╗██████╗  ██████╗ ██████╗ ████████╗"
    echo "██╔════╝██╔═══██╗██║██╔══██╗██╔════╝██╔═══██╗╚══██╔══╝"
    echo "███████╗██║   ██║██║██████╔╝██║     ██║   ██║   ██║   "
    echo "╚════██║██║   ██║██║██╔══██╗██║     ██║   ██║   ██║   "
    echo "███████║╚██████╔╝██║██║  ██║╚██████╗╚██████╔╝   ██║   "
    echo "╚══════╝ ╚═════╝ ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝    ╚═╝   "
    echo "                                                     "
    echo -e "${CYAN}     AI小语智能成长守护系统 - 生产环境部署${NC}"
    echo -e "${BLUE}     🎯 目标服务器: ${SERVER_IP}${NC}"
    echo -e "${BLUE}     🌐 域名: ${DOMAIN}${NC}"
    echo -e "${BLUE}     📅 部署时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo
    echo -e "${GREEN}     💖 为沫语守护每一个成长瞬间${NC}"
    echo
}

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

# 检查部署前提条件
check_prerequisites() {
    log_info "检查部署前提条件..."

    # 检查本地工具
    local tools=("ssh" "rsync" "curl")
    for tool in "${tools[@]}"; do
        if ! command -v $tool &> /dev/null; then
            log_error "缺少必要工具: $tool"
            exit 1
        fi
    done

    # 测试服务器连接
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo 'Connection OK'" 2>/dev/null; then
        log_error "无法连接到服务器 ${SERVER_USER}@${SERVER_IP}"
        log_error "请检查SSH配置或密钥"
        exit 1
    fi

    log_success "前提条件检查通过"
}

# 服务器环境准备
prepare_server() {
    log_info "准备服务器环境..."

    ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
        echo "=== 系统更新 ==="
        apt update -qq && apt upgrade -y

        echo "=== 安装基础软件 ==="
        apt install -y docker.io docker-compose curl wget git nginx certbot python3-certbot-nginx ufw

        echo "=== 启动Docker服务 ==="
        systemctl start docker
        systemctl enable docker

        echo "=== 创建项目目录 ==="
        mkdir -p /opt/xiaoyu-guardian/{ssl,logs,backups}
        mkdir -p /opt/backups/xiaoyu-guardian

        echo "=== 配置防火墙 ==="
        ufw --force reset
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable

        echo "=== 检查Docker版本 ==="
        docker --version
        docker-compose --version
EOF

    log_success "服务器环境准备完成"
}

# 部署应用代码
deploy_code() {
    log_info "部署应用代码..."

    # 创建临时目录
    TEMP_DEPLOY_DIR="/tmp/xiaoyu-deploy-$(date +%s)"
    mkdir -p ${TEMP_DEPLOY_DIR}

    log_info "准备部署文件..."

    # 复制必要文件
    cp -r services ${TEMP_DEPLOY_DIR}/
    cp package.json ${TEMP_DEPLOY_DIR}/
    cp bun.lockb ${TEMP_DEPLOY_DIR}/
    cp next.config.js ${TEMP_DEPLOY_DIR}/
    cp -r app ${TEMP_DEPLOY_DIR}/
    cp -r lib ${TEMP_DEPLOY_DIR}/
    cp -r public ${TEMP_DEPLOY_DIR}/
    cp -r messages ${TEMP_DEPLOY_DIR}/
    cp middleware.ts ${TEMP_DEPLOY_DIR}/
    cp i18n.ts ${TEMP_DEPLOY_DIR}/
    cp .env.example ${TEMP_DEPLOY_DIR}/

    # 同步到服务器
    log_info "同步代码到服务器..."
    rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" \
        ${TEMP_DEPLOY_DIR}/ ${SERVER_USER}@${SERVER_IP}:/opt/xiaoyu-guardian/

    # 清理临时目录
    rm -rf ${TEMP_DEPLOY_DIR}

    log_success "代码部署完成"
}

# 配置SSL证书
setup_ssl() {
    log_info "配置SSL证书..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        echo "=== 临时Nginx配置 ==="
        cat > /etc/nginx/sites-available/xiaoyu-temp << 'NGINX_EOF'
        server {
            listen 80;
            server_name xiaoyu.0379.email api.xiaoyu.0379.email ai.xiaoyu.0379.email mail.xiaoyu.0379.email;

            location / {
                return 200 'OK - Server Ready';
                add_header Content-Type text/plain;
            }
        }
NGINX_EOF

        echo "=== 启用临时站点 ==="
        ln -sf /etc/nginx/sites-available/xiaoyu-temp /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl reload nginx

        echo "=== 获取SSL证书 ==="
        certbot certonly --nginx --non-interactive --agree-tos \
            --email admin@0379.email \
            -d xiaoyu.0379.email \
            -d api.xiaoyu.0379.email \
            -d ai.xiaoyu.0379.email \
            -d mail.xiaoyu.0379.email \
            || echo "Let's Encrypt失败，使用自签名证书"

        echo "=== 处理SSL证书 ==="
        if [ -f "/etc/letsencrypt/live/xiaoyu.0379.email/fullchain.pem" ]; then
            echo "使用Let's Encrypt证书"
            mkdir -p /opt/xiaoyu-guardian/ssl
            cp /etc/letsencrypt/live/xiaoyu.0379.email/fullchain.pem /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt
            cp /etc/letsencrypt/live/xiaoyu.0379.email/privkey.pem /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key

            # 为其他子域名创建链接
            for subdomain in api ai mail; do
                ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/\${subdomain}.xiaoyu.0379.email.crt
                ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/\${subdomain}.xiaoyu.0379.email.key
            done
        else
            echo "创建自签名证书"
            mkdir -p /opt/xiaoyu-guardian/ssl

            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key \
                -out /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt \
                -subj "/C=CN/ST=Beijing/L=Beijing/O=YYC3/CN=xiaoyu.0379.email"

            # 为其他子域名复制证书
            for subdomain in api ai mail; do
                cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/\${subdomain}.xiaoyu.0379.email.crt
                cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/\${subdomain}.xiaoyu.0379.email.key
            done
        fi

        echo "=== 设置证书权限 ==="
        chmod 600 /opt/xiaoyu-guardian/ssl/*.key
        chmod 644 /opt/xiaoyu-guardian/ssl/*.crt

        echo "=== 配置自动续期 ==="
        echo "0 12 * * * /usr/bin/certbot renew --quiet --post-hook 'systemctl reload nginx'" | crontab -
EOF

    log_success "SSL证书配置完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        cd /opt/xiaoyu-guardian

        echo "=== 生成安全密钥 ==="
        POSTGRES_PASSWORD=\$(openssl rand -base64 32)
        REDIS_PASSWORD=\$(openssl rand -base64 32)
        JWT_SECRET=\$(openssl rand -base64 64)

        echo "=== 创建环境配置文件 ==="
        cat > .env << ENV_EOF
# 数据库配置
POSTGRES_DB=xiaoyu_guardian
POSTGRES_USER=postgres
POSTGRES_PASSWORD=\${POSTGRES_PASSWORD}
XIAOYU_DATABASE_URL=postgresql://postgres:\${POSTGRES_PASSWORD}@postgres:5432/xiaoyu_guardian

# Redis配置
REDIS_PASSWORD=\${REDIS_PASSWORD}
REDIS_URL=redis://:\${REDIS_PASSWORD}@redis:6379

# JWT密钥
JWT_SECRET=\${JWT_SECRET}

# 邮件配置
SMTP_HOST=smtp.0379.email
SMTP_PORT=587
SMTP_USER=noreply@0379.email
SMTP_PASS=your-smtp-password
EMAIL_FROM=noreply@xiaoyu.0379.email

# AI服务配置
LLM_SERVICE_URL=http://llm.0379.email
AI_SERVICE_URL=http://xiaoyu-ai:9000

# 应用配置
NODE_ENV=production
PORT=8000
CORS_ORIGIN=https://xiaoyu.0379.email
FRONTEND_URL=https://xiaoyu.0379.email

# 安全配置
ALLOWED_ORIGINS=https://xiaoyu.0379.email,https://api.xiaoyu.0379.email
MAX_FILE_SIZE=50MB
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
ENV_EOF

        chmod 600 .env
        echo "=== 环境配置文件已创建 ==="
EOF

    log_success "环境变量配置完成"
}

# 构建和启动服务
build_and_start() {
    log_info "构建和启动服务..."

    ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
        cd /opt/xiaoyu-guardian

        echo "=== 构建Docker镜像 ==="
        docker-compose -f services/xiaoyu-api/docker-compose.yml build --no-cache

        echo "=== 启动服务 ==="
        docker-compose -f services/xiaoyu-api/docker-compose.yml up -d

        echo "=== 等待服务启动 ==="
        sleep 45

        echo "=== 检查容器状态 ==="
        docker-compose -f services/xiaoyu-api/docker-compose.yml ps

        echo "=== 检查数据库连接 ==="
        for i in {1..30}; do
            if docker-compose -f services/xiaoyu-api/docker-compose.yml exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
                echo "数据库连接成功"
                break
            else
                echo "等待数据库启动... ($i/30)"
                sleep 2
            fi
        done

        echo "=== 初始化数据库 ==="
        docker-compose -f services/xiaoyu-api/docker-compose.yml exec -T postgres psql -U postgres -d xiaoyu_guardian -f /docker-entrypoint-initdb.d/init.sql

        echo "=== 检查API服务 ==="
        for i in {1..20}; do
            if curl -f http://localhost:8000/health > /dev/null 2>&1; then
                echo "API服务启动成功"
                break
            else
                echo "等待API服务启动... ($i/20)"
                sleep 3
            fi
        done
EOF

    log_success "服务构建和启动完成"
}

# 配置Nginx反向代理
configure_nginx() {
    log_info "配置Nginx反向代理..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        echo "=== 备份原Nginx配置 ==="
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup

        echo "=== 部署新Nginx配置 ==="
        cp /opt/xiaoyu-guardian/services/xiaoyu-api/nginx.conf /etc/nginx/nginx.conf

        echo "=== 测试Nginx配置 ==="
        nginx -t

        echo "=== 重新加载Nginx ==="
        systemctl reload nginx

        echo "=== 启用Nginx自启动 ==="
        systemctl enable nginx
EOF

    log_success "Nginx配置完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署结果..."

    echo "等待DNS解析生效..."
    sleep 30

    # 测试主站
    log_info "测试主站访问..."
    if curl -k -s -o /dev/null -w "%{http_code}" https://${DOMAIN} | grep -q "200\|301\|302"; then
        log_success "✅ 主站访问正常: https://${DOMAIN}"
    else
        log_warning "⚠️ 主站访问异常，请检查域名解析"
    fi

    # 测试API
    log_info "测试API服务..."
    if curl -k -s -o /dev/null -w "%{http_code}" https://api.${DOMAIN}/health | grep -q "200"; then
        log_success "✅ API服务正常: https://api.${DOMAIN}/health"
    else
        log_warning "⚠️ API服务访问异常"
    fi

    # 显示服务状态
    ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
        echo ""
        echo "=== 🐳 Docker容器状态 ==="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep xiaoyu

        echo ""
        echo "=== 💾 磁盘使用情况 ==="
        df -h | grep -E "(Filesystem|/dev/)"

        echo ""
        echo "=== 🧠 内存使用情况 ==="
        free -h

        echo ""
        echo "=== 🌐 网络端口监听 ==="
        ss -tuln | grep -E ':(80|443|8000|9000|5432|6379|10000)'

        echo ""
        echo "=== 📋 服务日志摘要 ==="
        docker-compose -f /opt/xiaoyu-guardian/services/xiaoyu-api/docker-compose.yml logs --tail=5
EOF
}

# 显示部署完成信息
show_completion_info() {
    log_success "🎉 部署完成！"
    echo
    echo -e "${PURPLE}=== 🌐 访问信息 ===${NC}"
    echo -e "${GREEN}🏠 主站:${NC} https://xiaoyu.0379.email"
    echo -e "${GREEN}🔧 API:${NC} https://api.xiaoyu.0379.email"
    echo -e "${GREEN}🤖 AI服务:${NC} https://ai.xiaoyu.0379.email"
    echo -e "${GREEN}📧 邮件服务:${NC} https://mail.xiaoyu.0379.email"
    echo

    echo -e "${PURPLE}=== 🛠️ 管理命令 ===${NC}"
    echo -e "${CYAN}查看日志:${NC} ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/xiaoyu-guardian && docker-compose logs -f'"
    echo -e "${CYAN}重启服务:${NC} ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/xiaoyu-guardian && docker-compose restart'"
    echo -e "${CYAN}查看状态:${NC} ssh ${SERVER_USER}@${SERVER_IP} 'cd /opt/xiaoyu-guardian && docker-compose ps'"
    echo

    echo -e "${PURPLE}=== 📝 重要提醒 ===${NC}"
    echo -e "${YELLOW}1. 确保域名解析已正确配置指向 ${SERVER_IP}${NC}"
    echo -e "${YELLOW}2. 首次访问可能需要等待1-2分钟服务完全启动${NC}"
    echo -e "${YELLOW}3. 如果使用自签名证书，浏览器会显示安全警告${NC}"
    echo -e "${YELLOW}4. 建议配置邮件SMTP服务以启用通知功能${NC}"
    echo

    echo -e "${GREEN}🎊 小语守护系统已成功部署到生产环境！${NC}"
    echo -e "${GREEN}💖 沫语现在可以享受企业级的AI成长守护服务了！${NC}"
    echo
    echo -e "${PURPLE}❤️ 技术守护无障碍，父爱陪伴永在线！${NC}"
    echo
}

# 主执行流程
main() {
    show_banner

    echo -e "${YELLOW}即将开始部署到生产环境: ${SERVER_IP}${NC}"
    echo -e "${YELLOW}域名: ${DOMAIN}${NC}"
    echo
    read -p "确认部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "部署已取消"
        exit 1
    fi

    echo
    log_info "开始部署流程..."

    check_prerequisites
    prepare_server
    deploy_code
    setup_ssl
    setup_environment
    build_and_start
    configure_nginx
    verify_deployment
    show_completion_info

    log_success "🎉 部署流程全部完成！"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查上述输出"; exit 1' ERR

# 执行主函数
main "$@"