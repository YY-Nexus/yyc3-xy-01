'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  Calendar,
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share,
  Download,
  Star,
  Baby,
  Clock,
  MapPin,
  Users
} from 'lucide-react'
import { useBirthdayTheme } from './BirthdayThemeProvider'

// 照片接口
interface Photo {
  id: string
  url: string
  thumbnail: string
  caption: string
  date: string
  age: string
  location?: string
  tags: string[]
  type: 'photo' | 'video'
  duration?: string
  family?: string[]
  isFavorite?: boolean
  story?: string
}

// 小语专属照片数据
const xiaoyuPhotos: Photo[] = [
  {
    id: '1',
    url: '/xiaoyu-1.jpg',
    thumbnail: '/xiaoyu-1-thumb.jpg',
    caption: '小语出生第一天',
    date: '2024-12-27',
    age: '0天',
    location: '医院',
    tags: ['出生', '第一次', '里程碑'],
    type: 'photo',
    family: ['爸爸', '妈妈', '奶奶', '爷爷'],
    isFavorite: true,
    story: '这是小语来到世界的第一天，全家人都激动得热泪盈眶。这个小生命给我们带来了无尽的欢乐和希望。'
  },
  {
    id: '2',
    url: '/xiaoyu-smile.mp4',
    thumbnail: '/xiaoyu-smile-thumb.jpg',
    caption: '第一次露出笑容',
    date: '2025-01-15',
    age: '19天',
    location: '家中客厅',
    tags: ['微笑', '第一次', '情感'],
    type: 'video',
    duration: '0:45',
    family: ['妈妈'],
    isFavorite: true,
    story: '今天小语第一次对妈妈露出了天使般的笑容，那一刻妈妈的心都融化了。这是最珍贵的回忆之一。'
  },
  {
    id: '3',
    url: '/xiaoyu-birthday-party.jpg',
    thumbnail: '/xiaoyu-birthday-party-thumb.jpg',
    caption: '100天庆祝派对',
    date: '2025-04-06',
    age: '100天',
    location: '家中',
    tags: ['里程碑', '庆祝', '家庭聚会'],
    type: 'photo',
    family: ['爸爸', '妈妈', '奶奶', '爷爷', '叔叔阿姨们'],
    isFavorite: true,
    story: '小语100天啦！全家人为她举办了隆重的庆祝派对，好多亲戚朋友都来为小宝贝送上祝福。'
  },
  {
    id: '4',
    url: '/xiaoyu-first-crawl.mp4',
    thumbnail: '/xiaoyu-first-crawl-thumb.jpg',
    caption: '第一次爬行',
    date: '2025-08-20',
    age: '8个月',
    location: '儿童房',
    tags: ['运动', '第一次', '成长'],
    type: 'video',
    duration: '1:30',
    family: ['爸爸', '妈妈'],
    isFavorite: true,
    story: '小语第一次成功爬行！虽然只是一小段距离，但这是她探索世界的重要一步。爸爸妈妈在旁边为她鼓掌加油！'
  },
  {
    id: '5',
    url: '/xiaoyu-birthday-1.jpg',
    thumbnail: '/xiaoyu-birthday-1-thumb.jpg',
    caption: '1岁生日蛋糕',
    date: '2025-12-27',
    age: '1岁',
    location: '家中',
    tags: ['生日', '里程碑', '庆祝'],
    type: 'photo',
    family: ['爸爸', '妈妈', '奶奶', '爷爷'],
    isFavorite: true,
    story: '小语1岁生日啦！全家人围在一起为她唱生日歌，小宝贝虽然还不太明白，但看到蛋糕时眼睛亮晶晶的。'
  }
]

