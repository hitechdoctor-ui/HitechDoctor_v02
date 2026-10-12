import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, MapPin, Calendar, Clock, ShoppingCart, Wrench, Package,
  ArrowLeft, Edit, ExternalLink, CheckCircle2, AlertCircle, XCircle, Tag,
} from "lucide-react";
import type { Customer, Order, RepairRequest, ProductOfferInterest } from "@shared/schema";
import { getAdminAuthHeaders } from "@/lib/queryClient";

// ── Status badge helpers ──────────────────────────────────────────────────────
const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Εκκρεμεί", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: Clock },
  processing: { label: "Επεξεργασία", color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: Clock },
  shipped: { label: "Απεστάλη", color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30", icon: Package },
  delivered: { label: "Παραδόθηκε", color: "text-green-400 bg-green-400/10 border-green-400/30", icon: CheckCircle2 },
  completed: { label: "Ολοκληρώθηκε", color: "text-green-400 bg-green-400/10 border-green-400/30", icon: CheckCircle2 },
  cancelled: { label: "Ακυρώθηκε", color: "text-red-400 bg-red-400/10 border-red-400/30", icon: XCircle },
};

const REPAIR_STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: "Νέο", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", icon: AlertCircle },
  "in-progress": { label: "Σε Εξέλιξη", color: "text-blue-400 bg-blue-400/10 border-blue-400/30", icon: Clock },
  completed: { label: "Ολοκληρώθηκε", color: "text-green-400 bg-green-400/10 border-green-400/30", icon: CheckCircle2 },
  cancelled: { label: "Ακυρώθηκε", color: "text-red-400 bg-red-400/10 border-red-400/30", icon: XCircle },
};

