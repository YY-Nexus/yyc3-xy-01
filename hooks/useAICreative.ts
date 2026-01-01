/**
 * @file useAICreative.ts
 * @description AI创意创作Hook，提供AI绘画和故事生成功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { useState, useCallback } from "react"
import {
  type GeneratedArtwork,
  type ImageGenerationRequest,
  type ArtStyle,
  type StorySession,
  type StorySegment,
  type ContinuationOption,
  type StoryStyle,
  ART_STYLE_CONFIG,
} from "@/types/ai-creative"

const ARTWORK_KEY = "yyc3_artworks"
const STORY_KEY = "yyc3_stories"

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 儿童安全内容过滤
function filterForChildSafety(prompt: string): string {
  const unsafeWords = ["暴力", "恐怖", "血腥", "武器", "战争", "死亡", "酒", "烟"]
  let safePrompt = prompt
  unsafeWords.forEach((word) => {
    safePrompt = safePrompt.replace(new RegExp(word, "gi"), "")
  })
  return safePrompt.trim()
}

// 构建完整提示词
function buildFullPrompt(prompt: string, style: ArtStyle): string {
  const styleConfig = ART_STYLE_CONFIG[style]
  const safePrompt = filterForChildSafety(prompt)
  return `${safePrompt}, ${styleConfig.prompt}, child-safe, family-friendly, no violence, bright and cheerful`
}

export function useAICreative() {
  const [artworks, setArtworks] = useState<GeneratedArtwork[]>([])
  const [stories, setStories] = useState<StorySession[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // 加载保存的作品
  const loadArtworks = useCallback(() => {
    try {
      const stored = localStorage.getItem(ARTWORK_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setArtworks(
          parsed.map((a: GeneratedArtwork) => ({
            ...a,
            createdAt: new Date(a.createdAt),
          })),
        )
      }
    } catch (error) {
      console.error("加载作品失败:", error)
    }
  }, [])

  // 保存作品
  const saveArtwork = useCallback((artwork: GeneratedArtwork) => {
    setArtworks((prev) => {
      const updated = [artwork, ...prev]
      localStorage.setItem(ARTWORK_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // AI文生图
  const generateImage = useCallback(
    async (request: ImageGenerationRequest): Promise<GeneratedArtwork> => {
      setIsGenerating(true)
      setGenerationProgress(0)

      try {
        // 进度模拟
        const progressInterval = setInterval(() => {
          setGenerationProgress((prev) => Math.min(prev + 10, 90))
        }, 500)

        const fullPrompt = buildFullPrompt(request.prompt, request.style)

        // 调用AI生图API
        const response = await fetch("/api/ai/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: fullPrompt,
            style: request.style,
            aspectRatio: request.aspectRatio,
          }),
        })

        clearInterval(progressInterval)
        setGenerationProgress(100)

        if (!response.ok) {
          throw new Error("图片生成失败")
        }

        const data = await response.json()

        const artwork: GeneratedArtwork = {
          id: generateId("art"),
          childId: request.childId,
          prompt: request.prompt,
          style: request.style,
          imageUrl: data.imageUrl,
          thumbnailUrl: data.imageUrl,
          isFavorite: false,
          createdAt: new Date(),
        }

        saveArtwork(artwork)
        return artwork
      } catch (error) {
        console.error("生成图片失败:", error)
        // 返回模拟数据
        const mockArtwork: GeneratedArtwork = {
          id: generateId("art"),
          childId: request.childId,
          prompt: request.prompt,
          style: request.style,
          imageUrl: `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(request.prompt + " " + request.style)}`,
          thumbnailUrl: `/placeholder.svg?height=256&width=256&query=${encodeURIComponent(request.prompt)}`,
          isFavorite: false,
          createdAt: new Date(),
        }
        saveArtwork(mockArtwork)
        return mockArtwork
      } finally {
        setIsGenerating(false)
        setGenerationProgress(0)
      }
    },
    [saveArtwork],
  )

  // 切换收藏
  const toggleFavorite = useCallback((artworkId: string) => {
    setArtworks((prev) => {
      const updated = prev.map((a) => (a.id === artworkId ? { ...a, isFavorite: !a.isFavorite } : a))
      localStorage.setItem(ARTWORK_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // 删除作品
  const deleteArtwork = useCallback((artworkId: string) => {
    setArtworks((prev) => {
      const updated = prev.filter((a) => a.id !== artworkId)
      localStorage.setItem(ARTWORK_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // 加载故事
  const loadStories = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setStories(
          parsed.map((s: StorySession) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
            segments: s.segments.map((seg) => ({
              ...seg,
              timestamp: new Date(seg.timestamp),
            })),
          })),
        )
      }
    } catch (error) {
      console.error("加载故事失败:", error)
    }
  }, [])

  // 创建新故事
  const createStory = useCallback(
    (childId: string, title: string, keywords: string[], style: StoryStyle): StorySession => {
      const story: StorySession = {
        id: generateId("story"),
        childId,
        title,
        keywords,
        style,
        segments: [],
        status: "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setStories((prev) => {
        const updated = [story, ...prev]
        localStorage.setItem(STORY_KEY, JSON.stringify(updated))
        return updated
      })

      return story
    },
    [],
  )

  // AI续写故事
  const continueStory = useCallback(
    async (storyId: string, userInput?: string): Promise<ContinuationOption[]> => {
      const story = stories.find((s) => s.id === storyId)
      if (!story) throw new Error("故事不存在")

      // 如果有用户输入，先添加用户片段
      if (userInput) {
        const userSegment: StorySegment = {
          id: generateId("seg"),
          content: userInput,
          author: "child",
          timestamp: new Date(),
        }

        setStories((prev) => {
          const updated = prev.map((s) =>
            s.id === storyId ? { ...s, segments: [...s.segments, userSegment], updatedAt: new Date() } : s,
          )
          localStorage.setItem(STORY_KEY, JSON.stringify(updated))
          return updated
        })
      }

      try {
        // 调用AI续写API
        const response = await fetch("/api/ai/continue-story", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyId,
            keywords: story.keywords,
            style: story.style,
            previousContent: story.segments.map((s) => s.content).join("\n"),
            userInput,
          }),
        })

        if (!response.ok) {
          throw new Error("续写失败")
        }

        const data = await response.json()
        return data.options
      } catch (error) {
        console.error("续写故事失败:", error)
        // 返回模拟续写选项
        return [
          {
            id: "1",
            content: `突然，小主人公发现了一个闪闪发光的神秘宝盒，宝盒上刻着奇怪的符号...`,
            direction: "发现宝藏",
          },
          {
            id: "2",
            content: `这时，一只会说话的小松鼠从树上跳了下来，说："你好，我等你很久了！"`,
            direction: "遇见朋友",
          },
          {
            id: "3",
            content: `天空中飘来一朵彩色的云，云上坐着一位笑眯眯的老爷爷，他招手让主人公上去...`,
            direction: "奇幻旅程",
          },
        ]
      }
    },
    [stories],
  )

  // 选择续写方向
  const selectContinuation = useCallback((storyId: string, option: ContinuationOption) => {
    const aiSegment: StorySegment = {
      id: generateId("seg"),
      content: option.content,
      author: "ai",
      timestamp: new Date(),
    }

    setStories((prev) => {
      const updated = prev.map((s) =>
        s.id === storyId ? { ...s, segments: [...s.segments, aiSegment], updatedAt: new Date() } : s,
      )
      localStorage.setItem(STORY_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // 完成故事
  const completeStory = useCallback((storyId: string) => {
    setStories((prev) => {
      const updated = prev.map((s) =>
        s.id === storyId ? { ...s, status: "completed" as const, updatedAt: new Date() } : s,
      )
      localStorage.setItem(STORY_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  // 删除故事
  const deleteStory = useCallback((storyId: string) => {
    setStories((prev) => {
      const updated = prev.filter((s) => s.id !== storyId)
      localStorage.setItem(STORY_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return {
    // 图片生成
    artworks,
    isGenerating,
    generationProgress,
    loadArtworks,
    generateImage,
    toggleFavorite,
    deleteArtwork,
    // 故事创作
    stories,
    loadStories,
    createStory,
    continueStory,
    selectContinuation,
    completeStory,
    deleteStory,
  }
}
