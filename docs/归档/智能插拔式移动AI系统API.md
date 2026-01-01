# YYC³ 智能插拔式移动AI系统 API 文档

## 📖 概述

YYC³智能插拔式移动AI系统提供完整的RESTful API和WebSocket接口，支持AI对话、工具调用、知识检索、目标管理等功能。

### 基础信息

- **Base URL**: `http://localhost:8080/api`
- **API版本**: v1
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 通用响应格式

```json
{
  "success": true,
  "data": {},
  "message": "操作成功",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-string"
}
```

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-string"
}
```

## 🔐 认证

### 获取访问令牌

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码"
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 3600,
    "user": {
      "id": "user-id",
      "username": "用户名",
      "roles": ["user"]
    }
  }
}
```

### 刷新令牌

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

## 🤖 AI 对话接口

### 发送消息

```http
POST /api/ai/chat
Content-Type: application/json
Authorization: Bearer {token}

{
  "message": "用户消息内容",
  "context": "对话上下文",
  "mode": "chat",
  "options": {
    "temperature": 0.7,
    "maxTokens": 1000,
    "stream": false
  }
}
```

**参数说明**:
- `message` (string, 必需): 用户消息
- `context` (string, 可选): 对话上下文
- `mode` (string, 可选): 交互模式 (`chat`, `voice`, `image`)
- `options` (object, 可选): AI模型参数

**响应**:
```json
{
  "success": true,
  "data": {
    "message": "AI回复内容",
    "context": "更新的对话上下文",
    "metadata": {
      "model": "gpt-4",
      "tokensUsed": 150,
      "responseTime": 1200
    }
  }
}
```

### 流式对话

```http
POST /api/ai/chat/stream
Content-Type: application/json
Authorization: Bearer {token}

{
  "message": "用户消息",
  "options": {
    "stream": true
  }
}
```

**响应**: Server-Sent Events (SSE)
```
data: {"type": "message", "content": "AI回复片段"}
data: {"type": "done", "messageId": "msg-id"}
```

### 语音转文字

```http
POST /api/ai/speech-to-text
Content-Type: multipart/form-data
Authorization: Bearer {token}

audio_file: [音频文件]
language: zh-CN
```

**响应**:
```json
{
  "success": true,
  "data": {
    "text": "识别的文本内容",
    "confidence": 0.95,
    "duration": 5.2
  }
}
```

### 文字转语音

```http
POST /api/ai/text-to-speech
Content-Type: application/json
Authorization: Bearer {token}

{
  "text": "要转换的文本",
  "voice": "female",
  "language": "zh-CN",
  "speed": 1.0
}
```

**响应**: 音频文件流

## 🛠️ 工具管理接口

### 获取工具列表

```http
GET /api/tools
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "id": "tool-id",
        "name": "工具名称",
        "description": "工具描述",
        "version": "1.0.0",
        "category": "utility",
        "enabled": true,
        "parameters": {
          "input": {
            "type": "string",
            "required": true,
            "description": "输入参数"
          }
        }
      }
    ]
  }
}
```

### 执行工具

```http
POST /api/tools/{toolId}/execute
Content-Type: application/json
Authorization: Bearer {token}

{
  "input": "工具输入参数",
  "options": {}
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "result": "工具执行结果",
    "metadata": {
      "executionTime": 1500,
      "tokensUsed": 50
    }
  }
}
```

### 注册自定义工具

```http
POST /api/tools/register
Content-Type: application/json
Authorization: Bearer {token}

{
  "name": "自定义工具",
  "description": "工具描述",
  "code": "工具代码",
  "parameters": {
    "input": {
      "type": "string",
      "required": true
    }
  }
}
```

## 📚 知识库接口

### 搜索知识

```http
POST /api/knowledge/search
Content-Type: application/json
Authorization: Bearer {token}

{
  "query": "搜索查询",
  "limit": 10,
  "threshold": 0.7,
  "filters": {
    "category": "技术文档",
    "tags": ["AI", "机器学习"]
  }
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "doc-id",
        "title": "文档标题",
        "content": "文档内容片段",
        "score": 0.85,
        "metadata": {
          "source": "文档来源",
          "category": "分类",
          "tags": ["标签1", "标签2"]
        }
      }
    ],
    "total": 25,
    "searchTime": 150
  }
}
```

### 添加知识

```http
POST /api/knowledge/documents
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "文档标题",
  "content": "文档内容",
  "category": "分类",
  "tags": ["标签1", "标签2"],
  "metadata": {
    "source": "来源",
    "author": "作者"
  }
}
```

### 上传文档

```http
POST /api/knowledge/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

file: [文档文件]
category: 文档分类
tags: 标签1,标签2
```

## 🎯 目标管理接口

### 创建目标

```http
POST /api/goals
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "目标标题",
  "description": "目标描述",
  "category": "学习",
  "priority": "high",
  "deadline": "2024-12-31T23:59:59Z",
  "metrics": [
    {
      "name": "完成度",
      "target": 100,
      "unit": "%"
    }
  ]
}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "id": "goal-id",
    "title": "目标标题",
    "status": "active",
    "progress": 0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### 获取目标列表

```http
GET /api/goals?status=active&category=学习&limit=20&offset=0
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "goals": [
      {
        "id": "goal-id",
        "title": "目标标题",
        "description": "目标描述",
        "status": "active",
        "progress": 65,
        "priority": "high",
        "deadline": "2024-12-31T23:59:59Z",
        "metrics": [
          {
            "name": "完成度",
            "current": 65,
            "target": 100,
            "unit": "%"
          }
        ]
      }
    ],
    "total": 15,
    "hasMore": true
  }
}
```

### 更新目标进度

```http
PATCH /api/goals/{goalId}/progress
Content-Type: application/json
Authorization: Bearer {token}

