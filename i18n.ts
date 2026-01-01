/**
 * YYC³ AI小语智能成长守护系统 - 国际化配置
 * 第六阶段：高级特性与生产准备
 */

import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// 支持的语言
export const locales = ['zh', 'en'] as const
export type Locale = (typeof locales)[number]

// 默认语言
export const defaultLocale: Locale = 'zh'

// 语言映射
export const localeNames = {
  zh: '中文',
  en: 'English'
} as const

export default getRequestConfig(async ({ locale }) => {
  // 验证请求的语言是否受支持
  if (!locales.includes(locale as Locale)) notFound()

  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
})