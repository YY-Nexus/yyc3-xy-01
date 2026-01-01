'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Heart,
  Star,
  BookOpen,
  Camera,
  TrendingUp,
  Baby,
  Users,
  Settings,
  HelpCircle,
  CheckCircle,
  Circle,
  MousePointer,
  Hand,
  Eye,
  Clock,
  Target,
  Zap
} from 'lucide-react'

// 引导步骤接口
interface GuideStep {
  id: string
  title: string
  description: string
  target?: string // CSS选择器
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: {
    type: 'click' | 'hover' | 'scroll' | 'input'
    selector: string
  }
  image?: string
  video?: string
  tips?: string[]
  interactive?: boolean
  skippable?: boolean
  completion?: () => void
}

// 引导配置
const guideSteps: GuideStep[] = [
  {
    id: 'welcome',
    title: '欢迎来到YYC³ AI小语系统',
    description: '这是一个专为小语设计的智能成长守护平台。让我们通过一个简短的引导来了解主要功能。',
    position: 'center',
    image: '/onboarding-welcome.png',
    tips: [
      '每个功能都为小语的成长需求量身定制',
      'AI技术让育儿变得更智能、更有温度',
      '所有的数据都会得到安全保护'
    ],
    interactive: false,
    skippable: true
  },
  {
    id: 'navigation',
    title: '导航栏功能',
    description: '顶部导航栏可以快速访问所有主要功能模块。每个图标都代表一个重要的成长守护工具。',
    target: '.navigation-bar',
    position: 'bottom',
    tips: [
      '点击任何图标即可进入对应功能',
      '鼠标悬停可查看功能说明',
      '当前位置会高亮显示'
    ],
    interactive: true,
    action: {
      type: 'hover',
      selector: '.navigation-item'
    }
  },
  {
    id: 'ai-chat',
    title: 'AI小语智能助手',
    description: '这是小语专属的AI助手，可以进行语音对话、生成故事、回答各种育儿问题。',
    target: '[data-feature="ai-chat"]',
    position: 'right',
    tips: [
      '支持语音和文字两种交互方式',
      '可以根据小语的年龄调整对话内容',
      '有5种不同专业角色的AI助手'
    ],
    interactive: true,
    action: {
      type: 'click',
      selector: '[data-feature="ai-chat"]'
    }
  },
  {
    id: 'growth-tracking',
    title: '成长记录追踪',
    description: '全面记录小语的成长轨迹，包括身高体重、发育里程碑、重要时刻等。',
    target: '[data-feature="growth-tracking"]',
    position: 'left',
    tips: [
      '支持照片、视频、文字多种记录方式',
      '自动生成成长时间线',
      '智能识别发育里程碑'
    ],
    interactive: true,
    action: {
      type: 'click',
      selector: '[data-feature="growth-tracking"]'
    }
  },
  {
    id: 'data-visualization',
    title: '数据可视化分析',
    description: '通过直观的图表了解小语的发展状况，包括生长曲线、能力发展雷达图等。',
    target: '[data-feature="data-visualization"]',
    position: 'top',
    tips: [
      '多种图表类型展示不同维度的数据',
      '支持时间范围筛选和数据导出',
      'AI智能分析提供专业建议'
    ],
    interactive: true,
    action: {
      type: 'click',
      selector: '[data-feature="data-visualization"]'
    }
  },
  {
    id: 'smart-album',
    title: '智能相册管理',
    description: 'AI驱动的照片管理系统，自动识别内容、生成标签、智能分类整理。',
    target: '[data-feature="smart-album"]',
    position: 'bottom',
    tips: [
      'AI自动识别人物和场景',
      '情感分析理解照片氛围',
      '智能搜索快速找到想要的内容'
    ],
    interactive: true,
    action: {
      type: 'click',
      selector: '[data-feature="smart-album"]'
    }
  },
  {
    id: 'birthday-theme',
    title: '生日主题模式',
    description: '特别为小语生日设计的主题模式，包含倒计时、庆祝动画、专属内容等。',
    target: '[data-feature="birthday-theme"]',
    position: 'center',
    image: '/onboarding-birthday.png',
    tips: [
      '生日倒计时实时显示',
      '庆祝动画增加节日氛围',
      '专属生日歌曲和故事'
    ],
    interactive: false,
    skippable: true
  },
  {
    id: 'voice-story',
    title: 'AI语音故事生成',
    description: '基于小语的年龄和喜好，AI可以创作个性化故事并用温暖的童声朗读。',
    target: '[data-feature="voice-story"]',
    position: 'right',
    tips: [
      '支持多种故事类型和语调风格',
      '内容根据年龄自动适配',
      '可以定制故事主题和角色'
    ],
    interactive: true,
    action: {
      type: 'click',
      selector: '[data-feature="voice-story"]'
    }
  },
  {
    id: 'parent-settings',
    title: '家长设置中心',
    description: '在这里可以管理账户、设置偏好、查看使用统计等。',
    target: '[data-feature="parent-settings"]',
    position: 'left',
    tips: [
      '管理家庭成员权限',
      '设置AI助手偏好',
      '查看使用报告和建议'
    ],
    interactive: true,
    action: {
      type: 'click',
      selector: '[data-feature="parent-settings"]'
    }
  },
  {
    id: 'completion',
    title: '引导完成！',
    description: '恭喜！您已经了解了YYC³ AI小语系统的主要功能。现在就开始使用吧，为小语创造更美好的成长体验！',
    position: 'center',
    image: '/onboarding-complete.png',
    tips: [
      '随时可以点击帮助图标重新查看引导',
      '系统会根据使用情况提供智能建议',
      '有任何问题都可以联系客服支持'
    ],
    interactive: false,
    skippable: false
  }
]

