import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useCustomers } from "@/hooks/use-customers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package, ShoppingCart, Users, Wrench, MessageSquare,
  Hash, Smartphone, Phone, Mail,
  Lock, Search, X, ExternalLink, Tag, Loader2,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  apiRequest,
  getAdminAuthHeaders,
  invalidateRepairFinancialQueries,
} from "@/lib/queryClient";
import { type RepairRequest, type Product, type ProductOfferInterest, type WebsiteInquiry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import {
  RepairStatusBadge,
  RepairIdBadge,
  REPAIR_STATUSES,
  repairStatusRowClass,
} from "@/components/admin/repair-detail-panel";

const STATUSES = REPAIR_STATUSES;

function StatusBadge({ status }: { status: string }) {
  return <RepairStatusBadge status={status} />;
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
        className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
        data-testid={testId}
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="shrink-0" aria-label="Καθαρισμός αναζήτησης">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" aria-hidden />
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
    queryKey: ["/api/admin/repair-requests"],
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/repair-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
      invalidateRepairFinancialQueries(queryClient);
      toast({ title: "Ενημερώθηκε", description: "Η κατάσταση αποθηκεύτηκε." });
    },
    onError: () => {
      toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης.", variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    if (!requests) return [];
    const q = search.toLowerCase().trim();
    return requests
      .filter((r) => {
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
      })
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta || b.id - a.id;
      });
  }, [requests, search, statusFilter]);

  const preview = filtered.slice(0, 5);
  const hasMore = filtered.length > 5;

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden">
      <div className="flex flex-col gap-2.5 px-3.5 sm:px-4 py-3 border-b border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-display font-bold tracking-tight">Αιτήματα Επισκευής</h2>
              <p className="text-[11px] text-muted-foreground">
                {preview.length} πιο πρόσφατα · {requests?.length ?? 0} σύνολο
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5">
              {STATUSES.map((s) => <StatusBadge key={s.value} status={s.value} />)}
            </div>
            <Link
              href="/admin/repair-requests"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
            >
              Όλα
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Αναζήτηση πελάτη, συσκευής, serial..."
            testId="input-repair-search"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 text-xs w-40 border-white/10 bg-background/40" data-testid="select-status-filter">
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
      </div>
      <div className="px-3.5 sm:px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin mr-3" />
            Φόρτωση αιτημάτων...
          </div>
        ) : preview.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground mb-0.5">
              {search || statusFilter !== "all" ? "Δεν βρέθηκαν αποτελέσματα" : "Κανένα αίτημα ακόμη"}
            </p>
            <p className="text-xs text-muted-foreground">
              {search ? `Δοκιμάστε διαφορετική αναζήτηση` : "Τα αιτήματα επισκευής θα εμφανιστούν εδώ."}
            </p>
          </div>
        ) : (
          <div>
            <div className="hidden lg:grid grid-cols-[auto_minmax(7rem,1fr)_minmax(9rem,1.1fr)_minmax(8rem,1.1fr)_minmax(6rem,0.9fr)_auto_auto] gap-3 px-1 pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>#</span>
              <span>Πελάτης</span>
              <span>Επικοινωνία</span>
              <span>Συσκευή</span>
              <span>Serial / Κωδικός</span>
              <span>Ημερομηνία</span>
              <span>Κατάσταση</span>
            </div>
            <ul className="flex flex-col gap-2.5">
              {preview.map((req) => (
                <li
                  key={req.id}
                  className={`rounded-xl border px-3 py-2.5 transition-colors ${repairStatusRowClass(req.status)}`}
                  data-testid={`row-repair-${req.id}`}
                >
                  <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[auto_minmax(7rem,1fr)_minmax(9rem,1.1fr)_minmax(8rem,1.1fr)_minmax(6rem,0.9fr)_auto_auto] lg:items-center lg:gap-3">
                    <RepairIdBadge id={req.id} status={req.status} />
                    <p className="font-semibold text-foreground text-sm">{req.firstName} {req.lastName}</p>
                    <div className="flex flex-col gap-0.5">
                      <a href={`tel:${req.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-3 h-3 text-primary shrink-0" />{req.phone}
                      </a>
                      <a href={`mailto:${req.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="w-3 h-3 text-primary shrink-0" />{req.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-1.5 min-w-0">
                      <Smartphone className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{req.deviceName}</p>
                        {req.notes && (
                          <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={req.notes}>
                            {req.notes}
                          </p>
                        )}
                      </div>
                    </div>
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
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(req.createdAt)}</span>
                    <Select
                      value={req.status}
                      onValueChange={(val) => statusMutation.mutate({ id: req.id, status: val })}
                    >
                      <SelectTrigger className="h-8 text-xs w-full lg:w-40 border-white/15 bg-background/50" data-testid={`select-status-${req.id}`}>
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
                  </div>
                </li>
              ))}
            </ul>
            {hasMore ? (
              <div className="mt-3 pt-3 border-t border-white/8 flex justify-center">
                <Link
                  href="/admin/repair-requests"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Δες όλα τα αιτήματα ({filtered.length})
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
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
    return products
      .filter((p) => {
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.slug ?? "").toLowerCase().includes(q);
        const matchesCat =
          categoryFilter === "all" ||
          (p.subcategory ?? p.category) === categoryFilter;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta || b.id - a.id;
      });
  }, [products, search, categoryFilter]);

  const preview = filtered.slice(0, 5);
  const hasMore = filtered.length > 5;

  const formatPrice = (price: string | number) =>
    new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(price));

  return (
    <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden">
      <div className="flex flex-col gap-2.5 px-3.5 sm:px-4 py-3 border-b border-white/8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-display font-bold tracking-tight">eShop Προϊόντα</h2>
              <p className="text-[11px] text-muted-foreground">
                {preview.length} πιο πρόσφατα · {products?.length ?? 0} σύνολο
              </p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Όλα
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Αναζήτηση προϊόντος..."
            testId="input-eshop-search"
          />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-xs w-44 border-white/10 bg-background/40" data-testid="select-category-filter">
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
      </div>
      <div className="px-3.5 sm:px-4 py-3">
        {preview.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              {search ? "Δεν βρέθηκαν προϊόντα" : "Κανένα προϊόν"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {preview.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-white/8 hover:border-primary/25 hover:bg-primary/[0.04] transition-colors bg-background/20"
                  data-testid={`card-product-admin-${p.id}`}
                >
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-white/8 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-xs text-primary font-bold mt-0.5">{formatPrice(p.price)}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.subcategory ?? p.category}</p>
                  </div>
                  <Link href={`/eshop/${p.slug}`}>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-primary transition-colors shrink-0" />
                  </Link>
                </div>
              ))}
            </div>
            {hasMore ? (
              <div className="mt-3 pt-3 border-t border-white/8 flex justify-center">
                <Link
                  href="/admin/products"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Δες όλα τα προϊόντα ({filtered.length})
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

// ── Πελάτες eShop: καλύτερη προσφορά (Dashboard) ────────────────────────────
function ProductOfferInterestsCustomersSection({
  rows,
  isLoading,
}: {
  rows: ProductOfferInterest[];
  isLoading: boolean;
}) {
  const recent = useMemo(() => rows.slice(0, 5), [rows]);
  const hasMore = rows.length > 5;

  return (
    <section className="rounded-2xl border border-white/10 border-l-[3px] border-l-orange-500/50 bg-gradient-to-b from-orange-500/[0.06] to-transparent overflow-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-3.5 sm:px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-display font-bold tracking-tight">Πελάτες eShop — Καλύτερη προσφορά</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xl">
              {recent.length} πιο πρόσφατα · {rows.length} σύνολο
            </p>
          </div>
        </div>
        <Link
          href="/admin/product-offer-interests"
          className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
        >
          Όλες οι εγγραφές
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      <div className="px-3.5 sm:px-4 py-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Φόρτωση…
          </div>
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Δεν υπάρχουν αιτήματα ακόμα.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px] uppercase tracking-wider">Ημερομηνία</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Όνομα</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Email</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Κινητό</TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider">Προϊόν</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap py-2.5">
                      {formatDate(row.createdAt)}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-foreground py-2.5">{row.customerName}</TableCell>
                    <TableCell className="py-2.5">
                      <a
                        href={`mailto:${row.email}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {row.email}
                      </a>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <a
                        href={`tel:${row.phone.replace(/\s/g, "")}`}
                        className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                      >
                        <Phone className="w-3 h-3 shrink-0" />
                        {row.phone}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-[200px] py-2.5">
                      <p className="text-xs text-foreground truncate" title={row.productName}>
                        {row.productName}
                      </p>
                      {row.productSlug ? (
                        <Link
                          href={`/eshop/${row.productSlug}`}
                          className="text-[10px] text-primary/80 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Άνοιγμα προϊόντος →
                        </Link>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {hasMore ? (
              <div className="mt-3 pt-3 border-t border-white/8 flex justify-center">
                <Link
                  href="/admin/product-offer-interests"
                  className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                >
                  Δες όλες τις εγγραφές ({rows.length})
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: adminMe } = useQuery({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      const res = await fetch("/api/admin/me", { headers: getAdminAuthHeaders() });
      return res.json() as Promise<{ ok: boolean; superAdmin?: boolean }>;
    },
  });
  const superAdmin = !!(adminMe?.ok && adminMe.superAdmin);

  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers({ enabled: superAdmin });
  const { data: repairRequests } = useQuery<RepairRequest[]>({
    queryKey: ["/api/admin/repair-requests"],
  });
  const { data: websiteInquiries = [] } = useQuery<WebsiteInquiry[]>({
    queryKey: ["/api/website-inquiries"],
    queryFn: async () => {
      const res = await fetch("/api/website-inquiries", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch website inquiries");
      return res.json();
    },
  });
  const { data: offerInterests = [], isLoading: offerInterestsLoading } = useQuery<ProductOfferInterest[]>({
    queryKey: ["admin-product-offer-interests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/product-offer-interests", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch offer interests");
      return res.json();
    },
  });

  const pendingRepairs = repairRequests?.filter((r) => r.status === "pending").length ?? 0;
  const pendingInquiries = websiteInquiries.filter((i) => i.status === "pending").length;
  const formNewTotal = pendingInquiries + offerInterests.length;

  const stats = useMemo(() => {
    const formParts: string[] = [];
    if (pendingInquiries > 0) {
      formParts.push(
        `${pendingInquiries} ${pendingInquiries === 1 ? "ιστοσελίδα" : "ιστοσελίδες"}`,
      );
    }
    if (offerInterests.length > 0) {
      formParts.push(
        `${offerInterests.length} ${offerInterests.length === 1 ? "προσφορά" : "προσφορές"} eShop`,
      );
    }

    const rows: Array<{
      title: string;
      value: string | number;
      icon: typeof MessageSquare;
      color: string;
      subtext?: string;
      subtextClass?: string;
      href?: string;
    }> = [
      {
        title: "Φόρμες επικοινωνίας",
        value: formNewTotal,
        icon: MessageSquare,
        color: formNewTotal > 0 ? "text-amber-400" : "text-green-400",
        subtext:
          formNewTotal > 0
            ? formParts.join(" · ") || `${formNewTotal} νέα`
            : "Κανένα νέο",
        subtextClass: formNewTotal > 0 ? "text-amber-400" : "text-muted-foreground",
        href:
          pendingInquiries > 0
            ? "/admin/website-inquiries"
            : offerInterests.length > 0
              ? "/admin/product-offer-interests"
              : "/admin/website-inquiries",
      },
      { title: "Παραγγελίες", value: orders?.length ?? 0, icon: ShoppingCart, color: "text-blue-400" },
      { title: "Προϊόντα", value: products?.length ?? 0, icon: Package, color: "text-purple-400" },
    ];
    if (superAdmin) {
      rows.push({
        title: "Πελάτες",
        value: customers?.length ?? 0,
        icon: Users,
        color: "text-orange-400",
      });
    }
    rows.push({
      title: "Αιτήματα Επισκευής",
      value: repairRequests?.length ?? 0,
      icon: Wrench,
      color: "text-primary",
      subtext: pendingRepairs > 0 ? `${pendingRepairs} νέα` : undefined,
      href: "/admin/repair-requests",
    });
    return rows;
  }, [
    formNewTotal,
    pendingInquiries,
    offerInterests.length,
    orders,
    products,
    customers,
    repairRequests?.length,
    pendingRepairs,
    superAdmin,
  ]);

  return (
    <AdminLayout>
      <Seo title="Dashboard" description="Admin Dashboard" />

      <div className="-mt-1 mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground">
            Επισκόπηση
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Μηνύματα · επισκευές · eShop
          </p>
        </div>
        <Link
          href="/admin/repair-requests"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          Αιτήματα επισκευής
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {superAdmin ? (
        <div className="mb-4">
          <AnalyticsDashboard />
        </div>
      ) : null}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-5">
        {stats.map((stat, i) => {
          const inner = (
            <div
              className={`relative h-full overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.06] to-transparent px-3.5 py-3.5 transition-all ${
                stat.href ? "hover:border-primary/35 hover:from-primary/[0.08]" : ""
              } ${
                i === 0 && formNewTotal > 0
                  ? "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                  {stat.title}
                </p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-background/40 border border-white/10 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-[1.75rem] font-extrabold tabular-nums tracking-tight text-foreground">
                {stat.value}
              </div>
              {stat.subtext && (
                <p
                  className={`text-[11px] mt-1 font-medium truncate ${
                    "subtextClass" in stat && stat.subtextClass ? stat.subtextClass : "text-yellow-400"
                  }`}
                >
                  {stat.subtext}
                </p>
              )}
            </div>
          );
          if (stat.href) {
            return (
              <Link
                key={i}
                href={stat.href}
                className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {inner}
              </Link>
            );
          }
          return <div key={i}>{inner}</div>;
        })}
      </div>

      <div className="mb-4">
        <RepairRequestsSection />
      </div>

      {offerInterests.length > 0 ? (
        <div className="mb-4">
          <ProductOfferInterestsCustomersSection rows={offerInterests} isLoading={offerInterestsLoading} />
        </div>
      ) : null}

      <EShopSearchSection />
    </AdminLayout>
  );
}
