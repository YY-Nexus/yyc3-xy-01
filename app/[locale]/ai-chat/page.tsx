"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { Message, AIRole } from "@/types/common"
import { motion } from "framer-motion"
// import { useTranslations } from "@/lib/next-intl-stub"
import Link from "next/link"
import VoiceInteraction from "@/components/VoiceInteraction"

let messageIdCounter = Date.now()

const generateMessageId = (): number => {
  return ++messageIdCounter
}

const contextualResponses = {
  recorder: [
    "我已经为您记录了这个重要信息。建议您定期更新宝宝的发育数据，这样我可以更好地追踪成长趋势。",
    "好的，记录完成！根据您的描述，建议您关注宝宝当前发育阶段的里程碑指标。",
    "信息已保存。记住，持续的记录对了解宝宝的成长轨迹非常重要。"
  ],
  guardian: [
    "从安全守护的角度，我建议您确保宝宝活动区域的安全防护措施到位。",
    "宝宝的健康和安全是我们的首要关注。请确保定期体检和疫苗接种按时进行。",
    "作为守护员，我提醒您关注宝宝的睡眠环境安全，避免柔软的床上用品。"
  ],
  listener: [
    "我能理解您作为家长的担忧。每个孩子都有自己的成长节奏，您的耐心和爱心是最好的支持。",
    "听起来您很关心宝宝的成长。请记住，您是一位很棒的家长，您的付出宝宝都能感受到。",
    "您的感受很重要。育儿路上有困惑是正常的，我在这里随时支持您。"
  ],
  advisor: [
    "基于最新的育儿研究，我建议您多进行亲子阅读和互动游戏，这对宝宝的大脑发育很有益。",
    "从专业角度，建议您建立规律的作息时间，这对宝宝的成长发育很重要。",
    "根据您的描述，我推荐您增加和宝宝的眼神交流，这有助于建立安全依恋关系。"
  ],
  cultural: [
    "音乐启蒙可以从简单的儿歌开始，这有助于宝宝的语言发展和节奏感培养。",
    "建议您每天花些时间和宝宝一起看图画书，培养早期的阅读兴趣。",
    "传统文化启蒙可以通过唐诗宋词的简单朗读开始，宝宝会很喜欢语言的美感。"
  ],
  all: [
    "综合来看，宝宝的成长需要我们全方位的关注。建议您平衡好健康、情感、智力等各方面的发展。",
    "作为您的AI助手，我整合了五大角色的建议。请记住，科学育儿需要耐心和持续的努力。",
    "从多个维度分析，您现在的育儿方式是合适的。继续保持，并根据宝宝的成长阶段适时调整。"
  ]
}

const greetingResponses = {
  recorder: "您好！我是记录员AI，专门帮助您记录和追踪宝宝的成长数据。",
  guardian: "您好！我是守护员AI，关注宝宝的健康和安全。",
  listener: "您好！我是倾听师AI，在这里倾听您的心声。",
  advisor: "您好！我是顾问AI，为您提供专业的育儿建议。",
  cultural: "您好！我是文化导师AI，专注于宝宝的文化启蒙。",
  all: "您好！我是小语AI助手，整合五大AI角色为您服务。有什么可以帮助您的吗？"
}

