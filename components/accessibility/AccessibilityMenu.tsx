/**
 * @file AccessibilityMenu.tsx
 * @description YYC³ AI小语智能成长守护系统可访问性快速菜单组件，提供快速访问可访问性设置的功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessibility } from '@/hooks/useAccessibility'

export default function AccessibilityMenu() {
  const {
    settings,
    updateSetting: _updateSetting,
    toggleHighContrast,
    toggleReducedMotion,
    toggleScreenReader,
    increaseFontSize,
    decreaseFontSize
  } = useAccessibility()

  const [isOpen, setIsOpen] = useState(false)

  if (!settings.showFocus && !settings.screenReaderEnabled) return null

  return (
    <>
      {/* 快速操作按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="a11y-quick-actions"
        aria-label="可访问性快速设置"
        aria-expanded={isOpen}
        title="可访问性设置 (Alt+A)"
      >
        <i className="ri-settings-3-line text-xl" />
      </button>

      {/* 快速设置面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4 w-80 z-50"
            role="menu"
            aria-label="可访问性快速设置"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                ♿ 快速设置
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="关闭快速设置"
              >
                <i className="ri-close-line text-gray-500" />
              </button>
            </div>

            {/* 快速操作 */}
            <div className="grid grid-cols-2 gap-3">
              {/* 字体大小 */}
              <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700">
                  字体大小
                </label>
                <div className="flex gap-1">
                  <button
                    onClick={decreaseFontSize}
                    className="flex-1 p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    aria-label="减小字体"
                  >
                    <i className="ri-font-size-2 text-sm" />
                  </button>
                  <button
                    onClick={increaseFontSize}
                    className="flex-1 p-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    aria-label="增大字体"
                  >
                    <i className="ri-font-size text-sm" />
                  </button>
                </div>
                <div className="text-xs text-center text-gray-500">
                  {settings.fontSize === 'small' && '小'}
                  {settings.fontSize === 'medium' && '中'}
                  {settings.fontSize === 'large' && '大'}
                  {settings.fontSize === 'extra-large' && '特大'}
                </div>
              </div>

              {/* 高对比度 */}
              <button
                onClick={toggleHighContrast}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.highContrast
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
                aria-pressed={settings.highContrast}
              >
                <div className="flex flex-col items-center gap-1">
                  <i className="ri-contrast-2-line text-lg" />
                  <span className="text-xs font-medium">高对比度</span>
                </div>
              </button>

              {/* 减少动画 */}
              <button
                onClick={toggleReducedMotion}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.reducedMotion
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
                aria-pressed={settings.reducedMotion}
              >
                <div className="flex flex-col items-center gap-1">
                  <i className="ri-pause-circle-line text-lg" />
                  <span className="text-xs font-medium">减少动画</span>
                </div>
              </button>

              {/* 屏幕阅读器 */}
              <button
                onClick={toggleScreenReader}
                className={`p-3 rounded-lg border-2 transition-all ${
                  settings.screenReaderEnabled
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white border-gray-300 hover:border-blue-300'
                }`}
                aria-pressed={settings.screenReaderEnabled}
              >
                <div className="flex flex-col items-center gap-1">
                  <i className="ri-volume-up-line text-lg" />
                  <span className="text-xs font-medium">屏幕阅读器</span>
                </div>
              </button>
            </div>

            {/* 更多设置链接 */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('open-accessibility-panel'))
                  setIsOpen(false)
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <i className="ri-settings-line mr-2" />
                打开完整设置
              </button>
            </div>

            {/* 快捷键提示 */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div>🎯 快捷键：</div>
                <div>Alt+1 导航 | Alt+2 内容 | Alt+3 搜索</div>
                <div>Alt+A 可访问性设置 | Esc 关闭</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 遮罩层 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}