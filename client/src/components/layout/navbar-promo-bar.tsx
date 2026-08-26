import { Link } from "wouter";
import { ArrowRight, Laptop, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { useProducts } from "@/hooks/use-products";
import { NAVBAR_PROMO_CONFIG } from "@/lib/navbar-promo-config";
import { cn } from "@/lib/utils";
import type { Product } from "@shared/schema";

function formatPrice(value: string | number): string {
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function pickFeaturedLaptop(products: Product[] | undefined): Product | null {
  if (!products?.length) return null;
  if (NAVBAR_PROMO_CONFIG.featuredSlug) {
    const match = products.find((p) => p.slug === NAVBAR_PROMO_CONFIG.featuredSlug);
    if (match) return match;
  }
  return products[0] ?? null;
}

function shortSpecs(product: Product): string {
  const desc = product.description?.trim();
  if (desc && desc.length <= 72) return desc;
  if (desc) return `${desc.slice(0, 69)}…`;
  return "Έλεγχος πριν την πώληση · 1 χρόνο εγγύηση";
}

export function NavbarPromoBar() {
  const { data: laptops } = useProducts("laptop", "laptop");
  const product = useMemo(() => pickFeaturedLaptop(laptops), [laptops]);
  const fallback = NAVBAR_PROMO_CONFIG.staticFallback;

  const title = product?.name ?? fallback?.name ?? "Μεταχειρισμένα Laptop στο eShop";
  const description = product
    ? shortSpecs(product)
    : fallback?.description ?? NAVBAR_PROMO_CONFIG.headline;
  const price = product?.price ?? fallback?.price;
  const imageUrl = product?.imageUrl ?? fallback?.imageUrl;
  const href = product?.slug
    ? `/eshop/${product.slug}`
    : fallback?.href ?? NAVBAR_PROMO_CONFIG.fallbackHref;

  return (
    <div
      className="w-full overflow-hidden border-t-2 border-emerald-500/25 opacity-100"
      role="region"
      aria-label="Προωθητική προσφορά"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-3.5">
        <Link
          href={href}
          className={cn(
            "group flex items-center gap-3 rounded-2xl border border-emerald-500/20",
            "bg-gradient-to-r from-emerald-500/10 via-emerald-500/[0.06] to-cyan-500/10",
            "px-3 py-2.5 shadow-sm transition-all hover:border-emerald-500/35 hover:shadow-md sm:gap-4 sm:px-4 sm:py-3",
          )}
          data-testid="navbar-promo-bar"
        >
          {imageUrl ? (
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/80 sm:h-14 sm:w-20 dark:bg-zinc-900/80">
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-contain p-1"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/15 sm:flex">
              <Laptop className="h-6 w-6 text-emerald-400" aria-hidden />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                <Laptop className="h-3 w-3" aria-hidden />
                {NAVBAR_PROMO_CONFIG.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-emerald-400" aria-hidden />
                1 χρόνο εγγύηση
              </span>
            </div>

            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {title}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            {price ? (
              <span className="text-base font-bold text-emerald-300 sm:text-lg">
                {formatPrice(price)}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-950 transition-colors group-hover:bg-emerald-400 sm:text-sm">
              {NAVBAR_PROMO_CONFIG.ctaLabel}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
