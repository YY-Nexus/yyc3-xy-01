/**
 * @file EnhancedQVersionCharacter.tsx
 * @description YYC³ AI小语智能成长守护系统增强版Q版角色组件，支持性别切换、主题变化、表情展示的高级角色组件
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { characterManager, type CharacterConfig, type CharacterExpression } from '@/lib/character-manager'

// Mock Child type to avoid database dependency
interface MockChild {
  id: string
  user_id: string
  name: string
  nickname: string
  birth_date: string
  gender: 'male' | 'female'
  created_at: string
}

interface EnhancedQVersionCharacterProps {
  child?: MockChild | null
  className?: string
  showName?: boolean
  interactive?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  mode?: 'default' | 'compact' | 'detailed' | 'interactive'
  theme?: string
  expression?: string
  onExpressionChange?: (expression: string) => void
  onThemeChange?: (theme: string) => void
  onClick?: (character: CharacterConfig) => void
  animationEnabled?: boolean
  preloadImages?: boolean
}

export default function EnhancedQVersionCharacter({
  child,
  className = '',
  showName = true,
  interactive = false,
  size = 'md',
  mode = 'default',
  theme,
  expression,
  onExpressionChange,
  onThemeChange,
  onClick,
  animationEnabled = true,
  preloadImages = true
}: EnhancedQVersionCharacterProps) {
  const [currentExpression, setCurrentExpression] = useState<string>('happy')
  const [currentTheme, setCurrentTheme] = useState<string>('pink')
  const [isAnimating, setIsAnimating] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [preloadComplete, setPreloadComplete] = useState(false)
  const characterRef = useRef<CharacterConfig | null>(null)

  // 预加载图片
  useEffect(() => {
    if (preloadImages) {
      characterManager.preloadCharacterImages().then(() => {
        setPreloadComplete(true)
      })
    }
  }, [preloadImages])

  // 获取角色配置
  const character = characterManager.getCharacterForUser(child)
  characterRef.current = character

  // 同步外部传入的主题和表情
  useEffect(() => {
    if (theme && character.themes.find(t => t.name === theme)) {
      setCurrentTheme(theme)
    }
    if (expression && character.expressions.find(e => e.name === expression)) {
      setCurrentExpression(expression)
    }
  }, [character, theme, expression])

  // 获取角色图片路径
  const imagePath = characterManager.getCharacterImagePath(character, currentExpression, currentTheme)
  const themeColors = characterManager.getCharacterThemeColors(character, currentTheme)
  const currentExpressionConfig = characterManager.getCharacterExpression(character, currentExpression)

  // 尺寸配置 - 新增更多尺寸选项
  const sizeConfig = {
    sm: { width: 48, height: 48, nameSize: 'text-xs', iconSize: 'text-lg' },
    md: { width: 64, height: 64, nameSize: 'text-sm', iconSize: 'text-xl' },
    lg: { width: 80, height: 80, nameSize: 'text-base', iconSize: 'text-2xl' },
    xl: { width: 96, height: 96, nameSize: 'text-lg', iconSize: 'text-3xl' },
    '2xl': { width: 128, height: 128, nameSize: 'text-xl', iconSize: 'text-4xl' }
  }

  const currentSize = sizeConfig[size]

  // 表情切换动画
  const handleExpressionChange = (newExpression: string) => {
    if (!interactive || !animationEnabled) return

    setIsAnimating(true)
    setCurrentExpression(newExpression)
    onExpressionChange?.(newExpression)

    setTimeout(() => setIsAnimating(false), 400)
  }

  // 主题切换动画
  const handleThemeChange = (newTheme: string) => {
    if (!interactive) return

    setIsAnimating(true)
    setCurrentTheme(newTheme)
    onThemeChange?.(newTheme)

    setTimeout(() => setIsAnimating(false), 400)
  }

  // 交互式点击处理
  const handleInteraction = () => {
    if (!interactive) return

    // 随机切换表情
    const randomExpression = characterManager.getRandomExpression(character)
    handleExpressionChange(randomExpression.name)

    // 触发回调
    onClick?.(character)

    // 触发交互事件
    triggerInteractionEvent(character, randomExpression)
  }

  // 触发交互事件（供其他组件监听）
  const triggerInteractionEvent = (character: CharacterConfig, expression: CharacterExpression) => {
    const event = new CustomEvent('characterInteraction', {
      detail: { character, expression }
    })
    window.dispatchEvent(event)
  }

  // 悬停效果
  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => setHovered(false)

  // 加载状态
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  // 图片加载处理
  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  // 获取互动提示文本
  const getInteractionHint = () => {
    if (!interactive) return ''

    if (currentExpressionConfig) {
      const actionTexts = {
        happy: ['开心一下！', '真棒！', '继续加油！'],
        excited: ['太棒了！', '好兴奋！', '超赞！'],
        thinking: ['思考中...', '想一想...', '仔细考虑...'],
        cool: ['酷酷的！', '太帅了！', '很厉害！'],
        loving: ['好可爱！', '好暖心！', '超有爱心！']
      }

      const texts = actionTexts[currentExpression.name] || ['点击互动']
      return texts[Math.floor(Math.random() * texts.length)]
    }

    const generalTexts = ['点击互动', '和我说说话', '点击看看']
    return generalTexts[Math.floor(Math.random() * generalTexts.length)]
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 角色主体 */}
      <motion.div
        className={`
          relative cursor-${interactive ? 'pointer' : 'default'}
          group transition-all duration-200
          ${hovered ? 'transform scale-105' : ''}
          ${mode === 'compact' ? 'scale-90' : ''}
        `}
        whileHover={interactive && animationEnabled ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        onClick={handleInteraction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: currentSize.width,
          height: currentSize.height
        }}
      >
        {/* 加载状态 */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-full">
            <motion.div
              className="w-1/2 h-1/2 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        )}

        {/* 角色图片 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentExpression}-${currentTheme}-${preloadComplete}`}
            initial={{
              opacity: 0,
              scale: 0.8,
              rotate: isAnimating ? 15 : 0
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotate: -15
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut"
            }}
            className="w-full h-full rounded-full overflow-hidden"
          >
            <img
              src={imagePath}
              alt={`${character.name} - ${currentExpressionConfig?.displayName || '默认表情'}`}
              className={`
                w-full h-full object-cover
                ${imageError ? 'hidden' : ''}
              `}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {/* 图片加载失败的回退显示 */}
            {imageError && (
              <div
                className={`
                  w-full h-full rounded-full flex items-center justify-center
                  bg-gradient-to-br ${themeColors.gradient}
                  text-white font-bold
                  ${currentSize.iconSize}
                `}
              >
                {character.gender === 'male' ? '言' : '语'}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 光环效果 */}
        {(interactive || hovered) && (
          <motion.div
            className={`
              absolute inset-0 rounded-full opacity-0
              ${hovered ? 'opacity-50' : 'opacity-0'}
              transition-opacity duration-300
              ${hovered ? `shadow-xl` : ''}
            `}
            animate={{
              boxShadow: isAnimating
                ? `0 0 ${size === '2xl' ? 60 : size === 'xl' ? 40 : 30}px ${themeColors.glow}`
                : '0 0 0px transparent'
            }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* 状态指示器 */}
        {mode === 'detailed' && (
          <motion.div
            className="absolute -top-1 right-1 w-3 h-3 rounded-full bg-green-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 1, 0.6, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* 交互提示 */}
        {interactive && mode !== 'compact' && (
          <motion.div
            className={`
              absolute -bottom-8 left-1/2 transform -translate-x-1/2
              bg-slate-800 text-white text-xs px-3 py-1.5 rounded-full
              opacity-0 group-hover:opacity-100 transition-all duration-200
              whitespace-nowrap z-50
              shadow-lg
            `}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 5, opacity: 0 }}
          >
            {getInteractionHint()}
          </motion.div>
        )}

        {/* 主题切换按钮 - 仅在详细模式显示 */}
        {mode === 'interactive' && (
          <div className="absolute -top-1 -right-1 flex gap-1">
            {character.themes.map((theme, index) => (
              <button
                key={theme.id}
                className={`
                  w-6 h-6 rounded-full border-2
                  transition-all duration-200
                  ${currentTheme === theme.name
                    ? `${theme.primaryColor} ${theme.secondaryColor}`
                    : 'bg-white border-gray-300 hover:border-gray-400'
                  }
                `}
                onClick={(e) => {
                  e.stopPropagation()
                  handleThemeChange(theme.name)
                }}
                title={theme.displayName}
              >
                <span className="sr-only">{theme.displayName}</span>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* 角色信息显示 */}
      {showName && mode !== 'compact' && (
        <motion.div
          key={`info-${currentExpression}-${currentTheme}-${character.name}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-center"
        >
          {/* 角色名称 */}
          <div className={`${currentSize.nameSize} font-medium text-gray-700`}>
            <span
              className="bg-gradient-to-r bg-clip-text text-transparent font-bold"
              style={{ backgroundImage: themeColors.gradient }}
            >
              {character.name}
            </span>
            {child?.nickname && (
              <span className="text-gray-500 ml-1">({child.nickname})</span>
            )}
          </div>

          {/* 表情标签 */}
          {currentExpressionConfig && (
            <motion.div
              key={`expression-${currentExpression}-${currentTheme}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                mt-1 px-2 py-0.5 rounded-full text-xs
                font-medium ${currentTheme === 'pink'
                  ? 'bg-pink-100 text-pink-600 border-pink-200'
                  : 'bg-blue-100 text-blue-600 border-blue-200'
                } border
              `}
            >
              {currentExpressionConfig.displayName}
            </motion.div>
          )}

          {/* 主题标签 */}
          {currentTheme !== 'pink' && (
            <motion.div
              key={`theme-${currentTheme}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`
                mt-1 px-2 py-0.5 rounded-full text-xs
                font-medium bg-gray-100 text-gray-600 border border-gray-200
              `}
            >
              {character.themes.find(t => t.name === currentTheme)?.displayName}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 紧凑模式信息 */}
      {mode === 'compact' && (
        <motion.div
          key={`compact-${currentExpression}-${currentTheme}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-center"
        >
          <span className={`${currentSize.nameSize} font-medium text-gray-700`}>
            {character.name}
          </span>
        </motion.div>
      )}

      {/* 交互模式下的状态指示器 */}
      {mode === 'interactive' && (
        <motion.div
          className="mt-2 flex justify-center gap-1"
        >
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-600">在线</span>
        </motion.div>
      )}
    </div>
  )
}

// 角色展示组件（用于展示当前儿童的Q版形象）
export function ChildQVersionAvatar({
  child,
  size = 'md',
  theme,
  expression
}: {
  child?: MockChild | null | undefined
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: string
  expression?: string
}) {
  if (!child) return null

  return (
    <EnhancedQVersionCharacter
      child={child}
      size={size}
      theme={theme}
      expression={expression}
      interactive={false}
      showName={true}
      mode="default"
      animationEnabled={true}
    />
  )
}

// 性别选择器组件（用于儿童档案编辑）
export function GenderSelector({
  value,
  onChange,
  size = 'lg',
  theme
}: {
  value: 'male' | 'female' | 'other' | undefined
  onChange: (gender: 'male' | 'female' | 'other') => void
  size?: 'md' | 'lg' | 'xl'
  theme?: string
}) {
  const handleCharacterClick = (gender: 'male' | 'female') => {
    onChange(gender)
  }

  const femaleCharacter = characterManager.getCharacterByGender('female')
  const maleCharacter = characterManager.getCharacterByGender('male')

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700">选择角色</h3>
        <p className="text-sm text-gray-500 mt-1">选择一个适合的角色来陪伴学习</p>
      </div>

      <div className="flex items-center justify-center gap-8 flex-wrap">
        {/* 女性角色 */}
        <div className="text-center">
          <div className="mb-3">
            <EnhancedQVersionCharacter
              character={femaleCharacter}
              size={size}
              theme={theme || 'pink'}
              expression="happy"
              interactive={true}
              mode="interactive"
              onThemeChange={handleCharacterClick}
              onClick={() => handleCharacterClick('female')}
            />
          </div>
          <div className={`
            mt-2 px-4 py-2 rounded-lg border-2
            ${value === 'female'
              ? 'border-pink-400 bg-pink-50 text-pink-700'
              : 'border-gray-300 bg-gray-50 text-gray-700'
            }
          `}>
            <span className="font-medium">小语</span>
            {value === 'female' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-2"
              >
                ✓
              </motion.span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            温柔可爱，细致入微
          </p>
        </div>

        {/* 男性角色 */}
        <div className="text-center">
          <div className="mb-3">
            <EnhancedQVersionCharacter
              character={maleCharacter}
              size={size}
              theme={theme || 'blue'}
              expression="cool"
              interactive={true}
              mode="interactive"
              onThemeChange={handleCharacterClick}
              onClick={() => handleCharacterClick('male')}
            />
          </div>
          <div className={`
            mt-2 px-4 py-2 rounded-lg border-2
            ${value === 'male'
              ? 'border-blue-400 bg-blue-50 text-blue-700'
              : 'border-gray-300 bg-gray-50 text-gray-700'
            }
          `}>
            <span className="font-medium">小言</span>
            {value === 'male' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="ml-2"
              >
                ✓
              </motion.span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            勇敢自信，保护伙伴
          </p>
        </div>
      </div>

      {/* 其他选项 */}
      <div className="flex justify-center">
        <button
          onClick={() => onChange('other')}
          className={`
            px-4 py-2 rounded-lg border-2 transition-all duration-200
            ${value === 'other'
              ? 'border-slate-400 bg-slate-50 text-slate-700 shadow-sm'
              : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-100'
            }
          `}
        >
          <span className="font-medium">其他</span>
          {value === 'other' && (
            <span className="ml-2">✓</span>
          )}
        </button>
      </div>

      {/* 选择提示 */}
      <div className="text-center text-sm text-gray-500">
        选择后可以在设置中随时更改
      </div>
    </div>
  )
}

// 角色互动面板
export function CharacterInteractionPanel({
  child,
  isOpen,
  onClose
}: {
  child?: Child | null | null
  isOpen: boolean
  onClose: () => void
}) {
  const character = characterManager.getCharacterForUser(child)
  const [selectedExpression, setSelectedExpression] = useState<string>('happy')
  const [selectedTheme, setSelectedTheme] = useState<string>('pink')

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-xl p-6 max-w-md w-full"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">角色互动</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">关闭</span>
            ✕
          </button>
        </div>

        {/* 角色展示 */}
        <div className="flex justify-center mb-6">
          <EnhancedQVersionCharacter
            child={child}
            size="xl"
            expression={selectedExpression}
            theme={selectedTheme}
            interactive={true}
            mode="interactive"
            onExpressionChange={setSelectedExpression}
            onThemeChange={setSelectedTheme}
          />
        </div>

        {/* 表情选择 */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">表情选择</h4>
          <div className="grid grid-cols-3 gap-2">
            {character.expressions.map((expression) => (
              <button
                key={expression.id}
                onClick={() => setSelectedExpression(expression.name)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${selectedExpression === expression.name
                    ? `${character.gender === 'female' ? 'border-pink-400 bg-pink-100 text-pink-700' : 'border-blue-400 bg-blue-100 text-blue-700'}`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="text-2xl mb-1">{expression.displayName || expression.name}</div>
                <div className="text-xs text-gray-500">{expression.triggers[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 主题选择 */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-700 mb-3">主题选择</h4>
          <div className="grid grid-cols-3 gap-2">
            {character.themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.name)}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200
                  ${selectedTheme === theme.name
                    ? `${theme.primaryColor} text-white shadow-lg`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div className="text-xs text-gray-700 dark:text-gray-300">{theme.displayName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 经典用语 */}
        <div className="mb-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3">经典用语</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-center text-gray-700 italic">
              "{characterManager.getCatchphrase(character)}"
            </p>
          </div>
        </div>

        {/* 语音设置预览 */}
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3">语音设置</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>性别偏好: {character.voiceSettings.preferredGender}</div>
            <div>语速: {character.voiceSettings.speechRate.toFixed(1)}x</div>
            <div>音调: {character.voiceSettings.pitch.toFixed(1)}x</div>
            <div>音量: {Math.round(character.voiceSettings.volume * 100)}%</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 角色状态指示器
export function CharacterStatusIndicator({
  character,
  status = 'online',
  showName = false,
  className = ''
}: {
  character: CharacterConfig
  status?: 'online' | 'offline' | 'busy' | 'away'
  showName?: boolean
  className?: string
}) {
  const statusConfig = {
    online: {
      color: 'bg-green-400',
      text: '在线',
      icon: '●'
    },
    offline: {
      color: 'bg-gray-400',
      text: '离线',
      icon: '○'
    },
    busy: {
      color: 'bg-yellow-400',
      text: '忙碌',
      icon: '◐'
    },
    away: {
      color: 'bg-orange-400',
      text: '离开',
      icon: '◐'
    }
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`
        w-2 h-2 rounded-full ${config.color}
        ${status !== 'offline' ? 'animate-pulse' : ''}
      `} />
      <span className="text-xs font-medium text-gray-700">{config.text}</span>
      {showName && (
        <span className="text-sm text-gray-600">{character.name}</span>
      )}
    </div>
  )
}

// 角色预览网格
export function CharacterPreviewGrid({
  children,
  columns = 4,
  gap = 4
}: {
  children: React.ReactNode
  columns?: number
  gap?: number
}) {
  return (
    <div
      className={`
        grid grid-cols-${columns} gap-${gap}
        p-4 bg-gray-50 rounded-xl
      `}
    >
      {children}
    </div>
  )
}