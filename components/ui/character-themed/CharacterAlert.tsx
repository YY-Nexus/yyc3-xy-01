'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCharacterTheme } from '../CharacterThemeContext'

export type AlertType = 'info' | 'success' | 'warning' | 'error'
export type AlertSize = 'small' | 'medium' | 'large'

export interface CharacterAlertProps {
  type?: AlertType
  size?: AlertSize
  title?: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  dismissible?: boolean
  autoDismiss?: boolean
  autoDismissDelay?: number
  characterMood?: 'happy' | 'excited' | 'thinking' | 'cool' | 'loving'
  showCharacter?: boolean
  className?: string
  onDismiss?: () => void
}

export const CharacterAlert: React.FC<CharacterAlertProps> = ({
  type = 'info',
  size = 'medium',
  title,
  message,
  action,
  dismissible = false,
  autoDismiss = false,
  autoDismissDelay = 5000,
  characterMood,
  showCharacter = true,
  className = '',
  onDismiss
}) => {
  const { themeColors, currentCharacter } = useCharacterTheme()
  const [isVisible, setIsVisible] = useState(true)

  // 自动关闭逻辑
  useEffect(() => {
    if (autoDismiss && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        handleDismiss()
      }, autoDismissDelay)

      return () => clearTimeout(timer)
    }
  }, [autoDismiss, autoDismissDelay])

  // 关闭处理
  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  // 获取类型配置
  const getTypeConfig = () => {
    const configs = {
      info: {
        backgroundColor: `${themeColors?.primary}20`,
        borderColor: themeColors?.primary,
        textColor: themeColors?.primary,
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        )
      },
      success: {
        backgroundColor: '#10b98120',
        borderColor: '#10b981',
        textColor: '#10b981',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      },
      warning: {
        backgroundColor: '#f59e0b20',
        borderColor: '#f59e0b',
        textColor: '#f59e0b',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )
      },
      error: {
        backgroundColor: '#ef444420',
        borderColor: '#ef4444',
        textColor: '#ef4444',
        icon: (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      }
    }

    return configs[type]
  }

  // 尺寸配置
  const getSizeClasses = () => {
    const sizes = {
      small: {
        container: 'p-3',
        title: 'text-sm font-medium',
        message: 'text-xs',
        action: 'text-xs px-2 py-1',
        character: 'w-8 h-8'
      },
      medium: {
        container: 'p-4',
        title: 'text-base font-medium',
        message: 'text-sm',
        action: 'text-sm px-3 py-1.5',
        character: 'w-10 h-10'
      },
      large: {
        container: 'p-6',
        title: 'text-lg font-medium',
        message: 'text-base',
        action: 'text-base px-4 py-2',
        character: 'w-12 h-12'
      }
    }

    return sizes[size]
  }

  const sizeClasses = getSizeClasses()
  const typeConfig = getTypeConfig()

  // 获取角色表情路径
  const getCharacterExpression = () => {
    if (!currentCharacter || !characterMood) return null

    const expression = currentCharacter.expressions.find(e => e.name === characterMood)
    return expression?.imagePath || currentCharacter.defaultImage
  }

  // 动画配置
  const alertVariants = {
    initial: {
      opacity: 0,
      y: -20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`
            character-alert relative rounded-xl border-2
            ${sizeClasses.container}
            ${className}
          `}
          style={{
            backgroundColor: typeConfig.backgroundColor,
            borderColor: typeConfig.borderColor
          }}
          variants={alertVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="flex items-start space-x-3">
            {/* 角色图标 */}
            {showCharacter && currentCharacter && (
              <motion.div
                className={`${sizeClasses.character} rounded-full overflow-hidden border-2 flex-shrink-0`}
                style={{
                  borderColor: typeConfig.borderColor
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1
                }}
              >
                <img
                  src={getCharacterExpression() || currentCharacter.defaultImage}
                  alt={currentCharacter.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* 类型图标 */}
            {!showCharacter && (
              <motion.div
                className="flex-shrink-0"
                style={{ color: typeConfig.textColor }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                {typeConfig.icon}
              </motion.div>
            )}

            {/* 内容区域 */}
            <div className="flex-1 min-w-0">
              {/* 标题 */}
              {title && (
                <motion.h3
                  className={sizeClasses.title}
                  style={{ color: typeConfig.textColor }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h3>
              )}

              {/* 消息内容 */}
              <motion.p
                className={`${sizeClasses.message} ${title ? 'mt-1' : ''}`}
                style={{ color: typeConfig.textColor }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                {message}
              </motion.p>

              {/* 操作按钮 */}
              {action && (
                <motion.button
                  className={`
                    ${sizeClasses.action}
                    mt-3 rounded-lg font-medium transition-colors
                    hover:opacity-80 focus:outline-none focus:ring-2
                  `}
                  style={{
                    backgroundColor: typeConfig.borderColor,
                    color: 'white',
                    focusRingColor: typeConfig.borderColor
                  }}
                  onClick={action.onClick}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.label}
                </motion.button>
              )}
            </div>

            {/* 关闭按钮 */}
            {dismissible && (
              <motion.button
                className="flex-shrink-0 p-1 rounded-lg transition-colors hover:opacity-80"
                style={{ color: typeConfig.textColor }}
                onClick={handleDismiss}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          {/* 进度条（自动关闭时显示） */}
          {autoDismiss && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 rounded-b-xl"
              style={{ backgroundColor: typeConfig.borderColor }}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{
                duration: autoDismissDelay / 1000,
                ease: "linear"
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}