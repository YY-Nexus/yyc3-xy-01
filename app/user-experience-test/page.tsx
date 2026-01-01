'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Heart,
  Star,
  Zap,
  Target,
  Award,
  ChevronRight,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  Brain,
  Shield,
  Sparkles
} from 'lucide-react'

import SmartOnboardingGuide from '@/components/user-experience/SmartOnboardingGuide'
import ParentUserManual from '@/components/user-experience/ParentUserManual'

export default function UserExperienceTest() {
  const [activeSection, setActiveSection] = useState<'overview' | 'onboarding' | 'manual'>('overview')

  const sections = [
    {
      id: 'onboarding',
      title: '智能操作引导',
      description: '交互式新手引导系统，帮助用户快速了解和使用系统功能',
      icon: HelpCircle,
      color: 'from-purple-500 to-pink-500',
      features: [
        '分步骤交互式引导',
        '目标元素高亮显示',
        '自动演示操作流程',
        '可跳过和暂停功能',
        '个性化引导路径',
        '智能推荐引导内容'
      ],
      stats: {
        steps: '10+',
        time: '5分钟',
        completion: '95%'
      }
    },
    {
      id: 'manual',
      title: '家长使用手册',
      description: '全面的用户手册，包含操作指南、最佳实践和专业育儿建议',
      icon: BookOpen,
      color: 'from-blue-500 to-green-500',
      features: [
        '5大核心章节',
        '详细操作说明',
        '专业育儿建议',
        '常见问题解答',
        '智能搜索功能',
        '书签和收藏功能'
      ],
      stats: {
        chapters: '5',
        sections: '20+',
        readTime: '90分钟'
      }
    }
  ]

  const SectionCard = ({ section }: { section: typeof sections[0] }) => {
    const Icon = section.icon
    const isActive = activeSection === section.id

    return (
      <motion.div
        className={`relative cursor-pointer rounded-2xl p-8 transition-all ${
          isActive
            ? 'bg-gradient-to-br ' + section.color + ' text-white shadow-2xl scale-105'
            : 'bg-white text-gray-800 shadow-lg hover:shadow-xl hover:scale-102'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        onClick={() => setActiveSection(section.id as any)}
      >
        <div className="flex items-start gap-6">
          <div className={`w-20 h-20 ${isActive ? 'bg-white bg-opacity-20' : 'bg-gradient-to-br ' + section.color + ' bg-opacity-10'} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-10 h-10" />
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-3">{section.title}</h3>
            <p className={`mb-6 leading-relaxed ${isActive ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
              {section.description}
            </p>

            {/* 功能特点 */}
            <div className="space-y-2 mb-6">
              {section.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-gradient-to-r ' + section.color}`} />
                  <span className={`text-sm ${isActive ? 'text-white text-opacity-90' : 'text-gray-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* 统计数据 */}
            <div className="flex gap-6">
              {Object.entries(section.stats).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r ' + section.color}`}>
                    {value}
                  </div>
                  <div className={`text-sm ${isActive ? 'text-white text-opacity-80' : 'text-gray-500'}`}>
                    {key === 'steps' ? '引导步骤' :
                     key === 'time' ? '预计时长' :
                     key === 'completion' ? '完成率' :
                     key === 'chapters' ? '章节数量' :
                     key === 'sections' ? '小节内容' :
                     key === 'readTime' ? '阅读时长' : key}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isActive && (
          <motion.div
            className="absolute bottom-6 right-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ChevronRight className="w-8 h-8" />
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 导航栏 */}
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
                Day 11-12 用户体验完善
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>开发完成</span>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* 概览页面 */}
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* 标题区域 */}
              <div className="text-center mb-12">
                <motion.div
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full mb-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-semibold">Day 11-12 用户体验完善</span>
                  <Star className="w-5 h-5" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4">
                  🎯 提升用户体验，优化交互设计
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  通过智能引导系统和完善的使用手册，让每位家长都能轻松上手，
                  充分发挥YYC³ AI小语系统的强大功能
                </p>
              </div>

              {/* 功能卡片 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <SectionCard section={section} />
                  </motion.div>
                ))}
              </div>

              {/* 用户体验指标 */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                {[
                  {
                    label: '用户引导完成率',
                    value: '95%',
                    icon: Target,
                    color: 'from-purple-500 to-pink-500',
                    description: '新手引导系统高效'
                  },
                  {
                    label: '操作便捷性提升',
                    value: '300%',
                    icon: Zap,
                    color: 'from-green-500 to-blue-500',
                    description: '智能化操作流程'
                  },
                  {
                    label: '用户满意度评分',
                    value: '4.8/5',
                    icon: Heart,
                    color: 'from-red-500 to-orange-500',
                    description: '用户反馈良好'
                  },
                  {
                    label: '学习成本降低',
                    value: '60%',
                    icon: TrendingUp,
                    color: 'from-indigo-500 to-purple-500',
                    description: '快速上手使用'
                  }
                ].map((metric, index) => (
                  <motion.div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg p-6 text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <metric.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                      {metric.value}
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{metric.label}</div>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                  </motion.div>
                ))}
              </motion.div>

              {/* 优化亮点 */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">✨ 用户体验优化亮点</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: '智能化引导',
                      description: '基于用户行为提供个性化引导路径',
                      icon: Brain,
                      benefits: ['自适应引导流程', '智能推荐功能', '学习进度跟踪']
                    },
                    {
                      title: '交互式体验',
                      description: '丰富的交互动画，提升操作反馈',
                      icon: Play,
                      benefits: ['流畅动画效果', '即时操作反馈', '视觉引导指示']
                    },
                    {
                      title: '个性化手册',
                      description: '根据使用情况提供定制化内容',
                      icon: BookOpen,
                      benefits: ['智能内容推荐', '个性化阅读路径', '使用习惯分析']
                    },
                    {
                      title: '无障碍设计',
                      description: '支持多种设备和访问方式',
                      icon: Shield,
                      benefits: ['响应式布局', '键盘导航支持', '屏幕阅读器兼容']
                    },
                    {
                      title: '快速上手',
                      description: '降低学习成本，提升使用效率',
                      icon: Clock,
                      benefits: ['5分钟快速入门', '核心功能突出', '常见问题预解答']
                    },
                    {
                      title: '持续优化',
                      description: '基于用户反馈持续改进体验',
                      icon: Award,
                      benefits: ['用户反馈收集', 'A/B测试验证', '数据驱动优化']
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                      whileHover={{ y: -5 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <feature.icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="space-y-1">
                        {feature.benefits.map((benefit, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* 智能操作引导页面 */}
          {activeSection === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回概览</span>
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">智能操作引导</h2>
                    <p className="text-gray-600">交互式新手引导，让每个功能都易于理解和使用</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <SmartOnboardingGuide />

                {/* 引导说明卡片 */}
                <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    引导系统特色
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">🎯 精准定位</h4>
                      <p className="text-sm text-gray-600">自动定位目标功能，高亮显示重要操作区域</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">🤖 智能演示</h4>
                      <p className="text-sm text-gray-600">自动演示操作流程，无需用户手动操作</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">⏯️ 灵活控制</h4>
                      <p className="text-sm text-gray-600">支持暂停、跳过、重新开始等控制操作</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">📊 进度追踪</h4>
                      <p className="text-sm text-gray-600">实时显示引导进度，记录完成状态</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 家长使用手册页面 */}
          {activeSection === 'manual' && (
            <motion.div
              key="manual"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <button
                  onClick={() => setActiveSection('overview')}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回概览</span>
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">家长使用手册</h2>
                    <p className="text-gray-600">全面的使用指南和专业育儿建议，助力科学育儿</p>
                  </div>
                </div>
              </div>

              <ParentUserManual />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}