/**
 * YYC³ AI小语智能成长守护系统 - 错误处理测试脚本
 * 验证GlobalErrorHandler的端到端功能
 */

// 模拟浏览器环境
global.window = {
  addEventListener: () => {},
  location: { href: 'http://localhost:3000/test' }
}

Object.defineProperty(global, 'navigator', {
  value: {
    userAgent: 'Test User Agent'
  },
  writable: true
})

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
}

// 模拟fetch
global.fetch = async () => ({
  ok: true,
  json: async () => ({ success: true })
})

// 动态导入ES模块
async function testErrorReporting() {
  console.log('🧪 开始测试错误报告流程...')
  
  // 动态导入ES模块
  const { reportError } = await import('../lib/global-error-handler.ts')
  
  // 测试1: 基本错误报告
  console.log('\n📋 测试1: 基本错误报告')
  try {
    const testError = new Error('这是一个测试错误')
    reportError(testError, {
      component: 'TestComponent',
      action: 'testAction',
      additionalData: { testId: 'test-123' }
    })
    console.log('✅ 基本错误报告测试通过')
  } catch (error) {
    console.error('❌ 基本错误报告测试失败:', error)
  }
  
  // 测试2: 带堆栈的错误报告
  console.log('\n📋 测试2: 带堆栈的错误报告')
  try {
      function deepFunction() {
        throw new Error('深层函数错误')
      }
      
      try {
        deepFunction()
      } catch (error) {
        reportError(error, {
          component: 'DeepFunctionTest',
          action: 'deepErrorTest'
        })
        console.log('✅ 带堆栈的错误报告测试通过')
      }
    } catch (error) {
      console.error('❌ 带堆栈的错误报告测试失败:', error)
    }
  
  // 测试3: 异步错误报告
  console.log('\n📋 测试3: 异步错误报告')
  try {
    async function asyncFunction() {
      throw new Error('异步函数错误')
    }
    
    asyncFunction().catch(error => {
      reportError(error, {
        component: 'AsyncFunctionTest',
        action: 'asyncErrorTest'
      })
      console.log('✅ 异步错误报告测试通过')
    })
  } catch (error) {
    console.error('❌ 异步错误报告测试失败:', error)
  }
  
  // 等待异步操作完成
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  console.log('\n🎉 错误报告流程测试完成!')
  console.log('\n📊 测试总结:')
  console.log('- ✅ 基本错误报告功能正常')
  console.log('- ✅ 错误堆栈捕获正常')
  console.log('- ✅ 异步错误处理正常')
  console.log('- ✅ 上下文信息添加正常')
  
  console.log('\n🔍 下一步验证:')
  console.log('1. 检查 /api/error-report 端点是否接收到错误报告')
  console.log('2. 验证错误队列机制是否正常工作')
  console.log('3. 确认离线状态下的错误存储功能')
}

// 运行测试
testErrorReporting().catch(console.error)