export default function XiaoyuMemorialAlbum() {
  const { theme, isActive } = useBirthdayTheme()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [viewMode, setViewMode] = useState<'slideshow' | 'grid' | 'timeline'>('slideshow')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showDetails, setShowDetails] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentPhoto = xiaoyuPhotos[currentPhotoIndex]

  // 自动播放功能
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % xiaoyuPhotos.length)
      }, 4000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying])

  // 手动切换照片
  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index)
    setIsAutoPlaying(false)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % xiaoyuPhotos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + xiaoyuPhotos.length) % xiaoyuPhotos.length)
  }

  // 筛选标签
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // 获取所有标签
  const allTags = Array.from(new Set(xiaoyuPhotos.flatMap(photo => photo.tags)))

  // 过滤照片
  const filteredPhotos = selectedTags.length > 0
    ? xiaoyuPhotos.filter(photo => photo.tags.some(tag => selectedTags.includes(tag)))
    : xiaoyuPhotos

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题区域 */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
            🌟 小语成长纪念册
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            记录小语从出生到1岁的珍贵瞬间，每一张照片都是爱的见证
          </p>

          {/* 控制按钮 */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={() => setViewMode('slideshow')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'slideshow'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Camera className="w-4 h-4" />
              幻灯片
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              网格
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                viewMode === 'timeline'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Clock className="w-4 h-4" />
              时间轴
            </button>
          </div>
        </motion.div>

        {/* 幻灯片视图 */}
        {viewMode === 'slideshow' && (
          <motion.div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              {/* 主显示区域 */}
              <div className="relative aspect-video bg-gray-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPhoto.id}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                  >
                    {currentPhoto.type === 'photo' ? (
                      <img
                        src={currentPhoto.thumbnail}
                        alt={currentPhoto.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={currentPhoto.thumbnail}
                          alt={currentPhoto.caption}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black bg-opacity-50 rounded-full p-4">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* 导航按钮 */}
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-800" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                >
                  <ChevronRight className="w-6 h-6 text-gray-800" />
                </button>

                {/* 自动播放控制 */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-white bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all"
                >
                  {isAutoPlaying ? (
                    <Pause className="w-6 h-6 text-gray-800" />
                  ) : (
                    <Play className="w-6 h-6 text-gray-800" />
                  )}
                </button>
              </div>

              {/* 照片信息 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentPhoto.caption}</h2>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {currentPhoto.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Baby className="w-4 h-4" />
                        {currentPhoto.age}
                      </span>
                      {currentPhoto.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {currentPhoto.location}
                        </span>
                      )}
                      {currentPhoto.duration && (
                        <span className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          {currentPhoto.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  {currentPhoto.isFavorite && (
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  )}
                </div>

                {/* 标签 */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {currentPhoto.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 故事 */}
                {currentPhoto.story && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                    <h3 className="font-semibold text-purple-700 mb-2 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      成长故事
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{currentPhoto.story}</p>
                  </div>
                )}

                {/* 家庭成员 */}
                {currentPhoto.family && currentPhoto.family.length > 0 && (
                  <div className="mt-4 p-4 bg-pink-50 rounded-xl">
                    <h3 className="font-semibold text-pink-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      见证家人
                    </h3>
                    <div className="flex gap-2 flex-wrap">
                      {currentPhoto.family.map((member, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white text-pink-600 rounded-lg text-sm"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 缩略图导航 */}
              <div className="border-t p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {xiaoyuPhotos.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => goToPhoto(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        index === currentPhotoIndex
                          ? 'ring-4 ring-purple-500 scale-110'
                          : 'ring-2 ring-gray-200 hover:ring-gray-300'
                      }`}
                    >
                      <img
                        src={photo.thumbnail}
                        alt={photo.caption}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 网格视图 */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setCurrentPhotoIndex(xiaoyuPhotos.indexOf(photo))
                  setViewMode('slideshow')
                }}
              >
                <div className="relative aspect-square">
                  <img
                    src={photo.thumbnail}
                    alt={photo.caption}
                    className="w-full h-full object-cover"
                  />
                  {photo.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black bg-opacity-50 rounded-full p-3">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                  {photo.isFavorite && (
                    <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{photo.caption}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{photo.age}</span>
                    <span>•</span>
                    <span>{photo.date}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {photo.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 时间轴视图 */}
        {viewMode === 'timeline' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="relative">
              {/* 时间轴线 */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-400 to-purple-400" />

              {xiaoyuPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="relative mb-8 ml-16"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* 时间点 */}
                  <div className="absolute -left-10 top-4 w-4 h-4 bg-white border-4 border-purple-400 rounded-full" />

                  {/* 内容卡片 */}
                  <div className="flex gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl">
                    <img
                      src={photo.thumbnail}
                      alt={photo.caption}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{photo.caption}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>{photo.age}</span>
                        <span>{photo.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{photo.story}</p>
                    </div>
                    {photo.isFavorite && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}