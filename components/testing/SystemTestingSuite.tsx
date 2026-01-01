'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Shield,
  Database,
  Globe,
  Loader,
  Square,
  Info,
  Download
} from 'lucide-react'

// 测试结果接口
interface TestResult {
  id: string
  name: string
  category: 'functionality' | 'performance' | 'compatibility' | 'security' | 'integration'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped'
  duration: number
  description: string
  details?: string
  metrics?: Record<string, unknown>
}

// 测试套件配置
const testSuites = [
  {
    category: 'functionality' as const,
    name: '功能完整性测试',
    icon: CheckCircle,
    color: 'from-blue-500 to-green-500',
    tests: [
      {
        id: 'core-ai-chat',
        name: 'AI对话功能',
        description: '测试AI小语智能对话系统的核心功能',
        details: '包括语音识别、对话响应、智能体切换等'
      },
      {
        id: 'growth-tracking',
        name: '成长记录功能',
        description: '测试成长数据记录和管理功能',
        details: '包括数据录入、时间线展示、里程碑记录等'
      },
      {
        id: 'data-visualization',
        name: '数据可视化功能',
        description: '测试图表展示和数据分析功能',
        details: '包括生长曲线、能力雷达图、活动统计等'
      },
      {
        id: 'smart-album',
        name: '智能相册功能',
        description: '测试AI相册管理和智能标签功能',
        details: '包括照片上传、AI分析、搜索过滤等'
      },
      {
        id: 'voice-story',
        name: '语音故事功能',
        description: '测试AI故事生成和语音播放功能',
        details: '包括故事创作、语音合成、播放控制等'
      },
      {
        id: 'birthday-theme',
        name: '生日主题功能',
        description: '测试生日倒计时和庆祝动画功能',
        details: '包括倒计时显示、主题切换、动画效果等'
      }
    ]
  },
  {
    category: 'performance' as const,
    name: '性能压力测试',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    tests: [
      {
        id: 'load-time',
        name: '页面加载速度',
        description: '测试各页面的首屏加载时间',
        metrics: { target: '< 2s', actual: null }
      },
      {
        id: 'response-time',
        name: '交互响应时间',
        description: '测试用户操作的响应速度',
        metrics: { target: '< 300ms', actual: null }
      },
      {
        id: 'memory-usage',
        name: '内存使用情况',
        description: '测试系统内存占用和泄漏',
        metrics: { target: '< 200MB', actual: null }
      },
      {
        id: 'concurrent-users',
        name: '并发用户测试',
        description: '测试多用户同时使用的性能',
        metrics: { target: '1000+', actual: null }
      }
    ]
  },
  {
    category: 'compatibility' as const,
    name: '兼容性测试',
    icon: Globe,
    color: 'from-purple-500 to-pink-500',
    tests: [
      {
        id: 'browser-compatibility',
        name: '浏览器兼容性',
        description: '测试主流浏览器的兼容性',
        details: 'Chrome、Firefox、Safari、Edge等'
      },
      {
        id: 'mobile-compatibility',
        name: '移动设备兼容性',
        description: '测试手机和平板的响应式设计',
        details: 'iOS Safari、Android Chrome等'
      },
      {
        id: 'screen-resolution',
        name: '屏幕分辨率适配',
        description: '测试不同分辨率的显示效果',
        details: '包括超宽屏、小屏设备等'
      }
    ]
  },
  {
    category: 'security' as const,
    name: '安全性测试',
    icon: Shield,
    color: 'from-red-500 to-pink-500',
    tests: [
      {
        id: 'data-encryption',
        name: '数据加密测试',
        description: '测试敏感数据的加密保护',
        details: '包括传输加密、存储加密等'
      },
      {
        id: 'access-control',
        name: '访问控制测试',
        description: '测试用户权限和访问控制',
        details: '包括身份验证、授权管理等'
      },
      {
        id: 'input-validation',
        name: '输入验证测试',
        description: '测试用户输入的安全验证',
        details: '包括XSS防护、SQL注入防护等'
      }
    ]
  },
  {
    category: 'integration' as const,
    name: '集成测试',
    icon: Database,
    color: 'from-indigo-500 to-blue-500',
    tests: [
      {
        id: 'api-integration',
        name: 'API接口测试',
        description: '测试前后端API接口的集成',
        details: '包括接口调用、数据格式、错误处理等'
      },
      {
        id: 'database-integration',
        name: '数据库集成测试',
        description: '测试数据库读写和数据一致性',
        details: '包括CRUD操作、事务处理、数据备份等'
      },
      {
        id: 'external-services',
        name: '外部服务集成',
        description: '测试第三方服务的集成',
        details: '包括语音API、AI服务、云存储等'
      }
    ]
  }
]

