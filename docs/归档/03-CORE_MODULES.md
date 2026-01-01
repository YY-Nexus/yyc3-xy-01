# 核心功能模块文档

## 📋 概述

本文档描述YYC³智能插拔式移动AI系统的核心功能模块，包括主要hooks和组件的使用方法和功能说明。

---

## 📊 成长记录管理模块 (useGrowthRecords)

### 功能说明

`useGrowthRecords` 是管理儿童成长记录的核心hook，提供了创建、查询、更新、删除成长记录以及统计分析等功能。

### 类型定义

```typescript
// 成长记录类型
interface GrowthRecord {
  id: string;
  childId: string;
  childName: string;
  title: string;
  description: string;
  category: 'milestone' | 'daily' | 'achievement' | 'health' | 'education' | 'social';
  mediaUrls: string[];
  tags: string[];
  location: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// 成长统计类型
interface GrowthStats {
  period: string;
  startDate: string;
  endDate: string;
  child: {
    id: string;
    name: string;
    birthDate: string;
  };
  summary: {
    totalRecords: number;
    milestoneRecords: number;
    dailyRecords: number;
    achievementRecords: number;
    healthRecords: number;
    educationRecords: number;
    socialRecords: number;
    activeDays: number;
    publicRecords: number;
    averagePerMonth: string;
  };
  monthlyStats: Array<{ month: string; recordsCount: number }>;
  topTags: Array<{ tag: string; usageCount: number }>;
}
```

### 使用方法

```typescript
import useGrowthRecords from '@/hooks/useGrowthRecords';

const { 
  records, 
  stats, 
  isLoading, 
  error, 
  createRecord, 
  updateRecord, 
  deleteRecord, 
  loadRecords, 
  searchRecords 
} = useGrowthRecords(childId);
```

### 主要功能

#### 1. 加载成长记录
```typescript
// 加载指定儿童的成长记录
await loadRecords(childId, {
  page: 1,
  limit: 10,
  category: 'milestone',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

#### 2. 创建成长记录
```typescript
const success = await createRecord({
  childId: 'child123',
  title: '学会走路',
  description: '宝宝今天第一次独立走了5步！',
  category: 'milestone',
  mediaUrls: ['image1.jpg', 'video1.mp4'],
  tags: ['发育', '里程碑'],
  location: '家中',
  isPublic: true
});
```

#### 3. 更新成长记录
```typescript
const success = await updateRecord('record123', {
  title: '学会走路（更新）',
  description: '宝宝今天第一次独立走了10步！',
  isPublic: false
});
```

#### 4. 删除成长记录
```typescript
const success = await deleteRecord('record123');
```

#### 5. 搜索成长记录
```typescript
await searchRecords(childId, '学会说话', {
  page: 1,
  limit: 10,
  category: 'milestone'
});
```

#### 6. 加载统计数据
```typescript
// 加载过去12个月的统计数据
await loadStats(childId, '12m');
```

### 返回值说明

| 属性名 | 类型 | 描述 |
|--------|------|------|
| records | GrowthRecord[] | 成长记录列表 |
| stats | GrowthStats \| null | 成长统计数据 |
| isLoading | boolean | 是否正在加载 |
| error | string \| null | 错误信息 |
| pagination | Pagination \| null | 分页信息 |
| filters | Filters | 当前筛选条件 |
| createRecord | Function | 创建记录方法 |
| updateRecord | Function | 更新记录方法 |
| deleteRecord | Function | 删除记录方法 |
| loadRecords | Function | 加载记录方法 |
| loadRecord | Function | 加载单个记录方法 |
| searchRecords | Function | 搜索记录方法 |
| loadStats | Function | 加载统计方法 |
| setFilters | Function | 设置筛选条件 |
| clearError | Function | 清除错误 |
| resetFilters | Function | 重置筛选条件 |

### 成长记录分类

| 分类 | 名称 | 颜色 | 图标 |
|------|------|------|------|
| milestone | 里程碑 | blue | 🎯 |
| daily | 日常生活 | green | 📅 |
| achievement | 成就 | gold | 🏆 |
| health | 健康 | red | ❤️ |
| education | 教育 | purple | 📚 |
| social | 社交 | orange | 👥 |

---

## ♿️ 无障碍功能模块 (useAccessibility)

### 功能说明

`useAccessibility` 是管理无障碍功能的核心hook，提供了高对比度、减少动画、屏幕阅读器支持等无障碍功能。

### 使用方法

```typescript
import useAccessibility from '@/hooks/useAccessibility';

const {
  isHighContrast,
  isReducedMotion,
  isScreenReaderActive,
  toggleHighContrast,
  toggleReducedMotion,
  announceToScreenReader
} = useAccessibility();
```

### 主要功能

#### 1. 高对比度模式
```typescript
// 切换高对比度模式
toggleHighContrast();

// 检查是否开启高对比度
if (isHighContrast) {
  // 应用高对比度样式
}
```

#### 2. 减少动画模式
```typescript
// 切换减少动画模式
toggleReducedMotion();

