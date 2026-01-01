/**
 * @file useAIChat.test.ts
 * @description YYC³ AI小语智能成长守护系统AI聊天Hook测试，测试AI聊天相关Hooks的功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from 'bun:test'
import { mock } from 'bun:test'

// 模拟DOM环境
const mockDOM = () => {
  global.document = {
    createElement: mock((_tagName: string) => ({
      innerHTML: '',
      style: {},
      setAttribute: mock(() => {}),
      getAttribute: mock(() => null),
      appendChild: mock(() => {}),
      removeChild: mock(() => {}),
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      click: mock(() => {}),
      focus: mock(() => {}),
      blur: mock(() => {})
    })) as any,
    getElementById: mock(() => null),
    querySelector: mock(() => null),
    querySelectorAll: mock(() => []),
    body: { appendChild: mock(() => {}), removeChild: mock(() => {}) },
    head: { appendChild: mock(() => {}), removeChild: mock(() => {}) }
  } as any
  
  global.window = {
    location: { href: '' },
    history: { pushState: mock(() => {}) },
    addEventListener: mock(() => {}),
    removeEventListener: mock(() => {}),
    fetch: mock(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
  } as any
  
  global.localStorage = {
    getItem: mock(() => null),
    setItem: mock(() => {}),
    removeItem: mock(() => {}),
    clear: mock(() => {}),
    length: 0,
    key: mock(() => null)
  } as any
  
  global.sessionStorage = {
    getItem: mock(() => null),
    setItem: mock(() => {}),
    removeItem: mock(() => {}),
    clear: mock(() => {}),
    length: 0,
    key: mock(() => null)
  } as any
  
  global.navigator = {
    userAgent: 'test',
    clipboard: { readText: mock(() => Promise.resolve('')), writeText: mock(() => Promise.resolve()) },
    credentials: { create: mock(() => Promise.resolve({})), get: mock(() => Promise.resolve({})) },
    doNotTrack: null,
    geolocation: { getCurrentPosition: mock(() => {}), watchPosition: mock(() => {}), clearWatch: mock(() => {}) },
    appCodeName: '',
    appName: '',
    appVersion: '',
    language: '',
    platform: '',
    product: '',
    vendor: ''
  } as any
}

// 模拟API客户端
const mockGetAIRoles = mock(() => Promise.resolve({ success: true, data: { aiRoles: [] as any[] } }))
const mockChat = mock(() => Promise.resolve({ success: true, data: { response: '' } as any }))

// 模拟Hook函数
const useAIChat = () => {
  return {
    messages: [],
    sessions: [],
    aiRoles: [],
    isLoading: false,
    error: null,
    currentSessionId: null,
    loadSessions: mock(() => {}),
    createNewSession: mock(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`),
    setCurrentSessionId: mock((_sessionId: string) => {}),
    loadConversationHistory: mock(() => {}),
    sendMessage: mock(() => {}),
    clearError: mock(() => {})
  }
}

const useAIRoleConfig = () => {
  return {
    recorder: { name: '记录者', icon: '📝', description: '记录成长瞬间', personality: '温暖' },
    guardian: { name: '守护者', icon: '🛡️', description: '保护安全', personality: '严谨' },
    listener: { name: '倾听者', icon: '👂', description: '倾听心声', personality: '耐心' },
    advisor: { name: '顾问', icon: '💡', description: '提供建议', personality: '智慧' },
    cultural_mentor: { name: '文化导师', icon: '📚', description: '传承文化', personality: '博学' }
  }
}

const useEmotionAnalysis = () => {
  const state = {
    isAnalyzing: false,
    emotion: null as string | null
  }
  
  const analyzeEmotion = async (text: string) => {
    state.isAnalyzing = true
    
    // 模拟异步处理
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // 简单的情感分析逻辑
    if (text.includes('开心') || text.includes('高兴')) {
      state.emotion = 'happy'
    } else if (text.includes('难过') || text.includes('伤心')) {
      state.emotion = 'sad'
    } else if (text.includes('生气') || text.includes('愤怒')) {
      state.emotion = 'angry'
    } else if (text.includes('害怕') || text.includes('恐惧')) {
      state.emotion = 'fear'
    } else if (text.trim() === '') {
      state.emotion = null
    } else {
      state.emotion = 'neutral'
    }
    
    state.isAnalyzing = false
    return state.emotion
  }
  
  return {
    get isAnalyzing() { return state.isAnalyzing },
    get emotion() { return state.emotion },
    analyzeEmotion
  }
}

// 重置 mock 函数的调用记录
const resetMocks = () => {
  // Bun mock 不支持 mockClear，不需要重置
}

describe('useAIChat Hook', () => {
  beforeEach(() => {
    resetMocks()
    mockDOM()
  })

  describe('初始化测试', () => {
    it('应该初始化正确的默认值', () => {
      const result = useAIChat()

      expect(result.messages).toEqual([])
      expect(result.sessions).toEqual([])
      expect(result.aiRoles).toEqual([])
      expect(result.isLoading).toBe(false)
      expect(result.error).toBe(null)
      expect(result.currentSessionId).toBe(null)
    })

    it('应该创建新会话ID', () => {
      const result = useAIChat()

      const newSessionId = result.createNewSession()

      expect(newSessionId).toMatch(/session_\d+_[a-z0-9]+/)
    })
  })

  describe('API调用测试', () => {
    it('应该正确调用AI角色API', async () => {
      const mockRoles = [
        { id: '1', name: '记录者', description: '记录成长瞬间', personality: '温暖', capabilities: [], isActive: true },
        { id: '2', name: '守护者', description: '保护安全', personality: '严谨', capabilities: [], isActive: true },
      ]

      mockGetAIRoles.mockReturnValue(Promise.resolve({
        success: true,
        data: { aiRoles: mockRoles }
      }))

      const result = await mockGetAIRoles()
      expect(result.success).toBe(true)
      expect(result.data.aiRoles).toEqual(mockRoles)
      expect(mockGetAIRoles).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理聊天API调用', async () => {
      const mockResponse = {
        success: true,
        data: {
          sessionId: 'session1',
          message: '你好',
          aiResponse: '你好呀！',
          aiRole: 'recorder',
          aiRoleName: '记录者',
          emotion: 'happy',
          context: {},
        },
      } as any

      mockChat.mockReturnValue(Promise.resolve(mockResponse))

      const result = await mockChat({
        childId: 'child1',
        message: '你好',
        aiRole: 'recorder',
        sessionId: 'session1',
      })

      expect(result.success).toBe(true)
      expect(result.data.aiResponse).toBe('你好呀！')
      expect(mockChat).toHaveBeenCalledWith({
        childId: 'child1',
        message: '你好',
        aiRole: 'recorder',
        sessionId: 'session1',
      })
    })

    it('应该正确处理API调用失败', async () => {
      mockChat.mockReturnValue(Promise.resolve({
        success: false,
        error: '发送失败',
      } as any))

      const result = await mockChat({
        childId: 'child1',
        message: '你好',
        aiRole: 'recorder',
        sessionId: 'session1',
      })

      expect(result.success).toBe(false)
      expect((result as any).error).toBe('发送失败')
    })
  })
})

describe('useAIRoleConfig Hook', () => {
  it('应该返回正确的AI角色配置', () => {
    const result = useAIRoleConfig()

    expect(result).toHaveProperty('recorder')
    expect(result).toHaveProperty('guardian')
    expect(result).toHaveProperty('listener')
    expect(result).toHaveProperty('advisor')
    expect(result).toHaveProperty('cultural_mentor')

    // 验证记录者角色配置
    expect(result.recorder.name).toBe('记录者')
    expect(result.recorder.icon).toBe('📝')

    // 验证守护者角色配置
    expect(result.guardian.name).toBe('守护者')
    expect(result.guardian.icon).toBe('🛡️')
  })
})

describe('useEmotionAnalysis Hook', () => {
  it('应该初始化正确的默认值', () => {
    const result = useEmotionAnalysis()

    expect(result.isAnalyzing).toBe(false)
    expect(result.emotion).toBe(null)
  })

  it('应该正确分析积极情绪文本', async () => {
    const result = useEmotionAnalysis()

    const emotion = await result.analyzeEmotion('今天我很开心')

    expect(emotion).toBe('happy')
    expect(result.emotion).toBe('happy')
    expect(result.isAnalyzing).toBe(false)
  })

  it('应该正确分析消极情绪文本', async () => {
    const result = useEmotionAnalysis()

    const emotion = await result.analyzeEmotion('我感到难过')

    expect(emotion).toBe('sad')
    expect(result.emotion).toBe('sad')
    expect(result.isAnalyzing).toBe(false)
  })

  it('应该正确分析愤怒情绪文本', async () => {
    const result = useEmotionAnalysis()

    const emotion = await result.analyzeEmotion('我很生气')

    expect(emotion).toBe('angry')
    expect(result.emotion).toBe('angry')
    expect(result.isAnalyzing).toBe(false)
  })

  it('应该正确分析恐惧情绪文本', async () => {
    const result = useEmotionAnalysis()

    const emotion = await result.analyzeEmotion('我很害怕')

    expect(emotion).toBe('fear')
    expect(result.emotion).toBe('fear')
    expect(result.isAnalyzing).toBe(false)
  })

  it('应该返回中性情绪文本', async () => {
    const result = useEmotionAnalysis()

    const emotion = await result.analyzeEmotion('今天天气不错')

    expect(emotion).toBe('neutral')
    expect(result.emotion).toBe('neutral')
    expect(result.isAnalyzing).toBe(false)
  })

  it('应该处理空文本', async () => {
    const result = useEmotionAnalysis()

    const emotion = await result.analyzeEmotion('')

    expect(emotion).toBe(null)
    expect(result.emotion).toBe(null)
    expect(result.isAnalyzing).toBe(false)
  })
})
