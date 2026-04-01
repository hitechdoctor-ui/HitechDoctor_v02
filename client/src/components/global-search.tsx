import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search, Package, Wrench, Smartphone, X, Laptop, Gamepad2,
  Tablet, Watch, ArrowRight, FileText, Info, Phone, HelpCircle,
  ShoppingCart, Star, Monitor, Download, Sparkles, Truck,
} from "lucide-react";
import { type Product } from "@shared/schema";
import {
  buildGlobalSearchIndex,
  GLOBAL_SEARCH_UI_CATEGORY_ORDER,
  groupMatchedEntries,
  matchProductsForGlobalSearch,
  type GlobalSearchCategory,
  type GlobalSearchIndexEntry,
} from "@/lib/global-search-index";

const PLAIN_INDEX = buildGlobalSearchIndex();
const GLOBAL_SEARCH_INPUT_ID = "global-search-input";

const ICON_BY_CATEGORY: Record<GlobalSearchCategory, typeof Wrench> = {
  service: Wrench,
  iphone: Smartphone,
  samsung: Smartphone,
  xiaomi: Smartphone,
  huawei: Smartphone,
  oneplus: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  desktop: Monitor,
  watch: Watch,
  page: Info,
  blog: FileText,
};

interface SearchEntry extends GlobalSearchIndexEntry {
  icon: React.ComponentType<{ className?: string }>;
}

function withIcon(e: GlobalSearchIndexEntry): SearchEntry {
  return { ...e, icon: ICON_BY_CATEGORY[e.category] };
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-amber-200/90 text-slate-900 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </span>
  );
}

const CATEGORY_LABELS: Record<string, { label: string; icon: typeof Wrench }> = {
  service: { label: "Υπηρεσίες", icon: Wrench },
  iphone:  { label: "Επισκευή iPhone", icon: Smartphone },
  samsung: { label: "Επισκευή Samsung", icon: Smartphone },
  xiaomi:  { label: "Επισκευή Xiaomi / Redmi / Poco", icon: Smartphone },
  huawei:  { label: "Επισκευή Huawei", icon: Smartphone },
  oneplus: { label: "Επισκευή OnePlus", icon: Smartphone },
  tablet:  { label: "Επισκευή Tablet", icon: Tablet },
  laptop:  { label: "Επισκευή Laptop", icon: Laptop },
  desktop: { label: "Επισκευή Desktop", icon: Monitor },
  watch:   { label: "Apple Watch", icon: Watch },
  page:    { label: "Σελίδες", icon: Info },
  blog:    { label: "Blog", icon: FileText },
};

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({ className = "", placeholder = "Αναζήτηση προϊόντων & υπηρεσιών..." }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const q = query.trim().toLowerCase();

  const matchedProducts = useMemo(
    () => (q.length >= 1 ? matchProductsForGlobalSearch(products ?? [], query) : []),
    [q, query, products]
  );

  const matchedEntries = useMemo(() => {
    if (q.length < 1) return {};
    const plain = groupMatchedEntries(PLAIN_INDEX, q, 4);
    const grouped: Record<string, SearchEntry[]> = {};
    for (const cat of Object.keys(plain)) {
      grouped[cat] = plain[cat].map(withIcon);
    }
    return grouped;
  }, [q]);

  const hasEntries = Object.keys(matchedEntries).length > 0;
  const hasResults = matchedProducts.length > 0 || hasEntries;

  function go(href: string) {
    setQuery("");
    setOpen(false);
    navigate(href);
  }

  const categoryOrder = GLOBAL_SEARCH_UI_CATEGORY_ORDER;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 px-3 h-9 rounded-xl border transition-all duration-200 ${
          open
            ? "bg-background/80 border-primary/40 shadow-[0_0_0_3px_rgba(0,210,200,0.12)]"
            : "bg-white/5 border-white/10 hover:border-white/20"
        }`}
      >
        <label htmlFor={GLOBAL_SEARCH_INPUT_ID} className="sr-only">
          Αναζήτηση προϊόντων, υπηρεσιών και σελίδων
        </label>
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden />
        <input
          id={GLOBAL_SEARCH_INPUT_ID}
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none min-w-0"
          data-testid="input-global-search"
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => { setQuery(""); inputRef.current?.focus(); }}
            className="shrink-0 rounded-md p-0.5 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Καθαρισμός αναζήτησης"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" aria-hidden />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/15 text-muted-foreground bg-white/5 shrink-0">
            ⌘K
          </kbd>
        )}
      </div>

      {open && q.length >= 1 && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-[100] min-w-[340px] max-h-[480px] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-[0_18px_48px_rgba(15,23,42,0.12)] backdrop-blur-md"
        >
          {!hasResults ? (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden />
              <p className="text-xs text-slate-700">
                Δεν βρέθηκαν αποτελέσματα για <strong className="text-slate-900">"{query}"</strong>
              </p>
            </div>
          ) : (
            <div className="py-2">

              {/* eShop Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Package className="w-3 h-3 shrink-0" aria-hidden /> eShop
                  </p>
                  {matchedProducts.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => go(`/eshop/${p.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 transition-colors text-left group"
                      data-testid={`search-result-product-${p.id}`}
                      aria-label={`Άνοιγμα προϊόντος: ${p.name}`}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900 truncate">{highlight(p.name, query)}</p>
                        <p className="text-[10px] text-slate-700">
                          {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(p.price))}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" aria-hidden />
                    </button>
                  ))}
                </div>
              )}

              {/* Grouped entries (services, iphone, samsung, pages, blog) */}
              {categoryOrder.map((cat) => {
                const entries = matchedEntries[cat];
                if (!entries || entries.length === 0) return null;
                const meta = CATEGORY_LABELS[cat];
                const CatIcon = meta.icon;
                const hasBorder = matchedProducts.length > 0 || categoryOrder.slice(0, categoryOrder.indexOf(cat)).some((c) => matchedEntries[c]?.length);
                return (
                  <div key={cat} className={hasBorder ? "border-t border-slate-200 mt-1 pt-1" : ""}>
                    <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <CatIcon className="w-3 h-3 shrink-0" aria-hidden /> {meta.label}
                    </p>
                    {entries.map((entry) => {
                      const EntryIcon = entry.icon;
                      return (
                        <button
                          key={entry.href + entry.name}
                          type="button"
                          onClick={() => go(entry.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 transition-colors text-left group"
                          data-testid={`search-result-${cat}-${entry.href.replace(/\//g, "-")}`}
                          aria-label={`Μετάβαση: ${entry.name}`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                            <EntryIcon className="w-4 h-4 text-primary" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">{highlight(entry.name, query)}</p>
                            <p className="text-[10px] text-slate-700 truncate">{entry.sub}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors shrink-0" aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-3 py-2 border-t border-slate-200 flex items-center gap-4 bg-slate-50/95 sticky bottom-0">
            <span className="text-[9px] text-slate-600 flex items-center gap-1">
              <kbd className="px-1 rounded border border-slate-300 bg-white font-mono text-slate-800">↵</kbd> Μετάβαση
            </span>
            <span className="text-[9px] text-slate-600 flex items-center gap-1">
              <kbd className="px-1 rounded border border-slate-300 bg-white font-mono text-slate-800">Esc</kbd> Κλείσιμο
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
