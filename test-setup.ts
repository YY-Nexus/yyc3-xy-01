/**
 * @file test-setup.ts
 * @description 测试环境设置，JSDOM环境配置，为所有测试文件提供JSDOM环境和必要的全局变量
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 设置测试环境
Object.defineProperty(process.env, 'NODE_ENV', {
  value: 'test',
  writable: true,
  configurable: true,
})

// 设置React Testing Library的默认配置
import '@testing-library/jest-dom'

// 导出设置函数供测试文件使用
export const setupTestEnvironment = () => {
  console.log('Test environment setup complete')
}

// 自动执行设置
setupTestEnvironment()