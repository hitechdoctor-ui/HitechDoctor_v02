import { Link, useLocation } from "wouter";
import {
  ShoppingCart, Wrench, Package, ShieldCheck, Menu, Zap,
  Smartphone, ChevronRight, Hammer, Laptop, Monitor, Watch,
  Gamepad2, Tablet, LogIn, MapPin, Shield, Cable, Tag, Info,
  MessageCircle, HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { SiApple, SiSamsung, SiXiaomi, SiHuawei, SiOneplus } from "react-icons/si";
import { GlobalSearch } from "@/components/global-search";

// ── Category meta: subcategory (or "mobile") → display info ──────────────────
const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; tab: string }> = {
  mobile:            { label: "Κινητά Τηλέφωνα",     icon: Smartphone, color: "text-primary",      bg: "bg-primary/10 hover:bg-primary/20 border-primary/20",         tab: "mobile" },
  "screen-protectors":{ label: "Τζάμια Προστασίας",  icon: Shield,     color: "text-sky-400",      bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20",         tab: "screen-protectors" },
  cases:             { label: "Θήκες Κινητών",        icon: Package,    color: "text-violet-400",   bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20", tab: "cases" },
  chargers:          { label: "Φορτιστές & Καλώδια",  icon: Cable,      color: "text-orange-400",   bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20", tab: "chargers" },
  laptop:            { label: "Μεταχειρισμένα Laptop",    icon: Laptop,   color: "text-emerald-400",  bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20", tab: "laptop" },
  desktop:           { label: "Μεταχειρισμένοι Υπολογιστές", icon: Monitor, color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20", tab: "desktop" },
};

// ── eShop brands (static — brands don't change structurally) ──────────────────
const ESHOP_BRANDS = [
  { name: "Apple",        href: "/eshop?tab=mobile&brand=Apple",      icon: SiApple,     color: "text-gray-300" },
  { name: "Samsung",      href: "/eshop?tab=mobile&brand=Samsung",    icon: SiSamsung,   color: "text-blue-400" },
  { name: "Redmi/Xiaomi", href: "/eshop?tab=mobile&brand=Redmi",      icon: SiXiaomi,    color: "text-orange-400" },
  { name: "POCO",         href: "/eshop?tab=mobile&brand=POCO",       icon: SiXiaomi,    color: "text-yellow-400" },
  { name: "Lenovo",       href: "/eshop?tab=laptop&brand=Lenovo",     icon: Laptop,      color: "text-red-400" },
  { name: "Microsoft",    href: "/eshop?tab=laptop&brand=Microsoft",  icon: Monitor,     color: "text-sky-400" },
  { name: "DELL",         href: "/eshop?tab=desktop&brand=DELL",      icon: Monitor,     color: "text-blue-400" },
  { name: "HP",           href: "/eshop?tab=desktop&brand=HP",        icon: Monitor,     color: "text-indigo-400" },
];

// ── Phone brands (services menu) ──────────────────────────────────────────────
const PHONE_BRANDS = [
  { name: "iPhone",     href: "/services/episkeui-iphone",  icon: SiApple,   color: "text-gray-300", bg: "bg-gray-500/10 hover:bg-gray-500/20 border-gray-500/20" },
  { name: "Samsung",    href: "/services/episkeui-samsung", icon: SiSamsung, color: "text-blue-400", bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20" },
  { name: "Xiaomi",     href: "/services/episkeui-xiaomi",  icon: SiXiaomi,  color: "text-orange-400", bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20" },
  { name: "Huawei",     href: "/services/episkeui-huawei",  icon: SiHuawei,  color: "text-red-400", bg: "bg-red-500/10 hover:bg-red-500/20 border-red-500/20" },
  { name: "OnePlus",    href: "/services/episkeui-oneplus",  icon: SiOneplus, color: "text-rose-400", bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20" },
  { name: "Άλλη Μάρκα", href: "/services/episkeui-kiniton", icon: Smartphone, color: "text-primary", bg: "bg-primary/10 hover:bg-primary/20 border-primary/20" },
];

// ── Other repair services ──────────────────────────────────────────────────────
const OTHER_SERVICES = [
  { name: "Επισκευή Tablet",      href: "/services", icon: Tablet,   color: "text-sky-400" },
  { name: "Επισκευή PlayStation", href: "/services", icon: Gamepad2, color: "text-blue-400" },
  { name: "Επισκευή Laptop",      href: "/services/episkeui-laptop", icon: Laptop,   color: "text-emerald-400" },
  { name: "Επισκευή Υπολογιστή",  href: "/services", icon: Monitor,  color: "text-violet-400" },
  { name: "Επισκευή Apple Watch", href: "/services", icon: Watch,    color: "text-gray-300" },
];

// ── Info quick links ───────────────────────────────────────────────────────────
const INFO_LINKS = [
  { name: "Blog",          href: "/blog",           icon: Wrench,        color: "text-emerald-400" },
  { name: "Επικοινωνία",  href: "/epikoinonia",    icon: MapPin,        color: "text-sky-400" },
  { name: "FAQ",           href: "/faq",            icon: HelpCircle,    color: "text-violet-400" },
  { name: "Υποστήριξη",   href: "/epikoinonia",    icon: MessageCircle, color: "text-orange-400" },
];

// ── Hook: dynamic product categories ──────────────────────────────────────────
function useProductCategories() {
  return useQuery<{ category: string; subcategory: string | null; count: number }[]>({
    queryKey: ["/api/products/categories"],
    staleTime: 5 * 60 * 1000,
  });
}

// ── Build dynamic eshop category cards from API data ─────────────────────────
function buildEshopCategories(rows: { category: string; subcategory: string | null; count: number }[]) {
  const seen = new Set<string>();
  const result: { label: string; href: string; icon: React.ElementType; color: string; bg: string }[] = [];

  rows.forEach((row) => {
    const key = row.subcategory ?? row.category;
    if (seen.has(key)) return;
    seen.add(key);
    const meta = CATEGORY_META[key] ?? CATEGORY_META[row.category];
    if (!meta) return;
    result.push({
      label: meta.label,
      href: `/eshop?tab=${meta.tab}`,
      icon: meta.icon,
      color: meta.color,
      bg: meta.bg,
    });
  });

  return result;
}

// ── Shared dropdown wrapper ───────────────────────────────────────────────────
const DROPDOWN_STYLE = {
  boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,210,200,0.06)",
};

export function Navbar() {
  const [location] = useLocation();
  const cartCount = useCartStore((state) => state.getCartCount());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileEshopOpen, setMobileEshopOpen] = useState(false);
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);

  const { data: categoryRows = [] } = useProductCategories();
  const dynamicCategories = buildEshopCategories(categoryRows);
  const fallbackCategories = [
    { label: "Κινητά Τηλέφωνα",   href: "/eshop?tab=mobile",            icon: Smartphone, color: "text-primary",    bg: "bg-primary/10 hover:bg-primary/20 border-primary/20" },
    { label: "Τζάμια Προστασίας", href: "/eshop?tab=screen-protectors", icon: Shield,     color: "text-sky-400",    bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/20" },
    { label: "Θήκες Κινητών",     href: "/eshop?tab=cases",             icon: Package,    color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20" },
    { label: "Φορτιστές & Καλώδια",href: "/eshop?tab=chargers",         icon: Cable,      color: "text-orange-400", bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20" },
  ];
  const eshopCategories = dynamicCategories.length > 0 ? dynamicCategories : fallbackCategories;

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
        <nav className="hidden md:flex items-center gap-1">
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

          {/* Υπηρεσίες + eShop + Info — shared NavigationMenu */}
          <NavigationMenu>
            <NavigationMenuList>

              {/* ─── Υπηρεσίες ─── */}
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
                  <div className="w-[680px] p-4 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl" style={DROPDOWN_STYLE}>
                    <div className="flex gap-4">
                      {/* Left: Επισκευή Κινητών */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/8">
                          <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <Hammer className="w-3 h-3 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">Επισκευή Κινητών</p>
                            <p className="text-[10px] text-muted-foreground">Επιλέξτε μάρκα</p>
                          </div>
                          <Link href="/services/episkeui-kiniton" className="ml-auto shrink-0 text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
                            Δες Όλες <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                          {PHONE_BRANDS.map((brand) => (
                            <Link
                              key={brand.name}
                              href={brand.href}
                              data-testid={`nav-brand-${brand.name.toLowerCase().replace(/\s+/g, "-")}`}
                              className={`group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 ${brand.bg}`}
                            >
                              <brand.icon className={`w-6 h-6 ${brand.color} transition-transform duration-200 group-hover:scale-110`} />
                              <span className="text-[10px] font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">{brand.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="w-px bg-white/8 self-stretch" />

                      {/* Right: Άλλες Υπηρεσίες */}
                      <div className="w-[200px] shrink-0">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/8">
                          <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <Zap className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-xs font-bold text-foreground">Άλλες Υπηρεσίες</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {OTHER_SERVICES.map((svc) => (
                            <Link key={svc.name} href={svc.href} data-testid={`nav-service-${svc.name.toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                              <svc.icon className={`w-4 h-4 shrink-0 ${svc.color} group-hover:scale-110 transition-transform`} />
                              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{svc.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/8">
                      <Link href="/services" className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors group" data-testid="nav-all-services">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Όλες οι Υπηρεσίες</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ─── eShop (dynamic categories) ─── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-sm font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent px-3 py-2 flex items-center gap-2 transition-colors ${
                    isActive("/eshop") ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  eShop
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="w-[620px] p-4 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl" style={DROPDOWN_STYLE}>
                    <div className="flex gap-4">
                      {/* Left: Κατηγορίες */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/8">
                          <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <Tag className="w-3 h-3 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">Κατηγορίες</p>
                            <p className="text-[10px] text-muted-foreground">Επιλέξτε κατηγορία</p>
                          </div>
                          <Link href="/eshop" className="ml-auto shrink-0 text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors">
                            Δες Όλα <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {eshopCategories.map((cat) => (
                            <Link
                              key={cat.label}
                              href={cat.href}
                              data-testid={`nav-eshop-cat-${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
                              className={`group flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${cat.bg}`}
                            >
                              <cat.icon className={`w-6 h-6 ${cat.color} transition-transform duration-200 group-hover:scale-110`} />
                              <span className="text-[10px] font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">{cat.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="w-px bg-white/8 self-stretch" />

                      {/* Right: Μάρκες */}
                      <div className="w-[180px] shrink-0">
                        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-white/8">
                          <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                            <Smartphone className="w-3 h-3 text-primary" />
                          </div>
                          <p className="text-xs font-bold text-foreground">Δημοφιλείς Μάρκες</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {ESHOP_BRANDS.map((brand) => (
                            <Link key={brand.name} href={brand.href} data-testid={`nav-eshop-brand-${brand.name.toLowerCase().replace(/[\s/]+/g, "-")}`} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                              <brand.icon className={`w-4 h-4 shrink-0 ${brand.color} group-hover:scale-110 transition-transform`} />
                              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{brand.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/8">
                      <Link href="/eshop" className="flex items-center justify-between w-full px-3 py-2 rounded-xl hover:bg-primary/10 transition-colors group" data-testid="nav-eshop-all">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Όλο το eShop</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* ─── Info ─── */}
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={`text-sm font-medium bg-transparent hover:bg-transparent data-[state=open]:bg-transparent px-3 py-2 flex items-center gap-2 transition-colors ${
                    isActive("/sxetika-me-mas") || isActive("/epikoinonia") || isActive("/faq") || isActive("/blog")
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <Info className="w-4 h-4" />
                  Info
                </NavigationMenuTrigger>

                <NavigationMenuContent>
                  <div className="w-[420px] p-4 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl" style={DROPDOWN_STYLE}>

                    {/* Σχετικά με εμάς block */}
                    <Link
                      href="/sxetika-me-mas"
                      data-testid="nav-info-about"
                      className="group flex gap-3 p-3.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all mb-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Σχετικά με εμάς</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                          Επαγγελματική επισκευή κινητών στην Αθήνα. Εγγύηση εργασίας 6 μήνες.
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 self-center" />
                    </Link>

                    {/* Quick links */}
                    <div className="grid grid-cols-2 gap-1 mb-4">
                      {INFO_LINKS.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          data-testid={`nav-info-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          <link.icon className={`w-4 h-4 shrink-0 ${link.color} group-hover:scale-110 transition-transform`} />
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{link.name}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Σύνδεση button */}
                    <div className="pt-3 border-t border-white/8">
                      <Link href="/admin" data-testid="nav-info-login">
                        <Button
                          className="w-full bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 hover:border-primary/50 transition-all gap-2 font-semibold"
                          variant="ghost"
                        >
                          <LogIn className="w-4 h-4" />
                          Σύνδεση
                        </Button>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>

        </nav>

        {/* Right side — search + cart + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Desktop search */}
          <GlobalSearch className="hidden md:block w-56 lg:w-72" />

          {/* Cart — icon only, primary color */}
          <button
            className="relative p-2 rounded-xl border border-white/10 hover:border-primary/50 bg-white/5 hover:bg-primary/10 transition-all"
            onClick={() => setIsCartOpen(true)}
            aria-label="Καλάθι αγορών"
            data-testid="btn-cart"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-white/10 overflow-y-auto">
              {/* Mobile search */}
              <div className="mt-12 mb-4">
                <GlobalSearch placeholder="Αναζήτηση..." />
              </div>
              <nav className="flex flex-col gap-2">
                <Link href="/" className={`flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium ${location === "/" ? "text-primary bg-primary/10" : "text-foreground"}`}>
                  <Wrench className="w-5 h-5" />
                  Αρχική
                </Link>

                {/* Mobile: Υπηρεσίες */}
                <div>
                  <button
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive("/services") ? "text-primary bg-primary/10" : "text-foreground hover:bg-white/5"}`}
                  >
                    <Zap className="w-5 h-5" />
                    Υπηρεσίες
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${mobileServicesOpen ? "rotate-90" : ""}`} />
                  </button>
                  {mobileServicesOpen && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      <p className="text-[10px] font-bold text-muted-foreground px-3 py-1 uppercase tracking-wider">Επισκευή Κινητών</p>
                      {PHONE_BRANDS.map((brand) => (
                        <Link key={brand.name} href={brand.href} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-foreground">
                          <brand.icon className={`w-4 h-4 ${brand.color}`} />
                          {brand.name}
                        </Link>
                      ))}
                      <div className="mt-1 pt-1 border-t border-white/8">
                        <p className="text-[10px] font-bold text-muted-foreground px-3 py-1 uppercase tracking-wider">Άλλες Υπηρεσίες</p>
                        {OTHER_SERVICES.map((svc) => (
                          <Link key={svc.name} href={svc.href} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-foreground">
                            <svc.icon className={`w-4 h-4 ${svc.color}`} />
                            {svc.name}
                          </Link>
                        ))}
                      </div>
                      <Link href="/services" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 text-sm text-primary font-medium mt-1">
                        <Zap className="w-4 h-4" />
                        Όλες οι Υπηρεσίες
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile: eShop */}
                <div>
                  <button
                    onClick={() => setMobileEshopOpen((v) => !v)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors ${isActive("/eshop") ? "text-primary bg-primary/10" : "text-foreground hover:bg-white/5"}`}
                  >
                    <Package className="w-5 h-5" />
                    eShop
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${mobileEshopOpen ? "rotate-90" : ""}`} />
                  </button>
                  {mobileEshopOpen && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      {eshopCategories.map((cat) => (
                        <Link key={cat.label} href={cat.href} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-foreground">
                          <cat.icon className={`w-4 h-4 ${cat.color}`} />
                          {cat.label}
                        </Link>
                      ))}
                      <Link href="/eshop" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 text-sm text-primary font-medium mt-1">
                        <Package className="w-4 h-4" />
                        Όλο το eShop
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile: Info */}
                <div>
                  <button
                    onClick={() => setMobileInfoOpen((v) => !v)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-colors text-foreground hover:bg-white/5"
                  >
                    <Info className="w-5 h-5" />
                    Info
                    <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${mobileInfoOpen ? "rotate-90" : ""}`} />
                  </button>
                  {mobileInfoOpen && (
                    <div className="ml-8 mt-1 flex flex-col gap-1">
                      <Link href="/sxetika-me-mas" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-foreground">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        Σχετικά με εμάς
                      </Link>
                      {INFO_LINKS.map((link) => (
                        <Link key={link.name} href={link.href} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-sm text-foreground">
                          <link.icon className={`w-4 h-4 ${link.color}`} />
                          {link.name}
                        </Link>
                      ))}
                      <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/10 text-sm text-primary font-semibold mt-1 border border-primary/20 bg-primary/5" data-testid="btn-login-mobile">
                        <LogIn className="w-4 h-4" />
                        Σύνδεση
                      </Link>
                    </div>
                  )}
                </div>

              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <CartDrawer open={isCartOpen} onOpenChange={setIsCartOpen} />
    </header>
  );
}
