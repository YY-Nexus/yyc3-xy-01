"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAIXiaoyu } from "@/hooks/useAIXiaoyu"

interface Course {
  id: string
  title: string
  description: string
  category: string
  difficulty: string
  duration: string
  tags: string[]
}

interface AICourseRecommendationProps {
  isOpen: boolean
  onClose: () => void
  childId?: string
  childName?: string
  childAge?: number
}

interface LearningPath {
  phase: string
  description: string
  courses: Course[]
  duration: string
  goals: string[]
}

export default function AICourseRecommendation({
  isOpen,
  onClose,
  childId,
  childName = "宝宝",
  childAge = 0
}: AICourseRecommendationProps) {
  const [activeTab, setActiveTab] = useState<"recommendations" | "learning-path" | "consultation">("recommendations")
  const [recommendations, setRecommendations] = useState<{
    personality: Course[]
    developmental: Course[]
    interest: Course[]
  }>({ personality: [], developmental: [], interest: [] })
  const [learningPath, setLearningPath] = useState<LearningPath[]>([])
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const { sendMessage } = useAIXiaoyu()

  useEffect(() => {
    if (isOpen && childId) {
      generateRecommendations()
      generateLearningPath()
    }
  }, [isOpen, childId])

  const generateRecommendations = async () => {
    setIsGenerating(true)
    try {
      const prompt = `为${childAge}岁的${childName}推荐课程。基于儿童发展规律，请提供：
      1. 性格发展类课程（适合当前年龄段）
      2. 能力提升类课程（针对认知、语言、运动等）
      3. 兴趣探索类课程（激发好奇心和创造力）

      请以JSON格式返回，包含课程名称、描述、类别、难度、时长和标签。`

      await sendMessage(prompt)

      // 模拟解析推荐结果
      const mockRecommendations = {
        personality: [
          {
            id: "pers-1",
            title: "情绪管理小课堂",
            description: "学习识别和表达情绪，培养情商基础",
            category: "社会情感",
            difficulty: "入门",
            duration: "4课时",
            tags: ["情商", "情绪认知", "社交"]
          },
          {
            id: "pers-2",
            title: "友谊与合作",
            description: "学习与他人相处，发展友谊关系",
            category: "社会情感",
            difficulty: "基础",
            duration: "6课时",
            tags: ["合作", "友谊", "社交技能"]
          }
        ],
        developmental: [
          {
            id: "dev-1",
            title: "逻辑思维训练",
            description: "通过游戏培养观察力、记忆力和思维能力",
            category: "认知发展",
            difficulty: "适中",
            duration: "8课时",
            tags: ["逻辑", "思维", "解决问题"]
          },
          {
            id: "dev-2",
            title: "语言表达提升",
            description: "丰富词汇量，提升表达和沟通能力",
            category: "语言发展",
            difficulty: "基础",
            duration: "10课时",
            tags: ["语言", "表达", "沟通"]
          }
        ],
        interest: [
          {
            id: "int-1",
            title: "自然探索家",
            description: "认识动植物，培养对自然的兴趣和保护意识",
            category: "科学探索",
            difficulty: "入门",
            duration: "5课时",
            tags: ["自然", "探索", "环保"]
          },
          {
            id: "int-2",
            title: "创意美术启蒙",
            description: "通过多种艺术形式激发创造力和想象力",
            category: "艺术创作",
            difficulty: "入门",
            duration: "6课时",
            tags: ["美术", "创意", "想象"]
          }
        ]
      }

      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error("生成推荐失败:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLearningPath = async () => {
    setIsGenerating(true)
    try {
      const prompt = `为${childAge}岁的${childName}制定3个月的学习路径规划。考虑：
      1. 当前发展阶段的关键能力
      2. 兴趣特点和学习偏好
      3. 能力提升的循序渐进性
      4. 学习与休息的平衡

      请提供阶段性学习计划，每个阶段包含目标、推荐课程和时长。`

      await sendMessage(prompt)

      // 模拟学习路径数据
      const mockLearningPath: LearningPath[] = [
        {
          phase: "第一阶段：基础建立",
          description: "建立学习兴趣，培养基础能力",
          courses: [
            {
              id: "phase1-1",
              title: "专注力训练",
              description: "通过游戏提升注意力持续时间",
              category: "能力基础",
              difficulty: "入门",
              duration: "2周",
              tags: ["专注力", "基础能力"]
            },
            {
              id: "phase1-2",
              title: "观察力培养",
              description: "学习仔细观察，发现事物特征",
              category: "认知发展",
              difficulty: "入门",
              duration: "2周",
              tags: ["观察", "认知", "细节"]
            }
          ],
          duration: "4周",
          goals: ["提升专注力至15分钟以上", "培养观察能力", "建立学习兴趣"]
        },
        {
          phase: "第二阶段：能力提升",
          description: "在基础上发展专项能力",
          courses: [
            {
              id: "phase2-1",
              title: "逻辑思维入门",
              description: "学习简单的分类、排序和推理",
              category: "思维训练",
              difficulty: "基础",
              duration: "3周",
              tags: ["逻辑", "思维", "推理"]
            },
            {
              id: "phase2-2",
              title: "创意表达",
              description: "通过绘画、手工等形式表达想法",
              category: "创意发展",
              difficulty: "基础",
              duration: "3周",
              tags: ["创意", "表达", "艺术"]
            }
          ],
          duration: "6周",
          goals: ["掌握基础逻辑思维", "发展创意表达能力", "增强学习自信心"]
        },
        {
          phase: "第三阶段：综合发展",
          description: "综合运用各项能力，拓展视野",
          courses: [
            {
              id: "phase3-1",
              title: "项目制学习",
              description: "完成小项目，综合运用所学能力",
              category: "综合应用",
              difficulty: "适中",
              duration: "2周",
              tags: ["项目", "综合", "应用"]
            }
          ],
          duration: "2周",
          goals: ["能够独立完成简单项目", "具备基础学习自理能力", "为下一阶段学习做准备"]
        }
      ]

      setLearningPath(mockLearningPath)
    } catch (error) {
      console.error("生成学习路径失败:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleChatMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage
    setCurrentMessage("")

    setChatMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsGenerating(true)

    try {
      const prompt = `关于${childName}(${childAge}岁)的课程学习问题：${userMessage}

      请作为专业的教育顾问，提供个性化的建议和指导。考虑孩子的年龄特点、发展需求和个体差异。`

      await sendMessage(prompt)
    } catch (error) {
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "抱歉，我现在无法回答这个问题。请稍后再试，或者联系专业的教育顾问。"
      }])
    } finally {
      setIsGenerating(false)
    }
  }

  const quickQuestions = [
    "这个年龄段适合什么课程？",
    "如何培养学习兴趣？",
    "专注力不够怎么办？",
    "怎样选择合适难度？"
  ]

  const getRecommendationIcon = (type: string) => {
    const icons: Record<string, string> = {
      personality: "ri-heart-line",
      developmental: "ri-brain-line",
      interest: "ri-star-line"
    }
    return icons[type] || "ri-book-line"
  }

  const getRecommendationColor = (type: string) => {
    const colors: Record<string, string> = {
      personality: "text-pink-500 bg-pink-50",
      developmental: "text-blue-500 bg-blue-50",
      interest: "text-purple-500 bg-purple-50"
    }
    return colors[type] || "text-green-500 bg-green-50"
  }

  const tabs = [
    { id: "recommendations", label: "智能推荐", icon: "ri-magic-line" },
    { id: "learning-path", label: "学习路径", icon: "ri-road-map-line" },
    { id: "consultation", label: "咨询顾问", icon: "ri-customer-service-2-line" }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
          >
            {/* 标题栏 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-graduation-cap-fill text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI课程推荐师</h2>
                  <p className="text-sm text-white/80">为{childName}定制个性化学习方案</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            {/* 标签页 */}
            <div className="flex border-b border-gray-100">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "recommendations" | "learning-path" | "consultation")}
                  className={`flex-1 px-4 py-3 font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <i className={`${tab.icon} mr-2`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "recommendations" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">个性化课程推荐</h3>
                    <p className="text-gray-600">基于{childName}的年龄特点和发展需求定制</p>
                  </div>

                  {/* 推荐类型卡片 */}
                  <div className="space-y-4">
                    {Object.entries(recommendations).map(([type, courses]) => (
                      <div key={type} className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getRecommendationColor(type)}`}>
                            <i className={getRecommendationIcon(type)} />
                          </div>
                          <h4 className="font-bold text-gray-800">
                            {type === 'personality' ? '性格发展' :
                             type === 'developmental' ? '能力提升' : '兴趣探索'}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {courses.map(course => (
                            <motion.div
                              key={course.id}
                              className="bg-white rounded-xl p-3 border border-gray-200"
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <h5 className="font-medium text-gray-800 mb-1">{course.title}</h5>
                              <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {course.difficulty}
                                </span>
                                <span className="text-gray-500">{course.duration}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "learning-path" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">个性化学习路径</h3>
                    <p className="text-gray-600">循序渐进的能力发展计划</p>
                  </div>

                  <div className="space-y-6">
                    {learningPath.map((phase, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-2xl p-5"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800">{phase.phase}</h4>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {phase.duration}
                          </span>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">学习目标</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {phase.goals.map((goal, goalIndex) => (
                              <div key={goalIndex} className="flex items-center gap-2 text-sm text-gray-600">
                                <i className="ri-checkbox-circle-fill text-green-500" />
                                {goal}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">推荐课程</h5>
                          <div className="space-y-2">
                            {phase.courses.map(course => (
                              <div key={course.id} className="bg-gray-50 rounded-xl p-3">
                                <div className="flex justify-between items-start mb-1">
                                  <h6 className="font-medium text-gray-800">{course.title}</h6>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {course.duration}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{course.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "consultation" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[500px] flex flex-col"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">教育咨询顾问</h3>
                    <p className="text-gray-600">专业解答您的教育问题</p>
                  </div>

                  {/* 聊天区域 */}
                  <div className="flex-1 bg-gray-50 rounded-2xl p-4 overflow-y-auto mb-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <i className="ri-customer-service-2-line text-4xl mb-2" />
                        <p>有什么教育问题想要咨询吗？</p>
                      </div>
                    )}

                    {chatMessages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                      >
                        <div className={`inline-block max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-800'
                        }`}>
                          {message.content}
                        </div>
                      </motion.div>
                    ))}

                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left mb-4"
                      >
                        <div className="inline-block bg-white border border-gray-200 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <i className="ri-loader-4-line text-blue-500" />
                            </motion.div>
                            <span className="text-gray-600">正在思考...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* 快捷问题 */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMessage(question)}
                        className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-xl hover:bg-blue-100 transition"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  {/* 输入框 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleChatMessage()}
                      placeholder="请输入您的问题..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isGenerating}
                    />
                    <button
                      onClick={handleChatMessage}
                      disabled={!currentMessage.trim() || isGenerating}
                      className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-send-plane-fill" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}