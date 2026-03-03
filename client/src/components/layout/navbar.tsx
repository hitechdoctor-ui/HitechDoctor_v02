import { Link, useLocation } from "wouter";
import { ShoppingCart, Wrench, Package, ShieldCheck, Menu, Zap, Smartphone, ChevronRight, Hammer } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/cart-drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  SiApple, SiSamsung, SiXiaomi, SiHuawei, SiOneplus,
} from "react-icons/si";

// ── Phone brand grid for "Επισκευή Κινητών" submenu ─────────────────────────
const PHONE_BRANDS = [
  {
    name: "iPhone",
    href: "/services/episkeui-kiniton",
    icon: SiApple,
    color: "text-gray-300",
    bg: "bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20",
  },
  {
    name: "Samsung",
    href: "/services/episkeui-kiniton",
    icon: SiSamsung,
    color: "text-blue-400",
    bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20",
  },
  {
    name: "Xiaomi",
    href: "/services/episkeui-kiniton",
    icon: SiXiaomi,
    color: "text-orange-400",
    bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
  },
  {
    name: "Huawei",
    href: "/services/episkeui-kiniton",
    icon: SiHuawei,
    color: "text-red-400",
    bg: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20",
  },
  {
    name: "OnePlus",
    href: "/services/episkeui-kiniton",
    icon: SiOneplus,
    color: "text-rose-400",
    bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20",
  },
  {
    name: "Άλλη Μάρκα",
    href: "/services/episkeui-kiniton",
    icon: Smartphone,
    color: "text-primary",
    bg: "bg-primary/10 hover:bg-primary/20 border-primary/20",
  },
];

export function Navbar() {
  const [location] = useLocation();
  const cartCount = useCartStore((state) => state.getCartCount());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b-0 border-white/5 rounded-b-2xl mb-6">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">

        {/* Logo */}
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
        <nav className="hidden md:flex items-center gap-2">
          {/* Αρχική */}
          <Link
            href="/"
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-primary flex items-center gap-2 ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Wrench className="w-4 h-4" />
            Αρχική
          </Link>

          {/* Υπηρεσίες — NavigationMenu with dropdown */}
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-sm font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent px-3 py-2 flex items-center gap-2 transition-colors ${
                    isActive("/services") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Υπηρεσίες
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="w-[520px] p-4 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
                    style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,210,200,0.06)" }}>

                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/8">
                      <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <Hammer className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">Επισκευή Κινητών</p>
                        <p className="text-[10px] text-muted-foreground">Επιλέξτε τη μάρκα του κινητού σας</p>
                      </div>
                      <Link
                        href="/services/episkeui-kiniton"
                        className="ml-auto text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
                      >
                        Δες Όλες <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>

                    {/* Brand image grid 3×2 */}
                    <div className="grid grid-cols-3 gap-2">
                      {PHONE_BRANDS.map((brand) => (
                        <Link
                          key={brand.name}
                          href={brand.href}
                          data-testid={`nav-brand-${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${brand.bg}`}
                        >
                          <brand.icon className={`w-7 h-7 ${brand.color} transition-transform duration-200 group-hover:scale-110`} />
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">
                            {brand.name}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Footer link — all services */}
                    <div className="mt-3 pt-3 border-t border-white/8">
                      <Link
                        href="/services"
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors group"
                        data-testid="nav-all-services"
                      >
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            Όλες οι Υπηρεσίες
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* eShop */}
          <Link
            href="/eshop"
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-primary flex items-center gap-2 ${
              isActive("/eshop") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Package className="w-4 h-4" />
            eShop
          </Link>

          {/* Admin */}
          <Link
            href="/admin"
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-primary flex items-center gap-2 ${
              isActive("/admin") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </Link>
        </nav>

        {/* Right side */}
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
            <SheetContent side="right" className="bg-background border-white/10 overflow-y-auto">
              <nav className="flex flex-col gap-2 mt-12">
                <Link href="/" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium ${location === "/" ? "text-primary bg-primary/10" : "text-foreground"}`}>
                  <Wrench className="w-5 h-5" />
                  Αρχική
                </Link>

                {/* Mobile: Υπηρεσίες with expandable brands */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${
                      isActive("/services") ? "text-primary bg-primary/10" : "text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                    Υπηρεσίες
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${mobileServicesOpen ? "rotate-90" : ""}`} />
                  </button>

                  {mobileServicesOpen && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      <p className="text-xs font-bold text-muted-foreground px-3 py-1 uppercase tracking-wider">Επισκευή Κινητών</p>
                      {PHONE_BRANDS.map((brand) => (
                        <Link
                          key={brand.name}
                          href={brand.href}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-foreground"
                        >
                          <brand.icon className={`w-4 h-4 ${brand.color}`} />
                          {brand.name}
                        </Link>
                      ))}
                      <Link href="/services" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 text-sm text-primary font-medium">
                        <Zap className="w-4 h-4" />
                        Όλες οι Υπηρεσίες
                      </Link>
                    </div>
                  )}
                </div>

                <Link href="/eshop" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium ${isActive("/eshop") ? "text-primary bg-primary/10" : "text-foreground"}`}>
                  <Package className="w-5 h-5" />
                  eShop
                </Link>

                <Link href="/admin" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium ${isActive("/admin") ? "text-primary bg-primary/10" : "text-foreground"}`}>
                  <ShieldCheck className="w-5 h-5" />
                  Admin
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