export default function SmartOnboardingGuide() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const currentStep = guideSteps[currentStepIndex]
  const progress = ((currentStepIndex + 1) / guideSteps.length) * 100

  // 检查是否需要显示引导
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('yyc3-onboarding-completed')
    if (!hasSeenOnboarding) {
      // 延迟显示，确保页面完全加载
      setTimeout(() => {
        setIsActive(true)
      }, 1000)
    }
  }, [])

  // 定位目标元素
  useEffect(() => {
    if (currentStep.target && isActive && !isPaused) {
      const element = document.querySelector(currentStep.target) as HTMLElement
      if (element) {
        setTargetElement(element)
        const rect = element.getBoundingClientRect()
        setHighlightPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        })
      } else {
        setTargetElement(null)
      }
    } else {
      setTargetElement(null)
    }
  }, [currentStep.target, currentStepIndex, isActive, isPaused])

  // 执行引导动作
  const executeStepAction = async () => {
    if (!currentStep.action) return

    const { type, selector } = currentStep.action
    const element = document.querySelector(selector) as HTMLElement

    if (!element) return

    switch (type) {
      case 'click':
        element.click()
        await new Promise(resolve => setTimeout(resolve, 500))
        break
      case 'hover':
        const mouseEnterEvent = new MouseEvent('mouseenter', { bubbles: true })
        element.dispatchEvent(mouseEnterEvent)
        await new Promise(resolve => setTimeout(resolve, 1000))
        break
      case 'scroll':
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        await new Promise(resolve => setTimeout(resolve, 1000))
        break
      case 'input':
        element.focus()
        await new Promise(resolve => setTimeout(resolve, 500))
        break
    }

    setCompletedSteps(prev => new Set([...prev, currentStep.id]))
  }

  // 下一步
  const nextStep = async () => {
    if (currentStep.interactive && currentStep.action) {
      await executeStepAction()
    }

    if (currentStepIndex < guideSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1)
    } else {
      completeOnboarding()
    }
  }

  // 上一步
  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  // 跳过引导
  const skipOnboarding = () => {
    if (currentStep.skippable) {
      setShowSkipConfirm(true)
    }
  }

  // 确认跳过
  const confirmSkip = () => {
    localStorage.setItem('yyc3-onboarding-completed', 'true')
    localStorage.setItem('yyc3-onboarding-skipped', 'true')
    setIsActive(false)
  }

  // 完成引导
  const completeOnboarding = () => {
    localStorage.setItem('yyc3-onboarding-completed', 'true')
    localStorage.setItem('yyc3-onboarding-date', new Date().toISOString())
    setIsActive(false)
  }

  // 重新开始引导
  const restartOnboarding = () => {
    localStorage.removeItem('yyc3-onboarding-completed')
    setCurrentStepIndex(0)
    setCompletedSteps(new Set())
    setIsActive(true)
  }

  // 获取箭头位置
  const getArrowPosition = () => {
    if (!targetElement || currentStep.position === 'center') return null

    const rect = targetElement.getBoundingClientRect()
    const guideWidth = 400
    const guideHeight = 300

    switch (currentStep.position) {
      case 'top':
        return {
          bottom: -10,
          left: rect.left + rect.width / 2 - 10
        }
      case 'bottom':
        return {
          top: -10,
          left: rect.left + rect.width / 2 - 10
        }
      case 'left':
        return {
          right: -10,
          top: rect.top + rect.height / 2 - 10
        }
      case 'right':
        return {
          left: -10,
          top: rect.top + rect.height / 2 - 10
        }
      default:
        return null
    }
  }

  const arrowPosition = getArrowPosition()

  if (!isActive) {
    return (
      <button
        onClick={restartOnboarding}
        className="fixed bottom-4 right-4 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all flex items-center justify-center z-30"
        title="查看使用引导"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <>
      {/* 高亮蒙版 */}
      {targetElement && currentStep.position !== 'center' && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* 黑色蒙版 */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />

          {/* 高亮区域 */}
          <motion.div
            className="absolute border-4 border-purple-500 rounded-lg shadow-2xl"
            style={{
              top: highlightPosition.top - 8,
              left: highlightPosition.left - 8,
              width: highlightPosition.width + 16,
              height: highlightPosition.height + 16
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring" }}
          >
            {/* 脉冲效果 */}
            <motion.div
              className="absolute inset-0 border-2 border-purple-400 rounded-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>
      )}

      {/* 引导框 */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            ref={containerRef}
            className={`fixed z-50 ${
              currentStep.position === 'center'
                ? 'inset-0 flex items-center justify-center p-8'
                : currentStep.position === 'top'
                ? ''
                : currentStep.position === 'bottom'
                ? ''
                : currentStep.position === 'left'
                ? ''
                : ''
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              ...(targetElement && currentStep.position !== 'center' && {
                top: currentStep.position === 'bottom' ? highlightPosition.bottom + 20 :
                     currentStep.position === 'top' ? highlightPosition.top - 320 :
                     highlightPosition.top,
                left: currentStep.position === 'right' ? highlightPosition.right + 20 :
                     currentStep.position === 'left' ? highlightPosition.left - 420 :
                     highlightPosition.left + highlightPosition.width / 2 - 200
              })
            }}
          >
            <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
              currentStep.position === 'center' ? 'max-w-2xl w-full' : 'w-96'
            }`}>
              {/* 箭头 */}
              {arrowPosition && (
                <div
                  className="absolute w-5 h-5 bg-purple-600 transform rotate-45 z-10"
                  style={{
                    ...arrowPosition
                  }}
                />
              )}

              {/* 进度条 */}
              <div className="bg-purple-600 h-1">
                <motion.div
                  className="bg-white h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* 关闭按钮 */}
              {currentStep.skippable && (
                <button
                  onClick={() => setShowSkipConfirm(true)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors z-20"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              )}

              {/* 内容区域 */}
              <div className="p-6">
                {/* 步骤指示器 */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {guideSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStepIndex
                          ? 'bg-purple-600 w-8'
                          : index < currentStepIndex
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* 标题和描述 */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                    {currentStepIndex === guideSteps.length - 1 && <Sparkles className="w-6 h-6 text-yellow-500" />}
                    {currentStep.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{currentStep.description}</p>
                </div>

                {/* 图片或视频 */}
                {currentStep.image && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={currentStep.image}
                      alt={currentStep.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* 提示列表 */}
                {currentStep.tips && currentStep.tips.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-purple-600 font-medium mb-3">
                      <Zap className="w-4 h-4" />
                      <span>小贴士</span>
                    </div>
                    <ul className="space-y-2">
                      {currentStep.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 交互提示 */}
                {currentStep.interactive && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                      <Hand className="w-4 h-4" />
                      <span>请跟着操作</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      点击"下一步"按钮，系统将自动演示操作
                    </p>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="border-t p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStepIndex === 0}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      currentStepIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    上一步
                  </button>

                  <div className="text-sm text-gray-500">
                    {currentStepIndex + 1} / {guideSteps.length}
                  </div>

                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                  >
                    {currentStepIndex === guideSteps.length - 1 ? (
                      <>
                        完成引导
                        <CheckCircle className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        下一步
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* 暂停/继续按钮 */}
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isPaused ? (
                      <>
                        <Play className="w-4 h-4" />
                        继续引导
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4" />
                        暂停引导
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 跳过确认对话框 */}
      <AnimatePresence>
        {showSkipConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black bg-opacity-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">确定要跳过引导吗？</h3>
              <p className="text-gray-600 mb-6">
                跳过引导后，您可以随时点击右下角的帮助图标重新查看。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                >
                  继续引导
                </button>
                <button
                  onClick={confirmSkip}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                >
                  跳过引导
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}