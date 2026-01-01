"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[v0] Error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-soft p-8 max-w-md w-full text-center"
      >
        <div className="text-6xl mb-4">😢</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">出错了</h2>
        <p className="text-gray-600 mb-2">抱歉，小语遇到了一些问题</p>
        {error.message && (
          <p className="text-sm text-gray-500 mb-6 font-mono bg-gray-50 p-3 rounded-lg">{error.message}</p>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-full hover:shadow-lg transition-shadow"
          >
            重试
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
          >
            返回首页
          </button>
        </div>
      </motion.div>
    </div>
  )
}
