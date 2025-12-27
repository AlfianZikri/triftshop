import { type NextRequest, NextResponse } from "next/server"
import { clearSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    await clearSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
