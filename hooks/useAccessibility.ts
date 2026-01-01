/**
 * @file useAccessibility.ts
 * @description YYC³ AI小语智能成长守护系统可访问性Hook，提供无障碍功能管理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * YYC³ AI小语智能成长守护系统 - 可访问性Hook
 * 第六阶段：高级特性与生产准备
 */

import { useState, useEffect, useCallback } from 'react'

interface AccessibilitySettings {
  // 屏幕阅读器支持
  screenReaderEnabled: boolean
  highContrast: boolean
  reducedMotion: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'

  // 键盘导航
  keyboardNavigation: boolean
  focusVisible: boolean
  skipLinks: boolean

  // 视觉辅助
  increasedSpacing: boolean
  underlineLinks: boolean
  showFocus: boolean

  // 语音和听觉
  soundEnabled: boolean
  visualNotifications: boolean

  // 认知辅助
  simpleLanguage: boolean
  readingGuide: boolean
  showDescriptions: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  screenReaderEnabled: false,
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  keyboardNavigation: true,
  focusVisible: true,
  skipLinks: true,
  increasedSpacing: false,
  underlineLinks: true,
  showFocus: true,
  soundEnabled: true,
  visualNotifications: true,
  simpleLanguage: false,
  readingGuide: false,
  showDescriptions: false
}

const STORAGE_KEY = 'yyc3-accessibility-settings'

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // 从本地存储加载设置
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsedSettings = JSON.parse(saved)
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings })
      }
    } catch (error) {
      console.warn('Failed to load accessibility settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 保存设置到本地存储
  const saveSettings = useCallback((newSettings: AccessibilitySettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings))
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error)
    }
  }, [])

  // 更新单个设置
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveSettings(newSettings)
  }, [settings, saveSettings])

  // 重置所有设置
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    saveSettings(DEFAULT_SETTINGS)
  }, [saveSettings])

  // 应用设置到DOM
  useEffect(() => {
    const root = document.documentElement

    // 字体大小
    const fontSizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    }
    root.style.fontSize = fontSizes[settings.fontSize]

    // 高对比度
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // 减少动画
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // 增加间距
    if (settings.increasedSpacing) {
      root.classList.add('increased-spacing')
    } else {
      root.classList.remove('increased-spacing')
    }

    // 下划线链接
    if (settings.underlineLinks) {
      root.classList.add('underline-links')
    } else {
      root.classList.remove('underline-links')
    }

    // 显示焦点
    if (settings.showFocus) {
      root.classList.add('show-focus')
    } else {
      root.classList.remove('show-focus')
    }

    // 简单语言模式
    if (settings.simpleLanguage) {
      root.classList.add('simple-language')
    } else {
      root.classList.remove('simple-language')
    }

    // 屏幕阅读器专用属性
    root.setAttribute('aria-live', settings.screenReaderEnabled ? 'polite' : 'off')

    // 语言和阅读设置
    root.lang = settings.simpleLanguage ? 'zh-CN' : 'zh-CN'

  }, [settings])

  // 检测系统偏好
  useEffect(() => {
    // 检测减少动画偏好
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motionQuery.matches) {
      updateSetting('reducedMotion', true)
    }

    // 检测高对比度偏好
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    if (contrastQuery.matches) {
      updateSetting('highContrast', true)
    }

    // 监听偏好变化
    const handleMotionChange = (e: MediaQueryListEvent) => {
      updateSetting('reducedMotion', e.matches)
    }

    const handleContrastChange = (e: MediaQueryListEvent) => {
      updateSetting('highContrast', e.matches)
    }

    motionQuery.addEventListener('change', handleMotionChange)
    contrastQuery.addEventListener('change', handleContrastChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [updateSetting])

  // 键盘导航支持
  useEffect(() => {
    if (!settings.keyboardNavigation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Tab键导航增强
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }

      // 快捷键支持
      if (event.altKey) {
        switch (event.key) {
          case '1': // Alt+1: 跳转到导航
            event.preventDefault()
            const nav = document.querySelector('nav') as HTMLElement
            nav?.focus()
            break
          case '2': // Alt+2: 跳转到主要内容
            event.preventDefault()
            const main = document.querySelector('main') as HTMLElement
            main?.focus()
            break
          case '3': // Alt+3: 跳转到搜索
            event.preventDefault()
            const search = document.querySelector('input[type="search"]') as HTMLElement
            search?.focus()
            break
          case 'a': // Alt+A: 可访问性设置
            event.preventDefault()
            // 触发可访问性设置面板
            document.dispatchEvent(new CustomEvent('open-accessibility-panel'))
            break
        }
      }

      // Escape键退出模态框
      if (event.key === 'Escape') {
        const modal = document.querySelector('[role="dialog"]') as HTMLElement
        if (modal) {
          const closeBtn = modal.querySelector('button[aria-label="关闭"]') as HTMLElement
          closeBtn?.click()
        }
      }
    }

    const handleMouseDown = () => {
      document.body.classList.remove('keyboard-navigation')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [settings.keyboardNavigation])

  // 屏幕阅读器公告
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderEnabled) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'

    document.body.appendChild(announcement)
    announcement.textContent = message

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [settings.screenReaderEnabled])

  // 生成可访问性报告
  const generateAccessibilityReport = useCallback(() => {
    const activeFeatures = Object.entries(settings)
      .filter(([_, value]) => value === true)
      .map(([key]) => {
        const labels: Record<string, string> = {
          screenReaderEnabled: '屏幕阅读器支持',
          highContrast: '高对比度模式',
          reducedMotion: '减少动画',
          keyboardNavigation: '键盘导航',
          focusVisible: '焦点可见',
          skipLinks: '跳转链接',
          increasedSpacing: '增加间距',
          underlineLinks: '链接下划线',
          showFocus: '显示焦点',
          soundEnabled: '声音提示',
          visualNotifications: '视觉通知',
          simpleLanguage: '简单语言',
          readingGuide: '阅读引导',
          showDescriptions: '显示描述'
        }
        return labels[key] || key
      })

    return {
      totalFeatures: Object.keys(settings).length,
      activeFeatures: activeFeatures.length,
      enabledFeatures: activeFeatures,
      fontSize: settings.fontSize,
      timestamp: new Date().toISOString()
    }
  }, [settings])

  return {
    // 设置
    settings,
    isLoading,

    // 方法
    updateSetting,
    resetSettings,

    // 功能
    announceToScreenReader,
    generateAccessibilityReport,

    // 便捷方法
    toggleHighContrast: () => updateSetting('highContrast', !settings.highContrast),
    toggleReducedMotion: () => updateSetting('reducedMotion', !settings.reducedMotion),
    toggleScreenReader: () => updateSetting('screenReaderEnabled', !settings.screenReaderEnabled),
    increaseFontSize: () => {
      const sizes: Array<'small' | 'medium' | 'large' | 'extra-large'> = ['small', 'medium', 'large', 'extra-large']
      const currentIndex = sizes.indexOf(settings.fontSize)
      const nextIndex = Math.min(currentIndex + 1, sizes.length - 1)
      updateSetting('fontSize', sizes[nextIndex])
    },
    decreaseFontSize: () => {
      const sizes: Array<'small' | 'medium' | 'large' | 'extra-large'> = ['small', 'medium', 'large', 'extra-large']
      const currentIndex = sizes.indexOf(settings.fontSize)
      const prevIndex = Math.max(currentIndex - 1, 0)
      updateSetting('fontSize', sizes[prevIndex])
    }
  }
}

export default useAccessibility