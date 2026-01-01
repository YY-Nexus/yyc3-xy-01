'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// 生日主题配置接口
interface BirthdayTheme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
  fonts: {
    heading: string
    body: string
    decorative: string
  }
  animations: {
    enabled: boolean
    duration: {
      fast: number
      normal: number
      slow: number
    }
  }
  decorations: {
    balloons: boolean
    confetti: boolean
    sparkles: boolean
    ribbons: boolean
  }
  sound: {
    enabled: boolean
    volume: number
  }
}

// 默认生日主题配置
const defaultBirthdayTheme: BirthdayTheme = {
  colors: {
    primary: '#EC4899',      // 粉色
    secondary: '#A855F7',   // 紫色
    accent: '#F59E0B',      // 金色
    background: 'linear-gradient(135deg, #FCE7F3 0%, #F3E8FF 25%, #FEF3C7 100%)',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280'
  },
  fonts: {
    heading: 'system-ui, -apple-system, sans-serif',
    body: 'system-ui, -apple-system, sans-serif',
    decorative: 'Comic Sans MS, cursive, sans-serif'
  },
  animations: {
    enabled: true,
    duration: {
      fast: 200,
      normal: 400,
      slow: 600
    }
  },
  decorations: {
    balloons: true,
    confetti: true,
    sparkles: true,
    ribbons: true
  },
  sound: {
    enabled: true,
    volume: 0.6
  }
}

// 主题上下文
interface BirthdayThemeContextType {
  theme: BirthdayTheme
  isActive: boolean
  activate: () => void
  deactivate: () => void
  updateTheme: (updates: Partial<BirthdayTheme>) => void
  toggleDecorations: (decoration: keyof BirthdayTheme['decorations']) => void
  decorations: BirthdayTheme['decorations']
  sound: BirthdayTheme['sound']
}

const BirthdayThemeContext = createContext<BirthdayThemeContextType | undefined>(undefined)

export function BirthdayThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<BirthdayTheme>(defaultBirthdayTheme)
  const [isActive, setIsActive] = useState(false)

  // 激活生日主题
  const activate = () => {
    setIsActive(true)
    applyThemeToDocument()
    // 添加生日主题CSS类
    document.documentElement.classList.add('birthday-theme')
  }

  // 停用生日主题
  const deactivate = () => {
    setIsActive(false)
    // 移除生日主题CSS类
    document.documentElement.classList.remove('birthday-theme')
    removeThemeFromDocument()
  }

  // 更新主题
  const updateTheme = (updates: Partial<BirthdayTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }))
    if (isActive) {
      applyThemeToDocument()
    }
  }

  // 切换装饰元素
  const toggleDecorations = (decoration: keyof BirthdayTheme['decorations']) => {
    updateTheme({
      decorations: {
        ...theme.decorations,
        [decoration]: !theme.decorations[decoration]
      }
    })
  }

  // 应用主题到文档
  const applyThemeToDocument = () => {
    const root = document.documentElement
    root.style.setProperty('--birthday-primary', theme.colors.primary)
    root.style.setProperty('--birthday-secondary', theme.colors.secondary)
    root.style.setProperty('--birthday-accent', theme.colors.accent)
    root.style.setProperty('--birthday-background', theme.colors.background)
    root.style.setProperty('--birthday-surface', theme.colors.surface)
    root.style.setProperty('--birthday-text', theme.colors.text)
    root.style.setProperty('--birthday-text-secondary', theme.colors.textSecondary)

    root.style.setProperty('--birthday-font-heading', theme.fonts.heading)
    root.style.setProperty('--birthday-font-body', theme.fonts.body)
    root.style.setProperty('--birthday-font-decorative', theme.fonts.decorative)
  }

  // 移除主题
  const removeThemeFromDocument = () => {
    const root = document.documentElement
    const cssVars = [
      '--birthday-primary', '--birthday-secondary', '--birthday-accent',
      '--birthday-background', '--birthday-surface', '--birthday-text',
      '--birthday-text-secondary', '--birthday-font-heading',
      '--birthday-font-body', '--birthday-font-decorative'
    ]
    cssVars.forEach(cssVar => root.style.removeProperty(cssVar))
  }

  useEffect(() => {
    // 检查是否应该自动激活生日主题（比如在小语生日前后）
    const checkAutoActivate = () => {
      const today = new Date()
      const birthday = new Date('2025-12-27') // 小语生日
      const daysDiff = Math.floor((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // 在生日前后7天内自动激活
      if (daysDiff >= -7 && daysDiff <= 7) {
        activate()
      }
    }

    checkAutoActivate()
  }, [])

  return (
    <BirthdayThemeContext.Provider value={{
      theme,
      isActive,
      activate,
      deactivate,
      updateTheme,
      toggleDecorations,
      decorations: theme.decorations,
      sound: theme.sound
    }}>
      {children}
    </BirthdayThemeContext.Provider>
  )
}

// 使用生日主题的Hook
export function useBirthdayTheme() {
  const context = useContext(BirthdayThemeContext)
  if (context === undefined) {
    throw new Error('useBirthdayTheme must be used within a BirthdayThemeProvider')
  }
  return context
}