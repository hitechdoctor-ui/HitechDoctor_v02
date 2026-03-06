import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ReviewsSection } from "@/components/reviews-section";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import { useSearch } from "wouter";
import { ShoppingCart, Package, Shield, Smartphone, Cable, Tag, X, SlidersHorizontal, HardDrive, Palette, SlidersVertical, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ── Color name → hex mapping ────────────────────────────────────────────────
const COLOR_HEX: Record<string, string> = {
  black: "#d1d5db",        // light gray so visible on dark bg
  "jet black": "#d1d5db",
  "awesome black": "#d1d5db",
  white: "#f9fafb",
  "awesome white": "#f9fafb",
  silver: "#e2e8f0",
  titanium: "#b0b8c4",
  gray: "#9ca3af",
  grey: "#9ca3af",
  blue: "#60a5fa",
  "deep blue": "#3b82f6",
  ultramarine: "#818cf8",
  teal: "#2dd4bf",
  green: "#4ade80",
  mint: "#6ee7b7",
  sage: "#a3e635",
  purple: "#c084fc",
  lavender: "#ddd6fe",
  pink: "#f472b6",
  red: "#f87171",
  orange: "#fb923c",
  "cosmic orange": "#fb923c",
  brown: "#d97706",
  gold: "#fbbf24",
  yellow: "#facc15",
};

function getColorHex(colorName?: string): string {
  if (!colorName) return "#94a3b8";
  return COLOR_HEX[colorName.toLowerCase()] ?? "#94a3b8";
}

// ── Brand → dark gradient background ────────────────────────────────────────
const BRAND_BG: Record<string, string> = {
  Samsung: "linear-gradient(145deg, #0a1628 0%, #0f2044 50%, #0a1628 100%)",
  Apple:   "linear-gradient(145deg, #0d0d0d 0%, #1a1a1f 50%, #0d0d0d 100%)",
  Redmi:   "linear-gradient(145deg, #1a0a0a 0%, #2a0f0f 50%, #1a0808 100%)",
  POCO:    "linear-gradient(145deg, #0f0a1a 0%, #1e0f2e 50%, #0f0a1a 100%)",
};

function getBrandBg(brand?: string): string {
  return (brand && BRAND_BG[brand]) ?? "linear-gradient(145deg, #07080d 0%, #111318 50%, #07080d 100%)";
}

function extractModelName(name: string, brand?: string, storage?: string, color?: string): string {
  let model = name;
  if (brand) model = model.replace(new RegExp("^" + brand + "\\s*", "i"), "");
  if (storage) model = model.replace(new RegExp("\\s*" + storage + "\\s*"), " ");
  if (color) model = model.replace(new RegExp("\\s*" + color + "\\s*$"), "");
  return model.trim();
}

// ── ColoredPhoneIcon: big Smartphone icon in product color + glow ────────────
function ColoredPhoneIcon({ color, brand }: { color?: string; brand?: string }) {
  const hex = getColorHex(color);
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 relative">
      {/* glow circle behind icon */}
      <div
        className="absolute w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ background: hex }}
      />
      <Smartphone
        className="relative z-10 drop-shadow-2xl"
        style={{ color: hex, width: 88, height: 88, filter: `drop-shadow(0 0 18px ${hex}88)` }}
      />
      {color && (
        <span
          className="relative z-10 text-[11px] font-semibold tracking-widest uppercase opacity-80"
          style={{ color: hex }}
        >
          {color}
        </span>
      )}
    </div>
  );
}

// ── iPhone models list (8 → 17, all variants) ──────────────────────────────
const IPHONE_MODELS = [
  "iPhone 17 Pro Max", "iPhone 17 Pro", "iPhone 17 Plus", "iPhone 17",
  "iPhone 16 Pro Max", "iPhone 16 Pro", "iPhone 16 Plus", "iPhone 16",
  "iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15 Plus", "iPhone 15",
  "iPhone 14 Pro Max", "iPhone 14 Pro", "iPhone 14 Plus", "iPhone 14",
  "iPhone 13 Pro Max", "iPhone 13 Pro", "iPhone 13", "iPhone 13 Mini",
  "iPhone 12 Pro Max", "iPhone 12 Pro", "iPhone 12", "iPhone 12 Mini",
  "iPhone 11 Pro Max", "iPhone 11 Pro", "iPhone 11",
  "iPhone XS Max", "iPhone XS", "iPhone XR",
  "iPhone X",
  "iPhone 8 Plus", "iPhone 8",
];

