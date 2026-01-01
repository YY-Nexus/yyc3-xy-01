import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { reportError } from "@/lib/global-error-handler"

export async function GET(request: NextRequest) {
  try {
    await db.seedMockData()

    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get("childId")
    const status = searchParams.get("status")

    let homework = await db.findMany("homework_tasks")

    if (childId) {
      homework = homework.filter((hw: any) => hw.child_id === childId)
    }

    if (status) {
      homework = homework.filter((hw: any) => hw.status === status)
    }

    return NextResponse.json({ data: homework, success: true })
  } catch (error) {
    reportError(error as Error, { component: 'HomeworkAPI', action: 'fetchHomework', endpoint: '/api/homework' })
    return NextResponse.json({ error: "Failed to fetch homework", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newHomework = await db.create("homework_tasks", body)
    return NextResponse.json({ data: newHomework, success: true }, { status: 201 })
  } catch (error) {
    reportError(error as Error, { component: 'HomeworkAPI', action: 'createHomework', endpoint: '/api/homework' })
    return NextResponse.json({ error: "Failed to create homework", success: false }, { status: 500 })
  }
}
