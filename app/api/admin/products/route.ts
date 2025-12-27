import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"

// Check if user is admin (simplified - in production use proper roles)
async function isAdmin(userId: number) {
  // For demo, we'll consider user ID 1 as admin
  return userId === 1
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !(await isAdmin(session.userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await sql`SELECT * FROM products ORDER BY created_at DESC`
    return NextResponse.json(products)
  } catch (error) {
    console.error("Fetch products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !(await isAdmin(session.userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, category, imageUrl, stock } = await request.json()

    const result = await sql`
      INSERT INTO products (name, description, price, category, image_url, stock) 
      VALUES (${name}, ${description}, ${price}, ${category}, ${imageUrl}, ${stock}) 
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !(await isAdmin(session.userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, description, price, category, imageUrl, stock, isActive } = await request.json()

    const result = await sql`
      UPDATE products 
      SET name = ${name}, 
          description = ${description}, 
          price = ${price}, 
          category = ${category}, 
          image_url = ${imageUrl}, 
          stock = ${stock}, 
          is_active = ${isActive}, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} 
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || !(await isAdmin(session.userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    await sql`DELETE FROM products WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
