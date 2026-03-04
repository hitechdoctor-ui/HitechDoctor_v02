import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import {
  ShoppingCart, Euro, CheckCircle2, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronRight, Mail, Package, Search, X,
  User, Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ── Status config ────────────────────────────────────────────────────────────
const ORDER_STATUSES = [
  { value: "pending",   label: "Εκκρεμεί",       icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "completed", label: "Ολοκληρώθηκε", icon: CheckCircle2,  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30"  },
  { value: "cancelled", label: "Ακυρώθηκε",    icon: XCircle,       color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30"     },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUSES.find((s) => s.value === status) ?? ORDER_STATUSES[0];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(price));

const formatDate = (d: string | Date | null) =>
  d ? new Intl.DateTimeFormat("el-GR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(d)) : "—";

const formatDateShort = (d: string | Date | null) =>
  d ? new Intl.DateTimeFormat("el-GR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d)) : "—";

// ── PDF generator ─────────────────────────────────────────────────────────────
async function generateOrderPDF(order: any, items: any[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // Dark header background
  doc.setFillColor(5, 12, 25);
  doc.rect(0, 0, W, 42, "F");

  // Cyan accent bar
  doc.setFillColor(0, 210, 200);
  doc.rect(0, 42, W, 1.5, "F");

  // Company name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(0, 210, 200);
  doc.text("HiTech Doctor", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(180, 180, 200);
  doc.text("info@hitechdoctor.com  |  698 188 2005", 14, 26);
  doc.text("www.hitechdoctor.com", 14, 32);

  // ORDER label top right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("ΠΑΡΑΓΓΕΛΙΑ", W - 14, 20, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 180, 200);
  doc.text(`#ORD-${String(order.id).padStart(4, "0")}`, W - 14, 28, { align: "right" });
  doc.text(formatDateShort(order.createdAt), W - 14, 35, { align: "right" });

  // Customer info block
  const gy = 54;
  doc.setFillColor(15, 22, 40);
  doc.roundedRect(14, gy, (W - 28) / 2 - 4, 30, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 210, 200);
  doc.text("ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ", 19, gy + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 240);
  doc.text(order.customerName ?? "—", 19, gy + 14);

  doc.setFontSize(8);
  doc.setTextColor(160, 160, 180);
  doc.text(order.customerEmail ?? "", 19, gy + 21);

  // Status + total block
  const sx = 14 + (W - 28) / 2 + 4;
  doc.setFillColor(15, 22, 40);
  doc.roundedRect(sx, gy, (W - 28) / 2 - 4, 30, 3, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(0, 210, 200);
  doc.text("ΚΑΤΑΣΤ. / ΣΥΝΟΛΟ", sx + 5, gy + 7);

  const statusLabel = ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(230, 230, 240);
  doc.text(statusLabel, sx + 5, gy + 14);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 210, 200);
  doc.text(formatPrice(order.totalAmount), sx + 5, gy + 24);

  // Items table
  const tableY = gy + 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(120, 130, 160);
  doc.text("ΠΡΟΪΟΝΤΑ ΠΑΡΑΓΓΕΛΙΑΣ", 14, tableY);

  const rows = items.map((it) => [
    it.productName ?? "—",
    String(it.quantity),
    formatPrice(it.priceAtTime),
    formatPrice(Number(it.priceAtTime) * it.quantity),
  ]);

  autoTable(doc, {
    startY: tableY + 4,
    head: [["Προϊόν", "Ποσ.", "Τιμή μον.", "Σύνολο"]],
    body: rows,
    theme: "plain",
    headStyles: {
      fillColor: [0, 210, 200],
      textColor: [5, 12, 25],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: [40, 40, 60] },
    alternateRowStyles: { fillColor: [245, 247, 252] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 32, halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // Total row
  const finalY = (doc as any).lastAutoTable.finalY + 6;
  const totalNet = Number(order.totalAmount) / 1.24;
  const vatAmt = Number(order.totalAmount) - totalNet;

  doc.setFillColor(5, 12, 25);
  doc.roundedRect(W - 14 - 70, finalY, 70, 24, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(160, 170, 200);
  doc.text("Καθαρή αξία:", W - 14 - 65, finalY + 7);
  doc.text(formatPrice(totalNet), W - 14, finalY + 7, { align: "right" });

  doc.text("ΦΠΑ 24%:", W - 14 - 65, finalY + 13);
  doc.text(formatPrice(vatAmt), W - 14, finalY + 13, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 210, 200);
  doc.text("ΣΥΝΟΛΟ:", W - 14 - 65, finalY + 21);
  doc.text(formatPrice(order.totalAmount), W - 14, finalY + 21, { align: "right" });

  // Footer
  doc.setFillColor(5, 12, 25);
  doc.rect(0, H - 18, W, 18, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 110, 140);
  doc.text("Ευχαριστούμε για την παραγγελία σας! | HiTech Doctor | info@hitechdoctor.com | 698 188 2005", W / 2, H - 8, { align: "center" });

  doc.save(`παραγγελια-ORD-${String(order.id).padStart(4, "0")}.pdf`);
}

// ── Search Input ─────────────────────────────────────────────────────────────
function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-white/10 bg-card hover:border-white/20 focus-within:border-primary/40 focus-within:shadow-[0_0_0_2px_rgba(0,210,200,0.1)] transition-all w-full max-w-sm">
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Αναζήτηση πελάτη, email, #παραγγελία..."
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
        data-testid="input-orders-search"
      />
      {value && (
        <button onClick={() => onChange("")} className="shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      )}
    </div>
  );
}

// ── Order Items expanded row ──────────────────────────────────────────────────
function OrderItemsRow({ orderId }: { orderId: number }) {
  const { data: items, isLoading } = useQuery<any[]>({
    queryKey: [`/api/orders/${orderId}/items`],
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 pl-6 text-xs text-muted-foreground">
        <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
        Φόρτωση προϊόντων...
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-4 pl-6 text-xs text-muted-foreground">Δεν βρέθηκαν προϊόντα για αυτή την παραγγελία.</div>
    );
  }

  return (
    <div className="py-3 pl-6 pr-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2">Προϊόντα παραγγελίας</p>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-background/50 border border-white/8"
            data-testid={`order-item-${item.id}`}
          >
            {item.productImage ? (
              <img src={item.productImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/8 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Package className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{item.productName ?? "Άγνωστο Προϊόν"}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Ποσότητα: {item.quantity}</p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">
              {formatPrice(Number(item.priceAtTime) * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Order Row ────────────────────────────────────────────────────────────────
function OrderRow({ order, onStatusChange }: { order: any; onStatusChange: (id: number, s: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [printing, setPrinting] = useState(false);

  const { data: items } = useQuery<any[]>({
    queryKey: [`/api/orders/${order.id}/items`],
    enabled: false,
  });

  const handlePrint = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrinting(true);
    try {
      // Fetch items if not yet loaded
      let orderItems = items ?? [];
      if (!items || items.length === 0) {
        const res = await fetch(`/api/orders/${order.id}/items`);
        orderItems = await res.json();
      }
      await generateOrderPDF(order, orderItems);
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <tr
        className="border-b border-white/6 hover:bg-white/3 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
        data-testid={`row-order-${order.id}`}
      >
        {/* # */}
        <td className="py-4 pl-4 pr-3">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronDown className="w-3.5 h-3.5 text-primary shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />}
            <span className="text-xs font-mono text-muted-foreground">#{order.id}</span>
          </div>
        </td>

        {/* Πελάτης */}
        <td className="py-4 pr-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{order.customerName}</p>
              <a
                href={`mailto:${order.customerEmail}`}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="w-2.5 h-2.5 shrink-0" />
                {order.customerEmail}
              </a>
            </div>
          </div>
        </td>

        {/* Ημερομηνία */}
        <td className="py-4 pr-4">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</span>
        </td>

        {/* Σύνολο */}
        <td className="py-4 pr-4">
          <span className="text-sm font-bold text-primary">{formatPrice(order.totalAmount)}</span>
        </td>

        {/* Κατάσταση */}
        <td className="py-4 pr-4" onClick={(e) => e.stopPropagation()}>
          <Select
            value={order.status}
            onValueChange={(val) => onStatusChange(order.id, val)}
          >
            <SelectTrigger
              className="h-8 w-40 text-xs border-white/10 bg-card"
              data-testid={`select-order-status-${order.id}`}
            >
              <SelectValue><StatusBadge status={order.status} /></SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10">
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value} className="text-xs">
                  <StatusBadge status={s.value} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>

        {/* PDF Print */}
        <td className="py-4 pr-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            disabled={printing}
            data-testid={`btn-print-order-${order.id}`}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            {printing
              ? <span className="w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              : <Printer className="w-3.5 h-3.5" />}
            PDF
          </Button>
        </td>
      </tr>

      {/* Expanded items row */}
      {expanded && (
        <tr className="border-b border-white/6 bg-white/2">
          <td colSpan={6}>
            <OrderItemsRow orderId={order.id} />
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus({ id, status });
      toast({ title: "Ενημερώθηκε", description: "Η κατάσταση αποθηκεύτηκε." });
    } catch {
      toast({ variant: "destructive", title: "Σφάλμα κατά την ενημέρωση" });
    }
  };

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.toLowerCase().trim();
    return orders.filter((o: any) => {
      const matchesSearch =
        !q ||
        String(o.id).includes(q) ||
        (o.customerName ?? "").toLowerCase().includes(q) ||
        (o.customerEmail ?? "").toLowerCase().includes(q) ||
        String(o.totalAmount).includes(q);
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // ── Stats ──
  const totalRevenue = orders?.reduce((s: number, o: any) => o.status !== "cancelled" ? s + Number(o.totalAmount) : s, 0) ?? 0;
  const byStatus = (v: string) => orders?.filter((o: any) => o.status === v).length ?? 0;

  const stats = [
    { label: "Συνολικά Έσοδα", value: formatPrice(totalRevenue), icon: Euro, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { label: "Σύνολο Παραγγελιών", value: orders?.length ?? 0, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { label: "Εκκρεμείς", value: byStatus("pending"), icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { label: "Ολοκληρωμένες", value: byStatus("completed"), icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { label: "Ακυρωμένες", value: byStatus("cancelled"), icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  ];

  return (
    <AdminLayout>
      <Seo title="Παραγγελίες — Admin" description="Διαχείριση παραγγελιών eShop" />

      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold">Παραγγελίες</h1>
        <p className="text-muted-foreground mt-1">Παρακολούθηση, αναζήτηση και διεκπεραίωση παραγγελιών eShop</p>
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className={`bg-card border ${s.bg}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</CardTitle>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Orders Table ── */}
      <Card className="bg-card border-white/8">
        <CardHeader className="flex flex-col gap-3 pb-4 border-b border-white/8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
                <ShoppingCart className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold">Λίστα Παραγγελιών</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filtered.length} / {orders?.length ?? 0} παραγγελίες
                  {search || statusFilter !== "all" ? " (φιλτραρισμένες)" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <Printer className="w-3 h-3" />
              Κλικ στο PDF για αποθήκευση παραστατικού
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <SearchInput value={search} onChange={setSearch} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 text-sm w-44 border-white/10 bg-card" data-testid="select-orders-status-filter">
                <SelectValue placeholder="Κατάσταση" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10">
                <SelectItem value="all" className="text-xs">Όλες οι Καταστάσεις</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    <StatusBadge status={s.value} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-3">
              <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
              Φόρτωση παραγγελιών...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">
                {search || statusFilter !== "all" ? "Δεν βρέθηκαν παραγγελίες" : "Δεν υπάρχουν παραγγελίες ακόμη"}
              </p>
              <p className="text-xs text-muted-foreground">
                {search ? "Δοκιμάστε διαφορετική αναζήτηση" : "Οι παραγγελίες eShop θα εμφανιστούν εδώ."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2">
                    <th className="pl-4 pr-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 w-20">#</th>
                    <th className="pr-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Πελάτης</th>
                    <th className="pr-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Ημερομηνία</th>
                    <th className="pr-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Σύνολο</th>
                    <th className="pr-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Κατάσταση</th>
                    <th className="pr-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Εκτύπωση</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order: any) => (
                    <OrderRow key={order.id} order={order} onStatusChange={handleStatusChange} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
