import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, Package, Wrench, Smartphone, X, Laptop, Gamepad2, Tablet, Watch, ArrowRight } from "lucide-react";
import { type Product } from "@shared/schema";

// ── Static service entries ───────────────────────────────────────────────────
const SERVICES = [
  { name: "Επισκευή iPhone", href: "/services/episkeui-iphone", icon: Smartphone, sub: "Όλα τα μοντέλα" },
  { name: "Επισκευή Κινητών", href: "/services/episkeui-kiniton", icon: Smartphone, sub: "iPhone · Samsung · Xiaomi" },
  { name: "Επισκευή Laptop", href: "/services", icon: Laptop, sub: "Υπηρεσία" },
  { name: "Επισκευή Tablet", href: "/services", icon: Tablet, sub: "Υπηρεσία" },
  { name: "Επισκευή PlayStation", href: "/services", icon: Gamepad2, sub: "Υπηρεσία" },
  { name: "Επισκευή Υπολογιστή", href: "/services", icon: Laptop, sub: "Υπηρεσία" },
  { name: "Επισκευή Apple Watch", href: "/services", icon: Watch, sub: "Υπηρεσία" },
];

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

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K
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

  const matchedProducts = q.length >= 1
    ? (products ?? []).filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.slug?.toLowerCase().includes(q) ||
          (p.subcategory ?? "").toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedServices = q.length >= 1
    ? SERVICES.filter((s) => s.name.toLowerCase().includes(q) || s.sub.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const hasResults = matchedProducts.length > 0 || matchedServices.length > 0;

  function go(href: string) {
    setQuery("");
    setOpen(false);
    navigate(href);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
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

      {/* Dropdown results */}
      {open && q.length >= 1 && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-[100] rounded-2xl border border-white/10 overflow-hidden"
          style={{
            background: "rgba(5,12,25,0.96)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,210,200,0.06)",
          }}
        >
          {!hasResults ? (
            <div className="px-4 py-6 text-center">
              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Δεν βρέθηκαν αποτελέσματα για <strong className="text-foreground">"{query}"</strong></p>
            </div>
          ) : (
            <div className="py-2">
              {/* Products */}
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
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover border border-white/8 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {highlight(p.name, query)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(p.price))}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Services */}
              {matchedServices.length > 0 && (
                <div className={matchedProducts.length > 0 ? "border-t border-white/8 mt-1 pt-1" : ""}>
                  <p className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60 flex items-center gap-1.5">
                    <Wrench className="w-3 h-3" /> Υπηρεσίες
                  </p>
                  {matchedServices.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => go(s.href)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left group"
                      data-testid={`search-result-service-${s.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <s.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {highlight(s.name, query)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-white/8 flex items-center gap-4 bg-white/2">
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
