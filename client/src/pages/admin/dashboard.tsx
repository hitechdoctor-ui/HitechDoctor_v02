import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useCustomers } from "@/hooks/use-customers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package, ShoppingCart, Users, Euro, Wrench,
  Clock, CheckCircle2, XCircle, AlertCircle, Hash, Smartphone, Phone, Mail,
  Lock, Search, X, ExternalLink,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { type RepairRequest, type Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Link } from "wouter";

// ── Status config ────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "pending", label: "Νέο", icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "in-progress", label: "Σε Εξέλιξη", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  { value: "completed", label: "Ολοκληρώθηκε", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  { value: "cancelled", label: "Ακυρώθηκε", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUSES.find((s) => s.value === status) ?? STATUSES[0];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(dateStr));
}

// ── Inline Search Input ──────────────────────────────────────────────────────
function SearchInput({
  value, onChange, placeholder, testId,
}: { value: string; onChange: (v: string) => void; placeholder: string; testId: string }) {
  return (
    <div className="flex items-center gap-2 px-3 h-9 rounded-xl border border-white/10 bg-card hover:border-white/20 focus-within:border-primary/40 focus-within:shadow-[0_0_0_2px_rgba(0,210,200,0.1)] transition-all w-full max-w-sm">
      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
        data-testid={testId}
      />
      {value && (
        <button onClick={() => onChange("")} className="shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      )}
    </div>
  );
}

// ── Repair Requests Table ────────────────────────────────────────────────────
function RepairRequestsSection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: requests, isLoading } = useQuery<RepairRequest[]>({
    queryKey: ["/api/repair-requests"],
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/repair-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests"] });
      toast({ title: "Ενημερώθηκε", description: "Η κατάσταση αποθηκεύτηκε." });
    },
    onError: () => {
      toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης.", variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    if (!requests) return [];
    const q = search.toLowerCase().trim();
    return requests.filter((r) => {
      const matchesSearch =
        !q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.deviceName.toLowerCase().includes(q) ||
        r.serialNumber.toLowerCase().includes(q) ||
        (r.notes ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  return (
    <Card className="bg-card border-white/8">
      <CardHeader className="flex flex-col gap-3 pb-4 border-b border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Wrench className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-display font-bold">Αιτήματα Επισκευής</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {filtered.length} / {requests?.length ?? 0} αιτήματα
              </p>
            </div>
          </div>
          {/* Status legend desktop */}
          <div className="hidden lg:flex items-center gap-2">
            {STATUSES.map((s) => <StatusBadge key={s.value} status={s.value} />)}
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Αναζήτηση πελάτη, συσκευής, serial..."
            testId="input-repair-search"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-40 border-white/10 bg-card" data-testid="select-status-filter">
              <SelectValue placeholder="Κατάσταση" />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10">
              <SelectItem value="all" className="text-xs">Όλες</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  <StatusBadge status={s.value} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin mr-3" />
            Φόρτωση αιτημάτων...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              {search || statusFilter !== "all" ? "Δεν βρέθηκαν αποτελέσματα" : "Κανένα αίτημα ακόμη"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search ? `Δοκιμάστε διαφορετική αναζήτηση` : "Τα αιτήματα επισκευής θα εμφανιστούν εδώ."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-left">
                  {["#", "Πελάτης", "Επικοινωνία", "Συσκευή", "Serial / Κωδικός", "Ημερομηνία", "Κατάσταση"].map((h) => (
                    <th key={h} className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-white/3 transition-colors" data-testid={`row-repair-${req.id}`}>
                    <td className="py-4 pr-4">
                      <span className="text-xs font-mono text-muted-foreground">#{req.id}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-foreground text-sm">{req.firstName} {req.lastName}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <a href={`tel:${req.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Phone className="w-3 h-3 text-primary shrink-0" />{req.phone}
                        </a>
                        <a href={`mailto:${req.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-3 h-3 text-primary shrink-0" />{req.email}
                        </a>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-start gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{req.deviceName}</p>
                          {req.notes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[160px] truncate" title={req.notes}>
                              {req.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-primary shrink-0" />
                          <span className="text-xs font-mono text-foreground">{req.serialNumber}</span>
                        </div>
                        {req.deviceCode && (
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-primary shrink-0" />
                            <span className="text-xs font-mono text-muted-foreground">{req.deviceCode}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(req.createdAt)}</span>
                    </td>
                    <td className="py-4">
                      <Select
                        value={req.status}
                        onValueChange={(val) => statusMutation.mutate({ id: req.id, status: val })}
                      >
                        <SelectTrigger className="h-8 text-xs w-40 border-white/10 bg-card" data-testid={`select-status-${req.id}`}>
                          <SelectValue><StatusBadge status={req.status} /></SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-background border-white/10">
                          {STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value} className="text-xs">
                              <StatusBadge status={s.value} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── eShop Product Search ─────────────────────────────────────────────────────
function EShopSearchSection() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.slug ?? "").toLowerCase().includes(q);
      const matchesCat =
        categoryFilter === "all" ||
        (p.subcategory ?? p.category) === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [products, search, categoryFilter]);

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(price));

  return (
    <Card className="bg-card border-white/8">
      <CardHeader className="flex flex-col gap-3 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Package className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-base font-display font-bold">eShop Προϊόντα</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} / {products?.length ?? 0} προϊόντα
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Αναζήτηση προϊόντος..."
            testId="input-eshop-search"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-xs w-44 border-white/10 bg-card" data-testid="select-category-filter">
              <SelectValue placeholder="Κατηγορία" />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10">
              <SelectItem value="all" className="text-xs">Όλες οι Κατηγορίες</SelectItem>
              <SelectItem value="screen-protectors" className="text-xs">Τζάμια Προστασίας</SelectItem>
              <SelectItem value="cases" className="text-xs">Θήκες</SelectItem>
              <SelectItem value="chargers" className="text-xs">Φορτιστές & Καλώδια</SelectItem>
              <SelectItem value="repair" className="text-xs">Επισκευές</SelectItem>
              <SelectItem value="service" className="text-xs">Υπηρεσίες</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">
              {search ? "Δεν βρέθηκαν προϊόντα" : "Κανένα προϊόν"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-white/8 hover:border-white/15 transition-colors bg-background/30"
                data-testid={`card-product-admin-${p.id}`}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover border border-white/8 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-primary font-bold mt-0.5">{formatPrice(p.price)}</p>
                  <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{p.subcategory ?? p.category}</p>
                </div>
                <Link href={`/eshop/${p.slug}`}>
                  <ExternalLink className="w-4 h-4 text-muted-foreground/40 hover:text-primary transition-colors shrink-0" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const { data: repairRequests } = useQuery<RepairRequest[]>({
    queryKey: ["/api/repair-requests"],
  });

  const totalRevenue = orders?.reduce((sum, order) => {
    if (order.status !== "cancelled") return sum + Number(order.totalAmount);
    return sum;
  }, 0) || 0;

  const pendingRepairs = repairRequests?.filter((r) => r.status === "pending").length ?? 0;

  const stats = [
    {
      title: "Συνολικά Έσοδα",
      value: new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(totalRevenue),
      icon: Euro, color: "text-green-400",
    },
    { title: "Παραγγελίες", value: orders?.length ?? 0, icon: ShoppingCart, color: "text-blue-400" },
    { title: "Προϊόντα", value: products?.length ?? 0, icon: Package, color: "text-purple-400" },
    { title: "Πελάτες", value: customers?.length ?? 0, icon: Users, color: "text-orange-400" },
    {
      title: "Αιτήματα Επισκευής",
      value: repairRequests?.length ?? 0,
      icon: Wrench, color: "text-primary",
      subtext: pendingRepairs > 0 ? `${pendingRepairs} νέα` : undefined,
    },
  ];

  return (
    <AdminLayout>
      <Seo title="Dashboard" description="Admin Dashboard" />

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Επισκόπηση</h1>
        <p className="text-muted-foreground mt-1">Αιτήματα επισκευής, προϊόντα eShop και στατιστικά</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-white/5 tech-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtext && (
                <p className="text-xs text-yellow-400 mt-0.5 font-medium">{stat.subtext}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Repair Requests (service CRM) ── */}
      <div className="mb-6">
        <RepairRequestsSection />
      </div>

      {/* ── eShop Product Search ── */}
      <EShopSearchSection />
    </AdminLayout>
  );
}
