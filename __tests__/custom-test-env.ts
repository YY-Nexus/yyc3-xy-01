/**
 * @fileoverview 自定义测试环境 - 确保DOM在测试执行前完全初始化
 * @description 解决testing-library的document可用性问题
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-20
 * @modified 2025-01-20
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

import { JSDOM } from 'jsdom'
import { vi } from 'vitest'

interface Environment {
  name: string
  transformMode?: 'ssr' | 'web'
  setup(global: any, options?: any): Promise<SetupResult> | SetupResult
  teardown(global: any): Promise<void> | void
}

interface SetupResult {
  teardown?(global: any): Promise<void> | void
}

export default class CustomTestEnvironment implements Environment {
  name = 'custom-jsdom'
  dom: JSDOM | null = null

  setup(global: any) {
    // 创建完整的DOM环境
    this.dom = new JSDOM(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Test</title>
          <meta charset="utf-8">
        </head>
        <body>
          <div id="root"></div>
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
    const { window } = this.dom
    
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
    global.localStorage = window.localStorage
    global.sessionStorage = window.sessionStorage
    
    // 事件系统
    global.Event = window.Event
    global.EventTarget = window.EventTarget
    global.MouseEvent = window.MouseEvent
    global.KeyboardEvent = window.KeyboardEvent
    global.TouchEvent = window.TouchEvent
    global.FocusEvent = window.FocusEvent
    global.InputEvent = window.InputEvent
    global.CustomEvent = window.CustomEvent
    
    // 其他必要的全局对象
    global.HTMLElement.prototype.scrollIntoView = () => {}
    global.HTMLElement.prototype.getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => ({})
    })
    
    // 确保document.body正确设置
    Object.defineProperty(global.document, 'body', {
      get: () => window.document.body,
      configurable: true
    })
    
    // 设置测试环境变量
    // @ts-ignore - 测试环境需要修改 NODE_ENV
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32-chars'
    
    // 模拟localStorage
    const localStorageMock = {
      getItem: vi.fn((_key: string) => null),
      setItem: vi.fn((_key: string, _value: string) => {}),
      removeItem: vi.fn((_key: string) => {}),
      clear: vi.fn(() => {}),
      length: 0,
      key: vi.fn((_index: number) => null)
    }
    global.localStorage = localStorageMock
    
    // 模拟sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn((_key: string) => null),
      setItem: vi.fn((_key: string, _value: string) => {}),
      removeItem: vi.fn((_key: string) => {}),
      clear: vi.fn(() => {}),
      length: 0,
      key: vi.fn((_index: number) => null)
    }
    global.sessionStorage = sessionStorageMock
    
    // 模拟matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((_query: string) => ({
        matches: false,
        media: _query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
    
    // 模拟ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    
    // 模拟IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }))
    
    return {
      teardown: (_global: any) => {
        if (this.dom) {
          this.dom.window.close()
          this.dom = null
        }
      }
    }
  }

  teardown(_global: any) {
    if (this.dom) {
      this.dom.window.close()
      this.dom = null
    }
  }
}