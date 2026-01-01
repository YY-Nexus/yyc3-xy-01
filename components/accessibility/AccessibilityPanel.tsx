/**
 * @file AccessibilityPanel.tsx
 * @description YYC³ AI小语智能成长守护系统可访问性设置面板组件，提供可访问性配置和报告生成功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccessibility } from '@/hooks/useAccessibility'

interface AccessibilityReport {
  totalFeatures: number
  activeFeatures: number
  enabledFeatures: string[]
  fontSize: string
  timestamp: string
}

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const { settings, updateSetting, resetSettings, generateAccessibilityReport } = useAccessibility()
  const [report, setReport] = useState<AccessibilityReport | null>(null)
  const [showReport, setShowReport] = useState(false)

  // 监听键盘事件
  useEffect(() => {
    const handleKeyPress = (event: CustomEvent) => {
      if (event.type === 'open-accessibility-panel') {
        // 面板已通过父组件打开
      }
    }

    document.addEventListener('open-accessibility-panel', handleKeyPress as EventListener)
    return () => {
      document.removeEventListener('open-accessibility-panel', handleKeyPress as EventListener)
    }
  }, [])

  const generateReport = () => {
    const accessibilityReport = generateAccessibilityReport()
    setReport(accessibilityReport)
    setShowReport(true)
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩层 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* 设置面板 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-50"
        role="dialog"
        aria-labelledby="accessibility-title"
        aria-modal="true"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="accessibility-title" className="text-2xl font-bold text-gray-800 mb-2">
              🔧 可访问性设置
            </h2>
            <p className="text-gray-600">
              根据您的需求调整界面显示和交互方式
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="关闭可访问性设置面板"
          >
            <i className="ri-close-line text-xl text-gray-500" />
          </button>
        </div>

        {/* 设置分类 */}
        <div className="space-y-6">
          {/* 视觉设置 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="ri-eye-line text-blue-500" />
              视觉辅助
            </h3>

            <div className="space-y-4">
              {/* 字体大小 */}
              <div className="flex items-center justify-between">
                <label htmlFor="font-size" className="text-gray-700 font-medium">
                  字体大小
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const sizes: Array<'small' | 'medium' | 'large' | 'extra-large'> = ['small', 'medium', 'large', 'extra-large']
                      const currentIndex = sizes.indexOf(settings.fontSize)
                      const prevIndex = Math.max(currentIndex - 1, 0)
                      updateSetting('fontSize', sizes[prevIndex])
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="减小字体"
                  >
                    <i className="ri-font-size-2 text-gray-600" />
                  </button>
                  <select
                    id="font-size"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', e.target.value as 'small' | 'medium' | 'large' | 'extra-large')}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                    <option value="extra-large">特大</option>
                  </select>
                  <button
                    onClick={() => {
                      const sizes: Array<'small' | 'medium' | 'large' | 'extra-large'> = ['small', 'medium', 'large', 'extra-large']
                      const currentIndex = sizes.indexOf(settings.fontSize)
                      const nextIndex = Math.min(currentIndex + 1, sizes.length - 1)
                      updateSetting('fontSize', sizes[nextIndex])
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="增大字体"
                  >
                    <i className="ri-font-size text-gray-600" />
                  </button>
                </div>
              </div>

              {/* 高对比度 */}
              <div className="flex items-center justify-between">
                <label htmlFor="high-contrast" className="text-gray-700 font-medium">
                  高对比度模式
                </label>
                <button
                  id="high-contrast"
                  role="switch"
                  aria-checked={settings.highContrast}
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.highContrast ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.highContrast ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 增加间距 */}
              <div className="flex items-center justify-between">
                <label htmlFor="increased-spacing" className="text-gray-700 font-medium">
                  增加元素间距
                </label>
                <button
                  id="increased-spacing"
                  role="switch"
                  aria-checked={settings.increasedSpacing}
                  onClick={() => updateSetting('increasedSpacing', !settings.increasedSpacing)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.increasedSpacing ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.increasedSpacing ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 下划线链接 */}
              <div className="flex items-center justify-between">
                <label htmlFor="underline-links" className="text-gray-700 font-medium">
                  显示链接下划线
                </label>
                <button
                  id="underline-links"
                  role="switch"
                  aria-checked={settings.underlineLinks}
                  onClick={() => updateSetting('underlineLinks', !settings.underlineLinks)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.underlineLinks ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.underlineLinks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 减少动画 */}
              <div className="flex items-center justify-between">
                <label htmlFor="reduced-motion" className="text-gray-700 font-medium">
                  减少动画效果
                </label>
                <button
                  id="reduced-motion"
                  role="switch"
                  aria-checked={settings.reducedMotion}
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.reducedMotion ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* 交互设置 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="ri-cursor-line text-green-500" />
              交互方式
            </h3>

            <div className="space-y-4">
              {/* 屏幕阅读器 */}
              <div className="flex items-center justify-between">
                <label htmlFor="screen-reader" className="text-gray-700 font-medium">
                  屏幕阅读器支持
                </label>
                <button
                  id="screen-reader"
                  role="switch"
                  aria-checked={settings.screenReaderEnabled}
                  onClick={() => updateSetting('screenReaderEnabled', !settings.screenReaderEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.screenReaderEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.screenReaderEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 键盘导航 */}
              <div className="flex items-center justify-between">
                <label htmlFor="keyboard-nav" className="text-gray-700 font-medium">
                  键盘导航增强
                </label>
                <button
                  id="keyboard-nav"
                  role="switch"
                  aria-checked={settings.keyboardNavigation}
                  onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.keyboardNavigation ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 跳转链接 */}
              <div className="flex items-center justify-between">
                <label htmlFor="skip-links" className="text-gray-700 font-medium">
                  显示跳转链接
                </label>
                <button
                  id="skip-links"
                  role="switch"
                  aria-checked={settings.skipLinks}
                  onClick={() => updateSetting('skipLinks', !settings.skipLinks)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.skipLinks ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.skipLinks ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* 认知辅助 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <i className="ri-brain-line text-purple-500" />
              认知辅助
            </h3>

            <div className="space-y-4">
              {/* 简单语言 */}
              <div className="flex items-center justify-between">
                <label htmlFor="simple-language" className="text-gray-700 font-medium">
                  简单语言模式
                </label>
                <button
                  id="simple-language"
                  role="switch"
                  aria-checked={settings.simpleLanguage}
                  onClick={() => updateSetting('simpleLanguage', !settings.simpleLanguage)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.simpleLanguage ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.simpleLanguage ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 显示描述 */}
              <div className="flex items-center justify-between">
                <label htmlFor="show-descriptions" className="text-gray-700 font-medium">
                  显示详细描述
                </label>
                <button
                  id="show-descriptions"
                  role="switch"
                  aria-checked={settings.showDescriptions}
                  onClick={() => updateSetting('showDescriptions', !settings.showDescriptions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showDescriptions ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showDescriptions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* 操作按钮 */}
          <section className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="ri-file-chart-line mr-2" />
                生成可访问性报告
              </button>
              <button
                onClick={resetSettings}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <i className="ri-refresh-line mr-2" />
                重置所有设置
              </button>
            </div>
          </section>
        </div>

        {/* 可访问性报告 */}
        <AnimatePresence>
          {showReport && report && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg"
            >
              <h4 className="font-semibold text-blue-800 mb-2">📊 可访问性报告</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p>🎯 启用功能：{report.enabledFeatures.length}/{report.totalFeatures}</p>
                <p>📝 当前字体大小：{report.fontSize}</p>
                <p>🔧 启用的功能：{report.enabledFeatures.join('、')}</p>
                <p>📅 生成时间：{new Date(report.timestamp).toLocaleString('zh-CN')}</p>
              </div>
              <button
                onClick={() => setShowReport(false)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                关闭报告
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}