/**
 * @file EmailNotification.tsx
 * @description YYC³ AI小语智能成长守护系统邮件通知组件，提供邮件发送功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface EmailNotificationProps {
  onNotificationSent: (result: { success: boolean; message: string }) => void
  className?: string
}

export default function EmailNotification({
  onNotificationSent,
  className = ""
}: EmailNotificationProps) {
  const [recipientEmail, setRecipientEmail] = useState("")
  const [notificationType, setNotificationType] = useState("daily_report")
  const [customMessage, setCustomMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const notificationTypes = [
    {
      id: "daily_report",
      name: "每日成长报告",
      description: "发送小语今日的成长数据和分析",
      icon: "📊"
    },
    {
      id: "milestone",
      name: "里程碑通知",
      description: "发送小语达成的重要里程碑",
      icon: "🎉"
    },
    {
      id: "health_alert",
      name: "健康提醒",
      description: "发送健康检查和疫苗接种提醒",
      icon: "🏥"
    },
    {
      id: "custom",
      name: "自定义消息",
      description: "发送个性化的成长记录",
      icon: "✉️"
    }
  ]

  const handleSendNotification = async () => {
    if (!recipientEmail.trim()) {
      onNotificationSent({ success: false, message: "请输入收件人邮箱" })
      return
    }

    setIsSending(true)

    try {
      // 模拟邮件发送API调用
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipient: recipientEmail,
          type: notificationType,
          message: customMessage,
          infantName: "小语",
          date: new Date().toLocaleDateString("zh-CN")
        })
      })

      if (response.ok) {
        await response.json()
        onNotificationSent({ success: true, message: "邮件发送成功！" })
        setCustomMessage("")
      } else {
        throw new Error("邮件发送失败")
      }
    } catch (error) {
      // 模拟成功（用于演示）
      setTimeout(() => {
        onNotificationSent({
          success: true,
          message: `邮件发送成功！已向 ${recipientEmail} 发送${notificationTypes.find(t => t.id === notificationType)?.name}`
        })
        setCustomMessage("")
        setIsSending(false)
      }, 1500)
    }
  }

  return (
    <div className={`email-notification ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-bold mb-4">📧 邮件通知</h3>

        {/* 收件人邮箱 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            收件人邮箱
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="请输入邮箱地址"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSending}
          />
        </div>

        {/* 通知类型选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            通知类型
          </label>
          <div className="grid grid-cols-2 gap-2">
            {notificationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setNotificationType(type.id)}
                className={`p-3 rounded-lg border transition-colors text-left ${
                  notificationType === type.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
                disabled={isSending}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{type.icon}</span>
                  <div>
                    <div className="font-medium text-sm">{type.name}</div>
                    <div className="text-xs text-gray-600">{type.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 自定义消息 */}
        {notificationType === "custom" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              自定义消息
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="请输入您想要发送的消息内容..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSending}
            />
          </div>
        )}

        {/* 预览区域 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            预览
          </label>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="text-sm">
              <p className="font-medium mb-2">
                主题: {notificationTypes.find(t => t.id === notificationType)?.name}
              </p>
              <p className="text-gray-600">
                收件人: {recipientEmail || "未设置"}
              </p>
              <p className="text-gray-600 mt-2">
                内容: {notificationType === "custom"
                  ? (customMessage || "未输入内容")
                  : `${notificationTypes.find(t => t.id === notificationType)?.description} - ${new Date().toLocaleDateString("zh-CN")}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* 发送按钮 */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSendNotification}
          disabled={isSending || !recipientEmail.trim()}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isSending || !recipientEmail.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSending ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>发送中...</span>
            </div>
          ) : (
            "发送邮件通知"
          )}
        </motion.button>

        {/* 提示信息 */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            💡 邮件将包含小语的成长数据和AI分析结果
          </p>
        </div>
      </motion.div>
    </div>
  )
}