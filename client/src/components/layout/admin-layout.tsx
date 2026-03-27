import { Link, useLocation } from "wouter";
import { Package, Users, ShoppingCart, LayoutDashboard, LogOut, Wrench, Euro, Menu, X, Shield, Globe, MessageSquare, Lock, Mail, Eye, EyeOff, UserCog, Download, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

const STORAGE_KEY = "hitech_admin_token";

interface AdminLayoutProps {
  children: React.ReactNode;
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
        if (!d.ok) { localStorage.removeItem(STORAGE_KEY); setToken(null); }
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

  if (!token) return <AdminLogin onLogin={(t) => { setToken(t); setAdminInfo(decodeAdminToken(t)); }} />;

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  const allLinks = [
    { href: "/admin",                              label: "Dashboard",                 icon: LayoutDashboard },
    { href: "/admin/repair-requests",              label: "Αιτήματα Επισκευής",        icon: Wrench          },
    { href: "/admin/website-inquiries",            label: "Αιτήματα Ιστοσελίδων",     icon: MessageSquare   },
    { href: "/admin/antivirus-subscriptions",      label: "Συνδρομές Antivirus",       icon: Shield          },
    { href: "/admin/website-subscriptions",        label: "Συνδρομές Ιστοσελίδων",    icon: Globe           },
    { href: "/admin/customers",                    label: "Πελατολόγιο (CRM)",         icon: Users           },
    { href: "/admin/hubspot",                     label: "HubSpot",                   icon: Link2           },
    { href: "/admin/orders",                       label: "Παραγγελίες",               icon: ShoppingCart    },
    { href: "/admin/products",                     label: "Προϊόντα eShop",            icon: Package         },
    { href: "/admin/oikonomika",                   label: "Οικονομικά",                icon: Euro            },
    { href: "/admin/ipsw-downloads",               label: "IPSW λήψεις",               icon: Download        },
    { href: "/admin/users",                        label: "Διαχειριστές",              icon: UserCog         },
  ];

  const links =
    adminInfo?.role === "staff"
      ? allLinks.filter((l) => l.href === "/admin/repair-requests")
      : allLinks;

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

      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? location === "/admin"
              : location.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {link.label}
            </Link>
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
