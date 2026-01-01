'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import {
  Upload,
  X,
  Camera,
  Video,
  Image,
  FileImage,
  Film,
  Play,
  Pause,
  Download,
  Trash2,
  RotateCw,
  Plus,
  FolderOpen,
  Check,
  AlertCircle,
  Sparkles,
  Heart,
  Star
} from 'lucide-react'

// 增强的媒体文件接口
interface EnhancedMediaFile {
  file: File
  id: string
  type: 'image' | 'video'
  name: string
  size: number
  lastModified: number
  preview?: string
  thumbnail?: string
  duration?: number
  dimensions?: { width: number; height: number }
  isUploading?: boolean
  uploadProgress?: number
  uploadError?: string
  tags?: string[]
  caption?: string
  isFavorite?: boolean
  isFeatured?: boolean
  processingStatus?: 'pending' | 'processing' | 'completed' | 'error'
}

interface EnhancedMediaUploaderProps {
  files: EnhancedMediaFile[]
  onChange: (files: EnhancedMediaFile[]) => void
  maxFiles?: number
  maxFileSize?: number // MB
  accept?: string
  enableDragDrop?: boolean
  enableBatchUpload?: boolean
  enableAutoTagging?: boolean
  enablePreview?: boolean
  uploadToCloud?: boolean
  onUploadStart?: (files: EnhancedMediaFile[]) => void
  onUploadComplete?: (files: EnhancedMediaFile[]) => void
  onUploadError?: (error: string) => void
}

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 视频时长格式化
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 生成文件ID
const generateFileId = () => Math.random().toString(36).substr(2, 9)

// 智能标签生成
const generateAutoTags = (file: EnhancedMediaFile): string[] => {
  const tags: string[] = []
  const fileName = file.name.toLowerCase()

  // 基于文件名的标签
  if (fileName.includes('birthday')) tags.push('生日')
  if (fileName.includes('milestone')) tags.push('里程碑')
  if (fileName.includes('first')) tags.push('第一次')
  if (fileName.includes('family')) tags.push('家庭')
  if (fileName.includes('play')) tags.push('游戏')
  if (fileName.includes('learning')) tags.push('学习')

  // 基于文件类型的标签
  if (file.type === 'video') {
    tags.push('视频', '动态记录')
  } else {
    tags.push('照片', '静态记录')
  }

  // 基于文件大小的标签
  if (file.size > 5 * 1024 * 1024) { // > 5MB
    tags.push('高清')
  }

  return tags
}

// 创建缩略图
const createThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.readAsDataURL(file)
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      video.onloadeddata = () => {
        canvas.width = 160
        canvas.height = 120
        video.currentTime = 1 // 截取第1秒作为缩略图
        video.onseeked = () => {
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            resolve(canvas.toDataURL())
          }
        }
      }
      video.src = URL.createObjectURL(file)
    } else {
      resolve('') // 其他类型文件返回空字符串
    }
  })
}

// 获取视频时长
const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.onloadedmetadata = () => {
      resolve(video.duration)
      URL.revokeObjectURL(video.src)
    }
    video.src = URL.createObjectURL(file)
  })
}

