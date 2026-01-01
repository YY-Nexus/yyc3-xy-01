"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  // 直接渲染，移除客户端检查

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9E6' }}>
      {/* 顶部栏 */}
      <header className="bg-white px-6 py-4 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">☀️</span>
            <span className="text-sm text-gray-600">今天 12月4日</span>
          </div>
          <div className="flex items-center space-x-6 text-2xl">
            <span>❤️</span>
            <span>👥</span>
            <span>📚</span>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* 左侧：小语Q版形象区 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center"
          >
            <Image
              src="/q-character/xiaoyu-lan.png"
              alt="小语Q版形象"
              width={256}
              height={256}
              className="w-64 h-64 object-contain mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              快乐学习助手
            </h1>
            <p className="text-gray-500 text-lg">
              公益 · 陪伴 · 成长
            </p>
          </motion.div>

          {/* 右侧：功能操作区 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* 今日计划 */}
            <div
              className="bg-yellow-50 rounded-2xl p-6 shadow-lg"
              style={{ backgroundColor: '#FFF8D6' }}
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-2">📋</span>
                <h2 className="text-xl font-bold text-gray-800">今日计划</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-4 h-4 border-2 border-gray-400 rounded-full mr-3"></span>
                  <span className="text-gray-700">背诵古诗《静夜思》</span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded-full mr-3"></span>
                  <span className="text-gray-500 line-through">完成10道口算题</span>
                </div>
              </div>
            </div>

            {/* 作业中心 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-2">🌈</span>
                <h2 className="text-2xl font-bold text-gray-800">作业中心</h2>
              </div>
              <p className="text-gray-500 mb-4">保持专注，你最棒啦！</p>
              <div className="flex space-x-3 mb-4">
                <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">
                  语文
                </span>
                <span className="px-4 py-2 bg-orange-100 text-orange-600 rounded-lg text-sm">
                  数学
                </span>
              </div>
              <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-6 rounded-full text-lg transition-colors flex items-center justify-center">
                开始作业
                <span className="ml-2">→</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* 功能卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {/* 错题本 */}
          <div
            className="bg-purple-100 rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#F0E6FF' }}
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="font-bold text-gray-800">错题本</h3>
          </div>

          {/* 公益课堂 */}
          <div
            className="bg-blue-100 rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#E6F0FF' }}
          >
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-bold text-gray-800">公益课堂</h3>
          </div>

          {/* 心情记录 */}
          <div
            className="bg-pink-100 rounded-2xl p-6 text-center"
            style={{ backgroundColor: '#FFE6F0' }}
          >
            <div className="text-4xl mb-3">😊</div>
            <h3 className="font-bold text-gray-800">心情记录</h3>
          </div>
        </motion.div>
      </main>

      {/* 底部导航栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav className="flex justify-around items-center">
            {/* 首页 */}
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl mb-1">😊</div>
              <span className="text-xs text-gray-800 font-medium">首页</span>
            </div>

            {/* 作业中心 */}
            <Link href="/homework" className="flex flex-col items-center text-center hover:opacity-80 transition-opacity">
              <div className="text-2xl mb-1">📚</div>
              <span className="text-xs text-gray-600">作业中心</span>
            </Link>

            {/* 课程学习 */}
            <Link href="/courses" className="flex flex-col items-center text-center hover:opacity-80 transition-opacity">
              <div className="text-2xl mb-1">🎓</div>
              <span className="text-xs text-gray-600">课程学习</span>
            </Link>

            {/* 公益活动 */}
            <Link href="/activities" className="flex flex-col items-center text-center hover:opacity-80 transition-opacity">
              <div className="text-2xl mb-1">❤️</div>
              <span className="text-xs text-gray-600">公益活动</span>
            </Link>

            {/* 消息中心 */}
            <Link href="/messages" className="flex flex-col items-center text-center hover:opacity-80 transition-opacity">
              <div className="text-2xl mb-1">💬</div>
              <span className="text-xs text-gray-600">消息中心</span>
            </Link>

            {/* 成长记录 */}
            <Link href="/growth" className="flex flex-col items-center text-center hover:opacity-80 transition-opacity">
              <div className="text-2xl mb-1">🏆</div>
              <span className="text-xs text-gray-600">成长记录</span>
            </Link>

            {/* 设置管理 */}
            <Link href="/settings" className="flex flex-col items-center text-center hover:opacity-80 transition-opacity">
              <div className="text-2xl mb-1">⚙️</div>
              <span className="text-xs text-gray-600">设置管理</span>
            </Link>
          </nav>
        </div>
      </footer>

      </div>
  )
}
