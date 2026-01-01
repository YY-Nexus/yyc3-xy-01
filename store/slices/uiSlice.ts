/**
 * @file uiSlice.ts
 * @description YYC³ AI小语智能成长守护系统UI状态管理slice，管理UI相关状态，包括主题、语言、通知等
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// 通知类型定义
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  timestamp: number
}

// UI状态类型定义
export interface UIState {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  sidebarOpen: boolean
  notifications: Notification[]
  loading: {
    global: boolean
    components: Record<string, boolean>
  }
  modals: {
    [key: string]: boolean
  }
  breadcrumbs: Array<{
    label: string
    path?: string
  }>
  currentPage: string
  screenSize: 'mobile' | 'tablet' | 'desktop'
}

// 初始状态
const initialState: UIState = {
  theme: 'auto',
  language: 'zh-CN',
  sidebarOpen: true,
  notifications: [],
  loading: {
    global: false,
    components: {},
  },
  modals: {},
  breadcrumbs: [],
  currentPage: '',
  screenSize: 'desktop',
}

// 创建UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload
    },
    // 设置语言
    setLanguage: (state, action: PayloadAction<'zh-CN' | 'en-US'>) => {
      state.language = action.payload
    },
    // 切换侧边栏
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    // 设置侧边栏状态
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    // 添加通知
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      state.notifications.push(notification)
    },
    // 移除通知
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    // 清除所有通知
    clearNotifications: (state) => {
      state.notifications = []
    },
    // 设置全局加载状态
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload
    },
    // 设置组件加载状态
    setComponentLoading: (
      state,
      action: PayloadAction<{ component: string; loading: boolean }>
    ) => {
      const { component, loading } = action.payload
      state.loading.components[component] = loading
    },
    // 打开模态框
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true
    },
    // 关闭模态框
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false
    },
    // 设置面包屑
    setBreadcrumbs: (state, action: PayloadAction<UIState['breadcrumbs']>) => {
      state.breadcrumbs = action.payload
    },
    // 设置当前页面
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    // 设置屏幕尺寸
    setScreenSize: (state, action: PayloadAction<'mobile' | 'tablet' | 'desktop'>) => {
      state.screenSize = action.payload
    },
  },
})

export const {
  setTheme,
  setLanguage,
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
  setComponentLoading,
  openModal,
  closeModal,
  setBreadcrumbs,
  setCurrentPage,
  setScreenSize,
} = uiSlice.actions

export default uiSlice.reducer