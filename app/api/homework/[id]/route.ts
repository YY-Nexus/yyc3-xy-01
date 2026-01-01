import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updated = await db.update("homework_tasks", id, body)

    if (!updated) {
      return NextResponse.json({ error: "Homework not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ data: updated, success: true })
  } catch (error) {
    console.error("[v0] Error updating homework:", error)
    return NextResponse.json({ error: "Failed to update homework", success: false }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const deleted = await db.delete("homework_tasks", id)

    if (!deleted) {
      return NextResponse.json({ error: "Homework not found", success: false }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting homework:", error)
    return NextResponse.json({ error: "Failed to delete homework", success: false }, { status: 500 })
  }
}
