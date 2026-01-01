'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  Trophy,
  Stars,
  Heart,
  Gift,
  Sparkles,
  Camera,
  Music,
  PartyPopper,
  Cake,
  Baby,
  ChevronRight,
  Share,
  Download,
  X,
  Play
} from 'lucide-react'

// 增强的里程碑接口
interface EnhancedMilestone {
  id: string
  title: string
  description: string
  age: string
  category: 'motor' | 'language' | 'cognitive' | 'social' | 'emotional' | 'first_time' | 'birthday'
  importance: number // 1-10
  achievements: string[]
  familyReaction: string[]
  media?: Array<{
    type: 'image' | 'video'
    url: string
    thumbnail?: string
    caption?: string
  }>
  celebrationLevel: 'silver' | 'gold' | 'diamond'
  personalizedMessage?: string
  relatedMilestones?: string[]
}

interface EnhancedMilestoneCelebrationProps {
  isVisible: boolean
  milestone: EnhancedMilestone | null
  onClose: () => void
  onShare?: (milestone: EnhancedMilestone) => void
  onSave?: (milestone: EnhancedMilestone) => void
  autoClose?: boolean
}

// 庆祝级别配置
const celebrationConfig = {
  silver: {
    colors: ['#C0C0C0', '#E5E5E5', '#F0F0F0'],
    particleCount: 30,
    animationDuration: 3,
    bgGradient: 'from-gray-100 to-slate-100',
    borderGradient: 'from-gray-300 to-slate-300'
  },
  gold: {
    colors: ['#FFD700', '#FFA500', '#FF6347'],
    particleCount: 50,
    animationDuration: 4,
    bgGradient: 'from-yellow-100 to-orange-100',
    borderGradient: 'from-yellow-400 to-orange-400'
  },
  diamond: {
    colors: ['#B9F2FF', '#87CEEB', '#FF69B4', '#FFD700', '#00CED1'],
    particleCount: 80,
    animationDuration: 5,
    bgGradient: 'from-blue-100 via-purple-100 to-pink-100',
    borderGradient: 'from-blue-400 via-purple-400 to-pink-400'
  }
}

// 彩带粒子组件
function ConfettiParticle({
  delay,
  color,
  duration,
  x,
  rotation
}: {
  delay: number
  color: string
  duration: number
  x: number
  rotation: number
}) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        top: -20,
        transform: `rotate(${rotation}deg)`
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 600, 650],
        rotate: [0, rotation + 720, rotation + 1440],
        opacity: [1, 1, 0],
        scale: [1, 1.2, 0.8]
      }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    />
  )
}

// 星星爆炸效果
function StarBurst({
  delay,
  x,
  y,
  color
}: {
  delay: number
  x: number
  y: number
  color: string
}) {
  return (
    <motion.div
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 2, 1.5, 0],
        opacity: [0, 1, 0.8, 0],
        rotate: [0, 180, 360, 540]
      }}
      transition={{
        duration: 1.5,
        delay,
        ease: "easeOut"
      }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60">
        <path
          d="M30 0 L35 25 L60 30 L35 35 L30 60 L25 35 L0 30 L25 25 Z"
          fill={color}
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </motion.div>
  )
}

// 光环效果
function LightRing({ delay, size }: { delay: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full border-2 border-yellow-400"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{
        scale: [0, 1.5, 2.5],
        opacity: [0.8, 0.4, 0]
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut"
      }}
    />
  )
}

// 音符动画
function MusicNote({ delay, x, y }: { delay: number; x: number; y: number }) {
  const notes = ['♪', '♫', '♬', '♩']
  const note = notes[Math.floor(Math.random() * notes.length)]

  return (
    <motion.div
      className="absolute text-2xl text-purple-400"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontFamily: 'serif'
      }}
      initial={{ y: 0, opacity: 0, rotate: 0 }}
      animate={{
        y: [-20, -80, -120],
        opacity: [0, 1, 0],
        rotate: [0, 15, -15],
        x: [0, 20, -20, 0]
      }}
      transition={{
        duration: 3,
        delay,
        ease: "easeInOut",
        repeat: Infinity,
        repeatDelay: 2
      }}
    >
      {note}
    </motion.div>
  )
}

