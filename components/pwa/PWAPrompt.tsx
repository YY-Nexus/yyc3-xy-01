/**
 * @file PWAPrompt.tsx
 * @description YYC³ AI小语智能成长守护系统PWA安装提示组件，提供PWA安装引导和更新通知功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'

interface PWAPromptProps {
  className?: string
}

export default function PWAPrompt({ className = '' }: PWAPromptProps) {
  const {
    isSupported,
    isInstalled,
    showInstallPrompt,
    isOffline,
    swUpdateAvailable,
    installPWA,
    dismissInstallPrompt,
    applyUpdate
  } = usePWA()

  const [dismissedUpdate, setDismissedUpdate] = useState(false)

  // 如果不支持PWA或已安装，不显示提示
  if (!isSupported || isInstalled) return null

  // 如果离线且没有安装提示，显示离线提示
  if (isOffline && !showInstallPrompt) {
    return (
      <div className={`fixed bottom-4 left-4 bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-center gap-2 z-50 ${className}`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-sm text-orange-700 font-medium">离线模式</span>
        </div>
        <div className="text-xs text-orange-600">缓存内容可用</div>
      </div>
    )
  }

  return (
    <AnimatePresence>
      {swUpdateAvailable && !dismissedUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-sm z-50 ${className}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <i className="ri-refresh-line text-white text-sm" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                应用更新可用
              </h3>
              <p className="text-xs text-blue-600 mb-3">
                新版本已准备就绪，点击更新获取最新功能。
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={applyUpdate}
                  className="px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                  立即更新
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDismissedUpdate(true)}
                  className="px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  稍后更新
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {showInstallPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-4 right-4 bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-4 max-w-xs z-50 ${className}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <i className="ri-download-line text-white text-lg" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800 mb-1">
                安装YYC³ AI小语
              </h3>
              <p className="text-xs text-gray-600 mb-3">
                安装到桌面，获得更好的使用体验！
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={installPWA}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium rounded-md hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  安装
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={dismissInstallPrompt}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors"
                >
                  暂不
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 离线指示器组件
export function OfflineIndicator() {
  const { isOffline } = usePWA()

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="fixed top-4 left-4 bg-orange-100 border border-orange-300 rounded-lg px-3 py-2 flex items-center gap-2 z-40"
        >
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          <span className="text-sm text-orange-700 font-medium">离线模式</span>
          <div className="text-xs text-orange-500">·</div>
          <span className="text-xs text-orange-600">缓存可用</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}