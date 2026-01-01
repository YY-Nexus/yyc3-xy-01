/**
 * @file MediaFilters.tsx
 * @description YYC³ AI小语智能成长守护系统媒体文件过滤器组件，提供搜索、标签过滤和日期范围过滤功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import React from 'react';
import { Search, CalendarDays, Tag } from 'lucide-react';
import { FilterParams, SortBy } from './types';

interface MediaFiltersProps {
  /** 过滤参数 */
  filterParams: FilterParams;
  /** 排序方式 */
  sortBy: SortBy;
  /** 所有可用标签 */
  allTags: string[];
  /** 自动标签生成开关 */
  autoTagging: boolean;
  /** 搜索查询变化回调 */
  onSearchChange: (query: string) => void;
  /** 标签选择变化回调 */
  onTagsChange: (tags: string[]) => void;
  /** 日期范围变化回调 */
  onDateRangeChange: (range: { start: string; end: string }) => void;
  /** 排序方式变化回调 */
  onSortByChange: (sortBy: SortBy) => void;
  /** 自动标签生成开关变化回调 */
  onAutoTaggingChange: (autoTagging: boolean) => void;
}

/**
 * 媒体文件过滤器组件
 * @param props 组件属性
 * @returns JSX元素
 */
export const MediaFilters: React.FC<MediaFiltersProps> = ({
  filterParams,
  sortBy,
  allTags,
  autoTagging,
  onSearchChange,
  onTagsChange,
  onDateRangeChange,
  onSortByChange,
  onAutoTaggingChange
}) => {
  const { searchQuery, selectedTags, dateRange } = filterParams;

  // 处理标签选择
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm mb-6">
      {/* 搜索栏 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="搜索文件名、标签或描述..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
      </div>

      {/* 过滤器和排序 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 标签过滤 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              标签
            </label>
            <button
              onClick={() => onTagsChange([])}
              className="text-xs text-purple-600 hover:underline"
              disabled={selectedTags.length === 0}
            >
              清除
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-200 rounded-lg">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-xs transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* 日期范围过滤 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-600" />
              日期范围
            </label>
            <button
              onClick={() => onDateRangeChange({ start: '', end: '' })}
              className="text-xs text-blue-600 hover:underline"
              disabled={!dateRange.start && !dateRange.end}
            >
              清除
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 排序和设置 */}
        <div className="space-y-3">
          {/* 排序 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as SortBy)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value="date">按日期排序</option>
              <option value="name">按名称排序</option>
              <option value="size">按大小排序</option>
            </select>
          </div>

          {/* 自动标签设置 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">自动标签生成</label>
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoTagging}
                onChange={(e) => onAutoTaggingChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
