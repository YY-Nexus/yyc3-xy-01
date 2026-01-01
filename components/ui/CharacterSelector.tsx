'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { characterManager, type CharacterConfig, type ThemeColors } from '@/lib/character-manager'
import { Child } from '@prisma/client'

interface CharacterSelectorProps {
  child?: Child | null
  onCharacterChange?: (character: CharacterConfig) => void
  onThemeChange?: (theme: string) => void
  showThemeSelector?: boolean
  showExpressionSelector?: boolean
  compact?: boolean
  className?: string
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  child,
  onCharacterChange,
  onThemeChange,
  showThemeSelector = true,
  showExpressionSelector = false,
  compact = false,
  className = ''
}) => {
  const [currentCharacter, setCurrentCharacter] = useState<CharacterConfig | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string>('')
  const [selectedExpression, setSelectedExpression] = useState<string>('')
  const [themeColors, setThemeColors] = useState<ThemeColors | null>(null)
  const [isExpanded, setIsExpanded] = useState(!compact)

  useEffect(() => {
    const character = characterManager.getCharacterForUser(child)
    setCurrentCharacter(character)

    const defaultTheme = character.themes[0]?.name || ''
    setSelectedTheme(defaultTheme)

    if (onCharacterChange) {
      onCharacterChange(character)
    }
  }, [child, onCharacterChange])

  useEffect(() => {
    if (currentCharacter && selectedTheme) {
      const colors = characterManager.getCharacterThemeColors(currentCharacter, selectedTheme)
      setThemeColors(colors)

      if (onThemeChange) {
        onThemeChange(selectedTheme)
      }
    }
  }, [currentCharacter, selectedTheme, onThemeChange])

  const handleGenderSwitch = (gender: 'male' | 'female') => {
    const character = characterManager.getCharacterByGender(gender)
    setCurrentCharacter(character)
    setSelectedTheme(character.themes[0]?.name || '')

    if (onCharacterChange) {
      onCharacterChange(character)
    }
  }

  const handleThemeSelect = (themeName: string) => {
    setSelectedTheme(themeName)
  }

  const handleExpressionSelect = (expressionName: string) => {
    setSelectedExpression(expressionName)
  }

  const getCharacterImagePath = () => {
    if (!currentCharacter) return ''

    if (selectedExpression) {
      const expression = currentCharacter.expressions.find(e => e.name === selectedExpression)
      if (expression) {
        return expression.imagePath
      }
    }

    if (selectedTheme) {
      const theme = currentCharacter.themes.find(t => t.name === selectedTheme)
      if (theme) {
        return theme.imagePath
      }
    }

    return currentCharacter.defaultImage
  }

  if (!currentCharacter || !themeColors) return null

  const containerVariants = {
    collapsed: { width: compact ? '120px' : 'auto', height: compact ? '120px' : 'auto' },
    expanded: { width: 'auto', height: 'auto' }
  }

  const contentVariants = {
    collapsed: { opacity: 0, scale: 0.8 },
    expanded: { opacity: 1, scale: 1 }
  }

  return (
    <motion.div
      className={`character-selector rounded-2xl p-4 ${className}`}
      style={{
        background: themeColors.gradient,
        boxShadow: `0 8px 32px ${themeColors.glow}`,
        border: `2px solid ${themeColors.border}`
      }}
      variants={containerVariants}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Character Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <motion.div
            className="w-16 h-16 rounded-full overflow-hidden border-2"
            style={{ borderColor: themeColors.border }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={getCharacterImagePath()}
              alt={currentCharacter.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentCharacter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-xl font-bold" style={{ color: themeColors.text }}>
                {currentCharacter.name}
              </h3>
              <p className="text-sm opacity-80">
                {currentCharacter.gender === 'female' ? '小语' : '小言'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {compact && (
          <motion.button
            className="p-2 rounded-full"
            style={{ backgroundColor: themeColors.accent }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d={isExpanded ? "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" : "M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"}
                clipRule="evenodd"
              />
            </svg>
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            variants={contentVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            transition={{ duration: 0.2, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Gender Toggle */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                选择角色
              </label>
              <div className="flex space-x-2">
                <motion.button
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentCharacter.gender === 'female'
                      ? 'text-white shadow-lg'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: currentCharacter.gender === 'female'
                      ? '#ec4899'
                      : themeColors.accent
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGenderSwitch('female')}
                >
                  小语 (女孩)
                </motion.button>

                <motion.button
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentCharacter.gender === 'male'
                      ? 'text-white shadow-lg'
                      : 'opacity-60 hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: currentCharacter.gender === 'male'
                      ? '#3b82f6'
                      : themeColors.accent
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGenderSwitch('male')}
                >
                  小言 (男孩)
                </motion.button>
              </div>
            </div>

            {/* Theme Selector */}
            {showThemeSelector && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  选择主题
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currentCharacter.themes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTheme === theme.name
                          ? 'border-white shadow-lg scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: selectedTheme === theme.name
                          ? theme.primaryColor
                          : themeColors.accent,
                        borderColor: selectedTheme === theme.name
                          ? 'white'
                          : themeColors.border
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleThemeSelect(theme.name)}
                    >
                      <div className="text-xs font-medium text-white">
                        {theme.displayName}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full mx-auto mt-1"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Expression Selector */}
            {showExpressionSelector && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: themeColors.text }}>
                  表情状态
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {currentCharacter.expressions.map((expression) => (
                    <motion.button
                      key={expression.id}
                      className={`p-2 rounded-lg transition-all ${
                        selectedExpression === expression.name
                          ? 'ring-2 ring-white shadow-lg'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: themeColors.accent,
                        border: selectedExpression === expression.name
                          ? '2px solid white'
                          : 'none'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleExpressionSelect(expression.name)}
                    >
                      <div className="text-xs font-medium" style={{ color: themeColors.text }}>
                        {expression.displayName}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Character Info */}
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: themeColors.accent }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                    性格特点
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentCharacter.personality.traits.slice(0, 3).map((trait, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: themeColors.primaryColor,
                          color: 'white'
                        }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: themeColors.primaryColor }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-white font-bold text-lg">
                    {currentCharacter.gender === 'female' ? '♀' : '♂'}
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Character Quote */}
            <motion.div
              className="p-3 rounded-lg text-center"
              style={{
                backgroundColor: `${themeColors.primaryColor}20`,
                border: `1px solid ${themeColors.primaryColor}40`
              }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-sm font-medium" style={{ color: themeColors.text }}>
                "{characterManager.getCatchphrase(currentCharacter)}"
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}