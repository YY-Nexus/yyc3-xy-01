# 开发指南

## 📋 概述

本文档描述小语智能成长守护系统的开发规范和流程。

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/xiaoyu-ai.git
cd xiaoyu-ai
```

### 2. 安装依赖

```bash
# 安装所有依赖（根目录执行）
npm install
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.sample .env

# 编辑.env文件，填入必要配置
```

**必要配置项**:

```env
MONGO_URI=mongodb://127.0.0.1:27017
MONGO_DB=xiaoyu_dev
OPENAI_API_KEY=your_api_key
JWT_SECRET=dev_secret_key
```

### 4. 启动开发服务器

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:web    # 前端 (localhost:5173)
npm run dev:server # 后端 (localhost:4000)
```

---

## 🏗️ 项目结构

```
xiaoyu-ai/
├── apps/
│   ├── web/                    # 前端应用
│   │   ├── src/
│   │   │   ├── components/     # 组件
│   │   │   ├── pages/          # 页面
│   │   │   ├── hooks/          # 自定义Hooks
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── store.ts        # Redux Store
│   │   │   └── main.tsx        # 入口文件
│   │   └── package.json
│   │
│   └── server/                 # 后端应用
│       ├── src/
│       │   ├── routes/         # API路由
│       │   ├── models/         # 数据模型
│       │   ├── ai/             # AI服务
│       │   ├── services/       # 业务服务
│       │   ├── middleware/     # 中间件
│       │   └── index.ts        # 入口文件
│       └── package.json
│
├── docs/                       # 文档
├── package.json                # 根配置
└── README.md                   # 项目说明
```

---

## 💻 开发规范

### 代码风格

#### TypeScript规范

```typescript
// ✅ 推荐
interface User {
  id: string
  name: string
  email: string
}

function getUserById(id: string): Promise<User | null> {
  // 实现
}

// ❌ 不推荐
function getUserById(id) {
  // 缺少类型注解
}
```

#### 命名规范

- **文件名**:
  - 组件: `PascalCase.tsx` (例: `UserProfile.tsx`)
  - 工具函数: `camelCase.ts` (例: `formatDate.ts`)
  - 路由: `kebab-case.ts` (例: `user-profile.ts`)

- **变量/函数**: `camelCase`

  ```typescript
  const userName = 'John'
  function getUserName() {}
  ```

- **类/接口/类型**: `PascalCase`

  ```typescript
  class UserService {}
  interface UserData {}
  type UserRole = 'admin' | 'user'
  ```

- **常量**: `UPPER_SNAKE_CASE`

  ```typescript
  const MAX_RETRY_COUNT = 3
  const API_BASE_URL = 'https://api.example.com'
  ```

#### 注释规范

```typescript
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 用户数据
 * @throws {Error} 用户不存在时抛出错误
 */
async function getUserInfo(userId: string): Promise<User> {
  // 实现
}
```

---

## 🧩 组件开发

### React组件规范

```typescript
import React, { useState, useEffect } from 'react'

interface UserCardProps {
  userId: string
  onUserClick?: (userId: string) => void
}

/**
 * 用户卡片组件
 * 展示用户基本信息
 */
export const UserCard: React.FC<UserCardProps> = ({ userId, onUserClick }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [userId])

  const loadUser = async () => {
    try {
      setLoading(true)
      const data = await fetchUser(userId)
      setUser(data)
    } catch (error) {
      console.error('Failed to load user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!user) {
    return <EmptyState />
  }

  return (
    <div className="user-card" onClick={() => onUserClick?.(userId)}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}
```

### Hooks使用规范

```typescript
// ✅ 自定义Hook
function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadUser = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUser(userId)
        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      cancelled = true
    }
  }, [userId])

  return { user, loading, error }
}
```

---

## 🔌 API开发

### 路由规范

```typescript
import { Router } from 'express'
import { auth } from '../middleware/auth'

const router = Router()

/**
 * 获取用户列表
 * GET /api/users?page=1&limit=20
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const users = await User.find()
      .skip((page - 1) * limit)
      .limit(limit)
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: await User.countDocuments()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
```

### 错误处理

```typescript
// 自定义错误类
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 使用
throw new AppError(404, 'User not found', 'USER_NOT_FOUND')

// 错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code
    })
  }

  console.error(err)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})
```

---

## 🧪 测试规范

