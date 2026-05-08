"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Package, ReceiptText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  id: number
  product_id: number
  quantity: number
  price: number
  name: string
}

interface Order {
  id: number
  status: string
  total_price: number
  created_at: string
  items: OrderItem[]
}

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")

      if (!response.ok) {
        router.push("/")
        return
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return

    const invoice = `
THRIFTSHOP - ORDER INVOICE
==============================
Order ID: ${order.id}
Date: ${new Date(order.created_at).toLocaleDateString()}
Status: ${order.status}

Items:
${order.items.map((item) => `- ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}

Total: $${order.total_price.toFixed(2)}
==============================
    `.trim()

    const blob = new Blob([invoice], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `invoice-${orderId}.txt`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order History</h1>
            <p className="text-muted-foreground mt-1">View and manage your purchases</p>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="rounded-lg border bg-muted p-4 text-sm font-medium">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <Button onClick={() => router.push("/")}>Start Shopping</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="card-hover shop-surface">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ReceiptText className="h-5 w-5 text-primary" />
                        Order #{order.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <Badge>{order.status}</Badge>
                      <p className="text-2xl font-bold mt-2">${order.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex flex-col gap-2 rounded-lg border bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(order.id)} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download Invoice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