// 检查是否开启减少动画
if (isReducedMotion) {
  // 应用减少动画样式
}
```

#### 3. 屏幕阅读器支持
```typescript
// 向屏幕阅读器发送通知
announceToScreenReader('操作成功！');
```

### 返回值说明

| 属性名 | 类型 | 描述 |
|--------|------|------|
| isHighContrast | boolean | 是否开启高对比度模式 |
| isReducedMotion | boolean | 是否开启减少动画模式 |
| isScreenReaderActive | boolean | 屏幕阅读器是否活跃 |
| toggleHighContrast | Function | 切换高对比度模式 |
| toggleReducedMotion | Function | 切换减少动画模式 |
| announceToScreenReader | Function | 向屏幕阅读器发送通知 |

---

## 👶 儿童管理模块 (useChildren)

### 功能说明

`useChildren` 是管理儿童信息的核心hook，提供了儿童信息的增删改查功能。

### 使用方法

```typescript
import useChildren from '@/hooks/useChildren';

const {
  children,
  currentChild,
  isLoading,
  error,
  addChild,
  updateChild,
  deleteChild,
  selectChild
} = useChildren();
```

### 主要功能

#### 1. 添加儿童
```typescript
const success = await addChild({
  name: '小明',
  birthDate: '2018-05-15',
  gender: 'male',
  avatar: 'avatar.jpg'
});
```

#### 2. 更新儿童信息
```typescript
const success = await updateChild('child123', {
  name: '小明',
  avatar: 'new-avatar.jpg'
});
```

#### 3. 删除儿童
```typescript
const success = await deleteChild('child123');
```

#### 4. 选择当前儿童
```typescript
selectChild('child123');
```

### 返回值说明

| 属性名 | 类型 | 描述 |
|--------|------|------|
| children | Child[] | 儿童列表 |
| currentChild | Child \| null | 当前选中的儿童 |
| isLoading | boolean | 是否正在加载 |
| error | string \| null | 错误信息 |
| addChild | Function | 添加儿童方法 |
| updateChild | Function | 更新儿童方法 |
| deleteChild | Function | 删除儿童方法 |
| selectChild | Function | 选择当前儿童方法 |

---

## 🤖 AI助手模块 (useAIXiaoyu)

### 功能说明

`useAIXiaoyu` 是管理智能AI助手小语的核心hook，提供了AI对话、问题解答、学习辅导等功能。

### 使用方法

```typescript
import useAIXiaoyu from '@/hooks/useAIXiaoyu';

const {
  messages,
  isLoading,
  error,
  sendMessage,
  clearMessages
} = useAIXiaoyu();
```

### 主要功能

#### 1. 发送消息
```typescript
const response = await sendMessage({
  content: '1+1等于几？',
  childId: 'child123'
});
```

#### 2. 清除消息
```typescript
clearMessages();
```

### 返回值说明

| 属性名 | 类型 | 描述 |
|--------|------|------|
| messages | Message[] | 对话消息列表 |
| isLoading | boolean | 是否正在加载 |
| error | string \| null | 错误信息 |
| sendMessage | Function | 发送消息方法 |
| clearMessages | Function | 清除消息方法 |

---

## 📚 课程学习模块 (useCurriculum)

### 功能说明

`useCurriculum` 是管理课程学习的核心hook，提供了课程列表、学习进度、课程详情等功能。

### 使用方法

```typescript
import useCurriculum from '@/hooks/useCurriculum';

const {
  courses,
  currentCourse,
  learningProgress,
  isLoading,
  error,
  loadCourses,
  loadCourseDetail,
  updateProgress
} = useCurriculum();
```

### 主要功能

#### 1. 加载课程列表
```typescript
await loadCourses({
  category: 'math',
  difficulty: 'beginner'
});
```

#### 2. 加载课程详情
```typescript
await loadCourseDetail('course123');
```

#### 3. 更新学习进度
```typescript
await updateProgress('course123', {
  lessonId: 'lesson456',
  progress: 80,
  completed: false
});
```

### 返回值说明

| 属性名 | 类型 | 描述 |
|--------|------|------|
| courses | Course[] | 课程列表 |
| currentCourse | Course \| null | 当前课程详情 |
| learningProgress | Progress[] | 学习进度 |
| isLoading | boolean | 是否正在加载 |
| error | string \| null | 错误信息 |
| loadCourses | Function | 加载课程列表方法 |
| loadCourseDetail | Function | 加载课程详情方法 |
| updateProgress | Function | 更新学习进度方法 |

---

## 📊 情绪分析模块 (useEmotionAnalysis)

### 功能说明

`useEmotionAnalysis` 是管理情绪分析的核心hook，提供了情绪识别、情绪趋势分析等功能。

### 使用方法

```typescript
import useEmotionAnalysis from '@/hooks/useEmotionAnalysis';

const {
  emotionHistory,
  currentEmotion,
  emotionTrend,
  isLoading,
  error,
  analyzeEmotion,
  loadEmotionHistory
} = useEmotionAnalysis();
```

### 主要功能

#### 1. 分析情绪
```typescript
const result = await analyzeEmotion({
  text: '我今天很开心！',
  imageUrl: 'face.jpg'
});
```

#### 2. 加载情绪历史
```typescript
await loadEmotionHistory(childId, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});
```

### 返回值说明

| 属性名 | 类型 | 描述 |
|--------|------|------|
| emotionHistory | EmotionRecord[] | 情绪历史记录 |
| currentEmotion | Emotion \| null | 当前情绪 |
| emotionTrend | EmotionTrend[] | 情绪趋势 |
| isLoading | boolean | 是否正在加载 |
| error | string \| null | 错误信息 |
| analyzeEmotion | Function | 分析情绪方法 |
| loadEmotionHistory | Function | 加载情绪历史方法 |

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>

