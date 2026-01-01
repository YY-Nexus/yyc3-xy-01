/**
 * @file OptimizedImage.tsx
 * @description YYC³ AI小语智能成长守护系统优化图片组件，提供图片加载优化和懒加载功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (priority || !imgRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px", threshold: 0.01 },
    )

    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  const defaultBlur =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PC9zdmc+"

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      {/* 占位背景 */}
      {placeholder === "blur" && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-xl scale-110"
          style={{ backgroundImage: `url(${blurDataURL || defaultBlur})` }}
        />
      )}

      {/* 空占位 */}
      {placeholder === "empty" && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse" />
      )}

      {/* 实际图片 */}
      {isInView && !hasError && (
        <motion.img
          src={src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          onError={handleError}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={cn("w-full h-full object-cover", !isLoaded && "invisible")}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}

      {/* 错误状态 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <div className="text-center text-slate-400">
            <i className="ri-image-line text-2xl" />
            <p className="text-xs mt-1">加载失败</p>
          </div>
        </div>
      )}
    </div>
  )
}
