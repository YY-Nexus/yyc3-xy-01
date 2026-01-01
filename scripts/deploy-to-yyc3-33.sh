#!/bin/bash

# YYC³ AI小语守护系统 - 生产环境部署脚本
# 目标服务器: yyc3-33 (8.152.195.33)

set -e

# 配置变量
SERVER_IP="8.152.195.33"
SERVER_USER="root"
PROJECT_NAME="xiaoyu-guardian"
DEPLOY_PATH="/opt/${PROJECT_NAME}"
BACKUP_PATH="/opt/backups/${PROJECT_NAME}"
DOMAIN="xiaoyu.0379.email"

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

# 检查依赖
check_dependencies() {
    log_info "检查本地依赖..."

    if ! command -v ssh &> /dev/null; then
        log_error "SSH未安装"
        exit 1
    fi

    if ! command -v rsync &> /dev/null; then
        log_error "rsync未安装"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装"
        exit 1
    fi

    log_success "本地依赖检查通过"
}

# 测试服务器连接
test_server_connection() {
    log_info "测试服务器连接..."

    if ssh -o ConnectTimeout=10 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo 'Connection successful'" 2>/dev/null; then
        log_success "服务器连接正常"
    else
        log_error "无法连接到服务器 ${SERVER_USER}@${SERVER_IP}"
        log_error "请检查SSH配置"
        exit 1
    fi
}

# 准备服务器环境
prepare_server() {
    log_info "准备服务器环境..."

    ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
        # 更新系统
        apt update && apt upgrade -y

        # 安装必要软件
        apt install -y docker.io docker-compose curl wget git nginx certbot python3-certbot-nginx

        # 启动Docker服务
        systemctl start docker
        systemctl enable docker

        # 创建项目目录
        mkdir -p /opt/xiaoyu-guardian
        mkdir -p /opt/backups/xiaoyu-guardian

        # 创建应用用户
        useradd -r -s /bin/false xiaoyu || true

        # 配置防火墙
        ufw --force reset
        ufw allow ssh
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw --force enable

        echo "服务器环境准备完成"
EOF

    log_success "服务器环境准备完成"
}

# 同步代码到服务器
sync_code() {
    log_info "同步代码到服务器..."

    # 创建临时目录
    TEMP_DIR="/tmp/xiaoyu-deploy-$(date +%s)"
    mkdir -p ${TEMP_DIR}

    # 复制必要文件
    cp -r services ${TEMP_DIR}/
    cp package.json ${TEMP_DIR}/
    cp bun.lockb ${TEMP_DIR}/
    cp next.config.js ${TEMP_DIR}/
    cp -r app ${TEMP_DIR}/
    cp -r public ${TEMP_DIR}/
    cp -r lib ${TEMP_DIR}/
    cp -r messages ${TEMP_DIR}/
    cp middleware.ts ${TEMP_DIR}/
    cp .env.example ${TEMP_DIR}/.env

    # 同步到服务器
    rsync -avz --delete ${TEMP_DIR}/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

    # 清理临时目录
    rm -rf ${TEMP_DIR}

    log_success "代码同步完成"
}

# 配置SSL证书
setup_ssl() {
    log_info "配置SSL证书..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        # 确保Nginx运行以进行域名验证
        systemctl start nginx
        systemctl enable nginx

        # 临时Nginx配置
        cat > /etc/nginx/sites-available/xiaoyu-temp << 'NGINX_EOF'
        server {
            listen 80;
            server_name xiaoyu.0379.email api.xiaoyu.0379.email ai.xiaoyu.0379.email mail.xiaoyu.0379.email;

            location / {
                return 200 'OK';
                add_header Content-Type text/plain;
            }
        }
NGINX_EOF

        # 启用临时站点
        ln -sf /etc/nginx/sites-available/xiaoyu-temp /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        nginx -t && systemctl reload nginx

        # 获取SSL证书
        certbot certonly --nginx --non-interactive --agree-tos \
            --email admin@0379.email \
            -d xiaoyu.0379.email \
            -d api.xiaoyu.0379.email \
            -d ai.xiaoyu.0379.email \
            -d mail.xiaoyu.0379.email || echo "SSL证书获取失败，将使用自签名证书"

        # 如果Let's Encrypt失败，创建自签名证书
        if [ ! -f "/etc/letsencrypt/live/xiaoyu.0379.email/fullchain.pem" ]; then
            log_warning "使用自签名证书"
            mkdir -p /opt/xiaoyu-guardian/ssl

            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key \
                -out /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt \
                -subj "/C=CN/ST=Beijing/L=Beijing/O=YYC3/CN=xiaoyu.0379.email"

            cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/api.xiaoyu.0379.email.key
            cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/api.xiaoyu.0379.email.crt
            cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/ai.xiaoyu.0379.email.key
            cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/ai.xiaoyu.0379.email.crt
            cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/mail.xiaoyu.0379.email.key
            cp /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/mail.xiaoyu.0379.email.crt
        else
            # 复制Let's Encrypt证书
            mkdir -p /opt/xiaoyu-guardian/ssl
            cp /etc/letsencrypt/live/xiaoyu.0379.email/fullchain.pem /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt
            cp /etc/letsencrypt/live/xiaoyu.0379.email/privkey.pem /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key

            # 为其他子域名创建链接
            ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/api.xiaoyu.0379.email.crt
            ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/api.xiaoyu.0379.email.key
            ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/ai.xiaoyu.0379.email.crt
            ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/ai.xiaoyu.0379.email.key
            ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.crt /opt/xiaoyu-guardian/ssl/mail.xiaoyu.0379.email.crt
            ln -sf /opt/xiaoyu-guardian/ssl/xiaoyu.0379.email.key /opt/xiaoyu-guardian/ssl/mail.xiaoyu.0379.email.key
        fi

        # 设置证书自动续期
        echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
EOF

    log_success "SSL证书配置完成"
}

