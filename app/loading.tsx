/**
 * @file loading.tsx
 * @description YYC³ AI小语智能成长守护系统加载页面组件，提供加载动画和等待提示
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { motion } from "framer-motion"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Q版角色加载动画 */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="text-8xl"
        >
          👧
        </motion.div>

        {/* 加载文字 */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-medium text-gray-700">小语正在准备中</span>
          <motion.div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-pink-400 rounded-full"
              />
            ))}
          </motion.div>
        </div>

        {/* 进度条 */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400"
          />
        </div>
      </motion.div>
    </div>
  )
}
