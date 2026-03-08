import { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search, Package, Wrench, Smartphone, X, Laptop, Gamepad2,
  Tablet, Watch, ArrowRight, FileText, Info, Phone, HelpCircle,
  ShoppingCart, Star,
} from "lucide-react";
import { type Product } from "@shared/schema";
import { SAMSUNG_SERIES } from "@/data/samsung-devices";
import { IPHONE_SERIES } from "@/data/iphone-devices";
import { XIAOMI_SERIES } from "@/data/xiaomi-devices";
import { HUAWEI_SERIES } from "@/data/huawei-devices";
import { ONEPLUS_SERIES } from "@/data/oneplus-devices";
import { LAPTOP_BRANDS } from "@/data/laptop-brands";
import { TABLET_BRANDS } from "@/data/tablet-brands";
import { BLOG_POSTS } from "@/data/blog-posts";

interface SearchEntry {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  sub: string;
  category: "service" | "iphone" | "samsung" | "xiaomi" | "huawei" | "oneplus" | "tablet" | "laptop" | "page" | "blog";
  keywords?: string;
}

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  // ── Static service pages ────────────────────────────────────────────────
  entries.push(
    { name: "Επισκευή iPhone", href: "/services/episkeui-iphone", icon: Smartphone, sub: "Όλα τα μοντέλα iPhone", category: "service" },
    { name: "Επισκευή Samsung Galaxy", href: "/services/episkeui-samsung", icon: Smartphone, sub: "A · S · Z Series", category: "service", keywords: "samsung galaxy" },
    { name: "Επισκευή Xiaomi / Redmi / Poco", href: "/services/episkeui-xiaomi", icon: Smartphone, sub: "Redmi Note · Redmi · Xiaomi · Poco", category: "service", keywords: "xiaomi redmi poco" },
    { name: "Επισκευή Huawei", href: "/services/episkeui-huawei", icon: Smartphone, sub: "P · Mate · Nova · Y Series", category: "service", keywords: "huawei p mate nova" },
    { name: "Επισκευή OnePlus", href: "/services/episkeui-oneplus", icon: Smartphone, sub: "Flagship · Nord Series", category: "service", keywords: "oneplus nord" },
    { name: "Επισκευή Κινητών", href: "/services/episkeui-kiniton", icon: Smartphone, sub: "iPhone · Samsung · Xiaomi", category: "service" },
    { name: "Επισκευή Laptop", href: "/services", icon: Laptop, sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή Tablet", href: "/services", icon: Tablet, sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή PlayStation", href: "/services", icon: Gamepad2, sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή Υπολογιστή", href: "/services", icon: Laptop, sub: "Υπηρεσία", category: "service" },
    { name: "Επισκευή Apple Watch", href: "/services", icon: Watch, sub: "Υπηρεσία", category: "service" },
  );

  // ── Static informational pages ──────────────────────────────────────────
  entries.push(
    { name: "Σχετικά με εμάς", href: "/about", icon: Info, sub: "Η ιστορία μας", category: "page" },
    { name: "Επικοινωνία", href: "/contact", icon: Phone, sub: "Τηλέφωνο & Διεύθυνση", category: "page" },
    { name: "Συχνές Ερωτήσεις (FAQ)", href: "/faq", icon: HelpCircle, sub: "Απαντήσεις σε ερωτήσεις", category: "page" },
    { name: "eShop", href: "/eshop", icon: ShoppingCart, sub: "Αξεσουάρ · Κινητά · Laptops", category: "page" },
    { name: "Blog — Συμβουλές & Οδηγοί", href: "/blog", icon: FileText, sub: "Άρθρα για κινητά & επισκευή", category: "page" },
    { name: "Τρόποι Πληρωμής", href: "/payment-methods", icon: Star, sub: "Κάρτα · Μετρητά · Δόσεις", category: "page" },
    { name: "Όροι Υπηρεσιών", href: "/oroi-episkeuis", icon: FileText, sub: "Πολιτική επισκευής", category: "page" },
  );

  // ── iPhone model pages (dynamic from data) ─────────────────────────────
  for (const series of IPHONE_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-iphone/${model.slug}`,
        icon: Smartphone,
        sub: `Οθόνη από €${model.screenTiers[2].price} · Μπαταρία από €${model.batteryTiers[2].price}`,
        category: "iphone",
        keywords: `iphone ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  // ── Samsung model pages (dynamic from data) ────────────────────────────
  for (const series of SAMSUNG_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-samsung/${model.slug}`,
        icon: Smartphone,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "samsung",
        keywords: `samsung galaxy ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  // ── Xiaomi model pages (dynamic from data) ────────────────────────────
  for (const series of XIAOMI_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-xiaomi/${model.slug}`,
        icon: Smartphone,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "xiaomi",
        keywords: `xiaomi redmi poco ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  // ── Huawei model pages (dynamic from data) ────────────────────────────
  for (const series of HUAWEI_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-huawei/${model.slug}`,
        icon: Smartphone,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "huawei",
        keywords: `huawei ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  // ── OnePlus model pages (dynamic from data) ───────────────────────────
  for (const series of ONEPLUS_SERIES) {
    for (const model of series.models) {
      entries.push({
        name: `Επισκευή ${model.name}`,
        href: `/episkevi-oneplus/${model.slug}`,
        icon: Smartphone,
        sub: model.screenPriceOEM
          ? `Οθόνη από €${model.screenPriceOEM} · Μπαταρία €${model.batteryPrice}`
          : `Οθόνη €${model.screenPrice} · Μπαταρία €${model.batteryPrice}`,
        category: "oneplus",
        keywords: `oneplus ${model.name.toLowerCase()} επισκευή αλλαγη οθονη μπαταρια`,
      });
    }
  }

  // ── Tablet brands ─────────────────────────────────────────────────────
  for (const brand of TABLET_BRANDS) {
    entries.push({
      name: `Επισκευή ${brand.name}`,
      href: `/episkevi-tablet/${brand.slug}`,
      icon: Tablet,
      sub: `Tablet · ${brand.seriesLabel}`,
      category: "tablet",
      keywords: `tablet ${brand.name.toLowerCase()} επισκευη αλλαγη οθονη μπαταρια φορτιση`,
    });
  }
  entries.push({
    name: "Επισκευή Tablet — Όλες οι Μάρκες",
    href: "/services/episkeui-tablet",
    icon: Tablet,
    sub: "Tablet · iPad, Samsung Tab, Lenovo, Huawei",
    category: "tablet",
    keywords: "tablet επισκευη ipad samsung tab lenovo huawei αλλαγη οθονη μπαταρια",
  });

  // ── Laptop brands ─────────────────────────────────────────────────────
  for (const brand of LAPTOP_BRANDS) {
    entries.push({
      name: `Επισκευή ${brand.name}`,
      href: `/episkevi-laptop/${brand.slug}`,
      icon: Laptop,
      sub: `Laptop · ${brand.seriesLabel}`,
      category: "laptop",
      keywords: `laptop ${brand.name.toLowerCase()} επισκευη αλλαγη οθονη μπαταρια πληκτρολογιο`,
    });
  }
  entries.push({
    name: "Επισκευή Laptop — Όλες οι Μάρκες",
    href: "/services/episkeui-laptop",
    icon: Laptop,
    sub: "Laptop · MacBook, Dell, HP, Lenovo, ASUS, Acer",
    category: "laptop",
    keywords: "laptop επισκευη macbook dell hp lenovo asus acer αλλαγη οθονη μπαταρια πληκτρολογιο",
  });

  // ── Blog posts (dynamic from data) ────────────────────────────────────
  for (const post of BLOG_POSTS) {
    entries.push({
      name: post.title,
      href: `/blog/${post.slug}`,
      icon: FileText,
      sub: `Blog · ${post.category}`,
      category: "blog",
      keywords: post.title.toLowerCase(),
    });
  }

  return entries;
}

const ALL_ENTRIES = buildIndex();

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-primary/25 text-primary rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
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

  const matchedProducts = useMemo(() =>
    q.length >= 1
      ? (products ?? []).filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.slug?.toLowerCase().includes(q) ||
            (p.subcategory ?? "").toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        ).slice(0, 5)
      : [],
    [q, products]
  );

  const matchedEntries = useMemo(() => {
    if (q.length < 1) return {};
    const grouped: Record<string, SearchEntry[]> = {};
    for (const entry of ALL_ENTRIES) {
      const searchable = `${entry.name} ${entry.sub} ${entry.keywords ?? ""}`.toLowerCase();
      if (!searchable.includes(q)) continue;
      if (!grouped[entry.category]) grouped[entry.category] = [];
      if (grouped[entry.category].length < 4) {
        grouped[entry.category].push(entry);
      }
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

  const categoryOrder: (keyof typeof CATEGORY_LABELS)[] = ["service", "iphone", "samsung", "page", "blog"];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`flex items-center gap-2 px-3 h-9 rounded-xl border transition-all duration-200 ${
          open
            ? "bg-background/80 border-primary/40 shadow-[0_0_0_3px_rgba(0,210,200,0.12)]"
            : "bg-white/5 border-white/10 hover:border-white/20"
        }`}
      >
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none min-w-0"
          data-testid="input-global-search"
          aria-label="Αναζήτηση"
          autoComplete="off"
        />
        {query ? (
          <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="shrink-0">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono border border-white/10 text-muted-foreground/50 bg-white/3 shrink-0">
            ⌘K
          </kbd>
        )}
      </div>

      {open && q.length >= 1 && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-[100] rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(5,12,25,0.96)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,210,200,0.06)",
            minWidth: "340px",
            maxHeight: "480px",
            overflowY: "auto",
          }}
        >
          {!hasResults ? (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Δεν βρέθηκαν αποτελέσματα για <strong className="text-foreground">"{query}"</strong></p>
            </div>
          ) : (
            <div className="py-2">

              {/* eShop Products */}
              {matchedProducts.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                    <Package className="w-3 h-3" /> eShop
                  </p>
                  {matchedProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => go(`/eshop/${p.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left group"
                      data-testid={`search-result-product-${p.id}`}
                    >
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/8 shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">{highlight(p.name, query)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(p.price))}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
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
                  <div key={cat} className={hasBorder ? "border-t border-white/8 mt-1 pt-1" : ""}>
                    <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                      <CatIcon className="w-3 h-3" /> {meta.label}
                    </p>
                    {entries.map((entry) => {
                      const EntryIcon = entry.icon;
                      return (
                        <button
                          key={entry.href + entry.name}
                          onClick={() => go(entry.href)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left group"
                          data-testid={`search-result-${cat}-${entry.href.replace(/\//g, "-")}`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                            <EntryIcon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-foreground truncate">{highlight(entry.name, query)}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{entry.sub}</p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          <div className="px-3 py-2 border-t border-white/8 flex items-center gap-4 bg-white/2 sticky bottom-0">
            <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
              <kbd className="px-1 rounded border border-white/10 font-mono">↵</kbd> Μετάβαση
            </span>
            <span className="text-[9px] text-muted-foreground/50 flex items-center gap-1">
              <kbd className="px-1 rounded border border-white/10 font-mono">Esc</kbd> Κλείσιμο
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
