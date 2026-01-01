import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { reportError } from "@/lib/global-error-handler"

export async function GET(request: NextRequest) {
  try {
    await db.seedMockData()

    const searchParams = request.nextUrl.searchParams
    const childId = searchParams.get("childId")
    const type = searchParams.get("type")

    let records = await db.findMany("growth_records")

    if (childId) {
      records = records.filter((record: any) => record.child_id === childId)
    }

    if (type) {
      records = records.filter((record: any) => record.type === type)
    }

    // 按时间倒序排列
    records.sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())

    return NextResponse.json({ data: records, success: true })
  } catch (error) {
    reportError(error as Error, { component: 'GrowthRecordsAPI', action: 'fetchGrowthRecords', endpoint: '/api/growth-records' })
    return NextResponse.json({ error: "Failed to fetch growth records", success: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const newRecord = await db.create("growth_records", body)
    return NextResponse.json({ data: newRecord, success: true }, { status: 201 })
  } catch (error) {
    reportError(error as Error, { component: 'GrowthRecordsAPI', action: 'createGrowthRecord', endpoint: '/api/growth-records' })
    return NextResponse.json({ error: "Failed to create growth record", success: false }, { status: 500 })
  }
}
