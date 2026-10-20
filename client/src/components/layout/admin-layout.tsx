import { Link, useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import { Package, Users, ShoppingCart, LayoutDashboard, LogOut, Wrench, Euro, Menu, X, Shield, Globe, MessageSquare, Lock, UserCog, Download, Link2, Tag, RefreshCw, TableProperties, PieChart, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import { notifyAdminAuthChange } from "@/lib/admin-auth-events";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-auth-storage";
import { AdminAuthPanel, decodeAdminToken } from "@/pages/auth-page";
import { NotificationMonitor } from "@/components/admin/notification-monitor";

const STORAGE_KEY = ADMIN_TOKEN_STORAGE_KEY;
const SIDEBAR_EXPANDED_KEY = "hitech_admin_sidebar_expanded";
/** Διακριτικός ήχος όταν αυξάνεται ο αριθμός μη ολοκληρωμένων παραγγελιών (public). */
const OPEN_ORDERS_NOTIFICATION_MP3 = "/notification.mp3";

interface AdminLayoutProps {
  children: React.ReactNode;
}

type NavLinkItem = { href: string; label: string; icon: LucideIcon };

type NavBlock =
  | { kind: "links"; items: NavLinkItem[] }
  | { kind: "group"; title: string; items: NavLinkItem[] };

/** Μονοπάτια που επιτρέπονται μόνο στον κύριο διαχειριστή (SUPER_ADMIN_EMAIL / προεπιλογή). */
const SUPER_ADMIN_ROUTE_PREFIXES = [
  "/admin/insights",
  "/admin/antivirus-subscriptions",
  "/admin/website-subscriptions",
  "/admin/customers",
  "/admin/hubspot",
  "/admin/sync",
  "/admin/repair-price-overrides",
  "/admin/oikonomika",
  "/admin/ipsw-downloads",
  "/admin/users",
] as const;

function isSuperAdminOnlyPath(path: string): boolean {
  return SUPER_ADMIN_ROUTE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
}

function filterNavBlocksForNonSuper(blocks: NavBlock[]): NavBlock[] {
  return blocks
    .map((block) => {
      if (block.kind === "links") {
        return { ...block, items: block.items.filter((l) => !isSuperAdminOnlyPath(l.href)) };
      }
      return {
        ...block,
        items: block.items.filter((l) => !isSuperAdminOnlyPath(l.href)),
      };
    })
    .filter((block) => block.items.length > 0);
}

function linkIsActive(href: string, location: string): boolean {
  if (href === "/admin") return location === "/admin";
  return location.startsWith(href);
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_EXPANDED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const [adminInfo, setAdminInfo] = useState(() => decodeAdminToken(
    (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })()
  ));

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, sidebarExpanded ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [sidebarExpanded]);

  /** Token από Google OAuth redirect (#hitech_google_auth=...) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    const prefix = "#hitech_google_auth=";
    if (!hash.startsWith(prefix)) return;
    try {
      const raw = decodeURIComponent(hash.slice(prefix.length));
      localStorage.setItem(STORAGE_KEY, raw);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      notifyAdminAuthChange();
      setToken(raw);
      setAdminInfo(decodeAdminToken(raw));
    } catch {
      /* ignore */
    }
  }, []);

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
        else setAdminInfo({ name: d.name, email: d.email, role: d.role, superAdmin: !!d.superAdmin });
      })
      .catch(() => {});
  }, [token]);

  /** Μη κύριος διαχειριστής: αποκλεισμός σελίδων Analytics / CRM / ρυθμίσεις κ.λπ. */
  useEffect(() => {
    if (!token || adminInfo?.role === "staff") return;
    if (adminInfo?.superAdmin !== false) return;
    if (!isSuperAdminOnlyPath(location)) return;
    setLocation("/admin");
  }, [token, adminInfo?.role, adminInfo?.superAdmin, location, setLocation]);

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

  if (!token) {
    return (
      <AdminAuthPanel
        onLogin={(t) => {
          setToken(t);
          setAdminInfo(decodeAdminToken(t));
        }}
      />
    );
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    notifyAdminAuthChange();
    setToken(null);
  };

  const adminNavBlocks: NavBlock[] = [
    {
      kind: "links",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/insights", label: "Analytics Insights", icon: PieChart },
      ],
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
        { href: "/admin/settings", label: "Ρυθμίσεις", icon: Settings },
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

  const navBlocks =
    adminInfo?.role === "staff"
      ? staffNavBlocks
      : adminInfo?.superAdmin === true
        ? adminNavBlocks
        : filterNavBlocksForNonSuper(adminNavBlocks);

  const renderNavLink = (link: NavLinkItem, compact: boolean) => {
    const isActive = linkIsActive(link.href, location);
    const badge =
      link.href === "/admin/orders" && openOrdersCount > 0 ? (
        <span
          className={
            compact
              ? "absolute -top-0.5 -right-0.5 min-h-[1rem] min-w-[1rem] px-0.5 rounded-full bg-yellow-400 text-black text-[9px] font-bold leading-none flex items-center justify-center tabular-nums"
              : "shrink-0 min-h-[1.25rem] min-w-[1.25rem] px-1.5 rounded-full bg-yellow-400 text-black text-[10px] font-bold leading-none flex items-center justify-center tabular-nums shadow-sm ring-1 ring-yellow-500/30"
          }
          aria-label={`${openOrdersCount} παραγγελίες χωρίς κατάσταση ολοκλήρωσης`}
          data-testid="badge-admin-open-orders"
        >
          {openOrdersCount > 99 ? "99+" : openOrdersCount}
        </span>
      ) : link.href === "/admin/repair-requests" && openRepairRequestsCount > 0 ? (
        <span
          className={
            compact
              ? "absolute -top-0.5 -right-0.5 min-h-[1rem] min-w-[1rem] px-0.5 rounded-full bg-sky-400 text-black text-[9px] font-bold leading-none flex items-center justify-center tabular-nums"
              : "shrink-0 min-h-[1.25rem] min-w-[1.25rem] px-1.5 rounded-full bg-sky-400 text-black text-[10px] font-bold leading-none flex items-center justify-center tabular-nums shadow-sm ring-1 ring-sky-600/30"
          }
          aria-label={`${openRepairRequestsCount} αιτήματα επισκευής χωρίς ολοκλήρωση`}
          data-testid="badge-admin-open-repair-requests"
        >
          {openRepairRequestsCount > 99 ? "99+" : openRepairRequestsCount}
        </span>
      ) : null;

    if (compact) {
      return (
        <Tooltip key={link.href} delayDuration={150}>
          <TooltipTrigger asChild>
            <Link
              href={link.href}
              aria-label={link.label}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,229,255,0.1)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
              }`}
            >
              <span className="relative inline-flex">
                <link.icon className="w-4.5 h-4.5 shrink-0" />
                {badge}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10} className="border-white/10 bg-card text-foreground">
            {link.label}
          </TooltipContent>
        </Tooltip>
      );
    }

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
        <span className="flex-1 truncate text-left leading-snug">{link.label}</span>
        {badge}
      </Link>
    );
  };

  const SidebarContent = ({
    compact = false,
    showDesktopToggle = false,
  }: {
    compact?: boolean;
    showDesktopToggle?: boolean;
  }) => (
    <>
      <div
        className={`border-b border-white/5 flex ${
          compact ? "flex-col items-center gap-1.5 p-2" : "items-center gap-2 p-5 justify-between"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity min-w-0"
          title="HiTech Admin"
        >
          {compact ? (
            <span className="text-sm font-display font-bold tracking-tight py-1">HT</span>
          ) : (
            <h2 className="text-xl font-display font-bold truncate">HiTech Admin</h2>
          )}
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          {showDesktopToggle ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSidebarExpanded((v) => !v)}
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  aria-label={sidebarExpanded ? "Σύμπτυξη μενού" : "Επέκταση μενού"}
                  aria-expanded={sidebarExpanded}
                >
                  {sidebarExpanded ? (
                    <PanelLeftClose className="w-4 h-4" />
                  ) : (
                    <PanelLeftOpen className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="border-white/10 bg-card text-foreground">
                {sidebarExpanded ? "Σύμπτυξη" : "Επέκταση"}
              </TooltipContent>
            </Tooltip>
          ) : null}
          {!compact && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Κλείσιμο μενού"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <nav className={`flex-1 flex flex-col overflow-y-auto overflow-x-visible ${compact ? "p-2 gap-2" : "p-4 gap-3"}`}>
        {navBlocks.map((block, blockIdx) => {
          if (block.kind === "links") {
            return (
              <div key={`links-${blockIdx}`} className={`flex flex-col ${compact ? "gap-1.5" : "gap-1"}`}>
                {block.items.map((link) => renderNavLink(link, compact))}
              </div>
            );
          }

          return (
            <div key={block.title} className={`flex flex-col ${compact ? "gap-1.5" : "gap-1"}`}>
              {compact ? (
                <div className="mx-2 my-1 border-t border-white/10" title={block.title} aria-hidden />
              ) : (
                <p className="px-4 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {block.title}
                </p>
              )}
              <div className={compact ? "flex flex-col gap-1.5" : "flex flex-col gap-0.5 border-l border-white/10 ml-3 pl-2"}>
                {block.items.map((link) => renderNavLink(link, compact))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className={`border-t border-white/5 space-y-1 ${compact ? "p-2" : "p-4"}`}>
        {!compact && adminInfo?.name && (
          <div className="px-3 py-2 mb-1 rounded-xl bg-white/5">
            <p className="text-xs font-semibold text-foreground truncate">{adminInfo.name}</p>
            <p className="text-xs text-muted-foreground truncate">{adminInfo.email}</p>
          </div>
        )}
        {compact ? (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/" aria-label="Έξοδος στο Site" className="flex justify-center">
                  <Button variant="ghost" className="w-10 h-10 p-0 text-muted-foreground hover:text-foreground">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="border-white/10 bg-card text-foreground">
                Έξοδος στο Site
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  aria-label="Αποσύνδεση"
                  className="w-10 h-10 mx-auto p-0 text-red-400/60 hover:text-red-400 hover:bg-red-400/5"
                  data-testid="button-admin-logout"
                >
                  <Lock className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="border-white/10 bg-card text-foreground">
                Αποσύνδεση
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </>
  );

  const desktopCompact = !sidebarExpanded;

  return (
    <TooltipProvider delayDuration={150}>
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn(
          "hidden md:flex bg-card border-r border-white/5 flex-col sticky top-0 h-screen z-20 shrink-0 transition-[width] duration-200 ease-out",
          desktopCompact ? "w-16" : "w-64",
        )}
      >
        <SidebarContent compact={desktopCompact} showDesktopToggle />
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

        {/* Extra bottom/right padding so floating notifications δεν καλύπτουν περιεχόμενο */}
        <div className="p-3 sm:p-5 md:p-6 lg:p-8 max-w-7xl mx-auto pb-24 pr-4 sm:pr-6 md:pr-8 lg:pr-10">
          {children}
        </div>
      </main>

      {/* Browser notifications + sound + favicon badge for νέες φόρμες */}
      <NotificationMonitor enabled={!!token && adminInfo?.role !== "staff"} />
    </div>
    </TooltipProvider>
  );
}
