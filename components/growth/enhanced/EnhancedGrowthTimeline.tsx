'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  Calendar,
  Clock,
  Heart,
  Star,
  Trophy,
  Camera,
  Video,
  Music,
  Sparkles,
  ChevronRight,
  Baby,
  Gift,
  Cake,
  HeartHandshake,
  TrendingUp
} from 'lucide-react'

// 增强的时间线事件接口
interface EnhancedTimelineEvent {
  id: string
  type: "milestone" | "observation" | "emotion" | "learning" | "health" | "birthday" | "first_time"
  title: string
  description: string
  date: string
  age: string
  icon: React.ComponentType<unknown>
  color: string
  media?: Array<{
    type: 'image' | 'video'
    url: string
    thumbnail?: string
    duration?: string
  }>
  tags?: string[]
  aiInsight?: string
  emotionalImpact?: 'low' | 'medium' | 'high'
  importance?: number
  isMemoryHighlight?: boolean
  familyReaction?: string[]
  location?: string
  weather?: string
}

interface EnhancedGrowthTimelineProps {
  events?: EnhancedTimelineEvent[]
  childName?: string
  birthdayMode?: boolean
}

// 小语专属的里程碑数据
const xiaoyuMilestones: EnhancedTimelineEvent[] = [
  {
    id: "1",
    type: "birthday",
    title: "小语1岁生日！",
    description: "今天是小语1岁的生日，全家人都在为这个特别的日子庆祝！小宝贝，生日快乐！",
    date: "2025-12-27",
    age: "1岁整",
    icon: Cake,
    color: "from-pink-400 to-purple-500",
    media: [
      { type: 'image', url: '/birthday-cake.jpg', thumbnail: '/birthday-cake-thumb.jpg' },
      { type: 'video', url: '/birthday-party.mp4', duration: '2:30' }
    ],
    tags: ["生日", "里程碑", "庆祝", "家庭"],
    aiInsight: "1岁生日是重要的成长里程碑，标志着从婴儿期向幼儿期的转变。这个时刻值得永远珍藏！",
    emotionalImpact: 'high',
    importance: 10,
    isMemoryHighlight: true,
    familyReaction: ["爸爸激动得流泪", "妈妈温暖的拥抱", "爷爷奶奶开心的笑容"],
    location: "家中生日派对",
    weather: "晴朗温暖"
  },
  {
    id: "2",
    type: "first_time",
    title: "第一次叫妈妈！",
    description: "今天小语第一次清晰地叫出'妈妈'，声音甜美动听，妈妈激动得抱住小宝贝亲了又亲！",
    date: "2025-11-15",
    age: "11个月",
    icon: Heart,
    color: "from-pink-400 to-rose-500",
    media: [{ type: 'video', url: '/first-mama.mp4', duration: '0:45' }],
    tags: ["第一次", "语言", "妈妈", "情感"],
    aiInsight: "第一次叫妈妈是语言发展的重要里程碑，也是亲子情感纽带的珍贵时刻。",
    emotionalImpact: 'high',
    importance: 9,
    isMemoryHighlight: true,
    familyReaction: ["妈妈激动地哭了", "爸爸录下了珍贵瞬间", "全家人都为小语鼓掌"],
    location: "家中客厅",
    weather: "阳光明媚"
  },
  {
    id: "3",
    type: "milestone",
    title: "独立站立10秒！",
    description: "小语今天能够独立站立10秒钟了！小家伙一脸骄傲，好像知道自己有多厉害！",
    date: "2025-10-20",
    age: "10个月",
    icon: Trophy,
    color: "from-yellow-400 to-orange-500",
    media: [{ type: 'video', url: '/standing.mp4', duration: '1:15' }],
    tags: ["运动", "独立", "平衡", "发展"],
    aiInsight: "独立站立是运动能力发展的重要标志，说明腿部力量和平衡能力都在快速发展。",
    emotionalImpact: 'medium',
    importance: 8,
    isMemoryHighlight: true,
    familyReaction: ["爸爸为小语鼓掌", "妈妈既紧张又开心"],
    location: "儿童房",
    weather: "阴天舒适"
  },
  {
    id: "4",
    type: "emotion",
    title: "认生期的敏感",
    description: "小语现在很认生，见到陌生人会紧紧抓住妈妈，这是情感发展的正常阶段。",
    date: "2025-09-10",
    age: "9个月",
    icon: HeartHandshake,
    color: "from-purple-400 to-indigo-500",
    tags: ["情感", "认生", "安全感", "发展"],
    aiInsight: "8-10个月的认生期是情感认知发展的正常表现，说明宝宝能够区分熟悉和陌生的人。",
    emotionalImpact: 'medium',
    importance: 6,
    familyReaction: ["妈妈温柔安抚", "爸爸耐心等待小语适应"],
    location: "亲戚聚会",
    weather: "周末多云"
  },
  {
    id: "5",
    type: "learning",
    title: "开始理解简单指令",
    description: "当说'把玩具给妈妈'时，小语能够理解并做出相应动作，小脑袋真聪明！",
    date: "2025-08-05",
    age: "8个月",
    icon: Sparkles,
    color: "from-blue-400 to-cyan-500",
    tags: ["认知", "理解", "语言", "智能"],
    aiInsight: "理解简单指令是认知能力发展的重要标志，说明宝宝的语言理解能力在快速提升。",
    emotionalImpact: 'medium',
    importance: 7,
    familyReaction: ["妈妈惊喜地表扬", "爸爸为小语的进步感到骄傲"],
    location: "家中游戏时间",
    weather: "雨天温馨"
  }
]

