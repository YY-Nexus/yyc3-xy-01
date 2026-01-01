'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCharacterTheme } from '../CharacterThemeContext'

// 输入框变体类型
type InputVariant = 'default' | 'filled' | 'outlined' | 'ghost'
type InputSize = 'small' | 'medium' | 'large'
type InputState = 'idle' | 'focus' | 'error' | 'success'

export interface CharacterInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
  size?: InputSize
  label?: string
  error?: string
  success?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  characterIcon?: boolean
  loading?: boolean
  animate?: boolean
  onStateChange?: (state: InputState) => void
}

export const CharacterInput = forwardRef<HTMLInputElement, CharacterInputProps>(({
  variant = 'default',
  size = 'medium',
  label,
  error,
  success,
  helper,
  leftIcon,
  rightIcon,
  characterIcon = true,
  loading = false,
  animate = true,
  onStateChange,
  className = '',
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const { themeColors, currentCharacter } = useCharacterTheme()
  const [state, setState] = useState<InputState>('idle')
  const [isFocused, setIsFocused] = useState(false)

  // 更新状态并触发回调
  const updateState = (newState: InputState) => {
    setState(newState)
    onStateChange?.(newState)
  }

  // 处理焦点事件
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    updateState('focus')
    onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    if (error) {
      updateState('error')
    } else if (success) {
      updateState('success')
    } else {
      updateState('idle')
    }
    onBlur?.(e)
  }

  // 根据错误/成功状态更新
  useEffect(() => {
    if (!isFocused) {
      if (error) {
        updateState('error')
      } else if (success) {
        updateState('success')
      } else if (state !== 'idle') {
        updateState('idle')
      }
    }
  }, [error, success, isFocused])

  // 尺寸配置
  const sizeClasses = {
    small: {
      container: 'h-8 px-3 text-sm',
      label: 'text-xs mb-1',
      helper: 'text-xs mt-1'
    },
    medium: {
      container: 'h-12 px-4 text-base',
      label: 'text-sm mb-1.5',
      helper: 'text-sm mt-1.5'
    },
    large: {
      container: 'h-16 px-5 text-lg',
      label: 'text-base mb-2',
      helper: 'text-base mt-2'
    }
  }

  const currentSize = sizeClasses[size]

  // 变体样式
  const getVariantStyles = () => {
    if (!themeColors) return {}

    const borderColor = state === 'error' ? '#ef4444' :
                       state === 'success' ? '#10b981' :
                       state === 'focus' ? themeColors.primaryColor : themeColors.border

    const backgroundColor = variant === 'filled' ? themeColors.accent : 'transparent'
    const borderWidth = variant === 'ghost' ? '0' : '2px'

    return {
      borderColor,
      backgroundColor,
      borderWidth,
      boxShadow: state === 'focus' ? `0 0 0 3px ${themeColors.glow}` : 'none'
    }
  }

  const variantStyles = getVariantStyles()

  // 输入框动画配置
  const inputVariants = {
    idle: {
      scale: 1,
      borderColor: variantStyles.borderColor
    },
    focus: {
      scale: 1.02,
      borderColor: themeColors?.primaryColor
    },
    error: {
      x: animate ? [-5, 5, -5, 5, 0] : 0,
      borderColor: '#ef4444'
    },
    success: {
      scale: 1.01,
      borderColor: '#10b981'
    }
  }

  return (
    <div className={`character-input ${className}`}>
      {/* 标签 */}
      {label && (
        <motion.label
          className={`block font-medium ${currentSize.label}`}
          style={{ color: themeColors?.text }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.label>
      )}

      {/* 输入框容器 */}
      <div className="relative">
        {/* 左侧图标 */}
        {leftIcon && (
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {leftIcon}
          </motion.div>
        )}

        {/* 角色图标 */}
        {characterIcon && currentCharacter && !leftIcon && (
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ opacity: 1, scale: 1.2 }}
          >
            <img
              src={currentCharacter.defaultImage}
              alt={currentCharacter.name}
              className="w-full h-full rounded-full object-cover"
            />
          </motion.div>
        )}

        {/* 输入框 */}
        <motion.input
          ref={ref}
          className={`
            w-full rounded-lg border transition-all duration-200 outline-none
            ${currentSize.container}
            ${leftIcon || characterIcon ? 'pl-10' : ''}
            ${rightIcon || loading ? 'pr-10' : ''}
            ${state === 'error' ? 'text-red-600' : ''}
            ${state === 'success' ? 'text-green-600' : ''}
          `}
          style={{
            color: themeColors?.text,
            ...variantStyles
          }}
          variants={animate ? inputVariants : undefined}
          animate={state}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* 右侧图标 */}
        {rightIcon && !loading && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {rightIcon}
          </motion.div>
        )}

        {/* 加载状态 */}
        {loading && (
          <motion.div
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="w-4 h-4 border-2 border-t-2 border-t-transparent rounded-full"
              style={{
                borderColor: themeColors?.primaryColor,
                borderTopColor: 'transparent'
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        )}

        {/* 状态指示器 */}
        <AnimatePresence>
          {state === 'success' && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 180 }}
              exit={{ opacity: 0, scale: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 帮助文本/错误信息 */}
      <AnimatePresence>
        {(error || success || helper) && (
          <motion.div
            className={`${currentSize.helper} flex items-center space-x-1`}
            style={{
              color: error ? '#ef4444' : success ? '#10b981' : themeColors?.text,
              opacity: 0.8
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {success && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span>{error || success || helper}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

CharacterInput.displayName = 'CharacterInput'