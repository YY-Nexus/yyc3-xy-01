/**
 * @file PROJECT-EXECUTION-MANAGER.tsx
 * @description YYC³ AI小语智能成长守护系统项目执行管理器组件，提供项目进度跟踪和管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Target,
  BarChart3,
  Rocket
} from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dueDate: Date
  phase: string
  category: string
  progress: number
  dependencies?: string[]
  tags: string[]
  estimatedHours: number
  actualHours: number
  comments: Comment[]
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: Date
  type: 'update' | 'issue' | 'solution'
}

interface Phase {
  id: string
  name: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  startDate: Date
  endDate: Date
  progress: number
  tasks: Task[]
  kpis: {
    [key: string]: { current: number; target: number }
  }
}

interface ProjectMetrics {
  overallProgress: number
  tasksCompleted: number
  totalTasks: number
  hoursSpent: number
  budgetUsed: number
  teamVelocity: number
  qualityScore: number
  riskLevel: 'low' | 'medium' | 'high'
}

export default function ProjectExecutionManager() {
  const [phases] = useState<Phase[]>([
    {
      id: 'phase1',
      name: 'Phase 1: 基础能力补齐',
      description: '建立后端架构、完善测试体系、优化前端架构',
      status: 'not_started',
      startDate: new Date('2025-12-15'),
      endDate: new Date('2026-02-15'),
      progress: 0,
      tasks: [
        {
          id: 'backend-setup',
          title: '后端架构设计与搭建',
          description: '选择Node.js + Express + TypeScript技术栈，设计RESTful API架构，搭建数据库',
          status: 'pending',
          priority: 'critical',
          assignee: 'Backend Team',
          dueDate: new Date('2025-12-29'),
          phase: 'phase1',
          category: 'Backend Development',
          progress: 0,
          dependencies: [],
          tags: ['architecture', 'api', 'database'],
          estimatedHours: 80,
          actualHours: 0,
          comments: []
        },
        {
          id: 'database-design',
          title: '数据库设计实现',
          description: '设计用户、儿童、成长记录、AI交互等核心数据模型',
          status: 'pending',
          priority: 'high',
          assignee: 'Database Team',
          dueDate: new Date('2026-01-05'),
          phase: 'phase1',
          category: 'Database',
          progress: 0,
          dependencies: ['backend-setup'],
          tags: ['database', 'schema', 'modeling'],
          estimatedHours: 60,
          actualHours: 0,
          comments: []
        },
        {
          id: 'api-development',
          title: '基础API开发',
          description: '开发用户认证、AI对话、成长记录等核心API接口',
          status: 'pending',
          priority: 'high',
          assignee: 'Backend Team',
          dueDate: new Date('2026-01-12'),
          phase: 'phase1',
          category: 'Backend Development',
          progress: 0,
          dependencies: ['database-design'],
          tags: ['api', 'rest', 'integration'],
          estimatedHours: 120,
          actualHours: 0,
          comments: []
        },
        {
          id: 'frontend-backend-integration',
          title: '前后端功能联调',
          description: '打通AI对话系统、成长记录系统、用户管理系统',
          status: 'pending',
          priority: 'high',
          assignee: 'Full-stack Team',
          dueDate: new Date('2026-01-19'),
          phase: 'phase1',
          category: 'Integration',
          progress: 0,
          dependencies: ['api-development'],
          tags: ['integration', 'frontend', 'backend'],
          estimatedHours: 100,
          actualHours: 0,
          comments: []
        },
        {
          id: 'testing-framework',
          title: '测试体系建设',
          description: '搭建Jest + Testing Library测试框架，实现85%测试覆盖率',
          status: 'pending',
          priority: 'medium',
          assignee: 'QA Team',
          dueDate: new Date('2026-01-26'),
          phase: 'phase1',
          category: 'Quality Assurance',
          progress: 0,
          dependencies: ['frontend-backend-integration'],
          tags: ['testing', 'quality', 'automation'],
          estimatedHours: 80,
          actualHours: 0,
          comments: []
        },
        {
          id: 'devops-deployment',
          title: 'DevOps与部署优化',
          description: '容器化部署、监控体系建设、自动化部署流程',
          status: 'pending',
          priority: 'medium',
          assignee: 'DevOps Team',
          dueDate: new Date('2026-02-02'),
          phase: 'phase1',
          category: 'DevOps',
          progress: 0,
          dependencies: ['testing-framework'],
          tags: ['devops', 'deployment', 'monitoring'],
          estimatedHours: 60,
          actualHours: 0,
          comments: []
        }
      ],
      kpis: {
        backendAvailability: { current: 0, target: 95 },
        apiResponseTime: { current: 0, target: 200 },
        testCoverage: { current: 25, target: 85 },
        deploymentAutomation: { current: 0, target: 90 }
      }
    },
    {
      id: 'phase2',
      name: 'Phase 2: AI能力深化',
      description: '本地化AI引擎建设、知识图谱构建、个性化推荐系统',
      status: 'not_started',
      startDate: new Date('2026-02-16'),
      endDate: new Date('2026-05-16'),
      progress: 0,
      tasks: [
        {
          id: 'local-ai-engine',
          title: '本地化AI引擎建设',
          description: '集成Llama 2-7B模型，优化语音识别与合成，实现智能对话引擎',
          status: 'pending',
          priority: 'high',
          assignee: 'AI Team',
          dueDate: new Date('2026-03-16'),
          phase: 'phase2',
          category: 'AI Development',
          progress: 0,
          dependencies: [],
          tags: ['ai', 'llm', 'local'],
          estimatedHours: 200,
          actualHours: 0,
          comments: []
        },
        {
          id: 'knowledge-graph',
          title: '知识图谱与推荐系统',
          description: '构建儿童发展知识图谱，实现智能推荐引擎',
          status: 'pending',
          priority: 'high',
          assignee: 'Data Science Team',
          dueDate: new Date('2026-04-16'),
          phase: 'phase2',
          category: 'AI & Data',
          progress: 0,
          dependencies: ['local-ai-engine'],
          tags: ['knowledge-graph', 'recommendation', 'data'],
          estimatedHours: 180,
          actualHours: 0,
          comments: []
        },
        {
          id: 'microservices-upgrade',
          title: '微服务架构升级',
          description: '服务拆分重构，服务间通信优化，分布式系统建设',
          status: 'pending',
          priority: 'medium',
          assignee: 'Architecture Team',
          dueDate: new Date('2026-05-16'),
          phase: 'phase2',
          category: 'Architecture',
          progress: 0,
          dependencies: ['knowledge-graph'],
          tags: ['microservices', 'architecture', 'distributed'],
          estimatedHours: 150,
          actualHours: 0,
          comments: []
        }
      ],
      kpis: {
        aiLocalization: { current: 0, target: 70 },
        knowledgeGraphCoverage: { current: 0, target: 80 },
        recommendationAccuracy: { current: 0, target: 85 },
        microservicesAvailability: { current: 0, target: 99 }
      }
    },
    {
      id: 'phase3',
      name: 'Phase 3: 产品化升级',
      description: '商业化功能开发、移动端应用、开放平台建设',
      status: 'not_started',
      startDate: new Date('2026-05-17'),
      endDate: new Date('2026-11-17'),
      progress: 0,
      tasks: [
        {
          id: 'monetization-features',
          title: '商业化功能开发',
          description: '会员订阅系统、增值服务开发、付费机制建立',
          status: 'pending',
          priority: 'high',
          assignee: 'Product Team',
          dueDate: new Date('2026-07-17'),
          phase: 'phase3',
          category: 'Business Development',
          progress: 0,
          dependencies: [],
          tags: ['monetization', 'subscription', 'business'],
          estimatedHours: 160,
          actualHours: 0,
          comments: []
        },
        {
          id: 'mobile-apps',
          title: '移动端应用开发',
          description: 'React Native跨平台开发，移动端特色功能实现',
          status: 'pending',
          priority: 'high',
          assignee: 'Mobile Team',
          dueDate: new Date('2026-09-17'),
          phase: 'phase3',
          category: 'Mobile Development',
          progress: 0,
          dependencies: ['monetization-features'],
          tags: ['mobile', 'react-native', 'cross-platform'],
          estimatedHours: 240,
          actualHours: 0,
          comments: []
        },
        {
          id: 'open-platform',
          title: '开放平台与生态建设',
          description: 'API开放平台、开发者社区、第三方应用生态',
          status: 'pending',
          priority: 'medium',
          assignee: 'Platform Team',
          dueDate: new Date('2026-11-17'),
          phase: 'phase3',
          category: 'Platform Development',
          progress: 0,
          dependencies: ['mobile-apps'],
          tags: ['open-platform', 'api', 'ecosystem'],
          estimatedHours: 200,
          actualHours: 0,
          comments: []
        }
      ],
      kpis: {
        monthlyRevenue: { current: 0, target: 50000 },
        mobileUserPercentage: { current: 0, target: 60 },
        developerApps: { current: 0, target: 20 },
        marketShare: { current: 0, target: 2 }
      }
    }
  ])

  const [selectedPhase, setSelectedPhase] = useState<string>('phase1')
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'metrics'>('kanban')

  const calculateProjectMetrics = (): ProjectMetrics => {
    const allTasks = phases.flatMap(phase => phase.tasks)
    const completedTasks = allTasks.filter(task => task.status === 'completed')
    const totalHours = allTasks.reduce((sum, task) => sum + task.actualHours, 0)

    return {
      overallProgress: Math.round((completedTasks.length / allTasks.length) * 100),
      tasksCompleted: completedTasks.length,
      totalTasks: allTasks.length,
      hoursSpent: totalHours,
      budgetUsed: Math.round((totalHours / 5000) * 100000), // 假设总预算100K
      teamVelocity: Math.round(completedTasks.length / 4), // 4周 velocity
      qualityScore: 8.5, // 模拟质量分数
      riskLevel: 'medium' as const
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-600" />
      case 'blocked': return <AlertTriangle className="w-5 h-5 text-red-600" />
      default: return <Circle className="w-5 h-5 text-gray-400" />
    }
  }

  const metrics = calculateProjectMetrics()

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const getFilteredTasks = () => {
    const currentPhase = phases.find(p => p.id === selectedPhase)
    if (!currentPhase) return []

    if (filterStatus === 'all') return currentPhase.tasks
    return currentPhase.tasks.filter(task => task.status === filterStatus)
  }

  const renderMetricsView = () => (
    <div className="space-y-6">
      {/* 整体项目指标 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          项目整体指标
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{metrics.overallProgress}%</div>
            <div className="text-sm text-gray-600">总体进度</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{metrics.tasksCompleted}/{metrics.totalTasks}</div>
            <div className="text-sm text-gray-600">任务完成</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{metrics.hoursSpent}h</div>
            <div className="text-sm text-gray-600">工时消耗</div>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">${(metrics.budgetUsed/1000).toFixed(1)}K</div>
            <div className="text-sm text-gray-600">预算使用</div>
          </div>
        </div>
      </div>

      {/* Phase KPIs */}
      {phases.map((phase) => (
        <div key={phase.id} className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            {phase.name} - KPIs
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(phase.kpis).map(([key, kpi]) => (
              <div key={key} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {kpi.current}/{kpi.target}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderKanbanView = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {['pending', 'in_progress', 'completed', 'blocked'].map(status => (
        <div key={status} className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-4 capitalize flex items-center gap-2">
            {status === 'pending' && <Circle className="w-5 h-5 text-gray-500" />}
            {status === 'in_progress' && <Clock className="w-5 h-5 text-blue-600" />}
            {status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            {status === 'blocked' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            {status === 'pending' ? '待开始' : status === 'in_progress' ? '进行中' : status === 'completed' ? '已完成' : '阻塞'}
            <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
              {getFilteredTasks().filter(task => task.status === status).length}
            </span>
          </h3>
          <div className="space-y-3">
            {getFilteredTasks()
              .filter(task => task.status === status)
              .map(task => (
                <motion.div
                  key={task.id}
                  className="bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => toggleTaskExpansion(task.id)}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{task.title}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        {task.assignee && (
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedTasks.has(task.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">进度:</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">预计工时:</span>
                          <span className="font-medium">{task.estimatedHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">实际工时:</span>
                          <span className="font-medium">{task.actualHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">截止日期:</span>
                          <span className="font-medium">{task.dueDate.toLocaleDateString()}</span>
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map(tag => (
                              <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">负责人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">进度</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">截止日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工时</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {getFilteredTasks().map((task, index) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleTaskExpansion(task.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusIcon(task.status)}
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{task.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {task.assignee || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{task.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {task.dueDate.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {task.actualHours}/{task.estimatedHours}h
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Rocket className="w-8 h-8 text-purple-600" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                YYC³ AI小语项目执行管理中心
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                项目整体进度: <span className="font-bold text-purple-600">{metrics.overallProgress}%</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                metrics.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                metrics.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                风险等级: {metrics.riskLevel === 'high' ? '高' : metrics.riskLevel === 'medium' ? '中' : '低'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Phase 选择器 */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">选择执行阶段</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phases.map((phase) => (
              <motion.div
                key={phase.id}
                className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
                  selectedPhase === phase.id
                    ? 'ring-2 ring-purple-600 scale-105'
                    : 'hover:shadow-xl hover:scale-102'
                }`}
                onClick={() => setSelectedPhase(phase.id)}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">{phase.name}</h3>
                  {phase.status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                  {phase.status === 'in_progress' && <Clock className="w-6 h-6 text-blue-600" />}
                  {phase.status === 'not_started' && <Circle className="w-6 h-6 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-600 mb-4">{phase.description}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">进度:</span>
                    <span className="font-medium">{phase.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-2">
                    <span>{phase.startDate.toLocaleDateString()}</span>
                    <span>{phase.endDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 视图切换和筛选 */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">视图:</span>
            <div className="flex bg-white rounded-lg shadow-sm">
              {['kanban', 'list', 'metrics'].map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view as 'kanban' | 'list' | 'metrics')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                    activeView === view
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view === 'kanban' ? '看板' : view === 'list' ? '列表' : '指标'}
                </button>
              ))}
            </div>
          </div>

          {activeView !== 'metrics' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">筛选:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="all">全部任务</option>
                <option value="pending">待开始</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="blocked">阻塞</option>
              </select>
            </div>
          )}
        </div>

        {/* 主要内容区域 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView + selectedPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'metrics' && renderMetricsView()}
            {activeView === 'kanban' && renderKanbanView()}
            {activeView === 'list' && renderListView()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}