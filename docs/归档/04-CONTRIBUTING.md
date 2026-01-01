# 贡献指南

感谢您对小语智能成长守护系统的关注！我们欢迎任何形式的贡献。

---

## 🤝 如何贡献

### 报告Bug

如果您发现了bug，请：

1. 检查 [Issues](https://github.com/yourusername/xiaoyu-ai/issues) 确认问题尚未被报告
2. 创建新Issue，包含以下信息：
   - Bug描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（浏览器、操作系统等）
   - 截图或错误日志

### 建议新功能

我们欢迎功能建议！请：

1. 创建Feature Request Issue
2. 描述功能的用途和价值
3. 提供设计思路或原型（如有）
4. 说明该功能如何改善用户体验

### 提交代码

#### 1. Fork项目

点击右上角"Fork"按钮，创建您自己的副本。

#### 2. 克隆到本地

```bash
git clone https://github.com/your-username/xiaoyu-ai.git
cd xiaoyu-ai
```

#### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

#### 4. 安装依赖

```bash
npm install
```

#### 5. 进行修改

- 遵循项目的代码规范
- 添加必要的测试
- 更新相关文档
- 确保所有测试通过

```bash
npm test
npm run lint
npm run type-check
```

#### 6. 提交代码

使用Conventional Commits格式：

```bash
git commit -m "feat: 添加用户个人资料页面"
git commit -m "fix: 修复登录token过期问题"
git commit -m "docs: 更新API文档"
```

**提交类型**:

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

#### 7. 推送到远程

```bash
git push origin feature/your-feature-name
```

#### 8. 创建Pull Request

1. 访问您的Fork页面
2. 点击"New Pull Request"
3. 填写PR描述：
   - 解决的问题或实现的功能
   - 修改内容概述
   - 测试情况
   - 相关Issue链接（如有）
4. 等待审核

---

## 📝 代码规范

### TypeScript

```typescript
// ✅ 推荐
interface User {
  id: string
  name: string
}

async function getUserById(id: string): Promise<User | null> {
  // 实现
}

// ❌ 不推荐
function getUserById(id) {
  // 缺少类型
}
```

### React组件

```typescript
// ✅ 推荐
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ onClick, children }) => {
  return <button onClick={onClick}>{children}</button>
}

// ❌ 不推荐
export const Button = (props) => {
  return <button>{props.children}</button>
}
```

### 命名规范

- 组件：`PascalCase` (例: `UserCard`)
- 函数/变量：`camelCase` (例: `getUserName`)
- 常量：`UPPER_SNAKE_CASE` (例: `MAX_RETRY_COUNT`)
- 文件名：
  - 组件：`PascalCase.tsx`
  - 工具：`camelCase.ts`
  - 路由：`kebab-case.ts`

---

## 🧪 测试要求

所有新功能和Bug修复都应包含测试。

### 组件测试

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('应该渲染按钮文本', () => {
    render(<Button>点击我</Button>)
    expect(screen.getByText('点击我')).toBeInTheDocument()
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
      .expect(200)

    expect(response.body.success).toBe(true)
  })
})
```

---

## 📚 文档要求

### 代码注释

```typescript
/**
 * 获取用户信息
 * @param userId - 用户ID
 * @returns 用户数据
 */
async function getUserInfo(userId: string): Promise<User>
```

### README更新

如果您添加了新模块或重要功能，请更新相应的README文件。

---

## ✅ Pull Request检查清单

在提交PR前，请确认：

- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] Commit信息符合规范
- [ ] 代码无TypeScript错误
- [ ] 代码通过Lint检查

---

## 🎯 优先级

我们当前关注以下方向的贡献：

### 高优先级

- Bug修复
- 性能优化
- 可访问性改进
- 测试覆盖率提升

### 中优先级

- 新功能开发
- UI/UX改进
- 文档完善

### 低优先级

- 代码重构
- 依赖更新

---

## 💬 交流渠道

- **GitHub Issues**: 问题讨论和功能建议
- **GitHub Discussions**: 一般性讨论
- **Email**: <your-email@example.com>

---

## 🙏 行为准则

我们致力于营造一个开放和友好的社区环境。参与项目即表示您同意遵守以下准则：

- 尊重所有贡献者
- 接受建设性批评
- 关注对社区最有利的事
- 对他人表示同理心

---

## 📄 许可证

通过贡献，您同意您的贡献将采用与项目相同的 [MIT许可证](../LICENSE)。

---

**感谢您的贡献！** ❤️

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>

