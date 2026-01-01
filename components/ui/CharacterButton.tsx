/**
 * @file CharacterButton.tsx
 * @description YYC³ AI小语智能成长守护系统UI角色按钮组件，提供角色按钮展示功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { characterManager, type CharacterConfig, type ThemeColors } from '@/lib/character-manager'
import { Child } from '@prisma/client'

interface CharacterButtonProps {
  child?: Child | null
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  showIcon?: boolean
  showName?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  children?: React.ReactNode
}

export const CharacterButton: React.FC<CharacterButtonProps> = ({
  child,
  variant = 'primary',
  size = 'medium',
  showIcon = true,
  showName = false,
  disabled = false,
  loading = false,
  onClick,
  className = '',
  children
}) => {
  const character = characterManager.getCharacterForUser(child)
  const themeColors = characterManager.getCharacterThemeColors(character)

  const sizeClasses = {
    small: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4'
    },
    medium: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5'
    },
    large: {
      container: 'px-6 py-3 text-lg',
      icon: 'w-6 h-6'
    }
  }

  const currentSize = sizeClasses[size]

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: themeColors.gradient,
          color: 'white',
          border: 'none',
          shadow: `0 4px 16px ${themeColors.glow}`
        }
      case 'secondary':
        return {
          background: themeColors.accent,
          color: themeColors.text,
          border: `2px solid ${themeColors.border}`
        }
      case 'outline':
        return {
          background: 'transparent',
          color: themeColors.primaryColor,
          border: `2px solid ${themeColors.primaryColor}`
        }
      case 'ghost':
        return {
          background: `${themeColors.primaryColor}20`,
          color: themeColors.primaryColor,
          border: 'none'
        }
      default:
        return {
          background: themeColors.gradient,
          color: 'white',
          border: 'none'
        }
    }
  }

  const variantStyles = getVariantStyles()

  const buttonVariants = {
    rest: {
      scale: 1,
      boxShadow: variantStyles.shadow || 'none'
    },
    hover: {
      scale: disabled ? 1 : 1.05,
      boxShadow: disabled ? 'none' : `0 6px 24px ${themeColors.glow}`
    },
    tap: { scale: disabled ? 1 : 0.95 },
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  const loadingVariants = {
    rest: { rotate: 0 },
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  }

  return (
    <motion.button
      className={`
        character-button relative inline-flex items-center justify-center
        font-medium rounded-xl transition-all duration-200
        ${currentSize.container} ${className}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: variantStyles.background,
        color: variantStyles.color,
        border: variantStyles.border,
        boxShadow: variantStyles.shadow
      }}
      variants={buttonVariants}
      initial="rest"
      whileHover={!disabled && !loading ? "hover" : "rest"}
      whileTap={!disabled && !loading ? "tap" : "rest"}
      animate={loading ? "loading" : "rest"}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
    >
      {/* Character Icon */}
      {showIcon && (
        <motion.div
          className={`${currentSize.icon} rounded-full overflow-hidden border-2 mr-2`}
          style={{ borderColor: variant === 'outline' ? themeColors.primaryColor : 'white' }}
          variants={loading ? loadingVariants : {}}
          animate={loading ? "loading" : "rest"}
        >
          <img
            src={character.defaultImage}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}

      {/* Button Content */}
      <div className="flex items-center space-x-2">
        {showName && (
          <span className="font-bold">
            {character.name}
          </span>
        )}

        {children && (
          <span>
            {children}
          </span>
        )}

        {/* Character personality hint */}
        {!children && !showName && (
          <span className="text-xs opacity-80">
            {character.personality.traits[0]}
          </span>
        )}
      </div>

      {/* Loading indicator */}
      {loading && (
        <motion.div
          className="absolute inset-0 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        >
          <div
            className="w-6 h-6 border-2 border-t-2 border-t-transparent rounded-full"
            style={{
              borderColor: themeColors.primaryColor,
              borderTopColor: 'transparent'
            }}
          />
        </motion.div>
      )}

      {/* Success indicator (for future use) */}
      {!loading && !disabled && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: '#10b981' }}
          initial={{ scale: 0 }}
          whileHover={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  )
}