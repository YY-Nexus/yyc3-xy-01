/**
 * @file useChildren-mock.ts
 * @description YYC³ AI小语智能成长守护系统儿童信息Mock Hook，提供模拟儿童数据管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useCallback } from "react"

// Mock data types
interface MockChild {
  id: string
  user_id: string
  name: string
  nickname: string
  birth_date: string
  gender: 'male' | 'female'
  created_at: string
}

interface UseChildrenReturn {
  children: MockChild[]
  currentChild: MockChild | null
  isLoading: boolean
  error: string | null
  setCurrentChild: (child: MockChild | null) => void
  addChild: (data: Omit<MockChild, "id" | "created_at">) => Promise<MockChild>
  updateChild: (id: string, data: Partial<MockChild>) => Promise<MockChild | null>
  deleteChild: (id: string) => Promise<boolean>
  refreshChildren: () => Promise<void>
}

// Mock data
const mockChildren: MockChild[] = [
  {
    id: "mock-child-1",
    user_id: "mock-user-1",
    name: "沫言",
    nickname: "小言",
    birth_date: "2020-01-01",
    gender: "male",
    created_at: new Date().toISOString()
  },
  {
    id: "mock-child-2",
    user_id: "mock-user-1",
    name: "沫语",
    nickname: "小语",
    birth_date: "2022-06-15",
    gender: "female",
    created_at: new Date().toISOString()
  }
]

export function useChildrenMock(userId?: string): UseChildrenReturn {
  const [children, setChildren] = useState<MockChild[]>([])
  const [currentChild, setCurrentChild] = useState<MockChild | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadChildren = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Filter by user_id if provided
      const data = userId ? mockChildren.filter(child => child.user_id === userId) : mockChildren
      setChildren(data)

      // Auto-select first child as current child
      if (data.length > 0 && !currentChild) {
        setCurrentChild(data[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setIsLoading(false)
    }
  }, [userId, currentChild])

  useEffect(() => {
    loadChildren()
  }, [loadChildren])

  const addChild = useCallback(async (data: Omit<MockChild, "id" | "created_at">): Promise<MockChild> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const newChild: MockChild = {
      ...data,
      id: `mock-child-${Date.now()}`,
      created_at: new Date().toISOString()
    }

    setChildren((prev) => [...prev, newChild])
    return newChild
  }, [])

  const updateChild = useCallback(
    async (id: string, data: Partial<MockChild>): Promise<MockChild | null> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const updated = { ...mockChildren.find(c => c.id === id), ...data } as MockChild
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      const success = true
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