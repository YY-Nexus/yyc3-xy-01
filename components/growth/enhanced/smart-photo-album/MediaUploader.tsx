/**
 * @file MediaUploader.tsx
 * @description YYC³ AI小语智能成长守护系统媒体文件上传组件，处理照片和视频的上传功能，支持拖放和点击上传
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, Video, X, CheckCircle, AlertCircle } from 'lucide-react';

interface MediaUploaderProps {
  /** 上传文件回调 */
  onUpload: (files: File[]) => Promise<void>;
  /** 支持的文件类型 */
  accept?: string;
  /** 最大文件大小（字节） */
  maxFileSize?: number;
  /** 最大上传文件数量 */
  maxFiles?: number;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 媒体文件上传组件
 * @param props 组件属性
 * @returns JSX元素
 */
export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUpload,
  accept = 'image/*,video/*',
  maxFileSize = 1024 * 1024 * 50, // 50MB
  maxFiles = 10,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [successFiles, setSuccessFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理拖放事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
      // 重置文件输入，允许重复选择相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 处理点击上传区域
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 处理文件上传
  const handleUploadFiles = async (files: File[]) => {
    setUploading(true);
    setUploadProgress(0);
    setErrors([]);
    setSuccessFiles([]);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // 调用上传回调
      await onUpload(files);
      
      setSuccessFiles(files);
      setUploadProgress(100);
      
      // 3秒后清空成功消息
      setTimeout(() => {
        setSuccessFiles([]);
      }, 3000);
    } catch (error) {
      setErrors([`上传失败: ${error instanceof Error ? error.message : '未知错误'}`]);
    } finally {
      setUploading(false);
    }
  };

  // 验证和处理文件
  const processFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    // 检查文件数量
    if (files.length > maxFiles) {
      newErrors.push(`最多只能上传${maxFiles}个文件`);
      files = files.slice(0, maxFiles);
    }

    // 验证每个文件
    files.forEach((file) => {
      // 检查文件类型
      if (!file.type.match(/(image|video)\//)) {
        newErrors.push(`${file.name}: 不支持的文件类型`);
        return;
      }

      // 检查文件大小
      if (file.size > maxFileSize) {
        newErrors.push(`${file.name}: 文件大小超过限制（最大${formatFileSize(maxFileSize)}）`);
        return;
      }

      validFiles.push(file);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      // 3秒后清空错误消息
      setTimeout(() => {
        setErrors([]);
      }, 3000);
    }

    if (validFiles.length > 0) {
      handleUploadFiles(validFiles);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 获取文件类型图标
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">上传照片或视频</h3>
        <p className="text-sm text-gray-500 mb-4">
          拖拽文件到此处，或 <span className="text-purple-600 font-medium">点击上传</span>
        </p>
        <p className="text-xs text-gray-400">
          支持 JPG、PNG、GIF、MP4 格式，单个文件最大 {formatFileSize(maxFileSize)}，最多上传 {maxFiles} 个文件
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* 上传进度 */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">上传中...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 成功消息 */}
      <AnimatePresence>
        {successFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-900">上传成功</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {successFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border border-green-100">
                  {getFileIcon(file)}
                  <span className="text-xs text-gray-700 truncate">{file.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 错误消息 */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-900">上传失败</span>
              </div>
              <button
                onClick={() => setErrors([])}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
