import { type NextRequest, NextResponse } from "next/server"
import { getProducts } from "@/lib/store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const products = await getProducts(category || undefined)

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
