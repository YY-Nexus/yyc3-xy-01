'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBirthdayTheme } from './BirthdayThemeProvider'

// 气球装饰组件
function Balloon({ delay, x, y, color, swayAmount }: {
  delay: number
  x: number
  y: number
  color: string
  swayAmount: number
}) {
  const [isPopped, setIsPopped] = useState(false)

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity: isPopped ? 0 : 1
      }}
      initial={{ y: 600, opacity: 0 }}
      animate={{
        y: isPopped ? -100 : 0,
        opacity: isPopped ? 0 : 1,
        x: isPopped ? (Math.random() - 0.5) * 200 : swayAmount * Math.sin(Date.now() * 0.001 + delay),
        rotate: isPopped ? 360 : -5 + Math.sin(Date.now() * 0.001 + delay) * 5
      }}
      transition={{
        y: { duration: 4 + delay, ease: "easeOut" },
        opacity: { duration: 0.3 },
        x: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
      onClick={() => setIsPopped(true)}
    >
      <svg width="60" height="80" viewBox="0 0 60 80">
        {/* 气球主体 */}
        <ellipse
          cx="30"
          cy="30"
          rx="25"
          ry="30"
          fill={color}
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
        />
        {/* 气球高光 */}
        <ellipse
          cx="20"
          cy="20"
          rx="8"
          ry="12"
          fill="rgba(255,255,255,0.6)"
        />
        {/* 气球绳子 */}
        <path
          d="M30 60 L30 75"
          stroke="#666"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* 爆炸效果 */}
      <AnimatePresence>
        {isPopped && (
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0 }}
            animate={{ scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, Math.cos((i * 60) * Math.PI / 180) * 50],
                    y: [0, Math.sin((i * 60) * Math.PI / 180) * 50]
                  }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// 彩带组件
function Confetti({ delay, x, rotation }: {
  delay: number
  x: number
  rotation: number
}) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA']
  const color = colors[Math.floor(Math.random() * colors.length)]

  return (
    <motion.div
      className="absolute w-3 h-6"
      style={{
        backgroundColor: color,
        left: `${x}%`,
        top: -20,
        transform: `rotate(${rotation}deg)`
      }}
      initial={{ y: 0, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 400, 600],
        rotate: [0, rotation + 180, rotation + 360],
        opacity: [1, 1, 0],
        x: [0, Math.sin(delay) * 50, 0]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 2 + Math.random() * 3
      }}
    />
  )
}

// 星星闪烁效果
function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`
      }}
      initial={{ scale: 0, opacity: 0, rotate: 0 }}
      animate={{
        scale: [0, 1, 0],
        opacity: [0, 1, 0],
        rotate: [0, 360]
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
        repeat: Infinity,
        repeatDelay: 1 + Math.random() * 2
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path
          d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
          fill="#FFD700"
          stroke="#FFA500"
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  )
}

// 丝带装饰
function Ribbon({ delay, x, color }: {
  delay: number
  x: number
  color: string
}) {
  return (
    <motion.div
      className="absolute w-16 h-32"
      style={{
        left: `${x}%`,
        top: 0
      }}
      initial={{ y: -100, rotate: -45 }}
      animate={{
        y: 0,
        rotate: [-45, -40, -50, -45]
      }}
      transition={{
        y: { duration: 2, delay, ease: "bounce" },
        rotate: { duration: 3, delay, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      <svg width="64" height="128" viewBox="0 0 64 128">
        <path
          d="M0 0 L64 0 L48 16 L16 16 Z"
          fill={color}
          opacity="0.8"
        />
        <path
          d="M16 16 L48 16 L64 32 L0 32 Z"
          fill={color}
          opacity="0.6"
        />
        <path
          d="M0 32 L64 32 L48 48 L16 48 Z"
          fill={color}
          opacity="0.4"
        />
      </svg>
    </motion.div>
  )
}

// 生日蛋糕装饰
function BirthdayCake({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute bottom-4 right-4"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring"
      }}
    >
      <div className="relative">
        {/* 蛋糕层 */}
        <div className="w-20 h-16 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-lg">
          <div className="w-full h-4 bg-pink-400 rounded-t-lg" />
        </div>

        {/* 蜡烛 */}
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="w-1 h-6 bg-pink-300" />
          <motion.div
            className="w-2 h-3 bg-orange-400 rounded-full -ml-0.5"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function BirthdayDecorations() {
  const { theme, isActive, decorations } = useBirthdayTheme()

  if (!isActive) return null

  const balloonColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3']
  const ribbonColors = ['#EC4899', '#A855F7', '#F59E0B', '#10B981']

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {/* 气球装饰 */}
      {decorations.balloons && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <Balloon
              key={`balloon-${i}`}
              delay={i * 0.3}
              x={10 + i * 12}
              y={Math.random() * 60 + 10}
              color={balloonColors[i % balloonColors.length]}
              swayAmount={Math.sin(i) * 30}
            />
          ))}
        </>
      )}

      {/* 彩带效果 */}
      {decorations.confetti && (
        <>
          {Array.from({ length: 15 }).map((_, i) => (
            <Confetti
              key={`confetti-${i}`}
              delay={i * 0.2}
              x={Math.random() * 100}
              rotation={Math.random() * 360}
            />
          ))}
        </>
      )}

      {/* 星星闪烁 */}
      {decorations.sparkles && (
        <>
          {Array.from({ length: 10 }).map((_, i) => (
            <Sparkle
              key={`sparkle-${i}`}
              delay={i * 0.5}
              x={Math.random() * 100}
              y={Math.random() * 100}
            />
          ))}
        </>
      )}

      {/* 丝带装饰 */}
      {decorations.ribbons && (
        <>
          {Array.from({ length: 4 }).map((_, i) => (
            <Ribbon
              key={`ribbon-${i}`}
              delay={i * 0.4}
              x={15 + i * 25}
              color={ribbonColors[i % ribbonColors.length]}
            />
          ))}
        </>
      )}

      {/* 生日蛋糕装饰 */}
      <BirthdayCake delay={2} />

      {/* 主题背景渐变 */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
        >
          <div
            className="w-full h-full"
            style={{
              background: theme.colors.background,
              mixBlendMode: 'multiply'
            }}
          />
        </motion.div>
      )}
    </div>
  )
}