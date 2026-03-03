import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ShoppingCart, Package, Shield, ChevronDown, Smartphone, Cable, Tag } from "lucide-react";
import type { Product } from "@shared/schema";

// ── iPhone models list (8 → 17, all variants) ──────────────────────────────
const IPHONE_MODELS = [
  "iPhone 8", "iPhone 8 Plus",
  "iPhone X",
  "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 Mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
  "iPhone 17", "iPhone 17 Plus", "iPhone 17 Pro", "iPhone 17 Pro Max",
];

// ── Category tabs ──────────────────────────────────────────────────────────
const TABS = [
  { id: "", label: "Όλα", icon: Package },
  { id: "screen-protectors", label: "Τζάμια Προστασίας", icon: Shield },
  { id: "cases", label: "Θήκες", icon: Smartphone },
  { id: "chargers", label: "Φορτιστές & Καλώδια", icon: Cable },
];

const SUBCATEGORY_LABELS: Record<string, string> = {
  "screen-protectors": "Τζάμι Προστασίας",
  cases: "Θήκη",
  chargers: "Φορτιστής / Καλώδιο",
};

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(price));

// ── Screen-protector card (requires model selection) ───────────────────────
function ScreenProtectorCard({ product }: { product: Product }) {
  const [selectedModel, setSelectedModel] = useState<string>("");
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const handleAdd = () => {
    if (!selectedModel) return;
    addItem(product, 1, selectedModel);
    toast({
      title: "Προστέθηκε στο καλάθι",
      description: `${product.name} — ${selectedModel}`,
      duration: 3000,
    });
  };

  return (
    <div
      className="bg-card pcb-border rounded-2xl flex flex-col overflow-hidden group hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(0,210,200,0.12)] transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-black/40 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shield className="w-12 h-12 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        {product.subcategory && (
          <Badge className="absolute top-3 left-3 bg-primary/20 border border-primary/40 text-primary text-xs">
            {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur border border-primary/30 px-2.5 py-1 rounded-lg">
          <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-display font-bold text-foreground text-base leading-tight mb-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        {/* Model selector */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 font-medium">Επιλέξτε μοντέλο iPhone:</p>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger
              className="w-full h-9 text-sm border-primary/20 bg-background/50"
              data-testid={`select-model-${product.id}`}
            >
              <SelectValue placeholder="— Μοντέλο —" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {IPHONE_MODELS.map((m) => (
                <SelectItem key={m} value={m} data-testid={`option-model-${m.replace(/\s+/g, "-")}`}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add to cart */}
        <Button
          onClick={handleAdd}
          disabled={!selectedModel}
          className="mt-auto h-9 text-sm font-semibold"
          style={
            selectedModel
              ? {
                  background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                  boxShadow: "0 0 16px rgba(0,210,200,0.25)",
                }
              : undefined
          }
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
    toast({
      title: "Προστέθηκε στο καλάθι",
      description: `${product.name} προστέθηκε επιτυχώς!`,
      duration: 3000,
    });
  };

  return (
    <div
      className="bg-card pcb-border rounded-2xl flex flex-col overflow-hidden group hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(0,210,200,0.12)] transition-all duration-300"
      data-testid={`card-product-${product.id}`}
    >
      {/* Image */}
      <div className="relative h-48 bg-black/40 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        {product.subcategory && (
          <Badge className="absolute top-3 left-3 bg-primary/20 border border-primary/40 text-primary text-xs">
            {SUBCATEGORY_LABELS[product.subcategory] ?? product.subcategory}
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur border border-primary/30 px-2.5 py-1 rounded-lg">
          <span className="text-primary font-bold text-sm">{formatPrice(product.price)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className="font-display font-bold text-foreground text-base leading-tight mb-0.5">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3">{product.description}</p>
        </div>

        {/* Compatible models note */}
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
          style={{
            background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
            boxShadow: "0 0 16px rgba(0,210,200,0.2)",
          }}
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
      <Skeleton className="h-48 w-full bg-white/5" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4 bg-white/5" />
        <Skeleton className="h-3 w-full bg-white/5" />
        <Skeleton className="h-3 w-2/3 bg-white/5" />
        <Skeleton className="h-9 w-full bg-white/5 mt-2" />
      </div>
    </div>
  );
}

// ── Main eShop page ────────────────────────────────────────────────────────
export default function EShop() {
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");

  const { data: products, isLoading } = useProducts(
    activeSubcategory ? "accessory" : undefined,
    activeSubcategory || undefined
  );

  const isScreenProtector = (p: Product) => p.subcategory === "screen-protectors";

  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="eShop — Αξεσουάρ & Προστατευτικά iPhone"
        description="Τζάμια προστασίας iPhone (Απλό €8, Κεραμικό €20, Privacy €15), θήκες και φορτιστές για όλα τα μοντέλα iPhone 8 έως 17. Δωρεάν αποστολή από €30."
        url="https://hitechdoctor.com/eshop"
      />
      <Helmet>
        <meta
          name="keywords"
          content="τζάμι προστασίας iPhone, tempered glass iPhone, privacy glass iPhone, θήκη iPhone, φορτιστής iPhone, καλώδιο Lightning, καλώδιο USB-C iPhone"
        />
        <link rel="canonical" href="https://hitechdoctor.com/eshop" />
      </Helmet>

      {/* Ambient glow */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.07) 0%, transparent 70%)" }} />

      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* ── Hero ── */}
        <div className="mb-10">
          <Badge
            variant="outline"
            className="mb-4 border-primary/30 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold"
          >
            <Tag className="w-3 h-3 mr-1.5" />
            Online Κατάστημα
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-display font-extrabold text-foreground mb-2">
            Αξεσουάρ{" "}
            <span className="gradient-text">iPhone</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Τζάμια προστασίας, θήκες και φορτιστές για κάθε μοντέλο iPhone από 8 έως 17.
          </p>
        </div>

        {/* ── Category tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8 p-2 bg-card/50 rounded-xl border border-border w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSubcategory(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeSubcategory === id
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

        {/* ── Screen protector info banner ── */}
        {activeSubcategory === "screen-protectors" && (
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
        ) : products?.length === 0 ? (
          <div className="text-center py-24 bg-card/50 pcb-border rounded-3xl">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold mb-2">Δεν βρέθηκαν προϊόντα</h3>
            <p className="text-muted-foreground text-sm">Δοκιμάστε να αλλάξετε κατηγορία.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products?.map((product) =>
              isScreenProtector(product) ? (
                <ScreenProtectorCard key={product.id} product={product} />
              ) : (
                <ProductCard key={product.id} product={product} />
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
