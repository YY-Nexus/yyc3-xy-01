/**
 * @file PageHeader.tsx
 * @description YYC³ AI小语智能成长守护系统页面头部组件，提供页面标题和导航功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BackButton } from "@/components/ui/BackButton"

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: React.ReactNode
  className?: string
  icon?: string
}

export default function PageHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  className = "",
  icon,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack && (
            <BackButton
              onClick={() => router.back()}
              className="-ml-2"
              variant="minimal"
            />
          )}
          {icon && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white colored-shadow-border">
              <i className={`${icon} text-lg`} />
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
        </div>

        {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
      </div>
    </motion.header>
  )
}
