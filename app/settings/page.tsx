"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import Navigation from "@/components/Navigation"
import PageHeader from "@/components/headers/PageHeader"
import UserCenter from "@/components/auth/UserCenter"
import { useAuth } from "@/hooks/useAuth"
import { useChildrenMock } from "@/hooks/useChildren-mock"
import { characterManager } from "@/lib/character-manager"
import { 
  GlobalSettingsItem, 
  GlobalSettingsSection,
  GlobalFunctionButton,
  GlobalFunctionSwitch
} from "@/lib/ui/global-ui-components"

export default function SettingsPage() {
  const [eyeMode, setEyeMode] = useState(true)
  const [reminder, setReminder] = useState(false)
  const { user, logout } = useAuth()
  const { currentChild } = useChildrenMock()

  const handleSignOut = async () => {
    await logout()
  }

  const handleEditProfile = () => {
    // TODO: 实现编辑资料功能
    console.log("编辑资料")
  }

  const handleViewParentCode = () => {
    // TODO: 实现查看家长授权码功能
    console.log("查看家长授权码")
  }

  const handleFAQ = () => {
    // TODO: 实现常见问题功能
    console.log("常见问题")
  }

  const handleContactUs = () => {
    // TODO: 实现联系我们功能
    console.log("联系我们")
  }

  const handleLogin = () => {
    // TODO: 实现登录功能
    console.log("登录")
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-sky-100">
      <PageHeader icon="ri-settings-4-fill" title="设置与管理" />

      <main className="flex-1 overflow-y-auto w-full">
        <section className="max-w-5xl mx-auto w-full px-8 pb-28 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="col-span-1 md:col-span-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-6 shadow-soft text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {currentChild ? (
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                      <img 
                        src={characterManager.getCharacterImagePath(characterManager.getCharacterForUser(currentChild), 'happy')} 
                        alt={currentChild.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {user ? `${user.firstName || ""}${user.lastName || ""}`.charAt(0) || user.email?.charAt(0) || "U" : "?"}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email?.split("@")[0] : "未登录"}</h3>
                    <p className="text-white/80 text-sm">{user ? user.email : "登录后享受完整功能"}</p>
                  </div>
                </div>
                <UserCenter />
              </div>

              {user && (
                <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">128</p>
                    <p className="text-white/70 text-xs">学习天数</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">56</p>
                    <p className="text-white/70 text-xs">完成任务</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-white/70 text-xs">成长徽章</p>
                  </div>
                </div>
              )}
            </motion.div>
          </section>

          {/* 账户与安全 */}
          <GlobalSettingsSection 
            title="账户与安全" 
            icon="ri-user-settings-fill" 
            iconColor="text-blue-500"
          >
            <GlobalSettingsItem
              icon="ri-account-circle-fill"
              iconColor="text-blue-400"
              title="修改资料/昵称"
              subtitle={user ? `当前昵称：${user.firstName || ""} ${user.lastName || ""}`.trim() || "未设置" : "请先登录"}
              hasArrow
              action={
                <GlobalFunctionButton
                  variant="outline"
                  size="sm"
                  enabled={true}
                  onClick={handleEditProfile}
                >
                  编辑
                </GlobalFunctionButton>
              }
            />
            <GlobalSettingsItem
              icon="ri-shield-fill"
              iconColor="text-green-400"
              title="家长授权码"
              subtitle="用于家长端绑定和管理"
              action={
                <GlobalFunctionButton
                  variant="outline"
                  size="sm"
                  enabled={true}
                  onClick={handleViewParentCode}
                >
                  查看
                </GlobalFunctionButton>
              }
            />
          </GlobalSettingsSection>

          {/* 学习偏好 */}
          <GlobalSettingsSection 
            title="学习偏好" 
            icon="ri-book-mark-fill" 
            iconColor="text-purple-500"
          >
            <GlobalSettingsItem
              icon="ri-eye-fill"
              iconColor="text-purple-400"
              title="护眼模式"
              subtitle="开启后界面将调整为暖色"
              action={
                <GlobalFunctionSwitch 
                  checked={eyeMode} 
                  enabled={true}
                  onCheckedChange={setEyeMode}
                />
              }
            />
            <GlobalSettingsItem
              icon="ri-notification-3-fill"
              iconColor="text-pink-400"
              title="学习进度提醒"
              subtitle="每天发送一次作业提醒"
              action={
                <GlobalFunctionSwitch 
                  checked={reminder} 
                  enabled={true}
                  onCheckedChange={setReminder}
                />
              }
            />
          </GlobalSettingsSection>

          {/* 家长与帮助 */}
          <section className="col-span-1 md:col-span-2">
            <motion.h2
              className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <i className="ri-parent-fill text-orange-500" />
              家长与帮助
            </motion.h2>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <GlobalFunctionButton
                variant="outline"
                size="lg"
                className="flex flex-col items-center p-4 h-auto"
                enabled={true}
                onClick={handleFAQ}
              >
                <i className="ri-question-mark-circle-fill text-3xl text-yellow-500 mb-1" />
                <p className="font-bold text-slate-800">常见问题 (FAQ)</p>
              </GlobalFunctionButton>
              <GlobalFunctionButton
                variant="outline"
                size="lg"
                className="flex flex-col items-center p-4 h-auto"
                enabled={true}
                onClick={handleContactUs}
              >
                <i className="ri-customer-service-2-fill text-3xl text-green-500 mb-1" />
                <p className="font-bold text-slate-800">联系我们</p>
              </GlobalFunctionButton>
              {user ? (
                <GlobalFunctionButton
                  variant="outline"
                  size="lg"
                  className="flex flex-col items-center p-4 h-auto border-red-200 bg-red-50 hover:bg-red-100"
                  enabled={true}
                  onClick={handleSignOut}
                >
                  <i className="ri-logout-box-r-fill text-3xl text-red-600 mb-1" />
                  <p className="font-bold text-red-600">退出登录</p>
                </GlobalFunctionButton>
              ) : (
                <GlobalFunctionButton
                  variant="outline"
                  size="lg"
                  className="flex flex-col items-center p-4 h-auto border-blue-200 bg-blue-50 hover:bg-blue-100"
                  enabled={true}
                  onClick={handleLogin}
                >
                  <i className="ri-login-box-line text-3xl text-blue-600 mb-1" />
                  <p className="font-bold text-blue-600">登录账号</p>
                </GlobalFunctionButton>
              )}
            </motion.div>
          </section>
        </section>
      </main>

      <Navigation />
    </div>
  )
}
