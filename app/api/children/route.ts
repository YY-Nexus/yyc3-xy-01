import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { reportError } from "@/lib/global-error-handler"

export async function GET(_request: NextRequest) {
  try {
    // 初始化模拟数据
    await db.seedMockData()

    const children = await db.findMany("children")
    return NextResponse.json({ data: children, success: true })
  } catch (error) {
    reportError(error as Error, { component: 'ChildrenAPI', action: 'fetchChildren', endpoint: '/api/children' })
    return NextResponse.json({ error: "Failed to fetch children", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newChild = await db.create("children", body)
    return NextResponse.json({ data: newChild, success: true }, { status: 201 })
  } catch (error) {
    reportError(error as Error, { component: 'ChildrenAPI', action: 'createChild', endpoint: '/api/children' })
    return NextResponse.json({ error: "Failed to create child", success: false }, { status: 500 })
  }
}
