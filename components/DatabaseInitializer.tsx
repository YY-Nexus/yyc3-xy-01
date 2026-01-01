/**
 * @file DatabaseInitializer.tsx
 * @description YYC³ AI小语智能成长守护系统数据库初始化组件，提供数据库连接和迁移功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useEffect, useState } from "react"
import { databaseManager } from "@/lib/db/database-manager"

interface DatabaseStatus {
  status: "initializing" | "connected" | "disconnected" | "error" | "migrating"
  type: string
  details?: string
}

export function DatabaseInitializer() {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus>({
    status: "initializing",
    type: "unknown"
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [showMigration, setShowMigration] = useState(false)
  const [migrationProgress, setMigrationProgress] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    initializeDatabase()
  }, [])

  const initializeDatabase = async () => {
    try {
      // 检查数据库连接
      const connection = await databaseManager.checkConnection()
      setDbStatus(connection)

      if (connection.status === "connected") {
        console.log(`✅ 数据库已连接 (${connection.type})`)
        setIsInitialized(true)

        // 如果是SQLite，检查是否需要从localStorage迁移数据
        if (connection.type === "sqlite" && typeof window !== "undefined") {
          const hasOldData = checkForLocalStorageData()
          if (hasOldData) {
            setShowMigration(true)
          }
        }
      } else {
        console.error("❌ 数据库连接失败:", connection.details)
        setDbStatus({
          status: "error",
          type: "error",
          details: connection.details
        })
      }
    } catch (error) {
      console.error("❌ 数据库初始化错误:", error)
      setDbStatus({
        status: "error",
        type: "error",
        details: error instanceof Error ? error.message : "未知错误"
      })
    }
  }

  const checkForLocalStorageData = (): boolean => {
    try {
      const keys = ["yyc3_users", "yyc3_children", "yyc3_growth_records"]
      return keys.some(key => {
        const data = localStorage.getItem(key)
        return data && JSON.parse(data).length > 0
      })
    } catch {
      return false
    }
  }

  const handleMigration = async () => {
    setDbStatus({ status: "migrating", type: "sqlite" })

    try {
      const result = await databaseManager.migrateFromLocalStorage()
      setMigrationProgress({
        success: result.success,
        message: result.success
          ? `成功迁移 ${result.migrated.reduce((sum, m) => sum + m.count, 0)} 条数据`
          : `迁移失败: ${result.error}`
      })

      if (result.success) {
        // 可选：清理localStorage旧数据
        setTimeout(() => {
          if (confirm("是否清理localStorage中的旧数据？")) {
            clearOldData()
          }
          setShowMigration(false)
        }, 2000)
      }
    } catch (error) {
      setMigrationProgress({
        success: false,
        message: error instanceof Error ? error.message : "迁移失败"
      })
    }
  }

  const clearOldData = () => {
    try {
      const keys = [
        "yyc3_users",
        "yyc3_children",
        "yyc3_growth_records",
        "yyc3_growth_assessments",
        "yyc3_milestones",
        "yyc3_homework_tasks"
      ]

      keys.forEach(key => localStorage.removeItem(key))
      console.log("✅ localStorage旧数据已清理")
    } catch (error) {
      console.error("❌ 清理旧数据失败:", error)
    }
  }

  const skipMigration = () => {
    setShowMigration(false)
  }

  // 如果已经初始化且没有特殊情况，不显示任何UI
  if (isInitialized && !showMigration) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* 初始化状态 */}
          {dbStatus.status === "initializing" && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  正在初始化数据库
                </h2>
                <p className="text-gray-600">
                  YYC³ AI小语正在准备数据存储系统...
                </p>
              </div>
            </>
          )}

          {/* 连接成功 */}
          {dbStatus.status === "connected" && !showMigration && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  数据库连接成功
                </h2>
                <p className="text-gray-600">
                  使用 {dbStatus.type} 数据库
                </p>
              </div>
              <div className="animate-pulse">
                <p className="text-sm text-blue-600">正在启动应用...</p>
              </div>
            </>
          )}

          {/* 迁移提示 */}
          {showMigration && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  发现旧数据
                </h2>
                <p className="text-gray-600 mb-4">
                  检测到localStorage中存在旧的用户数据，是否迁移到新的SQLite数据库？
                </p>

                {migrationProgress && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    migrationProgress.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="text-sm">{migrationProgress.message}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleMigration}
                  disabled={dbStatus.status === "migrating"}
                  className="flex-1 bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {dbStatus.status === "migrating" ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      迁移中...
                    </span>
                  ) : (
                    "开始迁移"
                  )}
                </button>
                <button
                  onClick={skipMigration}
                  disabled={dbStatus.status === "migrating"}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  跳过
                </button>
              </div>
            </>
          )}

          {/* 错误状态 */}
          {dbStatus.status === "error" && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  数据库连接失败
                </h2>
                <p className="text-gray-600 text-sm">
                  {dbStatus.details}
                </p>
              </div>
              <button
                onClick={initializeDatabase}
                className="w-full bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                重试
              </button>
            </>
          )}

          {/* 迁移中状态 */}
          {dbStatus.status === "migrating" && !showMigration && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  数据迁移中
                </h2>
                <p className="text-gray-600">
                  正在将数据迁移到SQLite数据库...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}