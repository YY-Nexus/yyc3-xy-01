/**
 * @file HomeHeader.tsx
 * @description YYC³ AI小语智能成长守护系统首页头部组件，提供首页导航和用户信息展示
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function HomeHeader() {
  const [time, setTime] = useState("08:30")
  const [date, setDate] = useState("11月24日 星期五")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }))
      setDate(
        now.toLocaleDateString("zh-CN", {
          month: "long",
          day: "numeric",
          weekday: "long",
        }),
      )
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <motion.header
      className="w-full px-8 py-4 flex items-center justify-between z-20"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-6">
        <div className="text-right">
          <motion.div
            className="text-3xl font-bold text-slate-700 font-rounded tracking-widest"
            key={time}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {time}
          </motion.div>
          <div className="text-sm text-slate-500 font-medium">{date}</div>
        </div>

        <motion.div
          className="flex items-center gap-2 bg-white/60 px-4 py-2 backdrop-blur-sm rounded-md"
          whileHover={{ scale: 1.05 }}
        >
          <motion.i
            className="ri-sun-fill text-yellow-400 text-2xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <span className="text-lg font-bold text-slate-600">23°C</span>
          <span className="text-xs text-slate-400">适宜户外</span>
        </motion.div>
      </div>

      <div className="flex gap-3 items-center">
        {/* 登录/注册按钮 */}
        <div className="flex gap-2">
          <Link href="/auth/login">
            <motion.button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              登录
            </motion.button>
          </Link>
          <Link href="/auth/register">
            <motion.button
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              注册
            </motion.button>
          </Link>
        </div>

        <QuickActionButton
          href="/growth"
          icon="ri-calendar-check-fill"
          iconColor="text-blue-400"
          label="学习打卡"
          hoverColor="hover:bg-blue-50"
        />
        <QuickActionButton
          href="/activities"
          icon="ri-heart-3-fill"
          iconColor="text-red-400"
          label="公益活动"
          hoverColor="hover:bg-red-50"
        />
        <QuickActionButton
          href="/settings"
          icon="ri-parent-fill"
          iconColor="text-yellow-500"
          label="家长须知"
          hoverColor="hover:bg-yellow-50"
        />
      </div>
    </motion.header>
  )
}

function QuickActionButton({
  href,
  icon,
  iconColor,
  label,
  hoverColor,
}: {
  href: string
  icon: string
  iconColor: string
  label: string
  hoverColor: string
}) {
  return (
    <Link href={href}>
      <motion.button
        className={`flex items-center gap-2 bg-white px-4 py-2 shadow-sm transition cursor-pointer text-slate-600 rounded-md ${hoverColor}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className={`${icon} ${iconColor}`} />
        <span className="text-sm font-black">{label}</span>
      </motion.button>
    </Link>
  )
}