// 类型配置
const typeConfig = {
  milestone: {
    label: "里程碑",
    bgGradient: "from-yellow-100 to-orange-100",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-700",
    icon: Trophy
  },
  observation: {
    label: "观察记录",
    bgGradient: "from-purple-100 to-indigo-100",
    borderColor: "border-purple-400",
    textColor: "text-purple-700",
    icon: Camera
  },
  emotion: {
    label: "情感记录",
    bgGradient: "from-pink-100 to-rose-100",
    borderColor: "border-pink-400",
    textColor: "text-pink-700",
    icon: Heart
  },
  learning: {
    label: "学习记录",
    bgGradient: "from-blue-100 to-cyan-100",
    borderColor: "border-blue-400",
    textColor: "text-blue-700",
    icon: Sparkles
  },
  health: {
    label: "健康记录",
    bgGradient: "from-green-100 to-emerald-100",
    borderColor: "border-green-400",
    textColor: "text-green-700",
    icon: TrendingUp
  },
  birthday: {
    label: "生日庆祝",
    bgGradient: "from-pink-100 to-purple-100",
    borderColor: "border-pink-400",
    textColor: "text-pink-700",
    icon: Cake
  },
  first_time: {
    label: "第一次",
    bgGradient: "from-red-100 to-pink-100",
    borderColor: "border-red-400",
    textColor: "text-red-700",
    icon: Star
  }
}

