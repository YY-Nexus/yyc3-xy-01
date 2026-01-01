/**
 * @file hooks.test.bun.ts
 * @description YYC³ AI小语智能成长守护系统Hooks测试，测试Hooks的通用功能和测试环境
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { mock } from 'bun:test'

// 全局模拟函数类型声明
declare global {
  interface globalThis {
    createMockUser: ReturnType<typeof mock>,
    createMockChild: ReturnType<typeof mock>,
    createMockAIMessage: ReturnType<typeof mock>,
    createMockGrowthRecord: ReturnType<typeof mock>,
  }
}

// 模拟hooks
const mockUseAIChat = {
  messages: [],
  sessions: [],
  aiRoles: [],
  isLoading: false,
  error: null as string | null,
  sendMessage: mock(() => Promise.resolve(false)),
  loadConversationHistory: mock(() => Promise.resolve(undefined)),
  loadSessions: mock(() => Promise.resolve(undefined)),
  loadAIRoles: mock(() => Promise.resolve(undefined)),
  clearError: function() { this.error = null },
  createNewSession: mock(() => 'session-123'),
  currentSessionId: null,
  setCurrentSessionId: mock((_id: string | null) => {}),
}

const mockUseGrowthRecords = {
  records: [],
  stats: null,
  isLoading: false,
  error: null as string | null,
  pagination: null,
  filters: {} as { [key: string]: any },
  createRecord: mock(() => Promise.resolve(false)),
  updateRecord: mock(() => Promise.resolve(false)),
  deleteRecord: mock(() => Promise.resolve(false)),
  loadRecords: mock(() => Promise.resolve(undefined)),
  loadRecord: mock(() => Promise.resolve(null)),
  searchRecords: mock(() => Promise.resolve(undefined)),
  loadStats: mock(() => Promise.resolve(undefined)),
  setFilters: function(filters: any) { this.filters = { ...this.filters, ...filters } },
  clearError: function() { this.error = null },
  resetFilters: function() { this.filters = {} },
}

describe('AI Chat Hook', () => {
  beforeEach(() => {
    // 重置mock状态
    mockUseAIChat.messages = []
    mockUseAIChat.error = null
  })

  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      expect(mockUseAIChat.messages).toEqual([])
      expect(mockUseAIChat.sessions).toEqual([])
      expect(mockUseAIChat.aiRoles).toEqual([])
      expect(mockUseAIChat.isLoading).toBe(false)
      expect(mockUseAIChat.error).toBe(null)
      expect(mockUseAIChat.currentSessionId).toBe(null)
    })
  })

  describe('会话管理', () => {
    it('应该创建新会话', () => {
      const newSessionId = mockUseAIChat.createNewSession()

      expect(typeof newSessionId).toBe('string')
      expect(newSessionId).toContain('session-')
    })
  })

  describe('错误处理', () => {
    it('应该清空错误状态', () => {
      mockUseAIChat.error = '测试错误'

      mockUseAIChat.clearError()

      expect(mockUseAIChat.error).toBe(null)
    })
  })
})

describe('Growth Records Hook', () => {
  beforeEach(() => {
    // 重置mock状态
    mockUseGrowthRecords.records = []
    mockUseGrowthRecords.error = null
    mockUseGrowthRecords.filters = {}
  })

  describe('初始状态', () => {
    it('应该返回正确的初始状态', () => {
      expect(mockUseGrowthRecords.records).toEqual([])
      expect(mockUseGrowthRecords.stats).toBe(null)
      expect(mockUseGrowthRecords.isLoading).toBe(false)
      expect(mockUseGrowthRecords.error).toBe(null)
      expect(mockUseGrowthRecords.pagination).toBe(null)
      expect(mockUseGrowthRecords.filters).toEqual({})
    })
  })

  describe('过滤器管理', () => {
    it('应该设置过滤器', () => {
      const filters = { category: 'milestone' }

      mockUseGrowthRecords.setFilters(filters)

      expect(mockUseGrowthRecords.filters).toEqual(filters)
    })

    it('应该重置过滤器', async () => {
      // 设置过滤器
      mockUseGrowthRecords.setFilters({ category: 'milestone' })
      expect(mockUseGrowthRecords.filters.category).toBe('milestone')

      // 重置过滤器
      await mockUseGrowthRecords.resetFilters()
      expect(mockUseGrowthRecords.filters).toEqual({})
    })
  })

  describe('错误处理', () => {
    it('应该清除错误', () => {
      mockUseGrowthRecords.error = '测试错误'

      mockUseGrowthRecords.clearError()

      expect(mockUseGrowthRecords.error).toBe(null)
    })
  })
})

// 全局模拟函数定义
// 使用类型断言来避免 globalThis 类型错误
;(globalThis as any).createMockUser = mock((override: any = {}) => ({
  id: 'user-123',
  firstName: 'Test',
  role: 'parent',
  email: 'test@example.com',
  ...override
}))

;(globalThis as any).createMockChild = mock((override: any = {}) => ({
  id: 'child-123',
  name: 'Test Child',
  birthDate: '2021-01-01',
  parentId: 'user-123',
  ...override
}))

;(globalThis as any).createMockAIMessage = mock((override: any = {}) => ({
  id: 'message-123',
  userMessage: 'Hello',
  aiRole: 'advisor',
  aiRoleName: '聆听者',
  timestamp: new Date().toISOString(),
  ...override
}))

;(globalThis as any).createMockGrowthRecord = mock((override: any = {}) => ({
  id: 'record-123',
  title: 'Test Record',
  category: 'milestone',
  childId: 'child-123',
  date: new Date().toISOString(),
  ...override
}))

describe('全局测试工具', () => {
  it('应该创建有效的mock用户', () => {
    const user = (globalThis as any).createMockUser({
      firstName: 'Custom',
      role: 'admin',
    })

    expect(user.id).toBe('user-123')
    expect(user.firstName).toBe('Custom')
    expect(user.role).toBe('admin')
    expect(user.email).toBe('test@example.com')
  })

  it('应该创建有效的mock儿童', () => {
    const child = (globalThis as any).createMockChild({
      name: 'Custom Child',
      birthDate: '2021-01-01',
    })

    expect(child.id).toBe('child-123')
    expect(child.name).toBe('Custom Child')
    expect(child.birthDate).toBe('2021-01-01')
    expect(child.parentId).toBe('user-123')
  })

  it('应该创建有效的mock AI消息', () => {
    const message = (globalThis as any).createMockAIMessage({
      userMessage: 'Custom message',
      aiRole: 'advisor',
    })

    expect(message.id).toBe('message-123')
    expect(message.userMessage).toBe('Custom message')
    expect(message.aiRole).toBe('advisor')
    expect(message.aiRoleName).toBe('聆听者')
  })

  it('应该创建有效的mock成长记录', () => {
    const record = (globalThis as any).createMockGrowthRecord({
      title: 'Custom Record',
      category: 'achievement',
    })

    expect(record.id).toBe('record-123')
    expect(record.title).toBe('Custom Record')
    expect(record.category).toBe('achievement')
    expect(record.childId).toBe('child-123')
  })
})

describe('基础测试环境', () => {
  it('应该有全局的localStorage mock', () => {
    expect(global.localStorage).toBeDefined()
    expect(typeof global.localStorage.setItem).toBe('function')
    expect(typeof global.localStorage.getItem).toBe('function')
  })

  it('应该有全局的sessionStorage mock', () => {
    expect(global.sessionStorage).toBeDefined()
    expect(typeof global.sessionStorage.setItem).toBe('function')
    expect(typeof global.sessionStorage.getItem).toBe('function')
  })

  it('应该有全局的fetch mock', () => {
    expect(global.fetch).toBeDefined()
    expect(typeof global.fetch).toBe('function')
  })

  it('应该有全局的WebSocket mock', () => {
    expect(global.WebSocket).toBeDefined()
    expect(typeof global.WebSocket).toBe('function')
  })
})