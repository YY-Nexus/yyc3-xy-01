"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"

type ActivityTab = "ongoing" | "history"

interface Activity {
  id: string
  title: string
  description: string
  icon: string
  iconBg: string
  bgColor: string
  participants?: string
  deadline?: string
  buttonColor: string
  status?: string
}

const ongoingActivities: Activity[] = [
  {
    id: "act-1",
    title: '"我的绿色小星球" 线上种植活动',
    description: "通过线上工具，模拟种植一棵树，学习环保知识。每完成一步，平台将捐赠一笔环保基金。",
    icon: "ri-plant-line",
    iconBg: "from-green-300 to-green-200",
    bgColor: "bg-macaron-green",
    participants: "已有 1,200 名同学参与",
    deadline: "仅剩 5 天",
    buttonColor: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "act-2",
    title: "为乡村小朋友录制睡前故事",
    description: "同学们可以录制自己的声音，为偏远地区的儿童送去温暖的睡前故事。让你的声音成为陪伴。",
    icon: "ri-book-read-fill",
    iconBg: "from-blue-300 to-blue-200",
    bgColor: "bg-macaron-blue",
    participants: "已有 580 份音频完成",
    deadline: "持续招募中",
    buttonColor: "bg-blue-400 hover:bg-blue-500",
  },
]

const historyActivities = [
  {
    id: "hist-1",
    title: "2024 春季图书捐赠计划",
    description: "已为 6 所乡村学校送出 1200 本图书。",
    status: "已结束 · 2024-05",
  },
  {
    id: "hist-2",
    title: '"给地球写封信" 环保征文',
    description: "收到 300+ 篇小朋友作品，评选出 30 篇优秀来信。",
    status: "已结束 · 2024-09",
  },
]

export default function ActivitiesPage() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("ongoing")

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-sky-100">
      <PageHeader
        icon="ri-heart-2-fill"
        title="公益活动中心"
        actions={[{ icon: "ri-user-heart-fill", label: "我的参与" }]}
      />

      <main className="flex-1 overflow-y-auto w-full">
        <section className="max-w-7xl mx-auto w-full px-8 pb-28 pt-4">
          {/* Tab切换 */}
          <div className="w-full bg-blue-100/50 p-1.5 rounded-full flex gap-1 mb-8 max-w-lg mx-auto">
            <motion.button
              className={`flex-1 py-2 rounded-full text-slate-600 transition-all ${
                activeTab === "ongoing" ? "bg-white shadow-sm font-bold" : "hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("ongoing")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              💚 正在进行 (2)
            </motion.button>
            <motion.button
              className={`flex-1 py-2 rounded-full text-slate-600 transition-all ${
                activeTab === "history" ? "bg-white shadow-sm font-bold" : "hover:bg-white/50"
              }`}
              onClick={() => setActiveTab("history")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              📚 历史回顾 (5)
            </motion.button>
          </div>

          {/* 活动列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeTab === "ongoing"
              ? ongoingActivities.map((activity, index) => (
                  <OngoingActivityCard key={activity.id} activity={activity} index={index} />
                ))
              : historyActivities.map((activity, index) => (
                  <HistoryActivityCard key={activity.id} activity={activity} index={index} />
                ))}
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  )
}

function OngoingActivityCard({ activity, index }: { activity: Activity; index: number }) {
  return (
    <motion.article
      className={`${activity.bgColor} rounded-3xl p-4 shadow-soft hover:shadow-lg transition-all cursor-pointer flex flex-col gap-4`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div
        className={`h-40 bg-linear-to-r ${activity.iconBg} rounded-2xl flex items-center justify-center relative overflow-hidden`}
      >
        <i className={`${activity.icon} absolute left-4 bottom-4 text-9xl text-white/50`} />
        <span className="text-xl font-bold text-slate-800 z-10">
          {activity.icon.includes("plant") ? "🌍 认领一颗小树苗" : "📖 故事伴读计划"}
        </span>
      </div>

      <div className="space-y-2">
        <h4 className="text-2xl font-bold text-slate-800">{activity.title}</h4>
        <p className="text-slate-600 text-sm">{activity.description}</p>
      </div>

      <div className="flex justify-between items-center text-sm font-medium mb-2">
        <span
          className={`flex items-center gap-1 ${activity.icon.includes("plant") ? "text-green-600" : "text-blue-600"}`}
        >
          <i className="ri-group-line" />
          {activity.participants}
        </span>
        <span
          className={`flex items-center gap-1 ${activity.icon.includes("plant") ? "text-red-500" : "text-blue-500"}`}
        >
          <i className="ri-time-line" />
          {activity.deadline}
        </span>
      </div>

      <motion.button
        className={`w-full py-3 rounded-full font-extrabold text-lg text-white transition shadow-md ${activity.buttonColor}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        {activity.icon.includes("plant") ? "立即报名并开始" : "查看详情并录制"}
      </motion.button>
    </motion.article>
  )
}

function HistoryActivityCard({ activity, index }: { activity: any; index: number }) {
  return (
    <motion.article
      className="bg-white rounded-3xl p-4 shadow-soft hover:shadow-lg transition-all cursor-pointer flex flex-col gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <h4 className="text-lg font-bold text-slate-800">{activity.title}</h4>
      <p className="text-sm text-slate-500">{activity.description}</p>
      <span className="text-xs text-slate-400">{activity.status}</span>
    </motion.article>
  )
}
