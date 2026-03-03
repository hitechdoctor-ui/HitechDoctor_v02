import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  ShoppingCart, CheckCircle2, ChevronRight, Shield,
  Clock, Star, ArrowLeft, Package, Truck,
} from "lucide-react";
import type { Product } from "@shared/schema";

// ── iPhone models list ─────────────────────────────────────────────────────
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

const SUBCATEGORY_LABELS: Record<string, string> = {
  "screen-protectors": "Τζάμι Προστασίας",
  cases: "Θήκη iPhone",
  chargers: "Φορτιστής / Καλώδιο",
};

const formatPrice = (p: string | number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(p));

// ── Perks shown below product ──────────────────────────────────────────────
const PERKS = [
  { icon: Truck, label: "Αποστολή σε 1-2 εργάσιμες" },
  { icon: Shield, label: "Εγγύηση 12 μήνες" },
  { icon: Clock, label: "Άμεση διαθεσιμότητα" },
  { icon: Star, label: "Αξιολόγηση πελατών 4.9/5" },
];

// ── Feature bullets per subcategory ───────────────────────────────────────
const FEATURE_BULLETS: Record<string, string[]> = {
  "screen-protectors": [
    "Σκληρότητα 9H — δεν γρατσουνίζεται",
    "Αντιχαρακτική επιφάνεια oleophobic",
    "Εύκολη εφαρμογή χωρίς φυσαλίδες",
    "Πλήρης ευαισθησία αφής 100%",
    "Ultra-thin 0.33mm πάχος",
    "Συμβατό με όλες τις θήκες",
  ],
  cases: [
    "Προστασία 360° από πτώσεις & γρατσουνιές",
    "Ακριβείς κοψίματα για όλα τα κουμπιά & θύρες",
    "Δεν κιτρινίζει / δεν αλλοιώνεται",
    "Λεπτή κατασκευή — δεν προσθέτει όγκο",
    "Εύκολη τοποθέτηση & αφαίρεση",
  ],
  chargers: [
    "Πιστοποίηση MFi — Made for iPhone",
    "Ταχεία φόρτιση Power Delivery 20W",
    "Ενισχυμένα άκρα για μέγιστη αντοχή",
    "Προστασία υπερφόρτισης & υπερθέρμανσης",
    "Συμβατό με iPhone 8 έως iPhone 17",
  ],
};

