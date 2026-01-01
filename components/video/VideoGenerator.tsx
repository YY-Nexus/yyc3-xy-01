/**
 * @file VideoGenerator.tsx
 * @description YYC³ AI小语智能成长守护系统视频生成器组件，提供AI视频生成和编辑功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  type VideoType,
  type VideoStyle,
  type VideoTemplate,
  type MusicStyle,
  VIDEO_STYLE_CONFIG,
  MUSIC_STYLE_CONFIG,
  VOICE_CONFIG,
  VIDEO_TEMPLATES,
} from "@/types/ai-video"
import { useAIVideo } from "@/hooks/useAIVideo"

interface VideoGeneratorProps {
  childId: string
  onComplete: () => void
  onCancel: () => void
}

type GeneratorStep = "type" | "content" | "style" | "options" | "generating"

export default function VideoGenerator({ childId, onComplete, onCancel }: VideoGeneratorProps) {
  const [step, setStep] = useState<GeneratorStep>("type")
  const [videoType, setVideoType] = useState<VideoType>("slideshow")
  const [title, setTitle] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [storyText, setStoryText] = useState("")
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle>("warm")
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [duration, setDuration] = useState(30)
  const [enableVoiceover, setEnableVoiceover] = useState(true)
  const [voiceType, setVoiceType] = useState<"xiaoyu" | "xiaoming" | "narrator" | "child">("xiaoyu")
  const [enableMusic, setEnableMusic] = useState(true)
  const [musicStyle, setMusicStyle] = useState<MusicStyle>("happy")
  const [musicVolume, setMusicVolume] = useState(40)

  const { generateVideo, isGenerating, generationProgress, currentTask } = useAIVideo()

  // 模拟图片库
  const imageLibrary = [
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
    "/placeholder.svg?height=200&width=200",
  ]

  const toggleImage = (img: string) => {
    setSelectedImages((prev) => (prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]))
  }

  const handleGenerate = async () => {
    setStep("generating")

    try {
      await generateVideo({
        childId,
        type: videoType,
        title: title || "我的精彩视频",
        sourceImages: selectedImages,
        storyText: videoType === "story-animation" ? storyText : undefined,
        duration,
        templateId: selectedTemplate?.id,
        style: selectedStyle,
        voiceover: enableVoiceover
          ? {
              enabled: true,
              text: storyText || title,
              voice: voiceType,
              language: "zh-CN",
              emotion: "cheerful",
              speed: 1.0,
            }
          : undefined,
        music: enableMusic
          ? {
              enabled: true,
              style: musicStyle,
              volume: musicVolume,
              fadeIn: true,
              fadeOut: true,
            }
          : undefined,
        captions: true,
      })

      onComplete()
    } catch (error) {
      console.error("视频生成失败:", error)
      setStep("options")
    }
  }

  const videoTypes: { type: VideoType; name: string; icon: string; desc: string }[] = [
    { type: "slideshow", name: "照片幻灯片", icon: "ri-slideshow-3-line", desc: "将多张照片制作成精美视频" },
    { type: "image-to-video", name: "图片转动态", icon: "ri-movie-line", desc: "让静态图片动起来" },
    { type: "story-animation", name: "故事动画", icon: "ri-book-read-line", desc: "将文字故事变成动画视频" },
    { type: "memory-recap", name: "成长回忆", icon: "ri-history-line", desc: "自动生成成长回顾视频" },
  ]

  const renderStep = () => {
    switch (step) {
      case "type":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">选择视频类型</h3>
            <div className="grid grid-cols-2 gap-4">
              {videoTypes.map((vt) => (
                <motion.button
                  key={vt.type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setVideoType(vt.type)
                    setStep("content")
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    videoType === vt.type ? "border-pink-400 bg-pink-50" : "border-slate-200 hover:border-pink-200"
                  }`}
                >
                  <i className={`${vt.icon} text-2xl text-pink-500 mb-2 block`} />
                  <h4 className="font-medium text-slate-800">{vt.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{vt.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case "content":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">添加内容</h3>

            {/* 标题输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">视频标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="给视频起个名字..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none"
              />
            </div>

            {/* 故事文本（故事动画模式） */}
            {videoType === "story-animation" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">故事内容</label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="输入你想变成动画的故事..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none resize-none"
                />
              </div>
            )}

            {/* 图片选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                选择图片 ({selectedImages.length}/12)
              </label>
              <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-xl">
                {imageLibrary.map((img, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleImage(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImages.includes(img) ? "border-pink-400 ring-2 ring-pink-200" : "border-transparent"
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                    {selectedImages.includes(img) && (
                      <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                        <i className="ri-check-line text-white text-xl bg-pink-500 rounded-full p-1" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1 rounded">
                      {selectedImages.indexOf(img) + 1 || ""}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("type")}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                上一步
              </button>
              <button
                onClick={() => setStep("style")}
                disabled={selectedImages.length === 0}
                className="flex-1 py-3 rounded-xl bg-pink-500 text-white hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            </div>
          </div>
        )

      case "style":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">选择风格</h3>

            {/* 视频风格 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">视频风格</label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(VIDEO_STYLE_CONFIG).map(([key, config]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedStyle(key as VideoStyle)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedStyle === key ? "border-pink-400 bg-pink-50" : "border-slate-200 hover:border-pink-200"
                    }`}
                  >
                    <i className={`${config.icon} text-xl`} style={{ color: config.color }} />
                    <p className="text-sm font-medium text-slate-700 mt-1">{config.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 视频模板 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">选择模板（可选）</label>
              <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                {VIDEO_TEMPLATES.filter((t) => t.suitableFor.includes(videoType)).map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                    className={`p-2 rounded-xl border-2 text-left transition-all ${
                      selectedTemplate?.id === template.id
                        ? "border-pink-400 bg-pink-50"
                        : "border-slate-200 hover:border-pink-200"
                    }`}
                  >
                    <img
                      src={template.thumbnailUrl || "/placeholder.svg"}
                      alt={template.name}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                    <p className="text-sm font-medium text-slate-700">{template.name}</p>
                    <p className="text-xs text-slate-500">{template.duration}秒</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* 时长选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">视频时长: {duration}秒</label>
              <input
                type="range"
                min={15}
                max={120}
                step={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>15秒</span>
                <span>120秒</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("content")}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                上一步
              </button>
              <button
                onClick={() => setStep("options")}
                className="flex-1 py-3 rounded-xl bg-pink-500 text-white hover:bg-pink-600"
              >
                下一步
              </button>
            </div>
          </div>
        )

      case "options":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">音频设置</h3>

            {/* 配音设置 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-700">AI配音</span>
                <button
                  onClick={() => setEnableVoiceover(!enableVoiceover)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    enableVoiceover ? "bg-pink-500" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      enableVoiceover ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {enableVoiceover && (
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(VOICE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setVoiceType(key as typeof voiceType)}
                      className={`p-2 rounded-lg text-sm text-left transition-all ${
                        voiceType === key ? "bg-pink-100 border-pink-300 border" : "bg-white border border-slate-200"
                      }`}
                    >
                      <span className="font-medium">{config.name}</span>
                      <p className="text-xs text-slate-500">{config.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 背景音乐设置 */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-slate-700">背景音乐</span>
                <button
                  onClick={() => setEnableMusic(!enableMusic)}
                  className={`w-12 h-6 rounded-full transition-colors ${enableMusic ? "bg-pink-500" : "bg-slate-300"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      enableMusic ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {enableMusic && (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {Object.entries(MUSIC_STYLE_CONFIG).map(([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setMusicStyle(key as MusicStyle)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          musicStyle === key ? "bg-pink-100 border-pink-300 border" : "bg-white border border-slate-200"
                        }`}
                      >
                        <i className={`${config.icon} text-lg text-pink-500`} />
                        <p className="text-xs font-medium mt-1">{config.name}</p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">音量: {musicVolume}%</label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full accent-pink-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("style")}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                上一步
              </button>
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
              >
                开始生成
              </button>
            </div>
          </div>
        )

      case "generating":
        return (
          <div className="text-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <i className="ri-loader-4-line text-5xl text-pink-500" />
            </motion.div>

            <h3 className="text-lg font-semibold text-slate-800 mb-2">正在生成视频</h3>
            <p className="text-slate-500 mb-6">{currentTask}</p>

            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${generationProgress}%` }}
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">{generationProgress}%</p>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-white rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">创建视频</h2>
          {step !== "generating" && (
            <button
              onClick={onCancel}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
            >
              <i className="ri-close-line text-xl text-slate-500" />
            </button>
          )}
        </div>

        {/* 步骤指示器 */}
        {step !== "generating" && (
          <div className="flex items-center gap-2 mb-6">
            {["type", "content", "style", "options"].map((s, idx) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    ["type", "content", "style", "options"].indexOf(step) >= idx
                      ? "bg-pink-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      ["type", "content", "style", "options"].indexOf(step) > idx ? "bg-pink-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 步骤内容 */}
        {renderStep()}
      </motion.div>
    </motion.div>
  )
}
