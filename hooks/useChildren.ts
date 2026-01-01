/**
 * @file useChildren.ts
 * @description YYC³ AI小语智能成长守护系统儿童信息Hook，提供儿童数据管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import React, { useState, useEffect, useCallback } from "react"
import { db, type Child } from "@/lib/db/client"

interface UseChildrenReturn {
  children: Child[]
  currentChild: Child | null
  isLoading: boolean
  error: string | null
  setCurrentChild: (child: Child | null) => void
  addChild: (data: Omit<Child, "id" | "created_at">) => Promise<Child>
  updateChild: (id: string, data: Partial<Child>) => Promise<Child | null>
  deleteChild: (id: string) => Promise<boolean>
  refreshChildren: () => Promise<void>
}

export function useChildren(userId?: string): UseChildrenReturn {
  const [children, setChildren] = useState<Child[]>([])
  const [currentChild, setCurrentChild] = useState<Child | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadChildren = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      await db.seedMockData()
      const data = await db.findMany<Child>("children", (child) => (userId ? child.user_id === userId : true))
      setChildren(data)

      // 自动选择第一个孩子作为当前孩子
      if (data.length > 0 && !currentChild) {
        setCurrentChild(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadChildren()
  }, [loadChildren])

  const addChild = useCallback(async (data: Omit<Child, "id" | "created_at">): Promise<Child> => {
    const newChild = await db.create<Child>("children", data)
    setChildren((prev) => [...prev, newChild])
    return newChild
  }, [])

  const updateChild = useCallback(
    async (id: string, data: Partial<Child>): Promise<Child | null> => {
      const updated = await db.update<Child>("children", id, data)
      if (updated) {
        setChildren((prev) => prev.map((c) => (c.id === id ? updated : c)))
        if (currentChild?.id === id) {
          setCurrentChild(updated)
        }
      }
      return updated
    },
    [currentChild],
  )

  const deleteChild = useCallback(
    async (id: string): Promise<boolean> => {
      const success = await db.delete("children", id)
      if (success) {
        setChildren((prev) => prev.filter((c) => c.id !== id))
        if (currentChild?.id === id) {
          setCurrentChild(null)
        }
      }
      return success
    },
    [currentChild],
  )

  return {
    children,
    currentChild,
    isLoading,
    error,
    setCurrentChild,
    addChild,
    updateChild,
    deleteChild,
    refreshChildren: loadChildren,
  }
}
