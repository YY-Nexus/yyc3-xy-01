/**
 * @file CharacterThemeContext.tsx
 * @description YYC³ AI小语智能成长守护系统UI角色主题上下文组件，提供角色主题管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { characterManager, type CharacterConfig, type ThemeColors } from '@/lib/character-manager'
import { Child } from '@prisma/client'

// 状态接口定义
interface CharacterThemeState {
  currentCharacter: CharacterConfig | null
  selectedTheme: string
  selectedExpression: string
  themeColors: ThemeColors | null
  isAutoSwitchEnabled: boolean
  customizations: {
    brightness: number
    saturation: number
    contrast: number
  }
}

// 动作类型定义
type CharacterThemeAction =
  | { type: 'SET_CHARACTER'; payload: CharacterConfig }
  | { type: 'SET_THEME'; payload: string }
  | { type: 'SET_EXPRESSION'; payload: string }
  | { type: 'TOGGLE_AUTO_SWITCH' }
  | { type: 'UPDATE_CUSTOMIZATION'; payload: Partial<CharacterThemeState['customizations']> }
  | { type: 'RESET_THEME' }

// 初始状态
const initialState: CharacterThemeState = {
  currentCharacter: null,
  selectedTheme: '',
  selectedExpression: '',
  themeColors: null,
  isAutoSwitchEnabled: true,
  customizations: {
    brightness: 100,
    saturation: 100,
    contrast: 100
  }
}

// Reducer 函数
function characterThemeReducer(
  state: CharacterThemeState,
  action: CharacterThemeAction
): CharacterThemeState {
  switch (action.type) {
    case 'SET_CHARACTER':
      const newCharacter = action.payload
      const defaultTheme = newCharacter.themes[0]?.name || ''
      const themeColors = characterManager.getCharacterThemeColors(newCharacter, defaultTheme)

      return {
        ...state,
        currentCharacter: newCharacter,
        selectedTheme: defaultTheme,
        themeColors,
        selectedExpression: ''
      }

    case 'SET_THEME':
      if (!state.currentCharacter) return state

      const newThemeColors = characterManager.getCharacterThemeColors(
        state.currentCharacter,
        action.payload
      )

      return {
        ...state,
        selectedTheme: action.payload,
        themeColors: newThemeColors
      }

    case 'SET_EXPRESSION':
      return {
        ...state,
        selectedExpression: action.payload
      }

    case 'TOGGLE_AUTO_SWITCH':
      return {
        ...state,
        isAutoSwitchEnabled: !state.isAutoSwitchEnabled
      }

    case 'UPDATE_CUSTOMIZATION':
      return {
        ...state,
        customizations: {
          ...state.customizations,
          ...action.payload
        }
      }

    case 'RESET_THEME':
      if (!state.currentCharacter) return state

      const defaultThemeColors = characterManager.getCharacterThemeColors(state.currentCharacter)

      return {
        ...state,
        selectedTheme: state.currentCharacter.themes[0]?.name || '',
        themeColors: defaultThemeColors,
        selectedExpression: '',
        customizations: {
          brightness: 100,
          saturation: 100,
          contrast: 100
        }
      }

    default:
      return state
  }
}

// Context 创建
const CharacterThemeContext = createContext<{
  state: CharacterThemeState
  dispatch: React.Dispatch<CharacterThemeAction>
  updateCharacter: (child?: Child | null) => void
  setTheme: (themeName: string) => void
  setExpression: (expressionName: string) => void
  getCSSVariables: () => Record<string, string>
  resetTheme: () => void
} | null>(null)

// Provider 组件
interface CharacterThemeProviderProps {
  children: ReactNode
  child?: Child | null
}

export const CharacterThemeProvider: React.FC<CharacterThemeProviderProps> = ({
  children,
  child
}) => {
  const [state, dispatch] = useReducer(characterThemeReducer, initialState)

  // 根据用户信息更新角色
  const updateCharacter = (child?: Child | null) => {
    const character = characterManager.getCharacterForUser(child)
    dispatch({ type: 'SET_CHARACTER', payload: character })
  }

  // 设置主题
  const setTheme = (themeName: string) => {
    dispatch({ type: 'SET_THEME', payload: themeName })
  }

  // 设置表情
  const setExpression = (expressionName: string) => {
    dispatch({ type: 'SET_EXPRESSION', payload: expressionName })
  }

  // 重置主题
  const resetTheme = () => {
    dispatch({ type: 'RESET_THEME' })
  }

  // 生成 CSS 变量
  const getCSSVariables = (): Record<string, string> => {
    if (!state.themeColors) return {}

    const { brightness, saturation, contrast } = state.customizations

    return {
      '--character-primary': state.themeColors.primary,
      '--character-secondary': state.themeColors.secondary,
      '--character-accent': state.themeColors.accent,
      '--character-background': state.themeColors.background,
      '--character-text': state.themeColors.text,
      '--character-border': state.themeColors.border,
      '--character-glow': state.themeColors.glow,
      '--character-gradient': state.themeColors.gradient,
      '--character-brightness': `${brightness}%`,
      '--character-saturation': `${saturation}%`,
      '--character-contrast': `${contrast}%`
    }
  }

  // 初始化角色
  useEffect(() => {
    updateCharacter(child)
  }, [child])

  // 应用 CSS 变量到根元素
  useEffect(() => {
    const root = document.documentElement
    const cssVars = getCSSVariables()

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })

    // 清理函数
    return () => {
      Object.keys(cssVars).forEach(key => {
        root.style.removeProperty(key)
      })
    }
  }, [state.themeColors, state.customizations])

  const contextValue = {
    state,
    dispatch,
    updateCharacter,
    setTheme,
    setExpression,
    getCSSVariables,
    resetTheme
  }

  return (
    <CharacterThemeContext.Provider value={contextValue}>
      {children}
    </CharacterThemeContext.Provider>
  )
}

// Hook 用于使用 Context
export const useCharacterTheme = () => {
  const context = useContext(CharacterThemeContext)
  if (!context) {
    throw new Error('useCharacterTheme must be used within a CharacterThemeProvider')
  }
  return context
}

// 便捷 Hook
export const useCharacter = () => {
  const { state } = useCharacterTheme()
  return state.currentCharacter
}

export const useThemeColors = () => {
  const { state } = useCharacterTheme()
  return state.themeColors
}

export const useSelectedTheme = () => {
  const { state } = useCharacterTheme()
  return state.selectedTheme
}

export const useSelectedExpression = () => {
  const { state } = useCharacterTheme()
  return state.selectedExpression
}