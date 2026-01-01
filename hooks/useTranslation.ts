/**
 * @file useTranslation.ts
 * @description YYC³ AI小语智能成长守护系统国际化Hook，提供多语言支持功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

/**
 * YYC³ AI小语智能成长守护系统 - 国际化Hook
 * 第六阶段：高级特性与生产准备
 */

import { useTranslations, useLocale } from 'next-intl'
import { useMemo } from 'react'

// 类型化的翻译键
type TranslationKey =
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.save'
  | 'common.edit'
  | 'common.delete'
  | 'common.retry'
  | 'common.refresh'
  | 'navigation.home'
  | 'navigation.homework'
  | 'navigation.growth'
  | 'navigation.courses'
  | 'navigation.books'
  | 'navigation.profile'
  | 'navigation.settings'
  | 'home.greeting'
  | 'home.learningAssistant'
  | 'home.tagline'
  | 'home.todayPlan'
  | 'home.startHomework'
  | 'home.homeworkCenter'
  | 'home.homeworkSubtitle'
  | 'growth.title'
  | 'growth.subtitle'
  | 'courses.title'
  | 'courses.subtitle'
  | 'homework.title'
  | 'homework.subtitle'
  | 'books.title'
  | 'books.subtitle'
  | 'ai.assistant'
  | 'ai.companion'
  | 'emotion.title'
  | 'performance.title'
  | 'errors.networkError'
  | 'errors.pageError'
  | 'settings.title'
  | 'language.switch'

export function useTypedTranslation() {
  const t = useTranslations()
  const locale = useLocale()

  const typedT = useMemo(() => {
    return (key: TranslationKey, values?: Record<string, string | number>) => {
      return t(key, values)
    }
  }, [t])

  return {
    t: typedT,
    locale,
    // 便捷方法
    tc: (key: string) => t(`common.${key}`),
    tn: (key: string) => t(`navigation.${key}`),
    th: (key: string) => t(`home.${key}`),
    tg: (key: string) => t(`growth.${key}`),
    tcr: (key: string) => t(`courses.${key}`),
    thw: (key: string) => t(`homework.${key}`),
    tb: (key: string) => t(`books.${key}`),
    tai: (key: string) => t(`ai.${key}`),
    te: (key: string) => t(`emotion.${key}`),
    tp: (key: string) => t(`performance.${key}`),
    ter: (key: string) => t(`errors.${key}`),
    ts: (key: string) => t(`settings.${key}`),
    tl: (key: string) => t(`language.${key}`)
  }
}

export default useTypedTranslation