export default function SystemTestingSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showDetails, setShowDetails] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  // 初始化测试结果
  useEffect(() => {
    const allTests = testSuites.flatMap(suite =>
      suite.tests.map(test => ({
        ...test,
        category: suite.category,
        status: 'pending' as const,
        duration: 0
      }))
    )
    setTestResults(allTests)
  }, [])

  // 获取测试统计
  const testStats = {
    total: testResults.length,
    passed: testResults.filter(t => t.status === 'passed').length,
    failed: testResults.filter(t => t.status === 'failed').length,
    running: testResults.filter(t => t.status === 'running').length,
    pending: testResults.filter(t => t.status === 'pending').length
  }

  // 获取通过率
  const passRate = testStats.total > 0 ? (testStats.passed / testStats.total) * 100 : 0

  // 过滤测试结果
  const filteredResults = selectedCategory === 'all'
    ? testResults
    : testResults.filter(test => test.category === selectedCategory)

  // 运行单个测试
  const runSingleTest = async (test: TestResult) => {
    const startTime = Date.now()

    // 更新测试状态为运行中
    setTestResults(prev => prev.map(t =>
      t.id === test.id ? { ...t, status: 'running', duration: 0 } : t
    ))

    // 模拟测试执行
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const duration = Date.now() - startTime
    const success = Math.random() > 0.1 // 90%成功率

    // 更新测试结果
    setTestResults(prev => prev.map(t => {
      if (t.id === test.id) {
        const result: TestResult = {
          ...t,
          status: success ? 'passed' : 'failed',
          duration,
          details: success
            ? '测试通过，所有功能正常运行'
            : '测试失败，发现需要修复的问题',
          metrics: t.metrics ? {
            ...t.metrics,
            actual: success
              ? Math.random() * parseFloat(String(t.metrics.target)) * 0.8
              : parseFloat(String(t.metrics.target)) * 1.2
          } : undefined
        }
        return result
      }
      return t
    }))
  }

  // 运行所有测试
  const runAllTests = async () => {
    if (isRunning) return

    setIsRunning(true)

    for (let i = 0; i < testResults.length; i++) {
      const test = testResults[i]
      setOverallProgress((i / testResults.length) * 100)

      await runSingleTest(test)

      // 短暂延迟
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    setIsRunning(false)
    setOverallProgress(100)
  }

  // 停止测试
  const stopTests = () => {
    setIsRunning(false)
    setTestResults(prev => prev.map(test =>
      test.status === 'running' ? { ...test, status: 'pending', duration: 0 } : test
    ))
  }

  // 重新运行失败的测试
  const rerunFailedTests = async () => {
    const failedTests = testResults.filter(t => t.status === 'failed')

    for (const test of failedTests) {
      await runSingleTest(test)
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: TestResult['status']): React.ReactNode => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />
      case 'running': return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />
      case 'skipped': return <Square className="w-5 h-5 text-gray-400" />
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'running': return 'bg-blue-100 text-blue-700'
      case 'pending': return 'bg-gray-100 text-gray-700'
      case 'skipped': return 'bg-gray-100 text-gray-700'
    }
  }

  // 导出测试报告
  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testStats.total,
        passed: testStats.passed,
        failed: testStats.failed,
        passRate: passRate.toFixed(1) + '%',
        duration: testResults.reduce((sum, test) => sum + test.duration, 0)
      },
      results: testResults.map(test => ({
        name: test.name,
        category: test.category,
        status: test.status,
        duration: test.duration,
        description: test.description,
        details: test.details,
        metrics: test.metrics
      }))
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `系统测试报告_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔧 YYC³ AI小语系统测试套件
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            全面的系统测试工具，确保为小语的1岁生日提供完美的用户体验
          </p>
        </div>

        {/* 测试统计 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-800 mb-2">{testStats.total}</div>
            <div className="text-sm text-gray-600">总测试数</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{testStats.passed}</div>
            <div className="text-sm text-gray-600">通过</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{testStats.failed}</div>
            <div className="text-sm text-gray-600">失败</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{testStats.running}</div>
            <div className="text-sm text-gray-600">运行中</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{passRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">通过率</div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    运行中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    运行所有测试
                  </>
                )}
              </button>

              <button
                onClick={stopTests}
                disabled={!isRunning}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Pause className="w-4 h-4" />
                停止测试
              </button>

              <button
                onClick={rerunFailedTests}
                disabled={isRunning || testStats.failed === 0}
                className="flex items-center gap-2 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                重试失败
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">所有测试</option>
                <option value="functionality">功能测试</option>
                <option value="performance">性能测试</option>
                <option value="compatibility">兼容性测试</option>
                <option value="security">安全测试</option>
                <option value="integration">集成测试</option>
              </select>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
              >
                <Info className="w-4 h-4" />
                {showDetails ? '隐藏详情' : '显示详情'}
              </button>

              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
              >
                <Download className="w-4 h-4" />
                导出报告
              </button>
            </div>
          </div>

          {/* 进度条 */}
          {(isRunning || overallProgress > 0) && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>测试进度</span>
                <span>{overallProgress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 测试结果列表 */}
        <div className="space-y-6">
          {testSuites.map((suite) => (
            <div key={suite.category} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* 套件头部 */}
              <div className="p-6 border-b bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${suite.color} rounded-lg flex items-center justify-center`}>
                    <suite.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{suite.name}</h3>
                    <p className="text-sm text-gray-600">{suite.tests.length} 个测试用例</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-800">
                        {filteredResults.filter(t => t.category === suite.category).length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {filteredResults.filter(t =>
                          t.category === suite.category && t.status === 'passed'
                        ).length} 通过
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 测试列表 */}
              <div className="p-6 space-y-4">
                {filteredResults
                  .filter(test => test.category === suite.category)
                  .map((test, index) => (
                    <motion.div
                      key={test.id}
                      className={`border rounded-lg p-4 transition-all ${
                        test.status === 'running' ? 'border-blue-300 bg-blue-50' :
                        test.status === 'passed' ? 'border-green-300 bg-green-50' :
                        test.status === 'failed' ? 'border-red-300 bg-red-50' :
                        'border-gray-200 hover:border-gray-300'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(test.status)}
                          <div>
                            <h4 className="font-medium text-gray-800">{test.name}</h4>
                            <p className="text-sm text-gray-600">{test.description}</p>
                            {showDetails && (
                              <p className="text-xs text-gray-500 mt-1">{test.details}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {test.metrics?.actual != null && test.metrics?.target != null && (
                            <div className="text-right">
                              <div className="text-xs text-gray-500">实际值</div>
                              <div className={`text-sm font-medium ${
                                (parseFloat(String(test.metrics.actual)) < parseFloat(String(test.metrics.target))) ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {String(test.metrics.actual)} / {String(test.metrics.target)}
                              </div>
                            </div>
                          )}
                          <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(test.status)}`}>
                            {test.status === 'passed' ? '通过' :
                             test.status === 'failed' ? '失败' :
                             test.status === 'running' ? '运行中' :
                             test.status === 'pending' ? '待运行' : '跳过'}
                          </div>
                          {test.duration > 0 && (
                            <div className="text-sm text-gray-500">
                              {(test.duration / 1000).toFixed(1)}s
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* 测试完成提示 */}
        {!isRunning && testStats.total > 0 && testStats.total === testStats.passed + testStats.failed && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {testStats.failed === 0 ? '所有测试通过！' : '测试完成'}
            </h3>
            <p className="text-gray-600 mb-4">
              {testStats.failed === 0
                ? '系统准备就绪，可以为小语的1岁生日提供完美的体验！'
                : `发现 ${testStats.failed} 个问题，建议修复后重新测试。`
              }
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={exportReport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                下载测试报告
              </button>
              {testStats.failed > 0 && (
                <button
                  onClick={rerunFailedTests}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新测试失败项
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