// ── Build JSON-LD ──────────────────────────────────────────────────────────
function buildJsonLd(product: Product) {
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.imageUrl ? [product.imageUrl] : [],
    "brand": {
      "@type": "Brand",
      "name": "HiTech Doctor",
    },
    "offers": {
      "@type": "Offer",
      "url": `https://hitechdoctor.com/eshop/${product.slug}`,
      "priceCurrency": "EUR",
      "price": Number(product.price).toFixed(2),
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "HiTech Doctor",
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "47",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Αρχική", "item": "https://hitechdoctor.com/" },
      { "@type": "ListItem", "position": 2, "name": "eShop", "item": "https://hitechdoctor.com/eshop" },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": `https://hitechdoctor.com/eshop/${product.slug}` },
    ],
  };

  return [productSchema, breadcrumb];
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedModel, setSelectedModel] = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const product = products?.find((p) => p.slug === slug);
  const needsModel = product?.subcategory === "screen-protectors";
  const features = product?.subcategory ? FEATURE_BULLETS[product.subcategory] ?? [] : [];
  const jsonLdData = product ? buildJsonLd(product) : null;

  const handleAddToCart = () => {
    if (!product) return;
    if (needsModel && !selectedModel) return;
    addItem(product, 1, needsModel ? selectedModel : undefined);
    toast({
      title: "Προστέθηκε στο καλάθι!",
      description: needsModel
        ? `${product.name} — ${selectedModel}`
        : product.name,
      duration: 3000,
    });
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background circuit-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl bg-white/5" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4 bg-white/5" />
              <Skeleton className="h-12 w-1/2 bg-white/5" />
              <Skeleton className="h-4 w-full bg-white/5" />
              <Skeleton className="h-4 w-5/6 bg-white/5" />
              <Skeleton className="h-12 w-48 bg-white/5 mt-6" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── 404 ─────────────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-background circuit-bg flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Package className="w-20 h-20 text-primary/20 mb-6" />
          <h1 className="text-3xl font-display font-bold mb-3">Προϊόν δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-8">Το προϊόν που ψάχνεις δεν υπάρχει ή έχει αφαιρεθεί.</p>
          <Link href="/eshop">
            <Button data-testid="button-back-eshop">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Επιστροφή στο eShop
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const canonicalUrl = `https://hitechdoctor.com/eshop/${product.slug}`;
  const subcatLabel = product.subcategory ? SUBCATEGORY_LABELS[product.subcategory] : product.category;
  const metaTitle = `${product.name} | HiTech Doctor — Αξεσουάρ iPhone Θεσσαλονίκη`;
  const metaDesc = `${product.description} Τιμή: ${formatPrice(product.price)}. Άμεση αποστολή. HiTech Doctor.`;

  return (
    <div className="min-h-screen bg-background circuit-bg">
      {/* ── SEO Head ── */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDesc.slice(0, 160)} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc.slice(0, 160)} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        {product.imageUrl && <meta property="og:image" content={product.imageUrl} />}
        <meta property="product:price:amount" content={Number(product.price).toFixed(2)} />
        <meta property="product:price:currency" content="EUR" />
        <meta
          name="keywords"
          content={`${product.name}, ${subcatLabel}, iPhone αξεσουάρ, αγορά online, Θεσσαλονίκη, HiTech Doctor`}
        />
        {jsonLdData?.map((schema, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      {/* Ambient glows */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.07) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* ── Breadcrumb ── */}
        <div className="container mx-auto px-4 pt-4 pb-0">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/eshop" className="hover:text-primary transition-colors">eShop</Link>
            <ChevronRight className="w-3 h-3" />
            {subcatLabel && (
              <>
                <Link href="/eshop" className="hover:text-primary transition-colors">{subcatLabel}</Link>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-primary font-medium line-clamp-1">{product.name}</span>
          </nav>
        </div>

        {/* ── Main product section ── */}
        <section className="container mx-auto px-4 pt-8 pb-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* ── Left: Image ── */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-card pcb-border relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} — ${subcatLabel} για iPhone — HiTech Doctor Θεσσαλονίκη`}
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                    width="800"
                    height="800"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-24 h-24 text-primary/20" />
                  </div>
                )}
                {/* Price badge */}
                <div
                  className="absolute top-4 right-4 px-4 py-2 rounded-xl border border-primary/40 backdrop-blur-sm"
                  style={{ background: "rgba(0,210,200,0.15)" }}
                >
                  <span className="text-primary font-extrabold text-xl">{formatPrice(product.price)}</span>
                </div>
              </div>

              {/* Perks row below image */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {PERKS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 bg-card/50 border border-border rounded-xl px-3 py-2.5">
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Info ── */}
            <div className="flex flex-col gap-6">
              {/* Category badge */}
              {subcatLabel && (
                <Badge
                  variant="outline"
                  className="w-fit border-primary/30 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold"
                >
                  {subcatLabel}
                </Badge>
              )}

              {/* H1 */}
              <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">4.9 (47 αξιολογήσεις)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25 font-medium">
                  Σε απόθεμα
                </span>
              </div>

              {/* Price */}
              <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-300">
                {formatPrice(product.price)}
              </p>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              {/* H2: Model selector (screen protectors only) */}
              {needsModel && (
                <div>
                  <h2 className="text-base font-display font-bold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Επιλέξτε Μοντέλο iPhone
                  </h2>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger
                      className="w-full h-11 border-primary/25 bg-card text-sm"
                      data-testid="select-model-detail"
                    >
                      <SelectValue placeholder="— Επιλέξτε μοντέλο —" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {IPHONE_MODELS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedModel && (
                    <p className="text-xs text-amber-400 mt-1.5 flex items-center gap-1">
                      <span>⚠</span> Επιλέξτε μοντέλο για να προσθέσετε στο καλάθι
                    </p>
                  )}
                </div>
              )}

              {/* Add to cart */}
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={needsModel && !selectedModel}
                className="h-12 text-base font-bold"
                style={
                  !(needsModel && !selectedModel)
                    ? {
                        background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                        boxShadow: "0 0 24px rgba(0,210,200,0.3)",
                      }
                    : undefined
                }
                data-testid="button-add-to-cart"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {needsModel && !selectedModel ? "Επιλέξτε μοντέλο πρώτα" : "Προσθήκη στο Καλάθι"}
              </Button>

              {/* H2: Features */}
              {features.length > 0 && (
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Χαρακτηριστικά Προϊόντος
                  </h2>
                  <ul className="space-y-2.5">
                    {features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* H2: Compatible models (screen protectors) */}
              {product.compatibleModels && product.compatibleModels.length > 0 && (
                <div className="bg-card/50 border border-border rounded-2xl p-5">
                  <h2 className="text-base font-display font-bold text-foreground mb-3">
                    Συμβατά Μοντέλα iPhone
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {product.compatibleModels.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-2.5 py-1 rounded-full bg-background border border-border text-muted-foreground"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
