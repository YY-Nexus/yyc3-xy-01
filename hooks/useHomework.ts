/**
 * @file useHomework.ts
 * @description YYC³ AI小语智能成长守护系统作业管理Hook，提供作业创建、更新和查询功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import useSWR from "swr"

interface Homework {
  id: string
  child_id: string
  subject: string
  title: string
  description?: string
  due_date: string
  status: "pending" | "in_progress" | "completed" | "overdue"
  priority: "low" | "normal" | "high"
  created_at: string
  updated_at?: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useHomework(childId?: string, status?: string) {
  const params = new URLSearchParams()
  if (childId) params.append("childId", childId)
  if (status) params.append("status", status)

  const { data, error, mutate } = useSWR(`/api/homework?${params.toString()}`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const updateHomework = async (id: string, updates: Partial<Homework>) => {
    try {
      const response = await fetch(`/api/homework/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to update homework")

      mutate()
      return await response.json()
    } catch (error) {
      console.error("[v0] Error updating homework:", error)
      throw error
    }
  }

  const createHomework = async (homework: Omit<Homework, "id" | "created_at">) => {
    try {
      const response = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(homework),
      })

      if (!response.ok) throw new Error("Failed to create homework")

      mutate()
      return await response.json()
    } catch (error) {
      console.error("[v0] Error creating homework:", error)
      throw error
    }
  }

  const deleteHomework = async (id: string) => {
    try {
      const response = await fetch(`/api/homework/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete homework")

      mutate()
      return await response.json()
    } catch (error) {
      console.error("[v0] Error deleting homework:", error)
      throw error
    }
  }

  return {
    homework: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    updateHomework,
    createHomework,
    deleteHomework,
    refresh: mutate,
  }
}