### 单元测试

```typescript
import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    const date = new Date('2024-01-01')
    expect(formatDate(date)).toBe('2024-01-01')
  })

  it('应该处理无效日期', () => {
    expect(formatDate(null)).toBe('-')
  })
})
```

### 组件测试

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserCard } from './UserCard'

describe('UserCard', () => {
  it('应该显示用户信息', async () => {
    render(<UserCard userId="123" />)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('应该处理点击事件', async () => {
    const onUserClick = vi.fn()
    render(<UserCard userId="123" onUserClick={onUserClick} />)

    await waitFor(() => {
      screen.getByText('John Doe')
    })

    await userEvent.click(screen.getByRole('button'))
    expect(onUserClick).toHaveBeenCalledWith('123')
  })
})
```

### API测试

```typescript
import request from 'supertest'
import app from '../app'

describe('GET /api/users', () => {
  it('应该返回用户列表', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', 'Bearer valid_token')
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(Array.isArray(response.body.data)).toBe(true)
  })

  it('应该要求认证', async () => {
    await request(app)
      .get('/api/users')
      .expect(401)
  })
})
```

---

## 🎨 样式开发

### Tailwind CSS规范

```tsx
// ✅ 推荐：使用Tailwind工具类
<div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
  <img src={avatar} className="w-12 h-12 rounded-full" />
  <div className="flex-1">
    <h3 className="text-lg font-semibold">{name}</h3>
    <p className="text-sm text-gray-600">{email}</p>
  </div>
</div>

// ✅ 响应式设计
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 内容 */}
</div>

// ✅ 暗色模式支持
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  {/* 内容 */}
</div>

// ❌ 不推荐：内联样式
<div style={{ display: 'flex', padding: '16px' }}>
  {/* 内容 */}
</div>
```

---

## 🔧 常用命令

### 开发命令

```bash
# 启动开发服务器
npm run dev
npm run dev:web
npm run dev:server

# 构建项目
npm run build
npm run build:web
npm run build:server

# 运行测试
npm test
npm run test:web
npm run test:server

# 代码检查
npm run lint
npm run lint:fix

# 类型检查
npm run type-check
```

### 数据库命令

```bash
# 连接MongoDB
mongo xiaoyu_dev

# 查看集合
show collections

# 清空集合
db.daily_records.deleteMany({})

# 创建索引
db.daily_records.createIndex({ userId: 1, occurredAt: -1 })
```

---

## 🐛 调试技巧

### 前端调试

```typescript
// 使用React DevTools
// Chrome扩展：React Developer Tools

// 使用Redux DevTools
// Chrome扩展：Redux DevTools

// Console调试
console.log('Debug info:', data)
console.table(users)
console.error('Error occurred:', error)
```

### 后端调试

```typescript
// 使用debug包
import debug from 'debug'
const log = debug('app:server')

log('Server started on port %d', port)

// 启动时设置DEBUG环境变量
// DEBUG=app:* npm run dev:server

// VS Code调试配置 (.vscode/launch.json)
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/apps/server/src/index.ts",
      "runtimeArgs": ["-r", "ts-node/register"],
      "cwd": "${workspaceFolder}",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

---

## 📚 学习资源

### 官方文档

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://docs.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)

### 推荐阅读

- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Patterns](https://reactpatterns.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🤝 贡献指南

### 提交规范

使用Conventional Commits格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型(type)**:

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

**示例**:

```bash
git commit -m "feat(web): 添加用户个人资料页面"
git commit -m "fix(server): 修复用户认证token过期问题"
git commit -m "docs: 更新API文档"
```

### Pull Request流程

1. Fork项目
2. 创建特性分支

   ```bash
   git checkout -b feature/your-feature
   ```

3. 提交代码

   ```bash
   git commit -m "feat: your feature"
   ```

4. 推送到远程

   ```bash
   git push origin feature/your-feature
   ```

5. 创建Pull Request

---

## ❓ 常见问题

### Q: 如何重置数据库？

```bash
mongo xiaoyu_dev
> db.dropDatabase()
```

### Q: 如何清除缓存？

```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules和lock文件
rm -rf node_modules package-lock.json
npm install
```

### Q: 如何更新依赖？

```bash
# 检查过时的包
npm outdated

# 更新所有包到最新版本
npm update

# 更新特定包
npm install package-name@latest
```

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

