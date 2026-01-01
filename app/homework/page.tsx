"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"
import ChildSelector from "@/components/ChildSelector"
import { useChildren } from "@/hooks/useChildren"
import SmartHomeworkHelper from "@/components/homework/SmartHomeworkHelper"

type HomeworkStatus = "pending" | "done" | "review"

interface Homework {
  id: string
  subject: string
  title: string
  dueDate: string
  status: HomeworkStatus
  description: string
  progress?: number
}

const homeworkData: Homework[] = [
  {
    id: "hw-1",
    subject: "语文",
    title: "古诗词背诵",
    dueDate: "今天 18:00",
    status: "pending",
    description: "背诵《静夜思》并录制音频",
  },
  {
    id: "hw-2",
    subject: "数学",
    title: "口算练习",
    dueDate: "明天 09:00",
    status: "pending",
    description: "完成10道两位数加减法",
  },
  {
    id: "hw-3",
    subject: "英语",
    title: "单词拼写",
    dueDate: "昨天",
    status: "done",
    description: "记住20个新单词",
    progress: 100,
  },
]

export default function HomeworkPage() {
  const [filter, setFilter] = useState<HomeworkStatus>("pending")
  const [activeHomeworkId, setActiveHomeworkId] = useState<string | null>(null)
  const { currentChild } = useChildren()

  const filteredHomework = homeworkData.filter((hw) => hw.status === filter)

  const handleHomeworkComplete = (homeworkId: string, results: any[]) => {
    console.log(`作业 ${homeworkId} 已完成，批改结果:`, results)
    setActiveHomeworkId(null)
    // Here you would normally update the homework status in your database
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-sky-100">
      <PageHeader
        icon="ri-book-open-fill"
        title="我的作业任务"
        actions={[
          { icon: "ri-filter-2-line", label: "按学科筛选" },
          { icon: "ri-sort-asc", label: "按截止日期排序" },
        ]}
      />

      <main className="flex-1 overflow-y-auto w-full">
        <section className="max-w-7xl mx-auto w-full px-8 pb-28 pt-4">
          {currentChild && (
            <div className="mb-6 bg-white/70 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {currentChild.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{currentChild.name}的作业</h3>
                <p className="text-sm text-slate-500">
                  {(currentChild as any).age_years || 0}岁{(currentChild as any).age_months || 0}个月
                </p>
              </div>
              <ChildSelector />
            </div>
          )}

          {!currentChild && (
            <div className="mb-6 bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
              <p className="text-amber-700">请先在设置中添加孩子档案</p>
            </div>
          )}

          {/* 状态Tab */}
          <div className="w-full bg-blue-100/50 p-1.5 rounded-full flex gap-1 mb-6 max-w-lg mx-auto">
            {[
              { id: "pending", label: "待完成" },
              { id: "done", label: "已完成" },
              { id: "review", label: "待批改" },
            ].map((tab) => (
              <motion.button
                key={tab.id}
                className={`flex-1 py-2 rounded-full text-slate-600 transition-all ${
                  filter === tab.id ? "bg-white shadow-sm font-bold" : "hover:bg-white/50"
                }`}
                onClick={() => setFilter(tab.id as HomeworkStatus)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          {/* 作业列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHomework.map((hw, index) => (
              <HomeworkCard
                key={hw.id}
                homework={hw}
                index={index}
                onStartHomework={setActiveHomeworkId}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Smart Homework Helper Modal */}
      <AnimatePresence>
        {activeHomeworkId && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveHomeworkId(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">AI智能作业助手</h2>
                <button
                  onClick={() => setActiveHomeworkId(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                >
                  <i className="ri-close-line text-slate-600" />
                </button>
              </div>

              <div className="p-4">
                <SmartHomeworkHelper
                  homeworkId={activeHomeworkId}
                  subject={homeworkData.find(hw => hw.id === activeHomeworkId)?.subject || ""}
                  title={homeworkData.find(hw => hw.id === activeHomeworkId)?.title || ""}
                  onHomeworkComplete={(results) => handleHomeworkComplete(activeHomeworkId, results)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation />
    </div>
  )
}

function HomeworkCard({
  homework,
  index,
  onStartHomework
}: {
  homework: Homework;
  index: number;
  onStartHomework: (homeworkId: string) => void
}) {
  const subjectColors: { [key: string]: string } = {
    语文: "bg-yellow-100 text-yellow-700",
    数学: "bg-blue-100 text-blue-700",
    英语: "bg-green-100 text-green-700",
  }

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-bold px-3 py-1 rounded-full ${subjectColors[homework.subject] || "bg-slate-100 text-slate-700"}`}
        >
          {homework.subject}
        </span>
        <span className="text-xs text-slate-500">{homework.dueDate}</span>
      </div>

      <div>
        <h4 className="text-xl font-bold mb-2">{homework.title}</h4>
        <p className="text-slate-500 text-sm">{homework.description}</p>
      </div>

      {homework.progress !== undefined && (
        <div>
          <div className="text-sm font-medium mb-1 flex justify-between">
            <span>完成度</span>
            <span className="text-green-600">{homework.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <motion.div
              className="bg-green-500 h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${homework.progress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      )}

      <motion.button
        className={`w-full py-2 rounded-full font-bold transition ${
          homework.status === "done" ? "bg-green-100 text-green-600" : "bg-blue-400 text-white hover:bg-blue-500"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onStartHomework(homework.id)}
        disabled={homework.status === "done"}
      >
        {homework.status === "done" ? (
          <>
            <i className="ri-check-line mr-2" />
            已完成 ✓
          </>
        ) : (
          <>
            <i className="ri-robot-fill mr-2" />
            AI辅助做题
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
