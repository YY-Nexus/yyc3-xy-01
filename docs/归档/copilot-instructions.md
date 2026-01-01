# YYC³ AI Coding Agent Instructions

> 「YanYuCloudCube」- 万象归元于云枢 丨深栈智启新纪元

## 🎯 Project Overview

**YYC³** is a multi-server, distributed AI platform ecosystem with standardized architecture spanning:
- **Multi-domain services**: 0379.email, 0379.world (production + dev environments)
- **Core services**: API, Admin, LLM/AI, Mail, Redis cache on ports 6600-6606
- **Server topology**: yyc3-22 (local dev), yyc3-33/121/202 (cloud ECS), yyc3-45 (NAS storage)
- **Technology stack**: Node.js/Express, Docker, PM2, Nginx, Redis, PostgreSQL

## 🏗️ Architecture Essentials

### Server-Service Mapping
```yaml
# Production (YYC3-121: 8.130.127.121)
domains: [0379.email, 0379.world]
services:
  - api.0379.email:6600    # Core API
  - admin.0379.email:6601  # Management console
  - llm.0379.email:6602    # AI/LLM service (GLM models)
  - mail.0379.email:6603   # Email platform
  - redis.0379.email:6606  # Cache layer

# Development (YYC3-33: 8.152.195.33)
subdomain_pattern: [api|admin|llm|mail|redis].dev.0379.email:7600-7607
```

### Key Directory Structure
```
yyc3-workspace/
├── yyc3-22/               # Main dev environment with full service stack
│   ├── app/              # Multi-service application (0379.email platform)
│   │   ├── api/          # API service (port 6600)
│   │   ├── admin/        # Admin console (port 6601)
│   │   ├── llm/          # LLM/AI service (port 6602)
│   │   ├── mail/         # Email service (port 6603)
│   │   ├── redis/        # Redis service (port 6606)
│   │   └── shared/       # Shared modules (logger, errorHandler, redis client)
│   ├── services/         # Dynamic service launchers (dynamic-*-server.js)
│   └── scripts/          # Deployment automation (unified-deploy.sh, server-architecture-manager.sh)
├── yyc3-121/, yyc3-202/, yyc3-33/  # Cloud server deployment configs
├── docs/                 # Brand standards and multi-industry templates
└── YYC³团队标准化规范文档.md  # Team coding standards
```

## 🔧 Development Workflows

### Starting Services (yyc3-22)
```bash
# PM2-managed services via ecosystem.config.js
cd /Users/yanyu/yyc3-workspace/yyc3-22
pm2 start ecosystem.config.js           # Start all services
pm2 status                               # Check service health
pm2 logs [service-name]                  # View logs

# Individual service launch
node services/dynamic-api-server.js      # Launch specific service
./scripts/server-check.sh                # Health check all services
```

### Deployment Pipeline
```bash
# Unified deployment to cloud servers
./scripts/unified-deploy.sh production email_platform yyc3-121
./scripts/unified-deploy.sh --check production all all    # Status check
./scripts/unified-deploy.sh --dry-run staging all yyc3-33 # Simulate deploy

# Server-specific deployment
cd yyc3-121 && ./deploy-smb-yyc3-121.sh
cd yyc3-202 && ./deploy-smb-yyc3-202.sh
```

### SMB Network Storage Access
```bash
# Connect to NAS servers (macOS)
./yyc3-45-smb.sh    # Internal NAS (192.168.3.45)
./yyc3-22-smb.sh    # Dev server shares (192.168.3.22)
# Auth: Guest mode + nasuser/NasUser2024
```

## 📝 Coding Standards (YYC³ Team)

### Project Naming
- **Format**: `yyc3-{category}-{feature}` (e.g., `yyc3-cache-redis`, `yyc3-ai-management`)
- **package.json**: Name must start with `yyc3-`, author: `YYC³ <admin@0379.email>`

### File Headers (ALL code files)
```javascript
/**
 * @file {Brief description}
 * @description {Detailed functionality}
 * @module {module/path}
 * @author YYC
 * @version {X.Y.Z}
 * @created {YYYY-MM-DD}
 * @updated {YYYY-MM-DD}
 */
```

