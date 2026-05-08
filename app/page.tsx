"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { ProductCard } from "@/components/product-card"
import { CartSidebar } from "@/components/cart-sidebar"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, LogOut, Search, ShoppingBag, ShoppingCart, Sparkles } from "lucide-react"
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
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    checkSession()
    fetchProducts()
    updateCartCount()
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
          const user = JSON.parse(stored)
          setSession({
            userId: user.userId || user.id,
            email: user.email,
            fullName: user.fullName,
          })
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

  const getCart = () => {
    const currentCart = localStorage.getItem("thriftshop_cart")
    return currentCart ? JSON.parse(currentCart) : []
  }

  const updateCartCount = () => {
    const cart = getCart()
    setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
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

    const cart = getCart()

    const existingItem = cart.find((item: any) => item.productId === productId)
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stock limit reached",
          description: `Only ${product.stock} ${product.name} available`,
          variant: "destructive",
        })
        return
      }
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
    updateCartCount()
    setCartOpen(true)

    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    })
  }

  const categories = Array.from(new Set(products.map((p) => p.category)))

  if (authMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="shop-surface w-full max-w-lg p-6 text-center space-y-4">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <h1 className="text-primary mb-2">ThriftShop</h1>
            <p className="text-muted-foreground">Curated vintage and sustainable fashion</p>
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
      <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <ShoppingBag className="h-5 w-5" />
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

          <div className="flex items-center gap-2 md:gap-3">
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => router.push("/dashboard")}
                  className="sm:hidden"
                  aria-label="Open dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="sm:hidden" aria-label="Logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              variant={cartOpen ? "default" : "outline"}
              size="icon"
              onClick={() => setCartOpen(!cartOpen)}
              className="relative"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
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
          <div className="hero-panel mb-12 overflow-hidden">
            <div className="grid gap-8 p-5 sm:p-6 md:grid-cols-[1.1fr_0.9fr] md:p-10">
              <div className="flex flex-col justify-center">
                <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  Fresh finds every week
                </div>
                <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">ThriftShop</h2>
                <p className="mb-6 max-w-xl text-lg leading-relaxed">
                  Discover unique vintage pieces, quality essentials, and sustainable fashion from a carefully curated
                  collection.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" onClick={() => setAuthMode("login")}>
                    Sign In
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => setAuthMode("register")}>
                    Create Account
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <p className="text-3xl font-bold text-primary">{products.length}</p>
                  <p className="text-sm text-muted-foreground">Curated items</p>
                </div>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <p className="text-3xl font-bold text-accent">{categories.length}</p>
                  <p className="text-sm text-muted-foreground">Shop categories</p>
                </div>
                <div className="col-span-2 rounded-lg border bg-card p-4 shadow-sm">
                  <p className="font-semibold">Better style, less waste.</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sign in to save a cart, checkout, and download invoices from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="shop-surface mb-6 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="mb-2 text-2xl font-bold sm:text-3xl">Welcome back, {session.fullName.split(" ")[0]}!</h2>
                  <p className="text-muted-foreground">Explore our curated vintage collection</p>
                </div>
                <div className="md:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  <div className="h-8 w-8 rounded-full border-2 border-secondary border-t-primary animate-spin" />
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
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => {
          setCartOpen(false)
          updateCartCount()
        }}
      />
    </div>
  )
}

export default function Home() {
  return <HomeContent />
}
