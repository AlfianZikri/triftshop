import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { getOrdersByUser } from "@/lib/store"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await getOrdersByUser(session.userId)
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Fetch orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
