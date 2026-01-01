"use client"

import { useState } from "react"
import { motion } from "framer-motion"
// import { useTranslations } from "@/lib/next-intl-stub"
import Link from "next/link"
import EmailNotification from "@/components/EmailNotification"

export default function GrowthPage() {
  const [isClient, setIsClient] = useState(false)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [notificationMessage, setNotificationMessage] = useState("")
  const [showNotification, setShowNotification] = useState(false)
  const [growthRecords] = useState([
    {
      id: 1,
      date: "2024-12-04",
      type: "physical",
      title: "身高体重测量",
      value: "身高 65cm, 体重 7.2kg",
      description: "今天测量了身高体重，比上个月增长了2cm，体重增加了500g",
      milestone: true,
      avatar: "📏"
    },
    {
      id: 2,
      date: "2024-12-03",
      type: "cognitive",
      title: "第一次叫妈妈",
      value: "语言发展",
      description: "今天小语清晰地叫出了\"妈妈\"，这是语言发展的重要里程碑",
      milestone: true,
      avatar: "🗣️"
    },
    {
      id: 3,
      date: "2024-12-02",
      type: "emotional",
      title: "情绪表达",
      value: "开心互动",
      description: "小语今天特别开心，会对着镜子里的自己笑，还会主动要抱抱",
      milestone: false,
      avatar: "😊"
    },
    {
      id: 4,
      date: "2024-12-01",
      type: "behavioral",
      title: "翻身练习",
      value: "运动能力",
      description: "练习翻身，已经能够从仰卧翻到俯卧，控制力越来越好",
      milestone: false,
      avatar: "🤸"
    }
  ])

  useState(() => {
    setIsClient(true)
  })

  // 处理邮件通知结果
  const handleNotificationSent = (result: { success: boolean; message: string }) => {
    setNotificationMessage(result.message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 3000)
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载成长记录...</p>
        </div>
      </div>
    )
  }

  const recordTypes = [
    { id: "overview", name: "总览", icon: "📊", color: "bg-blue-100 text-blue-600" },
    { id: "physical", name: "身体发育", icon: "📏", color: "bg-green-100 text-green-600" },
    { id: "cognitive", name: "认知发展", icon: "🧠", color: "bg-purple-100 text-purple-600" },
    { id: "emotional", name: "情感社交", icon: "❤️", color: "bg-pink-100 text-pink-600" },
    { id: "behavioral", name: "行为能力", icon: "🎯", color: "bg-yellow-100 text-yellow-600" }
  ]

  const growthStats = [
    { label: "当前月龄", value: "8个月", icon: "📅", color: "bg-blue-50" },
    { label: "身高", value: "65cm", icon: "📏", color: "bg-green-50" },
    { label: "体重", value: "7.2kg", icon: "⚖️", color: "bg-purple-50" },
    { label: "发育水平", value: "正常", icon: "✅", color: "bg-pink-50" }
  ]

  const milestones = [
    { title: "第一次微笑", age: "2个月", achieved: true, date: "2024-06-04" },
    { title: "抬头稳定", age: "3个月", achieved: true, date: "2024-07-04" },
    { title: "翻身", age: "6个月", achieved: true, date: "2024-10-04" },
    { title: "独坐", age: "7个月", achieved: true, date: "2024-11-04" },
    { title: "爬行", age: "8个月", achieved: false, date: "-" },
    { title: "叫妈妈", age: "8个月", achieved: true, date: "2024-12-03" },
    { title: "站立", age: "10个月", achieved: false, date: "-" },
    { title: "走路", age: "12个月", achieved: false, date: "-" }
  ]

  const filteredRecords = selectedTab === "overview"
    ? growthRecords
    : growthRecords.filter(record => record.type === selectedTab)

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
              <Link href="/ai-chat" className="text-gray-700 hover:text-blue-600">
                AI对话
              </Link>
              <Link href="/growth" className="text-blue-600 font-medium">
                成长记录
              </Link>
              <Link href="/courses" className="text-gray-700 hover:text-blue-600">
                课程学习
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 通知提示 */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span>{notificationMessage}</span>
          </div>
        </motion.div>
      )}

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">小语的成长记录</h1>
          <p className="text-gray-600">记录每一个珍贵的成长瞬间，见证小语的美好变化</p>
        </motion.div>

        {/* 成长统计 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {growthStats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className={`${stat.color} rounded-xl p-6 text-center`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：分类标签 */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-bold mb-4">记录分类</h2>
              <div className="space-y-2">
                {recordTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedTab(type.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTab === type.id
                        ? type.color
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{type.icon}</span>
                      <span className="font-medium">{type.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 里程碑进度 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h2 className="text-lg font-bold mb-4">发育里程碑</h2>
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        milestone.achieved ? "bg-green-500" : "bg-gray-300"
                      }`}></div>
                      <span className="text-sm font-medium">{milestone.title}</span>
                    </div>
                    <div className="text-xs text-gray-600">{milestone.age}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">完成进度</span>
                  <span className="text-blue-600">75%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
            </motion.div>

            {/* 邮件通知 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <EmailNotification
                onNotificationSent={handleNotificationSent}
              />
            </motion.div>
          </div>

          {/* 右侧：成长记录列表 */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">
                  {recordTypes.find(t => t.id === selectedTab)?.name}记录
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + 添加记录
                </motion.button>
              </div>

              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{record.avatar}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{record.title}</h3>
                            {record.milestone && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                里程碑
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{record.date}</span>
                            <span>{record.value}</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✏️
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 成长图表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-bold mb-6">成长曲线</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 身高曲线 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">身高发育曲线</h3>
              <div className="h-64 bg-linear-to-t from-blue-50 to-white rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📈</div>
                  <p>身高曲线图表</p>
                  <p className="text-sm">正常发育范围内</p>
                </div>
              </div>
            </div>

            {/* 体重曲线 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium mb-4">体重发育曲线</h3>
              <div className="h-64 bg-linear-to-t from-green-50 to-white rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📊</div>
                  <p>体重曲线图表</p>
                  <p className="text-sm">稳步增长中</p>
                </div>
              </div>
            </div>
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