{
  "progress": 75,
  "metrics": [
    {
      "name": "完成度",
      "current": 75
    }
  ],
  "notes": "进度更新说明"
}
```

## 📊 系统监控接口

### 健康检查

```http
GET /api/health
```

**响应**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "healthy",
      "redis": "healthy",
      "ai": "healthy"
    },
    "uptime": 86400,
    "version": "1.0.0"
  }
}
```

### 系统指标

```http
GET /api/metrics
Authorization: Bearer {token}
```

**响应**:
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-01T00:00:00Z",
    "system": {
      "cpu": 45.2,
      "memory": 68.5,
      "disk": 32.1
    },
    "application": {
      "requestsPerSecond": 125,
      "averageResponseTime": 120,
      "errorRate": 0.02
    },
    "ai": {
      "totalRequests": 15420,
      "tokensUsed": 245680,
      "averageResponseTime": 1500
    }
  }
}
```

## 🔌 WebSocket 接口

### 连接建立

```javascript
const socket = io('ws://localhost:8080', {
  auth: {
    token: 'jwt-token'
  }
});
```

### 事件列表

#### 客户端发送事件

**用户消息**:
```javascript
socket.emit('user-message', {
  message: '用户输入',
  timestamp: Date.now(),
  metadata: {}
});
```

**工具调用**:
```javascript
socket.emit('tool-execute', {
  toolId: 'tool-id',
  input: '参数',
  requestId: 'request-id'
});
```

#### 服务端发送事件

**AI回复**:
```javascript
socket.on('ai-response', (data) => {
  console.log('AI回复:', data.message);
  console.log('元数据:', data.metadata);
});
```

**工具执行结果**:
```javascript
socket.on('tool-result', (data) => {
  console.log('工具结果:', data.result);
  console.log('请求ID:', data.requestId);
});
```

**系统通知**:
```javascript
socket.on('notification', (data) => {
  console.log('通知:', data.message);
  console.log('类型:', data.type);
});
```

**连接状态**:
```javascript
socket.on('connect', () => {
  console.log('连接已建立');
});

socket.on('disconnect', (reason) => {
  console.log('连接断开:', reason);
});
```

## 🚨 错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|------------|
| AUTH_001 | 认证失败 | 401 |
| AUTH_002 | 令牌过期 | 401 |
| AUTH_003 | 权限不足 | 403 |
| REQ_001 | 请求参数无效 | 400 |
| REQ_002 | 请求体格式错误 | 400 |
| AI_001 | AI服务不可用 | 503 |
| AI_002 | 输入内容过长 | 400 |
| TOOL_001 | 工具不存在 | 404 |
| TOOL_002 | 工具执行失败 | 500 |
| KNOWLEDGE_001 | 知识库搜索失败 | 500 |
| GOAL_001 | 目标不存在 | 404 |
| GOAL_002 | 目标状态无效 | 400 |
| SYS_001 | 系统内部错误 | 500 |
| SYS_002 | 服务暂时不可用 | 503 |

## 📝 使用示例

### JavaScript/TypeScript

```typescript
class YYCAIClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = 'http://localhost:8080/api') {
    this.baseUrl = baseUrl;
  }

  async login(username: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      this.token = data.data.accessToken;
    }
    return data;
  }

  async sendMessage(message: string, options = {}) {
    if (!this.token) {
      throw new Error('未认证');
    }

    const response = await fetch(`${this.baseUrl}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ message, ...options }),
    });

    return response.json();
  }

  createWebSocket() {
    if (!this.token) {
      throw new Error('未认证');
    }

    return io('ws://localhost:8080', {
      auth: { token: this.token }
    });
  }
}

// 使用示例
const client = new YYCAIClient();

// 登录
await client.login('username', 'password');

// 发送消息
const response = await client.sendMessage('你好，请介绍一下YYC³系统');
console.log(response.data.message);

// WebSocket连接
const socket = client.createWebSocket();
socket.on('ai-response', (data) => {
  console.log('实时AI回复:', data.message);
});
```

### Python

```python
import requests
import socketio

class YYCAIClient:
    def __init__(self, base_url="http://localhost:8080/api"):
        self.base_url = base_url
        self.token = None

    def login(self, username, password):
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"username": username, "password": password}
        )
        data = response.json()
        if data.get("success"):
            self.token = data["data"]["accessToken"]
        return data

    def send_message(self, message, options=None):
        if not self.token:
            raise Exception("未认证")

        response = requests.post(
            f"{self.base_url}/ai/chat",
            json={"message": message, **(options or {})},
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.token}"
            }
        )
        return response.json()

# 使用示例
client = YYCAIClient()

# 登录
client.login("username", "password")

# 发送消息
response = client.send_message("你好，请介绍一下YYC³系统")
print(response["data"]["message"])
```

## 🔗 相关链接

- [系统概述](../README.md)
- [开发指南](DEVELOPMENT.md)
- [部署指南](DEPLOYMENT.md)
- [配置说明](CONFIGURATION.md)

---

最后更新: 2024-01-01
---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>

