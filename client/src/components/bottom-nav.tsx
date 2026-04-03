import { Link, useLocation } from "wouter"
import { Home, Search, Heart, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useStore } from "@/lib/store-context"

const navItems = [
  { href: "/eshop-home", icon: Home, label: "Home" },
  { href: "/eshop", icon: Search, label: "Search" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/checkout", icon: ShoppingCart, label: "Cart" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
  const [pathname] = useLocation()
  const { cartCount, wishlist } = useStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/eshop-home" && pathname.startsWith(item.href))
            const Icon = item.icon

            const badge =
              item.label === "Cart"
                ? cartCount
                : item.label === "Wishlist"
                  ? wishlist.length
                  : 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 h-full transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-full">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-1 font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
