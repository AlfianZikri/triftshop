import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { checkoutCart } from "@/lib/store"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    for (const item of items) {
      if (!Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 })
      }
    }

    const { orderId, totalPrice } = await checkoutCart(session.userId, items)

    return NextResponse.json({
      success: true,
      orderId,
      totalPrice,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 400 })
  }
}
