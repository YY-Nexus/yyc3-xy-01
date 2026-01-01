import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // 性能监控
  const start = Date.now()

  // 克隆响应以便修改
  const response = NextResponse.next()

  // 添加性能头部
  const duration = Date.now() - start
  response.headers.set("X-Response-Time", `${duration}ms`)

  // 添加缓存控制
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, must-revalidate")
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (favicon文件)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
