/**
 * @file SkipLinks.tsx
 * @description YYC³ AI小语智能成长守护系统跳转链接组件，提供键盘导航和屏幕阅读器支持功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useAccessibility } from '@/hooks/useAccessibility'

export default function SkipLinks() {
  const { settings } = useAccessibility()

  if (!settings.skipLinks) return null

  return (
    <>
      {/* 跳转到主导航 */}
      <a
        href="#main-navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        跳转到导航菜单
      </a>

      {/* 跳转到主要内容 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 bg-blue-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        跳转到主要内容
      </a>

      {/* 跳转到搜索 */}
      <a
        href="#search-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-48 bg-blue-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        跳转到搜索
      </a>

      {/* 跳转到页脚 */}
      <a
        href="#footer"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:right-4 bg-blue-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        跳转到页脚
      </a>

      {/* 可访问性设置快捷方式 */}
      <button
        onClick={() => document.dispatchEvent(new CustomEvent('open-accessibility-panel'))}
        className="sr-only focus:not-sr-only focus:absolute focus:bottom-4 focus:left-4 bg-purple-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        可访问性设置 (Alt+A)
      </button>
    </>
  )
}