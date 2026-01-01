/**
 * @file authSlice.ts
 * @description YYC³ AI小语智能成长守护系统认证状态管理slice，管理用户认证相关状态，包括登录状态、用户信息等
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// 用户类型定义
export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'guest'
  preferences: {
    language: string
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
  }
}

// 认证状态类型定义
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  loginAttempts: number
  lastLoginTime: number | null
}

// 初始状态
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginTime: null,
}

// 异步登录操作
export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // 这里应该调用实际的API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('登录失败')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '登录失败')
    }
  }
)

// 异步登出操作
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 这里应该调用实际的API
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      return true
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '登出失败')
    }
  }
)

// 异步刷新token操作
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Token刷新失败')
      }

      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Token刷新失败')
    }
  }
)

// 创建auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
    // 更新用户偏好设置
    updateUserPreferences: (
      state,
      action: PayloadAction<Partial<User['preferences']>>
    ) => {
      if (state.user) {
        state.user.preferences = {
          ...state.user.preferences,
          ...action.payload,
        }
      }
    },
    // 重置登录尝试次数
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0
    },
    // 设置认证状态（用于持久化恢复）
    setAuthState: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
    },
    // 清除认证状态
    clearAuthState: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.lastLoginTime = null
    },
  },
  extraReducers: (builder) => {
    // 登录操作
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.loginAttempts = 0
        state.lastLoginTime = Date.now()
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.loginAttempts += 1
      })

    // 登出操作
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.lastLoginTime = null
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 刷新token操作
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token刷新失败，清除认证状态
        state.user = null
        state.token = null
        state.isAuthenticated = false
        state.lastLoginTime = null
      })
  },
})

export const {
  clearError,
  updateUserPreferences,
  resetLoginAttempts,
  setAuthState,
  clearAuthState,
} = authSlice.actions

export default authSlice.reducer