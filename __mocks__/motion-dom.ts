/**
 * @fileoverview motion-dom模拟模块
 * @description 完全模拟motion-dom库，避免在测试环境中加载实际的手势处理代码
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @modified 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

// Mock AbortController for JSDOM compatibility
const MockAbortController = class {
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

// Mock AbortSignal
const MockAbortSignal = class {
  static abort() {
    return {
      aborted: true,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }
  }
  
  static any(_signals: any[]) {
    return {
      aborted: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }
  }
  
  static timeout(_milliseconds: number) {
    return {
      aborted: false,
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

if (typeof global !== 'undefined') {
  (global as any).AbortController = MockAbortController as any
  (global as any).AbortSignal = MockAbortSignal as any
}

// Mock motion-dom gesture functions
export const hover = () => {}
export const press = () => {}
export const pan = () => {}
export const drag = () => {}
export const inView = () => {}

// Mock motion-dom animation functions
export const animate = () => Promise.resolve()
export const spring = () => ({})
export const tween = () => ({})
export const keyframes = () => ({})
export const stagger = () => ({})

// Mock motion-dom utility functions
export const transform = () => ({})
export const pipe = () => () => {}
export const isTransform = () => false
export const isKeyframesTarget = () => false

// Mock motion-dom event functions
export const addDomEvent = () => () => {}
export const addPointerEvent = () => () => {}

// Default export
export default {
  hover,
  press,
  pan,
  drag,
  inView,
  animate,
  spring,
  tween,
  keyframes,
  stagger,
  transform,
  pipe,
  isTransform,
  isKeyframesTarget,
  addDomEvent,
  addPointerEvent,
}