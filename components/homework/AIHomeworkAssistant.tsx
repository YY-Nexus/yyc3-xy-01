/**
 * @file AIHomeworkAssistant.tsx
 * @description YYC³ AI小语智能成长守护系统AI作业助手组件，集成智能题目辅导、错题分析、学习建议等功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * YYC³ AI小语智能作业助手
 * 集成智能题目辅导、错题分析、学习建议等功能
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAIXiaoyu } from "@/hooks/useAIXiaoyu"

interface Homework {
  id: string
  subject: string
  title: string
  description: string
}

interface AIHomeworkAssistantProps {
  homework: Homework
  isOpen: boolean
  onClose: () => void
  onComplete?: (progress: number) => void
}

export default function AIHomeworkAssistant({ homework, isOpen, onClose, onComplete }: AIHomeworkAssistantProps) {
  const [activeTab, setActiveTab] = useState<'guide' | 'solve' | 'analyze'>('guide')
  const [currentProblem, setCurrentProblem] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { sendMessage, isProcessing: aiProcessing, messages, clearMessages } = useAIXiaoyu()

  // 获取最新的AI回复
  const getLastAIMessage = () => {
    const aiMessages = messages.filter(msg => msg.role === 'assistant')
    return aiMessages[aiMessages.length - 1]?.content || ''
  }

  // 清空消息当切换标签页时
  const clearMessagesAndSwitchTab = (tab: 'guide' | 'solve' | 'analyze') => {
    clearMessages()
    setActiveTab(tab)
  }

  // 根据科目生成AI辅导建议
  const generateAIGuide = async () => {
    setIsProcessing(true)
    try {
      const prompt = `请为${homework.subject}作业"${homework.title}"提供详细的辅导建议。作业描述：${homework.description}。请用简单易懂的语言，分步骤说明解题方法，适合小学生理解。`
      await sendMessage(prompt)
    } catch (error) {
      console.error('生成AI辅导失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  // 分析题目
  const analyzeProblem = async () => {
    if (!currentProblem.trim()) return

    setIsProcessing(true)
    try {
      const prompt = `请分析这道${homework.subject}题目：${currentProblem}。请提供：1. 题目类型分析 2. 解题思路 3. 关键知识点 4. 可能的易错点。请用简单语言解释。`
      await sendMessage(prompt)
    } catch (error) {
      console.error('分析题目失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (isOpen && activeTab === 'guide') {
      generateAIGuide()
    }
  }, [isOpen, activeTab])

  const handleCompleteHomework = (progress: number) => {
    onComplete?.(progress)
    onClose()
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
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-robot-fill text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AI小语作业助手</h3>
                  <p className="text-sm text-white/80">让我帮你一起完成作业吧！</p>
                </div>
              </div>
              <button
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
                onClick={onClose}
              >
                <i className="ri-close-line" />
              </button>
            </div>

            {/* 作业信息 */}
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                  {homework.subject}
                </span>
                <span className="text-sm text-white/80">作业</span>
              </div>
              <h4 className="font-bold text-lg mb-1">{homework.title}</h4>
              <p className="text-sm text-white/90">{homework.description}</p>
            </div>
          </div>

          {/* 标签页 */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            {[
              { id: 'guide' as const, icon: 'ri-lightbulb-line', label: 'AI辅导' },
              { id: 'solve' as const, icon: 'ri-edit-line', label: '解题助手' },
              { id: 'analyze' as const, icon: 'ri-search-line', label: '错题分析' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-500 border-b-2 border-blue-500 bg-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
                onClick={() => clearMessagesAndSwitchTab(tab.id)}
              >
                <i className={`${tab.icon} text-lg mb-1`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 内容区 */}
          <div className="p-6 max-h-96 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'guide' && (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <i className="ri-book-open-line" />
                      AI辅导建议
                    </h5>
                    {isProcessing ? (
                      <div className="flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>小语正在思考辅导方案...</span>
                      </div>
                    ) : (
                      <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {getLastAIMessage() || '请稍等，正在生成辅导建议...'}
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 rounded-2xl p-4">
                    <h5 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                      <i className="ri-magic-line" />
                      学习小贴士
                    </h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• 先仔细阅读题目，理解题意</li>
                      <li>• 回忆相关的知识点和方法</li>
                      <li>• 分步骤解答，检查每一步</li>
                      <li>• 完成后记得认真复查</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'solve' && (
                <motion.div
                  key="solve"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-yellow-50 rounded-2xl p-4">
                    <h5 className="font-bold text-yellow-700 mb-3 flex items-center gap-2">
                      <i className="ri-pencil-line" />
                      题目输入
                    </h5>
                    <textarea
                      value={currentProblem}
                      onChange={(e) => setCurrentProblem(e.target.value)}
                      placeholder="请输入你遇到的题目，小语会帮你分析..."
                      className="w-full h-24 p-3 border border-yellow-200 rounded-xl resize-none focus:outline-none focus:border-yellow-400 text-sm"
                    />
                    <button
                      onClick={analyzeProblem}
                      disabled={!currentProblem.trim() || aiProcessing}
                      className="mt-3 w-full py-2 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiProcessing ? '分析中...' : '开始分析'}
                    </button>
                  </div>

                  {getLastAIMessage() && (
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <h5 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
                        <i className="ri-lightbulb-flash-line" />
                        解题思路
                      </h5>
                      <div className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {getLastAIMessage()}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'analyze' && (
                <motion.div
                  key="analyze"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-red-50 rounded-2xl p-4">
                    <h5 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                      <i className="ri-error-warning-line" />
                      常见错误
                    </h5>
                    <div className="space-y-2 text-sm text-slate-600">
                      {homework.subject === '数学' && (
                        <>
                          <p>• <strong>计算错误</strong>：加减法时注意进位和退位</p>
                          <p>• <strong>步骤遗漏</strong>：记得写出完整的计算过程</p>
                          <p>• <strong>单位遗漏</strong>：应用题要注意单位转换</p>
                        </>
                      )}
                      {homework.subject === '语文' && (
                        <>
                          <p>• <strong>错别字</strong>：要注意形近字的区别</p>
                          <p>• <strong>标点符号</strong>：正确使用标点符号</p>
                          <p>• <strong>句子结构</strong>：检查句子是否完整通顺</p>
                        </>
                      )}
                      {homework.subject === '英语' && (
                        <>
                          <p>• <strong>拼写错误</strong>：注意单词的正确拼写</p>
                          <p>• <strong>时态错误</strong>：正确使用动词时态</p>
                          <p>• <strong>单复数</strong>：注意名词的单复数形式</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-4">
                    <h5 className="font-bold text-orange-700 mb-2 flex items-center gap-2">
                      <i className="ri-heart-line" />
                      小语鼓励
                    </h5>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      别担心犯错，每个错误都是学习的好机会！小语相信你通过努力一定能够掌握这些知识点。记住，练习让你更优秀！💪
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
                稍后再做
              </button>
              <button
                className="flex-1 py-3 bg-green-400 text-white rounded-xl font-bold hover:bg-green-500 transition"
                onClick={() => handleCompleteHomework(100)}
              >
                完成作业
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}