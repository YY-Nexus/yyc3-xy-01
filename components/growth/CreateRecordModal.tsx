/**
 * @file CreateRecordModal.tsx
 * @description YYC³ AI小语智能成长守护系统创建记录模态框组件，提供成长记录创建功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MediaUploader } from "./MediaUploader"
import { TagSelector } from "./TagSelector"
import { reportError } from "@/lib/global-error-handler"
import type { GrowthRecord } from "@/types/growth"

interface AISuggestions {
  analysis: string
  suggestedTitle?: string
  suggestedTags?: string[]
  isMilestone?: boolean
}

interface CreateRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (record: Partial<GrowthRecord>) => void
}

export default function CreateRecordModal({ isOpen, onClose, onSubmit }: CreateRecordModalProps) {
  const [recordType, setRecordType] = useState<"milestone" | "observation" | "emotion" | "learning">("milestone")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [emotion, setEmotion] = useState<string>("")
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeContent = async () => {
    if (content.length < 10) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/analyze-record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, recordType }),
      })
      const data = await response.json()
      setAiSuggestions(data)

      if (data.suggestedTitle && !title) {
        setTitle(data.suggestedTitle)
      }
      if (data.suggestedTags) {
        setTags([...new Set([...tags, ...data.suggestedTags])])
      }
    } catch (error) {
      reportError(error as Error, { component: 'CreateRecordModal', action: 'analyzeContent' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async () => {
    const mediaUrls: string[] = []

    for (const file of mediaFiles) {
      mediaUrls.push(URL.createObjectURL(file))
    }

    const record = {
      type: recordType,
      title: title || content.slice(0, 30),
      content,
      mediaUrls,
      tags,
      emotion,
      aiAnalysis: aiSuggestions?.analysis,
      isMilestone: aiSuggestions?.isMilestone,
      createdAt: new Date().toISOString(),
    }

    onSubmit(record)
    onClose()

    setTitle("")
    setContent("")
    setMediaFiles([])
    setTags([])
    setEmotion("")
    setAiSuggestions(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-white rounded-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-bold text-slate-800">创建成长记录</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center"
              >
                <i className="ri-close-line" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">记录类型</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: "milestone", icon: "ri-flag-line", label: "里程碑", color: "yellow" },
                    { id: "observation", icon: "ri-eye-line", label: "观察日志", color: "purple" },
                    { id: "emotion", icon: "ri-heart-line", label: "情感记录", color: "pink" },
                    { id: "learning", icon: "ri-book-line", label: "学习记录", color: "blue" },
                  ].map((type) => (
                    <motion.button
                      key={type.id}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 ${
                        recordType === type.id
                          ? `border-${type.color}-400 bg-${type.color}-50`
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                      onClick={() => setRecordType(type.id as "milestone" | "observation" | "emotion" | "learning")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className={`${type.icon} text-2xl`} />
                      <span className="text-xs font-medium">{type.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">标题（可选）</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="AI会根据内容自动生成标题"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">记录内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={analyzeContent}
                  placeholder="记录下这个特别的瞬间..."
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                {isAnalyzing && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-blue-500">
                    <i className="ri-loader-4-line animate-spin" />
                    <span>AI正在分析内容...</span>
                  </div>
                )}
              </div>

              {aiSuggestions && (
                <motion.div
                  className="bg-blue-50 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-lightbulb-flash-line text-blue-500" />
                    <span className="font-bold text-blue-700">AI小语的建议</span>
                  </div>
                  <p className="text-sm text-slate-700">{aiSuggestions.analysis}</p>
                  {aiSuggestions.isMilestone && (
                    <div className="mt-2 px-3 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full inline-flex items-center gap-1">
                      <i className="ri-trophy-line" />
                      <span>这是一个重要的成长里程碑！</span>
                    </div>
                  )}
                </motion.div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">添加照片/视频</label>
                <MediaUploader files={mediaFiles} onChange={setMediaFiles} maxFiles={9} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">标签</label>
                <TagSelector tags={tags} onChange={setTags} />
              </div>

              {recordType === "emotion" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">当前情绪</label>
                  <div className="flex gap-2 flex-wrap">
                    {["开心", "难过", "生气", "兴奋", "平静", "紧张"].map((em) => (
                      <motion.button
                        key={em}
                        className={`px-4 py-2 rounded-full ${
                          emotion === em ? "bg-pink-400 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        onClick={() => setEmotion(em)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {em}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!content}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  创建记录
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
