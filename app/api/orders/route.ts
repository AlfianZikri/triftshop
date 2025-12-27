import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await sql`
      SELECT * FROM orders 
      WHERE user_id = ${session.userId} 
      ORDER BY created_at DESC
    `

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await sql`
          SELECT oi.*, p.name 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ${order.id}
        `
        return {
          ...order,
          total_price: Number.parseFloat(order.total_price),
          items: items.map((item: any) => ({
            ...item,
            price: Number.parseFloat(item.price),
          })),
        }
      }),
    )

    return NextResponse.json(ordersWithItems)
  } catch (error) {
    console.error("Fetch orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
