/**
 * @file AccessibilityWrapper.tsx
 * @description YYC³ AI小语智能成长守护系统可访问性包装器组件，提供全局可访问性功能支持
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel'

interface AccessibilityWrapperProps {
  children: React.ReactNode
}

export default function AccessibilityWrapper({ children }: AccessibilityWrapperProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  // 监听打开面板事件
  useEffect(() => {
    const handleOpenPanel = () => setIsPanelOpen(true)

    document.addEventListener('open-accessibility-panel', handleOpenPanel)

    return () => {
      document.removeEventListener('open-accessibility-panel', handleOpenPanel)
    }
  }, [])

  return (
    <>
      {children}
      <AccessibilityPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  )
}