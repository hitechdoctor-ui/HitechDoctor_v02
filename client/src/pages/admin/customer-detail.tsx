import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft, User, Mail, Phone, MapPin, ShoppingBag, Wrench,
  Package, CheckCircle2, Clock, AlertCircle, XCircle, Printer, Euro, List,
  Shield, Globe, MessageSquare,
} from "lucide-react";
import { type Customer, type RepairRequest, type RepairItem, type Subscription, type WebsiteInquiry } from "@shared/schema";
import { getAdminAuthHeaders } from "@/lib/queryClient";

const VAT_RATE = 0.24;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

// ── Order Status Badge ────────────────────────────────────────────────────────
function OrderBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    pending:    { label: "Σε Αναμονή",   color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", Icon: Clock },
    processing: { label: "Επεξεργασία", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30",   Icon: AlertCircle },
    shipped:    { label: "Απεστάλη",     color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30", Icon: Package },
    delivered:  { label: "Παραδόθηκε",  color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30", Icon: CheckCircle2 },
    cancelled:  { label: "Ακυρώθηκε",   color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30",     Icon: XCircle },
  };
  const cfg = map[status] ?? map.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function RepairBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
    pending:     { label: "Νέο",           color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30", Icon: AlertCircle },
    "in-progress": { label: "Σε Εξέλιξη", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30",   Icon: Clock },
    completed:   { label: "Ολοκληρώθηκε", color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30", Icon: CheckCircle2 },
    cancelled:   { label: "Ακυρώθηκε",    color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30",     Icon: XCircle },
  };
  const cfg = map[status] ?? map.pending;
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ── Invoice Print ─────────────────────────────────────────────────────────────
function printRepairInvoice(req: RepairRequest, customer: Customer, items: RepairItem[] = []) {
  const hasItems = items.length > 0;
  const netPrice = hasItems
    ? items.reduce((s, i) => s + parseFloat(i.amount), 0)
    : req.price ? parseFloat(req.price) : null;
  const vatAmount = netPrice !== null ? netPrice * VAT_RATE : null;
  const totalPrice = netPrice !== null ? netPrice * (1 + VAT_RATE) : null;
  const invoiceDate = new Date(req.createdAt!).toLocaleDateString("el-GR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const itemRows = hasItems
    ? items.map(i => `<tr><td>${i.description}</td><td style="text-align:right">${fmt(parseFloat(i.amount))}</td></tr>`).join("")
    : "";

  const priceSection = netPrice !== null ? `
    ${hasItems ? `<table class="price-table"><thead><tr><th>Περιγραφή</th><th style="text-align:right">Ποσό</th></tr></thead><tbody>${itemRows}</tbody></table><div style="margin-top:12px">` : ""}
    <table class="price-table">
      <tr><td class="label">Υποσύνολο (χωρίς ΦΠΑ)</td><td class="value">${fmt(netPrice)}</td></tr>
      <tr><td class="label">ΦΠΑ 24%</td><td class="value">${fmt(vatAmount!)}</td></tr>
      <tr class="total-row">
        <td class="label"><strong>Σύνολο (με ΦΠΑ)</strong></td>
        <td class="value total-value"><strong>${fmt(totalPrice!)}</strong></td>
      </tr>
    </table>${hasItems ? "</div>" : ""}` : `<p style="color:#888;font-size:13px;">Η τιμή δεν έχει οριστεί ακόμα.</p>`;

  const html = `<!DOCTYPE html>
<html lang="el"><head>
<meta charset="UTF-8" />
<title>Δελτίο Παροχής Υπηρεσιών #REPR-${String(req.id).padStart(4,"0")}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Arial,Helvetica,sans-serif; color:#1a1a2e; background:#fff; padding:50px 60px; font-size:14px; line-height:1.6; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #00D2C8; padding-bottom:24px; margin-bottom:28px; }
  .brand { font-size:28px; font-weight:900; color:#00D2C8; letter-spacing:-0.5px; }
  .brand span { color:#1a1a2e; }
  .brand-sub { font-size:12px; color:#555; margin-top:4px; }
  .invoice-title { text-align:right; }
  .invoice-title h2 { font-size:20px; font-weight:700; }
  .invoice-num { font-size:24px; font-weight:900; color:#00D2C8; }
  .invoice-title p { font-size:12px; color:#666; margin-top:4px; }
  .section { margin-bottom:24px; }
  .section-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#00D2C8; border-bottom:1px solid #e5e5e5; padding-bottom:6px; margin-bottom:12px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  .info-block p { font-size:13px; color:#333; margin-bottom:4px; }
  .info-block .lbl { font-size:11px; color:#999; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; }
  .service-table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  .service-table th { background:#f7f9fc; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#666; padding:10px 14px; text-align:left; border-bottom:2px solid #e5e5e5; }
  .service-table td { padding:12px 14px; border-bottom:1px solid #f0f0f0; font-size:13px; color:#333; }
  .price-table { width:100%; max-width:360px; margin-left:auto; border-collapse:collapse; }
  .price-table td { padding:8px 14px; font-size:13px; }
  .price-table .label { color:#555; }
  .price-table .value { text-align:right; color:#333; }
  .total-row { border-top:2px solid #00D2C8; }
  .total-row td { padding-top:12px; font-size:15px; }
  .total-value { color:#00D2C8 !important; font-size:18px !important; }
  .footer { border-top:2px solid #e5e5e5; padding-top:24px; margin-top:40px; text-align:center; color:#777; font-size:12px; line-height:1.8; }
  .footer strong { color:#00D2C8; font-size:14px; display:block; margin-bottom:6px; }
  @media print { body { padding:30px 40px; } @page { margin:1.5cm; } }
</style></head><body>
<div class="header">
  <div>
    <div class="brand">HiTech<span>Doctor</span></div>
    <div class="brand-sub">Επισκευές Κινητών &amp; IT Support<br/>Σπάρτη, Λακωνία<br/>Τηλ: 6981882005 | info@hitechdoctor.com</div>
  </div>
  <div class="invoice-title">
    <h2>Δελτίο Παροχής Υπηρεσιών</h2>
    <div class="invoice-num">#REPR-${String(req.id).padStart(4,"0")}</div>
    <p>Ημερομηνία: ${invoiceDate}</p>
  </div>
</div>
<div class="info-grid section">
  <div class="info-block">
    <div class="section-title">Στοιχεία Πελάτη</div>
    <p><span class="lbl">Ονοματεπώνυμο</span><br/>${req.firstName} ${req.lastName}</p>
    <p><span class="lbl">Τηλέφωνο</span><br/>${req.phone}</p>
    <p><span class="lbl">Email</span><br/>${req.email}</p>
    ${customer.address ? `<p><span class="lbl">Διεύθυνση</span><br/>${customer.address}</p>` : ""}
  </div>
  <div class="info-block">
    <div class="section-title">Στοιχεία Συσκευής</div>
    <p><span class="lbl">Συσκευή</span><br/>${req.deviceName}</p>
    <p><span class="lbl">Serial Number</span><br/>${req.serialNumber}</p>
    ${req.deviceCode ? `<p><span class="lbl">Κωδικός Συσκευής</span><br/>${req.deviceCode}</p>` : ""}
  </div>
</div>
<div class="section">
  <div class="section-title">Περιγραφή Εργασιών</div>
  <table class="service-table">
    <thead><tr><th>Περιγραφή</th><th>Κατάσταση</th></tr></thead>
    <tbody>
      <tr>
        <td>${req.notes || "Επισκευή — " + req.deviceName}</td>
        <td>${req.status === "completed" ? "Ολοκληρώθηκε" : req.status === "in-progress" ? "Σε Εξέλιξη" : "Σε Αναμονή"}</td>
      </tr>
    </tbody>
  </table>
</div>
<div class="section">
  <div class="section-title">Ανάλυση Κόστους</div>
  ${priceSection}
</div>
<div class="footer">
  <strong>Ευχαριστούμε που μας επιλέξατε!</strong>
  Εμπιστευτήκατε το HiTech Doctor για την επισκευή της συσκευής σας.<br/>
  Είμαστε στη διάθεσή σας για οποιαδήποτε απορία ή μελλοντική ανάγκη.<br/>
  <strong style="color:#555;font-size:12px;margin-top:8px;">hitechdoctor.com &nbsp;|&nbsp; 6981882005 &nbsp;|&nbsp; info@hitechdoctor.com</strong>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();},400);}</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
}

function formatDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("el-GR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Repair Items for kartela ──────────────────────────────────────────────────
function RepairItemsSection({ rep, customer }: { rep: RepairRequest; customer: Customer }) {
  const { data: items = [], isLoading } = useQuery<RepairItem[]>({
    queryKey: ["/api/repair-requests", rep.id, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/repair-requests/${rep.id}/items`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load items");
      return res.json();
    },
  });

  const hasItems = items.length > 0;
  const netFromItems = hasItems ? items.reduce((s, i) => s + parseFloat(i.amount), 0) : null;
  const netPrice = netFromItems ?? (rep.price ? parseFloat(rep.price) : null);

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-semibold">{rep.deviceName}</p>
          <p className="text-xs text-muted-foreground font-mono">SN: {rep.serialNumber}</p>
          {rep.notes && <p className="text-xs text-muted-foreground mt-0.5 italic">"{rep.notes}"</p>}
          <p className="text-xs text-muted-foreground">{formatDate(rep.createdAt)}</p>
        </div>
        <RepairBadge status={rep.status} />
      </div>

      {/* Line items breakdown */}
      {isLoading ? (
        <div className="text-xs text-muted-foreground py-2 flex items-center gap-1.5">
          <span className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
          Φόρτωση...
        </div>
      ) : hasItems ? (
        <div className="bg-white/3 border border-white/8 rounded-xl overflow-hidden mb-3">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/8 bg-white/3">
            <List className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Ανάλυση Εργασιών</span>
          </div>
          <div className="divide-y divide-white/5">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center px-3 py-2">
                <span className="text-xs text-foreground">{item.description}</span>
                <span className="text-xs font-medium text-muted-foreground">{fmt(parseFloat(item.amount))}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* VAT summary */}
      {netPrice !== null && (
        <div className="flex items-center gap-4 mb-3 bg-primary/5 border border-primary/15 rounded-xl px-3 py-2">
          <div className="text-xs text-muted-foreground">
            χωρίς ΦΠΑ: <span className="text-foreground font-medium">{fmt(netPrice)}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="text-xs text-muted-foreground">
            ΦΠΑ 24%: <span className="text-foreground font-medium">{fmt(netPrice * VAT_RATE)}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="text-xs text-muted-foreground">
            με ΦΠΑ: <span className="text-primary font-bold text-sm">{fmt(netPrice * 1.24)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => printRepairInvoice(rep, customer, items)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-xs"
        data-testid={`btn-invoice-repair-${rep.id}`}
      >
        <Printer className="w-3.5 h-3.5" aria-hidden />
        Εκτύπωση Δελτίου / PDF
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id);

  const { data: customer, isLoading: loadingCustomer } = useQuery<Customer>({
    queryKey: ["/api/customers", customerId],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load customer");
      return res.json();
    },
  });

  const { data: orders, isLoading: loadingOrders } = useQuery<any[]>({
    queryKey: ["/api/customers", customerId, "orders"],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}/orders`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    },
    enabled: !!customer,
  });

  const { data: repairs, isLoading: loadingRepairs } = useQuery<RepairRequest[]>({
    queryKey: ["/api/repair-requests", customer?.email],
    queryFn: () => fetch(`/api/repair-requests?email=${encodeURIComponent(customer!.email)}`).then(r => r.json()),
    enabled: !!customer?.email,
  });

  const { data: subscriptions = [], isLoading: loadingSubscriptions } = useQuery<Subscription[]>({
    queryKey: ["/api/customers", customerId, "subscriptions"],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}/subscriptions`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load subscriptions");
      return res.json();
    },
    enabled: !!customer,
  });

  const { data: inquiries = [], isLoading: loadingInquiries } = useQuery<WebsiteInquiry[]>({
    queryKey: ["/api/customers", customerId, "inquiries"],
    queryFn: async () => {
      const res = await fetch(`/api/customers/${customerId}/inquiries`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load inquiries");
      return res.json();
    },
    enabled: !!customer,
  });

  if (loadingCustomer) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm gap-3">
          <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          Φόρτωση...
        </div>
      </AdminLayout>
    );
  }

  if (!customer) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold mb-2">Ο πελάτης δεν βρέθηκε</p>
          <Link href="/admin/customers">
            <a className="text-primary text-sm hover:underline">← Επιστροφή στο Πελατολόγιο</a>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const totalSpent = orders?.reduce((sum, o) => sum + parseFloat(o.totalAmount || "0"), 0) ?? 0;

  return (
    <AdminLayout>
      <Seo title={`Καρτέλα ${customer.name} — Admin`} description="Καρτέλα πελάτη" />

      {/* Back link */}
      <div className="mb-6">
        <Link href="/admin/customers">
          <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Επιστροφή στο Πελατολόγιο
          </a>
        </Link>
        <h1 className="text-3xl font-display font-bold">Καρτέλα Πελάτη</h1>
        <p className="text-muted-foreground mt-1">Πλήρες ιστορικό και στοιχεία επικοινωνίας</p>
      </div>

      {/* Customer Info Card */}
      <Card className="bg-card border-white/8 mb-6">
        <CardHeader className="border-b border-white/8 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold">{customer.name}</h2>
              <p className="text-sm text-muted-foreground">Πελάτης από {formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Email</p>
                <a href={`mailto:${customer.email}`} className="text-sm hover:text-primary transition-colors">{customer.email}</a>
              </div>
            </div>
            {customer.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Τηλέφωνο</p>
                  <a href={`tel:${customer.phone}`} className="text-sm hover:text-primary transition-colors">{customer.phone}</a>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Διεύθυνση</p>
                  <p className="text-sm">{customer.address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <Euro className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Συνολικές Αγορές</p>
                <p className="text-sm font-bold text-primary">{fmt(totalSpent)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {/* Subscriptions Summary */}
        <Card className="bg-card border-white/8">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-sm font-bold">Συνδρομές</p>
            </div>
            {loadingSubscriptions ? <p className="text-xs text-muted-foreground">Φόρτωση...</p> : subscriptions.length === 0 ? (
              <p className="text-xs text-muted-foreground">Καμία συνδρομή</p>
            ) : (
              <div className="space-y-2">
                {subscriptions.map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{s.type === "antivirus" ? "Antivirus" : "Ιστοσελίδα"}</span>
                    <span className={s.status === "active" ? "text-emerald-400 font-bold" : "text-red-400"}>{s.status === "active" ? "Ενεργή" : s.status === "expired" ? "Έληξε" : "Ακυρώθηκε"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inquiries Summary */}
        <Card className="bg-card border-white/8">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-sm font-bold">Αιτήματα Ιστοσελίδας</p>
            </div>
            {loadingInquiries ? <p className="text-xs text-muted-foreground">Φόρτωση...</p> : inquiries.length === 0 ? (
              <p className="text-xs text-muted-foreground">Κανένα αίτημα</p>
            ) : (
              <div className="space-y-2">
                {inquiries.map(inq => (
                  <div key={inq.id} className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{formatDate(inq.createdAt)}</span>
                    <span className={inq.status === "won" ? "text-emerald-400 font-bold" : inq.status === "lost" ? "text-red-400" : "text-amber-400"}>{inq.status === "won" ? "Κλείστηκε" : inq.status === "lost" ? "Χάθηκε" : inq.status === "contacted" ? "Επικοινωνία" : "Αναμένει"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-card border-white/8">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Euro className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-bold">Αγορές eShop</p>
            </div>
            <p className="text-2xl font-extrabold text-primary">{fmt(orders?.reduce((s, o) => s + parseFloat(o.totalAmount || "0"), 0) ?? 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{orders?.length ?? 0} παραγγελίες</p>
          </CardContent>
        </Card>

        {/* Repairs Count */}
        <Card className="bg-card border-white/8">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-violet-400" />
              </div>
              <p className="text-sm font-bold">Επισκευές</p>
            </div>
            <p className="text-2xl font-extrabold text-violet-400">{repairs?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-1">συνολικά αιτήματα</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders */}
        <Card className="bg-card border-white/8">
          <CardHeader className="border-b border-white/8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-display">Παραγγελίες eShop</CardTitle>
                <p className="text-xs text-muted-foreground">{orders?.length ?? 0} παραγγελίες</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingOrders ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-sm gap-2">
                <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                Φόρτωση...
              </div>
            ) : !orders?.length ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Δεν υπάρχουν παραγγελίες</div>
            ) : (
              <div className="divide-y divide-white/5">
                {orders.map((order) => (
                  <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold font-mono">#{order.id}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary">{fmt(parseFloat(order.totalAmount))}</span>
                      <OrderBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Repair Requests */}
        <Card className="bg-card border-white/8">
          <CardHeader className="border-b border-white/8 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-display">Ιστορικό Επισκευών</CardTitle>
                <p className="text-xs text-muted-foreground">{repairs?.length ?? 0} αιτήματα</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingRepairs ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground text-sm gap-2">
                <span className="w-4 h-4 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                Φόρτωση...
              </div>
            ) : !repairs?.length ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Δεν υπάρχουν αιτήματα επισκευής</div>
            ) : (
              <div className="divide-y divide-white/5">
                {repairs.map((rep) => (
                  <RepairItemsSection key={rep.id} rep={rep} customer={customer} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
