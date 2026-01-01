/**
 * @file AIGrowthCompanion.tsx
 * @description YYC³ AI小语智能成长守护系统AI成长伴侣组件，提供个性化成长建议和情感陪伴
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * YYC³ AI小语智能成长伴侣
 * 提供个性化成长建议、情感陪伴、智能分析等功能
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAIXiaoyu } from "@/hooks/useAIXiaoyu"
import { useChildren } from "@/hooks/useChildren"
import { useGrowthStage } from "@/hooks/useGrowthStage"

interface AIGrowthCompanionProps {
  isOpen: boolean
  onClose: () => void
  currentTab?: string
}

interface GrowthInsight {
  id: string
  title: string
  content: string
  type: "suggestion" | "analysis" | "encouragement" | "recommendation"
  priority: "high" | "medium" | "low"
  timestamp: Date
}

export default function AIGrowthCompanion({ isOpen, onClose, currentTab }: AIGrowthCompanionProps) {
  const [activeSection, setActiveSection] = useState<'insights' | 'chat' | 'planning'>('insights')
  const [insights, setInsights] = useState<GrowthInsight[]>([])
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{role: string; content: string; timestamp: Date }>>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const { currentChild } = useChildren()
  const { sendMessage, isProcessing: aiProcessing } = useAIXiaoyu()

  const childBirthDate = currentChild?.birth_date ? new Date(currentChild.birth_date) : new Date()
  const childName = currentChild?.name || "小朋友"
  const childAge = currentChild?.age_months || 0

  const { stage } = useGrowthStage(childBirthDate)

  // 生成AI成长洞察
  const generateGrowthInsights = async () => {
    setIsProcessing(true)
    try {
      const prompt = `
        请为${childAge}个月的${childName}生成个性化的成长发展建议。
        当前阶段：${stage?.name || "成长中"}。

        请提供以下4个方面的建议：
        1. 发展建议：基于${stage?.name || "当前年龄段"}的发展重点
        2. 情感支持：如何进行情感陪伴和心理支持
        3. 学习活动：适合当前年龄段的益智活动建议
        4. 家长指导：给家长的实用育儿建议

        请用温暖、鼓励的语气，语言要简单易懂，适合家长阅读。
      `

      const response = await sendMessage(prompt)

      // 解析AI响应并生成洞察
      const generatedInsights: GrowthInsight[] = [
        {
          id: Date.now().toString(),
          title: "发展建议",
          content: "基于您孩子的当前发展阶段，建议重点培养...",
          type: "suggestion",
          priority: "high",
          timestamp: new Date()
        },
        {
          id: (Date.now() + 1).toString(),
          title: "情感支持",
          content: "在这个阶段，情感支持对孩子的心理健康...",
          type: "encouragement",
          priority: "high",
          timestamp: new Date()
        },
        {
          id: (Date.now() + 2).toString(),
          title: "学习活动",
          content: "推荐以下适合的活动：1. 认知游戏 2. 语言互动...",
          type: "recommendation",
          priority: "medium",
          timestamp: new Date()
        },
        {
          id: (Date.now() + 3).toString(),
          title: "家长指导",
          content: "作为家长，您可以通过以下方式支持孩子的发展...",
          type: "analysis",
          priority: "medium",
          timestamp: new Date()
        }
      ]

      setInsights(generatedInsights)
    } catch (error) {
      console.error('生成成长洞察失败:', error)
      // 提供默认洞察
      setInsights([
        {
          id: Date.now().toString(),
          title: "发展建议",
          content: `${childName}正处在快速成长期，建议多进行亲子互动游戏，促进认知和情感发展。`,
          type: "suggestion",
          priority: "high",
          timestamp: new Date()
        }
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  // 处理聊天消息
  const handleChatMessage = async () => {
    if (!chatMessage.trim() || aiProcessing) return

    const userMessage = {
      role: "user" as const,
      content: chatMessage,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setChatMessage("")

    try {
      const response = await sendMessage(
        `我是${childName}的家长，${chatMessage}请以专业、温暖的角度回答，关注儿童发展心理和成长规律。`
      )

      const aiMessage = {
        role: "assistant" as const,
        content: response.content,
        timestamp: new Date()
      }

      setChatHistory(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('发送消息失败:', error)
    }
  }

  // 生成个性化成长计划
  const generateGrowthPlan = async () => {
    setIsProcessing(true)
    try {
      const prompt = `
        请为${childAge}个月的${childName}制定一个详细的个性化成长计划。

        包括：
        1. 本周重点发展目标
        2. 日常活动安排建议
        3. 亲子互动游戏推荐
        4. 能力培养重点
        5. 预期成果

        请基于${stage?.name || "当前发展阶段"}的特点，制定具体、可执行的计划。
      `

      const response = await sendMessage(prompt)

      // 可以将响应保存为成长计划
      console.log('成长计划:', response.content)
    } catch (error) {
      console.error('生成成长计划失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      generateGrowthInsights()
    }
  }, [isOpen, childName, childAge])

  const getInsightIcon = (type: GrowthInsight['type']) => {
    const icons = {
      suggestion: "ri-lightbulb-line",
      analysis: "ri-search-eye-line",
      encouragement: "ri-heart-line",
      recommendation: "ri-star-line"
    }
    return icons[type] || "ri-information-line"
  }

  const getInsightColor = (priority: GrowthInsight['priority']) => {
    const colors = {
      high: "from-red-50 to-pink-50 border-red-200",
      medium: "from-blue-50 to-purple-50 border-blue-200",
      low: "from-green-50 to-emerald-50 border-green-200"
    }
    return colors[priority] || "from-gray-50 to-slate-50 border-gray-200"
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-400 to-pink-400 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-robot-fill text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI小语成长伴侣</h3>
                  <p className="text-sm text-white/80">为{childName}提供专业成长指导</p>
                </div>
              </div>
              <button
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                onClick={onClose}
              >
                <i className="ri-close-line" />
              </button>
            </div>

            {/* 孩子信息卡片 */}
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                  {childName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{childName}</h4>
                  <p className="text-sm text-white/90">
                    {childAge}个月 · {stage?.name || "成长中"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 标签页 */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {[
              { id: 'insights' as const, icon: 'ri-magic-line', label: 'AI洞察' },
              { id: 'chat' as const, icon: 'ri-chat-3-line', label: '对话咨询' },
              { id: 'planning' as const, icon: 'ri-calendar-line', label: '成长计划' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-all ${
                  activeSection === tab.id
                    ? 'text-purple-500 border-b-2 border-purple-500 bg-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
                onClick={() => setActiveSection(tab.id)}
              >
                <i className={`${tab.icon} text-lg mb-1`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 内容区域 */}
          <div className="p-6 max-h-[500px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeSection === 'insights' && (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* 加载状态 */}
                  {isProcessing && (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center gap-3 text-purple-600">
                        <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        <span>小语正在为{childName}分析成长数据...</span>
                      </div>
                    </div>
                  )}

                  {/* AI洞察列表 */}
                  {!isProcessing && insights.map((insight, index) => (
                    <motion.div
                      key={insight.id}
                      className={`bg-gradient-to-r ${getInsightColor(insight.priority)} rounded-xl p-4 border`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className={`${getInsightIcon(insight.type)} text-lg ${insight.priority === 'high' ? 'text-red-500' : insight.priority === 'medium' ? 'text-blue-500' : 'text-green-500'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                            {insight.title}
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                              insight.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {insight.priority === 'high' ? '重要' : insight.priority === 'medium' ? '关注' : '建议'}
                            </span>
                          </h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{insight.content}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(insight.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* 刷新按钮 */}
                  <motion.button
                    className="w-full bg-purple-100 text-purple-600 rounded-xl p-3 font-medium hover:bg-purple-200 transition flex items-center justify-center gap-2"
                    onClick={generateGrowthInsights}
                    disabled={isProcessing}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  >
                    <i className="ri-refresh-line" />
                    刷新AI洞察
                  </motion.button>
                </motion.div>
              )}

              {activeSection === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* 对话历史 */}
                  <div className="bg-slate-50 rounded-xl p-4 h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {chatHistory.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                          <i className="ri-chat-smile-line text-3xl mb-2 text-purple-400" />
                          <p>开始与小语对话吧！</p>
                        </div>
                      ) : (
                        chatHistory.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-xl ${
                                msg.role === 'user'
                                  ? 'bg-purple-500 text-white rounded-br-none'
                                  : 'bg-white text-slate-800 rounded-bl-none'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 输入区域 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="输入您想咨询的成长问题..."
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleChatMessage()
                        }
                      }}
                      disabled={aiProcessing}
                    />
                    <motion.button
                      className="px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition"
                      onClick={handleChatMessage}
                      disabled={!chatMessage.trim() || aiProcessing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {aiProcessing ? '发送中...' : '发送'}
                    </motion.button>
                  </div>

                  {/* 快速问题 */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "如何培养孩子的创造力？",
                      "孩子情绪不稳定怎么办？",
                      "推荐一些亲子活动",
                      "如何平衡学习和玩耍？"
                    ].map((question, i) => (
                      <motion.button
                        key={i}
                        className="px-3 py-2 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 transition"
                        onClick={() => {
                          setChatMessage(question)
                          handleChatMessage()
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeSection === 'planning' && (
                <motion.div
                  key="planning"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {/* 计划概览 */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <i className="ri-calendar-check-line text-blue-500" />
                      本周成长计划
                    </h4>
                    <div className="text-sm text-slate-600">
                      基于{childName}的发展特点制定的个性化计划，重点关注认知、情感、社交和运动发展。
                    </div>
                  </div>

                  {/* 生成计划按钮 */}
                  <motion.button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 font-bold flex items-center justify-center gap-2"
                    onClick={generateGrowthPlan}
                    disabled={isProcessing}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                  >
                    <i className="ri-file-list-3-line" />
                    {isProcessing ? '生成中...' : '生成详细成长计划'}
                  </motion.button>

                  {/* 计划预览 */}
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h5 className="font-medium text-slate-700 mb-3">计划亮点</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <i className="ri-target-line text-green-500" />
                        <span>发展目标明确</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ri-time-line text-blue-500" />
                        <span>时间安排合理</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ri-heart-line text-red-500" />
                        <span>情感关注充分</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="ri-star-line text-yellow-500" />
                        <span>活动设计科学</span>
                      </div>
                    </div>
                  </div>

                  {/* 温馨提示 */}
                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                    <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                      <i className="ri-information-line" />
                      小语提示
                    </h5>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                      成长是一个渐进的过程，请根据孩子的实际发展情况灵活调整计划。记住，每个孩子都有自己独特的发展节奏，耐心陪伴是最好的教育方式！
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 底部操作 */}
          <div className="border-t border-slate-200 p-6 bg-slate-50">
            <div className="flex gap-3">
              <button
                className="flex-1 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition"
                onClick={onClose}
              >
                稍后查看
              </button>
              <button
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition"
                onClick={onClose}
              >
                已查看，谢谢小语
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}