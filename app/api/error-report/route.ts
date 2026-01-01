/**
 * @file route.ts
 * @description YYC³ AI小语智能成长守护系统错误报告API，提供错误收集、记录和分析功能
 * @author YYC³团队 <admin@0379.email>
 * @version 1.0.0
 */

import { type NextRequest, NextResponse } from "next/server"

interface ErrorReport {
  error: {
    message: string
    stack?: string
    name?: string
  }
  errorInfo?: {
    componentStack?: string
    errorBoundaryStack?: string
  }
  userAgent: string
  url: string
  timestamp: string
  userId?: string
  childId?: string
  context?: {
    retryCount?: number
    maxRetries?: number
    hasCustomFallback?: boolean
    showError?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const report: ErrorReport = await request.json()

    // 验证必要字段
    if (!report.error?.message || !report.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields", success: false },
        { status: 400 }
      )
    }

    // 记录错误到控制台
    console.error('Error Report:', {
      message: report.error.message,
      stack: report.error.stack,
      timestamp: report.timestamp,
      url: report.url,
      userAgent: report.userAgent,
      context: report.context
    })

    // 这里可以集成外部错误监控服务
    // 例如：Sentry, LogRocket, 或者自建的错误收集系统
    await logErrorToExternalService(report)

    // 存储到本地日志（可选）
    await logErrorToFile(report)

    return NextResponse.json({
      success: true,
      message: "Error reported successfully"
    })

  } catch (error) {
    console.error("Error in error-report API:", error)
    return NextResponse.json(
      { error: "Failed to process error report", success: false },
      { status: 500 }
    )
  }
}

async function logErrorToExternalService(report: ErrorReport) {
  // 示例：发送到错误监控服务
  // 这里可以集成 Sentry, LogRocket, 或其他错误监控服务

  // Slack 通知示例
  try {
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `🚨 YYC³ AI系统错误报告`,
          attachments: [{
            color: 'danger',
            fields: [
              {
                title: '错误信息',
                value: report.error.message,
                short: false
              },
              {
                title: '时间',
                value: new Date(report.timestamp).toLocaleString('zh-CN'),
                short: true
              },
              {
                title: '页面',
                value: report.url,
                short: true
              },
              {
                title: '用户代理',
                value: report.userAgent,
                short: false
              }
            ]
          }]
        })
      })
    }
  } catch (error) {
    console.warn('Failed to send Slack notification:', error)
  }

  // 邮件通知示例
  if (process.env.ADMIN_EMAIL && isCriticalError(report)) {
    // 这里可以集成邮件发送服务
    console.log('Critical error detected, would send email to', process.env.ADMIN_EMAIL)
  }
}

function isCriticalError(report: ErrorReport): boolean {
  // 定义哪些错误是关键错误
  const criticalErrors = [
    'ChunkLoadError',
    'Loading CSS chunk',
    'Network request failed',
    'Failed to fetch dynamically imported module',
    'Out of memory'
  ]

  return criticalErrors.some(error =>
    report.error.message.includes(error)
  )
}

async function logErrorToFile(report: ErrorReport) {
  // 本地日志存储示例
  const logEntry = {
    timestamp: report.timestamp,
    level: 'ERROR',
    message: report.error.message,
    stack: report.error.stack,
    url: report.url,
    userAgent: report.userAgent,
    errorInfo: report.errorInfo
  }

  // 在实际应用中，这里可以写入文件系统或数据库
  console.log('Would log to file:', JSON.stringify(logEntry, null, 2))
}

// GET 请求 - 获取错误统计（管理员功能）
export async function GET() {
  try {
    // 这里可以实现错误统计和管理功能
    return NextResponse.json({
      message: "Error statistics endpoint",
      // 返回错误统计数据
    })
  } catch (error) {
    console.error("Error in GET error-report:", error)
    return NextResponse.json(
      { error: "Failed to get error statistics", success: false },
      { status: 500 }
    )
  }
}