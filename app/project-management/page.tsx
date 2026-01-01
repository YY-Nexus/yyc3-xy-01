'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Target,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  Download,
  Rocket,
  CheckCircle,
  Eye,
  Bell,
  Award,
  Shield
} from 'lucide-react'

import ProjectExecutionManager from '@/components/PROJECT-EXECUTION-MANAGER'

export default function ProjectManagement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'execution' | 'reports' | 'settings'>('dashboard')
  const notifications = 3

  const tabs = [
    {
      id: 'dashboard',
      title: '项目概览',
      description: '查看项目整体状态和关键指标',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'execution',
      title: '执行管理',
      description: '任务跟踪和进度管理',
      icon: Target,
      color: 'from-blue-500 to-green-500'
    },
    {
      id: 'reports',
      title: '报告中心',
      description: '生成和分析项目报告',
      icon: FileText,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'settings',
      title: '项目设置',
      description: '配置项目参数和团队管理',
      icon: Settings,
      color: 'from-indigo-500 to-purple-500'
    }
  ]

  const projectStats = [
    {
      label: '项目整体进度',
      value: '32%',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      label: '任务完成率',
      value: '28/89',
      icon: CheckCircle,
      color: 'from-green-500 to-blue-500',
      change: '+12',
      changeType: 'positive'
    },
    {
      label: '团队效率',
      value: '8.5/10',
      icon: Users,
      color: 'from-yellow-500 to-orange-500',
      change: '+0.3',
      changeType: 'positive'
    },
    {
      label: '质量评分',
      value: '9.1/10',
      icon: Award,
      color: 'from-red-500 to-pink-500',
      change: 'stable',
      changeType: 'neutral'
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'task_completed',
      title: '完成AI语音优化系统',
      description: 'VoiceOptimizationSystem组件开发完成',
      timestamp: '2小时前',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'milestone_reached',
      title: 'Phase 1 启动',
      description: '后端架构设计与搭建阶段正式开始',
      timestamp: '4小时前',
      icon: Rocket,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'report_generated',
      title: '全局审核报告完成',
      description: '项目规划vs实际实现对比分析',
      timestamp: '1天前',
      icon: FileText,
      color: 'text-purple-600'
    }
  ]

  const upcomingMilestones = [
    {
      id: 1,
      title: '后端架构设计完成',
      date: '2025-12-29',
      status: 'upcoming',
      priority: 'high',
      phase: 'Phase 1'
    },
    {
      id: 2,
      title: '前后端功能联调',
      date: '2026-01-19',
      status: 'upcoming',
      priority: 'high',
      phase: 'Phase 1'
    },
    {
      id: 3,
      title: '测试体系建设完成',
      date: '2026-01-26',
      status: 'upcoming',
      priority: 'medium',
      phase: 'Phase 1'
    }
  ]

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* 项目统计卡片 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">项目关键指标</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {projectStats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {stat.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 项目进度概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phase 进度 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">阶段进度</h3>
          <div className="space-y-4">
            {[
              { name: 'Phase 1: 基础能力补齐', progress: 0, status: 'not_started', color: 'from-purple-500 to-pink-500' },
              { name: 'Phase 2: AI能力深化', progress: 0, status: 'not_started', color: 'from-blue-500 to-green-500' },
              { name: 'Phase 3: 产品化升级', progress: 0, status: 'not_started', color: 'from-orange-500 to-red-500' }
            ].map((phase, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{phase.name}</span>
                  <span className="text-sm text-gray-500">{phase.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-gradient-to-r ${phase.color} h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${phase.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 团队动态 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">团队动态</h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <activity.icon className={`w-5 h-5 mt-0.5 ${activity.color}`} />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-800">{activity.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                  <div className="text-xs text-gray-500 mt-2">{activity.timestamp}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 即将到来的里程碑 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">即将到来的里程碑</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingMilestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-800">{milestone.title}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  milestone.priority === 'high' ? 'bg-red-100 text-red-700' :
                  milestone.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {milestone.priority === 'high' ? '高优先级' :
                   milestone.priority === 'medium' ? '中优先级' : '低优先级'}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-2">{milestone.phase}</div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {milestone.date}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-8">
      {/* 报告生成工具 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">报告生成中心</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: '全局审核报告',
              description: '项目规划vs实际实现对比分析',
              icon: FileText,
              action: 'view',
              date: '2025-12-14',
              size: '2.3 MB'
            },
            {
              title: 'AI组件审核报告',
              description: '浮窗组件多维度分析',
              icon: Shield,
              action: 'view',
              date: '2025-12-14',
              size: '1.8 MB'
            },
            {
              title: '开发进度报告',
              description: '14天开发周期完整记录',
              icon: BarChart3,
              action: 'generate',
              date: '-',
              size: '-'
            }
          ].map((report, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                  <report.icon className="w-6 h-6 text-purple-600" />
                </div>
                {report.action === 'view' ? (
                  <Eye className="w-5 h-5 text-blue-600 cursor-pointer" />
                ) : (
                  <Download className="w-5 h-5 text-green-600 cursor-pointer" />
                )}
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{report.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{report.date}</span>
                <span>{report.size}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 关键指标趋势 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">关键指标趋势</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: '代码质量评分',
              current: 9.1,
              target: 9.5,
              trend: 'up',
              color: 'from-green-500 to-blue-500'
            },
            {
              title: '测试覆盖率',
              current: 25,
              target: 85,
              trend: 'up',
              color: 'from-purple-500 to-pink-500'
            },
            {
              title: 'API响应时间',
              current: 0,
              target: 200,
              trend: 'stable',
              color: 'from-yellow-500 to-orange-500'
            },
            {
              title: '用户满意度',
              current: 4.8,
              target: 4.9,
              trend: 'up',
              color: 'from-red-500 to-pink-500'
            }
          ].map((metric, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-800">{metric.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-purple-600">{metric.current}</span>
                  <span className="text-sm text-gray-500">/ {metric.target}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`bg-gradient-to-r ${metric.color} h-2 rounded-full`}
                  style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                {metric.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />}
                {metric.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full" />}
                <span>{metric.trend === 'up' ? '改善中' : metric.trend === 'down' ? '需关注' : '稳定'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-8">
      {/* 项目配置 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">项目配置</h3>
        <div className="space-y-6">
          {[
            {
              title: '项目基本信息',
              description: 'YYC³ AI小语智能成长守护平台',
              fields: [
                { label: '项目名称', value: 'YYC³ AI小语', type: 'text' },
                { label: '开始日期', value: '2025-12-01', type: 'date' },
                { label: '预计完成', value: '2026-11-17', type: 'date' }
              ]
            },
            {
              title: '团队配置',
              description: '开发团队和权限管理',
              fields: [
                { label: '项目经理', value: 'Project Manager', type: 'text' },
                { label: '团队规模', value: '12人', type: 'number' },
                { label: '技术栈', value: 'Next.js + TypeScript + Node.js', type: 'text' }
              ]
            },
            {
              title: '质量标准',
              description: '代码质量和测试标准',
              fields: [
                { label: '代码覆盖率目标', value: '85%', type: 'percentage' },
                { label: '质量评分目标', value: '9.0/10', type: 'score' },
                { label: 'API响应时间目标', value: '200ms', type: 'time' }
              ]
            }
          ].map((section, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{section.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      value={field.value}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">通知设置</h3>
        <div className="space-y-4">
          {[
            {
              title: '任务状态更新',
              description: '当任务状态发生变化时通知',
              enabled: true
            },
            {
              title: '里程碑提醒',
              description: '重要里程碑临近时提醒',
              enabled: true
            },
            {
              title: '质量报告',
              description: '定期收到项目质量报告',
              enabled: false
            },
            {
              title: '团队动态',
              description: '团队成员的重要活动通知',
              enabled: true
            }
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">{setting.title}</h4>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-colors ${
                  setting.enabled ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                  setting.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const TabCard = ({ tab }: { tab: typeof tabs[0] }) => {
    const Icon = tab.icon
    const isActive = activeTab === tab.id

    return (
      <motion.div
        className={`relative cursor-pointer rounded-2xl p-6 transition-all ${
          isActive
            ? 'bg-gradient-to-br ' + tab.color + ' text-white shadow-2xl scale-105'
            : 'bg-white text-gray-800 shadow-lg hover:shadow-xl hover:scale-102'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        onClick={() => setActiveTab(tab.id as any)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 ${isActive ? 'bg-white bg-opacity-20' : 'bg-gradient-to-br ' + tab.color + ' bg-opacity-10'} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">{tab.title}</h3>
            <p className={`text-sm ${isActive ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
              {tab.description}
            </p>
          </div>
        </div>

        {isActive && (
          <motion.div
            className="absolute bottom-6 right-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <CheckCircle className="w-6 h-6 text-white" />
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 顶部导航栏 */}
      <motion.nav
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">返回首页</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                YYC³ AI小语项目管理中心
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>项目进行中</span>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* 概览页面 */}
          {activeTab !== 'execution' && (
            <motion.div
              key="tabs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tab选择 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {tabs.map((tab, index) => (
                  <motion.div
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TabCard tab={tab} />
                  </motion.div>
                ))}
              </div>

              {/* 内容区域 */}
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'reports' && renderReports()}
              {activeTab === 'settings' && renderSettings()}
            </motion.div>
          )}

          {/* 执行管理页面 */}
          {activeTab === 'execution' && (
            <motion.div
              key="execution"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回概览</span>
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">项目执行管理</h2>
                    <p className="text-gray-600">跟踪任务进度，管理项目执行，确保目标达成</p>
                  </div>
                </div>
              </div>

              <ProjectExecutionManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}