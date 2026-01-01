/**
 * YYC³ AI小语智能成长守护系统 - 国际化布局 (超简化版)
 * 修复服务端渲染错误
 */

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: {
    default: "YYC³ AI小语 - 智能成长守护系统",
    template: "%s | YYC³ AI小语",
  },
  description: "0-22岁全周期AI智能成长守护平台",
}

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-sky-50">
          {children}
        </div>
      </body>
    </html>
  )
}