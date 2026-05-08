"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  productId: number
  productName: string
  quantity: number
  price: number
}

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isOpen) return

    const savedCart = localStorage.getItem("thriftshop_cart")
    setCart(savedCart ? JSON.parse(savedCart) : [])
  }, [isOpen])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("thriftshop_cart", JSON.stringify(cart))
  }, [cart])

  const removeItem = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      setCart(cart.map((item) => (item.productId === productId ? { ...item, quantity: Math.min(quantity, 99) } : item)))
    }
  }

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
        return
      }

      setCart([])
      localStorage.setItem("thriftshop_cart", JSON.stringify([]))
      toast({
        title: "Success",
        description: `Order placed! Order ID: ${data.orderId}`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Checkout failed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-foreground z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full bg-background z-50 shadow-lg overflow-y-auto sm:max-w-sm">
        <Card className="border-0 rounded-none">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-3 top-3"
              aria-label="Close cart"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="rounded-lg border bg-muted p-6 text-center">
                <ShoppingCart className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-semibold">Your cart is empty</p>
                <p className="mt-1 text-sm text-muted-foreground">Add a vintage find to get started.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.productId} className="rounded-lg border bg-card p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded-md border bg-background p-1">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                            aria-label={`Decrease ${item.productName}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted"
                            aria-label={`Increase ${item.productName}`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="flex h-9 w-9 items-center justify-center rounded-md border text-destructive hover:bg-muted"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button onClick={handleCheckout} disabled={loading} className="w-full">
                    {loading ? "Processing..." : "Checkout"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