export default function EnhancedMilestoneCelebration({
  isVisible,
  milestone,
  onClose,
  onShare,
  onSave,
  autoClose = true
}: EnhancedMilestoneCelebrationProps) {
  const [showEffects, setShowEffects] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const controls = useAnimation()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const celebrationSteps = [
    { title: "发现里程碑", icon: Stars, delay: 0 },
    { title: "珍贵瞬间", icon: Camera, delay: 800 },
    { title: "成长意义", icon: Heart, delay: 1600 },
    { title: "庆祝时刻", icon: PartyPopper, delay: 2400 }
  ]

  useEffect(() => {
    if (isVisible && milestone) {
      setShowEffects(true)
      setCurrentStep(0)

      // 逐步显示庆祝步骤
      const stepTimer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= celebrationSteps.length - 1) {
            clearInterval(stepTimer)
            return prev
          }
          return prev + 1
        })
      }, 800)

      // 播放庆祝音效
      playCelebrationSound()

      // 自动关闭
      if (autoClose) {
        const closeTimer = setTimeout(() => {
          onClose()
        }, 8000)
        return () => {
          clearTimeout(stepTimer)
          clearTimeout(closeTimer)
        }
      }

      return () => clearInterval(stepTimer)
    } else {
      setShowEffects(false)
      setCurrentStep(0)
    }
  }, [isVisible, milestone, autoClose, onClose])

  const playCelebrationSound = useCallback(() => {
    try {
      interface WindowWithAudioContext extends Window {
        webkitAudioContext?: typeof AudioContext
      }
      const audioContext = new (window.AudioContext || (window as WindowWithAudioContext).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // 庆祝旋律
      const melody = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50] // C5, D5, E5, G5, A5, B5, C6

      oscillator.frequency.value = melody[0]
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2)

      let noteIndex = 0
      const playNextNote = () => {
        if (noteIndex < melody.length && oscillator) {
          oscillator.frequency.setValueAtTime(melody[noteIndex], audioContext.currentTime)
          noteIndex++
          setTimeout(playNextNote, 200)
        }
      }

      oscillator.start(audioContext.currentTime)
      playNextNote()
      oscillator.stop(audioContext.currentTime + 2)

      setIsPlaying(true)
      setTimeout(() => setIsPlaying(false), 2000)
    } catch (error) {
      console.log('音频播放失败:', error)
    }
  }, [])

  if (!milestone) return null

  const config = celebrationConfig[milestone.celebrationLevel]

  // 类别图标映射
  const categoryIcons = {
    motor: '🏃‍♀️',
    language: '💬',
    cognitive: '🧠',
    social: '👋',
    emotional: '❤️',
    first_time: '⭐',
    birthday: '🎂'
  }

  const categoryColors = {
    motor: 'from-green-400 to-emerald-500',
    language: 'from-blue-400 to-indigo-500',
    cognitive: 'from-purple-400 to-pink-500',
    social: 'from-yellow-400 to-orange-500',
    emotional: 'from-pink-400 to-rose-500',
    first_time: 'from-red-400 to-pink-500',
    birthday: 'from-pink-500 to-purple-500'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 背景遮罩 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 庆祝效果容器 */}
          {showEffects && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* 光环效果 */}
              <LightRing delay={0.5} size={100} />
              <LightRing delay={1} size={200} />
              <LightRing delay={1.5} size={300} />

              {/* 音符效果 */}
              <MusicNote delay={2} x={20} y={30} />
              <MusicNote delay={2.3} x={70} y={20} />
              <MusicNote delay={2.6} x={85} y={60} />
              <MusicNote delay={2.9} x={30} y={80} />

              {/* 彩带粒子 */}
              {Array.from({ length: config.particleCount }).map((_, i) => (
                <ConfettiParticle
                  key={i}
                  delay={Math.random() * 2}
                  color={config.colors[i % config.colors.length]}
                  duration={config.animationDuration}
                  x={Math.random() * 100}
                  rotation={Math.random() * 360}
                />
              ))}

              {/* 星星爆炸 */}
              {Array.from({ length: 8 }).map((_, i) => (
                <StarBurst
                  key={`star-${i}`}
                  delay={0.3 + i * 0.2}
                  x={15 + Math.random() * 70}
                  y={20 + Math.random() * 40}
                  color={config.colors[i % config.colors.length]}
                />
              ))}

              {/* 漂浮的爱心 */}
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`heart-${i}`}
                  className="absolute text-pink-400 text-2xl"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    bottom: -20
                  }}
                  initial={{ y: 0, opacity: 0, scale: 0 }}
                  animate={{
                    y: [-50, -400, -600],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5],
                    x: [0, Math.random() * 100 - 50, 0]
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    delay: i * 0.5,
                    ease: "easeOut",
                    repeat: Infinity,
                    repeatDelay: 3 + Math.random() * 2
                  }}
                >
                  ❤️
                </motion.div>
              ))}
            </div>
          )}

          {/* 庆祝卡片 */}
          <motion.div
            className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            initial={{ scale: 0.5, y: 100, rotate: -5 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.5, y: 100, rotate: 5 }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 300,
              duration: 0.8
            }}
          >
            {/* 顶部装饰条 */}
            <div className={`h-2 bg-gradient-to-r ${config.borderGradient}`} />

            {/* 主要内容 */}
            <div className="p-8">
              {/* 顶部图标区域 */}
              <motion.div
                className="relative mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="w-24 h-24 mx-auto relative">
                  {/* 背景光晕 */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${categoryColors[milestone.category]} rounded-full blur-xl opacity-30 animate-pulse`} />

                  {/* 主图标 */}
                  <div className={`relative w-full h-full bg-gradient-to-r ${categoryColors[milestone.category]} rounded-2xl flex items-center justify-center text-5xl shadow-lg transform transition-transform duration-300 hover:scale-110`}>
                    {categoryIcons[milestone.category]}
                  </div>

                  {/* 重要性标记 */}
                  {milestone.importance >= 8 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    >
                      <Trophy className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>

                {/* 庆祝级别徽章 */}
                <motion.div
                  className="mt-4 text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring" }}
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${config.bgGradient} rounded-full border border-gray-200`}>
                    {milestone.celebrationLevel === 'diamond' && <Stars className="w-4 h-4 text-blue-500" />}
                    {milestone.celebrationLevel === 'gold' && <Trophy className="w-4 h-4 text-yellow-500" />}
                    {milestone.celebrationLevel === 'silver' && <Gift className="w-4 h-4 text-gray-500" />}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {milestone.celebrationLevel} 成就
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* 标题和年龄 */}
              <motion.div
                className="text-center mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                  {milestone.title}
                </h2>
                <div className="flex items-center justify-center gap-3 text-gray-500">
                  <span className="flex items-center gap-1">
                    <Baby className="w-4 h-4" />
                    {milestone.age}
                  </span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${categoryColors[milestone.category]} text-white`}>
                    {milestone.category === 'motor' && '运动发展'}
                    {milestone.category === 'language' && '语言发展'}
                    {milestone.category === 'cognitive' && '认知发展'}
                    {milestone.category === 'social' && '社交发展'}
                    {milestone.category === 'emotional' && '情感发展'}
                    {milestone.category === 'first_time' && '第一次'}
                    {milestone.category === 'birthday' && '生日庆祝'}
                  </span>
                </div>
              </motion.div>

              {/* 描述 */}
              <motion.p
                className="text-gray-600 text-center mb-6 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {milestone.description}
              </motion.p>

              {/* 成就列表 */}
              {milestone.achievements && milestone.achievements.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    关键成就
                  </h3>
                  <div className="space-y-2">
                    {milestone.achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-700">{achievement}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 家庭反应 */}
              {milestone.familyReaction && milestone.familyReaction.length > 0 && (
                <motion.div
                  className="mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    家庭反应
                  </h3>
                  <div className="space-y-2">
                    {milestone.familyReaction.map((reaction, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <div className="w-2 h-2 bg-pink-500 rounded-full" />
                        <span className="text-sm text-gray-700">{reaction}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 个性化消息 */}
              {milestone.personalizedMessage && (
                <motion.div
                  className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-sm text-gray-600 italic text-center">
                    "{milestone.personalizedMessage}"
                  </p>
                </motion.div>
              )}

              {/* 操作按钮 */}
              <motion.div
                className="flex gap-3 justify-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <button
                  onClick={() => onSave?.(milestone)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  保存记录
                </button>
                <button
                  onClick={() => onShare?.(milestone)}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105"
                >
                  <Share className="w-4 h-4" />
                  分享喜悦
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
                >
                  继续探索
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* 播放状态指示 */}
              {isPlaying && (
                <motion.div
                  className="flex items-center justify-center gap-2 mt-4 text-purple-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Music className="w-4 h-4 animate-pulse" />
                  <span className="text-sm">庆祝音乐播放中...</span>
                </motion.div>
              )}
            </div>

            {/* 步骤指示器 */}
            <div className="px-6 pb-4">
              <div className="flex justify-center gap-2">
                {celebrationSteps.map((step, index) => {
                  const Icon = step.icon
                  const isActive = currentStep >= index
                  return (
                    <motion.div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: isActive ? 1 : 0.8 }}
                      transition={{ delay: step.delay / 1000 }}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}