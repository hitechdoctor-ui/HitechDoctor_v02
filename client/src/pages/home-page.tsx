import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import HomeBelowFold from "./home-below-fold";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useEffect } from "react";
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Wifi,
  HardDrive,
  Battery,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Wrench,
  ScanLine,
  Cpu,
  Bot,
  Droplets,
  Camera,
  ChevronRight,
  ChevronLeft,
  Package,
  ShoppingCart,
  Headphones,
} from "lucide-react";
import { Link } from "wouter";
import { requestOpenRepairChat } from "@/lib/repair-chat-events";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const homeServices = [
  { icon: Smartphone, title: "Επισκευή Κινητών", href: "/services/episkeui-kiniton" },
  { icon: Tablet, title: "Επισκευή Tablet", href: "/services#episkeui-tablet" },
  { icon: Laptop, title: "Επισκευή Laptop", href: "/services#episkeui-laptop" },
  { icon: Monitor, title: "Επισκευή Desktop", href: "/services#episkeui-desktop" },
  { icon: Cpu, title: "IT Support", href: "/services#it-support" },
  { icon: Wifi, title: "Δίκτυα & Wi-Fi", href: "/services#dixtia-wifi" },
  { icon: HardDrive, title: "Ανάκτηση Δεδομένων", href: "/services#anaktisi-dedomenon" },
  { icon: Battery, title: "Αλλαγή Μπαταρίας", href: "/services#allagi-batarias" },
  { icon: Shield, title: "Αντιική Προστασία", href: "/services#prostasia-iosmon" },
  { icon: ScanLine, title: "Διαγνωστικός Έλεγχος", href: "/services#diagnostiko" },
];

const highlights = [
  { icon: Clock, label: "Express επισκευή", desc: "Αποτέλεσμα σε λίγες ώρες" },
  { icon: Shield, label: "Γραπτή εγγύηση", desc: "Σε κάθε εργασία μας" },
  { icon: CheckCircle2, label: "Γνήσια ανταλλακτικά", desc: "Πιστοποιημένα υλικά" },
  { icon: Zap, label: "Δωρεάν αξιολόγηση", desc: "Χωρίς υποχρεώσεις" },
];

