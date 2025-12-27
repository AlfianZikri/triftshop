import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let products
    if (category) {
      products = await sql`
        SELECT * FROM products 
        WHERE is_active = true AND category = ${category}
        ORDER BY created_at DESC
      `
    } else {
      products = await sql`
        SELECT * FROM products 
        WHERE is_active = true
        ORDER BY created_at DESC
      `
    }

    const formattedProducts = products.map((product: any) => ({
      ...product,
      price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
      stock: typeof product.stock === "string" ? Number.parseInt(product.stock) : product.stock,
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Fetch products error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
