/**
 * @file MediaFileDetail.tsx
 * @description YYC³ AI小语智能成长守护系统媒体文件详情组件，展示选中文件的详细信息，包括AI分析结果、标签管理等功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Video, Heart, Share2, Download, Tag, Camera, Clock, Info, X, PlusCircle } from 'lucide-react';
import { MediaFile } from './types';
import { formatFileSize, calculateAge } from './utils';

interface MediaFileDetailProps {
  /** 选中的媒体文件 */
  file: MediaFile | null;
  /** 关闭详情面板回调 */
  onClose: () => void;
  /** 更新文件标签回调 */
  onUpdateTags: (fileId: string, tags: string[]) => void;
  /** 更新文件描述回调 */
  onUpdateDescription: (fileId: string, description: string) => void;
  /** 切换收藏状态回调 */
  onToggleFavorite?: (fileId: string) => void;
  /** 分享文件回调 */
  onShareFile?: (file: MediaFile) => void;
  /** 下载文件回调 */
  onDownloadFile?: (file: MediaFile) => void;
}

/**
 * 媒体文件详情组件
 * @param props 组件属性
 * @returns JSX元素
 */
export const MediaFileDetail: React.FC<MediaFileDetailProps> = ({
  file,
  onClose,
  onUpdateTags,
  onUpdateDescription,
  onToggleFavorite,
  onShareFile,
  onDownloadFile
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [descriptionText, setDescriptionText] = useState('');

  if (!file) return null;

  // 初始化描述文本
  React.useEffect(() => {
    setDescriptionText(file.description || '');
  }, [file.description]);

  // 添加新标签
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      const normalizedTag = newTag.trim().toLowerCase();
      if (!file.tags.includes(normalizedTag)) {
        onUpdateTags(file.id, [...file.tags, normalizedTag]);
      }
      setNewTag('');
    }
  };

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    onUpdateTags(file.id, file.tags.filter(t => t !== tag));
  };

  // 保存描述
  const handleSaveDescription = () => {
    onUpdateDescription(file.id, descriptionText);
    setIsEditingDescription(false);
  };

  // 获取主色调预览
  const renderColorPalette = () => {
    if (!file.aiAnalysis?.dominantColors || file.aiAnalysis.dominantColors.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {file.aiAnalysis.dominantColors.map((color, index) => (
          <div
            key={index}
            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {file && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-70"
            onClick={onClose}
          />

          {/* 详情面板 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full max-w-3xl bg-white shadow-2xl overflow-y-auto"
          >
            {/* 顶部控制栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                {file.name}
              </h2>
              <div className="flex items-center gap-2">
                {/* 收藏按钮 */}
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(file.id)}
                    className={`p-2 rounded-full transition-colors ${
                      file.favorite
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title={file.favorite ? '取消收藏' : '收藏'}
                  >
                    <Heart className="w-5 h-5" fill={file.favorite ? 'currentColor' : 'none'} />
                  </button>
                )}

                {/* 分享按钮 */}
                {onShareFile && (
                  <button
                    onClick={() => onShareFile(file)}
                    className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    title="分享"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}

                {/* 下载按钮 */}
                {onDownloadFile && (
                  <button
                    onClick={() => onDownloadFile(file)}
                    className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                    title="下载"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                )}

                {/* 关闭按钮 */}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 媒体预览 */}
            <div className="relative bg-gray-100">
              {file.type === 'image' ? (
                <Image
                  src={file.url || '/placeholder.png'}
                  alt={file.name}
                  width={1200}
                  height={800}
                  className="w-full h-auto object-contain max-h-[50vh]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.png';
                  }}
                />
              ) : (
                <div className="w-full h-[50vh] flex flex-col items-center justify-center bg-gray-200">
                  <Video className="w-20 h-20 text-red-500 mb-4" />
                  <span className="text-lg text-gray-500">视频预览</span>
                  <span className="text-sm text-gray-400 mt-2">{file.name}</span>
                </div>
              )}
            </div>

            {/* 文件元数据 */}
            <div className="p-6 space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-gray-500" />
                  文件信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">类型:</span>
                    <span className="font-medium text-gray-900">{file.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">大小:</span>
                    <span className="font-medium text-gray-900">{formatFileSize(file.size)}</span>
                  </div>
                  {file.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">位置:</span>
                      <span className="font-medium text-gray-900">{file.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">创建时间:</span>
                    <span className="font-medium text-gray-900">{new Date(file.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 人物信息 */}
              {file.people && file.people.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">人物</h3>
                  <div className="flex flex-wrap gap-3">
                    {file.people.map((person, index) => (
                      <div key={index} className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {person.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{person.name}</div>
                          {person.birthday && (
                            <div className="text-xs text-gray-500">{calculateAge(person.birthday)}岁</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 描述 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">描述</h3>
                {isEditingDescription ? (
                  <div className="flex gap-2">
                    <textarea
                      value={descriptionText}
                      onChange={(e) => setDescriptionText(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="添加描述..."
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => setIsEditingDescription(false)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        取消
                      </button>
                      <button
                        onClick={handleSaveDescription}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="flex-1 text-gray-700 whitespace-pre-wrap">
                      {descriptionText || <span className="text-gray-400 italic">暂无描述</span>}
                    </p>
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title="编辑描述"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>

              {/* 标签 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-500" />
                  标签
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {file.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-purple-600 hover:text-purple-800 hover:bg-purple-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="添加新标签..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleAddTag}
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (newTag.trim()) {
                        const normalizedTag = newTag.trim().toLowerCase();
                        if (!file.tags.includes(normalizedTag)) {
                          onUpdateTags(file.id, [...file.tags, normalizedTag]);
                        }
                        setNewTag('');
                      }
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-purple-500 hover:text-purple-700"
                    disabled={!newTag.trim()}
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AI分析结果 */}
              {file.aiAnalysis && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-gray-500" />
                    AI分析
                  </h3>
                  <div className="space-y-4">
                    {/* 场景 */}
                    {file.aiAnalysis.scene && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">场景</div>
                        <div className="text-gray-900">{file.aiAnalysis.scene}</div>
                      </div>
                    )}

                    {/* 物体 */}
                    {file.aiAnalysis.objects && file.aiAnalysis.objects.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">物体</div>
                        <div className="flex flex-wrap gap-2">
                          {file.aiAnalysis.objects.map((object, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                            >
                              {object}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 质量 */}
                    {file.aiAnalysis.quality && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">质量</div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${file.aiAnalysis.quality.score * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-900">{file.aiAnalysis.quality.rating}</span>
                        </div>
                      </div>
                    )}

                    {/* 主色调 */}
                    {file.aiAnalysis.dominantColors && file.aiAnalysis.dominantColors.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">主色调</div>
                        {renderColorPalette()}
                      </div>
                    )}

                    {/* 情绪 */}
                    {file.aiAnalysis.emotion && (
                      <div>
                        <div className="text-sm font-medium text-gray-500 mb-1">情绪</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(file.aiAnalysis.emotion).map(([emotion, score]) => (
                            <span
                              key={emotion}
                              className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                            >
                              {emotion}: {Math.round(score * 100)}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
