# YYC³ 智能插拔式移动AI系统

<div align="center">

![YYC³ Banner](public/git_1800_450-7.png)

![YYC³ Logo](https://img.shields.io/badge/YYC³-智能插拔式移动AI系统-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Bun](https://img.shields.io/badge/runtime-Bun-black?style=for-the-badge)
![Next.js](https://img.shields.io/badge/framework-Next.js-14.2.35-black?style=for-the-badge)

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](https://github.com/YY-Nexus/yyc3-xy-01/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Code Style](https://img.shields.io/badge/code%20style-prettier-ff69b4?style=flat-square&logo=prettier)](https://prettier.io/)
[![ESLint](https://img.shields.io/badge/ESLint-8.57.1-4B32C3?style=flat-square&logo=eslint)](https://eslint.org/)
[![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-success?style=flat-square)](https://github.com/YY-Nexus/yyc3-xy-01/network/dependencies)
[![Commit Activity](https://img.shields.io/badge/commit%20activity-active-success?style=flat-square)](https://github.com/YY-Nexus/yyc3-xy-01/commits/main)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](http://makeapullrequest.com)
[![Stars](https://img.shields.io/github/stars/YY-Nexus/yyc3-xy-01?style=flat-square&logo=github)](https://github.com/YY-Nexus/yyc3-xy-01/stargazers)
[![Forks](https://img.shields.io/github/forks/YY-Nexus/yyc3-xy-01?style=flat-square&logo=github)](https://github.com/YY-Nexus/yyc3-xy-01/network/members)
[![Issues](https://img.shields.io/github/issues/YY-Nexus/yyc3-xy-01?style=flat-square&logo=github)](https://github.com/YY-Nexus/yyc3-xy-01/issues)
[![License MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://choosealicense.com/licenses/mit/)

**Intelligent Pluggable Mobile AI System**

基于事件驱动+目标驱动混合架构的智能插拔式移动AI系统，支持动态工具注册、知识库管理、多模态AI交互和微服务部署。

[快速开始](#快速开始) • [功能特性](#功能特性) • [系统架构](#系统架构) • [文档索引](#文档索引) • [API文档](#api文档) • [部署指南](#部署指南)

</div>

---

## 📋 目录

- [项目概述](#项目概述)
- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [文档索引](#文档索引)
- [开发指南](#开发指南)
- [部署指南](#部署指南)
- [API文档](#api文档)
- [配置说明](#配置说明)
- [监控与运维](#监控与运维)
- [贡献指南](#贡献指南)
- [许可证](#许可证)
- [联系我们](#联系我们)

---

## 🎯 项目概述

YYC³智能插拔式移动AI系统是一个现代化的、可扩展的AI服务平台，采用微服务架构和容器化部署，专为0-3岁儿童成长守护场景设计。系统集成了先进的AI技术，提供智能化的成长记录、教育指导、情感陪伴和个性化推荐服务。

### 核心价值

- **智能成长守护** - 基于AI的0-3岁儿童成长记录与分析
- **多模态交互** - 支持文本、语音、图像、视频等多种交互方式
- **个性化推荐** - 根据儿童成长数据提供定制化教育内容
- **实时陪伴** - 智能AI助手提供24/7情感陪伴和互动
- **家长赋能** - 为家长提供科学的育儿指导和成长建议

### 技术亮点

- **事件驱动+目标驱动混合架构** - 灵活高效的AI决策机制
- **动态工具生态** - 自动工具发现与注册系统
- **RAG知识库** - 向量存储和检索增强生成
- **微服务架构** - 完整的服务编排和API网关
- **三层学习架构** - 行为、策略、知识三层智能学习

---

## ✨ 功能特性

### 🤖 智能AI助手

- **拖拽式界面** - 基于React DnD的智能组件，自由布局
- **多视图切换** - 对话、工具、洞察多模式切换
- **位置优化** - 自动最佳位置计算，提升用户体验
- **实时任务监控** - 动态任务状态跟踪和进度展示
- **语音交互** - 支持语音输入和语音回复
- **情感识别** - 实时分析用户情绪状态

### 🧠 核心系统引擎

- **AgenticCore** - 事件驱动+目标驱动混合架构
- **ServiceOrchestrator** - 微服务编排与协调
- **GoalManagementSystem** - 目标生命周期管理
- **MetaLearningSystem** - 三层智能学习架构（行为、策略、知识）

### 👶 0-3岁成长守护体系

- **成长记录** - 智能记录儿童成长里程碑
- **发展评估** - 基于儿童发展理论的智能评估
- **个性化指导** - 根据成长数据提供定制化建议
- **里程碑庆祝** - 自动识别并庆祝成长里程碑
- **智能相册** - AI驱动的成长照片智能管理
- **发展曲线** - 可视化展示儿童发展轨迹

### 📚 教育内容系统

- **有声绘本** - AI配音的互动绘本
- **智能课表** - 个性化的学习计划
- **作业助手** - AI辅助的作业辅导
- **创意工坊** - 激发创造力的AI创作工具
- **视频工坊** - AI视频生成和编辑
- **公益课堂** - 优质教育内容推荐

### 🎨 多模态交互

- **文本对话** - 智能回复与上下文理解
- **语音识别** - 实时语音转文字
- **语音合成** - 自然的语音输出
- **图像处理** - 视觉内容理解与分析
- **文件上传** - 多格式文件智能处理
- **视频生成** - AI视频创作能力

### 🏗️ 基础设施

- **容器化部署** - Docker + Docker Compose
- **微服务架构** - 服务发现与健康检查
- **实时通信** - WebSocket双向通信
- **监控告警** - 完整的监控和告警系统
- **负载均衡** - 高可用性服务部署
- **数据安全** - 完善的数据加密和访问控制

---

## 🏗️ 系统架构

```mermaid
graph TB
    subgraph "前端层 Frontend Layer"
        A[智能AI组件] --> B[Next.js应用]
        B --> C[拖拽界面]
        B --> D[多语言支持]
    end

    subgraph "API网关层 API Gateway Layer"
        E[API Gateway] --> F[负载均衡]
        E --> G[认证授权]
        E --> H[限流熔断]
        E --> I[路由分发]
    end

    subgraph "服务层 Service Layer"
        J[AgenticCore] --> K[事件处理]
        L[ToolManager] --> M[工具注册]
        N[KnowledgeManager] --> O[RAG检索]
        P[GoalManager] --> Q[目标管理]
        R[MetaLearning] --> S[学习系统]
        T[GrowthService] --> U[成长记录]
        V[EduService] --> W[教育内容]
    end

    subgraph "数据层 Data Layer"
        X[PostgreSQL] --> Y[关系数据]
        Z[Redis] --> AA[缓存会话]
        AB[Elasticsearch] --> AC[搜索索引]
        AD[VectorDB] --> AE[向量存储]
        AF[Neo4j] --> AG[知识图谱]
    end

    A --> E
    B --> E
    E --> J
    E --> L
    E --> N
    E --> P
    E --> R
    E --> T
    E --> V

    J --> X
    L --> Z
    N --> AB
    N --> AD
    P --> X
    R --> X
    T --> X
    V --> X
```

### 核心组件状态

| 组件 | 功能 | 状态 | 文档 |
|------|------|------|------|
| **AgenticCore** | 事件驱动核心引擎 | ✅ 完成 | [技术文档](docs/YYC3-XY-开发实施/122-YYC3-XY-技术类-AI智能守护体系开发者文档.md) |
| **ServiceOrchestrator** | 服务编排管理 | ✅ 完成 | [架构文档](docs/YYC3-XY-开发实施/080-YYC3-XY-审核类-Phase2微服务架构报告.md) |
| **ToolManager** | 工具注册发现 | ✅ 完成 | [API文档](docs/YYC3-XY-开发实施/142-YYC3-XY-技术类-API接口文档.md) |
| **KnowledgeManager** | RAG知识库 | ✅ 完成 | [知识图谱文档](docs/YYC3-XY-开发实施/096-YYC3-XY-实施类-知识图谱构建.md) |
| **APIGateway** | 统一API网关 | ✅ 完成 | [API文档](docs/YYC3-XY-开发实施/142-YYC3-XY-技术类-API接口文档.md) |
| **IntelligentWidget** | 智能拖拽组件 | ✅ 完成 | [组件文档](docs/YYC3-XY-开发实施/144-YYC3-XY-技术类-组件库文档.md) |
| **GrowthSystem** | 成长记录系统 | ✅ 完成 | [成长记录文档](docs/YYC3-XY-开发实施/129-YYC3-XY-技术类-成长记录与指导系统.md) |
| **VoiceSystem** | 语音交互系统 | ✅ 完成 | [语音系统文档](docs/YYC3-XY-开发实施/134-YYC3-XY-技术类-设计小语语音系统.md) |

---

## 🛠️ 技术栈

### 前端技术 Frontend

- **React 19.2.3** - 用户界面框架
- **Next.js 14.2.35** - React应用框架
- **TypeScript 5** - 类型安全的JavaScript
- **TailwindCSS 4.1.9** - 原子化CSS框架
- **Radix UI** - 无样式组件库（包含完整的UI组件集合）
- **Framer Motion 12.23.25** - 动画库
- **React DnD 16.0.1** - 拖拽功能库
- **React Beautiful DnD 13.1.1** - 拖拽功能库
- **Lucide React 0.454.0** - 图标库
- **React Icons 5.5.0** - 图标库
- **React Hook Form 7.60.0** - 表单处理
- **Zod 3.25.76** - 数据验证
- **TanStack React Query 5.56.2** - 数据获取和状态管理
- **Redux Toolkit 2.11.2** - 状态管理
- **Redux Persist 6.0.0** - 状态持久化
- **SWR** - 数据获取库
- **next-intl 4.6.1** - 国际化支持
- **next-themes 0.4.6** - 主题管理
- **date-fns 4.1.0** - 日期处理
- **React Dropzone 14.3.8** - 文件上传
- **React Toastify 11.0.5** - 通知提示
- **Sonner 1.7.4** - 通知组件
- **Recharts 2.15.4** - 图表库
- **Embla Carousel 8.5.1** - 轮播组件
- **React Day Picker 9.8.0** - 日期选择器
- **Vaul 1.1.2** - 抽屉组件
- **React Resizable Panels 2.1.7** - 可调整面板

### 后端技术 Backend

- **Bun 1.1.38** - 高性能JavaScript运行时
- **Node.js >= 18.0.0** - 服务端JavaScript
- **Hono 4.6.3** - 轻量级Web框架
- **@hono/node-server 1.19.7** - Hono Node.js服务器适配器
- **Socket.io 4.8.0** - 实时通信
- **Socket.io Client 4.8.0** - Socket.io客户端
- **WS 8.18.0** - WebSocket库
- **PostgreSQL (pg 8.13.0)** - 关系型数据库
- **Redis (ioredis 5.4.1)** - 内存数据库
- **Redis (redis 4.7.0)** - Redis客户端
- **SQLite (sqlite3 5.1.7)** - 轻量级数据库
- **SQL.js 1.12.0** - 纯JavaScript SQLite实现
- **JWT (jsonwebtoken 9.0.2)** - JSON Web Token认证

### AI/ML技术 AI & Machine Learning

- **OpenAI API 4.67.1** - GPT模型集成
- **AI SDK 5.0.115** - Vercel AI SDK
- **@ai-sdk/openai 1.0.2** - OpenAI AI SDK
- **TensorFlow.js 4.22.0** - 机器学习库
- **@tensorflow-models/universal-sentence-encoder 1.3.3** - 通用句子编码器
- **RAG架构** - 检索增强生成
- **Neo4j Driver 6.0.1** - 知识图谱数据库

### 开发工具 Development Tools

- **ESLint 9.0.0** - 代码检查
- **Prettier 3.3.2** - 代码格式化
- **Biome 1.9.4** - 代码格式化和检查工具
- **TypeScript ESLint 8.0.0** - TypeScript代码检查
- **Testing Library** - React测试库
  - @testing-library/react 16.3.0
  - @testing-library/jest-dom 6.9.1
  - @testing-library/user-event 14.6.1
  - @testing-library/dom 10.4.1
- **Jest** - 测试框架
- **jsdom 27.3.0** - DOM模拟
- **PostCSS 8.5** - CSS处理
- **Autoprefixer 10.4.20** - CSS自动前缀

### 基础设施 Infrastructure

- **Docker** - 容器化技术
- **Docker Compose** - 容器编排
- **Nginx** - 反向代理
- **Vercel Analytics** - 分析和监控
- **Vercel Speed Insights** - 性能监控

---

## 🚀 快速开始

### 环境要求 Environment Requirements

- **Bun** >= 1.0.0
- **Node.js** >= 18.0.0
- **Docker** >= 20.0.0
- **Docker Compose** >= 2.0.0

### 一键部署 One-Click Deployment

```bash
# 克隆项目 Clone the repository
git clone https://github.com/YY-Nexus/yyc3-xy-01.git
cd yyc3-xy-01

# 配置环境变量 Configure environment variables
cp .env.example .env.local
# 编辑 .env.local 填入必要的配置 Edit .env.local and fill in necessary configurations

# 一键部署 One-click deployment
chmod +x deploy.sh
./deploy.sh deploy
```

### 开发环境启动 Development Setup

```bash
# 安装依赖 Install dependencies
bun install

# 启动开发服务器（Next.js应用）Start development server (Next.js app)
bun run dev:next

# 启动主服务（Bun服务）Start main service (Bun service)
bun run dev

# 启动特定服务 Start specific services
bun run orchestrator  # 服务编排 Service orchestration
bun run gateway       # API网关 API Gateway
bun run agentic       # Agentic核心 Agentic Core
```

### 访问地址 Access URLs

- **主应用 Main App**: <http://localhost:1228> (Next.js应用，项目专用端口)
- **API网关 API Gateway**: <http://localhost:1229> (项目专用端口)
- **Nginx代理 Nginx Proxy**: <http://localhost>

### 运行测试 Run Tests

```bash
# 运行所有测试 Run all tests
bun test

# 运行测试并监听变化 Run tests in watch mode
bun test --watch

# 生成测试覆盖率 Generate test coverage
bun test --coverage
```

### 代码质量检查 Code Quality Check

```bash
# 类型检查 Type check
bun run type-check

# 代码检查 Lint code
bun run lint

# 代码格式化 Format code
bun run format
```

---

## 📁 项目结构

```
yyc3-xy-01/
├── .github/                    # GitHub Actions工作流配置
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── test.yml
├── .trae/                      # Trae IDE配置和规则
│   └── rules/
│       └── project_rules.md    # 项目规则文档
├── __mocks__/                  # 模拟数据
├── __tests__/                  # 测试文件
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   └── utils/
├── app/                        # Next.js应用目录
│   ├── [locale]/               # 国际化路由
│   │   ├── ai-chat/           # AI聊天页面
│   │   ├── growth/            # 成长记录页面
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── activities/            # 活动页面
│   ├── ai-creative/           # AI创意工坊
│   ├── api/                   # API路由
│   │   ├── ai/               # AI相关API
│   │   ├── children/         # 儿童管理API
│   │   ├── growth-records/   # 成长记录API
│   │   └── homework/         # 作业API
│   ├── books/                 # 有声绘本
│   ├── children/              # 儿童管理
│   ├── courses/               # 课程管理
│   ├── growth/                # 成长记录
│   │   ├── assessment/       # 发展评估
│   │   └── page.tsx
│   ├── homework/              # 作业助手
│   ├── profile/               # 用户中心
│   ├── settings/              # 设置管理
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 首页
│   └── globals.css            # 全局样式
├── backend/                   # 后端服务
│   ├── src/
│   │   ├── config/           # 配置文件
│   │   ├── controllers/      # 控制器
│   │   ├── middleware/       # 中间件
│   │   ├── migrations/       # 数据库迁移
│   │   ├── routes/           # 路由
│   │   └── types/            # 类型定义
│   ├── package.json
│   └── tsconfig.json
├── components/                # React组件
│   ├── accessibility/         # 无障碍功能
│   ├── ai-xiaoyu/            # 小语AI助手
│   ├── auth/                 # 认证组件
│   ├── books/                # 绘本组件
│   ├── character/            # 角色管理
│   ├── common/               # 通用组件
│   ├── courses/              # 课程组件
│   ├── emotion/              # 情感监控
│   ├── growth/               # 成长记录组件
│   │   └── enhanced/        # 增强功能
│   ├── homework/             # 作业组件
│   ├── headers/              # 页头组件
│   ├── ui/                   # UI基础组件
│   ├── video/                # 视频组件
│   └── ...
├── core/                     # 核心引擎
│   └── AgenticCore.ts        # AI核心
├── docs/                     # 文档目录
│   ├── YYC3-XY-审核分析/     # 审核分析文档
│   ├── YYC3-XY-审核报告/     # 审核报告
│   ├── YYC3-XY-开发实施/     # 开发实施文档
│   │   ├── 技巧类/
│   │   ├── 架构类/
│   │   ├── 技术类/
│   │   └── ...
│   └── README.md
├── public/                   # 公共静态资源
│   ├── UI页面图示/
│   ├── role-photos/         # 角色照片
│   ├── git_1800_450-7.png   # Git顶图
│   └── ...
├── config/                  # 配置文件
│   └── nginx/
│       └── nginx.conf
├── .env.example            # 环境变量示例
├── .eslintignore           # ESLint忽略配置
├── .gitignore              # Git忽略配置
├── .prettierrc             # Prettier配置
├── Dockerfile              # Docker配置
├── docker-compose.yml      # Docker Compose配置
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
└── README.md               # 项目说明（本文件）
```

---

## 📚 文档索引

项目文档按照以下结构组织：

### 核心文档 Core Documentation

| 文档名称 | 描述 | 链接 |
|---------|------|------|
| **文档索引** | 完整的文档索引和管理规范 | [docs/README.md](docs/README.md) |
| **技术栈文档** | 项目技术栈详细说明 | [docs/01-TECH_STACK.md](docs/01-TECH_STACK.md) |
| **项目架构规范** | 系统架构设计规范 | [docs/01-项目架构规范.md](docs/01-项目架构规范.md) |
| **API接口文档** | API接口详细说明 | [docs/02-API接口文档.md](docs/02-API接口文档.md) |
| **组件开发规范** | 组件开发指南 | [docs/03-组件开发规范.md](docs/03-组件开发规范.md) |
| **代码风格规范** | 代码风格和格式规范 | [docs/04-CODE_STYLE.md](docs/04-CODE_STYLE.md) |
| **项目架构总览** | 整体架构概览 | [docs/05-项目架构总览.md](docs/05-项目架构总览.md) |

### 审核分析文档 Audit & Analysis Documentation

#### 审核分析 (docs/YYC3-XY-审核分析/)

- [073-YYC3-XY-审核类-Phase1完成总报告.md](docs/YYC3-XY-审核分析/073-YYC3-XY-审核类-Phase1完成总报告.md)
- [075-YYC3-XY-审核类-Phase1测试体系建设报告.md](docs/YYC3-XY-审核分析/075-YYC3-XY-审核类-Phase1测试体系建设报告.md)
- [076-YYC3-XY-审核类-Phase1部署优化报告.md](docs/YYC3-XY-审核分析/076-YYC3-XY-审核类-Phase1部署优化报告.md)
- [077-YYC3-XY-审核类-Phase2本地AI集成报告.md](docs/YYC3-XY-审核分析/077-YYC3-XY-审核类-Phase2本地AI集成报告.md)
- [078-YYC3-XY-审核类-Phase2知识图谱报告.md](docs/YYC3-XY-审核分析/078-YYC3-XY-审核类-Phase2知识图谱报告.md)
- [079-YYC3-XY-审核类-知识图谱技术总结.md](docs/YYC3-XY-审核分析/079-YYC3-XY-审核类-知识图谱技术总结.md)
- [080-YYC3-XY-审核类-Phase2微服务架构报告.md](docs/YYC3-XY-审核分析/080-YYC3-XY-审核类-Phase2微服务架构报告.md)
- [081-YYC3-XY-审核类-Phase2数据分析平台报告.md](docs/YYC3-XY-审核分析/081-YYC3-XY-审核类-Phase2数据分析平台报告.md)
- [082-YYC3-XY-审核类-开发进度总报告.md](docs/YYC3-XY-审核分析/082-YYC3-XY-审核类-开发进度总报告.md)
- [148-YYC3-XY-管理类-0-3岁成长守护体系启动全局审核报告.md](docs/YYC3-XY-审核分析/148-YYC3-XY-管理类-0-3岁成长守护体系启动全局审核报告.md)
- [149-YYC3-XY-管理类-团队审核分析清单.md](docs/YYC3-XY-审核分析/149-YYC3-XY-管理类-团队审核分析清单.md)

#### 审核报告 (docs/YYC3-XY-审核报告/)

- [代码质量评估报告.md](docs/YYC3-XY-审核报告/代码质量评估报告.md)
- [功能完整性评估报告.md](docs/YYC3-XY-审核报告/功能完整性评估报告.md)
- [开发运维评估报告.md](docs/YYC3-XY-审核报告/开发运维评估报告.md)
- [技术架构评估报告.md](docs/YYC3-XY-审核报告/技术架构评估报告.md)

### 开发实施文档 Development & Implementation Documentation

#### 技巧类 (docs/YYC3-XY-开发实施/技巧类/)

- [027-YYC3-XY-技巧类-编码规范手册.md](docs/YYC3-XY-开发实施/技巧类/027-YYC3-XY-技巧类-编码规范手册.md)
- [029-YYC3-XY-技巧类-版本控制最佳实践.md](docs/YYC3-XY-开发实施/技巧类/029-YYC3-XY-技巧类-版本控制最佳实践.md)
- [031-YYC3-XY-技巧类-开发效率提升技巧集.md](docs/YYC3-XY-开发实施/技巧类/031-YYC3-XY-技巧类-开发效率提升技巧集.md)
- [034-YYC3-XY-技巧类-常见开发架构问题解决方案.md](docs/YYC3-XY-开发实施/技巧类/034-YYC3-XY-技巧类-常见开发架构问题解决方案.md)
- [035-YYC3-XY-技巧类-AI模型开发调优技巧.md](docs/YYC3-XY-开发实施/技巧类/035-YYC3-XY-技巧类-AI模型开发调优技巧.md)
- [037-YYC3-XY-技巧类-开发环境设置指南.md](docs/YYC3-XY-开发实施/技巧类/037-YYC3-XY-技巧类-开发环境设置指南.md)
- [039-YYC3-XY-技巧类-代码标准.md](docs/YYC3-XY-开发实施/技巧类/039-YYC3-XY-技巧类-代码标准.md)

#### 架构类 (docs/YYC3-XY-开发实施/架构类/)

- [028-YYC3-XY-架构类-代码架构实现说明书.md](docs/YYC3-XY-开发实施/架构类/028-YYC3-XY-架构类-代码架构实现说明书.md)

#### 技术类 (docs/YYC3-XY-开发实施/技术类/)

- [095-YYC3-XY-实施类-本地AI模型集成.md](docs/YYC3-XY-开发实施/095-YYC3-XY-实施类-本地AI模型集成.md)
- [096-YYC3-XY-实施类-知识图谱构建.md](docs/YYC3-XY-开发实施/096-YYC3-XY-实施类-知识图谱构建.md)
- [097-YYC3-XY-实施类-微服务架构演进.md](docs/YYC3-XY-开发实施/097-YYC3-XY-实施类-微服务架构演进.md)
- [098-YYC3-XY-实施类-数据分析平台规划.md](docs/YYC3-XY-开发实施/098-YYC3-XY-实施类-数据分析平台规划.md)
- [122-YYC3-XY-技术类-AI智能守护体系开发者文档.md](docs/YYC3-XY-开发实施/122-YYC3-XY-技术类-AI智能守护体系开发者文档.md)
- [129-YYC3-XY-技术类-成长记录与指导系统.md](docs/YYC3-XY-开发实施/129-YYC3-XY-技术类-成长记录与指导系统.md)
- [134-YYC3-XY-技术类-设计小语语音系统.md](docs/YYC3-XY-开发实施/134-YYC3-XY-技术类-设计小语语音系统.md)
- [135-YYC3-XY-技术类-设计思路文件树与全库代码.md](docs/YYC3-XY-开发实施/135-YYC3-XY-技术类-设计思路文件树与全库代码.md)
- [138-YYC3-XY-技术类-EDU开发指导.md](docs/YYC3-XY-开发实施/138-YYC3-XY-技术类-EDU开发指导.md)
- [142-YYC3-XY-技术类-API接口文档.md](docs/YYC3-XY-开发实施/142-YYC3-XY-技术类-API接口文档.md)
- [144-YYC3-XY-技术类-组件库文档.md](docs/YYC3-XY-开发实施/144-YYC3-XY-技术类-组件库文档.md)
- [146-YYC3-XY-技术类-UI统一化视觉响应交互提升方案.md](docs/YYC3-XY-开发实施/146-YYC3-XY-技术类-UI统一化视觉响应交互提升方案.md)

#### 其他文档

- [AI浮窗组件路径.md](docs/YYC3-XY-开发实施/AI浮窗组件路径.md)
- [AI浮窗语音功能清单.md](docs/YYC3-XY-开发实施/AI浮窗语音功能清单.md)

---

## 📖 开发指南

### 开发工作流 Development Workflow

1. **功能开发 Feature Development**

   ```bash
   # 创建功能分支 Create feature branch
   git checkout -b feature/new-feature

   # 开发和测试 Develop and test
   bun run dev:next
   bun test
   ```

2. **代码质量 Code Quality**

   ```bash
   # 类型检查 Type check
   bun run type-check

   # 代码检查 Lint code
   bun run lint

   # 代码格式化 Format code
   bun run format
   ```

3. **构建部署 Build and Deploy**

   ```bash
   # 构建Next.js应用 Build Next.js app
   bun run build:next

   # 构建主服务 Build main service
   bun run build

   # 部署 Deploy
   ./deploy.sh deploy
   ```

### 组件开发 Component Development

#### 创建新的AI工具

```typescript
// core/tools/example-tool.ts
import { Tool, ToolResult } from '@/types/tools';

export class ExampleTool implements Tool {
  id = 'example-tool';
  name = '示例工具';
  description = '这是一个示例工具';
  version = '1.0.0';

  async execute(input: any): Promise<ToolResult> {
    // 工具执行逻辑 Tool execution logic
    return {
      success: true,
      data: '处理结果',
      metadata: {}
    };
  }

  async validate(input: any): Promise<boolean> {
    // 输入验证逻辑 Input validation logic
    return true;
  }
}
```

#### 注册工具

```typescript
// core/tools/ToolManager.ts
import { ExampleTool } from './example-tool';

const toolManager = new ToolManager();
await toolManager.registerTool(new ExampleTool());
```

### 代码规范 Code Standards

项目遵循以下代码规范：

- **TypeScript严格模式** - 启用所有严格类型检查
- **ESLint规则** - 遵循项目ESLint配置
- **Prettier格式化** - 统一代码格式
- **命名规范** - 遵循camelCase和PascalCase命名约定
- **注释规范** - 关键逻辑必须添加注释

详细规范请参考：
- [编码规范手册](docs/YYC3-XY-开发实施/技巧类/027-YYC3-XY-技巧类-编码规范手册.md)
- [代码标准](docs/YYC3-XY-开发实施/技巧类/039-YYC3-XY-技巧类-代码标准.md)

---

## 📦 部署指南

### 生产环境部署 Production Deployment

#### 服务器要求 Server Requirements

- **CPU**: 4核心以上
- **内存**: 8GB以上
- **存储**: 100GB以上
- **网络**: 100Mbps以上

#### 部署步骤 Deployment Steps

1. **克隆代码 Clone Code**

   ```bash
   git clone https://github.com/YY-Nexus/yyc3-xy-01.git
   cd yyc3-xy-01
   ```

2. **配置环境变量 Configure Environment Variables**

   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 填入必要的配置
   # Edit .env.local and fill in necessary configurations
   ```

3. **部署服务 Deploy Services**

   ```bash
   # 一键部署 One-click deployment
   chmod +x deploy.sh
   ./deploy.sh deploy

   # 或使用Docker Compose Or use Docker Compose
   docker-compose up -d
   ```

4. **SSL配置 SSL Configuration**

   ```bash
   # 将SSL证书放置到配置目录
   # Place SSL certificates in the config directory
   mkdir -p config/nginx/ssl
   cp your-cert.pem config/nginx/ssl/cert.pem
   cp your-key.pem config/nginx/ssl/key.pem
   ```

### Docker部署 Docker Deployment

#### 使用Docker Compose

```bash
# 启动所有服务 Start all services
docker-compose up -d

# 查看服务状态 Check service status
docker-compose ps

# 查看日志 View logs
docker-compose logs -f

# 停止服务 Stop services
docker-compose down
```

#### 单独部署特定服务

```bash
# 部署数据分析平台 Deploy data analytics platform
docker-compose -f docker-compose.data-analytics.yml up -d

# 部署知识图谱 Deploy knowledge graph
docker-compose -f docker-compose.knowledge-graph.yml up -d

# 部署微服务 Deploy microservices
docker-compose -f docker-compose.microservices.yml up -d

# 部署本地AI模型 Deploy local AI models
docker-compose -f docker-compose.ollama.yml up -d
```

### 监控配置 Monitoring Configuration

系统集成了完整的监控方案：

- **Vercel Analytics** - 应用分析和用户行为追踪
- **Vercel Speed Insights** - 性能监控和优化建议

访问监控面板：

- Vercel Analytics: 通过Vercel Dashboard访问
- Vercel Speed Insights: 通过Vercel Dashboard访问

---

## 📚 API文档

### 核心API端点 Core API Endpoints

#### 健康检查 Health Check

```http
GET /api/health
```

**响应 Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "ai": "ready"
  }
}
```

#### AI对话 AI Chat

```http
POST /api/ai/chat
Content-Type: application/json

{
  "message": "用户消息",
  "context": "对话上下文",
  "mode": "chat|voice|image",
  "userId": "user-123"
}
```

**响应 Response:**

```json
{
  "success": true,
  "data": {
    "message": "AI回复",
    "timestamp": "2024-01-01T00:00:00Z",
    "metadata": {
      "model": "gpt-4",
      "tokens": 150
    }
  }
}
```

#### 工具调用 Tool Execution

```http
POST /api/tools/{toolId}/execute
Content-Type: application/json

{
  "input": "工具输入参数",
  "options": {
    "timeout": 30000
  }
}
```

**响应 Response:**

```json
{
  "success": true,
  "data": {
    "result": "工具执行结果",
    "executionTime": 1234
  }
}
```

#### 知识检索 Knowledge Search

```http
POST /api/knowledge/search
Content-Type: application/json

{
  "query": "搜索查询",
  "limit": 10,
  "threshold": 0.7,
  "filters": {
    "category": "growth"
  }
}
```

**响应 Response:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "doc-1",
        "content": "文档内容",
        "score": 0.95,
        "metadata": {}
      }
    ],
    "total": 10
  }
}
```

#### 成长记录 Growth Records

```http
POST /api/growth-records
Content-Type: application/json

{
  "childId": "child-123",
  "type": "milestone",
  "description": "学会了走路",
  "date": "2024-01-01",
  "media": ["image-1.jpg", "video-1.mp4"]
}
```

**响应 Response:**

```json
{
  "success": true,
  "data": {
    "id": "record-123",
    "childId": "child-123",
    "type": "milestone",
    "description": "学会了走路",
    "date": "2024-01-01",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### WebSocket事件 WebSocket Events

#### 连接建立 Connection

```javascript
const socket = io('ws://localhost:1229');

// 监听AI回复 Listen to AI response
socket.on('ai-response', (data) => {
  console.log('AI回复:', data.message);
});

// 发送用户消息 Send user message
socket.emit('user-message', {
  message: '用户输入',
  timestamp: Date.now(),
  userId: 'user-123'
});

// 监听错误 Listen to errors
socket.on('error', (error) => {
  console.error('WebSocket错误:', error);
});

// 断开连接 Disconnect
socket.disconnect();
```

#### 事件类型 Event Types

| 事件名称 | 方向 | 描述 |
|---------|------|------|
| `ai-response` | Server → Client | AI回复消息 |
| `user-message` | Client → Server | 用户发送消息 |
| `tool-execution` | Server → Client | 工具执行状态 |
| `error` | Server → Client | 错误消息 |
| `connect` | Server → Client | 连接成功 |
| `disconnect` | Server → Client | 连接断开 |

---

## ⚙️ 配置说明

### 环境变量配置 Environment Variables

主要配置项说明：

```bash
# 系统基础配置 System Configuration
NODE_ENV=development
PORT=1229

# AI服务配置 AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 数据库配置 Database Configuration
DATABASE_URL=postgresql://user:pass@localhost:5432/yyc3_ai
REDIS_URL=redis://localhost:6379

# 向量数据库 Vector Database
VECTOR_DB_URL=http://localhost:6333
VECTOR_DIMENSION=1536

# 知识图谱 Knowledge Graph
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# JWT配置 JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# 日志配置 Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

完整配置参考 [`.env.example`](.env.example) 文件。

### 服务配置 Service Configuration

各服务的详细配置：

- **API网关 API Gateway**: 负载均衡、限流、认证
- **数据库 Database**: PostgreSQL连接池、Redis集群
- **监控 Monitoring**: Prometheus指标、Grafana仪表板
- **日志 Logging**: 结构化日志、集中收集

---

## 📊 监控与运维

### 关键指标 Key Metrics

- **系统性能 System Performance**: CPU、内存、磁盘、网络
- **应用指标 Application Metrics**: 请求量、响应时间、错误率
- **业务指标 Business Metrics**: AI调用次数、工具使用率
- **数据库 Database**: 连接数、查询性能、缓存命中率

### 告警规则 Alert Rules

系统预设了以下告警规则：

- 服务不可用 Service Unavailable
- 响应时间过长 High Response Time
- 错误率过高 High Error Rate
- 资源使用率过高 High Resource Usage
- 数据库连接异常 Database Connection Error

### 日志管理 Log Management

日志级别和输出配置：

```typescript
// 日志配置示例 Log configuration example
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式 Contribution Methods

1. **报告问题 Report Issues** - 提交Issue报告bug或提出建议
2. **功能开发 Feature Development** - Fork项目并提交Pull Request
3. **文档改进 Documentation Improvement** - 完善文档和示例
4. **测试覆盖 Test Coverage** - 增加单元测试和集成测试

### 开发流程 Development Workflow

1. Fork项目到个人仓库 Fork the repository
2. 创建功能分支 Create feature branch: `git checkout -b feature/amazing-feature`
3. 提交更改 Commit changes: `git commit -m 'Add amazing feature'`
4. 推送分支 Push branch: `git push origin feature/amazing-feature`
5. 提交Pull Request Submit Pull Request

### 代码规范 Code Standards

- 使用TypeScript进行类型安全开发 Use TypeScript for type-safe development
- 遵循ESLint和Prettier配置 Follow ESLint and Prettier configuration
- 编写单元测试覆盖新功能 Write unit tests for new features
- 添加适当的注释和文档 Add appropriate comments and documentation

---

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源。

```
MIT License

Copyright (c) 2024 YYC³ Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 联系我们 Contact Us

- **项目主页 Project Homepage**: <https://github.com/YY-Nexus/yyc3-xy-01>
- **问题反馈 Issue Tracker**: <https://github.com/YY-Nexus/yyc3-xy-01/issues>
- **邮箱 Email**: <admin@0379.email>
- **官网 Website**: <https://yyc3.ai>

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个Star！**

**If this project helps you, please give us a Star!**

Made with ❤️ by YYC³ Team

</div>
