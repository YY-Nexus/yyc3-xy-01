/**
 * @file theme-provider.tsx
 * @description YYC³ AI小语智能成长守护系统主题提供器组件，提供主题切换和管理功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