// ── Category tabs ──────────────────────────────────────────────────────────
type TabId = "mobile" | "screen-protectors" | "cases" | "chargers" | "";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: "", label: "Όλα", icon: Package },
  { id: "mobile", label: "Κινητά", icon: Smartphone },
  { id: "screen-protectors", label: "Τζάμια Προστασίας", icon: Shield },
  { id: "cases", label: "Θήκες", icon: Smartphone },
  { id: "chargers", label: "Φορτιστές & Καλώδια", icon: Cable },
];

const SUBCATEGORY_LABELS: Record<string, string> = {
  "screen-protectors": "Τζάμι Προστασίας",
  cases: "Θήκη",
  chargers: "Φορτιστής / Καλώδιο",
  mobile: "Κινητό",
};

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(price));

// ── Mobile product card ─────────────────────────────────────────────────────
function MobileCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const p = product as any;

  const handleAdd = () => {
    addItem(product);
    toast({ title: "Προστέθηκε στο καλάθι", description: product.name, duration: 3000 });
  };

  const modelName = extractModelName(product.name, p.brand, p.storage, p.color);
  const brandBg = getBrandBg(p.brand);
  const colorHex = getColorHex(p.color);

  return (
    <div
      className="bg-card pcb-border rounded-2xl flex flex-col overflow-hidden group transition-all duration-300 cursor-pointer hover:-translate-y-2"
      style={{ "--card-glow": colorHex } as React.CSSProperties}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 40px ${colorHex}44`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
      data-testid={`card-product-${product.id}`}
    >
      {/* ── Image area ── */}
      <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
        <div className="relative h-64 overflow-hidden" style={{ background: brandBg }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.name} — HiTech Doctor`}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
              style={{ objectPosition: "center 20%" }}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out">
              <ColoredPhoneIcon color={p.color} brand={p.brand} />
            </div>
          )}
          {/* subtle gradient at bottom so price badge is readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

          {/* brand badge */}
          {p.brand && (
            <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-2.5">
              {p.brand}
            </Badge>
          )}

          {/* pre-order badge */}
          {p.preOrder && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/25 border border-orange-500/50 text-orange-300">
              Προ-Παραγγελία
            </span>
          )}

          {/* price in image */}
          <div className="absolute bottom-3 right-3 bg-primary px-3 py-1 rounded-lg shadow-lg">
            <span className="text-black font-bold text-sm">{formatPrice(product.price)}</span>
          </div>
        </div>
      </Link>

      {/* ── Card body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          {/* Model name as main title */}
          <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
            <h3 className="font-display font-bold text-foreground text-[15px] leading-snug mb-0.5 hover:text-primary transition-colors">
              {modelName}
            </h3>
          </Link>

          {/* storage + color tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {p.storage && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[11px] font-semibold">
                <HardDrive className="w-3 h-3" />
                {p.storage}
              </span>
            )}
            {p.color && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/15 text-muted-foreground text-[11px]">
                <Palette className="w-3 h-3" />
                {p.color}
              </span>
            )}
          </div>
        </div>

        {/* Add to cart button */}
        <Button
          onClick={handleAdd}
          className="mt-auto h-9 text-sm font-semibold w-full"
          style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 46%))", boxShadow: "0 0 18px rgba(0,210,200,0.22)" }}
          data-testid={`button-addcart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {p.preOrder ? "Κράτηση — Προ-Παραγγελία" : "Προσθήκη στο Καλάθι"}
        </Button>
      </div>
    </div>
  );
}

// ── Screen-protector card (requires model selection) ───────────────────────
function ScreenProtectorCard({ product }: { product: Product }) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const handleAdd = () => {
    if (!selectedModel) return;
    addItem(product, 1, selectedModel);
    toast({ title: "Προστέθηκε στο καλάθι", description: `${product.name} — ${selectedModel}`, duration: 3000 });
  };

  return (
    <div
      className="bg-card pcb-border rounded-2xl flex flex-col overflow-hidden group hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(0,210,200,0.12)] transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
        <div className="relative h-64 bg-white overflow-hidden cursor-pointer flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.name} — Τζάμι Προστασίας iPhone — HiTech Doctor`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-3"
              loading="lazy"
            />
          ) : (
            <Shield className="w-14 h-14 text-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {product.subcategory && (
            <Badge className="absolute top-3 left-3 bg-primary/20 border border-primary/40 text-primary text-xs">
              {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur border border-primary/40 px-2.5 py-1 rounded-lg">
            <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
            <h3 className="font-display font-bold text-foreground text-base leading-tight mb-0.5 hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Επιλέξτε μοντέλο iPhone:</p>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full h-9 text-sm border-primary/20 bg-background/50" data-testid={`select-model-${product.id}`}>
              <SelectValue placeholder="— Μοντέλο —" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {IPHONE_MODELS.map((m) => (
                <SelectItem key={m} value={m} data-testid={`option-model-${m.replace(/\s+/g, "-")}`}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleAdd}
          disabled={!selectedModel}
          className="mt-auto h-9 text-sm font-semibold"
          style={selectedModel ? { background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 16px rgba(0,210,200,0.25)" } : undefined}
          data-testid={`button-addcart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {selectedModel ? "Προσθήκη στο Καλάθι" : "Επιλέξτε μοντέλο"}
        </Button>
      </div>
    </div>
  );
}

// ── Regular product card ───────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const handleAdd = () => {
    addItem(product);
    toast({ title: "Προστέθηκε στο καλάθι", description: `${product.name} προστέθηκε επιτυχώς!`, duration: 3000 });
  };

  return (
    <div
      className="bg-card pcb-border rounded-2xl flex flex-col overflow-hidden group hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(0,210,200,0.12)] transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
        <div className="relative h-64 bg-white overflow-hidden cursor-pointer flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.name} — ${product.subcategory ? SUBCATEGORY_LABELS[product.subcategory] : ""} — HiTech Doctor`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-3"
              loading="lazy"
            />
          ) : (
            <Package className="w-14 h-14 text-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          {product.subcategory && (
            <Badge className="absolute top-3 left-3 bg-primary/20 border border-primary/40 text-primary text-xs">
              {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
            </Badge>
          )}
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur border border-primary/40 px-2.5 py-1 rounded-lg">
            <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
            <h3 className="font-display font-bold text-foreground text-base leading-tight mb-0.5 hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
          </Link>
          <p className="text-xs text-muted-foreground line-clamp-3">{product.description}</p>
        </div>
        {product.compatibleModels && product.compatibleModels.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">Συμβατό με:</span>{" "}
            {product.compatibleModels.slice(0, 3).join(", ")}
            {product.compatibleModels.length > 3 && ` +${product.compatibleModels.length - 3} ακόμα`}
          </p>
        )}
        <Button
          onClick={handleAdd}
          className="h-9 text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 16px rgba(0,210,200,0.2)" }}
          data-testid={`button-addcart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Προσθήκη στο Καλάθι
        </Button>
      </div>
    </div>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-card pcb-border rounded-2xl overflow-hidden">
      <Skeleton className="h-64 w-full bg-white/5" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-white/5" />
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-2/3 bg-white/5" />
        <Skeleton className="h-9 w-full bg-white/5 mt-2" />
      </div>
    </div>
  );
}

// ── Mobile filter bar ──────────────────────────────────────────────────────
function MobileFilterBar({
  products,
  brand, setBrand,
  color, setColor,
  storage, setStorage,
}: {
  products: Product[];
  brand: string; setBrand: (v: string) => void;
  color: string; setColor: (v: string) => void;
  storage: string; setStorage: (v: string) => void;
}) {
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { const b = (p as any).brand; if (b) set.add(b); });
    return Array.from(set).sort();
  }, [products]);

  const colors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => { const c = (p as any).color; if (c) set.add(c); });
    return Array.from(set).sort();
  }, [products]);

  const storages = useMemo(() => {
    const order = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
    const set = new Set<string>();
    products.forEach((p) => { const s = (p as any).storage; if (s) set.add(s); });
    return order.filter((s) => set.has(s));
  }, [products]);

  const hasActiveFilter = brand || color || storage;

  if (brands.length === 0 && colors.length === 0 && storages.length === 0) return null;

  return (
    <div className="mb-6 bg-card/60 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Φίλτρα Αναζήτησης</span>
        {hasActiveFilter && (
          <button
            onClick={() => { setBrand(""); setColor(""); setStorage(""); }}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400 transition-colors"
            data-testid="btn-clear-filters"
          >
            <X className="w-3 h-3" />
            Καθαρισμός φίλτρων
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {/* Brand filter */}
        {brands.length > 0 && (
          <div className="space-y-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Μάρκα</label>
            <Select value={brand || "all"} onValueChange={(v) => setBrand(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 text-xs bg-background border-white/10" data-testid="filter-brand">
                <SelectValue placeholder="Όλες" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες οι μάρκες</SelectItem>
                {brands.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Color filter */}
        {colors.length > 0 && (
          <div className="space-y-1 min-w-[140px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Χρώμα</label>
            <Select value={color || "all"} onValueChange={(v) => setColor(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 text-xs bg-background border-white/10" data-testid="filter-color">
                <SelectValue placeholder="Όλα" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλα τα χρώματα</SelectItem>
                {colors.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Storage filter */}
        {storages.length > 0 && (
          <div className="space-y-1 min-w-[130px]">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Μνήμη</label>
            <Select value={storage || "all"} onValueChange={(v) => setStorage(v === "all" ? "" : v)}>
              <SelectTrigger className="h-8 text-xs bg-background border-white/10" data-testid="filter-storage">
                <SelectValue placeholder="Όλες" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες οι μνήμες</SelectItem>
                {storages.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Active filter chips */}
      {hasActiveFilter && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/8">
          {brand && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
              {brand}
              <button onClick={() => setBrand("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {color && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
              {color}
              <button onClick={() => setColor("")}><X className="w-3 h-3" /></button>
            </span>
          )}
          {storage && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold">
              {storage}
              <button onClick={() => setStorage("")}><X className="w-3 h-3" /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main eShop page ────────────────────────────────────────────────────────
export default function EShop() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tabParam = (params.get("tab") ?? "") as TabId;
  const brandParam = params.get("brand") ?? "";

  const [activeTab, setActiveTab] = useState<TabId>(tabParam);
  const [filterBrand, setFilterBrand] = useState(brandParam);
  const [filterColor, setFilterColor] = useState("");
  const [filterStorage, setFilterStorage] = useState("");

  // Sync URL params → state when user navigates from navbar mega-menu
  useEffect(() => {
    const p = new URLSearchParams(search);
    const t = (p.get("tab") ?? "") as TabId;
    const b = p.get("brand") ?? "";
    setActiveTab(t);
    setFilterBrand(b);
    setFilterColor("");
    setFilterStorage("");
  }, [search]);

  const isMobileTab = activeTab === "mobile";
  const isSubcategoryTab = activeTab === "screen-protectors" || activeTab === "cases" || activeTab === "chargers";

  const fetchCategory = isMobileTab ? "mobile" : (isSubcategoryTab ? "accessory" : undefined);
  const fetchSubcategory = isSubcategoryTab ? activeTab : undefined;

  const { data: allProducts, isLoading } = useProducts(fetchCategory, fetchSubcategory);

  const products = useMemo(() => {
    if (!allProducts) return [];
    if (!isMobileTab) return allProducts;
    return allProducts.filter((p) => {
      const pp = p as any;
      if (filterBrand && pp.brand !== filterBrand) return false;
      if (filterColor && pp.color !== filterColor) return false;
      if (filterStorage && pp.storage !== filterStorage) return false;
      return true;
    });
  }, [allProducts, isMobileTab, filterBrand, filterColor, filterStorage]);

  const isScreenProtector = (p: Product) => p.subcategory === "screen-protectors";

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setFilterBrand("");
    setFilterColor("");
    setFilterStorage("");
  };

  // Filter drawer values derived from allProducts
  const drawerBrands = useMemo(() => {
    if (!allProducts) return [];
    const set = new Set<string>();
    allProducts.forEach((p) => { const b = (p as any).brand; if (b) set.add(b); });
    return Array.from(set).sort();
  }, [allProducts]);

  const drawerColors = useMemo(() => {
    if (!allProducts) return [];
    const set = new Set<string>();
    allProducts.forEach((p) => { const c = (p as any).color; if (c) set.add(c); });
    return Array.from(set).sort();
  }, [allProducts]);

  const drawerStorages = useMemo(() => {
    if (!allProducts) return [];
    const order = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB"];
    const set = new Set<string>();
    allProducts.forEach((p) => { const s = (p as any).storage; if (s) set.add(s); });
    return order.filter((s) => set.has(s));
  }, [allProducts]);

  const activeFiltersCount = [filterBrand, filterColor, filterStorage].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="eShop — Αξεσουάρ & Κινητά iPhone"
        description="Κινητά τηλέφωνα, τζάμια προστασίας iPhone, θήκες και φορτιστές. Φίλτρα ανά μάρκα, χρώμα και μνήμη. Δωρεάν αποστολή από €30."
        url="https://hitechdoctor.com/eshop"
      />
      <Helmet>
        <meta name="keywords" content="κινητά τηλέφωνα, τζάμι προστασίας iPhone, tempered glass iPhone, θήκη iPhone, φορτιστής iPhone" />
        <link rel="canonical" href="https://hitechdoctor.com/eshop" />
      </Helmet>

      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.07) 0%, transparent 70%)" }} />

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* ── Hero ── */}
        <div className="mb-10">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
            <Tag className="w-3 h-3 mr-1.5" />
            Online Κατάστημα
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-2">
            {isMobileTab ? (
              <>Κινητά <span className="gradient-text">Τηλέφωνα</span></>
            ) : (
              <>Αξεσουάρ <span className="gradient-text">iPhone</span></>
            )}
          </h1>
          <p className="text-muted-foreground max-w-xl">
            {isMobileTab
              ? "Βρείτε κινητά τηλέφωνα Apple, Samsung, Xiaomi και άλλες μάρκες. Φιλτράρετε ανά μάρκα, χρώμα και μνήμη."
              : "Τζάμια προστασίας, θήκες και φορτιστές για κάθε μοντέλο iPhone από 8 έως 17."}
          </p>
        </div>

        {/* ── Category tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8 p-2 bg-card/50 rounded-xl border border-border w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === id
                  ? "bg-primary text-primary-foreground shadow-[0_0_14px_rgba(0,210,200,0.35)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
              data-testid={`tab-${id || "all"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Mobile filters ── */}
        {isMobileTab && !isLoading && allProducts && allProducts.length > 0 && (
          <MobileFilterBar
            products={allProducts}
            brand={filterBrand} setBrand={setFilterBrand}
            color={filterColor} setColor={setFilterColor}
            storage={filterStorage} setStorage={setFilterStorage}
          />
        )}

        {/* ── Screen protector info banner ── */}
        {activeTab === "screen-protectors" && (
          <div className="mb-6 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <Shield className="w-5 h-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Επιλέξτε τύπο τζαμιού & μοντέλο iPhone</p>
              <p className="text-xs text-muted-foreground">Κάθε τζάμι εφαρμόζει σε συγκεκριμένο μοντέλο. Επιλέξτε το σωστό πριν το προσθέσετε στο καλάθι.</p>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              <span className="px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">Απλό — €8</span>
              <span className="px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">Privacy — €15</span>
              <span className="px-3 py-1 rounded-full bg-card border border-border text-xs text-muted-foreground">Κεραμικό — €20</span>
            </div>
          </div>
        )}

        {/* ── Product grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <ProductSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-card/50 pcb-border rounded-3xl">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold mb-2">Δεν βρέθηκαν προϊόντα</h3>
            <p className="text-muted-foreground text-sm">
              {filterBrand || filterColor || filterStorage
                ? "Δοκιμάστε να αλλάξετε ή να καθαρίσετε τα φίλτρα."
                : "Δοκιμάστε να αλλάξετε κατηγορία."}
            </p>
            {(filterBrand || filterColor || filterStorage) && (
              <button
                onClick={() => { setFilterBrand(""); setFilterColor(""); setFilterStorage(""); }}
                className="mt-4 px-4 py-2 rounded-xl bg-primary/15 border border-primary/25 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                Καθαρισμός φίλτρων
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((product) =>
              product.category === "mobile"
                ? <MobileCard key={product.id} product={product} />
                : isScreenProtector(product)
                  ? <ScreenProtectorCard key={product.id} product={product} />
                  : <ProductCard key={product.id} product={product} />
            )}
          </div>
        )}
        <ReviewsSection />
      </main>
      <Footer />

      {/* ── Floating Filter Button (only on Κινητά tab) ── */}
      {isMobileTab && (
        <button
          onClick={() => setFilterDrawerOpen(true)}
          aria-label="Φίλτρα αναζήτησης"
          data-testid="button-filter-drawer"
          className="fixed right-4 bottom-[4.75rem] z-[154] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 group"
          style={{
            background: activeFiltersCount > 0
              ? "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 46%))"
              : "linear-gradient(135deg, #1f2937, #374151)",
            boxShadow: activeFiltersCount > 0
              ? "0 4px 20px rgba(0,210,200,0.4)"
              : "0 4px 16px rgba(0,0,0,0.5)",
          }}
        >
          <SlidersVertical className="w-5 h-5 text-white" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-black text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {/* Tooltip */}
          <span className="pointer-events-none absolute right-14 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl">
            Φίλτρα
            <span className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900" />
          </span>
        </button>
      )}

      {/* ── Filter Drawer Sheet ── */}
      <Sheet open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen}>
        <SheetContent side="right" className="w-full sm:w-[380px] bg-card border-l border-white/10 overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-foreground">
              <SlidersVertical className="w-5 h-5 text-primary" />
              Φίλτρα Αναζήτησης
            </SheetTitle>
          </SheetHeader>

          {/* Clear all */}
          {activeFiltersCount > 0 && (
            <button
              onClick={() => { setFilterBrand(""); setFilterColor(""); setFilterStorage(""); }}
              className="w-full mb-5 py-2 px-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Καθαρισμός {activeFiltersCount} φίλτρων
            </button>
          )}

          {/* Brand */}
          {drawerBrands.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Μάρκα</p>
              <div className="flex flex-wrap gap-2">
                {drawerBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setFilterBrand(filterBrand === b ? "" : b)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      filterBrand === b
                        ? "bg-primary text-black border-primary shadow-[0_0_12px_rgba(0,210,200,0.35)]"
                        : "bg-white/5 border-white/15 text-foreground hover:border-primary/50 hover:bg-primary/10"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Storage */}
          {drawerStorages.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" /> Αποθηκευτικός Χώρος
              </p>
              <div className="flex flex-wrap gap-2">
                {drawerStorages.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStorage(filterStorage === s ? "" : s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-200 ${
                      filterStorage === s
                        ? "bg-primary text-black border-primary"
                        : "bg-white/5 border-white/15 text-foreground hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {drawerColors.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" /> Χρώμα
              </p>
              <div className="flex flex-wrap gap-2">
                {drawerColors.map((c) => {
                  const hex = COLOR_HEX[c.toLowerCase()] ?? "#94a3b8";
                  return (
                    <button
                      key={c}
                      onClick={() => setFilterColor(filterColor === c ? "" : c)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                        filterColor === c
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/15 bg-white/5 text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-white/20 shrink-0" style={{ background: hex }} />
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="text-primary font-bold text-lg">{products.length}</span>{" "}
              προϊόντα βρέθηκαν
            </p>
            <button
              onClick={() => setFilterDrawerOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm text-black transition-all"
              style={{ background: "linear-gradient(135deg, hsl(185 100% 36%), hsl(200 90% 46%))", boxShadow: "0 0 18px rgba(0,210,200,0.25)" }}
            >
              Εμφάνιση {products.length} αποτελεσμάτων
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
