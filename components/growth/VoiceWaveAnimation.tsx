"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

interface VoiceWaveAnimationProps {
  isActive: boolean
  audioLevel?: number
  color?: string
  barCount?: number
  className?: string
}

export default function VoiceWaveAnimation({
  isActive,
  audioLevel = 0,
  color = "#3b82f6",
  barCount = 5,
  className = "",
}: VoiceWaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / (barCount * 2)
    const gap = barWidth

    let time = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < barCount; i++) {
        const x = gap + i * (barWidth + gap)

        // 基于audioLevel和时间计算高度
        const baseHeight = isActive ? 10 + audioLevel * 0.3 : 4
        const waveHeight = isActive
          ? Math.sin(time * 0.1 + i * 0.5) * (20 + audioLevel * 0.2)
          : Math.sin(time * 0.05 + i * 0.3) * 3

        const barHeight = Math.max(4, baseHeight + waveHeight)
        const y = (height - barHeight) / 2

        // 渐变颜色
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, isActive ? "#8b5cf6" : "#94a3b8")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2)
        ctx.fill()
      }

      time++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, audioLevel, color, barCount])

  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
      transition={{ duration: 0.5, repeat: isActive ? Number.POSITIVE_INFINITY : 0 }}
    >
      <canvas ref={canvasRef} width={80} height={40} className="block" />
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-400/20"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
        />
      )}
    </motion.div>
  )
}
