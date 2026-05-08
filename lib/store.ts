import { mkdir, readFile, writeFile } from "fs/promises"
import path from "path"

export interface ProductRecord {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface UserRecord {
  id: number
  email: string
  password_hash: string
  full_name: string
  created_at: string
  updated_at: string
}

interface OrderItemRecord {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  created_at: string
}

interface OrderRecord {
  id: number
  user_id: number
  status: string
  total_price: number
  created_at: string
  updated_at: string
}

interface StoreData {
  users: UserRecord[]
  products: ProductRecord[]
  orders: OrderRecord[]
  order_items: OrderItemRecord[]
  counters: {
    users: number
    products: number
    orders: number
    order_items: number
  }
}

const dbPath = path.join(process.cwd(), "data", "db.json")

const now = () => new Date().toISOString()

const initialData: StoreData = {
  users: [
    {
      id: 1,
      email: "admin@thriftshop.test",
      password_hash: "$2b$10$hXdhNmabTMed2HUBjd8zr..BKr8Wis6YNOsPGjEcvb52kKbjlWi4S",
      full_name: "Admin User",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  products: [
    {
      id: 1,
      name: "Vintage Denim Jacket",
      description: "Classic 90s blue denim jacket in excellent condition",
      price: 45,
      category: "Jackets",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 8,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Retro Band T-Shirt",
      description: "Worn-in band tee from the 80s era",
      price: 25,
      category: "Tops",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 12,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 3,
      name: "Leather Belt",
      description: "Brown leather belt with brass buckle",
      price: 18,
      category: "Accessories",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 15,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 4,
      name: "Vintage Plaid Shirt",
      description: "Cozy flannel shirt perfect for fall",
      price: 22,
      category: "Tops",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 10,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 5,
      name: "Corduroy Pants",
      description: "Corduroy pants with a comfortable vintage fit",
      price: 35,
      category: "Bottoms",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 7,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 6,
      name: "Wool Sweater",
      description: "Soft wool sweater from the 70s",
      price: 30,
      category: "Tops",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 5,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 7,
      name: "Canvas Backpack",
      description: "Durable canvas backpack with leather straps",
      price: 50,
      category: "Bags",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 6,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: 8,
      name: "Vintage Boots",
      description: "Black leather boots in timeless style",
      price: 65,
      category: "Shoes",
      image_url: "/placeholder.svg?height=300&width=300",
      stock: 4,
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
  ],
  orders: [],
  order_items: [],
  counters: {
    users: 2,
    products: 9,
    orders: 1,
    order_items: 1,
  },
}

async function readStore(): Promise<StoreData> {
  try {
    return JSON.parse(await readFile(dbPath, "utf8"))
  } catch {
    await mkdir(path.dirname(dbPath), { recursive: true })
    await writeFile(dbPath, JSON.stringify(initialData, null, 2))
    return structuredClone(initialData)
  }
}

async function writeStore(data: StoreData) {
  await mkdir(path.dirname(dbPath), { recursive: true })
  await writeFile(dbPath, JSON.stringify(data, null, 2))
}

export async function getProducts(category?: string, includeInactive = false) {
  const data = await readStore()
  return data.products
    .filter((product) => (includeInactive || product.is_active) && (!category || product.category === category))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
}

export async function createProduct(input: {
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  stock: number
}) {
  const data = await readStore()
  const timestamp = now()
  const product: ProductRecord = {
    id: data.counters.products++,
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    image_url: input.imageUrl || "/placeholder.svg",
    stock: input.stock,
    is_active: true,
    created_at: timestamp,
    updated_at: timestamp,
  }
  data.products.push(product)
  await writeStore(data)
  return product
}

export async function updateProduct(
  id: number,
  input: {
    name: string
    description: string
    price: number
    category: string
    imageUrl?: string
    stock: number
    isActive: boolean
  },
) {
  const data = await readStore()
  const product = data.products.find((item) => item.id === id)
  if (!product) return null

  Object.assign(product, {
    name: input.name,
    description: input.description,
    price: input.price,
    category: input.category,
    image_url: input.imageUrl || "/placeholder.svg",
    stock: input.stock,
    is_active: input.isActive,
    updated_at: now(),
  })
  await writeStore(data)
  return product
}

export async function deleteProduct(id: number) {
  const data = await readStore()
  data.products = data.products.filter((product) => product.id !== id)
  await writeStore(data)
}

export async function findUserByEmail(email: string) {
  const data = await readStore()
  return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null
}

export async function createUser(email: string, passwordHash: string, fullName: string) {
  const data = await readStore()
  const timestamp = now()
  const user: UserRecord = {
    id: data.counters.users++,
    email,
    password_hash: passwordHash,
    full_name: fullName,
    created_at: timestamp,
    updated_at: timestamp,
  }
  data.users.push(user)
  await writeStore(data)
  return user
}

export async function getOrdersByUser(userId: number) {
  const data = await readStore()
  return data.orders
    .filter((order) => order.user_id === userId)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .map((order) => ({
      ...order,
      items: data.order_items
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          ...item,
          name: data.products.find((product) => product.id === item.product_id)?.name || "Deleted product",
        })),
    }))
}

export async function checkoutCart(
  userId: number,
  items: Array<{
    productId: number
    quantity: number
  }>,
) {
  const data = await readStore()
  let totalPrice = 0

  for (const item of items) {
    const product = data.products.find((entry) => entry.id === item.productId && entry.is_active)
    if (!product) {
      throw new Error(`Product ${item.productId} not found`)
    }
    if (product.stock < item.quantity) {
      throw new Error(`Only ${product.stock} ${product.name} available`)
    }
    totalPrice += product.price * item.quantity
  }

  const timestamp = now()
  const order: OrderRecord = {
    id: data.counters.orders++,
    user_id: userId,
    status: "completed",
    total_price: totalPrice,
    created_at: timestamp,
    updated_at: timestamp,
  }
  data.orders.push(order)

  for (const item of items) {
    const product = data.products.find((entry) => entry.id === item.productId)!
    product.stock -= item.quantity
    product.updated_at = timestamp
    data.order_items.push({
      id: data.counters.order_items++,
      order_id: order.id,
      product_id: product.id,
      quantity: item.quantity,
      price: product.price,
      created_at: timestamp,
    })
  }

  await writeStore(data)
  return { orderId: order.id, totalPrice }
}
