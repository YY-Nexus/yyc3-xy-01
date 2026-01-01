/**
 * @file ai-video.ts
 * @description YYC³ AI小语智能成长守护系统AI视频生成系统类型定义，定义视频生成、回忆录和幻灯片相关的类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 视频类型
export type VideoType =
  | "image-to-video" // 图片转视频
  | "story-animation" // 故事动画化
  | "memory-recap" // 成长回忆视频
  | "slideshow" // 照片幻灯片

// 视频风格
export type VideoStyle =
  | "warm" // 温馨
  | "playful" // 活泼
  | "elegant" // 优雅
  | "adventure" // 冒险
  | "dreamy" // 梦幻
  | "nature" // 自然

// 背景音乐风格
export type MusicStyle =
  | "happy" // 欢快
  | "calm" // 舒缓
  | "adventure" // 冒险
  | "lullaby" // 摇篮曲
  | "playful" // 俏皮
  | "inspiring" // 励志

// 语音配音配置
export interface VoiceoverConfig {
  enabled: boolean
  text: string
  voice: "xiaoyu" | "xiaoming" | "narrator" | "child"
  language: "zh-CN" | "en-US"
  emotion: "cheerful" | "calm" | "storytelling" | "excited"
  speed: number // 0.5-2.0
}

// 背景音乐配置
export interface MusicConfig {
  enabled: boolean
  style: MusicStyle
  volume: number // 0-100
  fadeIn: boolean
  fadeOut: boolean
}

// 视频模板
export interface VideoTemplate {
  id: string
  name: string
  description: string
  thumbnailUrl: string
  duration: number // 秒
  style: VideoStyle
  transitions: string[]
  suitableFor: VideoType[]
}

// 视频生成请求
export interface VideoGenerationRequest {
  childId: string
  type: VideoType
  title: string
  sourceImages: string[]
  storyText?: string
  duration: number // 秒
  templateId?: string
  style: VideoStyle
  voiceover?: VoiceoverConfig
  music?: MusicConfig
  captions?: boolean
}

// 生成的视频
export interface GeneratedVideo {
  id: string
  childId: string
  type: VideoType
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  duration: number
  style: VideoStyle
  sourceImages: string[]
  voiceoverText?: string
  musicStyle?: MusicStyle
  status: "processing" | "completed" | "failed"
  progress: number // 0-100
  isFavorite: boolean
  viewCount: number
  createdAt: Date
}

// 成长回忆时间段
export interface MemoryPeriod {
  id: string
  name: string
  startDate: Date
  endDate: Date
  recordCount: number
}

// 成长回忆配置
export interface MemoryRecapConfig {
  childId: string
  period: MemoryPeriod
  includePhotos: boolean
  includeMilestones: boolean
  includeQuotes: boolean
  narrativeStyle: "chronological" | "thematic" | "highlight"
  maxDuration: number // 秒
}

// 视频模板配置
export const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: "birthday",
    name: "生日回顾",
    description: "记录宝贝一岁的精彩瞬间",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    duration: 60,
    style: "warm",
    transitions: ["fade", "zoom", "slide"],
    suitableFor: ["memory-recap", "slideshow"],
  },
  {
    id: "growth",
    name: "成长足迹",
    description: "见证每一步成长的印记",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    duration: 90,
    style: "warm",
    transitions: ["fade", "morph"],
    suitableFor: ["memory-recap", "slideshow"],
  },
  {
    id: "adventure",
    name: "冒险故事",
    description: "充满想象力的动画冒险",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    duration: 120,
    style: "adventure",
    transitions: ["zoom", "pan", "spin"],
    suitableFor: ["story-animation", "image-to-video"],
  },
  {
    id: "fairytale",
    name: "童话世界",
    description: "梦幻般的童话视频效果",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    duration: 90,
    style: "dreamy",
    transitions: ["sparkle", "fade", "float"],
    suitableFor: ["story-animation", "image-to-video"],
  },
  {
    id: "nature",
    name: "自然探索",
    description: "记录户外探索的美好时光",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    duration: 60,
    style: "nature",
    transitions: ["pan", "zoom", "fade"],
    suitableFor: ["slideshow", "memory-recap"],
  },
  {
    id: "simple",
    name: "简约风格",
    description: "干净简洁的展示效果",
    thumbnailUrl: "/placeholder.svg?height=180&width=320",
    duration: 45,
    style: "elegant",
    transitions: ["fade", "slide"],
    suitableFor: ["slideshow", "image-to-video"],
  },
]

// 视频风格配置
export const VIDEO_STYLE_CONFIG: Record<
  VideoStyle,
  { name: string; icon: string; color: string; description: string }
> = {
  warm: {
    name: "温馨",
    icon: "ri-heart-line",
    color: "#FF6B6B",
    description: "温暖柔和的家庭风格",
  },
  playful: {
    name: "活泼",
    icon: "ri-emoji-sticker-line",
    color: "#FFD93D",
    description: "充满活力的欢乐风格",
  },
  elegant: {
    name: "优雅",
    icon: "ri-sparkling-line",
    color: "#9B59B6",
    description: "简约大气的高级质感",
  },
  adventure: {
    name: "冒险",
    icon: "ri-compass-3-line",
    color: "#4ECDC4",
    description: "充满想象力的探险风格",
  },
  dreamy: {
    name: "梦幻",
    icon: "ri-moon-line",
    color: "#A78BFA",
    description: "如梦似幻的童话效果",
  },
  nature: {
    name: "自然",
    icon: "ri-plant-line",
    color: "#27AE60",
    description: "清新自然的户外风格",
  },
}

// 背景音乐配置
export const MUSIC_STYLE_CONFIG: Record<MusicStyle, { name: string; icon: string; sample: string }> = {
  happy: {
    name: "欢快",
    icon: "ri-music-2-line",
    sample: "轻快的钢琴和弦乐",
  },
  calm: {
    name: "舒缓",
    icon: "ri-music-line",
    sample: "柔和的钢琴独奏",
  },
  adventure: {
    name: "冒险",
    icon: "ri-sound-module-line",
    sample: "史诗感的管弦乐",
  },
  lullaby: {
    name: "摇篮曲",
    icon: "ri-moon-foggy-line",
    sample: "温柔的八音盒旋律",
  },
  playful: {
    name: "俏皮",
    icon: "ri-rhythm-line",
    sample: "活泼的木琴和铃声",
  },
  inspiring: {
    name: "励志",
    icon: "ri-star-line",
    sample: "温暖励志的弦乐",
  },
}

// 配音角色配置
export const VOICE_CONFIG = {
  xiaoyu: { name: "AI小语", gender: "female", description: "亲切温暖的女声" },
  xiaoming: { name: "小明", gender: "male", description: "活泼可爱的男童声" },
  narrator: { name: "旁白", gender: "neutral", description: "专业稳重的叙述声" },
  child: { name: "童声", gender: "neutral", description: "天真烂漫的儿童声" },
}
