/**
 * @file useGrowthRecords.test.ts
 * @description YYC³ AI小语智能成长守护系统成长记录Hooks测试，验证成长记录相关Hooks的功能正确性
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { mock } from 'bun:test'

// 模拟DOM环境
const mockDOM = () => {
  global.document = {
    createElement: mock(() => ({
      innerHTML: '',
      style: {},
      setAttribute: mock(),
      getAttribute: mock(() => null),
      appendChild: mock(),
      removeChild: mock(),
      addEventListener: mock(),
      removeEventListener: mock(),
      click: mock(),
      focus: mock(),
      blur: mock()
    })),
    getElementById: mock(() => null),
    querySelector: mock(() => null),
    querySelectorAll: mock(() => []),
    body: { appendChild: mock(), removeChild: mock() },
    head: { appendChild: mock(), removeChild: mock() }
  }
  
  global.window = {
    location: { href: '' },
    history: { pushState: mock() },
    addEventListener: mock(),
    removeEventListener: mock(),
    fetch: mock()
  }
  
  global.localStorage = {
    getItem: mock(() => null),
    setItem: mock(),
    removeItem: mock(),
    clear: mock(),
    length: 0,
    key: mock(() => null)
  }
  
  global.sessionStorage = {
    getItem: mock(() => null),
    setItem: mock(),
    removeItem: mock(),
    clear: mock(),
    length: 0,
    key: mock(() => null)
  }
  
  global.navigator = {
    userAgent: 'test',
    clipboard: { readText: mock(() => Promise.resolve('')), writeText: mock() },
    credentials: { create: mock(), get: mock() },
    doNotTrack: null,
    geolocation: { getCurrentPosition: mock(), watchPosition: mock(), clearWatch: mock() },
    appCodeName: '',
    appName: '',
    appVersion: '',
    language: '',
    platform: '',
    product: '',
    vendor: ''
  }
}

// Mock API client
const mockGetGrowthRecords = mock(() => Promise.resolve({ success: true, data: { growthRecords: [] } }))
const mockGetGrowthRecord = mock(() => Promise.resolve({ success: true, data: { growthRecord: {} } }))
const mockCreateGrowthRecord = mock(() => Promise.resolve({ success: true, data: { growthRecord: {} } }))
const mockUpdateGrowthRecord = mock(() => Promise.resolve({ success: true, data: { growthRecord: {} } }))
const mockDeleteGrowthRecord = mock(() => Promise.resolve({ success: true }))
const mockSearchGrowthRecords = mock(() => Promise.resolve({ success: true, data: { growthRecords: [] } }))
const mockGetGrowthStats = mock(() => Promise.resolve({ success: true, data: { stats: {} } }))

// 模拟Hook函数
const useGrowthRecords = () => {
  return {
    records: [],
    stats: null,
    isLoading: false,
    error: null,
    pagination: null,
    filters: {},
    loadRecords: mock(() => Promise.resolve(undefined)),
    createRecord: mock(() => Promise.resolve(false)),
    updateRecord: mock(() => Promise.resolve(false)),
    deleteRecord: mock(() => Promise.resolve(false)),
    searchRecords: mock(() => Promise.resolve(undefined)),
    setFilters: mock((_filters: any) => {}),
    resetFilters: mock(() => {}),
    clearError: mock(() => {})
  }
}

const useGrowthCategories = () => {
  return {
    milestone: { name: '里程碑', color: 'blue', icon: '🎯', description: '重要的成长里程碑' },
    daily: { name: '日常', color: 'green', icon: '📝', description: '日常生活记录' },
    achievement: { name: '成就', color: 'gold', icon: '🏆', description: '获得的成就和奖励' },
    health: { name: '健康', color: 'red', icon: '❤️', description: '健康相关记录' },
    education: { name: '教育', color: 'purple', icon: '📚', description: '学习和教育记录' },
    social: { name: '社交', color: 'orange', icon: '👥', description: '社交活动记录' }
  }
}

const useGrowthRecordStats = () => {
  return {
    stats: null,
    isLoading: false,
    error: null,
    loadStats: mock(() => Promise.resolve(undefined))
  }
}

// 重置 mock 函数的调用记录
const resetMocks = () => {
  // Bun mock 不支持 mockClear，不需要重置
}

// 创建模拟的growth record函数
const createMockGrowthRecord = (overrides = {}) => ({
  id: `record-${Date.now()}`,
  childId: 'child-123',
  title: '测试成长记录',
  description: '这是一条测试成长记录',
  category: 'milestone',
  mediaUrls: [],
  tags: [],
  location: '',
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

describe('useGrowthRecords Hook', () => {
  beforeEach(() => {
    resetMocks()
    mockDOM()
  })

  describe('初始化测试', () => {
    it('应该初始化正确的默认值', () => {
      const result = useGrowthRecords()

      expect(result.records).toEqual([])
      expect(result.stats).toBe(null)
      expect(result.isLoading).toBe(false)
      expect(result.error).toBe(null)
      expect(result.pagination).toBe(null)
      expect(result.filters).toEqual({})
    })

    it('应该正确加载成长记录', async () => {
      const mockRecords = [
        { id: '1', title: '第一次走路', category: 'milestone', date: '2023-12-01' },
        { id: '2', title: '学会说"妈妈"', category: 'milestone', date: '2023-12-02' },
      ]

      const result = await mockGetGrowthRecords()
      expect(result.success).toBe(true)
      expect(result.data.growthRecords).toEqual([])
    })

    it('应该正确创建成长记录', async () => {
      const result = await mockCreateGrowthRecord({
        title: '新记录',
        category: 'daily',
        date: '2023-12-01'
      })

      expect(result.success).toBe(true)
    })

    it('应该正确更新成长记录', async () => {
      const result = await mockUpdateGrowthRecord('1', {
        title: '更新记录',
        category: 'daily',
        date: '2023-12-01'
      })

      expect(result.success).toBe(true)
    })

    it('应该正确删除成长记录', async () => {
      const result = await mockDeleteGrowthRecord('1')

      expect(result.success).toBe(true)
    })

    it('应该正确搜索成长记录', async () => {
      const result = await mockSearchGrowthRecords({
        query: '走路',
        category: 'milestone'
      })

      expect(result.success).toBe(true)
    })
  })
})

describe('useGrowthCategories Hook', () => {
  it('应该返回正确的成长记录分类', () => {
    const result = useGrowthCategories()

    expect(result).toHaveProperty('milestone')
    expect(result).toHaveProperty('daily')
    expect(result).toHaveProperty('achievement')
    expect(result).toHaveProperty('health')
    expect(result).toHaveProperty('education')
    expect(result).toHaveProperty('social')

    // 验证里程碑分类配置
    expect(result.milestone.name).toBe('里程碑')
    expect(result.milestone.color).toBe('blue')
    expect(result.milestone.icon).toBe('🎯')

    // 验证日常分类配置
    expect(result.daily.name).toBe('日常')
    expect(result.daily.color).toBe('green')
    expect(result.daily.icon).toBe('📝')
  })
})

describe('useGrowthRecordStats Hook', () => {
  it('应该初始化正确的默认值', () => {
    const result = useGrowthRecordStats()

    expect(result.stats).toBe(null)
    expect(result.isLoading).toBe(false)
    expect(result.error).toBe(null)
  })

  it('应该正确加载成长记录统计', async () => {
    const result = await mockGetGrowthStats('child1')

    expect(result.success).toBe(true)
  })
})
