import { Link, useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import { Package, Users, ShoppingCart, LayoutDashboard, LogOut, Wrench, Euro, Menu, X, Shield, Globe, MessageSquare, Lock, Mail, Eye, EyeOff, UserCog, Download, Link2, Tag, RefreshCw, TableProperties } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import { notifyAdminAuthChange } from "@/lib/admin-auth-events";

const STORAGE_KEY = "hitech_admin_token";
/** Διακριτικός ήχος όταν αυξάνεται ο αριθμός μη ολοκληρωμένων παραγγελιών (public). */
const OPEN_ORDERS_NOTIFICATION_MP3 = "/notification.mp3";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type NavLinkItem = { href: string; label: string; icon: LucideIcon };

type NavBlock =
  | { kind: "links"; items: NavLinkItem[] }
  | { kind: "group"; title: string; items: NavLinkItem[] };

function linkIsActive(href: string, location: string): boolean {
  if (href === "/admin") return location === "/admin";
  return location.startsWith(href);
}

function AdminLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        notifyAdminAuthChange();
        onLogin(data.token);
      } else {
        setError(data.message || "Λάθος email ή κωδικός");
      }
    } catch {
      setError("Σφάλμα σύνδεσης — δοκιμάστε ξανά");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">HiTech Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Σύνδεση με email και κωδικό</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
              autoComplete="email"
              data-testid="input-admin-email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Κωδικός"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              required
              autoComplete="current-password"
              data-testid="input-admin-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">{error}</p>
          )}
          <Button type="submit" className="w-full h-11" disabled={loading} data-testid="button-admin-login">
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </Button>
        </form>
        <p className="text-center mt-6 text-xs text-muted-foreground/50">
          <Link href="/" className="hover:text-primary transition-colors">← Επιστροφή στο site</Link>
        </p>
      </div>
    </div>
  );
}

