/**
 * @file bun-test.d.ts
 * @description Bun测试框架TypeScript类型声明，为Bun测试框架提供类型支持
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

declare module 'bun:test' {
  export interface Mock<T extends (...args: unknown[]) => unknown> {
    (...args: Parameters<T>): ReturnType<T>
    mock: {
      calls: Array<Parameters<T>>
      results: Array<{ type: 'return'; value: ReturnType<T> } | { type: 'throw'; value: unknown }>
    }
    mockImplementation: (impl: T) => void
    mockRestore: () => void
    mockReturnValue: (value: ReturnType<T>) => void
    mockResolvedValue: (value: ReturnType<T>) => void
    mockRejectedValue: (value: unknown) => void
  }

  export function mock<T extends (...args: unknown[]) => unknown>(fn: T): Mock<T>
  export function mock(module: string, factory: () => unknown, options?: { global?: boolean }): void
  
  export const describe: {
    (name: string, fn: () => void): void
    skip: (name: string, fn: () => void) => void
    only: (name: string, fn: () => void) => void
  }
  
  export const it: {
    (name: string, fn: () => void | Promise<void>): void
    skip: (name: string, fn: () => void | Promise<void>) => void
    only: (name: string, fn: () => void | Promise<void>) => void
    todo: (name: string) => void
  }
  
  export const test: {
    (name: string, fn: () => void | Promise<void>): void
    skip: (name: string, fn: () => void | Promise<void>) => void
    only: (name: string, fn: () => void | Promise<void>) => void
    todo: (name: string) => void
  }
  
  export const expect: {
    <T>(value: T): {
      toBe: (expected: T) => void
      toEqual: (expected: T) => void
      toMatch: (pattern: RegExp | string) => void
      toContain: (expected: T) => void
      toHaveLength: (length: number) => void
      toThrow: (expected?: RegExp | string) => void
      toBeDefined: () => void
      toBeUndefined: () => void
      toBeNull: () => void
      toBeTruthy: () => void
      toBeFalsy: () => void
      toBeGreaterThan: (expected: number) => void
      toBeLessThan: (expected: number) => void
      toBeGreaterThanOrEqual: (expected: number) => void
      toBeLessThanOrEqual: (expected: number) => void
      toBeCloseTo: (expected: number, precision?: number) => void
      toMatchObject: (expected: Partial<T>) => void
      toHaveProperty: (path: string, value?: unknown) => void
      toHaveBeenCalled: () => void
      toHaveBeenCalledTimes: (count: number) => void
      toHaveBeenCalledWith: (...args: unknown[]) => void
      lastReturnedWith: (...args: unknown[]) => void
      nthReturnedWith: (n: number, ...args: unknown[]) => void
      not: {
        toBe: (expected: T) => void
        toEqual: (expected: T) => void
        toMatch: (pattern: RegExp | string) => void
        toContain: (expected: T) => void
        toHaveLength: (length: number) => void
        toThrow: (expected?: RegExp | string) => void
        toBeDefined: () => void
        toBeUndefined: () => void
        toBeNull: () => void
        toBeTruthy: () => void
        toBeFalsy: () => void
        toBeGreaterThan: (expected: number) => void
        toBeLessThan: (expected: number) => void
        toBeGreaterThanOrEqual: (expected: number) => void
        toBeLessThanOrEqual: (expected: number) => void
        toBeCloseTo: (expected: number, precision?: number) => void
        toMatchObject: (expected: Partial<T>) => void
        toHaveProperty: (path: string, value?: unknown) => void
        toHaveBeenCalled: () => void
        toHaveBeenCalledTimes: (count: number) => void
        toHaveBeenCalledWith: (...args: unknown[]) => void
        lastReturnedWith: (...args: unknown[]) => void
        nthReturnedWith: (n: number, ...args: unknown[]) => void
      }
    }
  }
  
  export const beforeEach: (fn: () => void | Promise<void>) => void
  export const afterEach: (fn: () => void | Promise<void>) => void
  export const beforeAll: (fn: () => void | Promise<void>) => void
  export const afterAll: (fn: () => void | Promise<void>) => void
  
  export const spyOn: (obj: Record<string, unknown>, method: string) => {
    mockReturnValue: (value: unknown) => void
    mockResolvedValue: (value: unknown) => void
    mockRejectedValue: (value: unknown) => void
    mockImplementation: (fn: (...args: unknown[]) => unknown) => void
    restore: () => void
  }
}