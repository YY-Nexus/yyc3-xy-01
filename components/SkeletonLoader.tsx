/**
 * @file SkeletonLoader.tsx
 * @description 骨架屏加载组件，提供多种加载状态占位符
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular" | "rounded"
  width?: number | string
  height?: number | string
  animation?: "pulse" | "wave" | "none"
}

export function Skeleton({ className, variant = "rectangular", width, height, animation = "pulse" }: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-lg",
  }

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]",
    none: "",
  }

  return (
    <div
      className={cn("bg-slate-200", variantClasses[variant], animationClasses[animation], className)}
      style={{ width, height }}
    />
  )
}

// 预定义骨架屏组合
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" height={16} className="mb-2" />
          <Skeleton variant="text" width="40%" height={12} />
        </div>
      </div>
      <Skeleton variant="rounded" height={100} className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="rounded" width={60} height={24} />
        <Skeleton variant="rounded" width={60} height={24} />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
          <Skeleton variant="rounded" width={48} height={48} />
          <div className="flex-1">
            <Skeleton variant="text" width="70%" height={14} className="mb-2" />
            <Skeleton variant="text" width="50%" height={12} />
          </div>
          <Skeleton variant="circular" width={32} height={32} />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="text-center p-6">
      <Skeleton variant="circular" width={80} height={80} className="mx-auto mb-4" />
      <Skeleton variant="text" width={120} height={20} className="mx-auto mb-2" />
      <Skeleton variant="text" width={180} height={14} className="mx-auto mb-4" />
      <div className="flex justify-center gap-4">
        <div className="text-center">
          <Skeleton variant="text" width={40} height={24} className="mx-auto mb-1" />
          <Skeleton variant="text" width={60} height={12} className="mx-auto" />
        </div>
        <div className="text-center">
          <Skeleton variant="text" width={40} height={24} className="mx-auto mb-1" />
          <Skeleton variant="text" width={60} height={12} className="mx-auto" />
        </div>
      </div>
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4">
      <Skeleton variant="text" width={100} height={16} className="mb-4" />
      <div className="flex items-end gap-2 h-40">
        {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
          <Skeleton key={i} variant="rounded" className="flex-1" height={`${h}%`} />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text" width={24} height={12} />
        ))}
      </div>
    </div>
  )
}
