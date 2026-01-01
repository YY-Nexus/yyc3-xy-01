/**
 * @file LanguageSwitcher.tsx
 * @description YYC³ AI小语智能成长守护系统语言切换组件，提供多语言切换和本地化支持功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
// import { motion, AnimatePresence } from 'framer-motion'
import { locales, localeNames, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const t = useTranslations('language')

  const [isOpen, setIsOpen] = useState(false)

  // 添加Escape键处理
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey)
      return () => window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, handleEscapeKey])

  const switchLanguage = (newLocale: Locale) => {
    if (newLocale === locale) {
      setIsOpen(false)
      return
    }

    // 构建新路径
    if (pathname) {
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
      router.push(newPath)
    }
    setIsOpen(false)
  }

  const currentLocaleName = localeNames[locale]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200/50"
        title={t('switch')}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-translate-2 text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {currentLocaleName}
        </span>
        <div
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <i className="ri-arrow-down-s-line text-gray-500" />
        </div>
      </button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 z-50"
          role="menu"
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 mb-1">
              {t('current')}
            </div>
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => switchLanguage(loc)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  loc === locale
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">
                    {loc === 'zh' ? '🇨🇳' : '🇺🇸'}
                  </span>
                  <span>{localeNames[loc]}</span>
                  {loc === locale && (
                    <i className="ri-check-line text-blue-600 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onMouseDown={() => setIsOpen(false)}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}