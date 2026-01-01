/**
 * @file interaction.ts
 * @description YYC³ AI小语智能成长守护系统互动记录类型定义，定义亲子互动、活动类型、情绪分析和互动评估的数据结构
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

export interface InteractionRecord {
  id: string
  childId: string
  parentId: string
  type: InteractionType
  title: string
  content: string
  mediaUrls: string[]
  duration: number // 分钟
  participants: string[]
  location: string
  mood: MoodType
  aiAnalysis: InteractionAnalysis | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type InteractionType =
  | "play" // 游戏互动
  | "study" // 学习辅导
  | "outdoor" // 户外活动
  | "reading" // 亲子阅读
  | "art" // 艺术创作
  | "music" // 音乐活动
  | "sports" // 体育运动
  | "conversation" // 深度对话
  | "other" // 其他

export type MoodType = "excellent" | "good" | "neutral" | "poor"

export interface InteractionAnalysis {
  keywords: string[]
  sentiment: string
  themes: string[]
  qualityScore: number // 1-100
  suggestions: string[]
  milestoneDetected: string | null
}

export const INTERACTION_TYPE_CONFIG: Record<
  InteractionType,
  {
    label: string
    icon: string
    color: string
    bgColor: string
    description: string
  }
> = {
  play: {
    label: "游戏互动",
    icon: "ri-gamepad-line",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "亲子游戏、桌游、玩具等",
  },
  study: {
    label: "学习辅导",
    icon: "ri-book-open-line",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "作业辅导、知识讲解等",
  },
  outdoor: {
    label: "户外活动",
    icon: "ri-sun-line",
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "公园、游乐场、旅行等",
  },
  reading: {
    label: "亲子阅读",
    icon: "ri-book-2-line",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "绘本、故事书、科普书等",
  },
  art: {
    label: "艺术创作",
    icon: "ri-palette-line",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "绘画、手工、陶艺等",
  },
  music: {
    label: "音乐活动",
    icon: "ri-music-2-line",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "唱歌、乐器、音乐欣赏等",
  },
  sports: {
    label: "体育运动",
    icon: "ri-run-line",
    color: "text-red-600",
    bgColor: "bg-red-50",
    description: "球类、游泳、骑行等",
  },
  conversation: {
    label: "深度对话",
    icon: "ri-chat-heart-line",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    description: "情感交流、人生话题等",
  },
  other: {
    label: "其他活动",
    icon: "ri-star-line",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    description: "其他亲子互动",
  },
}

export const MOOD_CONFIG: Record<
  MoodType,
  {
    label: string
    emoji: string
    color: string
  }
> = {
  excellent: { label: "非常开心", emoji: "😄", color: "text-green-500" },
  good: { label: "比较开心", emoji: "😊", color: "text-blue-500" },
  neutral: { label: "一般", emoji: "😐", color: "text-slate-500" },
  poor: { label: "不太开心", emoji: "😔", color: "text-orange-500" },
}

export function getInteractionConfig(type: InteractionType) {
  return INTERACTION_TYPE_CONFIG[type]
}

export function getMoodConfig(mood: MoodType) {
  return MOOD_CONFIG[mood]
}

export function calculateQualityLevel(score: number): {
  level: string
  color: string
  description: string
} {
  if (score >= 90) {
    return { level: "优秀", color: "text-green-600", description: "高质量互动" }
  } else if (score >= 70) {
    return { level: "良好", color: "text-blue-600", description: "较好互动" }
  } else if (score >= 50) {
    return { level: "一般", color: "text-orange-600", description: "基础互动" }
  } else {
    return { level: "待提升", color: "text-red-600", description: "需要改进" }
  }
}
