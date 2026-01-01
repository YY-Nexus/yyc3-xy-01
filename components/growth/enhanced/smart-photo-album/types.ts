/**
 * @file 智能相册类型定义
 * @description 定义智能相册模块的所有TypeScript类型
 * @module components/growth/enhanced/smart-photo-album/types
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

/**
 * 媒体文件类型
 */
export type MediaType = 'photo' | 'video';

/**
 * 情感分析结果
 */
export interface EmotionAnalysis {
  emotion: 'happy' | 'sad' | 'neutral' | 'angry' | 'surprised' | 'fearful' | 'disgusted';
  confidence: number;
  person?: string;
}

/**
 * AI分析结果
 */
export interface AIAnalysis {
  objects: string[];
  scene: string;
  quality: 'low' | 'medium' | 'high';
  colorScheme: string[];
  相似度?: number;
}

/**
 * 媒体文件元数据
 */
export interface MediaMetadata {
  camera?: string;
  settings?: string;
  fileSize?: string;
  format?: string;
  [key: string]: unknown;
}

/**
 * 媒体文件接口
 */
export interface MediaFile {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  filename: string;
  size: number;
  duration?: number;
  dimensions: { width: number; height: number };
  date: string;
  age: string;
  location?: string;
  people: string[];
  tags: string[];
  emotions: EmotionAnalysis[];
  description: string;
  isFavorite: boolean;
  aiAnalysis?: AIAnalysis;
  metadata: MediaMetadata;
}

/**
 * 视图模式
 */
export type ViewMode = 'grid' | 'list' | 'timeline';

/**
 * 排序方式
 */
export type SortBy = 'date' | 'name' | 'size';

/**
 * 搜索和过滤参数
 */
export interface FilterParams {
  searchQuery: string;
  selectedTags: string[];
  dateRange: { start: string; end: string };
}

/**
 * 智能标签建议
 */
export interface SmartTagSuggestions {
  [category: string]: string[];
}
