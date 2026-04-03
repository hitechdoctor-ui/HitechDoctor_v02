import { Link } from "wouter"
import { Search, Bell, ChevronRight, Zap, Truck, ShieldCheck, Headphones } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ProductCard } from "@/components/product-card"
import { CategoryCard } from "@/components/category-card"
import { categories, getFeaturedProducts, getNewArrivals, products } from "@/lib/products"
import { StoreProvider } from "@/lib/store-context"
import { Input } from "@/components/ui/input"

function EshopHomePage() {
  const featured = getFeaturedProducts()
  const newArrivals = getNewArrivals()
  const popularProducts = products.slice(0, 6)

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">HiTech Doctor</h1>
                <p className="text-xs text-muted-foreground">eShop</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <Bell className="w-5 h-5 text-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <Link href="/eshop">
            <div className="relative mt-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search phones, laptops, accessories..."
                className="w-full pl-11 bg-secondary border-0 rounded-xl h-12 text-sm"
                readOnly
              />
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {/* Hero Banner */}
        <section className="px-4 pt-4">
          <div
            className="relative h-44 rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, hsl(185 100% 42% / 0.9), hsl(200 90% 50%))" }}
          >
            <div className="absolute right-0 top-0 w-1/2 h-full opacity-20">
              <img
                src="https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop"
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-5 flex flex-col justify-center h-full">
              <span className="text-xs font-medium text-white/80 uppercase tracking-wide">
                New Collection
              </span>
              <h2 className="text-2xl font-bold text-white mt-2 leading-tight">
                iPhone 15 Pro
                <br />
                Series
              </h2>
              <p className="text-sm text-white/80 mt-2">Starting from $999</p>
              <Link href="/eshop?category=smartphones">
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white bg-white/20 px-4 py-2 rounded-full w-fit cursor-pointer">
                  Shop Now <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
          {/* Dots indicator */}
          <div className="flex justify-center gap-1.5 mt-3">
            <span className="w-6 h-1.5 rounded-full bg-primary" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted" />
          </div>
        </section>

        {/* Quick Features */}
        <section className="px-4 mt-5">
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 text-center">Free Ship</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-accent" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 text-center">Warranty</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 text-center">Flash Sale</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-xl border border-border">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-[10px] text-muted-foreground mt-2 text-center">Support</span>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-bold text-foreground">Categories</h2>
            <Link href="/eshop">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                See All <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Flash Sale */}
        <section className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Flash Sale</h2>
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                  23
                </span>
                <span className="text-red-500 text-[10px]">:</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                  59
                </span>
                <span className="text-red-500 text-[10px]">:</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded">
                  59
                </span>
              </div>
            </div>
            <Link href="/eshop?sale=true">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                See All <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
            {featured.map((product) => (
              <div key={product.id} className="w-40 flex-shrink-0">
                <ProductCard product={product} variant="compact" />
              </div>
            ))}
          </div>
        </section>

        {/* Popular Products */}
        <section className="mt-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-base font-bold text-foreground">Popular Products</h2>
            <Link href="/eshop">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                See All <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
            {popularProducts.map((product) => (
              <div key={product.id} className="w-40 flex-shrink-0">
                <ProductCard product={product} variant="compact" />
              </div>
            ))}
          </div>
        </section>

        {/* New Arrivals Grid */}
        <section className="mt-6 px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">New Arrivals</h2>
            <Link href="/eshop">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                See All <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

export default function EshopHome() {
  return (
    <StoreProvider>
      <EshopHomePage />
    </StoreProvider>
  )
}
