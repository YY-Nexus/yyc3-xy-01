/**
 * @file toolSlice.ts
 * @description YYC³ AI小语智能成长守护系统工具状态管理slice，管理AI工具相关状态，包括工具列表、配置、使用记录等
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// 工具类型定义
export interface Tool {
  id: string
  name: string
  description: string
  category: string
  version: string
  status: 'active' | 'inactive' | 'maintenance'
  icon?: string
  config: Record<string, any>
  permissions: string[]
  usageCount: number
  lastUsed: number | null
  createdAt: number
  updatedAt: number
}

// 工具使用记录类型定义
export interface ToolUsageRecord {
  id: string
  toolId: string
  userId: string
  input: any
  output: any
  duration: number
  success: boolean
  error?: string
  timestamp: number
}

// 工具状态类型定义
export interface ToolState {
  tools: Tool[]
  activeTools: string[]
  toolUsageRecords: ToolUsageRecord[]
  isLoading: boolean
  error: string | null
  categories: string[]
  searchQuery: string
  selectedCategory: string | null
  sortBy: 'name' | 'usage' | 'lastUsed' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

// 初始状态
const initialState: ToolState = {
  tools: [],
  activeTools: [],
  toolUsageRecords: [],
  isLoading: false,
  error: null,
  categories: [],
  searchQuery: '',
  selectedCategory: null,
  sortBy: 'name',
  sortOrder: 'asc',
}

// 异步获取工具列表
export const fetchTools = createAsyncThunk(
  'tools/fetchTools',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/tools')
      if (!response.ok) {
        throw new Error('获取工具列表失败')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取工具列表失败')
    }
  }
)

// 异步激活工具
export const activateTool = createAsyncThunk(
  'tools/activateTool',
  async (toolId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tools/${toolId}/activate`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('激活工具失败')
      }
      return toolId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '激活工具失败')
    }
  }
)

// 异步停用工具
export const deactivateTool = createAsyncThunk(
  'tools/deactivateTool',
  async (toolId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/tools/${toolId}/deactivate`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('停用工具失败')
      }
      return toolId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '停用工具失败')
    }
  }
)

// 异步使用工具
export const useTool = createAsyncThunk(
  'tools/useTool',
  async (
    { toolId, input }: { toolId: string; input: any },
    { rejectWithValue }
  ) => {
    try {
      const startTime = Date.now()
      const response = await fetch(`/api/tools/${toolId}/use`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      })
      
      if (!response.ok) {
        throw new Error('使用工具失败')
      }
      
      const output = await response.json()
      const duration = Date.now() - startTime
      
      return {
        toolId,
        input,
        output,
        duration,
        success: true,
      }
    } catch (error) {
      return rejectWithValue({
        toolId,
        input,
        error: error instanceof Error ? error.message : '使用工具失败',
        success: false,
      })
    }
  }
)

// 创建工具slice
const toolSlice = createSlice({
  name: 'tools',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null
    },
    // 设置搜索查询
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    // 设置选中的分类
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload
    },
    // 设置排序方式
    setSortBy: (state, action: PayloadAction<ToolState['sortBy']>) => {
      state.sortBy = action.payload
    },
    // 设置排序顺序
    setSortOrder: (state, action: PayloadAction<ToolState['sortOrder']>) => {
      state.sortOrder = action.payload
    },
    // 更新工具配置
    updateToolConfig: (
      state,
      action: PayloadAction<{ toolId: string; config: Record<string, any> }>
    ) => {
      const { toolId, config } = action.payload
      const tool = state.tools.find((t) => t.id === toolId)
      if (tool) {
        tool.config = { ...tool.config, ...config }
        tool.updatedAt = Date.now()
      }
    },
    // 添加使用记录
    addUsageRecord: (state, action: PayloadAction<ToolUsageRecord>) => {
      state.toolUsageRecords.unshift(action.payload)
      
      // 更新工具使用统计
      const tool = state.tools.find((t) => t.id === action.payload.toolId)
      if (tool) {
        tool.usageCount += 1
        tool.lastUsed = action.payload.timestamp
      }
    },
    // 清除使用记录
    clearUsageRecords: (state) => {
      state.toolUsageRecords = []
    },
  },
  extraReducers: (builder) => {
    // 获取工具列表
    builder
      .addCase(fetchTools.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTools.fulfilled, (state, action) => {
        state.isLoading = false
        state.tools = action.payload
        
        // 提取所有分类
        const categories = new Set<string>()
        action.payload.forEach((tool: Tool) => {
          categories.add(tool.category)
        })
        state.categories = Array.from(categories)
      })
      .addCase(fetchTools.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 激活工具
    builder
      .addCase(activateTool.fulfilled, (state, action) => {
        const tool = state.tools.find((t) => t.id === action.payload)
        if (tool) {
          tool.status = 'active'
          state.activeTools.push(action.payload)
        }
      })

    // 停用工具
    builder
      .addCase(deactivateTool.fulfilled, (state, action) => {
        const tool = state.tools.find((t) => t.id === action.payload)
        if (tool) {
          tool.status = 'inactive'
        }
        state.activeTools = state.activeTools.filter((id) => id !== action.payload)
      })

    // 使用工具
    builder
      .addCase(useTool.pending, (state) => {
        state.isLoading = true
      })
      .addCase(useTool.fulfilled, (state, action) => {
        state.isLoading = false
        
        if (action.payload.success) {
          const { toolId, input, output, duration } = action.payload
          const usageRecord: ToolUsageRecord = {
            id: Date.now().toString(),
            toolId,
            userId: 'current-user', // 应该从auth状态获取
            input,
            output,
            duration,
            success: true,
            timestamp: Date.now(),
          }
          state.toolUsageRecords.unshift(usageRecord)
          
          // 更新工具使用统计
          const tool = state.tools.find((t) => t.id === toolId)
          if (tool) {
            tool.usageCount += 1
            tool.lastUsed = usageRecord.timestamp
          }
        }
      })
      .addCase(useTool.rejected, (state, action) => {
        state.isLoading = false
        state.error = (action.payload as any)?.error || '使用工具失败'
        
        // 记录失败的使用记录
        const { toolId, input, error } = action.payload as any
        const usageRecord: ToolUsageRecord = {
          id: Date.now().toString(),
          toolId,
          userId: 'current-user', // 应该从auth状态获取
          input,
          output: null,
          duration: 0,
          success: false,
          error,
          timestamp: Date.now(),
        }
        state.toolUsageRecords.unshift(usageRecord)
      })
  },
})

export const {
  clearError,
  setSearchQuery,
  setSelectedCategory,
  setSortBy,
  setSortOrder,
  updateToolConfig,
  addUsageRecord,
  clearUsageRecords,
} = toolSlice.actions

export default toolSlice.reducer