function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} inline-flex items-center gap-1 font-semibold border`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function RepairStatusBadge({ status }: { status: string }) {
  const cfg = REPAIR_STATUS_CONFIG[status] ?? REPAIR_STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={`${cfg.color} inline-flex items-center gap-1 font-semibold border`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  );
}

function formatDate(dateStr: string | Date | null | undefined) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function formatPrice(amount: string | number) {
  return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(amount));
}

// ── Customer Detail Page ──────────────────────────────────────────────────────
export default function CustomerDetail() {
  const [, params] = useRoute("/admin/customers/:id");
  const customerId = params?.id ? parseInt(params.id, 10) : NaN;

  // Fetch customer data
  const { data: customer, isLoading: loadingCustomer } = useQuery<Customer>({
    queryKey: [`/api/admin/customers/${customerId}`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/customers/${customerId}`, {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch customer");
      return res.json();
    },
    enabled: !Number.isNaN(customerId),
  });

  // Fetch customer orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: [`/api/admin/customers/${customerId}/orders`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/customers/${customerId}/orders`, {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !Number.isNaN(customerId),
  });

  // Fetch customer repair requests
  const { data: repairs = [] } = useQuery<RepairRequest[]>({
    queryKey: [`/api/admin/customers/${customerId}/repairs`],
    queryFn: async () => {
      const res = await fetch(`/api/admin/customers/${customerId}/repairs`, {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !Number.isNaN(customerId),
  });

  // Fetch product offer interests from this customer
  const { data: offerInterests = [] } = useQuery<ProductOfferInterest[]>({
    queryKey: [`/api/admin/customers/${customerId}/offer-interests`],
    queryFn: async () => {
      const res = await fetch("/api/admin/product-offer-interests", {
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) return [];
      const all: ProductOfferInterest[] = await res.json();
      // Filter by phone (since offer interests don't have customerId)
      if (!customer?.phone) return [];
      return all.filter((o) => o.phone.replace(/\s/g, "") === customer.phone?.replace(/\s/g, ""));
    },
    enabled: !Number.isNaN(customerId) && !!customer?.phone,
  });

  if (loadingCustomer) {
    return (
      <AdminLayout>
        <Seo title="Καρτέλα Πελάτη" description="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/40 border-t-primary rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <Seo title="Πελάτης Δεν Βρέθηκε" description="404" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <User className="w-16 h-16 text-muted-foreground/20 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Πελάτης δεν βρέθηκε</h1>
          <p className="text-muted-foreground mb-6">Ο πελάτης με ID {customerId} δεν υπάρχει.</p>
          <Link href="/admin/customers">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Επιστροφή στο Πελατολόγιο
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const totalRepairs = repairs.length;
  const pendingRepairs = repairs.filter((r) => r.status === "pending").length;

  return (
    <AdminLayout>
      <Seo title={`Καρτέλα: ${customer.name}`} description="Customer CRM" />

      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm" className="gap-2 mb-4 hover:text-primary">
            <ArrowLeft className="w-4 h-4" />
            Πίσω στο Πελατολόγιο
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold mb-1">{customer.name}</h1>
              <p className="text-sm text-muted-foreground">Πελάτης #{customer.id}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="w-4 h-4" />
            Επεξεργασία
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-400" />
              Παραγγελίες
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Συνολικά: {formatPrice(totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" />
              Επισκευές
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRepairs}</div>
            {pendingRepairs > 0 && (
              <p className="text-xs text-yellow-400 mt-1">{pendingRepairs} σε εκκρεμότητα</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-400" />
              Εκδηλώσεις Ενδιαφέροντος
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offerInterests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">eShop προσφορές</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              Μέλος Από
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{formatDate(customer.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact Info */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-white/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Στοιχεία Επικοινωνίας
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors break-all"
                  >
                    {customer.email}
                  </a>
                </div>
              </div>

              {customer.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Τηλέφωνο</p>
                    <a
                      href={`tel:${customer.phone.replace(/\s/g, "")}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {customer.phone}
                    </a>
                  </div>
                </div>
              )}

              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Διεύθυνση</p>
                    <p className="text-sm text-foreground leading-relaxed">{customer.address}</p>
                  </div>
                </div>
              )}

              {customer.viberUserId && (
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5 shrink-0">
                    <span className="text-[10px] font-bold text-purple-400">V</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Viber</p>
                    <p className="text-xs font-mono text-foreground break-all">{customer.viberUserId}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Orders */}
          {orders.length > 0 && (
            <Card className="bg-card border-white/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-400" />
                  Παραγγελίες eShop ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5">
                        <TableHead className="text-xs">Κωδικός</TableHead>
                        <TableHead className="text-xs">Ημερομηνία</TableHead>
                        <TableHead className="text-xs">Ποσό</TableHead>
                        <TableHead className="text-xs">Κατάσταση</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-white/5 hover:bg-white/3">
                          <TableCell className="font-mono text-xs">
                            #ORD-{String(order.id).padStart(4, "0")}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-primary">
                            {formatPrice(order.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <OrderStatusBadge status={order.status} />
                          </TableCell>
                          <TableCell>
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1 h-8">
                                Άνοιγμα
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repairs */}
          {repairs.length > 0 && (
            <Card className="bg-card border-white/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Αιτήματα Επισκευής ({repairs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/5">
                        <TableHead className="text-xs">Κωδικός</TableHead>
                        <TableHead className="text-xs">Συσκευή</TableHead>
                        <TableHead className="text-xs">Ημερομηνία</TableHead>
                        <TableHead className="text-xs">Κατάσταση</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repairs.map((repair) => (
                        <TableRow key={repair.id} className="border-white/5 hover:bg-white/3">
                          <TableCell className="font-mono text-xs">
                            #REPR-{String(repair.id).padStart(4, "0")}
                          </TableCell>
                          <TableCell className="text-sm">{repair.deviceName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(repair.createdAt)}
                          </TableCell>
                          <TableCell>
                            <RepairStatusBadge status={repair.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Offer Interests */}
          {offerInterests.length > 0 && (
            <Card className="bg-card border-white/5 border-l-4 border-l-orange-500/35">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-orange-400" />
                  Εκδηλώσεις Ενδιαφέροντος eShop ({offerInterests.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  "Θέλω καλύτερη προσφορά" — Αιτήματα από το eShop
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {offerInterests.map((offer) => (
                    <div
                      key={offer.id}
                      className="p-3 rounded-xl bg-background/50 border border-white/5 hover:border-orange-500/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground mb-1">
                            {offer.productName}
                          </p>
                          {offer.notes && (
                            <p className="text-xs text-muted-foreground mb-2 italic">
                              {offer.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(offer.createdAt)}
                            </span>
                            {offer.offerType && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-orange-500/30 bg-orange-500/10 text-orange-400"
                              >
                                {offer.offerType === "bundle"
                                  ? "Bundle"
                                  : offer.offerType === "bulk"
                                  ? "Bulk"
                                  : "Better Price"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {offer.productSlug && (
                          <Link href={`/eshop/${offer.productSlug}`}>
                            <Button variant="ghost" size="sm" className="gap-1 h-8 shrink-0">
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {orders.length === 0 && repairs.length === 0 && offerInterests.length === 0 && (
            <Card className="bg-card border-white/5">
              <CardContent className="py-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">Δεν υπάρχει ακόμα δραστηριότητα για αυτόν τον πελάτη.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
