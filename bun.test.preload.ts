/**
 * @fileoverview Bun测试预加载文件 - 设置JSDOM环境
 * @description 在所有测试运行前设置JSDOM环境和必要的全局变量
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @modified 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// 设置测试环境
process.env.NODE_ENV = 'test'

// 导入 testing-library/jest-dom 以提供额外的匹配器
import '@testing-library/jest-dom'

// 导入JSDOM
import { JSDOM } from 'jsdom'

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
global.localStorage = dom.window.localStorage
global.sessionStorage = dom.window.sessionStorage
global.URL = dom.window.URL
global.URLSearchParams = dom.window.URLSearchParams
global.Blob = dom.window.Blob
global.FileReader = dom.window.FileReader
global.FormData = dom.window.FormData
global.MouseEvent = dom.window.MouseEvent
global.KeyboardEvent = dom.window.KeyboardEvent
global.TouchEvent = dom.window.TouchEvent
global.Event = dom.window.Event
global.EventTarget = dom.window.EventTarget

// 设置其他必要的全局对象
global.fetch = require('node-fetch')
global.Request = require('node-fetch').Request
global.Response = require('node-fetch').Response
global.Headers = require('node-fetch').Headers

// Mock AbortController and AbortSignal for JSDOM compatibility
global.AbortController = class AbortController {
  signal = {
    aborted: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }
  
  abort() {
    this.signal.aborted = true
  }
}

global.AbortSignal = class AbortSignal {
  static abort() {
    return {
      aborted: true,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }
  }
  
  aborted = false
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {}
}

// 导入Bun的mock功能
import { mock } from 'bun:test'

// Mock Next.js router
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: () => {},
    replace: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
    refresh: () => {},
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock Next.js app router context
mock.module('next/dist/client/components/app-router-context', () => ({
  AppRouterContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  LayoutRouterContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  TemplateContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  GlobalLayoutRouterContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  CacheRoutesContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  PathnameContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
  ParamsContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}))

// Mock Next.js image
mock.module('next/image', () => ({
  __esModule: true,
  default: (props: any) => ({ type: 'img', props }),
}))

// Mock framer-motion
mock.module('framer-motion', () => import('./__mocks__/framer-motion.ts'))

// Mock motion-dom
mock.module('motion-dom', () => import('./__mocks__/motion-dom.ts'))

// Mock next-intl
mock.module('next-intl', () => ({
  useLocale: () => 'zh',
  useTranslations: (namespace: string) => {
    // 简单的翻译函数模拟
    const translations: Record<string, Record<string, string>> = {
      language: {
        switch: '切换语言',
        current: '当前语言',
      },
    }
    
    return (key: string) => {
      return translations[namespace]?.[key] || key
    }
  },
}))

// Mock use-intl
mock.module('use-intl', () => ({
  useTranslations: (namespace: string) => {
    // 简单的翻译函数模拟
    const translations: Record<string, Record<string, string>> = {
      language: {
        switch: '切换语言',
        current: '当前语言',
      },
    }
    
    return (key: string) => {
      return translations[namespace]?.[key] || key
    }
  },
  useFormatter: () => ({
    // 简单的格式化函数模拟
    dateTime: (date: Date) => date.toLocaleString(),
    number: (num: number) => num.toString(),
    relativeTime: (value: number, unit: string) => `${value} ${unit} ago`,
    list: (items: string[]) => items.join(', '),
  }),
}))

console.log('JSDOM environment setup complete')