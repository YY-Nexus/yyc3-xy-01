/**
 * @file CharacterCard.tsx
 * @description YYC³ AI小语智能成长守护系统UI角色卡片组件，提供角色展示功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { characterManager, type CharacterConfig, type ThemeColors } from '@/lib/character-manager'
import { Child } from '@prisma/client'

interface CharacterCardProps {
  child?: Child | null
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  interactive?: boolean
  onClick?: () => void
  className?: string
  expression?: string
  theme?: string
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  child,
  size = 'medium',
  showDetails = true,
  interactive = false,
  onClick,
  className = '',
  expression,
  theme
}) => {
  const character = characterManager.getCharacterForUser(child)
  const themeColors = characterManager.getCharacterThemeColors(character, theme)

  const sizeClasses = {
    small: {
      container: 'w-32 h-32',
      image: 'w-20 h-20',
      text: 'text-sm'
    },
    medium: {
      container: 'w-48 h-48',
      image: 'w-24 h-24',
      text: 'text-base'
    },
    large: {
      container: 'w-64 h-64',
      image: 'w-32 h-32',
      text: 'text-lg'
    }
  }

  const currentSize = sizeClasses[size]

  const getImagePath = () => {
    if (expression) {
      const expr = characterManager.getCharacterExpression(character, expression)
      if (expr) return expr.imagePath
    }

    if (theme) {
      const themeConfig = character.themes.find(t => t.name === theme)
      if (themeConfig) return themeConfig.imagePath
    }

    return characterManager.getCharacterImagePath(character, expression, theme)
  }

  const cardVariants = {
    rest: {
      scale: 1,
      rotate: 0,
      boxShadow: `0 4px 16px ${themeColors.glow}`
    },
    hover: {
      scale: 1.05,
      rotate: interactive ? 2 : 0,
      boxShadow: `0 8px 32px ${themeColors.glow}`
    },
    tap: { scale: 0.95 }
  }

  return (
    <motion.div
      className={`character-card relative rounded-2xl p-4 ${currentSize.container} ${className}`}
      style={{
        background: themeColors.gradient,
        border: `2px solid ${themeColors.border}`,
        cursor: interactive ? 'pointer' : 'default'
      }}
      variants={cardVariants}
      initial="rest"
      whileHover={interactive ? "hover" : "rest"}
      whileTap={interactive ? "tap" : "rest"}
      onClick={interactive ? onClick : undefined}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 rounded-2xl opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${themeColors.primaryColor}40, transparent 70%)`
        }}
      />

      {/* Character Image */}
      <div className="relative flex flex-col items-center h-full">
        <motion.div
          className={`${currentSize.image} rounded-full overflow-hidden border-4 relative z-10`}
          style={{ borderColor: themeColors.border }}
          whileHover={interactive ? { rotate: 360 } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <img
            src={getImagePath()}
            alt={character.name}
            className="w-full h-full object-cover"
          />

          {/* Gender indicator */}
          <div
            className="absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
            style={{
              backgroundColor: character.gender === 'female' ? '#ec4899' : '#3b82f6',
              transform: 'translate(25%, -25%)'
            }}
          >
            {character.gender === 'female' ? '♀' : '♂'}
          </div>
        </motion.div>

        {/* Character Details */}
        {showDetails && (
          <motion.div
            className="mt-3 text-center relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3
              className={`font-bold ${currentSize.text}`}
              style={{ color: themeColors.text }}
            >
              {character.name}
            </h3>

            <p
              className="text-xs opacity-80 mt-1"
              style={{ color: themeColors.text }}
            >
              {character.gender === 'female' ? '温柔小语' : '勇敢小言'}
            </p>

            {/* Personality traits */}
            <div className="flex justify-center gap-1 mt-2">
              {character.personality.traits.slice(0, 2).map((trait, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full text-white"
                  style={{
                    backgroundColor: themeColors.primaryColor,
                    fontSize: '10px'
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Interactive indicator */}
        {interactive && (
          <motion.div
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: themeColors.accent }}
            whileHover={{ scale: 1.2, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: themeColors.text }}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </div>

      {/* Sparkle effects for interactive cards */}
      {interactive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: 'white',
                top: `${20 + i * 25}%`,
                left: `${10 + i * 30}%`
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}