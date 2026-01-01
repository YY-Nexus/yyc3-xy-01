/**
 * @file useGrowthStage.ts
 * @description 成长阶段Hook，提供成长阶段管理和推荐功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { AgeStageConfig } from "@/types/growth"
import { getGrowthStageManager, GrowthStageManager } from "@/lib/growth_stages"
import { getStageRecommendations } from "@/lib/growth_stages"

export interface UseGrowthStageResult {
  currentStage: AgeStageConfig | null
  exactAge: { years: number; months: number; days: number } | null
  ageInMonths: number | null
  milestoneProgress: { completed: number; total: number; upcoming: string[] }
  approachingNextStage: { approaching: boolean; daysUntil: number; nextStage: string | null }
  recommendations: {
    activities: string[]
    books: string[]
    skills: string[]
    warnings: string[]
  }
  setChildBirthDate: (date: Date) => void
  formatAge: () => string
}

export function useGrowthStage(initialBirthDate: Date | undefined): UseGrowthStageResult {
  const [currentStage, setCurrentStage] = useState<AgeStageConfig | null>(null)
  const [exactAge, setExactAge] = useState<{ years: number; months: number; days: number } | null>(null)
  const [ageInMonths, setAgeInMonths] = useState<number | null>(null)
  const [milestoneProgress, setMilestoneProgress] = useState({ completed: 0, total: 0, upcoming: [] as string[] })
  const [approachingNextStage, setApproachingNextStage] = useState({
    approaching: false,
    daysUntil: 0,
    nextStage: null as string | null,
  })
  const [recommendations, setRecommendations] = useState({
    activities: [] as string[],
    books: [] as string[],
    skills: [] as string[],
    warnings: [] as string[],
  })

  // 使用 useRef 保持稳定的 manager 引用
  const managerRef = useRef<GrowthStageManager>(getGrowthStageManager())

  const updateStageData = useCallback(() => {
    const manager = managerRef.current
    const stage = manager.getCurrentStageConfig()

    // 防止无限循环：只有在值真正改变时才更新状态
    setCurrentStage((prev: AgeStageConfig | null) => {
      if (prev?.id !== stage?.id) return stage
      return prev
    })

    setExactAge((prev: { years: number; months: number; days: number } | null) => {
      const newAge = manager.getExactAge()
      if (!newAge) return null
      if (!prev || prev.years !== newAge?.years || prev.months !== newAge?.months || prev.days !== newAge?.days) {
        return newAge
      }
      return prev
    })

    setAgeInMonths((prev: number | null) => {
      const newMonths = manager.getAgeInMonths()
      if (prev !== newMonths) return newMonths
      return prev
    })

    setMilestoneProgress((prev: { completed: number; total: number; upcoming: string[] }) => {
      const newProgress = manager.getMilestoneProgress()
      if (prev.completed !== newProgress.completed || prev.total !== newProgress.total) {
        return newProgress
      }
      return prev
    })

    setApproachingNextStage((prev: { approaching: boolean; daysUntil: number; nextStage: string | null }) => {
      const newApproaching = manager.isApproachingNextStage()
      if (prev.approaching !== newApproaching.approaching || prev.daysUntil !== newApproaching.daysUntil) {
        return newApproaching
      }
      return prev
    })

    if (stage) {
      setRecommendations((prev: { activities: string[]; books: string[]; skills: string[]; warnings: string[] }) => {
        const newRecommendations = getStageRecommendations(stage.id)
        // 简单比较，避免深度比较
        if (JSON.stringify(prev) !== JSON.stringify(newRecommendations)) {
          return newRecommendations
        }
        return prev
      })
    }
  }, []) // 移除 manager 依赖，使用 ref 保持稳定

  const setChildBirthDate = useCallback(
    (date: Date) => {
      const manager = managerRef.current
      manager.setChildBirthDate(date)
      updateStageData()
    },
    [updateStageData],
  )

  const formatAge = useCallback((): string => {
    if (!exactAge) return "未设置"

    const parts = []
    if (exactAge.years > 0) parts.push(`${exactAge.years}岁`)
    if (exactAge.months > 0) parts.push(`${exactAge.months}个月`)
    if (exactAge.years === 0 && exactAge.days > 0) parts.push(`${exactAge.days}天`)

    return parts.join("") || "刚出生"
  }, [exactAge])

  // 初始更新数据
  useEffect(() => {
    if (initialBirthDate) {
      managerRef.current.setChildBirthDate(initialBirthDate)
    }
    updateStageData()
  }, [initialBirthDate, updateStageData])

  // 监听阶段变化
  useEffect(() => {
    const manager = managerRef.current
    const handleStageChange = (stage: string) => {
      updateStageData()
    }

    const unsubscribe = manager.onStageChange(handleStageChange)

    return () => {
      unsubscribe()
    }
  }, [updateStageData])

  return {
    currentStage,
    exactAge,
    ageInMonths,
    milestoneProgress,
    approachingNextStage,
    recommendations,
    setChildBirthDate,
    formatAge,
  }
}
