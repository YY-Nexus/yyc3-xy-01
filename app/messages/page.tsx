"use client"

import { motion } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"

interface Message {
  id: string
  type: "homework" | "system" | "activity"
  icon: string
  iconColor: string
  title: string
  content: string
  time: string
  unread: boolean
  bgColor?: string
}

const messagesData: Message[] = [
  {
    id: "msg-1",
    type: "homework",
    icon: "ri-check-double-fill",
    iconColor: "text-yellow-500",
    title: "语文作业 [古诗词背诵] 已批改！",
    content: "本次作业完成度高，老师点赞你的朗读表现！",
    time: "10分钟前",
    unread: true,
    bgColor: "bg-macaron-yellow border-l-4 border-yellow-400",
  },
  {
    id: "msg-2",
    type: "homework",
    icon: "ri-edit-2-fill",
    iconColor: "text-blue-400",
    title: "数学作业 [口算题] 待完善",
    content: "有 2 题计算错误，请在错题本中查看并重做。",
    time: "昨天",
    unread: false,
  },
  {
    id: "msg-3",
    type: "system",
    icon: "ri-sun-fill",
    iconColor: "text-purple-500",
    title: "学习提醒：今天是你学习天数第 30 天！",
    content: "恭喜你达成成就！保持习惯，继续加油！",
    time: "1小时前",
    unread: true,
    bgColor: "bg-macaron-purple border-l-4 border-purple-400",
  },
  {
    id: "msg-4",
    type: "activity",
    icon: "ri-group-fill",
    iconColor: "text-green-400",
    title: "公益活动：故事伴读计划已成功启动！",
    content: "感谢你的参与，你的录音已成功被采纳！",
    time: "3天前",
    unread: false,
  },
]

export default function MessagesPage() {
  const homeworkMessages = messagesData.filter((m) => m.type === "homework")
  const systemMessages = messagesData.filter((m) => m.type === "system")
  const activityMessages = messagesData.filter((m) => m.type === "activity")

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-sky-100">
      <PageHeader
        icon="ri-message-3-fill"
        title="消息中心"
        actions={[{ icon: "ri-mail-open-line", label: "全部标为已读" }]}
      />

      <main className="flex-1 overflow-y-auto w-full">
        <section className="max-w-4xl mx-auto w-full px-8 pb-28 pt-4">
          {/* 作业反馈 */}
          <MessageSection
            title="作业反馈"
            icon="ri-medal-fill"
            iconColor="text-yellow-500"
            unreadCount={homeworkMessages.filter((m) => m.unread).length}
            messages={homeworkMessages}
          />

          {/* 系统通知 */}
          <MessageSection
            title="系统通知"
            icon="ri-notification-3-fill"
            iconColor="text-purple-500"
            unreadCount={systemMessages.filter((m) => m.unread).length}
            messages={systemMessages}
          />

          {/* 活动通知 */}
          <MessageSection
            title="活动通知"
            icon="ri-plant-fill"
            iconColor="text-green-500"
            unreadCount={activityMessages.filter((m) => m.unread).length}
            messages={activityMessages}
          />
        </section>
      </main>

      <Navigation />
    </div>
  )
}

function MessageSection({
  title,
  icon,
  iconColor,
  unreadCount,
  messages,
}: {
  title: string
  icon: string
  iconColor: string
  unreadCount: number
  messages: Message[]
}) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2">
        <i className={`${icon} ${iconColor}`} />
        {title} ({unreadCount} 条未读)
      </h2>

      <div className="space-y-4">
        {messages.map((message, index) => (
          <MessageCard key={message.id} message={message} index={index} />
        ))}
      </div>
    </section>
  )
}

function MessageCard({ message, index }: { message: Message; index: number }) {
  return (
    <motion.article
      className={`rounded-3xl p-5 shadow-soft hover:shadow-lg transition-all cursor-pointer flex items-start gap-4 ${
        message.unread ? message.bgColor : "bg-white opacity-80"
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: message.unread ? 1 : 0.8, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.01, x: 5 }}
    >
      <i className={`${message.icon} ${message.iconColor} text-3xl mt-1`} />
      <div className="flex-1">
        <h4 className="text-lg font-bold">{message.title}</h4>
        <p className={`text-sm mt-1 ${message.unread ? "text-slate-600" : "text-slate-500"}`}>{message.content}</p>
      </div>
      <span className="text-xs text-slate-500 mt-1 flex items-center gap-1 whitespace-nowrap">
        <i className="ri-time-line" /> {message.time}
      </span>
    </motion.article>
  )
}
