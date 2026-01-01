/**
 * @file yyc3-theme-provider.tsx
 * @description YYC³ AI小语智能成长守护系统主题提供器组件，提供全局主题管理
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { theme } from '../src/foundation/styles/theme'

interface YYC3ThemeProviderProps {
  children: React.ReactNode
}

export function YYC3ThemeProvider({ children }: YYC3ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <style jsx global>{`
        :root {
          /* 颜色变量 */
          --color-primary: ${theme.colors.primary[500]};
          --color-primary-light: ${theme.colors.primary[400]};
          --color-primary-dark: ${theme.colors.primary[600]};
          --color-secondary: ${theme.colors.secondary[500]};
          --color-success: ${theme.colors.success[500]};
          --color-warning: ${theme.colors.warning[500]};
          --color-error: ${theme.colors.error[500]};
          --color-info: ${theme.colors.info[500]};
          
          /* 中性色 */
          --color-white: ${theme.colors.neutral[50]};
          --color-gray-100: ${theme.colors.neutral[100]};
          --color-gray-200: ${theme.colors.neutral[200]};
          --color-gray-300: ${theme.colors.neutral[300]};
          --color-gray-400: ${theme.colors.neutral[400]};
          --color-gray-500: ${theme.colors.neutral[500]};
          --color-gray-600: ${theme.colors.neutral[600]};
          --color-gray-700: ${theme.colors.neutral[700]};
          --color-gray-800: ${theme.colors.neutral[800]};
          --color-gray-900: ${theme.colors.neutral[900]};
          --color-black: ${theme.colors.neutral[950]};
          
          /* 排版变量 */
          --font-family: ${theme.typography.fontFamily};
          --font-size-xs: ${theme.typography.fontSize.xs};
          --font-size-sm: ${theme.typography.fontSize.sm};
          --font-size-md: ${theme.typography.fontSize.md};
          --font-size-lg: ${theme.typography.fontSize.lg};
          --font-size-xl: ${theme.typography.fontSize.xl};
          --font-size-2xl: ${theme.typography.fontSize['2xl']};
          --font-size-3xl: ${theme.typography.fontSize['3xl']};
          --font-size-4xl: ${theme.typography.fontSize['4xl']};
          
          --font-weight-light: ${theme.typography.fontWeight.light};
          --font-weight-normal: ${theme.typography.fontWeight.normal};
          --font-weight-medium: ${theme.typography.fontWeight.medium};
          --font-weight-semibold: ${theme.typography.fontWeight.semibold};
          --font-weight-bold: ${theme.typography.fontWeight.bold};
          
          /* 间距变量 */
          --spacing-0: ${theme.spacing[0]};
          --spacing-1: ${theme.spacing[1]};
          --spacing-2: ${theme.spacing[2]};
          --spacing-3: ${theme.spacing[3]};
          --spacing-4: ${theme.spacing[4]};
          --spacing-5: ${theme.spacing[5]};
          --spacing-6: ${theme.spacing[6]};
          --spacing-8: ${theme.spacing[8]};
          --spacing-10: ${theme.spacing[10]};
          --spacing-12: ${theme.spacing[12]};
          --spacing-16: ${theme.spacing[16]};
          --spacing-20: ${theme.spacing[20]};
          --spacing-24: ${theme.spacing[24]};
          --spacing-32: ${theme.spacing[32]};
          
          /* 边框半径 */
          --border-radius-sm: ${theme.borderRadius.sm};
          --border-radius-md: ${theme.borderRadius.md};
          --border-radius-lg: ${theme.borderRadius.lg};
          --border-radius-xl: ${theme.borderRadius.xl};
          --border-radius-full: ${theme.borderRadius.full};
          
          /* 阴影 */
          --shadow-sm: ${theme.shadow.sm};
          --shadow-md: ${theme.shadow.md};
          --shadow-lg: ${theme.shadow.lg};
          --shadow-xl: ${theme.shadow.xl};
        }
        
        /* 全局基础样式 */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html {
          font-size: 16px;
          font-family: var(--font-family);
          line-height: 1.5;
        }
        
        body {
          color: var(--color-gray-900);
          background-color: var(--color-white);
          font-family: var(--font-family);
        }
      `}</style>
      {children}
    </NextThemesProvider>
  )
}
