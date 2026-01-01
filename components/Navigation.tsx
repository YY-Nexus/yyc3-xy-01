/**
 * @file Navigation.tsx
 * @description 导航组件，提供应用主导航菜单
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"

const navItems = [
  { id: "home", icon: "ri-home-smile-2-fill", label: "首页", href: "/" },
  { id: "videos", icon: "ri-video-fill", label: "视频", href: "/videos" },
  { id: "books", icon: "ri-book-3-fill", label: "绘本", href: "/books" },
  { id: "short-drama", icon: "ri-movie-2-fill", label: "短剧", href: "/ai-creative", badge: true },
  { id: "creative", icon: "ri-palette-fill", label: "创作", href: "/ai-creative" },
  { id: "curriculum", icon: "ri-calendar-todo-fill", label: "课表", href: "/curriculum" },
  { id: "growth", icon: "ri-trophy-fill", label: "成长", href: "/growth" },
  { id: "settings", icon: "ri-settings-4-fill", label: "设置", href: "/settings" },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <motion.nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-white/50 shadow-xl py-2 z-40 flex items-center gap-1 rounded-2xl px-4"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {navItems.map((item, index) => {
        const isActive = pathname === item.href

        return (
          <Link key={item.id} href={item.href}>
            <motion.button
              className={`relative flex flex-col items-center justify-center py-2 transition-all px-5 rounded-xl ${
                isActive ? "bg-blue-400 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {item.badge && !isActive && (
                <motion.div
                  className="absolute top-1 right-2 w-2 h-2 bg-red-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              )}
              <i className={`${item.icon} text-xl mb-0.5`} />
              <span className="text-[10px]">{item.label}</span>
            </motion.button>
          </Link>
        )
      })}
    </motion.nav>
  )
}
