/**
 * @file ChildSelector.tsx
 * @description YYC³ AI小语智能成长守护系统儿童选择器组件，提供儿童切换和管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from 'framer-motion'
import Link from "next/link"
import { useChildren } from "@/hooks/useChildren"
import type { Child } from "@/lib/db/client"

interface ChildSelectorProps {
  onSelect?: (child: Child) => void
  className?: string
}

const ChildSelector: React.FC<ChildSelectorProps> = ({ onSelect, className = "" }) => {
  const { children, currentChild, setCurrentChild, isLoading } = useChildren()
  const [isOpen, setIsOpen] = useState(false)

  const handleChildSelect = (child: Child) => {
    setCurrentChild(child)
    onSelect?.(child)
    setIsOpen(false)
  }

  // 只在客户端渲染时显示加载状态，避免水合不匹配
  if (isLoading) {
    return <div className={`h-10 bg-slate-100 rounded-lg animate-pulse ${className}`} />
  }

  if (children.length === 0) {
    return (
      <Link
        href="/children"
        className={`flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition ${className}`}
      >
        <i className="ri-add-circle-line" />
        添加孩子
      </Link>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-slate-100 hover:border-blue-200 transition"
      >
        {currentChild ? (
          <>
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
              {currentChild.name.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-700">{currentChild.name}</span>
          </>
        ) : (
          <span className="text-sm text-slate-400">选择孩子</span>
        )}
        <i className={`ri-arrow-down-s-line text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => handleChildSelect(child)}
                className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition ${currentChild?.id === child.id ? "bg-blue-50" : ""}`}
              >
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                  {child.name.charAt(0)}
                </div>
                <span className="text-sm text-slate-700">{child.name}</span>
                {currentChild?.id === child.id && <i className="ri-check-line text-blue-500 ml-auto" />}
              </button>
            ))}

            <div className="border-t border-slate-100">
              <Link
                href="/children"
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 transition text-sm"
              >
                <i className="ri-settings-3-line" />
                管理档案
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChildSelector
