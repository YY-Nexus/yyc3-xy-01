# 部署运维文档

## 📋 概述

本文档描述小语智能成长守护系统的部署和运维方案。

---

## 🔧 环境要求

### 生产环境

| 组件 | 最低版本 | 推荐版本 |
|------|---------|---------|
| Node.js | 18.x | 20.x |
| MongoDB | 6.x | 7.x |
| Redis | 6.x | 7.x |
| Qdrant | 1.7.x | 最新 |
| Nginx | 1.20.x | 1.24.x |

### 系统要求

- **CPU**: 2核心以上
- **内存**: 4GB以上（推荐8GB）
- **硬盘**: 20GB以上
- **操作系统**: Linux (Ubuntu 20.04+, CentOS 7+)

---

## 📦 安装部署

### 方式一：Docker部署（推荐）

#### 1. 前置准备

```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 配置环境变量

创建 `.env` 文件：

```env
# 数据库配置
MONGO_URI=mongodb://mongodb:27017
MONGO_DB=xiaoyu
REDIS_URL=redis://redis:6379

# 服务配置
PORT=4000
NODE_ENV=production

# OpenAI配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# Qdrant配置
QDRANT_URL=http://qdrant:6333
QDRANT_COLLECTION=xiaoyu_knowledge

# JWT配置
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# 前端配置
VITE_API_URL=http://your-domain.com/api
```

#### 3. 启动服务

```bash
# 克隆项目
git clone https://github.com/yourusername/xiaoyu-ai.git
cd xiaoyu-ai

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 4. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 测试健康检查
curl http://localhost:4000/api/health

# 测试前端访问
curl http://localhost:5173
```

---

### 方式二：传统部署

#### 1. 安装依赖

```bash
# Node.js (使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# MongoDB
# Ubuntu
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Redis
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### 2. 项目配置

```bash
# 克隆项目
git clone https://github.com/yourusername/xiaoyu-ai.git
cd xiaoyu-ai

# 安装依赖
npm install

# 配置环境变量
cp .env.sample .env
# 编辑.env文件

# 构建前端
npm run build:web

# 构建后端
npm run build:server
```

#### 3. 使用PM2管理进程

```bash
# 安装PM2
npm install -g pm2

# 启动服务
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all

# 停止服务
pm2 stop all

# 开机自启
pm2 startup
pm2 save
```

**ecosystem.config.js**:
```javascript
module.exports = {
  apps: [
    {
      name: 'xiaoyu-server',
      script: 'apps/server/dist/index.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
```

#### 4. Nginx配置

```nginx
# /etc/nginx/sites-available/xiaoyu-ai
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/xiaoyu-ai/apps/web/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # API反向代理
    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket支持
    location /socket.io/ {
        proxy_pass http://localhost:4000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
}

# HTTPS配置（使用Let's Encrypt）
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com;
#
#     ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
#     
#     # SSL配置
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     # 其他配置同上...
# }
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/xiaoyu-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 SSL证书配置

### 使用Let's Encrypt

```bash
# 安装Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run

# 设置定时任务
sudo crontab -e
# 添加：0 0 * * * certbot renew --quiet
```

---

## 📊 监控配置

### 1. Prometheus + Grafana

**prometheus.yml**:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'xiaoyu-server'
    static_configs:
      - targets: ['localhost:4000']
        labels:
          group: 'production'
```

### 2. 日志管理

```bash
# 创建日志目录
mkdir -p /var/log/xiaoyu-ai

# 配置logrotate
sudo nano /etc/logrotate.d/xiaoyu-ai
```

**/etc/logrotate.d/xiaoyu-ai**:
```
/var/log/xiaoyu-ai/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## 🔄 数据备份

### MongoDB备份脚本

```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
MONGO_DB="xiaoyu"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
mongodump --db $MONGO_DB --out $BACKUP_DIR/$DATE

# 压缩备份
tar -czf $BACKUP_DIR/$DATE.tar.gz $BACKUP_DIR/$DATE
rm -rf $BACKUP_DIR/$DATE

# 删除30天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

设置定时备份：
```bash
sudo crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup-mongodb.sh
```

### 恢复数据

```bash
# 解压备份
tar -xzf /var/backups/mongodb/20240101_020000.tar.gz

# 恢复数据
mongorestore --db xiaoyu /var/backups/mongodb/20240101_020000/xiaoyu
```

---

## 🚀 性能优化

### 1. MongoDB索引优化

```javascript
// 在MongoDB中执行
db.daily_records.createIndex({ userId: 1, occurredAt: -1 })
db.milestones.createIndex({ userId: 1, isAchieved: 1 })
db.reports.createIndex({ userId: 1, generatedAt: -1 })
db.rag_feedback.createIndex({ userId: 1, createdAt: -1 })
```

### 2. Redis缓存配置

```bash
# redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 3. Node.js优化

```javascript
// 增加内存限制
node --max-old-space-size=4096 dist/index.js
```

---

## 🔍 健康检查

### 监控脚本

```bash
#!/bin/bash
# health-check.sh

API_URL="http://localhost:4000/api/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Service is healthy"
    exit 0
else
    echo "❌ Service is unhealthy (HTTP $RESPONSE)"
    # 发送告警
    # curl -X POST https://your-alert-webhook.com -d "Service unhealthy"
    exit 1
fi
```

设置定时检查：
```bash
# 每5分钟检查一次
*/5 * * * * /path/to/health-check.sh
```

---

## 🐛 故障排查

### 常见问题

#### 1. 服务无法启动

```bash
# 检查端口占用
sudo lsof -i :4000

# 检查日志
pm2 logs xiaoyu-server --lines 100

# 检查MongoDB连接
mongo --eval "db.adminCommand('ping')"
```

#### 2. 内存泄漏

```bash
# 查看内存使用
pm2 monit

# 重启服务
pm2 restart xiaoyu-server
```

#### 3. 性能问题

```bash
# 查看慢查询
mongo
> db.setProfilingLevel(1, { slowms: 100 })
> db.system.profile.find().sort({ts:-1}).limit(10)
```

---

## 📈 扩容方案

### 水平扩展

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  server:
    image: xiaoyu-server:latest
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
    depends_on:
      - server
```

启动：
```bash
docker-compose -f docker-compose.scale.yml up -d --scale server=3
```

---

## 🔐 安全加固

### 1. 防火墙配置

```bash
# UFW配置
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. MongoDB安全

```javascript
// 创建管理员用户
use admin
db.createUser({
  user: "admin",
  pwd: "strong_password",
  roles: ["root"]
})

// 创建应用用户
use xiaoyu
db.createUser({
  user: "xiaoyu_app",
  pwd: "strong_password",
  roles: [{ role: "readWrite", db: "xiaoyu" }]
})
```

启用认证：
```bash
# /etc/mongod.conf
security:
  authorization: enabled
```

---

## 📋 运维检查清单

### 日常检查
- [ ] 服务状态正常
- [ ] API响应时间正常(<500ms)
- [ ] CPU/内存使用正常(<80%)
- [ ] 磁盘空间充足(>20%)
- [ ] 日志无错误

### 周检查
- [ ] 备份文件完整
- [ ] SSL证书有效期(>30天)
- [ ] 依赖包安全更新
- [ ] 日志清理

### 月检查
- [ ] 性能指标分析
- [ ] 数据库优化
- [ ] 安全漏洞扫描
- [ ] 备份恢复演练

---

**文档版本**: v1.0  
**最后更新**: 2024年11月

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>