# 配置环境变量
setup_environment() {
    log_info "配置环境变量..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        # 创建.env文件
        cat > ${DEPLOY_PATH}/.env << 'ENV_EOF'
        # 数据库配置
        POSTGRES_DB=xiaoyu_guardian
        POSTGRES_USER=postgres
        POSTGRES_PASSWORD=$(openssl rand -base64 32)
        XIAOYU_DATABASE_URL=postgresql://postgres:$(openssl rand -base64 32)@postgres:5432/xiaoyu_guardian

        # Redis配置
        REDIS_PASSWORD=$(openssl rand -base64 32)
        REDIS_URL=redis://:$(openssl rand -base64 32)@redis:6379

        # JWT密钥
        JWT_SECRET=$(openssl rand -base64 64)

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
ENV_EOF

        chmod 600 ${DEPLOY_PATH}/.env
EOF

    log_success "环境变量配置完成"
}

# 部署应用
deploy_application() {
    log_info "部署应用..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        cd ${DEPLOY_PATH}

        # 构建并启动服务
        docker-compose -f services/xiaoyu-api/docker-compose.yml down
        docker-compose -f services/xiaoyu-api/docker-compose.yml build
        docker-compose -f services/xiaoyu-api/docker-compose.yml up -d

        # 等待服务启动
        sleep 30

        # 检查服务状态
        docker-compose -f services/xiaoyu-api/docker-compose.yml ps

        # 检查服务健康状态
        for i in {1..10}; do
            if curl -f http://localhost:8000/health 2>/dev/null; then
                echo "API服务启动成功"
                break
            else
                echo "等待API服务启动... (\$i/10)"
                sleep 10
            fi
        done
EOF

    log_success "应用部署完成"
}

# 配置Nginx反向代理
configure_nginx() {
    log_info "配置Nginx反向代理..."

    ssh ${SERVER_USER}@${SERVER_IP} << EOF
        # 复制Nginx配置
        cp ${DEPLOY_PATH}/services/xiaoyu-api/nginx.conf /etc/nginx/nginx.conf

        # 测试Nginx配置
        nginx -t

        # 重新加载Nginx
        systemctl reload nginx

        # 启动Nginx
        systemctl enable nginx
EOF

    log_success "Nginx配置完成"
}

# 验证部署
verify_deployment() {
    log_info "验证部署..."

    # 等待DNS解析
    log_warning "等待DNS解析生效（可能需要几分钟）..."
    sleep 60

    # 测试HTTP访问
    if curl -k -s -o /dev/null -w "%{http_code}" https://${DOMAIN} | grep -q "200\|301\|302"; then
        log_success "主站访问正常: https://${DOMAIN}"
    else
        log_warning "主站访问异常，请检查域名解析"
    fi

    # 测试API访问
    if curl -k -s -o /dev/null -w "%{http_code}" https://api.${DOMAIN}/health | grep -q "200"; then
        log_success "API服务正常: https://api.${DOMAIN}/health"
    else
        log_warning "API服务访问异常，请检查配置"
    fi

    # 显示服务器状态
    ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
        echo "=== Docker容器状态 ==="
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        echo -e "\n=== 磁盘使用情况 ==="
        df -h

        echo -e "\n=== 内存使用情况 ==="
        free -h

        echo -e "\n=== 网络连接 ==="
        ss -tuln | grep -E ':(80|443|8000|9000|5432|6379)'
EOF
}

# 显示访问信息
show_access_info() {
    log_success "🎉 部署完成！"
    echo
    echo "=== 访问信息 ==="
    echo -e "${GREEN}主站:${NC} https://xiaoyu.0379.email"
    echo -e "${GREEN}API:${NC} https://api.xiaoyu.0379.email"
    echo -e "${GREEN}AI服务:${NC} https://ai.xiaoyu.0379.email"
    echo -e "${GREEN}邮件服务:${NC} https://mail.xiaoyu.0379.email"
    echo
    echo "=== 管理命令 ==="
    echo "查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose logs -f'"
    echo "重启服务: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose restart'"
    echo "查看状态: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${DEPLOY_PATH} && docker-compose ps'"
    echo
    echo -e "${YELLOW}注意事项:${NC}"
    echo "1. 确保域名解析已正确配置"
    echo "2. 如果使用自签名证书，浏览器会显示安全警告"
    echo "3. 首次访问可能需要等待服务完全启动"
    echo
}

# 主函数
main() {
    echo "🚀 YYC³ AI小语守护系统 - 生产环境部署"
    echo "目标服务器: ${SERVER_IP}"
    echo "部署路径: ${DEPLOY_PATH}"
    echo "域名: ${DOMAIN}"
    echo

    read -p "确认部署？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "部署已取消"
        exit 1
    fi

    check_dependencies
    test_server_connection
    prepare_server
    sync_code
    setup_ssl
    setup_environment
    deploy_application
    configure_nginx
    verify_deployment
    show_access_info

    log_success "🎊 小语守护系统已成功部署到生产环境！"
    log_success "沫语现在可以享受企业级的AI成长守护服务了！"
    echo
    echo -e "${GREEN}❤️ 技术守护无障碍，父爱陪伴永在线！${NC}"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"