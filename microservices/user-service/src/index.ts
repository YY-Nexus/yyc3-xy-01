/**
 * @file 用户服务主入口
 * @description YYC³用户微服务 - 负责用户注册、登录、认证、授权和用户档案管理
 * @module user-service
 * @author YYC³ Team
 * @version 1.0.0
 * @created 2025-12-14
 */

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { healthRoutes } from './routes/health'
import { metricsMiddleware } from './middleware/metrics'
import { consulServiceRegistry } from './services/consul'
import { createLogger } from './utils/logger'

const app = new Hono()
const log = createLogger('user-service')

// 基础中间件
app.use('*', cors({
  origin: ['http://localhost:1229', 'http://localhost:3000', 'https://yyc3.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', metricsMiddleware)

// 健康检查端点
app.route('/health', healthRoutes)

// API路由
app.route('/api/v1/auth', authRoutes)
app.route('/api/v1/users', userRoutes)

// 服务启动
const PORT = Number(process.env.PORT) || 8001
const HOST = process.env.HOST || '0.0.0.0'
const SERVICE_NAME = 'user-service'
const SERVICE_ID = `${SERVICE_NAME}-${Date.now()}`

async function startServer() {
  try {
    // 注册到Consul
    await consulServiceRegistry.register({
      id: SERVICE_ID,
      name: SERVICE_NAME,
      address: HOST,
      port: PORT,
      tags: ['v1', 'auth', 'user', 'yyc3'],
      check: {
        http: `http://${HOST}:${PORT}/health`,
        interval: '10s',
        timeout: '3s'
      }
    })

    log.info(`Service registered with Consul: ${SERVICE_ID}`)

    // 启动HTTP服务器
    const server = serve({
      fetch: app.fetch,
      port: PORT,
      hostname: HOST,
    }, (info) => {
      log.info(`🚀 User service started on ${info.hostname}:${info.port}`)
      log.info(`📊 Metrics available at http://${info.hostname}:${info.port}/metrics`)
    })

    // 优雅关闭处理
    const gracefulShutdown = async (signal: string) => {
      log.info(`Received ${signal}, starting graceful shutdown...`)

      // 从Consul注销服务
      try {
        await consulServiceRegistry.deregister(SERVICE_ID)
        log.info('Service deregistered from Consul')
      } catch (error) {
        log.error('Failed to deregister from Consul:', error)
      }

      // 关闭HTTP服务器
      server.close(async () => {
        log.info('HTTP server closed')
        process.exit(0)
      })

      // 强制退出超时
      setTimeout(() => {
        log.error('Forced shutdown due to timeout')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

  } catch (error) {
    log.error('Failed to start server:', error)
    process.exit(1)
  }
}

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

startServer()