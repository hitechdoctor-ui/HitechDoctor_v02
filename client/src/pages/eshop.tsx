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
import { useState, useMemo } from "react";
import { ShoppingCart, Package, Shield, Smartphone, Cable, Tag, X, SlidersHorizontal } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "@shared/schema";

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

  return (
    <div
      className="bg-card pcb-border rounded-2xl flex flex-col overflow-hidden group hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(0,210,200,0.12)] transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
        <div className="relative h-64 bg-[#07080d] overflow-hidden cursor-pointer flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={`${product.name} — HiTech Doctor`}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-2"
              loading="lazy"
            />
          ) : (
            <Smartphone className="w-12 h-12 text-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          {p.brand && (
            <Badge className="absolute top-3 left-3 bg-primary/20 border border-primary/40 text-primary text-xs">{p.brand}</Badge>
          )}
          {p.preOrder && (
            <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/25 border border-orange-500/50 text-orange-300">
              Προ-Παραγγελία
            </span>
          )}
          <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur border border-primary/30 px-2.5 py-1 rounded-lg">
            <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <Link href={product.slug ? `/eshop/${product.slug}` : "#"}>
            <h3 className="font-display font-bold text-foreground text-base leading-tight mb-1 hover:text-primary transition-colors cursor-pointer">{product.name}</h3>
          </Link>
          {/* Badges: color + storage */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {p.color && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                {p.color}
              </span>
            )}
            {p.storage && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold">{p.storage}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        <Button
          onClick={handleAdd}
          className="mt-auto h-9 text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 16px rgba(0,210,200,0.2)" }}
          data-testid={`button-addcart-${product.id}`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {p.preOrder ? "Προ-Παραγγελία — Κράτηση" : "Προσθήκη στο Καλάθι"}
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
  const [activeTab, setActiveTab] = useState<TabId>("");

  const isMobileTab = activeTab === "mobile";
  const isSubcategoryTab = activeTab === "screen-protectors" || activeTab === "cases" || activeTab === "chargers";

  const fetchCategory = isMobileTab ? "mobile" : (isSubcategoryTab ? "accessory" : undefined);
  const fetchSubcategory = isSubcategoryTab ? activeTab : undefined;

  const { data: allProducts, isLoading } = useProducts(fetchCategory, fetchSubcategory);

  // Mobile-specific filters (client-side)
  const [filterBrand, setFilterBrand] = useState("");
  const [filterColor, setFilterColor] = useState("");
  const [filterStorage, setFilterStorage] = useState("");

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

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setFilterBrand("");
    setFilterColor("");
    setFilterStorage("");
  };

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
    </div>
  );
}
