/**
 * @file SmartPhotoAlbumManager.tsx
 * @description YYC³ AI小语智能成长守护系统智能相册管理器主组件，整合所有智能相册相关组件的主控制器
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Grid, List, Upload, Plus } from 'lucide-react'

// 导入自定义钩子
import { useMediaFiles } from './smart-photo-album/useMediaFiles'

// 导入类型
import { MediaFile, ViewMode, SortBy, FilterParams } from './smart-photo-album/types'

// 导入子组件
import { MediaFilters } from './smart-photo-album/MediaFilters'
import { MediaFileList } from './smart-photo-album/MediaFileList'
import { MediaFileDetail } from './smart-photo-album/MediaFileDetail'
import { MediaUploader } from './smart-photo-album/MediaUploader'

interface SmartPhotoAlbumManagerProps {
  /** 初始媒体文件列表 */
  initialFiles?: MediaFile[]
  /** 自定义样式类名 */
  className?: string
}

/**
 * 智能相册管理器主组件
 * @param props 组件属性
 * @returns JSX元素
 */
export const SmartPhotoAlbumManager: React.FC<SmartPhotoAlbumManagerProps> = ({
  initialFiles = [],
  className = ''
}) => {
  // 状态管理
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showUploader, setShowUploader] = useState(false)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [filterParams, setFilterParams] = useState<FilterParams>({ query: '', selectedTags: [], dateRange: null })
  const [sortBy, setSortBy] = useState<SortBy>('dateDesc')

  // 使用自定义钩子管理媒体文件
  const {
    mediaFiles,
    filteredFiles,
    isLoading,
    uploadMediaFiles,
    toggleFavorite,
    deleteMediaFile,
    updateMediaFile
  } = useMediaFiles({
    initialFiles,
    filterParams,
    sortBy
  })

  // 处理文件上传
  const handleUpload = async (files: File[]) => {
    await uploadMediaFiles(files)
    setShowUploader(false)
  }

  // 处理文件选择
  const handleFileSelect = (file: MediaFile) => {
    setSelectedFile(file)
  }

  // 处理文件更新
  const handleFileUpdate = (updatedFile: MediaFile) => {
    updateMediaFile(updatedFile)
    if (selectedFile?.id === updatedFile.id) {
      setSelectedFile(updatedFile)
    }
  }

  // 关闭文件详情
  const handleCloseDetail = () => {
    setSelectedFile(null)
  }

  // 切换视图模式
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* 标题和操作栏 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">智能成长相册</h1>
              <p className="text-gray-600">
                记录小语成长的每一个珍贵瞬间，AI智能分析与管理
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleViewMode}
                className="p-2 rounded-md bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                aria-label={viewMode === 'grid' ? '切换到列表视图' : '切换到网格视图'}
              >
                {viewMode === 'grid' ? (
                  <List className="w-5 h-5 text-gray-600" />
                ) : (
                  <Grid className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                上传媒体
              </button>
            </div>
          </div>

          {/* 过滤和搜索 */}
          <MediaFilters
            filterParams={filterParams}
            sortBy={sortBy}
            onFilterChange={setFilterParams}
            onSortChange={setSortBy}
          />
        </div>

        {/* 上传器模态框 */}
        {showUploader && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">上传媒体文件</h2>
                <MediaUploader onUpload={handleUpload} />
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowUploader(false)}
                    className="px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 媒体文件列表 */}
          <div className="lg:col-span-2">
            <MediaFileList
              files={filteredFiles}
              viewMode={viewMode}
              isLoading={isLoading}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteMediaFile}
            />
          </div>

          {/* 文件详情 */}
          <div className="lg:col-span-1">
            {selectedFile ? (
              <MediaFileDetail
                file={selectedFile}
                onUpdate={handleFileUpdate}
                onClose={handleCloseDetail}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择或上传媒体文件</h3>
                <p className="text-sm text-gray-500 mb-4">
                  点击左侧的媒体文件查看详情，或上传新的照片和视频
                </p>
                <button
                  onClick={() => setShowUploader(true)}
                  className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors text-sm font-medium"
                >
                  上传媒体
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmartPhotoAlbumManager
