/**
 * @file test-env.ts
 * @description 测试环境变量配置，为测试环境提供必要的环境变量
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 设置测试环境变量
// @ts-ignore - TypeScript在测试环境中允许修改NODE_ENV
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32-chars'
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_NAME = 'yyc3_test'
process.env.DB_USER = 'test_user'
process.env.DB_PASSWORD = 'test_password'
process.env.API_VERSION = 'v1'
process.env.API_PREFIX = '/api'
process.env.APP_NAME = 'YYC³ AI 小雨'
process.env.APP_VERSION = '1.0.0'

export {}