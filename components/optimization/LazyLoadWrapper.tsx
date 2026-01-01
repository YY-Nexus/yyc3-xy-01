/**
 * @file LazyLoadWrapper.tsx
 * @description YYC³ AI小语智能成长守护系统懒加载优化组件，提供组件懒加载和性能优化功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface LazyLoadWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
  rootMargin?: string
  delay?: number
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
}

export default function LazyLoadWrapper({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  delay = 0,
  className = '',
  onLoad,
  onError
}: LazyLoadWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let observer: IntersectionObserver
    let timeoutId: NodeJS.Timeout

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        // 延迟加载
        timeoutId = setTimeout(() => {
          setIsInView(true)
        }, delay)
      }
    }

    // 创建交叉观察器
    observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    })

    observer.observe(element)

    return () => {
      if (observer) {
        observer.disconnect()
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [threshold, rootMargin, delay])

  // 当组件进入视图时，模拟加载过程
  useEffect(() => {
    if (isInView && !isLoaded) {
      // 模拟异步加载
      const loadContent = async () => {
        try {
          // 模拟加载时间
          await new Promise(resolve => setTimeout(resolve, 100))
          setIsLoaded(true)
          onLoad?.()
        } catch (error) {
          setHasError(true)
          onError?.(error as Error)
        }
      }

      loadContent()
    }
  }, [isInView, isLoaded, onLoad, onError])

  const defaultFallback = (
    <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
  )

  const errorFallback = (
    <div className="flex items-center justify-center h-32 bg-red-50 rounded-lg">
      <div className="text-red-500 text-center">
        <i className="ri-error-warning-line text-2xl mb-1" />
        <p className="text-sm">加载失败</p>
      </div>
    </div>
  )

  return (
    <div ref={elementRef} className={className}>
      {hasError ? (
        errorFallback
      ) : isLoaded ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      ) : (
        fallback || defaultFallback
      )}
    </div>
  )
}

// Hook for lazy loading images
export function useLazyImage(src: string, options?: {
  threshold?: number
  rootMargin?: string
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return

    let observer: IntersectionObserver

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setIsLoading(true)

        const newImg = new Image()
        newImg.onload = () => {
          setImageSrc(src)
          setIsLoading(false)
        }
        newImg.onerror = () => {
          setError(new Error('Failed to load image'))
          setIsLoading(false)
        }
        newImg.src = src

        observer.disconnect()
      }
    }

    observer = new IntersectionObserver(handleIntersection, {
      threshold: options?.threshold || 0.1,
      rootMargin: options?.rootMargin || '50px'
    })

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [src, options])

  return { imageSrc, isLoading, error, imgRef }
}

// Lazy Image Component
export function LazyImage({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  ...props
}: {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  placeholder?: string
  [key: string]: unknown
}) {
  const { imageSrc, isLoading, error, imgRef } = useLazyImage(src)

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-center">
          <i className="ri-image-line text-2xl mb-1" />
          <p className="text-xs">图片加载失败</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
      )}

      <img
        ref={imgRef}
        src={imageSrc || placeholder}
        alt={alt}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        {...props}
      />
    </div>
  )
}

// Code Splitting Hook
export function useCodeSplit<T>(
  importFunction: () => Promise<{ default: T }>,
  condition = true
) {
  const [component, setComponent] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!condition) return

    setIsLoading(true)

    importFunction()
      .then(module => {
        setComponent(module.default)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err)
        setIsLoading(false)
      })
  }, [importFunction, condition])

  return { component, isLoading, error }
}

// Lazy Component Wrapper
export function LazyComponent<T extends React.ComponentType<unknown>>({
  importFunction,
  fallback,
  condition = true,
  ...props
}: {
  importFunction: () => Promise<{ default: T }>
  fallback?: React.ReactNode
  condition?: boolean
  [key: string]: unknown
}) {
  const { component, isLoading, error } = useCodeSplit(importFunction, condition)

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600 text-center">组件加载失败</p>
      </div>
    )
  }

  if (isLoading || !component) {
    return fallback || (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    )
  }

  const Component = component
  return <Component {...props} />
}