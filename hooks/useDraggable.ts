/**
 * @file useDraggable.ts
 * @description 拖拽功能Hook，提供组件拖拽和定位功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useViewportAwareness } from "./useViewportAwareness"
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem, cleanCorruptedLocalStorageData } from "@/lib/localstorage-safe"

interface Position {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  scalable?: boolean
  resizeHandles?: ('top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right')[]
}

interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

interface ResizeState {
  isResizing: boolean
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  direction: string | null
}

interface UseDraggableOptions {
  initialPosition?: Position
  initialSize?: Size
  disabled?: boolean
  boundary?: HTMLElement | null
  onDragStart?: (position: Position) => void
  onDragEnd?: (position: Position) => void
  onResizeStart?: (size: Size) => void
  onResizeEnd?: (size: Size) => void
  resizable?: boolean
  autoResize?: boolean
  contentAwareResize?: boolean
  magneticThreshold?: number
  magneticZones?: Array<{ x: number; y: number; width: number; height: number; strength?: number }>
  persistPosition?: boolean
  persistSize?: boolean
  storageKey?: string
  enableMagneticSnapping?: boolean
}

interface UseDraggableReturn {
  position: Position
  size: Size
  isDragging: boolean
  isResizing: boolean
  dragRef: React.RefObject<HTMLDivElement>
  handleMouseDown: (e: React.MouseEvent) => void
  handleTouchStart: (e: React.TouchEvent) => void
  resetPosition: () => void
  setPosition: (position: Position) => void
  setSize: (size: Partial<Size>) => void
  resizeHandles: React.ReactNode | null
}

export function useDraggable(options: UseDraggableOptions = {}): UseDraggableReturn {
  const {
    initialPosition = { x: 100, y: 100 },
    initialSize = { width: 320, height: 450, minWidth: 280, maxWidth: 600, minHeight: 200, maxHeight: 800 },
    disabled = false,
    boundary = null,
    onDragStart,
    onDragEnd,
    onResizeStart,
    onResizeEnd,
    resizable = true,
    autoResize = true,
    contentAwareResize = true,
    magneticThreshold = 15,
    magneticZones = [],
    persistPosition = true,
    persistSize = true,
    storageKey = "draggable-element",
    enableMagneticSnapping = true,
  } = options

  // 状态管理
  const [position, setPositionState] = useState<Position>(initialPosition)
  const [size, setSizeState] = useState<Size>(initialSize)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  })
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    direction: null,
  })

  // 引用管理
  const dragRef = useRef<HTMLDivElement>(null)
  const isMounted = useRef(true)

  // 从localStorage恢复位置和大小 - 使用安全的localStorage操作
  useEffect(() => {
    if (typeof window === "undefined") return

    // 首先清理损坏的数据
    cleanCorruptedLocalStorageData()

    if (persistPosition) {
      const savedPosition = safeLocalStorageGetItem(`${storageKey}-position`)
      if (savedPosition) {
        try {
          const pos = JSON.parse(savedPosition)
          setPositionState(pos)
        } catch (error) {
          console.warn("Failed to parse position data:", error)
          safeLocalStorageRemoveItem(`${storageKey}-position`)
        }
      }
    }

    if (persistSize) {
      const savedSize = safeLocalStorageGetItem(`${storageKey}-size`)
      if (savedSize) {
        try {
          const sz = JSON.parse(savedSize)
          setSizeState(prev => ({ ...prev, ...sz }))
        } catch (error) {
          console.warn("Failed to parse size data:", error)
          safeLocalStorageRemoveItem(`${storageKey}-size`)
        }
      }
    }
  }, [storageKey, persistPosition, persistSize])

  // 智能磁性吸附
  const { adjustPosition } = useViewportAwareness({
    padding: 20,
    respectSafeArea: true,
    onViewportChange: (newViewport) => {
      if (dragRef.current && isMounted.current) {
        const rect = dragRef.current.getBoundingClientRect()
        const currentPos = { x: position.x, y: position.y }
        const elementSize = { width: rect.width, height: rect.height }
        const adjustedPos = adjustPosition(currentPos, elementSize)
        setPositionState(adjustedPos)
      }
    },
    onOutOfBounds: (originalPos, adjustment) => {
      console.log(`元素超出边界，自动调整: x=${adjustment.x}, y=${adjustment.y}`)
    }
  })

  // 保存到localStorage - 使用安全操作
  const saveToStorage = useCallback((pos: Position, sz: Size) => {
    if (typeof window === "undefined") return

    if (persistPosition) {
      safeLocalStorageSetItem(`${storageKey}-position`, pos)
    }
    if (persistSize) {
      safeLocalStorageSetItem(`${storageKey}-size`, sz)
    }
  }, [storageKey, persistPosition, persistSize])

  // 磁性吸附检测
  const getMagneticAdjustment = useCallback((currentPos: Position): Position => {
    if (!enableMagneticSnapping) return currentPos

    let adjustedPos = { ...currentPos }
    let maxInfluence = magneticThreshold

    // 检查其他磁性区域的吸附
    magneticZones.forEach(zone => {
      const zoneRight = zone.x + zone.width
      const zoneBottom = zone.y + zone.height
      const strength = zone.strength || magneticThreshold

      // 右边界吸附
      if (Math.abs(currentPos.x - zoneRight) < strength &&
          currentPos.y >= zone.y &&
          currentPos.y <= zoneBottom) {
        adjustedPos.x = zoneRight
        maxInfluence = Math.max(maxInfluence, strength)
      }

      // 左边界吸附
      if (Math.abs(currentPos.x + size.width - zone.x) < strength &&
          currentPos.y >= zone.y &&
          currentPos.y <= zoneBottom) {
        adjustedPos.x = zone.x - size.width
        maxInfluence = Math.max(maxInfluence, strength)
      }

      // 上边界吸附
      if (Math.abs(currentPos.y - zoneBottom) < strength &&
          currentPos.x >= zone.x &&
          currentPos.x <= zoneRight) {
        adjustedPos.y = zoneBottom
        maxInfluence = Math.max(maxInfluence, strength)
      }

      // 下边界吸附
      if (Math.abs(currentPos.y + size.height - zone.y) < strength &&
          currentPos.x >= zone.x &&
          currentPos.x <= zoneRight) {
        adjustedPos.y = zone.y - size.height
        maxInfluence = Math.max(maxInfluence, strength)
      }
    })

    // 视窗边界磁性吸附
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // 左边吸附
    if (currentPos.x < maxInfluence) {
      adjustedPos.x = 0
    }

    // 右边吸附
    if (currentPos.x + size.width > viewportWidth - maxInfluence) {
      adjustedPos.x = viewportWidth - size.width
    }

    // 上边吸附
    if (currentPos.y < maxInfluence) {
      adjustedPos.y = 0
    }

    // 下边吸附
    if (currentPos.y + size.height > viewportHeight - maxInfluence) {
      adjustedPos.y = viewportHeight - size.height
    }

    return adjustedPos
  }, [enableMagneticSnapping, magneticZones, magneticThreshold, size])

  // 边界约束
  const constrainToBoundary = useCallback((pos: Position, sz: Size): Position => {
    if (boundary) {
      const rect = boundary.getBoundingClientRect()
      const maxX = rect.left + rect.width - sz.width
      const maxY = rect.top + rect.height - sz.height

      return {
        x: Math.max(rect.left, Math.min(pos.x, maxX)),
        y: Math.max(rect.top, Math.min(pos.y, maxY)),
      }
    }

    // 视窗边界约束
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    return {
      x: Math.max(0, Math.min(pos.x, viewportWidth - sz.width)),
      y: Math.max(0, Math.min(pos.y, viewportHeight - sz.height)),
    }
  }, [boundary])

  // 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return

    e.preventDefault()
    const startX = e.clientX - position.x
    const startY = e.clientY - position.y

    setDragState({
      isDragging: true,
      startX,
      startY,
      currentX: e.clientX,
      currentY: e.clientY,
    })

    onDragStart?.(position)

    // 添加全局事件监听
    const handleMouseMove = (e: MouseEvent) => {
      if (!isMounted.current) return

      const newX = e.clientX - startX
      const newY = e.clientY - startY

      let adjustedPos = { x: newX, y: newY }

      // 应用磁性吸附
      adjustedPos = getMagneticAdjustment(adjustedPos)

      // 应用边界约束
      adjustedPos = constrainToBoundary(adjustedPos, size)

      setDragState(prev => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
      }))

      setPositionState(adjustedPos)
    }

    const handleMouseUp = () => {
      if (!isMounted.current) return

      setDragState(prev => ({ ...prev, isDragging: false }))

      const finalPos = getMagneticAdjustment(position)
      const constrainedPos = constrainToBoundary(finalPos, size)
      setPositionState(constrainedPos)
      saveToStorage(constrainedPos, size)

      onDragEnd?.(constrainedPos)

      // 移除全局事件监听
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [disabled, position, size, onDragStart, onDragEnd, getMagneticAdjustment, constrainToBoundary, saveToStorage])

  // 触摸支持
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return

    const touch = e.touches[0]
    const startX = touch.clientX - position.x
    const startY = touch.clientY - position.y

    setDragState({
      isDragging: true,
      startX,
      startY,
      currentX: touch.clientX,
      currentY: touch.clientY,
    })

    onDragStart?.(position)

    const handleTouchMove = (e: TouchEvent) => {
      if (!isMounted.current) return

      const touch = e.touches[0]
      const newX = touch.clientX - startX
      const newY = touch.clientY - startY

      let adjustedPos = { x: newX, y: newY }
      adjustedPos = getMagneticAdjustment(adjustedPos)
      adjustedPos = constrainToBoundary(adjustedPos, size)

      setDragState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
      }))

      setPositionState(adjustedPos)
    }

    const handleTouchEnd = () => {
      if (!isMounted.current) return

      setDragState(prev => ({ ...prev, isDragging: false }))

      const finalPos = getMagneticAdjustment(position)
      const constrainedPos = constrainToBoundary(finalPos, size)
      setPositionState(constrainedPos)
      saveToStorage(constrainedPos, size)

      onDragEnd?.(constrainedPos)

      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)
  }, [disabled, position, size, onDragStart, onDragEnd, getMagneticAdjustment, constrainToBoundary, saveToStorage])

  // 重置位置
  const resetPosition = useCallback(() => {
    const pos = getMagneticAdjustment(initialPosition)
    const constrainedPos = constrainToBoundary(pos, size)
    setPositionState(constrainedPos)
    saveToStorage(constrainedPos, size)
  }, [initialPosition, size, getMagneticAdjustment, constrainToBoundary, saveToStorage])

  // 手动设置位置
  const setPosition = useCallback((newPosition: Position) => {
    const adjustedPos = getMagneticAdjustment(newPosition)
    const constrainedPos = constrainToBoundary(adjustedPos, size)
    setPositionState(constrainedPos)
    saveToStorage(constrainedPos, size)
  }, [getMagneticAdjustment, constrainToBoundary, size, saveToStorage])

  // 手动设置大小
  const setSize = useCallback((newSize: Partial<Size>) => {
    const updatedSize = { ...size, ...newSize }
    setSizeState(updatedSize)
    saveToStorage(position, updatedSize)
  }, [size, position, saveToStorage])

  // 禁用缩放手柄以避免语法问题
  const resizeHandles = useMemo(() => null, [])

  // 组件卸载时清理
  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  return {
    position,
    size,
    isDragging: dragState.isDragging,
    isResizing: resizeState.isResizing,
    dragRef,
    handleMouseDown,
    handleTouchStart,
    resetPosition,
    setPosition,
    setSize,
    resizeHandles,
  }
}