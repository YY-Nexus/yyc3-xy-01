/**
 * @file knowledgeSlice.ts
 * @description YYC³ AI小语智能成长守护系统知识库状态管理slice，管理知识库相关状态，包括文档、搜索、分类等
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// 知识库文档类型定义
export interface KnowledgeDocument {
  id: string
  title: string
  content: string
  summary?: string
  category: string
  tags: string[]
  author: string
  version: string
  status: 'draft' | 'published' | 'archived'
  metadata: {
    wordCount: number
    readTime: number
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    language: string
  }
  embeddings?: number[]
  createdAt: number
  updatedAt: number
  lastAccessed: number | null
  accessCount: number
}

// 知识库分类类型定义
export interface KnowledgeCategory {
  id: string
  name: string
  description: string
  parentId?: string
  children: string[]
  documentCount: number
  icon?: string
  color?: string
  createdAt: number
  updatedAt: number
}

// 搜索结果类型定义
export interface SearchResult {
  document: KnowledgeDocument
  score: number
  highlights: string[]
}

// 知识库状态类型定义
export interface KnowledgeState {
  documents: KnowledgeDocument[]
  categories: KnowledgeCategory[]
  searchResults: SearchResult[]
  currentDocument: KnowledgeDocument | null
  isLoading: boolean
  error: string | null
  searchQuery: string
  selectedCategory: string | null
  selectedTags: string[]
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'accessCount' | 'relevance'
  sortOrder: 'asc' | 'desc'
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  filters: {
    status?: KnowledgeDocument['status']
    difficulty?: KnowledgeDocument['metadata']['difficulty']
    language?: string
    dateRange?: {
      start: number
      end: number
    }
  }
}

// 初始状态
const initialState: KnowledgeState = {
  documents: [],
  categories: [],
  searchResults: [],
  currentDocument: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: null,
  selectedTags: [],
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filters: {},
}

// 异步获取文档列表
export const fetchDocuments = createAsyncThunk(
  'knowledge/fetchDocuments',
  async (
    params: {
      page?: number
      limit?: number
      category?: string
      tags?: string[]
      search?: string
      sortBy?: string
      sortOrder?: string
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, v))
          } else {
            queryParams.append(key, String(value))
          }
        }
      })

      const response = await fetch(`/api/knowledge/documents?${queryParams}`)
      if (!response.ok) {
        throw new Error('获取文档列表失败')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取文档列表失败')
    }
  }
)

// 异步获取文档详情
export const fetchDocument = createAsyncThunk(
  'knowledge/fetchDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/knowledge/documents/${documentId}`)
      if (!response.ok) {
        throw new Error('获取文档详情失败')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '获取文档详情失败')
    }
  }
)

// 异步搜索文档
export const searchDocuments = createAsyncThunk(
  'knowledge/searchDocuments',
  async (
    params: {
      query: string
      category?: string
      tags?: string[]
      limit?: number
    },
    { rejectWithValue }
  ) => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('q', params.query)
      if (params.category) {
        queryParams.append('category', params.category)
      }
      if (params.tags) {
        params.tags.forEach((tag) => queryParams.append('tags', tag))
      }
      if (params.limit) {
        queryParams.append('limit', String(params.limit))
      }

      const response = await fetch(`/api/knowledge/search?${queryParams}`)
      if (!response.ok) {
        throw new Error('搜索文档失败')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '搜索文档失败')
    }
  }
)

// 异步创建文档
export const createDocument = createAsyncThunk(
  'knowledge/createDocument',
  async (
    document: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt' | 'accessCount' | 'lastAccessed'>,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch('/api/knowledge/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      })
      if (!response.ok) {
        throw new Error('创建文档失败')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '创建文档失败')
    }
  }
)

// 异步更新文档
export const updateDocument = createAsyncThunk(
  'knowledge/updateDocument',
  async (
    { id, updates }: { id: string; updates: Partial<KnowledgeDocument> },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/knowledge/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        throw new Error('更新文档失败')
      }
      const data = await response.json()
      return data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '更新文档失败')
    }
  }
)

// 异步删除文档
export const deleteDocument = createAsyncThunk(
  'knowledge/deleteDocument',
  async (documentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/knowledge/documents/${documentId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('删除文档失败')
      }
      return documentId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : '删除文档失败')
    }
  }
)

// 创建知识库slice
const knowledgeSlice = createSlice({
  name: 'knowledge',
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
    // 设置选中的标签
    setSelectedTags: (state, action: PayloadAction<string[]>) => {
      state.selectedTags = action.payload
    },
    // 设置排序方式
    setSortBy: (state, action: PayloadAction<KnowledgeState['sortBy']>) => {
      state.sortBy = action.payload
    },
    // 设置排序顺序
    setSortOrder: (state, action: PayloadAction<KnowledgeState['sortOrder']>) => {
      state.sortOrder = action.payload
    },
    // 设置分页
    setPagination: (state, action: PayloadAction<Partial<KnowledgeState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    // 设置过滤器
    setFilters: (state, action: PayloadAction<Partial<KnowledgeState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    // 清除过滤器
    clearFilters: (state) => {
      state.filters = {}
      state.selectedCategory = null
      state.selectedTags = []
    },
    // 清除搜索结果
    clearSearchResults: (state) => {
      state.searchResults = []
    },
    // 清除当前文档
    clearCurrentDocument: (state) => {
      state.currentDocument = null
    },
  },
  extraReducers: (builder) => {
    // 获取文档列表
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents = action.payload.documents
        state.pagination = action.payload.pagination
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 获取文档详情
    builder
      .addCase(fetchDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentDocument = action.payload
        
        // 更新文档列表中的对应文档
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 搜索文档
    builder
      .addCase(searchDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(searchDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.searchResults = action.payload.results
      })
      .addCase(searchDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 创建文档
    builder
      .addCase(createDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents.unshift(action.payload)
      })
      .addCase(createDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 更新文档
    builder
      .addCase(updateDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.documents.findIndex((doc) => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload
        }
      })
      .addCase(updateDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // 删除文档
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.documents = state.documents.filter((doc) => doc.id !== action.payload)
        if (state.currentDocument?.id === action.payload) {
          state.currentDocument = null
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  clearError,
  setSearchQuery,
  setSelectedCategory,
  setSelectedTags,
  setSortBy,
  setSortOrder,
  setPagination,
  setFilters,
  clearFilters,
  clearSearchResults,
  clearCurrentDocument,
} = knowledgeSlice.actions

export default knowledgeSlice.reducer