/**
 * @file UserCenter.tsx
 * @description YYC³ AI小语智能成长守护系统用户中心组件，提供用户信息管理和登录功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import LoginModal from "./LoginModal"

export default function UserCenter() {
  const { user, isLoading, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : ""

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full">
        <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
        <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <motion.button
          onClick={() => setShowLoginModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <i className="ri-user-add-line" />
          登录/注册
        </motion.button>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </>
    )
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white/80 rounded-full hover:bg-white transition"
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {userName.charAt(0) || user.email?.charAt(0) || "U"}
        </div>
        <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">
          {userName || user.email?.split("@")[0]}
        </span>
        <i className={`ri-arrow-down-s-line transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50"
            >
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <p className="font-medium text-slate-800">{userName || "用户"}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>

              <div className="p-2">
                <DropdownItem icon="ri-user-line" label="个人中心" href="/profile" />
                <DropdownItem icon="ri-medal-line" label="成长徽章" badge="12" />
                <DropdownItem icon="ri-history-line" label="学习记录" />
                <DropdownItem icon="ri-settings-3-line" label="账号设置" href="/settings" />
              </div>

              <div className="p-2 border-t border-slate-100">
                <button
                  onClick={async () => {
                    await logout()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition text-sm"
                >
                  <i className="ri-logout-box-r-line" />
                  退出登录
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function DropdownItem({ icon, label, badge, href }: { icon: string; label: string; badge?: string; href?: string }) {
  const router = useRouter()
  
  const handleClick = () => {
    if (href) {
      router.push(href)
    }
  }

  return (
    <button 
      onClick={handleClick}
      className="w-full flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition text-sm"
    >
      <div className="flex items-center gap-3">
        <i className={`${icon} text-slate-400`} />
        {label}
      </div>
      {badge && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">{badge}</span>}
    </button>
  )
}
