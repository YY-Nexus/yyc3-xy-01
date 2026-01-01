/**
 * @file config.ts
 * @description YYC³ AI小语智能成长守护系统统一配置管理模块，整合前后端所有配置项，提供统一的配置管理接口
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { z } from 'zod';

// 环境类型定义
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

// 基础配置验证模式
const BaseConfigSchema = z.object({
  // 环境配置
  NODE_ENV: z.nativeEnum(Environment).default(Environment.DEVELOPMENT),
  PORT: z.coerce.number().default(3200),
  
  // 应用基础信息
  APP_NAME: z.string().default('YYC³ AI 小雨'),
  APP_VERSION: z.string().default('1.0.0'),
  APP_DESCRIPTION: z.string().default('智能插拔式移动AI系统'),
  
  // 调试配置
  DEBUG: z.coerce.boolean().default(false),
  LOG_LEVEL: z.string().default('info'),
});

// 数据库配置验证模式
const DatabaseConfigSchema = z.object({
  // PostgreSQL配置
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().default('yyc3_ai_xiaoyu'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z.coerce.boolean().default(false),
  DB_MAX_CONNECTIONS: z.coerce.number().default(20),
  DB_IDLE_TIMEOUT: z.coerce.number().default(30000),
  DB_CONNECTION_TIMEOUT: z.coerce.number().default(2000),
  
  // Redis配置
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().default(0),
  REDIS_MAX_RETRIES: z.coerce.number().default(3),
  REDIS_RETRY_DELAY: z.coerce.number().default(1000),
});

// 安全配置验证模式
const SecurityConfigSchema = z.object({
  // JWT配置
  JWT_SECRET: z.string().min(32, 'JWT密钥长度至少32位'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS配置
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),
  CORS_METHODS: z.string().default('GET,POST,PUT,DELETE,OPTIONS'),
  CORS_HEADERS: z.string().default('Content-Type,Authorization'),
  
  // 限流配置
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15分钟
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // 安全头配置
  SECURITY_HEADERS_ENABLED: z.coerce.boolean().default(true),
  HELMET_ENABLED: z.coerce.boolean().default(true),
});

// 日志配置验证模式
const LoggerConfigSchema = z.object({
  // 日志级别
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FILE: z.string().optional(),
  LOG_MAX_SIZE: z.coerce.number().default(5242880), // 5MB
  LOG_MAX_FILES: z.coerce.number().default(5),
  LOG_TO_CONSOLE: z.coerce.boolean().default(true),
  LOG_TO_FILE: z.coerce.boolean().default(true),
  LOG_FORMAT: z.enum(['json', 'simple', 'pretty']).default('json'),
});

// AI服务配置验证模式
const AIConfigSchema = z.object({
  // OpenAI配置
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_MAX_TOKENS: z.coerce.number().default(2048),
  OPENAI_TEMPERATURE: z.coerce.number().default(0.7),
  
  // 其他AI服务配置
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  BAIDU_AI_API_KEY: z.string().optional(),
  BAIDU_AI_SECRET_KEY: z.string().optional(),
  
  // AI功能开关
  AI_ENABLED: z.coerce.boolean().default(true),
  AI_CHAT_ENABLED: z.coerce.boolean().default(true),
  AI_IMAGE_GENERATION_ENABLED: z.coerce.boolean().default(false),
  AI_VOICE_RECOGNITION_ENABLED: z.coerce.boolean().default(false),
  
  // Ollama配置
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_DEFAULT_MODEL: z.string().default('llama3.1:8b'),
  
  // Chroma配置
  CHROMA_URL: z.string().default('http://localhost:8000'),
  CHROMA_COLLECTION_NAME: z.string().default('yyc3_knowledge_base'),
  
  // RAG配置
  RAG_MAX_CONTEXT_LENGTH: z.coerce.number().default(4000),
  RAG_TOP_K: z.coerce.number().default(5),
  RAG_SIMILARITY_THRESHOLD: z.coerce.number().default(0.7),
});

// 文件存储配置验证模式
const StorageConfigSchema = z.object({
  // 本地存储配置
  STORAGE_TYPE: z.enum(['local', 's3', 'aliyun-oss', 'qiniu']).default('local'),
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.coerce.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: z.string().default('jpg,jpeg,png,gif,pdf,doc,docx'),
  
  // 云存储配置
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
  
  // 阿里云OSS配置
  ALIYUN_OSS_ACCESS_KEY_ID: z.string().optional(),
  ALIYUN_OSS_ACCESS_KEY_SECRET: z.string().optional(),
  ALIYUN_OSS_REGION: z.string().optional(),
  ALIYUN_OSS_BUCKET: z.string().optional(),
});

// 邮件服务配置验证模式
const EmailConfigSchema = z.object({
  // SMTP配置
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.coerce.boolean().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // 邮件发送配置
  EMAIL_FROM: z.string().optional(),
  EMAIL_REPLY_TO: z.string().optional(),
  EMAIL_ENABLED: z.coerce.boolean().default(false),
});

// 监控配置验证模式
const MonitoringConfigSchema = z.object({
  // 性能监控
  PERFORMANCE_MONITORING_ENABLED: z.coerce.boolean().default(true),
  SLOW_QUERY_THRESHOLD: z.coerce.number().default(1000), // 1秒
  
  // 健康检查
  HEALTH_CHECK_ENABLED: z.coerce.boolean().default(true),
  HEALTH_CHECK_PATH: z.string().default('/health'),
  
  // 指标收集
  METRICS_ENABLED: z.coerce.boolean().default(false),
  METRICS_PATH: z.string().default('/metrics'),
  
  // 错误追踪
  ERROR_TRACKING_ENABLED: z.coerce.boolean().default(false),
  SENTRY_DSN: z.string().optional(),
});

// 缓存配置验证模式
const CacheConfigSchema = z.object({
  // Redis缓存配置
  CACHE_TTL: z.coerce.number().default(3600), // 1小时
  CACHE_PREFIX: z.string().default('yyc3:'),
  CACHE_ENABLED: z.coerce.boolean().default(true),
  
  // 缓存策略
  CACHE_STRATEGY: z.enum(['memory', 'redis', 'hybrid']).default('redis'),
  MEMORY_CACHE_SIZE: z.coerce.number().default(100), // 最大缓存项数
});

// UI配置验证模式
const UIConfigSchema = z.object({
  // 主题配置
  DEFAULT_THEME: z.enum(['light', 'dark', 'auto']).default('light'),
  PRIMARY_COLOR: z.string().default('#3B82F6'),
  SECONDARY_COLOR: z.string().default('#8B5CF6'),
  
  // 布局配置
  HEADER_HEIGHT: z.string().default('64px'),
  SIDEBAR_WIDTH: z.string().default('256px'),
  CONTENT_PADDING: z.string().default('24px'),
  MAX_CONTENT_WIDTH: z.string().default('1200px'),
  
  // 动画配置
  ANIMATION_ENABLED: z.coerce.boolean().default(true),
  ANIMATION_DURATION: z.string().default('0.3s'),
  ANIMATION_TIMING_FUNCTION: z.string().default('cubic-bezier(0.4, 0, 0.2, 1)'),
});

// 国际化配置验证模式
const I18nConfigSchema = z.object({
  // 语言配置
  DEFAULT_LANGUAGE: z.enum(['zh-CN', 'en-US']).default('zh-CN'),
  SUPPORTED_LANGUAGES: z.string().default('zh-CN,en-US'),
  
  // 本地化配置
  FALLBACK_LANGUAGE: z.string().default('zh-CN'),
  DETECT_LANGUAGE: z.coerce.boolean().default(true),
});

// API配置验证模式
const APIConfigSchema = z.object({
  // API版本配置
  API_VERSION: z.string().default('v1'),
  API_PREFIX: z.string().default('/api'),
  
  // API限制配置
  API_MAX_PAYLOAD_SIZE: z.string().default('10mb'),
  API_TIMEOUT: z.coerce.number().default(30000), // 30秒
  
  // API文档配置
  API_DOCS_ENABLED: z.coerce.boolean().default(true),
  API_DOCS_PATH: z.string().default('/api-docs'),
});

// 完整配置验证模式
const ConfigSchema = BaseConfigSchema
  .and(DatabaseConfigSchema)
  .and(SecurityConfigSchema)
  .and(LoggerConfigSchema)
  .and(AIConfigSchema)
  .and(StorageConfigSchema)
  .and(EmailConfigSchema)
  .and(MonitoringConfigSchema)
  .and(CacheConfigSchema)
  .and(UIConfigSchema)
  .and(I18nConfigSchema)
  .and(APIConfigSchema);

// 配置类型定义
export type ConfigType = z.infer<typeof ConfigSchema>;

// 配置类
export class Config {
  private static instance: Config;
  private config: ConfigType;

  private constructor() {
    // 验证并加载配置
    this.config = this.loadConfig();
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * 加载配置
   */
  private loadConfig(): ConfigType {
    try {
      // 验证环境变量
      const envConfig = ConfigSchema.parse(process.env);
      
      // 根据环境加载特定配置
      const envSpecificConfig = this.loadEnvironmentSpecificConfig(envConfig.NODE_ENV);
      
      // 合并配置
      return { ...envConfig, ...envSpecificConfig };
    } catch (error) {
      console.error('配置加载失败:', error);
      process.exit(1);
    }
  }

  /**
   * 加载环境特定配置
   */
  private loadEnvironmentSpecificConfig(env: Environment): Partial<ConfigType> {
    switch (env) {
      case Environment.DEVELOPMENT:
        return this.getDevelopmentConfig();
      case Environment.STAGING:
        return this.getStagingConfig();
      case Environment.PRODUCTION:
        return this.getProductionConfig();
      case Environment.TEST:
        return this.getTestConfig();
      default:
        return {};
    }
  }

  /**
   * 开发环境配置
   */
  private getDevelopmentConfig(): Partial<ConfigType> {
    return {
      DEBUG: true,
      LOG_LEVEL: 'debug',
      LOG_TO_CONSOLE: true,
      LOG_TO_FILE: false,
      PERFORMANCE_MONITORING_ENABLED: false,
      ERROR_TRACKING_ENABLED: false,
      CORS_ORIGIN: '*',
      SECURITY_HEADERS_ENABLED: false,
      HELMET_ENABLED: false,
    };
  }

  /**
   * 测试环境配置
   */
  private getTestConfig(): Partial<ConfigType> {
    return {
      DEBUG: true,
      LOG_LEVEL: 'error',
      LOG_TO_CONSOLE: false,
      LOG_TO_FILE: false,
      PERFORMANCE_MONITORING_ENABLED: false,
      ERROR_TRACKING_ENABLED: false,
      METRICS_ENABLED: false,
      HEALTH_CHECK_ENABLED: false,
      CACHE_ENABLED: false,
      EMAIL_ENABLED: false,
      JWT_SECRET: 'test-jwt-secret-key-for-testing-only-32-chars',
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'yyc3_test',
      DB_USER: 'test_user',
      DB_PASSWORD: 'test_password',
    };
  }

  /**
   * 预发布环境配置
   */
  private getStagingConfig(): Partial<ConfigType> {
    return {
      DEBUG: false,
      LOG_LEVEL: 'info',
      PERFORMANCE_MONITORING_ENABLED: true,
      ERROR_TRACKING_ENABLED: true,
      METRICS_ENABLED: true,
      SECURITY_HEADERS_ENABLED: true,
      HELMET_ENABLED: true,
    };
  }

  /**
   * 生产环境配置
   */
  private getProductionConfig(): Partial<ConfigType> {
    return {
      DEBUG: false,
      LOG_LEVEL: 'warn',
      PERFORMANCE_MONITORING_ENABLED: true,
      ERROR_TRACKING_ENABLED: true,
      METRICS_ENABLED: true,
      SECURITY_HEADERS_ENABLED: true,
      HELMET_ENABLED: true,
      LOG_TO_CONSOLE: false,
      LOG_TO_FILE: true,
    };
  }

  /**
   * 获取完整配置
   */
  public getAll(): ConfigType {
    return { ...this.config };
  }

  /**
   * 获取配置项
   */
  public get<K extends keyof ConfigType>(key: K): ConfigType[K] {
    return this.config[key];
  }

  /**
   * 检查配置项是否存在
   */
  public has<K extends keyof ConfigType>(key: K): boolean {
    return key in this.config;
  }

  /**
   * 获取数据库配置
   */
  public getDatabaseConfig() {
    return {
      host: this.config.DB_HOST,
      port: this.config.DB_PORT,
      database: this.config.DB_NAME,
      user: this.config.DB_USER,
      password: this.config.DB_PASSWORD,
      ssl: this.config.DB_SSL,
      max: this.config.DB_MAX_CONNECTIONS,
      idleTimeoutMillis: this.config.DB_IDLE_TIMEOUT,
      connectionTimeoutMillis: this.config.DB_CONNECTION_TIMEOUT,
    };
  }

  /**
   * 获取Redis配置
   */
  public getRedisConfig() {
    return {
      host: this.config.REDIS_HOST,
      port: this.config.REDIS_PORT,
      password: this.config.REDIS_PASSWORD,
      database: this.config.REDIS_DB,
      maxRetriesPerRequest: this.config.REDIS_MAX_RETRIES,
      retryDelayOnFailover: this.config.REDIS_RETRY_DELAY,
    };
  }

  /**
   * 获取JWT配置
   */
  public getJWTConfig() {
    return {
      secret: this.config.JWT_SECRET,
      expiresIn: this.config.JWT_EXPIRES_IN,
      refreshExpiresIn: this.config.JWT_REFRESH_EXPIRES_IN,
    };
  }

  /**
   * 获取CORS配置
   */
  public getCORSConfig() {
    return {
      origin: this.config.CORS_ORIGIN,
      credentials: this.config.CORS_CREDENTIALS,
      methods: this.config.CORS_METHODS.split(','),
      allowedHeaders: this.config.CORS_HEADERS.split(','),
    };
  }

  /**
   * 获取日志配置
   */
  public getLoggerConfig() {
    return {
      level: this.config.LOG_LEVEL,
      file: this.config.LOG_FILE,
      maxSize: this.config.LOG_MAX_SIZE,
      maxFiles: this.config.LOG_MAX_FILES,
      toConsole: this.config.LOG_TO_CONSOLE,
      toFile: this.config.LOG_TO_FILE,
      format: this.config.LOG_FORMAT,
    };
  }

  /**
   * 获取AI配置
   */
  public getAIConfig() {
    return {
      openai: {
        apiKey: this.config.OPENAI_API_KEY,
        model: this.config.OPENAI_MODEL,
        maxTokens: this.config.OPENAI_MAX_TOKENS,
        temperature: this.config.OPENAI_TEMPERATURE,
      },
      anthropic: {
        apiKey: this.config.ANTHROPIC_API_KEY,
      },
      google: {
        apiKey: this.config.GOOGLE_AI_API_KEY,
      },
      baidu: {
        apiKey: this.config.BAIDU_AI_API_KEY,
        secretKey: this.config.BAIDU_AI_SECRET_KEY,
      },
      features: {
        enabled: this.config.AI_ENABLED,
        chat: this.config.AI_CHAT_ENABLED,
        imageGeneration: this.config.AI_IMAGE_GENERATION_ENABLED,
        voiceRecognition: this.config.AI_VOICE_RECOGNITION_ENABLED,
      },
    };
  }

  /**
   * 获取存储配置
   */
  public getStorageConfig() {
    return {
      type: this.config.STORAGE_TYPE,
      local: {
        uploadDir: this.config.UPLOAD_DIR,
        maxSize: this.config.MAX_FILE_SIZE,
        allowedTypes: this.config.ALLOWED_FILE_TYPES.split(','),
      },
      s3: {
        accessKeyId: this.config.AWS_ACCESS_KEY_ID,
        secretAccessKey: this.config.AWS_SECRET_ACCESS_KEY,
        region: this.config.AWS_REGION,
        bucket: this.config.AWS_S3_BUCKET,
      },
      aliyun: {
        accessKeyId: this.config.ALIYUN_OSS_ACCESS_KEY_ID,
        accessKeySecret: this.config.ALIYUN_OSS_ACCESS_KEY_SECRET,
        region: this.config.ALIYUN_OSS_REGION,
        bucket: this.config.ALIYUN_OSS_BUCKET,
      },
    };
  }

  /**
   * 获取邮件配置
   */
  public getEmailConfig() {
    return {
      smtp: {
        host: this.config.SMTP_HOST,
        port: this.config.SMTP_PORT,
        secure: this.config.SMTP_SECURE,
        auth: {
          user: this.config.SMTP_USER,
          pass: this.config.SMTP_PASS,
        },
      },
      from: this.config.EMAIL_FROM,
      replyTo: this.config.EMAIL_REPLY_TO,
      enabled: this.config.EMAIL_ENABLED,
    };
  }

  /**
   * 获取监控配置
   */
  public getMonitoringConfig() {
    return {
      performance: {
        enabled: this.config.PERFORMANCE_MONITORING_ENABLED,
        slowQueryThreshold: this.config.SLOW_QUERY_THRESHOLD,
      },
      health: {
        enabled: this.config.HEALTH_CHECK_ENABLED,
        path: this.config.HEALTH_CHECK_PATH,
      },
      metrics: {
        enabled: this.config.METRICS_ENABLED,
        path: this.config.METRICS_PATH,
      },
      errorTracking: {
        enabled: this.config.ERROR_TRACKING_ENABLED,
        dsn: this.config.SENTRY_DSN,
      },
    };
  }

  /**
   * 获取缓存配置
   */
  public getCacheConfig() {
    return {
      ttl: this.config.CACHE_TTL,
      prefix: this.config.CACHE_PREFIX,
      enabled: this.config.CACHE_ENABLED,
      strategy: this.config.CACHE_STRATEGY,
      memory: {
        maxSize: this.config.MEMORY_CACHE_SIZE,
      },
    };
  }

  /**
   * 获取UI配置
   */
  public getUIConfig() {
    return {
      theme: {
        default: this.config.DEFAULT_THEME,
        primaryColor: this.config.PRIMARY_COLOR,
        secondaryColor: this.config.SECONDARY_COLOR,
      },
      layout: {
        headerHeight: this.config.HEADER_HEIGHT,
        sidebarWidth: this.config.SIDEBAR_WIDTH,
        contentPadding: this.config.CONTENT_PADDING,
        maxContentWidth: this.config.MAX_CONTENT_WIDTH,
      },
      animation: {
        enabled: this.config.ANIMATION_ENABLED,
        duration: this.config.ANIMATION_DURATION,
        timingFunction: this.config.ANIMATION_TIMING_FUNCTION,
      },
    };
  }

  /**
   * 获取国际化配置
   */
  public getI18nConfig() {
    return {
      defaultLanguage: this.config.DEFAULT_LANGUAGE,
      supportedLanguages: this.config.SUPPORTED_LANGUAGES.split(','),
      fallbackLanguage: this.config.FALLBACK_LANGUAGE,
      detectLanguage: this.config.DETECT_LANGUAGE,
    };
  }

  /**
   * 获取API配置
   */
  public getAPIConfig() {
    return {
      version: this.config.API_VERSION,
      prefix: this.config.API_PREFIX,
      maxPayloadSize: this.config.API_MAX_PAYLOAD_SIZE,
      timeout: this.config.API_TIMEOUT,
      docs: {
        enabled: this.config.API_DOCS_ENABLED,
        path: this.config.API_DOCS_PATH,
      },
    };
  }

  /**
   * 验证配置
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证必需的配置项
    if (!this.config.JWT_SECRET || this.config.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET必须设置且长度至少32位');
    }

    if (this.config.STORAGE_TYPE === 's3' && !this.config.AWS_ACCESS_KEY_ID) {
      errors.push('S3存储需要设置AWS_ACCESS_KEY_ID');
    }

    if (this.config.STORAGE_TYPE === 'aliyun-oss' && !this.config.ALIYUN_OSS_ACCESS_KEY_ID) {
      errors.push('阿里云OSS需要设置ALIYUN_OSS_ACCESS_KEY_ID');
    }

    if (this.config.EMAIL_ENABLED && !this.config.SMTP_HOST) {
      errors.push('启用邮件功能需要设置SMTP_HOST');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 打印配置摘要
   */
  public printSummary(): void {
    console.log('='.repeat(50));
    console.log(`🚀 ${this.config.APP_NAME} v${this.config.APP_VERSION}`);
    console.log(`📦 环境: ${this.config.NODE_ENV}`);
    console.log(`🌐 端口: ${this.config.PORT}`);
    console.log(`🔍 调试模式: ${this.config.DEBUG ? '开启' : '关闭'}`);
    console.log(`📊 日志级别: ${this.config.LOG_LEVEL}`);
    console.log(`💾 数据库: ${this.config.DB_HOST}:${this.config.DB_PORT}/${this.config.DB_NAME}`);
    console.log(`🗃️ Redis: ${this.config.REDIS_HOST}:${this.config.REDIS_PORT}/${this.config.REDIS_DB}`);
    console.log(`📁 存储类型: ${this.config.STORAGE_TYPE}`);
    console.log(`🤖 AI功能: ${this.config.AI_ENABLED ? '开启' : '关闭'}`);
    console.log(`📧 邮件功能: ${this.config.EMAIL_ENABLED ? '开启' : '关闭'}`);
    console.log(`📈 监控功能: ${this.config.PERFORMANCE_MONITORING_ENABLED ? '开启' : '关闭'}`);
    console.log('='.repeat(50));
  }
}

// 导出配置实例
export const config = Config.getInstance();

// 导出默认配置
export default config;