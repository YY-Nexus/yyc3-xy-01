/**
 * @file 智能相册工具函数
 * @description 提供智能相册模块的各种工具函数
 * @module components/growth/enhanced/smart-photo-album/utils
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-30
 */

// 导入类型定义
import { MediaFile, FilterParams, SortBy, SmartTagSuggestions } from './types';

/**
 * 智能标签建议
 */
export const smartTagSuggestions: SmartTagSuggestions = {
  活动: ['生日', '派对', '旅行', '节日', '聚会', '运动', '游戏', '野餐', '参观', '演出'],
  发展: ['爬行', '走路', '说话', '阅读', '绘画', '写字', '唱歌', '跳舞', '手工', '学习'],
  场景: ['家庭', '公园', '学校', '医院', '动物园', '博物馆', '海滩', '山区', '商场', '餐厅'],
  人物: ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '兄弟姐妹', '朋友', '老师', '同学'],
  情绪: ['快乐', '悲伤', '惊讶', '愤怒', '害怕', '平静', '兴奋', '困惑', '害羞', '满足'],
  其他: ['日常', '生活', '成长', '第一次', '纪念', '节日', '庆祝', '成就', '爱好', '休息']
};

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @returns 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 计算年龄
 * @param current 当前日期
 * @param birth 出生日期
 * @returns 格式化后的年龄字符串
 */
export const calculateAge = (current: Date, birth: Date): string => {
  const diffTime = Math.abs(current.getTime() - birth.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays}天`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return `${months}个月${remainingDays > 0 ? remainingDays + '天' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years}岁${months > 0 ? months + '个月' : ''}`;
  }
};

/**
 * 生成智能标签
 * @param filename 文件名
 * @returns 智能标签数组
 */
export const generateSmartTags = (filename: string): string[] => {
  const tags: string[] = [];
  const lowerFilename = filename.toLowerCase();

  // 基于文件名的智能识别
  Object.entries(smartTagSuggestions).forEach(([category, suggestions]) => {
    suggestions.forEach(suggestion => {
      if (lowerFilename.includes(suggestion.toLowerCase())) {
        tags.push(suggestion);
      }
    });
  });

  // 默认标签
  if (tags.length === 0) {
    tags.push('日常', '生活');
  }

  return tags;
};

/**
 * 过滤媒体文件
 * @param files 媒体文件数组
 * @param params 过滤参数
 * @param sortBy 排序方式
 * @returns 过滤和排序后的媒体文件数组
 */
export const filterAndSortMediaFiles = (
  files: MediaFile[],
  params: FilterParams,
  sortBy: SortBy
): MediaFile[] => {
  const { searchQuery, selectedTags, dateRange } = params;
  
  let filtered = files.filter(file => {
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
};


