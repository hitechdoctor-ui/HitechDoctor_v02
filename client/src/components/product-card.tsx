import { Link } from "wouter"
import { Heart, Star, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore, type Product } from "@/lib/store-context"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "horizontal"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const { addToWishlist, isInWishlist, addToCart, isInCart } = useStore()
  const inWishlist = isInWishlist(product.id)
  const inCart = isInCart(product.id)

  if (variant === "horizontal") {
    return (
      <Link href={`/eshop/${product.id}`}>
        <div className="flex gap-3 p-3 bg-card rounded-xl border border-border cursor-pointer">
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.originalPrice && (
              <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold bg-destructive text-destructive-foreground rounded">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <h3 className="font-medium text-sm text-foreground line-clamp-2 mt-0.5">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviews})
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="font-bold text-foreground">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  if (variant === "compact") {
    return (
      <Link href={`/eshop/${product.id}`}>
        <div className="block group cursor-pointer">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <button
              onClick={(e) => {
                e.preventDefault()
                addToWishlist(product)
              }}
              className={cn(
                "absolute top-2 right-2 p-1.5 rounded-full transition-colors",
                inWishlist
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/80 text-foreground backdrop-blur-sm"
              )}
            >
              <Heart className={cn("w-3.5 h-3.5", inWishlist && "fill-current")} />
            </button>
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-sm text-foreground line-clamp-1">{product.name}</h3>
            <p className="text-sm font-bold text-foreground mt-0.5">${product.price}</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/eshop/${product.id}`}>
      <div className="block group cursor-pointer">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="relative aspect-square bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {product.originalPrice && (
              <span className="absolute top-3 left-3 px-2 py-1 text-xs font-semibold bg-destructive text-destructive-foreground rounded-full">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
            <button
              onClick={(e) => {
                e.preventDefault()
                addToWishlist(product)
              }}
              className={cn(
                "absolute top-3 right-3 p-2 rounded-full transition-all",
                inWishlist
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/90 text-foreground backdrop-blur-sm hover:bg-card"
              )}
            >
              <Heart className={cn("w-4 h-4", inWishlist && "fill-current")} />
            </button>
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <h3 className="font-medium text-foreground line-clamp-2 mt-0.5 text-sm">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground">
                {product.rating} ({product.reviews})
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-foreground">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <Button
                size="icon"
                variant={inCart ? "default" : "secondary"}
                className="h-8 w-8 rounded-full"
                onClick={(e) => {
                  e.preventDefault()
                  addToCart(product)
                }}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