export default function EnhancedMediaUploader({
  files,
  onChange,
  maxFiles = 20,
  maxFileSize = 100, // 100MB
  accept = "image/*,video/*",
  enableDragDrop = true,
  enableBatchUpload = true,
  enableAutoTagging = true,
  enablePreview = true,
  uploadToCloud = false,
  onUploadStart,
  onUploadComplete,
  onUploadError
}: EnhancedMediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set())
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const dragControls = useDragControls()

  // 文件验证
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // 检查文件类型
    if (!accept.includes('*') && !accept.split(',').some(type => {
      if (type.includes('/*')) {
        return file.type.startsWith(type.split('/*')[0] + '/')
      }
      return file.type === type
    })) {
      return { isValid: false, error: '不支持的文件类型' }
    }

    // 检查文件大小
    if (file.size > maxFileSize * 1024 * 1024) {
      return { isValid: false, error: `文件大小不能超过 ${maxFileSize}MB` }
    }

    return { isValid: true }
  }

  // 处理文件选择
  const handleFileSelect = useCallback(async (selectedFiles: File[]) => {
    const newFiles: EnhancedMediaFile[] = []
    const errors: string[] = []

    for (const file of selectedFiles) {
      // 检查总文件数量限制
      if (files.length + newFiles.length >= maxFiles) {
        errors.push(`最多只能上传 ${maxFiles} 个文件`)
        break
      }

      // 验证文件
      const validation = validateFile(file)
      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`)
        continue
      }

      // 创建增强的文件对象
      const fileId = generateFileId()
      const fileType = file.type.startsWith('image/') ? 'image' : 'video'

      let thumbnail: string | undefined
      let duration: number | undefined
      let dimensions: { width: number; height: number } | undefined

      try {
        thumbnail = await createThumbnail(file)

        if (fileType === 'video') {
          duration = await getVideoDuration(file)
        }

        // 获取图片/视频尺寸
        if (fileType === 'image') {
          const img = new Image()
          img.onload = () => {
            dimensions = { width: img.width, height: img.height }
          }
          img.src = URL.createObjectURL(file)
        }
      } catch (error) {
        console.error('文件处理失败:', error)
      }

      const enhancedFile: EnhancedMediaFile = {
        file,
        id: fileId,
        type: fileType,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        preview: thumbnail,
        thumbnail,
        duration,
        dimensions,
        isUploading: false,
        uploadProgress: 0,
        tags: enableAutoTagging ? generateAutoTags({ file, id: fileId, type: fileType, name: file.name, size: file.size, lastModified: file.lastModified }) : [],
        caption: '',
        isFavorite: false,
        isFeatured: false,
        processingStatus: 'pending'
      }

      newFiles.push(enhancedFile)
    }

    if (errors.length > 0 && onUploadError) {
      onUploadError(errors.join('; '))
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles]
      onChange(updatedFiles)

      // 模拟上传进度
      if (uploadToCloud) {
        onUploadStart?.(newFiles)
        newFiles.forEach(file => {
          simulateUpload(file.id)
        })
      }
    }
  }, [files, maxFiles, maxFileSize, accept, enableAutoTagging, uploadToCloud, onChange, onUploadStart, onUploadError])

  // 模拟上传进度
  const simulateUpload = (fileId: string) => {
    setUploadingFiles(prev => new Set(prev).add(fileId))

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadingFiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })

        onChange(prev => prev.map(file =>
          file.id === fileId
            ? { ...file, isUploading: false, uploadProgress: 100, processingStatus: 'completed' as const }
            : file
        ))
      } else {
        onChange(prev => prev.map(file =>
          file.id === fileId
            ? { ...file, uploadProgress: progress, isUploading: true }
            : file
        ))
      }
    }, 300)
  }

  // 删除文件
  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    onChange(updatedFiles)
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileId)
      return newSet
    })
  }

  // 切换文件选择状态
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set())
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)))
    }
  }

  // 批量删除
  const deleteSelected = () => {
    const updatedFiles = files.filter(f => !selectedFiles.has(f.id))
    onChange(updatedFiles)
    setSelectedFiles(new Set())
  }

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (enableDragDrop) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    if (enableDragDrop && e.dataTransfer.files) {
      handleFileSelect(Array.from(e.dataTransfer.files))
    }
  }

  // 排序文件
  const sortedFiles = [...files].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'size':
        return b.size - a.size
      case 'date':
      default:
        return b.lastModified - a.lastModified
    }
  })

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      {/* 头部 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Camera className="w-6 h-6 text-purple-600" />
          智能媒体上传器
        </h2>
        <p className="text-gray-600">
          上传照片和视频，记录小语的美好成长瞬间
        </p>
      </div>

      {/* 上传区域 */}
      <div
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
          isDragOver
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
        } ${enableDragDrop ? 'cursor-pointer' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !enableDragDrop && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={enableBatchUpload}
          onChange={(e) => e.target.files && handleFileSelect(Array.from(e.target.files))}
          className="hidden"
        />

        <div className="text-center">
          <motion.div
            animate={{
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0
            }}
            className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Upload className="w-8 h-8 text-purple-600" />
          </motion.div>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isDragOver ? '释放以上传文件' : '拖拽文件到这里'}
          </h3>

          <p className="text-gray-600 mb-4">
            或者
            <button
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
              className="ml-2 text-purple-600 hover:text-purple-700 font-medium underline"
            >
              点击选择文件
            </button>
          </p>

          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-500">
            <span>最多 {maxFiles} 个文件</span>
            <span>单个文件最大 {maxFileSize}MB</span>
            <span>支持图片和视频</span>
          </div>
        </div>

        {isDragOver && (
          <motion.div
            className="absolute inset-0 bg-purple-100 bg-opacity-50 rounded-2xl border-4 border-purple-400 border-dashed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>

      {/* 工具栏 */}
      {files.length > 0 && (
        <motion.div
          className="mt-6 p-4 bg-gray-50 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === files.length}
                  onChange={toggleSelectAll}
                  className="rounded text-purple-600"
                />
                <span className="text-sm text-gray-700">全选 ({selectedFiles.size})</span>
              </label>

              {selectedFiles.size > 0 && (
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  删除选中
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="date">按日期排序</option>
                <option value="name">按名称排序</option>
                <option value="size">按大小排序</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}
                >
                  <Film className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}
                >
                  <Image className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 文件列表 */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedFiles.map((file, index) => (
                  <MediaCard
                    key={file.id}
                    file={file}
                    index={index}
                    isSelected={selectedFiles.has(file.id)}
                    onToggleSelect={() => toggleFileSelection(file.id)}
                    onRemove={() => removeFile(file.id)}
                    onUpdate={(updatedFile) => {
                      onChange(prev => prev.map(f => f.id === file.id ? updatedFile : f))
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {sortedFiles.map((file, index) => (
                  <MediaListItem
                    key={file.id}
                    file={file}
                    index={index}
                    isSelected={selectedFiles.has(file.id)}
                    onToggleSelect={() => toggleFileSelection(file.id)}
                    onRemove={() => removeFile(file.id)}
                    onUpdate={(updatedFile) => {
                      onChange(prev => prev.map(f => f.id === file.id ? updatedFile : f))
                    }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 上传统计 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>共 {files.length} 个文件</span>
            <span>总计 {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}</span>
            {uploadingFiles.size > 0 && (
              <span className="text-purple-600">上传中 {uploadingFiles.size} 个文件</span>
            )}
          </div>

          {files.length > 0 && (
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                开始上传
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 媒体卡片组件
function MediaCard({
  file,
  index,
  isSelected,
  onToggleSelect,
  onRemove,
  onUpdate
}: {
  file: EnhancedMediaFile
  index: number
  isSelected: boolean
  onToggleSelect: () => void
  onRemove: () => void
  onUpdate: (file: EnhancedMediaFile) => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="relative bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 transition-all duration-300 cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, shadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onToggleSelect}
    >
      {/* 选择状态指示 */}
      <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 z-10 transition-colors ${
        isSelected ? 'bg-purple-600 border-purple-600' : 'bg-white border-gray-300'
      }`}>
        {isSelected && (
          <Check className="w-4 h-4 text-white m-0.5" />
        )}
      </div>

      {/* 收藏标记 */}
      <button
        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-md z-10 flex items-center justify-center hover:bg-pink-50"
        onClick={(e) => {
          e.stopPropagation()
          onUpdate({ ...file, isFavorite: !file.isFavorite })
        }}
      >
        <Heart className={`w-3 h-3 ${file.isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
      </button>

      {/* 预览区域 */}
      <div className="relative aspect-square bg-gray-100">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : file.type === 'image' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Video className="w-12 h-12 text-white" />
          </div>
        )}

        {/* 视频时长 */}
        {file.type === 'video' && file.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {formatDuration(file.duration)}
          </div>
        )}

        {/* 上传进度 */}
        {file.isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="w-16 h-16">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="#ffffff"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(file.uploadProgress || 0) * 1.76} 176`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {Math.round(file.uploadProgress || 0)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 悬停控制 */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-end w-full">
              <div className="text-white">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs opacity-80">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 标签 */}
      {file.tags && file.tags.length > 0 && (
        <div className="p-3">
          <div className="flex gap-1 flex-wrap">
            {file.tags.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
            {file.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{file.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 特色标记 */}
      {file.isFeatured && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium">
          <Star className="w-3 h-3 inline mr-1" />
          特色
        </div>
      )}
    </motion.div>
  )
}

// 媒体列表项组件
function MediaListItem({
  file,
  index,
  isSelected,
  onToggleSelect,
  onRemove,
  onUpdate
}: {
  file: EnhancedMediaFile
  index: number
  isSelected: boolean
  onToggleSelect: () => void
  onRemove: () => void
  onUpdate: (file: EnhancedMediaFile) => void
}) {
  return (
    <motion.div
      className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-300"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      {/* 选择框 */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="w-5 h-5 text-purple-600 rounded"
      />

      {/* 缩略图 */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {file.thumbnail ? (
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : file.type === 'image' ? (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-400" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Video className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      {/* 文件信息 */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{file.name}</h4>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>{formatFileSize(file.size)}</span>
          {file.duration && <span>• {formatDuration(file.duration)}</span>}
          {file.dimensions && (
            <span>• {file.dimensions.width}×{file.dimensions.height}</span>
          )}
          {new Date(file.lastModified).toLocaleDateString()}
        </div>

        {/* 标签 */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {file.tags.map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate({ ...file, isFavorite: !file.isFavorite })}
          className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
        >
          <Heart className={`w-4 h-4 ${file.isFavorite ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
        </button>

        <button
          onClick={() => onUpdate({ ...file, isFeatured: !file.isFeatured })}
          className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
        >
          <Star className={`w-4 h-4 ${file.isFeatured ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} />
        </button>

        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}