import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from '@/config/database';
import { log, Logger } from '@/config/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimitMiddleware } from '@/middleware/rateLimiter';
import { authMiddleware } from '@/middleware/auth';
import apiRoutes from '@/routes';
import { createServer } from 'http';

// 加载环境变量
dotenv.config();

const app = express();
const logger = Logger.getInstance();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:1229',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// 基础中间件
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      },
    },
  }));
}

// 速率限制
app.use(rateLimitMiddleware);

// 健康检查端点
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await (await import('@/config/database')).healthCheck();

    const health = {
      status: 'healthy' as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: {
          status: dbHealth.postgres ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
        },
        redis: {
          status: dbHealth.redis ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
        },
      },
      metrics: {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpuUsage: process.cpuUsage().user / 1000000, // seconds
      },
    };

    const isHealthy = Object.values(health.services).every(
      service => service.status === 'healthy'
    );

    res.status(isHealthy ? 200 : 503).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// API信息端点
app.get('/api', (req, res) => {
  res.json({
    name: 'YYC³ AI小语 API',
    version: '1.0.0',
    description: 'AI驱动的儿童成长守护平台后端服务',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      children: '/api/children',
      growth: '/api/growth',
      ai: '/api/ai',
      media: '/api/media',
      notifications: '/api/notifications',
      analytics: '/api/analytics',
    },
    documentation: '/api/docs',
    health: '/health',
  });
});

// API路由
app.use('/api', apiRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// 错误处理中间件
app.use(errorHandler);

// 优雅关闭处理
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await closeDatabase();
    logger.info('Database connections closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// 监听关闭信号
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  gracefulShutdown('unhandledRejection');
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库连接
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // 创建HTTP服务器
    const server = createServer(app);

    // 启动服务器
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
      logger.info(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Documentation: http://${HOST}:${PORT}/api`);
      logger.info(`💚 Health Check: http://${HOST}:${PORT}/health`);
    });

    // 设置服务器超时
    server.timeout = 30000; // 30 seconds
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // 66 seconds

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// 仅在直接运行此文件时启动服务器
if (require.main === module) {
  startServer();
}

export default app;