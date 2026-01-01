/**
 * @file ErrorBoundary.tsx
 * @description YYC³ AI小语智能成长守护系统错误边界组件，提供错误捕获和优雅降级功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  showError?: boolean
  maxRetries?: number
}

interface ErrorReport {
  error: {
    message: string
    stack?: string
    name: string
  }
  errorInfo: {
    componentStack: string | null | undefined
  }
  userAgent: string
  url: string
  timestamp: string
  context: {
    retryCount: number
    maxRetries: number
    hasCustomFallback: boolean
    showError: boolean
  }
  loggedAt?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // 记录错误到外部服务
    this.logErrorToService(error, errorInfo)

    // 调用父组件的错误处理函数
    this.props.onError?.(error, errorInfo)
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // 这里可以集成错误监控服务，如Sentry
    console.error('Error Boundary caught an error:', error, errorInfo)

    // 发送错误报告到服务器
    if (typeof window !== 'undefined') {
      const errorReport = {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        // 添加更多上下文信息
        context: {
          retryCount: this.retryCount,
          maxRetries: this.props.maxRetries || 3,
          hasCustomFallback: !!this.props.fallback,
          showError: this.props.showError !== false
        }
      }

      // 使用相对路径调用API
      fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport)
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      }).then(data => {
        console.log('Error report sent successfully:', data)
      }).catch(err => {
        console.warn('Failed to send error report:', err)
        // 如果API调用失败，尝试使用备用方法记录错误
        this.fallbackErrorLogging(errorReport)
      })
    }
  }

  // 备用错误记录方法
  private fallbackErrorLogging = (errorReport: ErrorReport) => {
    try {
      // 尝试使用localStorage存储错误报告
      const existingReports = JSON.parse(localStorage.getItem('yyc3_error_reports') || '[]')
      existingReports.push({
        ...errorReport,
        loggedAt: new Date().toISOString()
      })
      
      // 只保留最近10个错误报告
      if (existingReports.length > 10) {
        existingReports.splice(0, existingReports.length - 10)
      }
      
      localStorage.setItem('yyc3_error_reports', JSON.stringify(existingReports))
      console.log('Error report saved to localStorage as fallback')
    } catch (err) {
      console.warn('Failed to save error report to localStorage:', err)
    }
  }

  private handleRetry = () => {
    this.retryCount++
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private canRetry = (): boolean => {
    const maxRetries = this.props.maxRetries || 3
    return this.retryCount < maxRetries
  }

  render() {
    if (this.state.hasError) {
      // 如果有自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 如果不显示错误，返回null
      if (!this.props.showError) {
        return null
      }

      // 默认错误UI
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200 min-h-[200px]"
        >
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <i className="ri-error-warning-line text-4xl" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              出现了一些问题
            </h3>
            <p className="text-sm text-red-600 mb-6 max-w-md">
              抱歉，系统遇到了意外错误。请尝试刷新页面或稍后再试。
            </p>

            {this.canRetry() && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleRetry}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <i className="ri-refresh-line mr-1" />
                重试 ({this.retryCount})
              </motion.button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <i className="ri-restart-line mr-1" />
              刷新页面
            </button>

            {/* 开发环境下显示详细错误信息 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-red-500 cursor-pointer">
                  查看错误详情
                </summary>
                <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

// 错误边界Hook
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((err: Error) => {
    setError(err)
    console.error('Error caught by useErrorHandler:', err)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
    hasError: !!error
  }
}

// 错误恢复组件
export function ErrorRecovery({
  children,
  fallback,
  error
}: {
  children: ReactNode
  fallback?: ReactNode
  error?: Error | null
}) {
  const handleRetry = () => {
    window.location.reload()
  }

  if (error) {
    return (
      fallback || (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200"
        >
          <i className="ri-alert-line text-3xl text-yellow-600 mb-2" />
          <p className="text-sm text-yellow-800 mb-2">
            加载出现问题，请重试
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
          >
            重试
          </button>
        </motion.div>
      )
    )
  }

  return <>{children}</>
}

// 网络错误边界
interface NetworkErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface NetworkErrorBoundaryState {
  hasNetworkError: boolean
  error: Error | null
}

export class NetworkErrorBoundary extends Component<
  NetworkErrorBoundaryProps,
  NetworkErrorBoundaryState
> {
  constructor(props: NetworkErrorBoundaryProps) {
    super(props)
    this.state = {
      hasNetworkError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error) {
    // 检查是否是网络错误
    if (
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed')
    ) {
      return {
        hasNetworkError: true,
        error
      }
    }
    return null
  }

  componentDidMount() {
    // 监听网络状态
    window.addEventListener('online', this.handleOnline)
    window.addEventListener('offline', this.handleOffline)
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline)
    window.removeEventListener('offline', this.handleOffline)
  }

  private handleOnline = () => {
    this.setState({ hasNetworkError: false })
  }

  private handleOffline = () => {
    this.setState({ hasNetworkError: true, error: new Error('Network offline') })
  }

  private handleRetry = () => {
    this.setState({ hasNetworkError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasNetworkError) {
      return (
        this.props.fallback || (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-orange-50 rounded-lg border border-orange-200 min-h-[200px]"
          >
            <i className="ri-wifi-off-line text-4xl text-orange-500 mb-4" />
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              网络连接问题
            </h3>
            <p className="text-sm text-orange-600 mb-4 text-center">
              无法连接到服务器，请检查网络连接后重试。
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <i className="ri-refresh-line mr-1" />
              重新连接
            </button>
          </motion.div>
        )
      )
    }

    return this.props.children
  }
}