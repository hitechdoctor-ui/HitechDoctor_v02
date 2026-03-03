import { Link, useLocation } from "wouter";
import { ShoppingCart, Wrench, Package, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const cartCount = useCartStore((state) => state.getCartCount());
  const [isCartOpen, setIsCartOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Αρχική", icon: Wrench },
    { href: "/eshop", label: "eShop", icon: Package },
    { href: "/admin", label: "Admin", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-0 border-white/5 rounded-b-2xl mb-6">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-colors">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold leading-none">HiTech</h1>
            <p className="text-xs text-primary font-semibold tracking-wider">DOCTOR</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="relative border-white/10 hover:border-primary/50 bg-white/5 hover:bg-primary/10 transition-all"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span>Καλάθι</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-white/10">
              <nav className="flex flex-col gap-6 mt-12">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={`text-lg font-medium flex items-center gap-3 ${
                      location === link.href ? "text-primary" : "text-foreground"
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
