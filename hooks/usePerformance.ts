/**
 * @file usePerformance.ts
 * @description 性能优化Hook，提供缓存和性能监控功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useEffect, useCallback, useRef } from "react"
import { cacheManager, preloader, perfMarker } from "@/lib/performance"

// 缓存数据Hook
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number; revalidate?: boolean } = {},
) {
  const { ttl = 5 * 60 * 1000, revalidate = false } = options
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const getData = useCallback(async (): Promise<T> => {
    // 先检查缓存
    const cached = cacheManager.get<T>(key)
    if (cached && !revalidate) {
      return cached
    }

    // 获取新数据
    const data = await fetcherRef.current()
    cacheManager.set(key, data, ttl)
    return data
  }, [key, ttl, revalidate])

  return { getData, invalidate: () => cacheManager.set(key, null, 0) }
}

// 页面预加载Hook
export function usePagePrefetch(paths: string[]) {
  useEffect(() => {
    // 等待主线程空闲时预加载
    if ("requestIdleCallback" in window) {
      const handle = requestIdleCallback(() => {
        paths.forEach((path) => preloader.prefetch(path))
      })
      return () => cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(() => {
        paths.forEach((path) => preloader.prefetch(path))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [paths])
}

// 性能追踪Hook
export function usePerformanceTracking(componentName: string) {
  const startMark = `${componentName}_render_start`

  useEffect(() => {
    perfMarker.mark(startMark)

    return () => {
      const duration = perfMarker.logTiming(`${componentName}_render`, startMark)
      if (duration && duration > 100) {
        console.warn(`[Perf Warning] ${componentName} render took ${duration.toFixed(2)}ms`)
      }
    }
  }, [componentName, startMark])
}

// 可见性监听Hook
export function useVisibility(callback: (isVisible: boolean) => void, options: IntersectionObserverInit = {}) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(([entry]) => callback(entry.isIntersecting), {
      threshold: 0.1,
      ...options,
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [callback, options])

  return elementRef
}

// 延迟加载Hook
export function useDeferredRender(delay = 100) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShouldRender(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return shouldRender
}

import { useState } from "react"
