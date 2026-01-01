/**
 * @file setup.ts
 * @description 测试环境设置，全局测试配置和DOM环境初始化，确保所有测试在一致的DOM环境中运行
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { beforeAll, afterEach, afterAll, mock } from 'bun:test'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { JSDOM } from 'jsdom'

// 扩展全局类型
declare global {
  var localStorageData: Record<string, string>
  var sessionStorageData: Record<string, string>
  var localStorage: Storage
  var sessionStorage: Storage
  var alert: (message?: string) => void
  var confirm: (message?: string) => boolean
  var prompt: (message?: string, defaultValue?: string) => string
}

// 导入测试环境配置
import './test-env'

// 模拟localStorage
const localStorageMock = {
  getItem: (key: string) => {
    const value = global.localStorageData?.[key]
    return value || null
  },
  setItem: (key: string, value: string) => {
    if (!global.localStorageData) {
      global.localStorageData = {}
    }
    global.localStorageData[key] = value
  },
  removeItem: (key: string) => {
    if (global.localStorageData) {
      delete global.localStorageData[key]
    }
  },
  clear: () => {
    global.localStorageData = {}
  },
  length: 0,
  key: (index: number) => {
    const keys = Object.keys(global.localStorageData || {})
    return keys[index] || null
  }
}

// 模拟sessionStorage
const sessionStorageMock = {
  getItem: (key: string) => {
    const value = global.sessionStorageData?.[key]
    return value || null
  },
  setItem: (key: string, value: string) => {
    if (!global.sessionStorageData) {
      global.sessionStorageData = {}
    }
    global.sessionStorageData[key] = value
  },
  removeItem: (key: string) => {
    if (global.sessionStorageData) {
      delete global.sessionStorageData[key]
    }
  },
  clear: () => {
    global.sessionStorageData = {}
  },
  length: 0,
  key: (index: number) => {
    const keys = Object.keys(global.sessionStorageData || {})
    return keys[index] || null
  }
}

// 设置全局环境
beforeAll(() => {
  // 设置测试环境变量
  // @ts-ignore - TypeScript在测试环境中允许修改NODE_ENV
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32-chars'
  process.env.DB_HOST = 'localhost'
  process.env.DB_PORT = '5432'
  process.env.DB_NAME = 'yyc3_test'
  process.env.DB_USER = 'test_user'
  process.env.DB_PASSWORD = 'test_password'
  
  // 创建完整的虚拟DOM环境
  const dom = new JSDOM(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Test</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <div id="root"></div>
        <div id="modal-root"></div>
      </body>
    </html>`,
    {
      url: 'http://localhost:3000',
      pretendToBeVisual: true,
      resources: 'usable',
      runScripts: 'dangerously'
    }
  )

  // 设置全局变量 - 确保所有必要的DOM对象都可用
  const { window } = dom
  
  // 基础全局对象
  global.window = window as any
  global.document = window.document
  global.navigator = window.navigator
  global.location = window.location
  global.history = window.history
  
  // DOM构造函数
  global.HTMLElement = window.HTMLElement
  global.Element = window.Element
  global.Node = window.Node
  global.NodeList = window.NodeList
  global.HTMLCollection = window.HTMLCollection
  global.Document = window.Document
  global.Window = window.Window
  
  // Web API
  global.URL = window.URL
  global.URLSearchParams = window.URLSearchParams
  global.Blob = window.Blob
  global.FileReader = window.FileReader
  global.FormData = window.FormData
  global.Storage = window.Storage
  
  // 事件系统
  global.Event = window.Event
  global.EventTarget = window.EventTarget
  global.MouseEvent = window.MouseEvent
  global.KeyboardEvent = window.KeyboardEvent
  global.TouchEvent = window.TouchEvent
  global.FocusEvent = window.FocusEvent
  global.InputEvent = window.InputEvent
  global.CustomEvent = window.CustomEvent
  
  // 确保document.body正确设置
  Object.defineProperty(global.document, 'body', {
    get: () => global.document.createElement('body'),
    configurable: true
  })
  
  // 初始化存储数据
  global.localStorageData = {}
  global.sessionStorageData = {}
  
  // 设置存储模拟
  global.localStorage = localStorageMock
  global.sessionStorage = sessionStorageMock
  
  // 模拟window对象的一些方法
  global.alert = mock((_message?: string) => {}) as any
  global.confirm = mock((_message?: string) => true) as any
  global.prompt = mock((_message?: string, _defaultValue?: string) => 'test input') as any
  
  // 模拟matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mock((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: mock(() => {}), // deprecated
      removeListener: mock(() => {}), // deprecated
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      dispatchEvent: mock(() => {}),
    })),
  })
  
  // 模拟ResizeObserver
  global.ResizeObserver = mock((_callback: any) => ({
    observe: mock(() => {}),
    unobserve: mock(() => {}),
    disconnect: mock(() => {}),
  })) as any
  
  // 模拟IntersectionObserver
  global.IntersectionObserver = mock((_callback: any, _options?: any) => ({
    observe: mock(() => {}),
    unobserve: mock(() => {}),
    disconnect: mock(() => {}),
  })) as any
  
  // 模拟scrollIntoView
  global.HTMLElement.prototype.scrollIntoView = mock(() => {})
  
  // 模拟getBoundingClientRect
  global.HTMLElement.prototype.getBoundingClientRect = mock(() => ({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: mock(() => ({}))
  }))
})

// 模拟fetch API
global.fetch = async (_input: RequestInfo | URL, _init?: RequestInit) => {
  // 模拟API响应
  const url = typeof _input === 'string' ? _input : _input.toString()
  
  if (url.includes('/api/user-profile')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: 'profile-001',
        user_id: 'user-001',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '2000-01-01',
        gender: 'male',
        school: 'Test School',
        grade: '5',
        interests: ['reading', 'sports'],
        introduction: 'Test introduction'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  if (url.includes('/api/learning-stats')) {
    return new Response(JSON.stringify({
      success: true,
      data: {
        totalSessions: 50,
        totalTime: 3000,
        averageScore: 85,
        completedLessons: 25,
        streakDays: 7
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  // 默认响应
  return new Response(JSON.stringify({
    success: false,
    message: 'Not found'
  }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
}

// 清理DOM
afterEach(() => {
  cleanup()
})

// 清理全局状态
afterAll(() => {
  global.localStorageData = {}
  global.sessionStorageData = {}
})