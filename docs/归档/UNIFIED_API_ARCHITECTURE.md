# 小语AI统一API架构方案

> **设计理念**: 参考0379.email多项目共享API架构  
> **创建日期**: 2024年11月26日  
> **架构类型**: 统一API网关 + 微服务架构

---

## 🎯 架构目标

借鉴您的0379.email成功经验，为小语AI项目建立统一的API架构：

1. **统一入口**: 所有客户端（Web、移动端、第三方）使用相同的API基础URL
2. **共享服务**: 核心AI功能作为共享服务，多个应用可复用
3. **集中管理**: 统一的认证、日志、监控、配额管理
4. **易于扩展**: 新项目可以快速接入现有AI能力

---

## 🏗️ 推荐架构

### 架构图

```
┌─────────────────────────────────────────────────────────┐
│                    客户端层                              │
├─────────────────────────────────────────────────────────┤
│  Web应用    │  移动应用   │  第三方集成  │  内部工具   │
│  (React)    │  (React    │  (API Key)   │  (Admin)    │
│             │   Native)   │              │             │
└──────┬───────────┬──────────────┬──────────────┬────────┘
       │           │              │              │
       └───────────┴──────────────┴──────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │    统一API网关 (Port 4000)     │
         │  - 认证/授权                    │
         │  - 限流/配额                    │
         │  - 日志/监控 (ELK)             │
         │  - API版本管理                  │
         └────────────┬───────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  AI服务     │ │ 成长服务    │ │ 内容服务    │
│  (Port 4001)│ │ (Port 4002) │ │ (Port 4003) │
├─────────────┤ ├─────────────┤ ├─────────────┤
│ • 5大智能体 │ │ • 成长记录  │ │ • 文化传承  │
│ • RAG检索   │ │ • 预测分析  │ │ • 音乐系统  │
│ • 语音识别  │ │ • 报告生成  │ │ • 媒体管理  │
│ • 情感分析  │ │ • 里程碑    │ │ • 搜索功能  │
└─────────────┘ └─────────────┘ └─────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │    共享基础设施              │
         │  • MongoDB (数据)           │
         │  • Redis (缓存)             │
         │  • Elasticsearch (日志)     │
         │  • Qdrant (向量)            │
         └────────────────────────────┘
```

---

## 📋 统一API端点设计

### 基础URL配置

**开发环境**:

```env
# 所有项目的 .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
VITE_API_BASE_URL=http://localhost:4000/api
```

**生产环境**:

```env
# 所有项目的 .env.production
NEXT_PUBLIC_API_URL=https://api.xiaoyu-ai.com/api
VITE_API_BASE_URL=https://api.xiaoyu-ai.com/api
```

---

### API端点分类

#### 1. 认证和用户管理 (`/api/auth`, `/api/user`)

```javascript
// 用户认证
POST   /api/auth/register        - 用户注册
POST   /api/auth/login           - 用户登录
POST   /api/auth/logout          - 用户登出
POST   /api/auth/refresh         - 刷新Token
POST   /api/auth/reset-password  - 密码重置

// 用户管理
GET    /api/user/profile         - 获取用户信息
PUT    /api/user/profile         - 更新用户信息
GET    /api/user/children        - 获取孩子列表
POST   /api/user/children        - 添加孩子
```

#### 2. AI智能体服务 (`/api/ai-agents`)

```javascript
// 5大智能体统一接口
POST   /api/ai-agents/companion/chat       - 陪伴智能体对话
POST   /api/ai-agents/recorder/analyze     - 记录智能体分析
POST   /api/ai-agents/listener/understand  - 倾听智能体理解
POST   /api/ai-agents/advisor/suggest      - 顾问智能体建议
POST   /api/ai-agents/guardian/monitor     - 守护智能体监控

// 通用AI能力
POST   /api/ai-agents/chat                 - 通用对话接口
GET    /api/ai-agents/history              - 对话历史
GET    /api/ai-agents/context              - 上下文信息
```

#### 3. RAG知识检索 (`/api/rag`)

```javascript
POST   /api/rag/search          - 知识检索
POST   /api/rag/embed           - 文本向量化
GET    /api/rag/documents       - 获取文档列表
POST   /api/rag/documents       - 上传文档
DELETE /api/rag/documents/:id   - 删除文档
```

#### 4. 成长记录服务 (`/api/growth`)

```javascript
// 成长记录
GET    /api/growth/records              - 获取记录列表
POST   /api/growth/records              - 创建记录
GET    /api/growth/records/:id          - 获取单条记录
PUT    /api/growth/records/:id          - 更新记录
DELETE /api/growth/records/:id          - 删除记录

// 预测分析
POST   /api/growth/predict              - 生成预测
GET    /api/growth/predictions          - 获取预测列表
GET    /api/growth/predictions/:id      - 获取单个预测

// 智能报告
POST   /api/growth/reports/generate     - 生成报告
GET    /api/growth/reports              - 获取报告列表
GET    /api/growth/reports/:id          - 获取报告详情
```

#### 5. 语音和音乐服务 (`/api/speech`, `/api/music`)

