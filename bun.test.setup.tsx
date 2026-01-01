/**
 * YYC³ AI小语智能成长守护系统 - Bun 测试设置
 */

// 设置测试环境
import { beforeEach, afterEach, describe, it, expect, jest } from 'bun:test'
import { cleanup, render, screen } from '@testing-library/react'
import { JSDOM } from 'jsdom'
import React, { ReactNode } from 'react'

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
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 创建一个测试用的包装器组件，提供Next.js路由上下文
const TestWrapper = ({ children }: { children: ReactNode }) => {
  // 创建一个模拟的AppRouterContext
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }
  
  const mockParams = {}
  const mockPathname = '/'
  
  // 创建模拟的上下文值
  const AppRouterContext = React.createContext({
    push: mockRouter.push,
    replace: mockRouter.replace,
    refresh: mockRouter.refresh,
    back: mockRouter.back,
    forward: mockRouter.forward,
    prefetch: mockRouter.prefetch,
  })
  
  const LayoutRouterContext = React.createContext({
    childNodes: [],
    tree: [],
  })
  
  const TemplateContext = React.createContext({})
  
  const GlobalLayoutRouterContext = React.createContext({
    layoutTree: [],
  })
  
  const CacheRoutesContext = React.createContext({})
  
  const PathnameContext = React.createContext(mockPathname)
  const ParamsContext = React.createContext(mockParams)
  
  return (
    <CacheRoutesContext.Provider value={{}}>
      <GlobalLayoutRouterContext.Provider value={{ layoutTree: [] }}>
        <TemplateContext.Provider value={{}}>
          <LayoutRouterContext.Provider value={{ childNodes: [], tree: [] }}>
            <PathnameContext.Provider value={mockPathname}>
              <ParamsContext.Provider value={mockParams}>
                <AppRouterContext.Provider value={mockRouter}>
                  {children}
                </AppRouterContext.Provider>
              </ParamsContext.Provider>
            </PathnameContext.Provider>
          </LayoutRouterContext.Provider>
        </TemplateContext.Provider>
      </GlobalLayoutRouterContext.Provider>
    </CacheRoutesContext.Provider>
  )
}

// 自定义渲染函数，包含Next.js上下文
const customRender = (ui: React.ReactElement, options = {}) => {
  return render(ui, { wrapper: TestWrapper, ...options })
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      refresh: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

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
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
  (global.fetch as jest.Mock).mockReset()
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Export testing utilities
export { render, screen, fireEvent, waitFor } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
export { customRender }