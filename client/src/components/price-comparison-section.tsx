import type { Product } from "@shared/schema";

const formatPrice = (p: string | number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(p));

const STORES: {
  key: "kotsovolos" | "skroutz" | "bestprice" | "shopflix";
  label: string;
  className: string;
}[] = [
  { key: "kotsovolos", label: "Kotsovolos", className: "bg-[#E30613] text-white" },
  { key: "skroutz", label: "Skroutz", className: "bg-[#FF6600] text-white" },
  { key: "bestprice", label: "BestPrice", className: "bg-[#00A859] text-white" },
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
  })).filter((r) => r.price != null) as (typeof STORES[number] & { price: number })[];

  const last = product.lastPriceUpdate
    ? new Intl.DateTimeFormat("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(product.lastPriceUpdate as string | Date))
    : null;

  if (rows.length === 0 && !last) return null;

  const competitorValues = rows.map((r) => r.price);
  const minCompetitor = competitorValues.length ? Math.min(...competitorValues) : null;
  const weAreLowest =
    competitorValues.length > 0 && minCompetitor != null && our <= minCompetitor;

  return (
    <section
      className="rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm p-5 space-y-4"
      aria-labelledby="price-compare-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 id="price-compare-heading" className="text-lg font-display font-bold text-foreground">
          Σύγκριση τιμών
        </h2>
        {last && (
          <p className="text-[11px] text-muted-foreground">Τελευταία ενημέρωση: {last}</p>
        )}
      </div>

      {weAreLowest && (
        <p className="text-sm font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 rounded-xl px-4 py-3">
          Η HiTech Doctor έχει την καλύτερη τιμή στην αγορά!
        </p>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">HiTech Doctor</span>
          <span className="text-xl font-extrabold text-primary">{formatPrice(our)}</span>
        </div>

        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Δεν υπάρχουν αποθηκευμένες τιμές ανταγωνιστών. Ο διαχειριστής μπορεί να ενημερώσει από το Admin.
          </p>
        ) : (
          rows.map((row) => {
            const delta = row.price - our;
            const deltaLabel =
              delta === 0
                ? "ίδια τιμή με εμάς"
                : delta > 0
                  ? `+${formatPrice(delta)} σε σχέση με εμάς`
                  : `${formatPrice(delta)} από εμάς`;
            return (
              <div
                key={row.key}
                className="flex flex-wrap items-center gap-3 justify-between rounded-xl border border-white/10 bg-background/40 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[10px] font-bold shrink-0 ${row.className}`}
                  >
                    {row.label}
                  </span>
                  <span className="text-lg font-semibold tabular-nums">{formatPrice(row.price)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{deltaLabel}</span>
              </div>
            );
          })
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
        Οι τιμές τρίτων ενδέχεται να διαφέρουν και να μην είναι πάντα ενημερωμένες. Ενδεικτική σύγκριση — επιβεβαιώστε στο κατάστημα.
      </p>
    </section>
  );
}
