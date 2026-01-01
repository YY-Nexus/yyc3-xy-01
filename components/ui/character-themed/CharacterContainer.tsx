'use client'

import React, { ReactNode, useEffect } from 'react'
import { motion, MotionProps } from 'framer-motion'
import { useCharacterTheme } from '../CharacterThemeContext'

export interface CharacterContainerProps {
  children: ReactNode
  variant?: 'default' | 'card' | 'glass' | 'gradient' | 'outlined'
  size?: 'small' | 'medium' | 'large' | 'full'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  hover?: boolean
  className?: string
  onClick?: () => void
  as?: keyof JSX.IntrinsicElements
}

export const CharacterContainer: React.FC<CharacterContainerProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  rounded = 'lg',
  padding = 'md',
  shadow = 'md',
  animate = true,
  hover = false,
  className = '',
  onClick,
  as: Component = 'div'
}) => {
  const { themeColors, selectedTheme } = useCharacterTheme()

  // 尺寸配置
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'w-full'
  }

  // 圆角配置
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  }

  // 内边距配置
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  // 阴影配置
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  // 获取变体样式
  const getVariantStyles = () => {
    if (!themeColors) return {}

    switch (variant) {
      case 'card':
        return {
          backgroundColor: themeColors.background,
          border: `2px solid ${themeColors.border}`,
          boxShadow: `0 4px 16px ${themeColors.glow}`
        }

      case 'glass':
        return {
          background: `linear-gradient(135deg, ${themeColors.primaryColor}20, ${themeColors.secondaryColor}20)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${themeColors.border}40`,
          boxShadow: `0 8px 32px ${themeColors.glow}`
        }

      case 'gradient':
        return {
          background: themeColors.gradient,
          border: 'none',
          boxShadow: `0 8px 24px ${themeColors.glow}`
        }

      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${themeColors.primaryColor}`,
          boxShadow: 'none'
        }

      default:
        return {
          backgroundColor: themeColors.background,
          border: `1px solid ${themeColors.border}`,
          boxShadow: shadow === 'none' ? 'none' : `0 2px 8px ${themeColors.glow}40`
        }
    }
  }

  const variantStyles = getVariantStyles()

  // 动画配置
  const motionProps: MotionProps = animate ? {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    transition: {
      duration: 0.3,
      ease: "easeOut"
    },
    whileHover: hover ? {
      scale: 1.02,
      boxShadow: `0 8px 32px ${themeColors?.glow}`,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    } : undefined,
    whileTap: onClick ? {
      scale: 0.98
    } : undefined
  } : {}

  // 合并样式
  const containerStyle = {
    ...variantStyles,
    position: 'relative' as const,
    overflow: 'hidden'
  }

  // 装饰元素
  const decorationElement = variant === 'gradient' || variant === 'glass' ? (
    <div
      className="absolute inset-0 opacity-10"
      style={{
        background: `radial-gradient(circle at 20% 80%, ${themeColors?.primaryColor}40, transparent 50%)`,
        pointerEvents: 'none'
      }}
    />
  ) : null

  const MotionComponent = motion[Component as keyof typeof motion] as React.ComponentType<React.HTMLAttributes<HTMLElement>>

  return (
    <MotionComponent
      className={`
        character-container relative
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={containerStyle}
      onClick={onClick}
      {...motionProps}
    >
      {/* 背景装饰 */}
      {decorationElement}

      {/* 主题色光晕效果 */}
      {animate && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `linear-gradient(45deg, ${themeColors?.primaryColor}10, ${themeColors?.secondaryColor}10)`,
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
        />
      )}

      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 边框动画效果 */}
      {variant === 'gradient' && animate && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            padding: '2px',
            background: `linear-gradient(45deg, ${themeColors?.primaryColor}, ${themeColors?.secondaryColor}, ${themeColors?.primaryColor})`,
            backgroundSize: '200% 200%',
            animation: 'gradient-border 3s ease infinite',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor'
          }}
        />
      )}
    </MotionComponent>
  )
}

// 添加 CSS 动画 (仅在客户端)
useEffect(() => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  if (!document.head.querySelector('style[data-character-container]')) {
    const style = document.createElement('style')
    style.setAttribute('data-character-container', 'true')
    style.textContent = `
      @keyframes gradient-border {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `
    document.head.appendChild(style)
  }
}, [])