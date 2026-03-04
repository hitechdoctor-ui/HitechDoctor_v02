import { Link, useLocation } from "wouter";
import { Package, Users, ShoppingCart, LayoutDashboard, LogOut, Wrench, Euro, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: "/admin",                 label: "Dashboard",             icon: LayoutDashboard },
    { href: "/admin/repair-requests", label: "Αιτήματα Επισκευής",   icon: Wrench          },
    { href: "/admin/customers",       label: "Πελατολόγιο (CRM)",    icon: Users           },
    { href: "/admin/orders",          label: "Παραγγελίες",           icon: ShoppingCart    },
    { href: "/admin/products",        label: "Προϊόντα eShop",        icon: Package         },
    { href: "/admin/oikonomika",      label: "Οικονομικά",            icon: Euro            },
  ];

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

      <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Έξοδος στο Site
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar — always visible */}
      <aside className="hidden md:flex w-64 bg-card border-r border-white/5 flex-col sticky top-0 h-screen z-10 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar — slides in from left */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-card border-r border-white/5 flex flex-col z-50 md:hidden transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden min-w-0">
        {/* Mobile top bar */}
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
