/**
 * @file LoginModal.tsx
 * @description 登录模态框组件，提供用户登录界面
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [localError, setLocalError] = useState<string | null>(null)

  const { login, register, isLoading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    try {
      if (mode === "login") {
        await login(email, password)
        onSuccess?.()
        onClose()
      } else if (mode === "register") {
        if (password !== confirmPassword) {
          setLocalError("两次输入的密码不一致")
          return
        }
        if (password.length < 6) {
          setLocalError("密码长度至少6位")
          return
        }
        await register({ email, password, firstName: name, lastName: "" })
        onSuccess?.()
        onClose()
      } else {
        setLocalError("重置密码功能暂未开放")
      }
    } catch {
      // 错误已在useAuth中处理
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setName("")
    setConfirmPassword("")
    setLocalError(null)
  }

  const switchMode = (newMode: "login" | "register" | "reset") => {
    setMode(newMode)
    resetForm()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold">
                  {mode === "login" ? "欢迎回来" : mode === "register" ? "创建账号" : "重置密码"}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                  <i className="ri-close-line text-xl" />
                </button>
              </div>
              <p className="text-white/80 text-sm">
                {mode === "login"
                  ? "登录YYC³ AI小语，陪伴孩子成长"
                  : mode === "register"
                    ? "加入我们，开启智能成长守护之旅"
                    : "输入邮箱，我们将发送重置链接"}
              </p>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 错误提示 */}
              {(error || localError) && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    localError?.includes("已发送") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  <i className={`${localError?.includes("已发送") ? "ri-check-line" : "ri-error-warning-line"} mr-2`} />
                  {error || localError}
                </div>
              )}

              {/* 姓名（仅注册） */}
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">姓名</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱地址"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 密码（登录和注册） */}
              {mode !== "reset" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* 确认密码（仅注册） */}
              {mode === "register" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">确认密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              {/* 忘记密码链接 */}
              {mode === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    忘记密码？
                  </button>
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    处理中...
                  </>
                ) : mode === "login" ? (
                  "登录"
                ) : mode === "register" ? (
                  "注册"
                ) : (
                  "发送重置链接"
                )}
              </button>

              {/* 切换模式 */}
              <div className="text-center text-sm text-slate-500">
                {mode === "login" ? (
                  <>
                    还没有账号？
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                      className="text-blue-500 hover:text-blue-600 ml-1"
                    >
                      立即注册
                    </button>
                  </>
                ) : (
                  <>
                    已有账号？
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-blue-500 hover:text-blue-600 ml-1"
                    >
                      立即登录
                    </button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
