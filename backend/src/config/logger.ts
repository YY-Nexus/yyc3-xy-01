import winston from 'winston';
import path from 'path';
import { config } from './config';

export type LogMetadata = Record<string, unknown> | Error | unknown;

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

// 日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// 控制台输出格式
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    if (stack) {
      msg += `\n${stack}`;
    }

    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return msg;
  })
);

// 从统一配置获取日志配置
const loggerConfig = config.getLoggerConfig();
const serviceName = config.get('APP_NAME');

// 创建传输器
const transports: winston.transport[] = [
  // 控制台输出
  new winston.transports.Console({
    level: loggerConfig.level,
    format: consoleFormat,
    handleExceptions: true,
    handleRejections: true
  }),
];

// 生产环境添加文件输出
if (config.get('NODE_ENV') === 'production') {
  // 确保日志目录存在
  const logFile = loggerConfig.file || './logs/combined.log';
  const logDir = path.dirname(logFile);

  transports.push(
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: LogLevel.ERROR,
      format: logFormat,
      handleExceptions: true,
      handleRejections: true,
      maxsize: loggerConfig.maxSize * 1024 * 1024, // 转换为字节
      maxFiles: loggerConfig.maxFiles,
    }),

    // 综合日志文件
    new winston.transports.File({
      filename: logFile,
      format: logFormat,
      maxsize: loggerConfig.maxSize * 1024 * 1024, // 转换为字节
      maxFiles: loggerConfig.maxFiles,
    })
  );
}

// 创建logger实例
export const logger = winston.createLogger({
  level: loggerConfig.level,
  format: logFormat,
  defaultMeta: { service: serviceName },
  transports,
  // 不退出进程
  exitOnError: false,
});

// 开发环境下的额外配置
if (config.get('NODE_ENV') === 'development') {
  logger.debug('Logger initialized in development mode');
}

// 扩展logger功能
export class Logger {
  private static instance: Logger;
  private baseLogger: winston.Logger;

  private constructor() {
    this.baseLogger = logger;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  // 基础日志方法
  public error(message: string, meta?: LogMetadata): void {
    this.baseLogger.error(message, meta);
  }

  public warn(message: string, meta?: LogMetadata): void {
    this.baseLogger.warn(message, meta);
  }

  public info(message: string, meta?: LogMetadata): void {
    this.baseLogger.info(message, meta);
  }

  public debug(message: string, meta?: LogMetadata): void {
    this.baseLogger.debug(message, meta);
  }

  public verbose(message: string, meta?: LogMetadata): void {
    this.baseLogger.verbose(message, meta);
  }

  public http(message: string, meta?: LogMetadata): void {
    this.baseLogger.http(message, meta);
  }

  public performance(operation: string, duration: number, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...metaObj
    });
  }

  public security(event: string, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.warn(`Security: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...metaObj
    });
  }

  public business(action: string, userId?: string, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.info(`Business: ${action}`, {
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...metaObj
    });
  }

  public api(method: string, url: string, statusCode: number, duration: number, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.http(`API: ${method} ${url}`, {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...metaObj
    });
  }

  public database(operation: string, table: string, duration: number, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.debug(`Database: ${operation} on ${table}`, {
      operation,
      table,
      duration: `${duration}ms`,
      ...metaObj
    });
  }

  public cache(operation: string, key: string, hit?: boolean, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.debug(`Cache: ${operation} ${key}`, {
      operation,
      key,
      hit,
      ...metaObj
    });
  }

  public userActivity(userId: string, activity: string, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.info(`User Activity: ${activity}`, {
      userId,
      activity,
      timestamp: new Date().toISOString(),
      ...metaObj
    });
  }

  public system(event: string, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.info(`System: ${event}`, {
      event,
      timestamp: new Date().toISOString(),
      ...metaObj
    });
  }

  public errorDetail(error: Error, context?: string, meta?: LogMetadata): void {
    const metaObj = meta && typeof meta === 'object' && !(meta instanceof Error) ? meta as Record<string, unknown> : {};
    this.baseLogger.error(`Error Detail: ${context || 'Unknown context'}`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
      ...metaObj
    });
  }

  // 获取原始logger实例
  public getRawLogger(): winston.Logger {
    return this.baseLogger;
  }
}

// 导出单例实例
export const log = Logger.getInstance();

// 默认导出logger
export default logger;