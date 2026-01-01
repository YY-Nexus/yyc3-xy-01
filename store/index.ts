/**
 * @file index.ts
 * @description YYC³ AI小语智能成长守护系统Store模块导出文件，统一导出所有store相关的模块和类型
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

// 导出store和persistor
export { store, persistor } from '@/lib/store'

// 导出类型
export type { RootState, AppDispatch } from '@/lib/store'

// 导出类型化的hooks
export { useAppDispatch, useAppSelector } from '@/lib/store'

// 导出所有slice
export { default as authSlice } from './slices/authSlice'
export { default as uiSlice } from './slices/uiSlice'
export { default as toolSlice } from './slices/toolSlice'
export { default as knowledgeSlice } from './slices/knowledgeSlice'

// 导出auth slice的actions和类型
export {
  loginUser,
  logoutUser,
  refreshToken,
  clearError as clearAuthError,
  updateUserPreferences,
  resetLoginAttempts,
  setAuthState,
  clearAuthState,
} from './slices/authSlice'
export type { User, AuthState } from './slices/authSlice'

// 导出ui slice的actions和类型
export {
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
} from './slices/uiSlice'
export type { Notification, UIState } from './slices/uiSlice'

// 导出tool slice的actions和类型
export {
  fetchTools,
  activateTool,
  deactivateTool,
  useTool,
  clearError as clearToolError,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  updateToolConfig,
  addUsageRecord,
  clearUsageRecords,
} from './slices/toolSlice'
export type { Tool, ToolUsageRecord, ToolState } from './slices/toolSlice'

// 导出knowledge slice的actions和类型
export {
  fetchDocuments,
  fetchDocument,
  searchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  clearError as clearKnowledgeError,
  setSearchQuery as setKnowledgeSearchQuery,
  setSelectedCategory as setKnowledgeSelectedCategory,
  setSelectedTags,
  setSortBy as setKnowledgeSortBy,
  setSortOrder as setKnowledgeSortOrder,
  setPagination,
  setFilters,
  clearFilters,
  clearSearchResults,
  clearCurrentDocument,
} from './slices/knowledgeSlice'
export type {
  KnowledgeDocument,
  KnowledgeCategory,
  SearchResult,
  KnowledgeState,
} from './slices/knowledgeSlice'