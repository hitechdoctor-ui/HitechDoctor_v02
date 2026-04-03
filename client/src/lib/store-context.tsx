import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useCartStore } from "@/store/cart"

export interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice?: number
  image: string
  rating: number
  reviews: number
  category: string
  isNew?: boolean
  isFeatured?: boolean
}

interface StoreContextValue {
  // Cart
  cartCount: number
  addToCart: (product: Product) => void
  isInCart: (id: number) => boolean
  // Wishlist
  wishlist: Product[]
  addToWishlist: (product: Product) => void
  isInWishlist: (id: number) => boolean
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const cartStore = useCartStore()
  const [wishlist, setWishlist] = useState<Product[]>([])

  const cartCount = cartStore.getCartCount()

  const addToCart = useCallback(
    (product: Product) => {
      cartStore.addItem(
        {
          id: product.id,
          name: product.name,
          brand: product.brand ?? "",
          price: String(product.price),
          image: product.image,
          category: product.category ?? "",
          slug: String(product.id),
          description: null,
          stock: 99,
          isActive: true,
          supplierId: null,
          supplierSku: null,
          supplierPrice: null,
          supplierStock: null,
          supplierLastSync: null,
          createdAt: null,
          updatedAt: null,
        } as any,
        1
      )
    },
    [cartStore]
  )

  const isInCart = useCallback(
    (id: number) => cartStore.items.some((item) => item.product.id === id),
    [cartStore.items]
  )

  const addToWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id)
      if (exists) return prev.filter((p) => p.id !== product.id)
      return [...prev, product]
    })
  }, [])

  const isInWishlist = useCallback(
    (id: number) => wishlist.some((p) => p.id === id),
    [wishlist]
  )

  return (
    <StoreContext.Provider
      value={{ cartCount, addToCart, isInCart, wishlist, addToWishlist, isInWishlist }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>")
  return ctx
}
