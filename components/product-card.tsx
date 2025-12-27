"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProductCardProps {
  id: number
  name: string
  price: number | string
  imageUrl: string
  stock: number
  onAddToCart: (id: number) => void
}

export function ProductCard({ id, name, price, imageUrl, stock, onAddToCart }: ProductCardProps) {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price

  return (
    <Card className="overflow-hidden card-hover group">
      <CardContent className="p-0">
        <div className="relative h-48 w-full bg-muted overflow-hidden">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {stock <= 3 && stock > 0 && <Badge className="absolute top-2 right-2 bg-accent">Only {stock} left</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 p-4">
        <div className="flex-1 w-full">
          <h3 className="font-semibold text-sm truncate text-balance">{name}</h3>
          <p className="text-lg font-bold text-primary mt-2">${numPrice.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">{stock > 0 ? `${stock} in stock` : "Out of stock"}</p>
        </div>
        <Button onClick={() => onAddToCart(id)} disabled={stock === 0} className="w-full">
          {stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  )
}