function decodeAdminToken(token: string | null): { name?: string; email?: string; role?: string } {
  if (!token) return {};
  try {
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch { return {}; }
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const [adminInfo, setAdminInfo] = useState(() => decodeAdminToken(
    (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })()
  ));

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.ok) {
          localStorage.removeItem(STORAGE_KEY);
          notifyAdminAuthChange();
          setToken(null);
        }
        else setAdminInfo({ name: d.name, email: d.email, role: d.role });
      })
      .catch(() => {});
  }, [token]);

  /** Ρόλος staff: μόνο «Αιτήματα Επισκευής» — όχι CRM, παραγγελίες κ.λπ. */
  useEffect(() => {
    if (adminInfo?.role !== "staff") return;
    const allowed =
      location === "/admin/repair-requests" || location.startsWith("/admin/repair-requests/");
    if (!allowed) setLocation("/admin/repair-requests");
  }, [adminInfo?.role, location, setLocation]);

  const { data: ordersList } = useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json() as Promise<{ status?: string }[]>;
    },
    enabled: !!token && adminInfo?.role !== "staff",
    refetchInterval: 30_000,
    staleTime: 0,
  });

  const openOrdersCount = useMemo(() => {
    if (!Array.isArray(ordersList)) return 0;
    return ordersList.filter((o) => o.status !== "completed").length;
  }, [ordersList]);

  const { data: repairRequestsList } = useQuery({
    queryKey: ["/api/admin/repair-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/repair-requests", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch repair requests");
      return res.json() as Promise<{ status?: string }[]>;
    },
    enabled: !!token,
    refetchInterval: 30_000,
    staleTime: 0,
  });

  /** Αιτήματα που δεν έχουν ολοκληρωθεί (ούτε ακυρωθεί) — το badge μένει μέχρι να κλείσουν όλα */
  const openRepairRequestsCount = useMemo(() => {
    if (!Array.isArray(repairRequestsList)) return 0;
    return repairRequestsList.filter(
      (r) => r.status !== "completed" && r.status !== "cancelled"
    ).length;
  }, [repairRequestsList]);

  const prevOpenOrdersRef = useRef<number | null>(null);

  useEffect(() => {
    if (!token || adminInfo?.role === "staff") {
      prevOpenOrdersRef.current = null;
      return;
    }
    const prev = prevOpenOrdersRef.current;
    if (prev !== null && openOrdersCount > prev) {
      const audio = new Audio(OPEN_ORDERS_NOTIFICATION_MP3);
      audio.volume = 0.35;
      void audio.play().catch(() => {});
    }
    prevOpenOrdersRef.current = openOrdersCount;
  }, [openOrdersCount, token, adminInfo?.role]);

  if (!token) return <AdminLogin onLogin={(t) => { setToken(t); setAdminInfo(decodeAdminToken(t)); }} />;

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    notifyAdminAuthChange();
    setToken(null);
  };

  const adminNavBlocks: NavBlock[] = [
    {
      kind: "links",
      items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      kind: "group",
      title: "Συνδρομές",
      items: [
        { href: "/admin/antivirus-subscriptions", label: "Συνδρομές Antivirus", icon: Shield },
        { href: "/admin/website-subscriptions", label: "Συνδρομές Ιστοσελίδων", icon: Globe },
      ],
    },
    {
      kind: "group",
      title: "CRM",
      items: [
        { href: "/admin/customers", label: "Πελατολόγιο (CRM)", icon: Users },
        { href: "/admin/hubspot", label: "HubSpot — Επαφές", icon: Link2 },
      ],
    },
    {
      kind: "group",
      title: "Αιτήματα",
      items: [
        { href: "/admin/repair-requests", label: "Αιτήματα Επισκευής", icon: Wrench },
        { href: "/admin/website-inquiries", label: "Αιτήματα Ιστοσελίδων", icon: MessageSquare },
      ],
    },
    {
      kind: "links",
      items: [
        { href: "/admin/orders", label: "Παραγγελίες", icon: ShoppingCart },
        { href: "/admin/products", label: "Προϊόντα eShop", icon: Package },
        { href: "/admin/sync", label: "Supplier Sync", icon: RefreshCw },
        { href: "/admin/repair-price-overrides", label: "Αντιστοιχίσεις επισκευών", icon: TableProperties },
        { href: "/admin/product-offer-interests", label: "Καλύτερη προσφορά", icon: Tag },
        { href: "/admin/oikonomika", label: "Οικονομικά", icon: Euro },
        { href: "/admin/ipsw-downloads", label: "IPSW λήψεις", icon: Download },
        { href: "/admin/users", label: "Διαχειριστές", icon: UserCog },
      ],
    },
  ];

  const staffNavBlocks: NavBlock[] = [
    {
      kind: "group",
      title: "Αιτήματα",
      items: [{ href: "/admin/repair-requests", label: "Αιτήματα Επισκευής", icon: Wrench }],
    },
  ];

  const navBlocks = adminInfo?.role === "staff" ? staffNavBlocks : adminNavBlocks;

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <h2 className="text-xl font-display font-bold">HiTech Admin</h2>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        {navBlocks.map((block, blockIdx) => {
          if (block.kind === "links") {
            return (
              <div key={`links-${blockIdx}`} className="flex flex-col gap-1">
                {block.items.map((link) => {
                  const isActive = linkIsActive(link.href, location);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm w-full ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <link.icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate text-left">{link.label}</span>
                      {link.href === "/admin/orders" && openOrdersCount > 0 && (
                        <span
                          className="shrink-0 min-h-[1.25rem] min-w-[1.25rem] px-1.5 rounded-full bg-yellow-400 text-black text-[10px] font-bold leading-none flex items-center justify-center tabular-nums shadow-sm ring-1 ring-yellow-500/30"
                          aria-label={`${openOrdersCount} παραγγελίες χωρίς κατάσταση ολοκλήρωσης`}
                          data-testid="badge-admin-open-orders"
                        >
                          {openOrdersCount > 99 ? "99+" : openOrdersCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          }

          return (
            <div key={block.title} className="flex flex-col gap-1">
              <p className="px-4 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {block.title}
              </p>
              <div className="flex flex-col gap-0.5 border-l border-white/10 ml-3 pl-2">
                {block.items.map((link) => {
                  const isActive = linkIsActive(link.href, location);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm w-full ${
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,229,255,0.08)]"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <link.icon className="w-4 h-4 shrink-0 opacity-90" />
                      <span className="flex-1 truncate text-left leading-snug">{link.label}</span>
                      {link.href === "/admin/repair-requests" && openRepairRequestsCount > 0 && (
                        <span
                          className="shrink-0 min-h-[1.25rem] min-w-[1.25rem] px-1.5 rounded-full bg-sky-400 text-black text-[10px] font-bold leading-none flex items-center justify-center tabular-nums shadow-sm ring-1 ring-sky-600/30"
                          aria-label={`${openRepairRequestsCount} αιτήματα επισκευής χωρίς ολοκλήρωση`}
                          data-testid="badge-admin-open-repair-requests"
                        >
                          {openRepairRequestsCount > 99 ? "99+" : openRepairRequestsCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        {adminInfo?.name && (
          <div className="px-3 py-2 mb-1 rounded-xl bg-white/5">
            <p className="text-xs font-semibold text-foreground truncate">{adminInfo.name}</p>
            <p className="text-xs text-muted-foreground truncate">{adminInfo.email}</p>
          </div>
        )}
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Έξοδος στο Site
          </Button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-400/60 hover:text-red-400 hover:bg-red-400/5"
          data-testid="button-admin-logout"
        >
          <Lock className="w-4 h-4 mr-2" />
          Αποσύνδεση
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 bg-card border-r border-white/5 flex-col sticky top-0 h-screen z-10 shrink-0">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-white/5 flex flex-col z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-x-hidden min-w-0">
        <div className="md:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-white/5 flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-white/10 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="btn-mobile-menu"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
          <span className="text-sm font-display font-bold text-primary">HiTech Admin</span>
        </div>

        <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