### Document Headers
```markdown
# {Document Title}

> 「YanYuCloudCube」
> 「万象归元于云枢 丨深栈智启新纪元」
> 「All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence」

---
```

### Shared Module Pattern
**CRITICAL**: All services use centralized shared modules:
```javascript
// Import from app/shared/ directory
const { logger, logRequest } = require('../shared/logger');
const { errorHandler, createAppError } = require('../shared/errorHandler');
const redisService = require('../shared/redis');  // Unified Redis client
```

## 🔐 Configuration Management

### Environment Variables
- Each service has `.env.example` - **NEVER commit actual `.env`**
- Redis config: `app/shared/redis/config.js` (centralized)
- Multi-environment support: `config/environments.yml` (18-dimension config)

### Port Allocation (Fixed)
```
3000-3003: Internal service ports (container/local)
6600-6606: External exposed ports (production)
7600-7607: Dev environment ports (YYC3-33)
```

## 🚀 Service-Specific Notes

### API Service (api/)
- Middleware: `validation.js` (data validation), `auth.js` (JWT auth)
- Routes in `routes/` directory
- Uses `app/shared/status/` for health checks

### LLM Service (llm/)
- **Default model**: GLM-4.5-Flash (Zhipu AI - free, 128K context)
- MCP tools integration for web search, vision, code execution
- Swagger docs at `/swagger.json`

### Redis Service
- **Client**: `app/shared/redis/client.js` (singleton pattern with reconnection logic)
- Security: `app/shared/redis/security.js` (access control, rate limiting)
- Monitoring: Command stats, connection health tracking

## 📊 Monitoring & Debugging

### Health Checks
```bash
# Service health endpoints
curl https://api.0379.email/health
curl https://llm.0379.email/health

# Script-based checks
./scripts/server-check.sh              # All service status
./app/.github/scripts/health-check.sh  # CI/CD health validation
```

### Logs
- **Location**: `yyc3-22/app/logs/` (per-service directories)
- **Logger**: Centralized `app/shared/logger.js` with request context
- **PM2 logs**: `pm2 logs [service-name]`

## 🎨 Brand & Documentation Standards

### README Template Structure
1. Project title with YYC³ branding
2. Overview with emoji-based navigation
3. Quick start section
4. Architecture diagram
5. API reference (if applicable)
6. Deployment instructions

### Multi-Industry Templates
- Located in `docs/品牌规划多行业方案-24/`, `docs/企业级项目模版/`
- Standard file tree generators: `YYC³ 文件树生成器.py`, `.sh`
- Follow industry-specific naming in `docs/品牌规划多行业方案-36/YYC³-AI-MISP行业名称.md`

## ⚠️ Critical Rules

1. **Never modify shared modules** without testing ALL dependent services
2. **Port conflicts**: Check `SERVICES_DOMAIN_MAPPING.md` before adding services
3. **Redis connections**: Always use singleton client from `shared/redis/`
4. **Deployment**: Test locally → staging (yyc3-33) → production (yyc3-121)
5. **File standardization**: Run `npm run standardize` before commits
6. **Security**: All external APIs require CORS + rate limiting + Helmet.js

## 📚 Key Reference Docs

- `yyc3-22/PROJECT_DOCUMENTATION.md` - Complete project architecture
- `yyc3-22/YYC3_ARCHITECTURE.md` - AI model & MCP tool integration
- `yyc3-22/SERVICES_DOMAIN_MAPPING.md` - Server-domain-port mapping
- `YYC³团队标准化规范文档.md` - Full team standards (2000+ lines)
- `yyc3-22/app/ARCHITECTURE_STANDARDIZATION.md` - File structure standards

## 🤝 Collaboration Notes

- This workspace designed for **human-AI collaborative development**
- Scripts include verbose logging for AI agent understanding
- Multi-turn workflows captured in session logs (see `PROJECT_MERGE_ANALYSIS.md`)
- Configuration generators: `scripts/env-generator.sh` for environment setup

---

> 「YanYuCloudCube」
> 「<admin@0379.email>」
> 「言启象限,语枢未来」
