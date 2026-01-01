/**
 * @file 媒体文件管理Hook
 * @description 提供媒体文件的状态管理和业务逻辑
 * @module components/growth/enhanced/smart-photo-album/useMediaFiles
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

import { useState, useMemo, useCallback, RefObject } from 'react';
import { MediaFile, FilterParams, SortBy } from './types';
import { calculateAge, generateSmartTags, formatFileSize } from './utils';

// 模拟媒体数据
const mockMediaFiles: MediaFile[] = [
  {
    id: '1',
    type: 'photo',
    url: '/xiaoyu-first-birthday.jpg',
    thumbnail: '/xiaoyu-first-birthday-thumb.jpg',
    filename: '小语一岁生日.jpg',
    size: 2048000,
    dimensions: { width: 1920, height: 1080 },
    date: '2025-12-27',
    age: '1岁',
    location: '家中',
    people: ['小语', '爸爸', '妈妈'],
    tags: ['生日', '家庭', '快乐', '成长'],
    emotions: [
      { emotion: 'happy', confidence: 0.9, person: '小语' },
      { emotion: 'happy', confidence: 0.8, person: '妈妈' },
      { emotion: 'happy', confidence: 0.7, person: '爸爸' }
    ],
    description: '小语一岁生日派对，全家人一起庆祝她的成长里程碑',
    isFavorite: true,
    aiAnalysis: {
      objects: ['婴儿', '蛋糕', '气球', '礼物'],
      scene: '生日派对',
      quality: 'high',
      colorScheme: ['粉色', '蓝色', '黄色'],
      相似度: 0.9
    },
    metadata: {
      camera: 'iPhone 15 Pro',
      settings: '1920x1080, HDR',
      fileSize: '2 MB',
      format: 'JPEG'
    }
  },
  {
    id: '2',
    type: 'photo',
    url: '/xiaoyu-swimming.jpg',
    thumbnail: '/xiaoyu-swimming-thumb.jpg',
    filename: '小语第一次游泳.jpg',
    size: 3072000,
    dimensions: { width: 2048, height: 1536 },
    date: '2025-06-15',
    age: '6个月',
    location: '婴儿游泳馆',
    people: ['小语', '妈妈', '游泳教练'],
    tags: ['游泳', '第一次', '成长', '运动'],
    emotions: [
      { emotion: 'happy', confidence: 0.8, person: '小语' },
      { emotion: 'neutral', confidence: 0.7, person: '妈妈' }
    ],
    description: '小语第一次在专业游泳馆游泳，表现得非常勇敢！',
    isFavorite: true,
    aiAnalysis: {
      objects: ['婴儿', '游泳池', '游泳圈', '教练'],
      scene: '游泳馆',
      quality: 'high',
      colorScheme: ['蓝色', '白色'],
      相似度: 0.88
    },
    metadata: {
      camera: 'Canon EOS R5',
      settings: '2048x1536, f/2.8, 1/200s',
      fileSize: '3 MB',
      format: 'JPEG'
    }
  },
  {
    id: '3',
    type: 'video',
    url: '/xiaoyu-speaking.mp4',
    thumbnail: '/xiaoyu-speaking-thumb.jpg',
    filename: '小语第一次说话.mp4',
    size: 4096000,
    duration: 120,
    dimensions: { width: 1280, height: 720 },
    date: '2025-10-01',
    age: '10个月',
    location: '客厅',
    people: ['小语', '妈妈'],
    tags: ['说话', '第一次', '成长', '家庭'],
    emotions: [
      { emotion: 'happy', confidence: 0.9, person: '小语' },
      { emotion: 'excited', confidence: 0.95, person: '妈妈' }
    ],
    description: '小语第一次清晰地说出"妈妈"，这是最珍贵的时刻！',
    isFavorite: true,
    aiAnalysis: {
      objects: ['婴儿', '沙发', '茶几', '玩具'],
      scene: '客厅',
      quality: 'high',
      colorScheme: ['白色', '灰色', '橙色'],
      相似度: 0.92
    },
    metadata: {
      camera: 'Samsung Galaxy S24',
      settings: '1280x720, 30fps',
      fileSize: '4 MB',
      format: 'MP4'
    }
  },
  {
    id: '4',
    type: 'video',
    url: '/xiaoyu-crawling.mp4',
    thumbnail: '/xiaoyu-crawling-thumb.jpg',
    filename: '第一次爬行.mp4',
    size: 6144000,
    duration: 90,
    dimensions: { width: 1920, height: 1080 },
    date: '2025-08-20',
    age: '8个月',
    location: '儿童房',
    people: ['小语', '爸爸', '妈妈'],
    tags: ['爬行', '运动发展', '第一次', '成长'],
    emotions: [
      { emotion: 'neutral', confidence: 0.7, person: '小语' },
      { emotion: 'happy', confidence: 0.9, person: '妈妈' }
    ],
    description: '小语第一次成功爬行！这是她探索世界的重要一步',
    isFavorite: true,
    aiAnalysis: {
      objects: ['婴儿', '玩具', '地毯', '家具'],
      scene: '儿童房',
      quality: 'medium',
      colorScheme: ['黄色', '蓝色', '绿色'],
      相似度: 0.85
    },
    metadata: {
      camera: 'iPhone 15 Pro',
      settings: '1080p, 60fps',
      fileSize: '5.9 MB',
      format: 'MP4'
    }
  }
];

/**
 * 媒体文件管理Hook
 * @returns 媒体文件管理相关的状态和方法
 */
