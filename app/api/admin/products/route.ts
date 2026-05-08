import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { createProduct, deleteProduct, getProducts, updateProduct } from "@/lib/store"

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

    const products = await getProducts(undefined, true)
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
    const cleanName = String(name || "").trim()
    const cleanCategory = String(category || "").trim()
    const cleanDescription = String(description || "").trim()
    const numericPrice = Number(price)
    const numericStock = Number(stock)

    if (!cleanName || !cleanCategory || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 })
    }

    const product = await createProduct({
      name: cleanName,
      description: cleanDescription,
      price: numericPrice,
      category: cleanCategory,
      imageUrl,
      stock: numericStock,
    })

    return NextResponse.json(product)
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
    const cleanName = String(name || "").trim()
    const cleanCategory = String(category || "").trim()
    const cleanDescription = String(description || "").trim()
    const numericPrice = Number(price)
    const numericStock = Number(stock)

    if (!id || !cleanName || !cleanCategory || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isInteger(numericStock) || numericStock < 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 })
    }

    const product = await updateProduct(Number(id), {
      name: cleanName,
      description: cleanDescription,
      price: numericPrice,
      category: cleanCategory,
      imageUrl,
      stock: numericStock,
      isActive: isActive ?? true,
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
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
    const id = Number(searchParams.get("id"))

    if (!Number.isInteger(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
    }

    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
