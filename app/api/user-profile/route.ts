import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { reportError } from "@/lib/global-error-handler"

// 获取用户档案
export async function GET(request: NextRequest) {
  try {
    // 初始化模拟数据
    await db.seedMockData()

    // 从URL参数获取用户ID
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required", success: false }, { status: 400 })
    }

    // 查找用户档案
    const profiles = await db.findMany("user_profiles")
    const userProfile = profiles.find((profile: any) => profile.user_id === userId)

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: userProfile, success: true })
  } catch (error) {
    reportError(error as Error, { component: 'UserProfileAPI', action: 'fetchUserProfile', endpoint: '/api/user-profile' })
    return NextResponse.json({ error: "Failed to fetch user profile", success: false }, { status: 500 })
  }
}

// 更新用户档案
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required", success: false }, { status: 400 })
    }

    // 添加更新时间
    updateData.updated_at = new Date().toISOString()

    // 更新用户档案
    const updatedProfile = await db.update("user_profiles", id, updateData)

    if (!updatedProfile) {
      return NextResponse.json({ error: "User profile not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: updatedProfile, success: true })
  } catch (error) {
    reportError(error as Error, { component: 'UserProfileAPI', action: 'updateUserProfile', endpoint: '/api/user-profile' })
    return NextResponse.json({ error: "Failed to update user profile", success: false }, { status: 500 })
  }
}

// 创建用户档案
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 添加创建时间
    body.created_at = new Date().toISOString()
    
    // 创建用户档案
    const newProfile = await db.create("user_profiles", body)
    return NextResponse.json({ data: newProfile, success: true }, { status: 201 })
  } catch (error) {
    reportError(error as Error, { component: 'UserProfileAPI', action: 'createUserProfile', endpoint: '/api/user-profile' })
    return NextResponse.json({ error: "Failed to create user profile", success: false }, { status: 500 })
  }
}