export const useMediaFiles = () => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(mockMediaFiles);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoTagging, setAutoTagging] = useState(true);

  // 过滤参数
  const filterParams: FilterParams = useMemo(() => ({
    searchQuery,
    selectedTags,
    dateRange
  }), [searchQuery, selectedTags, dateRange]);

  // 过滤和排序文件
  const filteredFiles = useMemo(() => {
    let filtered = mediaFiles.filter(file => {
      // 搜索过滤
      const matchesSearch = searchQuery === '' ||
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // 标签过滤
      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => file.tags.includes(tag));

      // 日期范围过滤
      let matchesDate = true;
      if (dateRange.start) {
        matchesDate = matchesDate && file.date >= dateRange.start;
      }
      if (dateRange.end) {
        matchesDate = matchesDate && file.date <= dateRange.end;
      }

      return matchesSearch && matchesTags && matchesDate;
    });

    // 排序
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return b.size - a.size;
        default:
          return 0;
      }
    });
  }, [mediaFiles, searchQuery, selectedTags, dateRange, sortBy]);

  // 获取所有标签
  const allTags = useMemo(() => {
    return Array.from(new Set(mediaFiles.flatMap(file => file.tags)));
  }, [mediaFiles]);

  // 切换文件选择状态
  const toggleFileSelection = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  // 切换收藏状态
  const toggleFavorite = useCallback((fileId: string) => {
    setMediaFiles(prev => {
      return prev.map(file => {
        if (file.id === fileId) {
          return { ...file, isFavorite: !file.isFavorite };
        }
        return file;
      });
    });
  }, []);

  // 处理文件上传
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    for (const file of files) {
      try {
        // 模拟AI分析
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newFile: MediaFile = {
          id: Date.now().toString() + Math.random(),
          type: file.type.startsWith('video/') ? 'video' : 'photo',
          url: URL.createObjectURL(file),
          thumbnail: URL.createObjectURL(file), // 在实际应用中需要生成缩略图
          filename: file.name,
          size: file.size,
          dimensions: { width: 1920, height: 1080 }, // 模拟尺寸
          date: new Date().toISOString().split('T')[0],
          age: calculateAge(new Date(), new Date('2024-12-27')),
          people: autoTagging ? ['小语'] : [],
          tags: autoTagging ? generateSmartTags(file.name) : [],
          emotions: [],
          description: '',
          isFavorite: false,
          aiAnalysis: autoTagging ? {
            objects: ['婴儿', '玩具'],
            scene: '家庭环境',
            quality: 'high',
            colorScheme: ['白色', '粉色'],
            相似度: Math.random() * 0.3 + 0.7
          } : undefined,
          metadata: {
            fileSize: formatFileSize(file.size),
            format: file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN'
          }
        };

        setMediaFiles(prev => [newFile, ...prev]);
      } catch (error) {
        console.error('文件上传失败:', error);
      }
    }

    setIsProcessing(false);
    // 清空文件输入
    event.target.value = '';
  }, [autoTagging]);

  // 批量删除文件
  const deleteSelectedFiles = useCallback(() => {
    if (selectedFiles.size === 0) return;
    
    setMediaFiles(prev => {
      return prev.filter(file => !selectedFiles.has(file.id));
    });
    
    setSelectedFiles(new Set());
  }, [selectedFiles]);

  // 批量添加/移除收藏
  const toggleSelectedFavorites = useCallback((isFavorite: boolean) => {
    if (selectedFiles.size === 0) return;
    
    setMediaFiles(prev => {
      return prev.map(file => {
        if (selectedFiles.has(file.id)) {
          return { ...file, isFavorite };
        }
        return file;
      });
    });
  }, [selectedFiles]);

  // 选择所有文件
  const selectAllFiles = useCallback(() => {
    if (selectedFiles.size === filteredFiles.length) {
      // 如果已经全选，则取消全选
      setSelectedFiles(new Set());
    } else {
      // 全选过滤后的文件
      const allFileIds = filteredFiles.map(file => file.id);
      setSelectedFiles(new Set(allFileIds));
    }
  }, [selectedFiles.size, filteredFiles]);

  return {
    // 状态
    mediaFiles,
    filteredFiles,
    selectedFiles,
    searchQuery,
    selectedTags,
    dateRange,
    sortBy,
    isProcessing,
    autoTagging,
    allTags,
    filterParams,
    
    // 方法
    setSearchQuery,
    setSelectedTags,
    setDateRange,
    setSortBy,
    setAutoTagging,
    toggleFileSelection,
    toggleFavorite,
    handleFileUpload,
    deleteSelectedFiles,
    toggleSelectedFavorites,
    selectAllFiles
  };
};