```javascript
// 语音服务
POST   /api/speech/recognize            - 语音识别
POST   /api/speech/synthesize           - 语音合成
POST   /api/speech/emotion              - 情感分析

// 音乐服务
GET    /api/music/search                - 搜索音乐
POST   /api/music/recommend             - 推荐音乐
GET    /api/music/playlist              - 获取播放列表
POST   /api/music/playlist              - 创建播放列表
```

#### 6. 监控和日志 (`/api/logs`, `/api/metrics`)

```javascript
// 日志查询（管理员）
GET    /api/logs/search                 - 搜索日志
GET    /api/logs/stats                  - 日志统计
GET    /api/logs/health                 - 健康检查

// 性能指标
GET    /api/metrics                     - Prometheus指标
GET    /api/metrics/derived             - 衍生指标
GET    /api/service-metrics             - 服务监控
```

---

## 🔗 共享API客户端

### JavaScript/TypeScript客户端

创建统一的API客户端库：

```typescript
// shared/xiaoyu-ai-client.ts

export interface XiaoYuAIConfig {
  apiUrl: string
  apiKey?: string
  timeout?: number
}

export class XiaoYuAIClient {
  private baseUrl: string
  private apiKey?: string
  private timeout: number

  constructor(config: XiaoYuAIConfig) {
    this.baseUrl = config.apiUrl
    this.apiKey = config.apiKey
    this.timeout = config.timeout || 30000
  }

  // 认证
  async login(email: string, password: string) {
    return this.request('POST', '/auth/login', { email, password })
  }

  // AI对话
  async chat(agentType: string, message: string, context?: any) {
    return this.request('POST', `/ai-agents/${agentType}/chat`, {
      message,
      context
    })
  }

  // RAG检索
  async searchKnowledge(query: string, limit: number = 10) {
    return this.request('POST', '/rag/search', { query, limit })
  }

  // 成长记录
  async createGrowthRecord(data: any) {
    return this.request('POST', '/growth/records', data)
  }

  // 语音识别
  async recognizeSpeech(audioBlob: Blob) {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    return this.request('POST', '/speech/recognize', formData)
  }

  // 通用请求方法
  private async request(method: string, endpoint: string, data?: any) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const options: RequestInit = {
      method,
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }
}

// 默认导出单例
export const xiaoYuAI = new XiaoYuAIClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
})
```

---

## 📦 项目集成示例

### 项目A: Web主应用（完整功能）

```typescript
// apps/web/src/lib/api.ts
import { XiaoYuAIClient } from '@/shared/xiaoyu-ai-client'

export const api = new XiaoYuAIClient({
  apiUrl: process.env.NEXT_PUBLIC_API_URL!
})

// 使用示例
async function handleChat(message: string) {
  const response = await api.chat('companion', message)
  console.log(response)
}
```

---

### 项目B: 移动端应用（React Native）

```typescript
// mobile-app/src/services/api.ts
import { XiaoYuAIClient } from '@xiaoyu-ai/client'

export const api = new XiaoYuAIClient({
  apiUrl: 'https://api.xiaoyu-ai.com/api'
})

// 使用AI功能
const response = await api.chat('advisor', '孩子最近不爱吃饭')
```

---

### 项目C: 管理后台（监控和管理）

```typescript
// admin-panel/src/api.ts
import { XiaoYuAIClient } from '@xiaoyu-ai/client'

export const adminAPI = new XiaoYuAIClient({
  apiUrl: process.env.REACT_APP_API_URL!,
  apiKey: process.env.REACT_APP_ADMIN_KEY
})

// 查询日志
const logs = await adminAPI.searchLogs({ level: 'error', size: 100 })

// 查看指标
const metrics = await adminAPI.getMetrics()
```

---

### 项目D: 第三方集成（API Key认证）

```typescript
// third-party-integration/index.js
const { XiaoYuAIClient } = require('@xiaoyu-ai/client')

const client = new XiaoYuAIClient({
  apiUrl: 'https://api.xiaoyu-ai.com/api',
  apiKey: 'your-api-key-here'
})

// 使用AI能力
async function analyzeChildBehavior(text) {
  return await client.chat('analyzer', text)
}
```

---

## 🔐 统一认证和授权

### JWT Token流程

```typescript
// 1. 用户登录获取Token
const { token, refreshToken } = await api.login(email, password)
localStorage.setItem('token', token)
localStorage.setItem('refreshToken', refreshToken)

// 2. 自动附加Token到请求头
// 在XiaoYuAIClient中自动处理

// 3. Token过期自动刷新
async function refreshTokenIfNeeded() {
  const token = localStorage.getItem('token')
  const decoded = jwt.decode(token)
  
  if (decoded.exp < Date.now() / 1000) {
    const refreshToken = localStorage.getItem('refreshToken')
    const { token: newToken } = await api.refreshToken(refreshToken)
    localStorage.setItem('token', newToken)
  }
}
```

---

## 📊 统一监控和日志

### 集成ELK日志

所有项目的日志自动聚合到ELK栈：

