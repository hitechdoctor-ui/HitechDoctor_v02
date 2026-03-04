import { Link, useLocation } from "wouter";
import { Package, Users, ShoppingCart, LayoutDashboard, LogOut, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const links = [
    { href: "/admin",                 label: "Dashboard",             icon: LayoutDashboard },
    { href: "/admin/repair-requests", label: "Αιτήματα Επισκευής",   icon: Wrench          },
    { href: "/admin/customers",       label: "Πελατολόγιο (CRM)",    icon: Users           },
    { href: "/admin/orders",          label: "Παραγγελίες",           icon: ShoppingCart    },
    { href: "/admin/products",        label: "Προϊόντα eShop",        icon: Package         },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-white/5 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <h2 className="text-2xl font-display font-bold">HiTech Admin</h2>
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive =
              link.href === "/admin"
                ? location === "/admin"
                : location.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
