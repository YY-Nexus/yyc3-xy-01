/**
 * @file PageHeader.tsx
 * @description YYC³ AI小语智能成长守护系统页面头部组件，提供页面标题和操作按钮
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import type React from "react"

import { motion } from "framer-motion"

interface PageHeaderProps {
  icon?: string
  title: string
  subtitle?: string
  showBack?: boolean
  actions?: Array<{ icon: string; label: string; onClick?: () => void }>
  children?: React.ReactNode
}

export default function PageHeader({ icon, title, subtitle, showBack, actions, children }: PageHeaderProps) {
  return (
    <motion.header
      className="w-full px-8 py-4 flex items-center justify-between z-20"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button className="text-blue-500 hover:text-blue-600 transition-colors">
            <i className="fas fa-arrow-left" />
          </button>
        )}
        {icon && <i className={`${icon} text-blue-500`} />}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-600 text-sm">{subtitle}</p>}
        </div>
      </div>

      {actions && (
        <div className="flex gap-4">
          {actions.map((action, index) => (
            <motion.button
              key={index}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm hover:bg-blue-50 transition text-slate-600"
              onClick={action.onClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={`${action.icon} text-lg`} />
              <span className="text-sm font-bold">{action.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {children}
    </motion.header>
  )
}
