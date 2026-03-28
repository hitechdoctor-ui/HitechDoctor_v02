import type { Product } from "@shared/schema";

const formatPrice = (p: string | number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(p));

const MISSING_PRICE = "-- €";

/** Order: Skroutz, BestPrice, Kotsovolos, Shopflix */
const STORES: {
  key: "skroutz" | "bestprice" | "kotsovolos" | "shopflix";
  label: string;
  className: string;
}[] = [
  { key: "skroutz", label: "Skroutz", className: "bg-[#FF6600] text-white" },
  { key: "bestprice", label: "BestPrice", className: "bg-[#00A859] text-white" },
  { key: "kotsovolos", label: "Kotsovolos", className: "bg-[#E30613] text-white" },
  { key: "shopflix", label: "Shopflix", className: "bg-[#6B2D90] text-white" },
];

function priceFor(product: Product, key: (typeof STORES)[number]["key"]): number | null {
  const map: Record<string, string | null | undefined> = {
    kotsovolos: product.priceKotsovolos as string | null | undefined,
    skroutz: product.priceSkroutz as string | null | undefined,
    bestprice: product.priceBestPrice as string | null | undefined,
    shopflix: product.priceShopflix as string | null | undefined,
  };
  const raw = map[key];
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function PriceComparisonSection({ product }: { product: Product }) {
  const our = Number(product.price);
  if (!Number.isFinite(our)) return null;

  const rows = STORES.map((s) => ({
    ...s,
    price: priceFor(product, s.key),
  }));

  const competitorValues = rows.map((r) => r.price).filter((p): p is number => p != null);
  const minCompetitor = competitorValues.length ? Math.min(...competitorValues) : null;
  const weAreLowest =
    competitorValues.length > 0 && minCompetitor != null && our <= minCompetitor;

  const last = product.lastPriceUpdate
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(product.lastPriceUpdate as string | Date))
    : null;

  return (
    <section
      className="mt-4 rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm p-5 space-y-4"
      aria-labelledby="price-compare-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="price-compare-heading" className="text-lg font-display font-bold text-foreground">
          Price Comparison
        </h2>
        {last && <p className="text-[11px] text-muted-foreground">Last updated: {last}</p>}
      </div>

      {weAreLowest && (
        <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400">
          Best Price in Market!
        </span>
      )}

      <div className="flex flex-row flex-wrap items-stretch gap-4">
        {/* HiTech Doctor */}
        <div className="flex min-w-[7.5rem] flex-1 flex-col justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 sm:max-w-[11rem] sm:flex-initial">
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary/90">HiTech Doctor</span>
          <span className="text-base font-extrabold tabular-nums text-primary sm:text-lg">{formatPrice(our)}</span>
        </div>

        {rows.map((row) => {
          const p = row.price;
          return (
            <div
              key={row.key}
              className="flex min-w-[7.5rem] flex-1 flex-col justify-between rounded-lg border border-white/15 bg-background/60 px-3 py-2.5 sm:max-w-[11rem] sm:flex-initial"
            >
              <span
                className={`inline-flex w-fit max-w-full items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold ${row.className}`}
              >
                {row.label}
              </span>
              <span className="text-base font-semibold tabular-nums text-foreground sm:text-lg">
                {p != null ? formatPrice(p) : MISSING_PRICE}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
        Third-party prices are indicative and may be outdated. Confirm on the retailer&apos;s site.
      </p>
    </section>
  );
}
