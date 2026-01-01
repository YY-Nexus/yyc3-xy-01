/**
 * @file simple.test.setup.ts
 * @description YYC³ AI小语智能成长守护系统简化测试运行脚本，提供JSDOM环境和必要的全局变量
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 设置测试环境
import { beforeEach, afterEach } from 'bun/test'
import { cleanup, render, fireEvent, waitFor, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { JSDOM } from 'jsdom'
import React, { ReactNode } from 'react'

// 扩展全局类型
declare global {
  var createMockUser: (overrides?: any) => any
  var createMockChild: (overrides?: any) => any
  var createMockAIMessage: (overrides?: any) => any
  var createMockGrowthRecord: (overrides?: any) => any
  var __NEXT_ROUTER__: any
  var __NEXT_NAVIGATION__: any
  var __NEXT_APP_ROUTER_CONTEXT__: any
}

// 设置 jsdom 环境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
  resources: 'usable',
})

// 将 jsdom 的全局对象设置为全局
global.window = dom.window as any
global.document = dom.window.document
global.navigator = dom.window.navigator
global.HTMLElement = dom.window.HTMLElement
global.Element = dom.window.Element
global.Node = dom.window.Node
global.NodeList = dom.window.NodeList
global.HTMLCollection = dom.window.HTMLCollection

// Mock fetch API
global.fetch = (() => {
  const mockFn = () => Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: 'http://localhost:3000',
    clone: () => mockFn() as any,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
  }) as any
  mockFn.mockReset = () => {}
  mockFn.mockImplementation = () => {}
  mockFn.mockResolvedValue = () => {}
  mockFn.mockRejectedValue = () => {}
  return mockFn
})()

// Mock localStorage
const localStorageMock = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
  clear: () => {},
  length: 0,
  key: (_index: number) => null,
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {},
  removeItem: (_key: string) => {},
  clear: () => {},
  length: 0,
  key: (_index: number) => null,
}
global.sessionStorage = sessionStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (_query: string) => ({
    matches: false,
    media: _query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any

// 简单的测试包装器，只提供基本的React上下文
const SimpleTestWrapper = ({ children }: { children: ReactNode }) => {
  return React.createElement('div', { 'data-testid': 'test-wrapper' }, children)
}

// 自定义渲染函数，使用简单包装器
const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: SimpleTestWrapper, ...options })
}

// Mock Next.js router - 简化版本
const nextRouterMock = {
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: () => {},
      pop: () => {},
      reload: () => {},
      back: () => {},
      prefetch: () => {},
      beforePopState: () => {},
      events: {
        on: () => {},
        off: () => {},
        emit: () => {},
      },
    }
  },
}
;(global as any).__NEXT_ROUTER__ = nextRouterMock

// Mock Next.js navigation - 简化版本
const nextNavigationMock = {
  useRouter() {
    return {
      push: () => {},
      replace: () => {},
      refresh: () => {},
      back: () => {},
      forward: () => {},
      prefetch: () => {},
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}
;(global as any).__NEXT_NAVIGATION__ = nextNavigationMock

// Mock Next.js app router context
const nextAppRouterContextMock = {
  AppRouterContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  LayoutRouterContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  TemplateContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  GlobalLayoutRouterContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  CacheRoutesContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  PathnameContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
  ParamsContext: {
    Provider: ({ children }: { children: ReactNode }) => children,
  },
}
;(global as any).__NEXT_APP_ROUTER_CONTEXT__ = nextAppRouterContextMock

// Global test utilities
global.createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'parent',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

global.createMockChild = (overrides = {}) => ({
  id: 'child-123',
  name: 'Test Child',
  birthDate: '2020-01-01',
  gender: 'male',
  parentId: 'user-123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

global.createMockAIMessage = (overrides = {}) => ({
  id: 'message-123',
  sessionId: 'session-123',
  userMessage: 'Hello',
  aiResponse: 'Hi there!',
  aiRole: 'listener',
  aiRoleName: '聆听者',
  emotion: 'happy',
  createdAt: new Date().toISOString(),
  ...overrides,
})

global.createMockGrowthRecord = (overrides = {}) => ({
  id: 'record-123',
  childId: 'child-123',
  childName: 'Test Child',
  title: 'First Steps',
  description: 'Took first steps today',
  category: 'milestone',
  mediaUrls: [],
  tags: ['milestone', 'development'],
  location: 'Home',
  isPublic: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

// Reset all mocks before each test
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Export testing utilities
export { render, screen, fireEvent, waitFor } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
export { customRender }