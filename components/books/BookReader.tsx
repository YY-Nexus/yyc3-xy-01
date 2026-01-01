/**
 * @file BookReader.tsx
 * @description YYC³ AI小语智能成长守护系统绘本阅读器组件，提供绘本阅读和播放功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PictureBook } from "@/types/ai-creative"

interface BookReaderProps {
  book: PictureBook
  currentPage: number
  isPlaying: boolean
  onPageChange: (page: number) => void
  onPlay: () => void
  onPause: () => void
  onClose: () => void
}

export default function BookReader({
  book,
  currentPage,
  isPlaying,
  onPageChange,
  onPlay,
  onPause,
  onClose,
}: BookReaderProps) {
  const [showControls, setShowControls] = useState(true)
  const [highlightedWord, setHighlightedWord] = useState(-1)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const page = book.pages.find((p) => p.pageNumber === currentPage)
  const progress = (currentPage / book.pages.length) * 100

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        if (currentPage < book.pages.length) {
          onPageChange(currentPage + 1)
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        if (currentPage > 1) {
          onPageChange(currentPage - 1)
        }
      } else if (e.key === "Escape") {
        onClose()
      } else if (e.key === "p") {
        isPlaying ? onPause() : onPlay()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [book.pages.length, currentPage, isPlaying, onClose, onPageChange, onPause, onPlay])

  useEffect(() => {
    if (isPlaying && page) {
      const words = page.text.split("")
      let index = 0
      const interval = setInterval(() => {
        setHighlightedWord(index)
        index++
        if (index >= words.length) {
          clearInterval(interval)
          setHighlightedWord(-1)
        }
      }, 150)
      return () => clearInterval(interval)
    } else {
      setHighlightedWord(-1)
    }
  }, [isPlaying, page, currentPage])

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const renderHighlightedText = (text: string) => {
    if (highlightedWord === -1) {
      return <span>{text}</span>
    }

    const chars = text.split("")
    return (
      <span>
        {chars.map((char, index) => (
          <span
            key={index}
            className={`transition-colors duration-100 ${
              index <= highlightedWord ? "text-amber-600 font-semibold" : "text-slate-700"
            }`}
          >
            {char}
          </span>
        ))}
      </span>
    )
  }

  if (!page) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-b from-amber-50 to-orange-50"
      onMouseMove={handleMouseMove}
    >
      {/* 顶部控制栏 */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            exit={{ y: -60 }}
            className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={onClose}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <i className="ri-arrow-left-line text-xl" />
                <span className="text-sm font-medium">返回书架</span>
              </button>

              <h1 className="text-base font-semibold text-slate-800 truncate max-w-[200px]">{book.title}</h1>

              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                  {currentPage} / {book.pages.length}
                </span>
                <button onClick={() => {}} className="p-2 text-slate-600 hover:text-amber-600 transition-colors">
                  <i className="ri-settings-3-line text-xl" />
                </button>
              </div>
            </div>

            {/* 进度条 */}
            <div className="h-1 bg-amber-100">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主内容区 */}
      <div className="h-full flex flex-col pt-16 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-6"
          >
            {/* 插图 */}
            <div className="relative w-full max-w-2xl aspect-[4/3] rounded-2xl overflow-hidden shadow-xl mb-6">
              <img
                src={page.imageUrl || "/placeholder.svg"}
                alt={`第${currentPage}页`}
                className="w-full h-full object-cover"
              />

              {/* 页码标签 */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                <span className="text-sm font-medium text-slate-700">第 {currentPage} 页</span>
              </div>
            </div>

            {/* 文字内容 */}
            <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <p className="text-xl leading-relaxed text-center font-medium">{renderHighlightedText(page.text)}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部控制栏 */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg"
          >
            <div className="flex items-center justify-center gap-6 px-6 py-4">
              {/* 上一页 */}
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className={`p-3 rounded-full transition-all ${
                  currentPage <= 1
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-amber-100 hover:text-amber-600"
                }`}
              >
                <i className="ri-skip-back-line text-2xl" />
              </button>

              {/* 后退10秒 */}
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                className="p-3 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-all"
              >
                <i className="ri-replay-10-line text-2xl" />
              </button>

              {/* 播放/暂停 */}
              <button
                onClick={() => (isPlaying ? onPause() : onPlay())}
                className="p-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <i className={`${isPlaying ? "ri-pause-line" : "ri-play-line"} text-3xl`} />
              </button>

              {/* 前进10秒 */}
              <button
                onClick={() => onPageChange(Math.min(book.pages.length, currentPage + 1))}
                className="p-3 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-all"
              >
                <i className="ri-forward-10-line text-2xl" />
              </button>

              {/* 下一页 */}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= book.pages.length}
                className={`p-3 rounded-full transition-all ${
                  currentPage >= book.pages.length
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-600 hover:bg-amber-100 hover:text-amber-600"
                }`}
              >
                <i className="ri-skip-forward-line text-2xl" />
              </button>
            </div>

            {/* 页面缩略图 */}
            <div className="flex items-center gap-2 px-4 pb-4 overflow-x-auto">
              {book.pages.map((p) => (
                <button
                  key={p.pageNumber}
                  onClick={() => onPageChange(p.pageNumber)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    p.pageNumber === currentPage
                      ? "border-amber-400 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={p.imageUrl || "/placeholder.svg"}
                    alt={`第${p.pageNumber}页缩略图`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 左右翻页热区 */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-64 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
      >
        <div className="p-2 rounded-full bg-white/80 shadow-lg">
          <i className="ri-arrow-left-s-line text-2xl text-slate-600" />
        </div>
      </button>

      <button
        onClick={() => currentPage < book.pages.length && onPageChange(currentPage + 1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-64 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
      >
        <div className="p-2 rounded-full bg-white/80 shadow-lg">
          <i className="ri-arrow-right-s-line text-2xl text-slate-600" />
        </div>
      </button>
    </motion.div>
  )
}
