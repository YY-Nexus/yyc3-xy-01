/**
 * @file helpers.test.ts
 * @description YYC³ AI小语智能成长守护系统工具函数测试，第六阶段高级特性与生产准备
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'

// 导入需要测试的工具函数
import { formatDate } from '@/lib/utils/formatDate'

// 示例工具函数测试
describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date correctly for Chinese locale', () => {
      const date = new Date('2024-01-01')
      const formatted = formatDate(date, 'zh-CN')
      expect(formatted).toBe('2024年1月1日')
    })

    it('formats date correctly for English locale', () => {
      const date = new Date('2024-01-01')
      const formatted = formatDate(date, 'en-US')
      expect(formatted).toBe('January 1, 2024')
    })

    it('handles invalid dates', () => {
      const date = new Date('invalid')
      const formatted = formatDate(date, 'zh-CN')
      expect(formatted).toBe('--')
    })
  })

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const birthDate = new Date('2020-01-01')
      const currentDate = new Date('2024-01-01')
      const age = calculateAge(birthDate, currentDate)
      expect(age).toBe(4)
    })

    it('handles future birth dates', () => {
      const birthDate = new Date('2025-01-01')
      const currentDate = new Date('2024-01-01')
      const age = calculateAge(birthDate, currentDate)
      expect(age).toBe(0)
    })

    it('handles same day birth dates', () => {
      const birthDate = new Date('2024-01-01')
      const currentDate = new Date('2024-01-01')
      const age = calculateAge(birthDate, currentDate)
      expect(age).toBe(0)
    })
  })

  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true)
    })

    it('rejects invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('generates IDs with correct format', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-zA-Z0-9_-]+$/)
      expect(id.length).toBeGreaterThan(0)
    })
  })

  describe('debounce', () => {
    let originalSetTimeout: typeof setTimeout
    let originalClearTimeout: typeof clearTimeout
    let timeouts: Array<{ id: number; callback: () => void; delay: number }> = []

    beforeEach(() => {
      originalSetTimeout = global.setTimeout
      originalClearTimeout = global.clearTimeout
      timeouts = []
      
      global.setTimeout = ((callback: () => void, delay: number) => {
        const id = timeouts.length
        timeouts.push({ id, callback, delay })
        return id
      }) as typeof setTimeout
      
      global.clearTimeout = ((id: number) => {
        timeouts = timeouts.filter(t => t.id !== id)
      }) as typeof clearTimeout
    })

    afterEach(() => {
      global.setTimeout = originalSetTimeout
      global.clearTimeout = originalClearTimeout
    })

    const advanceTimersByTime = (ms: number) => {
      const initialCount = timeouts.length
      for (let i = 0; i < initialCount; i++) {
        const timeout = timeouts[i]
        if (timeout && timeout.delay <= ms) {
          timeout.callback()
        }
      }
      timeouts = timeouts.filter(t => t.delay > ms)
    }

    it('delays function execution', () => {
      const mockFn = mock(() => {})
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      expect(mockFn).not.toHaveBeenCalled()

      advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('cancels previous calls', () => {
      const mockFn = mock(() => {})
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      advanceTimersByTime(100)
      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})

// 辅助函数定义（实际项目中这些应该在单独的工具文件中）

function calculateAge(birthDate: Date, currentDate: Date): number {
  if (birthDate > currentDate) return 0

  let age = currentDate.getFullYear() - birthDate.getFullYear()
  const monthDiff = currentDate.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}