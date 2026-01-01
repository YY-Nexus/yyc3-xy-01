/**
 * @file useViewportAwareness.ts
 * @description YYC³ AI小语智能成长守护系统视口感知Hook，提供视口尺寸和边界检测功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface ViewportSize {
  width: number
  height: number
}

interface ViewportBounds {
  top: number
  right: number
  bottom: number
  left: number
}

interface UseViewportAwarenessConfig {
  padding?: number
  respectSafeArea?: boolean
  onViewportChange?: (viewport: ViewportSize, bounds: ViewportBounds) => void
  onOutOfBounds?: (position: { x: number; y: number }, adjustment: { x: number; y: number }) => void
}

interface UseViewportAwarenessReturn {
  viewport: ViewportSize
  bounds: ViewportBounds
  isOutOfBounds: boolean
  adjustPosition: (position: { x: number; y: number }, elementSize: { width: number; height: number }) => { x: number; y: number }
  isPositionValid: (position: { x: number; y: number }, elementSize: { width: number; height: number }) => boolean
}

export function useViewportAwareness(config: UseViewportAwarenessConfig = {}): UseViewportAwarenessReturn {
  const {
    padding = 20,
    respectSafeArea = true,
    onViewportChange,
    onOutOfBounds,
  } = config

  // 使用 ref 来存储配置值，避免依赖数组变化
  const configRef = useRef({ padding, respectSafeArea, onViewportChange, onOutOfBounds })

  // 只在基本配置改变时更新 ref，避免函数引用导致的无限循环
  useEffect(() => {
    configRef.current.padding = padding
    configRef.current.respectSafeArea = respectSafeArea
  }, [padding, respectSafeArea])

  // 单独处理回调函数的更新
  useEffect(() => {
    configRef.current.onViewportChange = onViewportChange
    configRef.current.onOutOfBounds = onOutOfBounds
  })

  const [viewport, setViewport] = useState<ViewportSize>({ width: 0, height: 0 })
  const [bounds, setBounds] = useState<ViewportBounds>({ top: 0, right: 0, bottom: 0, left: 0 })
  const [isOutOfBounds, setIsOutOfBounds] = useState(false)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)
  const lastValidPositionRef = useRef<{ x: number; y: number } | null>(null)

  // 更新视窗尺寸和边界
  useEffect(() => {
    if (typeof window === "undefined") return

    const updateViewport = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const { padding, respectSafeArea, onViewportChange } = configRef.current

      // 直接使用 ref 来避免状态依赖问题
      const currentViewport = { width, height }
      const currentBounds = {
        top: respectSafeArea ? Math.max(0, padding) : 0,
        left: Math.max(0, padding),
        right: respectSafeArea ? Math.min(width, width - padding) : width,
        bottom: respectSafeArea ? Math.min(height, height - padding) : height,
      }

      // 只在值真正改变时才更新状态
      setViewport(prev => {
        const hasChanged = prev.width !== currentViewport.width || prev.height !== currentViewport.height
        return hasChanged ? currentViewport : prev
      })

      setBounds(prev => {
        const hasChanged =
          prev.top !== currentBounds.top ||
          prev.left !== currentBounds.left ||
          prev.right !== currentBounds.right ||
          prev.bottom !== currentBounds.bottom
        return hasChanged ? currentBounds : prev
      })

      // 安全地调用回调函数
      try {
        onViewportChange?.(currentViewport, currentBounds)
      } catch (error) {
        console.warn('useViewportAwareness: onViewportChange callback failed', error)
      }
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    window.addEventListener("orientationchange", updateViewport)

    return () => {
      window.removeEventListener("resize", updateViewport)
      window.removeEventListener("orientationchange", updateViewport)
    }
  }, []) // 移除所有依赖，只运行一次

  // 检查位置是否有效
  const isPositionValid = useCallback(
    (position: { x: number; y: number }, elementSize: { width: number; height: number }): boolean => {
      return (
        position.x >= bounds.left &&
        position.y >= bounds.top &&
        position.x + elementSize.width <= bounds.right &&
        position.y + elementSize.height <= bounds.bottom
      )
    },
    [bounds],
  )

  // 自动调整位置到边界内
  const adjustPosition = useCallback(
    (position: { x: number; y: number }, elementSize: { width: number; height: number }): { x: number; y: number } => {
      let adjustedX = position.x
      let adjustedY = position.y

      // 左边界检查
      if (adjustedX < bounds.left) {
        adjustedX = bounds.left
      }

      // 右边界检查
      if (adjustedX + elementSize.width > bounds.right) {
        adjustedX = bounds.right - elementSize.width
      }

      // 上边界检查
      if (adjustedY < bounds.top) {
        adjustedY = bounds.top
      }

      // 下边界检查
      if (adjustedY + elementSize.height > bounds.bottom) {
        adjustedY = bounds.bottom - elementSize.height
      }

      const adjusted = { x: adjustedX, y: adjustedY }

      // 检查是否需要调整
      const needsAdjustment = !isPositionValid(position, elementSize)

      if (needsAdjustment) {
        setIsOutOfBounds(true)
        // 使用 configRef 来获取最新的回调函数
        const { onOutOfBounds } = configRef.current
        onOutOfBounds?.(position, {
          x: adjustedX - position.x,
          y: adjustedY - position.y,
        })
      } else {
        setIsOutOfBounds(false)
        lastValidPositionRef.current = adjusted
      }

      return adjusted
    },
    [bounds, isPositionValid],
  )

  return {
    viewport,
    bounds,
    isOutOfBounds,
    adjustPosition,
    isPositionValid,
  }
}