export default function EnhancedGrowthTimeline({
  events = xiaoyuMilestones,
  childName = "小语",
  birthdayMode = true
}: EnhancedGrowthTimelineProps) {
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedEvent, setSelectedEvent] = useState<EnhancedTimelineEvent | null>(null)
  const [viewMode, setViewMode] = useState<"timeline" | "grid" | "carousel">("timeline")
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 动画相关refs
  const timelineRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const filteredEvents = selectedType === "all"
    ? events
    : events.filter(e => e.type === selectedType)

  // 按月份分组
  const groupedByMonth = filteredEvents.reduce((acc, event) => {
    const month = event.date.substring(0, 7)
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {} as Record<string, EnhancedTimelineEvent[]>)

  // 滚动进度监听
  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = timelineRef.current
        const progress = scrollTop / (scrollHeight - clientHeight)
        setScrollProgress(progress)
      }
    }

    const element = timelineRef.current
    if (element) {
      element.addEventListener('scroll', handleScroll)
      return () => element.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // 时间线动画函数
  const TimelineNode = ({ event, index, isExpanded }: {
    event: EnhancedTimelineEvent,
    index: number,
    isExpanded: boolean
  }) => {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const config = typeConfig[event.type]

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -50 }}
        animate={{
          opacity: isInView ? 1 : 0,
          x: isInView ? 0 : -50
        }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          ease: "easeOut"
        }}
        className={`relative bg-gradient-to-r ${config.bgGradient} rounded-2xl p-5 border-l-4 ${config.borderColor} cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
        onClick={() => setExpandedId(isExpanded ? null : event.id)}
      >
        {/* 重要性标记 */}
        {event.importance && event.importance >= 8 && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
        )}

        {/* 连接点 */}
        <div className={`absolute -left-[3.25rem] top-6 w-6 h-6 rounded-full bg-gradient-to-r ${event.color} border-4 border-white shadow-lg z-10`} />

        {/* 光晕效果 */}
        {event.isMemoryHighlight && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-200 to-purple-200 opacity-20 animate-pulse" />
        )}

        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${event.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
            <event.icon className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 text-lg">{event.title}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/70 ${config.textColor}`}>
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <Baby className="w-4 h-4" />
                {event.age}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {event.date}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  {event.location}
                </span>
              )}
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <p className="text-slate-600 mb-4 leading-relaxed">{event.description}</p>

                  {/* 媒体预览 */}
                  {event.media && event.media.length > 0 && (
                    <div className="mb-4">
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {event.media.map((media, mediaIndex) => (
                          <div key={mediaIndex} className="flex-shrink-0">
                            {media.type === 'image' ? (
                              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-400" />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center text-white text-xs">
                                <Video className="w-6 h-6 mb-1" />
                                {media.duration}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 标签 */}
                  {event.tags && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {event.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-white/70 rounded-full text-xs text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 家庭反应 */}
                  {event.familyReaction && (
                    <div className="bg-white/60 rounded-xl p-3 mb-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-pink-500" />
                        家庭反应
                      </h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {event.familyReaction.map((reaction, reactionIndex) => (
                          <li key={reactionIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                            {reaction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI洞察 */}
                  {event.aiInsight && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI小语洞察
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{event.aiInsight}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <ChevronRight
            className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* 头部统计区域 */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Baby className="w-8 h-8" />
              {childName}的成长时光机
            </h2>
            <p className="text-white/80">
              记录珍贵成长瞬间，见证每一个第一次
            </p>
          </div>
          {birthdayMode && (
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2 animate-pulse">
                <Cake className="w-8 h-8" />
              </div>
              <div className="text-sm font-medium">生日模式</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(typeConfig).map(([type, config]) => {
            const count = events.filter(e => e.type === type).length
            const Icon = config.icon
            return (
              <div key={type} className="text-center bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                <div className="flex justify-center mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs opacity-80">{config.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <motion.button
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            selectedType === "all"
              ? "bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg"
              : "bg-white text-slate-600 hover:bg-slate-50 shadow"
          }`}
          onClick={() => setSelectedType("all")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          全部记录
        </motion.button>
        {Object.entries(typeConfig).map(([type, config]) => {
          const Icon = config.icon
          return (
            <motion.button
              key={type}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                selectedType === type
                  ? `bg-gradient-to-r ${config.bgGradient} ${config.textColor} shadow-lg`
                  : "bg-white text-slate-600 hover:bg-slate-50 shadow"
              }`}
              onClick={() => setSelectedType(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              {config.label}
            </motion.button>
          )
        })}
      </div>

      {/* 视图切换 */}
      <div className="flex justify-end gap-2 mb-6">
        {[
          { mode: 'timeline', icon: Clock, label: '时间线' },
          { mode: 'grid', icon: Camera, label: '网格' },
          { mode: 'carousel', icon: Gift, label: '轮播' }
        ].map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              viewMode === mode
                ? 'bg-blue-100 text-blue-600 shadow-md'
                : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setViewMode(mode as 'timeline' | 'grid' | 'carousel')}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* 时间线视图 */}
      {viewMode === "timeline" && (
        <div
          ref={timelineRef}
          className="relative max-h-[800px] overflow-y-auto pr-4 custom-scrollbar"
        >
          {/* 滚动进度条 */}
          <div className="absolute top-0 right-0 w-1 h-full bg-gray-200 rounded-full">
            <div
              className="bg-gradient-to-b from-pink-400 to-purple-400 rounded-full transition-all duration-300"
              style={{ height: `${scrollProgress * 100}%` }}
            />
          </div>

          {/* 时间轴 */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-300 via-purple-300 to-blue-300 rounded-full" />

          {Object.entries(groupedByMonth).map(([month, monthEvents], monthIndex) => (
            <motion.div
              key={month}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: monthIndex * 0.1 }}
              className="mb-12"
            >
              {/* 月份标签 */}
              <div className="relative flex items-center mb-6">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-purple-400 flex items-center justify-center z-10 shadow-lg">
                  <span className="text-sm font-bold text-purple-600">
                    {month.split("-")[1]}月
                  </span>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-slate-700">
                    {month.split("-")[0]}年{month.split("-")[1]}月
                  </h3>
                  <p className="text-sm text-slate-500">
                    {monthEvents.length}个珍贵瞬间
                  </p>
                </div>
              </div>

              {/* 事件列表 */}
              <div className="ml-24 space-y-6">
                <AnimatePresence>
                  {monthEvents.map((event, index) => (
                    <TimelineNode
                      key={event.id}
                      event={event}
                      index={index}
                      isExpanded={expandedId === event.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 网格视图 */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => {
            const config = typeConfig[event.type]
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${config.bgGradient} rounded-2xl p-5 border-2 ${config.borderColor} hover:shadow-xl transition-all duration-300 cursor-pointer`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${event.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    <event.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{event.title}</h3>
                    <p className="text-sm text-slate-500">
                      {event.age} · {event.date}
                    </p>
                  </div>
                  {event.isMemoryHighlight && (
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>

                <p className="text-slate-600 mb-4 line-clamp-3">{event.description}</p>

                {event.media && event.media.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {event.media.slice(0, 3).map((media, mediaIndex) => (
                      <div key={mediaIndex} className="flex-1">
                        {media.type === 'image' ? (
                          <div className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera className="w-5 h-5 text-gray-400" />
                          </div>
                        ) : (
                          <div className="w-full h-16 bg-gray-800 rounded-lg flex items-center justify-center text-white text-xs">
                            <Video className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {event.tags && (
                  <div className="flex gap-1 flex-wrap">
                    {event.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-white/70 rounded-full text-xs text-slate-600">
                        #{tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="px-2 py-1 bg-white/70 rounded-full text-xs text-slate-600">
                        +{event.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* 轮播视图 */}
      {viewMode === "carousel" && (
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {filteredEvents.map((event, index) => {
              const config = typeConfig[event.type]
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex-shrink-0 w-80 bg-gradient-to-br ${config.bgGradient} rounded-2xl p-6 border-2 ${config.borderColor} snap-start`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${event.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                      <event.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      {event.age} · {event.date}
                    </p>
                    <p className="text-slate-600 mb-4">{event.description}</p>
                    {event.isMemoryHighlight && (
                      <div className="flex justify-center mb-4">
                        <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-slate-400 text-lg">
            暂无{selectedType !== "all" ? typeConfig[selectedType as keyof typeof typeConfig].label : "记录"}
          </p>
          <p className="text-slate-400 text-sm mt-2">
            开始记录{childName}的成长瞬间吧
          </p>
        </div>
      )}

      {/* 事件详情弹窗 */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEvent(null)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              className="relative bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
              >
                ×
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${selectedEvent.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <selectedEvent.icon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedEvent.title}</h2>
                  <p className="text-slate-500">
                    {selectedEvent.age} · {selectedEvent.date}
                  </p>
                </div>
              </div>

              <p className="text-slate-600 mb-6 text-lg leading-relaxed">{selectedEvent.description}</p>

              {selectedEvent.aiInsight && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
                  <h3 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI小语洞察
                  </h3>
                  <p className="text-slate-600">{selectedEvent.aiInsight}</p>
                </div>
              )}

              {selectedEvent.tags && (
                <div className="flex gap-2 flex-wrap">
                  {selectedEvent.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}