const quickRepairDevices = [
  { icon: Smartphone, label: "iPhone", href: "/services/episkeui-iphone", color: "text-sky-400", bg: "bg-sky-400/10 border-sky-400/25" },
  { icon: Smartphone, label: "Samsung", href: "/services/episkeui-samsung", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/25" },
  { icon: Laptop, label: "Laptop", href: "/services/episkeui-laptop", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
  { icon: Tablet, label: "Tablet", href: "/services/episkeui-tablet", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
  { icon: Monitor, label: "Desktop", href: "/services/episkeui-desktop", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
];

const serviceCards = [
  { icon: ScanLine, label: "Αλλαγή Οθόνης", href: "/services/episkeui-kiniton", color: "text-primary", bg: "bg-primary/10 border-primary/25" },
  { icon: Battery, label: "Αλλαγή Μπαταρίας", href: "/services#allagi-batarias", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
  { icon: Droplets, label: "Βρεγμένο Κινητό", href: "/services/episkeui-kiniton", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/25" },
  { icon: Camera, label: "Επισκευή Κάμερας", href: "/services/episkeui-kiniton", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
  { icon: HardDrive, label: "Ανάκτηση Δεδομένων", href: "/services#anaktisi-dedomenon", color: "text-rose-400", bg: "bg-rose-400/10 border-rose-400/25" },
  { icon: Wrench, label: "Διαγνωστικός Έλεγχος", href: "/services#diagnostiko", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25" },
];

/** LCP: μικρότερο αρχείο σε mobile, μεγαλύτερο σε desktop — ίδιο photo id */
const HERO_IMG_MOBILE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=75&w=720";
const HERO_IMG_DESKTOP =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=900";

function formatPrice(price: string | number): string {
  const n = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);
}

type HomeEshopTab = "new" | "sale" | "top";

function competitorPrices(p: Product): number[] {
  return [p.priceSkroutz, p.priceKotsovolos, p.priceBestPrice]
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** Highest competitor price above ours — used as strikethrough / discount badge */
function compareAtPrice(p: Product): number | null {
  const our = Number(p.price);
  if (!Number.isFinite(our)) return null;
  const higher = competitorPrices(p).filter((n) => n > our + 0.5);
  if (!higher.length) return null;
  return Math.max(...higher);
}

function savingsAmount(p: Product): number | null {
  const cmp = compareAtPrice(p);
  const our = Number(p.price);
  if (cmp == null || !Number.isFinite(our)) return null;
  return Math.round((cmp - our) * 100) / 100;
}

function HomeEshopGridCard({ product }: { product: Product }) {
  const save = savingsAmount(product);
  const compare = compareAtPrice(product);
  return (
    <Link href={product.slug ? `/eshop/${product.slug}` : "/eshop"}>
      <article className="group relative flex h-full flex-col px-3 py-4 text-center sm:px-4">
        <div className="relative mx-auto mb-3 aspect-square w-full max-w-[140px] overflow-hidden bg-white sm:max-w-[160px]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-10 w-10 text-primary/25" />
            </div>
          )}
          {save != null && save > 0 && (
            <span className="absolute right-0 top-0 bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
              -{formatPrice(save)}
            </span>
          )}
        </div>
        <div className="mt-auto space-y-1">
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0.5">
            <span className="text-base font-bold tabular-nums text-primary sm:text-lg">
              {formatPrice(product.price)}
            </span>
            {compare != null && (
              <span className="text-xs tabular-nums text-muted-foreground line-through">
                {formatPrice(compare)}
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground/80 group-hover:text-primary sm:text-[13px]">
            {product.name}
          </h3>
        </div>
      </article>
    </Link>
  );
}

function HomeEshopShowcase({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<HomeEshopTab>("new");
  const [dealIdx, setDealIdx] = useState(0);

  const sortedNewest = useMemo(
    () => [...products].sort((a, b) => b.id - a.id),
    [products],
  );

  const onSale = useMemo(
    () =>
      sortedNewest
        .filter((p) => savingsAmount(p) != null)
        .sort((a, b) => (savingsAmount(b) ?? 0) - (savingsAmount(a) ?? 0)),
    [sortedNewest],
  );

  const bestDeals = useMemo(() => {
    const withSave = onSale.slice(0, 8);
    if (withSave.length > 0) return withSave;
    return sortedNewest.slice(0, 6);
  }, [onSale, sortedNewest]);

  const topRated = useMemo(() => {
    const winners = sortedNewest.filter((p) => {
      const our = Number(p.price);
      const comps = competitorPrices(p);
      return comps.length > 0 && comps.every((c) => our <= c);
    });
    if (winners.length >= 6) return winners.slice(0, 10);
    return sortedNewest
      .filter((p) => (p.imageUrl || "").startsWith("/images/"))
      .slice(0, 10);
  }, [sortedNewest]);

  const gridProducts = useMemo(() => {
    const list =
      tab === "new" ? sortedNewest : tab === "sale" ? (onSale.length ? onSale : sortedNewest) : topRated;
    return list.slice(0, 10);
  }, [tab, sortedNewest, onSale, topRated]);

  useEffect(() => {
    if (bestDeals.length < 2) return;
    const t = window.setInterval(() => {
      setDealIdx((i) => (i + 1) % bestDeals.length);
    }, 6000);
    return () => window.clearInterval(t);
  }, [bestDeals.length]);

  useEffect(() => {
    setDealIdx(0);
  }, [bestDeals.length]);

  const deal = bestDeals[dealIdx] ?? bestDeals[0];
  const tabs: { id: HomeEshopTab; label: string }[] = [
    { id: "new", label: "Νέες αφίξεις" },
    { id: "sale", label: "Σε προσφορά" },
    { id: "top", label: "Κορυφαία" },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-6">
      {/* Deals of the week */}
      <aside className="flex flex-col border border-primary/35 bg-card/40">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h3 className="text-sm font-display font-bold text-foreground sm:text-base">
            Προσφορές εβδομάδας
          </h3>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-40"
              aria-label="Προηγούμενη προσφορά"
              disabled={bestDeals.length < 2}
              onClick={() =>
                setDealIdx((i) => (i - 1 + bestDeals.length) % bestDeals.length)
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-40"
              aria-label="Επόμενη προσφορά"
              disabled={bestDeals.length < 2}
              onClick={() => setDealIdx((i) => (i + 1) % bestDeals.length)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {deal ? (
          <Link href={deal.slug ? `/eshop/${deal.slug}` : "/eshop"} className="flex flex-1 flex-col px-4 pb-2 pt-4">
            <p className="text-2xl font-extrabold tabular-nums text-primary sm:text-3xl">
              {formatPrice(deal.price)}
            </p>
            {compareAtPrice(deal) != null && (
              <p className="mt-0.5 text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice(deal)!)}
              </p>
            )}
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {deal.name}
            </p>
            <div className="relative mt-4 flex flex-1 items-center justify-center bg-white py-4">
              {deal.imageUrl ? (
                <img
                  src={deal.imageUrl}
                  alt={deal.name}
                  className="max-h-52 w-full object-cover object-center sm:max-h-64"
                  loading="lazy"
                />
              ) : (
                <Package className="h-16 w-16 text-primary/25" />
              )}
            </div>
          </Link>
        ) : (
          <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
            Δεν υπάρχουν προσφορές
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 divide-x divide-border/60 border-t border-border/60 text-xs font-medium">
          <button
            type="button"
            className="flex items-center justify-center gap-1 px-2 py-3 text-muted-foreground hover:bg-primary/5 hover:text-primary disabled:opacity-40"
            disabled={bestDeals.length < 2}
            onClick={() =>
              setDealIdx((i) => (i - 1 + bestDeals.length) % bestDeals.length)
            }
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Προηγούμενη
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-1 px-2 py-3 text-muted-foreground hover:bg-primary/5 hover:text-primary disabled:opacity-40"
            disabled={bestDeals.length < 2}
            onClick={() => setDealIdx((i) => (i + 1) % bestDeals.length)}
          >
            Επόμενη
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </aside>

      {/* Tabs + grid */}
      <div className="min-w-0 border border-border/50 bg-card/30">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-1 border-b border-border/60 px-3 sm:px-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "relative -mb-px pb-3 pt-3 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
          <Link href="/eshop" className="ml-auto pb-3 pt-3 text-xs font-medium text-primary hover:underline">
            Όλα τα προϊόντα
          </Link>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border/40 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {gridProducts.map((p) => (
            <HomeEshopGridCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

const GADGET_CATEGORIES: {
  key: string;
  label: string;
  href: string;
  icon: typeof Smartphone;
  match: (p: Product) => boolean;
}[] = [
  {
    key: "desktop",
    label: "Desktop PC",
    href: "/eshop?category=desktop",
    icon: Monitor,
    match: (p) => p.category === "desktop",
  },
  {
    key: "laptop",
    label: "Laptop",
    href: "/eshop?category=laptop",
    icon: Laptop,
    match: (p) => p.category === "laptop",
  },
  {
    key: "mobile",
    label: "Κινητά",
    href: "/eshop?tab=mobile",
    icon: Smartphone,
    match: (p) => p.category === "mobile",
  },
  {
    key: "headphones",
    label: "Ακουστικά",
    href: "/eshop?tab=headphones",
    icon: Headphones,
    match: (p) =>
      p.subcategory === "headphones" ||
      /airpods|ακουστικ|earpod|headphone/i.test(p.name),
  },
  {
    key: "accessory",
    label: "Αξεσουάρ",
    href: "/eshop",
    icon: Package,
    match: (p) =>
      p.category === "accessory" ||
      p.subcategory === "chargers" ||
      p.subcategory === "cases" ||
      p.subcategory === "screen-protectors",
  },
];

function HomeGadgetsAccessories({ products }: { products: Product[] }) {
  const [activeCat, setActiveCat] = useState(GADGET_CATEGORIES[2]?.key ?? "mobile");
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();

  const active = GADGET_CATEGORIES.find((c) => c.key === activeCat) ?? GADGET_CATEGORIES[0];

  const stripProducts = useMemo(() => {
    const list = products.filter(active.match).sort((a, b) => b.id - a.id);
    if (list.length >= 4) return list.slice(0, 8);
    // fallback: newest overall so the strip is never empty
    return [...products].sort((a, b) => b.id - a.id).slice(0, 8);
  }, [products, active]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/40 lg:grid lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
      {/* Category sidebar */}
      <aside className="border-b border-border/50 bg-background/80 px-5 py-6 lg:border-b-0 lg:border-r lg:border-border/50">
        <h3 className="mb-5 max-w-[14rem] text-lg font-display font-bold leading-snug text-foreground sm:text-xl">
          Gadgets &amp; αξεσουάρ σήμερα
        </h3>
        <ul className="space-y-0.5">
          {GADGET_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const selected = cat.key === activeCat;
            return (
              <li key={cat.key}>
                <button
                  type="button"
                  onClick={() => setActiveCat(cat.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                  <span className="flex-1">{cat.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
        <Link href={active.href}>
          <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
            Δες όλα <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </aside>

      {/* Horizontal product strip */}
      <div
        className="relative min-w-0 bg-muted/20 px-4 py-5 sm:px-6 sm:py-6"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 80% 20%, rgba(0,210,200,0.08), transparent 55%)",
        }}
      >
        <div className="-mx-1 flex gap-4 overflow-x-auto pb-2 pt-1 scrollbar-thin snap-x snap-mandatory">
          {stripProducts.map((product) => (
            <article
              key={product.id}
              className="group relative flex w-[160px] shrink-0 snap-start flex-col rounded-xl border border-border/40 bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:w-[180px]"
            >
              <Link href={product.slug ? `/eshop/${product.slug}` : "/eshop"} className="flex flex-1 flex-col">
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-lg bg-white">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.04]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-10 w-10 text-primary/25" />
                    </div>
                  )}
                </div>
                <p className="text-center text-lg font-extrabold tabular-nums text-primary">
                  {formatPrice(product.price)}
                </p>
                <h4 className="mt-1 line-clamp-2 min-h-[2.5rem] text-center text-xs font-medium leading-snug text-muted-foreground group-hover:text-foreground">
                  {product.name}
                </h4>
              </Link>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-9 w-full border-primary/40 text-xs font-semibold text-primary opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  addItem(product);
                  toast({
                    title: "Προστέθηκε στο καλάθι",
                    description: product.name,
                    duration: 2500,
                  });
                }}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Προσθήκη
              </Button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const products = Array.isArray(productsData) ? productsData : [];

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Seo
        title="HiTech Doctor | Εξειδικευμένο Κέντρο Επισκευής Tech"
        description="Ο τεχνολογικός σας γιατρός στην Αθήνα. Επαγγελματική επισκευή σε iPhone, Samsung, Xiaomi, Tablet, Laptop, Mac & IT Support με 12 χρόνια εμπειρίας."
        url="https://hitechdoctor.com"
      />
      <Helmet>
        <meta name="keywords" content="επισκευή κινητών Αθήνα, IT support, επισκευή laptop, επισκευή tablet, ανάκτηση δεδομένων, HiTech Doctor" />
        <link rel="canonical" href="https://hitechdoctor.com" />
        <link rel="preload" as="image" href={HERO_IMG_MOBILE} fetchPriority="high" />
      </Helmet>

      {/* Light ambient (no busy circuit pattern behind hero text) */}
      <div
        className="absolute top-0 left-0 w-[700px] h-[700px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ background: "radial-gradient(circle, rgba(0,210,200,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3"
        style={{ background: "radial-gradient(circle, rgba(0,130,180,0.08) 0%, transparent 70%)" }}
      />

      <Navbar />

      <main>
        {/* ── Promo hero: καθαρό banner, υψηλή αναγνωσιμότητα — χωρίς βίντεο / χαοτικό φόντο πίσω από CTAs ── */}
        <section className="container mx-auto px-4 pt-8 pb-10 lg:pt-12 lg:pb-14" aria-label="HiTech Doctor">
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-card/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md sm:rounded-3xl">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.12] via-background/95 to-background"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(0,210,200,0.14),transparent_55%)]"
              aria-hidden
            />

            <div className="relative grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
              <div className="order-1 flex w-full max-w-xl flex-col gap-5">
                <Badge
                  variant="outline"
                  className="w-fit border-primary/35 bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  HiTech Doctor — Αθήνα
                </Badge>

                <div>
                  <h1 className="font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                    Επαγγελματικές επισκευές &amp; τεχνική υποστήριξη
                  </h1>
                  <p className="mt-3 text-base font-medium text-primary/95 sm:text-lg">
                    Κινητά, tablet, laptop &amp; desktop — γρήγορα, με γραπτή εγγύηση.
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Στο HiTech Doctor συνδυάζουμε εξειδίκευση σε επισκευές Apple &amp; Android με IT support και ένα προσεγμένο eShop αξεσουάρ. Ένα σημείο για όλες τις ανάγκες της συσκευής σας.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/services">
                    <Button
                      size="lg"
                      className="h-12 min-w-[200px] px-8 text-base font-semibold shadow-[0_0_28px_rgba(0,210,200,0.28)] border-0"
                      style={{
                        background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                      }}
                      data-testid="button-hero-services"
                    >
                      Οι υπηρεσίες μας
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link
                    href="/eshop"
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary/25 px-6 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                    data-testid="button-hero-eshop"
                  >
                    eShop
                  </Link>
                </div>

                <button
                  type="button"
                  className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                  onClick={() => requestOpenRepairChat()}
                  data-testid="button-hero-ai-chat"
                >
                  <Bot className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Ρώτα τον AI βοηθό
                </button>

                <div className="flex flex-wrap gap-3 pt-1">
                  {["Γρήγορη επισκευή", "Γραπτή εγγύηση", "Γνήσια ανταλλακτικά"].map((b) => (
                    <span key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="order-2 w-full lg:order-2">
                <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl lg:ml-auto lg:mr-0">
                  <div className="relative aspect-[4/3] max-h-[min(42vh,280px)] w-full sm:max-h-[min(44vh,320px)] lg:max-h-[340px]">
                    <img
                      src={HERO_IMG_MOBILE}
                      srcSet={`${HERO_IMG_MOBILE} 720w, ${HERO_IMG_DESKTOP} 900w`}
                      sizes="(max-width: 1023px) min(100vw, 36rem), 520px"
                      alt="Επαγγελματική επισκευή τεχνολογίας — εργαστήριο HiTech Doctor"
                      className="h-full w-full object-cover"
                      width={900}
                      height={675}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/88 to-background/35" />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" aria-hidden />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-xl border border-white/10 bg-background/95 px-3 py-2 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-auto">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15">
                        <Wrench className="h-4 w-4 text-primary" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground">Express επισκευή</p>
                        <p className="text-[11px] text-muted-foreground">Αποτέλεσμα σε ώρες</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Από το eShop — deals sidebar + tabbed product grid ── */}
        <section className="container mx-auto px-4 pt-4 pb-10 lg:pt-2 lg:pb-12" aria-label="Από το eShop">
          <div className="mb-5">
            <h2 className="mb-1 text-2xl font-display font-bold text-foreground lg:text-3xl">
              Από το eShop
            </h2>
            <p className="text-sm text-muted-foreground">
              Προσφορές εβδομάδας, νέες αφίξεις και κορυφαίες επιλογές
            </p>
          </div>

          {productsLoading ? (
            <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
              <Skeleton className="h-[420px] w-full bg-white/5" />
              <Skeleton className="h-[420px] w-full bg-white/5" />
            </div>
          ) : products.length > 0 ? (
            <HomeEshopShowcase products={products} />
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Package className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>Δεν υπάρχουν προϊόντα προς το παρόν</p>
            </div>
          )}
        </section>

        {/* ── Gadgets & αξεσουάρ — category sidebar + horizontal cards ── */}
        <section className="container mx-auto px-4 pb-10 lg:pb-12" aria-label="Gadgets και αξεσουάρ">
          {productsLoading ? (
            <Skeleton className="h-[280px] w-full rounded-2xl bg-white/5" />
          ) : products.length > 0 ? (
            <HomeGadgetsAccessories products={products} />
          ) : null}
        </section>

        {/* ── Highlights bar ── */}
        <section className="border-y border-primary/10 py-8" aria-label="Βασικά πλεονεκτήματα" style={{ background: "rgba(0,210,200,0.03)" }}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0 icon-glow">
                    <h.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{h.label}</p>
                    <p className="text-xs text-muted-foreground">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── AI Doctor Card ── */}
        <section className="container mx-auto px-4 pt-10 pb-2" aria-label="AI Διάγνωση Βλάβης">
          <button
            type="button"
            onClick={() => requestOpenRepairChat()}
            className="w-full group relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, hsl(185 100% 12% / 0.9) 0%, hsl(240 30% 8% / 0.95) 100%)",
              boxShadow: "0 0 0 1px rgba(0,210,200,0.2), 0 8px 40px rgba(0,210,200,0.12)",
            }}
            data-testid="card-ai-diagnosis"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none opacity-20 -translate-y-1/2 translate-x-1/4"
              style={{ background: "radial-gradient(circle, rgba(0,210,200,0.6) 0%, transparent 70%)" }} />
            <div className="relative flex items-center gap-5">
              <div className="shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 24px rgba(0,210,200,0.4)" }}>
                <Bot className="w-8 h-8 text-white" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">AI Doctor</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/25 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white leading-tight">
                  Διάγνωση Βλάβης με AI
                </h2>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">
                  Περίγραψε το πρόβλημα — λαμβάνεις εκτίμηση κόστους & χρόνου επισκευής σε δευτερόλεπτα.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-primary shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" aria-hidden />
            </div>
          </button>
        </section>

        {/* ── Quick Repair — Device Picker ── */}
        <section className="container mx-auto px-4 pt-8 pb-2" aria-label="Άμεση Επισκευή">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">Άμεση Επισκευή</h2>
            <Link href="/services">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                Όλες <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
            {quickRepairDevices.map((d) => (
              <Link key={d.label} href={d.href}>
                <div className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border cursor-pointer min-w-[80px] hover:-translate-y-0.5 transition-transform ${d.bg}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${d.bg}`}>
                    <d.icon className={`w-7 h-7 ${d.color}`} aria-hidden />
                  </div>
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">{d.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Service Cards ── */}
        <section className="container mx-auto px-4 pt-6 pb-2" aria-label="Κατηγορίες Επισκευών">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">Τι Επισκευάζουμε</h2>
            <Link href="/services">
              <span className="text-sm text-primary font-medium flex items-center gap-0.5 cursor-pointer">
                Όλες <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {serviceCards.map((s) => (
              <Link key={s.label} href={s.href}>
                <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border cursor-pointer hover:-translate-y-0.5 transition-transform ${s.bg}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} aria-hidden />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{s.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Services Grid ── */}
        <section className="container mx-auto px-4 py-20" aria-label="Κατάλογος υπηρεσιών">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
              Οι Υπηρεσίες Μας
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Παρέχουμε ολοκληρωμένες λύσεις για κάθε πρόβλημα — από το smartphone σου έως τη δικτυακή υποδομή της επιχείρησής σου.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeServices.map((s) => (
              <Link key={s.title} href={s.href}>
                <div
                  className="group bg-card pcb-border rounded-2xl p-5 flex flex-col items-center text-center gap-3 cursor-pointer hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(0,210,200,0.12)] transition-all duration-300"
                  data-testid={`card-service-${s.title.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center icon-glow group-hover:bg-primary/20 transition-colors">
                    <s.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-foreground leading-tight">{s.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity -mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section
          className="relative overflow-hidden border-y border-primary/10 py-16"
          aria-label="Call to action"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.06) 0%, rgba(0,0,0,0) 55%, rgba(0,130,180,0.06) 100%)" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-background/80" aria-hidden />
          <div className="container relative mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">uBreak i Fix</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Φέρε τη συσκευή σου ή επικοινώνησε μαζί μας για δωρεάν αξιολόγηση — χωρίς δεσμεύσεις.
            </p>
            <Link href="/services">
              <Button
                size="lg"
                className="h-12 px-10 font-semibold border-0"
                style={{
                  background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))",
                  boxShadow: "0 0 24px rgba(0,210,200,0.3)",
                }}
                data-testid="button-cta-services"
              >
                Δες τις Υπηρεσίες
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        <HomeBelowFold />
      </main>
    </div>
  );
}
