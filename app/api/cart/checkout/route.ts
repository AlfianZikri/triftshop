import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"

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

    let totalPrice = 0

    const orderResult = await sql`
      INSERT INTO orders (user_id, status, total_price) 
      VALUES (${session.userId}, 'completed', 0) 
      RETURNING id
    `

    const orderId = orderResult[0].id

    // Add order items
    for (const item of items) {
      const productResult = await sql`SELECT price FROM products WHERE id = ${item.productId}`

      if (productResult.length === 0) {
        return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 404 })
      }

      const price = Number.parseFloat(productResult[0].price)
      const itemTotal = price * item.quantity
      totalPrice += itemTotal

      await sql`
        INSERT INTO order_items (order_id, product_id, quantity, price) 
        VALUES (${orderId}, ${item.productId}, ${item.quantity}, ${price})
      `

      await sql`
        UPDATE products 
        SET stock = stock - ${item.quantity} 
        WHERE id = ${item.productId}
      `
    }

    await sql`
      UPDATE orders 
      SET total_price = ${totalPrice} 
      WHERE id = ${orderId}
    `

    return NextResponse.json({
      success: true,
      orderId,
      totalPrice,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 })
  }
}
