/**
 * @file ai-creative.ts
 * @description YYC³ AI小语智能成长守护系统AI创意内容系统类型定义，定义艺术创作、绘本生成和故事续写相关的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 艺术风格
export type ArtStyle =
  | "cartoon" // 卡通风格
  | "watercolor" // 水彩风格
  | "sketch" // 简笔画
  | "anime" // 动漫风格
  | "storybook" // 绘本风格
  | "pixel" // 像素风格
  | "clay" // 粘土风格
  | "papercut" // 剪纸风格

// 图片生成请求
export interface ImageGenerationRequest {
  childId: string
  prompt: string
  style: ArtStyle
  aspectRatio: "1:1" | "4:3" | "16:9" | "3:4"
  negativePrompt?: string
}

// 生成的艺术作品
export interface GeneratedArtwork {
  id: string
  childId: string
  prompt: string
  style: ArtStyle
  imageUrl: string
  thumbnailUrl: string
  isFavorite: boolean
  createdAt: Date
}

// 绘本分类
export type BookCategory =
  | "story" // 故事
  | "science" // 科普
  | "emotion" // 情绪管理
  | "habit" // 习惯养成
  | "culture" // 传统文化
  | "english" // 英语启蒙
  | "math" // 数学启蒙
  | "nature" // 自然探索

// 绘本页面
export interface BookPage {
  pageNumber: number
  imageUrl: string
  text: string
  audioUrl?: string
}

// 有声绘本
export interface PictureBook {
  id: string
  title: string
  author: string
  coverUrl: string
  category: BookCategory
  ageRange: [number, number]
  pages: BookPage[]
  duration: number
  isAIGenerated: boolean
  isFavorite: boolean
  readCount: number
  createdAt: Date
}

// 阅读进度
export interface ReadingProgress {
  bookId: string
  childId: string
  currentPage: number
  totalPages: number
  startedAt: Date
  lastReadAt: Date
  isCompleted: boolean
}

// 故事风格
export type StoryStyle =
  | "fairy_tale" // 童话
  | "adventure" // 冒险
  | "science" // 科幻
  | "humor" // 幽默
  | "mystery" // 悬疑
  | "fable" // 寓言
  | "daily" // 日常

// 故事片段
export interface StorySegment {
  id: string
  content: string
  author: "child" | "ai"
  imageUrl?: string
  timestamp: Date
}

// 续写会话
export interface StorySession {
  id: string
  childId: string
  title: string
  keywords: string[]
  style: StoryStyle
  segments: StorySegment[]
  status: "draft" | "completed" | "published"
  createdAt: Date
  updatedAt: Date
}

// 续写选项
export interface ContinuationOption {
  id: string
  content: string
  direction: string
}

// 风格配置
export const ART_STYLE_CONFIG: Record<ArtStyle, { name: string; icon: string; color: string; prompt: string }> = {
  cartoon: {
    name: "卡通风格",
    icon: "ri-bear-smile-line",
    color: "#FF6B6B",
    prompt: "cartoon style, vibrant colors, cute characters, child-friendly",
  },
  watercolor: {
    name: "水彩风格",
    icon: "ri-palette-line",
    color: "#4ECDC4",
    prompt: "watercolor painting, soft colors, artistic, dreamy",
  },
  sketch: {
    name: "简笔画",
    icon: "ri-pencil-line",
    color: "#45B7D1",
    prompt: "simple line drawing, minimalist, clean lines, sketch style",
  },
  anime: {
    name: "动漫风格",
    icon: "ri-star-smile-line",
    color: "#96CEB4",
    prompt: "anime style, japanese animation, colorful, expressive",
  },
  storybook: {
    name: "绘本风格",
    icon: "ri-book-2-line",
    color: "#FFEAA7",
    prompt: "storybook illustration, warm colors, cozy, narrative art",
  },
  pixel: {
    name: "像素风格",
    icon: "ri-gamepad-line",
    color: "#DDA0DD",
    prompt: "pixel art, 8-bit style, retro game aesthetic, blocky",
  },
  clay: {
    name: "粘土风格",
    icon: "ri-hand-heart-line",
    color: "#F4A460",
    prompt: "clay sculpture style, 3D rendered, soft textures, playful",
  },
  papercut: {
    name: "剪纸风格",
    icon: "ri-scissors-cut-line",
    color: "#E74C3C",
    prompt: "paper cut art, layered paper, chinese traditional, silhouette",
  },
}

// 绘本分类配置
export const BOOK_CATEGORY_CONFIG: Record<BookCategory, { name: string; icon: string; color: string }> = {
  story: { name: "故事", icon: "ri-book-open-line", color: "#FF6B6B" },
  science: { name: "科普", icon: "ri-microscope-line", color: "#4ECDC4" },
  emotion: { name: "情绪管理", icon: "ri-heart-line", color: "#FFB6C1" },
  habit: { name: "习惯养成", icon: "ri-sun-line", color: "#FFD93D" },
  culture: { name: "传统文化", icon: "ri-ancient-gate-line", color: "#E74C3C" },
  english: { name: "英语启蒙", icon: "ri-translate-2", color: "#3498DB" },
  math: { name: "数学启蒙", icon: "ri-calculator-line", color: "#9B59B6" },
  nature: { name: "自然探索", icon: "ri-plant-line", color: "#27AE60" },
}

// 故事风格配置
export const STORY_STYLE_CONFIG: Record<StoryStyle, { name: string; icon: string; color: string }> = {
  fairy_tale: { name: "童话", icon: "ri-magic-line", color: "#FF6B9D" },
  adventure: { name: "冒险", icon: "ri-compass-3-line", color: "#4ECDC4" },
  science: { name: "科幻", icon: "ri-rocket-line", color: "#45B7D1" },
  humor: { name: "幽默", icon: "ri-emotion-laugh-line", color: "#FFD93D" },
  mystery: { name: "悬疑", icon: "ri-search-eye-line", color: "#9B59B6" },
  fable: { name: "寓言", icon: "ri-quill-pen-line", color: "#E67E22" },
  daily: { name: "日常", icon: "ri-home-smile-line", color: "#27AE60" },
}