const generateAIResponse = (message: string, role: string, aiRoles: AIRole[]): Message => {
  const lowerMessage = message.toLowerCase()

  const createResponse = (role: string, content: string): Message => {
    const foundRole = aiRoles.find(r => r.id === role)
    return {
      id: generateMessageId(),
      role: "assistant",
      content: content,
      avatar: role === "all" ? "🤖" : (foundRole?.avatar || "🤖"),
      name: role === "all" ? "小语AI助手" : (foundRole?.name || "小语AI助手"),
      timestamp: generateMessageId()
    }
  }

  if (lowerMessage.includes('你好') || lowerMessage.includes('嗨') || lowerMessage.includes('hi')) {
    return createResponse(role, greetingResponses[role as keyof typeof greetingResponses] || greetingResponses.all)
  }

  if (lowerMessage.includes('哭') || lowerMessage.includes('闹') || lowerMessage.includes('不安')) {
    return createResponse(role, contextualResponses.listener[1])
  }

  if (lowerMessage.includes('睡觉') || lowerMessage.includes('睡眠')) {
    return createResponse(role, contextualResponses.advisor[1])
  }

  if (lowerMessage.includes('吃饭') || lowerMessage.includes('辅食')) {
    return createResponse(role, contextualResponses.advisor[2])
  }

  if (lowerMessage.includes('发育') || lowerMessage.includes('成长')) {
    return createResponse(role, contextualResponses.recorder[1])
  }

  if (lowerMessage.includes('安全') || lowerMessage.includes('危险')) {
    return createResponse(role, contextualResponses.guardian[0])
  }

  if (lowerMessage.includes('学习') || lowerMessage.includes('教育') || lowerMessage.includes('启蒙')) {
    return createResponse(role, contextualResponses.cultural[0])
  }

  const roleResponses = contextualResponses[role as keyof typeof contextualResponses] || contextualResponses.all
  const responseIndex = Math.floor((Date.now() / 1000) % roleResponses.length)
  return createResponse(role, roleResponses[responseIndex])
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>(() => {
    // 从localStorage加载消息历史
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yyc3-ai-chat-messages')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved messages:', e)
        }
      }
    }
    return [
      {
        id: 1,
        role: "assistant",
        content: "你好！我是小语的AI守护助手，我是五大AI角色的集合体。我可以帮助您记录成长、分析情绪、提供专业育儿建议。请问您想了解什么？",
        avatar: "🤖",
        name: "小语AI助手",
        timestamp: Date.now()
      }
    ]
  })
  const [inputMessage, setInputMessage] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState("")

  const aiRoles: AIRole[] = useMemo(() => [
    {
      id: "all",
      name: "全部角色",
      description: "综合五大AI角色的智能对话",
      avatar: "🤖",
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "recorder",
      name: "记录员",
      description: "专业记录成长数据和重要时刻",
      avatar: "📝",
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "guardian",
      name: "守护员",
      description: "智能守护健康和安全",
      avatar: "🛡️",
      color: "bg-green-100 text-green-600"
    },
    {
      id: "listener",
      name: "倾听师",
      description: "情感倾听和心理支持",
      avatar: "👂",
      color: "bg-pink-100 text-pink-600"
    },
    {
      id: "advisor",
      name: "顾问",
      description: "专业育儿建议和指导",
      avatar: "🎓",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      id: "cultural",
      name: "文化导师",
      description: "文化启蒙和素质培养",
      avatar: "📚",
      color: "bg-indigo-100 text-indigo-600"
    }
  ], [])

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: generateMessageId(),
      role: "user",
      content: inputMessage,
      avatar: "👨‍👧",
      name: "家长",
      timestamp: generateMessageId()
    }

    setMessages((prev: Message[]) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const delay = 800 + (generateMessageId() % 400)
      setTimeout(() => {
        const aiResponse = generateAIResponse(inputMessage, selectedRole, aiRoles)
        setMessages((prev: Message[]) => [...prev, aiResponse])
        setIsLoading(false)
      }, delay)
    } catch (error) {
      console.error('AI响应生成失败:', error)
      const fallbackResponse: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: "抱歉，我现在遇到了一些技术问题。请稍后再试，或者刷新页面重试。",
        avatar: "🤖",
        name: "小语AI助手",
        timestamp: generateMessageId()
      }
      setMessages((prev: Message[]) => [...prev, fallbackResponse])
      setIsLoading(false)
    }
  }, [inputMessage, selectedRole, aiRoles])

  const clearChatHistory = () => {
    const initialMessage: Message = {
      id: 1,
      role: "assistant",
      content: "聊天记录已清空。我是小语的AI守护助手，有什么可以帮助您的吗？",
      avatar: "🤖",
      name: "小语AI助手",
      timestamp: Date.now()
    }
    setMessages([initialMessage])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('yyc3-ai-chat-messages')
    }
  }

  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript)
  }

  const handleEmotionDetected = (emotion: string) => {
    setCurrentEmotion(emotion)
    console.log("检测到情感:", emotion)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 1) {
      localStorage.setItem('yyc3-ai-chat-messages', JSON.stringify(messages))
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-sky-50">
      {/* 简化版头部 */}
      <header className="bg-white shadow-sm border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  YYC³ AI小语
                </h1>
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                首页
              </Link>
              <Link href="/ai-chat" className="text-blue-600 font-medium">
                AI对话
              </Link>
              <Link href="/growth" className="text-gray-700 hover:text-blue-600">
                成长记录
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600">
                课程学习
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：AI角色选择 */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-bold mb-4">选择AI角色</h2>
              <div className="space-y-3">
                {aiRoles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role.id
                        ? role.color
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{role.avatar}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{role.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 右侧：对话区域 */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col"
            >
              {/* 对话头部 */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {selectedRole === "all" ? "🤖" : aiRoles.find(r => r.id === selectedRole)?.avatar}
                    </span>
                    <div>
                      <h2 className="font-bold">
                        {selectedRole === "all" ? "小语AI助手" : aiRoles.find(r => r.id === selectedRole)?.name}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {selectedRole === "all" ? "综合五大AI角色" : aiRoles.find(r => r.id === selectedRole)?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">在线</span>
                    </div>
                    <motion.button
                      onClick={clearChatHistory}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors flex items-center gap-1"
                      title="清空聊天记录"
                    >
                      <i className="ri-delete-bin-line" />
                      清空
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message: Message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${
                      message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                    }`}>
                      <div className="text-2xl shrink-0">
                        {message.avatar}
                      </div>
                      <div>
                        <div className={`rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {message.role === "user" ? "您" : message.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-3 max-w-[80%]">
                      <div className="text-2xl">🤖</div>
                      <div className="bg-gray-100 rounded-lg px-4 py-3">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 输入区域 */}
              <div className="border-t border-gray-200 p-4">
                {/* 语音交互区域 */}
                <div className="mb-4">
                  <VoiceInteraction
                    onTranscript={handleVoiceTranscript}
                    onEmotionDetected={handleEmotionDetected}
                    className="p-4 bg-gray-50 rounded-lg"
                  />
                </div>

                {/* 文本输入区域 */}
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="请输入您想了解的内容...（或使用语音输入）"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    发送
                  </motion.button>
                </div>

                {/* 情感状态显示 */}
                {currentEmotion && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-center"
                  >
                    <span className="text-sm text-gray-600">
                      检测到情感状态:
                    </span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      currentEmotion === "happy" ? "bg-yellow-100 text-yellow-700" :
                      currentEmotion === "sad" ? "bg-blue-100 text-blue-700" :
                      currentEmotion === "excited" ? "bg-red-100 text-red-700" :
                      currentEmotion === "calm" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {currentEmotion === "happy" ? "😊 开心" :
                       currentEmotion === "sad" ? "😢 难过" :
                       currentEmotion === "excited" ? "🎉 兴奋" :
                       currentEmotion === "calm" ? "😌 平静" :
                       "😐 平静"}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 快速建议 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold mb-4">💡 快速建议</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "如何记录宝宝的发育数据？",
              "宝宝哭闹时应该如何安抚？",
              "什么时候开始添加辅食？",
              "如何进行早期启蒙教育？",
              "宝宝的睡眠问题怎么解决？",
              "疫苗接种时间表是什么？",
              "如何培养宝宝的语言能力？",
              "亲子阅读有哪些推荐？"
            ].map((suggestion, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setInputMessage(suggestion)}
                className="p-3 bg-sky-50 hover:bg-sky-100 rounded-lg text-left transition-colors"
              >
                <p className="text-sm text-gray-700">{suggestion}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* 简化版页脚 */}
      <footer className="bg-white border-t border-sky-100 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 YYC³ AI小语 - 为爱而生，用心守护</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