```typescript
// 客户端日志
api.on('request', (req) => {
  console.log('[API Request]', req)
})

api.on('response', (res) => {
  console.log('[API Response]', res)
})

api.on('error', (err) => {
  console.error('[API Error]', err)
  // 自动上报到Elasticsearch
})
```

### Kibana仪表盘

- **用户行为分析**: 各项目用户活跃度
- **API使用统计**: 各端点调用频率
- **错误监控**: 错误率、错误类型分布
- **性能监控**: 响应时间、吞吐量

---

## 🎯 配置清单

### 步骤1: 确保API服务运行

```bash
# 启动小语AI统一API服务
cd /Users/yanyu/Documents/xiaoYu❤️AI/apps/server
npm run dev  # 端口4000
```

### 步骤2: 在每个项目中设置环境变量

```bash
# 项目A (Web主应用) - .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# 项目B (移动应用) - .env
API_URL=http://localhost:4000/api

# 项目C (管理后台) - .env.local
REACT_APP_API_URL=http://localhost:4000/api
REACT_APP_ADMIN_KEY=admin-secret-key

# 项目D (第三方集成) - .env
XIAOYU_AI_API_URL=http://localhost:4000/api
XIAOYU_AI_API_KEY=your-api-key
```

### 步骤3: 安装共享API客户端

```bash
# 方式1: 本地路径（开发阶段）
npm install /Users/yanyu/Documents/xiaoYu❤️AI/shared/xiaoyu-ai-client

# 方式2: npm包（生产环境）
npm install @xiaoyu-ai/client

# 方式3: 直接复制文件
cp /Users/yanyu/Documents/xiaoYu❤️AI/shared/xiaoyu-ai-client.ts ./src/lib/
```

---

## 🎉 优势总结

### 与0379.email相同的优势

1. ✅ **统一管理**: 一个API服务管理所有AI功能
2. ✅ **成本效益**: 无需为每个项目单独部署AI服务
3. ✅ **开发效率**: 一次开发，多处使用
4. ✅ **维护简单**: 只需要维护一个核心API服务
5. ✅ **数据统一**: 所有数据集中管理和分析
6. ✅ **监控便利**: 统一的日志和性能监控（ELK）

### 小语AI特有优势

7. ✅ **AI能力共享**: 5大智能体、RAG、语音识别等AI能力可被多个应用复用
8. ✅ **知识库统一**: 所有项目共享同一个知识库
9. ✅ **成长数据互通**: 跨平台的成长数据同步
10. ✅ **版本控制**: API版本化管理，平滑升级

---

## 🚀 实施计划

### 短期（本周）

1. **创建共享API客户端库**
   - 完善TypeScript类型定义
   - 添加自动重试机制
   - 实现Token自动刷新

2. **统一API文档**
   - 使用Swagger/OpenAPI
   - 生成交互式文档
   - 提供代码示例

3. **测试多项目集成**
   - Web应用集成测试
   - 第三方API Key测试
   - 性能和稳定性测试

### 中期（下周）

4. **API网关增强**
   - 添加限流和配额管理
   - 实现API Key管理系统
   - 添加请求签名验证

5. **监控和告警**
   - Kibana仪表盘配置
   - 告警规则设置
   - 性能基准测试

6. **文档和培训**
   - API使用指南
   - 集成示例项目
   - 最佳实践文档

### 长期（下个月）

7. **扩展功能**
   - GraphQL支持
   - WebSocket实时通信
   - SDK多语言支持（Python、Java等）

8. **企业功能**
   - 多租户支持
   - SLA保证
   - 审计日志

---

## 📝 对比：0379.email vs 小语AI

| 特性 | 0379.email | 小语AI |
|------|------------|--------|
| **核心功能** | 邮件发送 | AI智能体 |
| **端口** | 3101 | 4000 |
| **主要API** | /api/email/* | /api/ai-agents/* |
| **认证方式** | API Key | JWT + API Key |
| **数据存储** | MongoDB | MongoDB + Qdrant + Redis |
| **日志系统** | ✅ | ✅ ELK Stack |
| **监控** | ✅ | ✅ Prometheus + ELK |
| **多项目支持** | ✅ | ✅ |
| **共享客户端** | ✅ | ✅ |

---

## 🧪 测试示例

```bash
# 运行多项目集成测试
cd /Users/yanyu/Documents/xiaoYu❤️AI
node tests/multi-project-integration-test.js

# 预期输出：
# ✅ 项目A (Web) - AI对话成功
# ✅ 项目B (Mobile) - 成长记录创建成功
# ✅ 项目C (Admin) - 日志查询成功
# ✅ 项目D (3rd Party) - API Key认证成功
```

---

## 📚 参考文档

- **0379.email API文档**: 参考您现有的邮件服务架构
- **小语AI API文档**: `docs/API_DOCUMENTATION.md` (待创建)
- **集成指南**: `docs/INTEGRATION_GUIDE.md` (待创建)
- **最佳实践**: 基于0379.email的成功经验

---

**架构设计**: 基于0379.email多项目共享架构  
**文档版本**: v1.0  
**最后更新**: 2024年11月26日

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>

