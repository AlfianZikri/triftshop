"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { ProductCard } from "@/components/product-card"
import { CartSidebar } from "@/components/cart-sidebar"
import { Button } from "@/components/ui/button"
import { ShoppingCart, LogOut, LayoutDashboard, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

interface Product {
  id: number
  name: string
  price: number
  description: string
  category: string
  image_url: string
  stock: number
}

interface Session {
  userId: number
  email: string
  fullName: string
}

function HomeContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, searchTerm, selectedCategory])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const stored = localStorage.getItem("thriftshop_session")
        if (stored) {
          setSession(JSON.parse(stored))
        }
      }
    } catch (error) {
      // Not logged in
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const handleAuthSuccess = async () => {
    const response = await fetch("/api/orders")
    if (response.ok) {
      const email = localStorage.getItem("thriftshop_email")
      if (email) {
        setSession({
          userId: Number.parseInt(localStorage.getItem("thriftshop_userId") || "0"),
          email,
          fullName: localStorage.getItem("thriftshop_fullName") || "",
        })
      }
    }
    setAuthMode(null)
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setSession(null)
      localStorage.removeItem("thriftshop_session")
      localStorage.removeItem("thriftshop_email")
      localStorage.removeItem("thriftshop_userId")
      localStorage.removeItem("thriftshop_fullName")
      toast({
        title: "Success",
        description: "Logged out successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = (productId: number) => {
    if (!session) {
      setAuthMode("login")
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
      })
      return
    }

    const product = products.find((p) => p.id === productId)
    if (!product) return

    const currentCart = localStorage.getItem("thriftshop_cart")
    const cart = currentCart ? JSON.parse(currentCart) : []

    const existingItem = cart.find((item: any) => item.productId === productId)
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({
        productId,
        productName: product.name,
        quantity: 1,
        price: product.price,
      })
    }

    localStorage.setItem("thriftshop_cart", JSON.stringify(cart))
    setCartOpen(true)

    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  if (authMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <div className="text-center space-y-4">
          <div className="mb-6">
            <h1 className="text-primary mb-2">ThriftShop</h1>
            <p className="text-muted-foreground">Vintage & Sustainable Fashion</p>
          </div>
          <AuthForm type={authMode} onSuccess={handleAuthSuccess} />
          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {authMode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              T
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">ThriftShop</h1>
              <p className="text-xs text-muted-foreground">Sustainable Fashion</p>
            </div>
          </div>

          {session && (
            <div className="hidden md:block flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-4">
            {session && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="gap-2 hidden sm:flex"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hidden sm:flex">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}

            <Button
              variant={cartOpen ? "default" : "outline"}
              size="icon"
              onClick={() => setCartOpen(!cartOpen)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>

            {!session && (
              <Button size="sm" onClick={() => setAuthMode("login")}>
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!session ? (
          <div className="hero-gradient rounded-lg py-20 text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Welcome to ThriftShop</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-lg mx-auto leading-relaxed">
              Discover unique vintage pieces and sustainable fashion from our carefully curated collection. Every item
              tells a story.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => setAuthMode("login")}>
                Sign In
              </Button>
              <Button size="lg" variant="outline" onClick={() => setAuthMode("register")}>
                Create Account
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Welcome back, {session.fullName.split(" ")[0]}!</h2>
              <p className="text-muted-foreground">Explore our curated vintage collection</p>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Items
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.image_url}
                    stock={product.stock}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}
