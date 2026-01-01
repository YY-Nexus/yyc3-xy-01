/**
 * @fileoverview 国际化配置
 * @description 定义支持的语言和语言名称
 * @author YYC³
 * @version 1.0.0
 * @created 2025-01-19
 * @modified 2025-01-19
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */

export type Locale = 'zh' | 'en'

export const locales: Locale[] = ['zh', 'en']

export const localeNames: Record<Locale, string> = {
  zh: '中文',
  en: 'English',
}

export const defaultLocale: Locale = 'zh'

// 语言切换映射
export const localePathMap: Record<Locale, string> = {
  zh: '/zh',
  en: '/en',
}