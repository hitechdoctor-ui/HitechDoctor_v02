import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wrench, AlertCircle, Clock, CheckCircle2, XCircle,
  Search, X, Phone, Mail, Smartphone, Hash, Lock, Printer, Euro,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type RepairRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

const VAT_RATE = 0.24;

// ── Invoice print ─────────────────────────────────────────────────────────────
function printRepairInvoice(req: RepairRequest) {
  const netPrice = req.price ? parseFloat(req.price) : null;
  const vatAmount = netPrice !== null ? netPrice * VAT_RATE : null;
  const totalPrice = netPrice !== null ? netPrice * (1 + VAT_RATE) : null;
  const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";
  const invoiceDate = new Date(req.createdAt!).toLocaleDateString("el-GR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const priceSection = netPrice !== null ? `
    <table class="price-table">
      <tr>
        <td class="label">Υποσύνολο (χωρίς ΦΠΑ)</td>
        <td class="value">${fmt(netPrice)}</td>
      </tr>
      <tr>
        <td class="label">ΦΠΑ 24%</td>
        <td class="value">${fmt(vatAmount!)}</td>
      </tr>
      <tr class="total-row">
        <td class="label"><strong>Σύνολο (με ΦΠΑ)</strong></td>
        <td class="value total-value"><strong>${fmt(totalPrice!)}</strong></td>
      </tr>
    </table>
  ` : `<p style="color:#888;font-size:13px;">Η τιμή δεν έχει οριστεί ακόμα.</p>`;

  const html = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <title>Δελτίο Παροχής Υπηρεσιών #REPR-${String(req.id).padStart(4,"0")}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1a1a2e; background: #fff; padding: 50px 60px; font-size: 14px; line-height: 1.6; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #00D2C8; padding-bottom: 24px; margin-bottom: 28px; }
    .brand { font-size: 28px; font-weight: 900; color: #00D2C8; letter-spacing: -0.5px; }
    .brand span { color: #1a1a2e; }
    .brand-sub { font-size: 12px; color: #555; margin-top: 4px; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .invoice-title p { font-size: 12px; color: #666; margin-top: 4px; }
    .invoice-num { font-size: 24px; font-weight: 900; color: #00D2C8; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #00D2C8; border-bottom: 1px solid #e5e5e5; padding-bottom: 6px; margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-block p { font-size: 13px; color: #333; margin-bottom: 4px; }
    .info-block .lbl { font-size: 11px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .service-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .service-table th { background: #f7f9fc; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #666; padding: 10px 14px; text-align: left; border-bottom: 2px solid #e5e5e5; }
    .service-table td { padding: 12px 14px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #333; }
    .price-table { width: 100%; max-width: 360px; margin-left: auto; border-collapse: collapse; }
    .price-table td { padding: 8px 14px; font-size: 13px; }
    .price-table .label { color: #555; }
    .price-table .value { text-align: right; color: #333; }
    .total-row { border-top: 2px solid #00D2C8; }
    .total-row td { padding-top: 12px; font-size: 15px; }
    .total-value { color: #00D2C8 !important; font-size: 18px !important; }
    .footer { border-top: 2px solid #e5e5e5; padding-top: 24px; margin-top: 40px; text-align: center; color: #777; font-size: 12px; line-height: 1.8; }
    .footer strong { color: #00D2C8; font-size: 14px; display: block; margin-bottom: 6px; }
    @media print {
      body { padding: 30px 40px; }
      @page { margin: 1.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">HiTech<span>Doctor</span></div>
      <div class="brand-sub">Επισκευές Κινητών &amp; IT Support<br />Σπάρτη, Λακωνία<br />Τηλ: 6981882005 | info@hitechdoctor.com</div>
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
      <p><span class="lbl">Ονοματεπώνυμο</span><br />${req.firstName} ${req.lastName}</p>
      <p><span class="lbl">Τηλέφωνο</span><br />${req.phone}</p>
      <p><span class="lbl">Email</span><br />${req.email}</p>
    </div>
    <div class="info-block">
      <div class="section-title">Στοιχεία Συσκευής</div>
      <p><span class="lbl">Συσκευή</span><br />${req.deviceName}</p>
      <p><span class="lbl">Serial Number</span><br />${req.serialNumber}</p>
      ${req.deviceCode ? `<p><span class="lbl">Κωδικός Συσκευής</span><br />${req.deviceCode}</p>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Περιγραφή Εργασιών</div>
    <table class="service-table">
      <thead>
        <tr>
          <th>Περιγραφή</th>
          <th>Κατάσταση</th>
        </tr>
      </thead>
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
    Εμπιστευτήκατε το HiTech Doctor για την επισκευή της συσκευής σας.<br />
    Είμαστε στη διάθεσή σας για οποιαδήποτε απορία ή μελλοντική ανάγκη.<br />
    <strong style="color:#555;font-size:12px;margin-top:8px;">hitechdoctor.com &nbsp;|&nbsp; 6981882005 &nbsp;|&nbsp; info@hitechdoctor.com</strong>
  </div>

  <script>window.onload = function() { setTimeout(function(){ window.print(); }, 400); }</script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "pending",     label: "Νέο",             icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "in-progress", label: "Σε Εξέλιξη",      icon: Clock,       color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30"   },
  { value: "completed",   label: "Ολοκληρώθηκε",    icon: CheckCircle2,color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" },
  { value: "cancelled",   label: "Ακυρώθηκε",       icon: XCircle,     color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30"     },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUSES.find((s) => s.value === status) ?? STATUSES[0];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(d: string | Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2 px-3 h-10 rounded-xl border border-white/10 bg-card hover:border-white/20 focus-within:border-primary/40 focus-within:shadow-[0_0_0_2px_rgba(0,210,200,0.1)] transition-all w-full max-w-sm">
      <Search className="w-4 h-4 text-muted-foreground shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Αναζήτηση πελάτη, συσκευής, serial..."
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
        data-testid="input-repair-search"
      />
      {value && (
        <button onClick={() => onChange("")} className="shrink-0">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" />
        </button>
      )}
    </div>
  );
}

// ── Price Cell ────────────────────────────────────────────────────────────────
function PriceCell({
  req,
  onSave,
}: {
  req: RepairRequest;
  onSave: (id: number, price: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localVal, setLocalVal] = useState(req.price ?? "");
  const net = parseFloat(localVal);
  const hasVal = localVal !== "" && !isNaN(net) && net > 0;

  const handleSave = () => {
    setEditing(false);
    const trimmed = localVal.trim();
    const parsed = parseFloat(trimmed);
    if (trimmed === "" || isNaN(parsed)) {
      onSave(req.id, null);
    } else {
      onSave(req.id, parsed.toFixed(2));
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setEditing(false); setLocalVal(req.price ?? ""); }
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">€</span>
          <input
            type="number"
            min="0"
            step="0.01"
            autoFocus
            value={localVal}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKey}
            className="w-20 h-7 px-2 text-sm bg-background border border-primary/40 rounded-lg outline-none text-foreground"
            data-testid={`input-price-${req.id}`}
          />
        </div>
        {hasVal && (
          <div className="text-[10px] leading-tight">
            <span className="text-muted-foreground">χωρίς ΦΠΑ: </span>
            <span className="text-foreground">{net.toFixed(2).replace(".", ",")} €</span>
            <br />
            <span className="text-muted-foreground">με ΦΠΑ 24%: </span>
            <span className="font-bold text-primary">{(net * 1.24).toFixed(2).replace(".", ",")} €</span>
          </div>
        )}
      </div>
    );
  }

  if (req.price && parseFloat(req.price) > 0) {
    const p = parseFloat(req.price);
    return (
      <button
        className="flex flex-col items-start gap-0.5 text-left group hover:opacity-80 transition-opacity"
        onClick={() => { setLocalVal(req.price ?? ""); setEditing(true); }}
        data-testid={`cell-price-${req.id}`}
      >
        <span className="text-[10px] text-muted-foreground">χωρίς ΦΠΑ: {p.toFixed(2).replace(".", ",")} €</span>
        <span className="text-sm font-bold text-primary">{(p * 1.24).toFixed(2).replace(".", ",")} € <span className="text-[9px] font-normal text-muted-foreground">(με ΦΠΑ)</span></span>
        <span className="text-[9px] text-primary/50 group-hover:text-primary transition-colors">(κλικ για αλλαγή)</span>
      </button>
    );
  }

  return (
    <button
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-dashed border-white/15 rounded-lg px-2.5 py-1.5 hover:border-primary/30"
      onClick={() => { setLocalVal(""); setEditing(true); }}
      data-testid={`btn-set-price-${req.id}`}
    >
      <Euro className="w-3 h-3" />
      Ορισμός τιμής
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminRepairRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const priceMutation = useMutation({
    mutationFn: ({ id, price }: { id: number; price: string | null }) =>
      apiRequest("PATCH", `/api/repair-requests/${id}`, { price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests"] });
      toast({ title: "Αποθηκεύτηκε", description: "Η τιμή ενημερώθηκε." });
    },
    onError: () => {
      toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης τιμής.", variant: "destructive" });
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

  const byStatus = (v: string) => requests?.filter((r) => r.status === v).length ?? 0;

  const stats = [
    { label: "Σύνολο",         value: requests?.length ?? 0, icon: Wrench,     color: "text-primary",    bg: "bg-primary/10 border-primary/20"       },
    { label: "Νέα",            value: byStatus("pending"),   icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { label: "Σε Εξέλιξη",    value: byStatus("in-progress"),icon: Clock,      color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"     },
    { label: "Ολοκληρωμένα",  value: byStatus("completed"),  icon: CheckCircle2,color: "text-green-400", bg: "bg-green-400/10 border-green-400/20"   },
    { label: "Ακυρωμένα",     value: byStatus("cancelled"),  icon: XCircle,    color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20"       },
  ];

  return (
    <AdminLayout>
      <Seo title="Αιτήματα Επισκευής — Admin" description="CRM αιτημάτων επισκευής" />

      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold">Αιτήματα Επισκευής</h1>
        <p className="text-muted-foreground mt-1">Διαχείριση και παρακολούθηση αιτημάτων επισκευής</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {stats.map((s, i) => (
          <Card key={i} className={`bg-card border ${s.bg}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</CardTitle>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="bg-card border-white/8">
        <CardHeader className="flex flex-col gap-3 pb-4 border-b border-white/8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <Wrench className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold">Λίστα Αιτημάτων</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {filtered.length} / {requests?.length ?? 0} αιτήματα
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <SearchInput value={search} onChange={setSearch} />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 text-sm w-44 border-white/10 bg-card" data-testid="select-status-filter">
                <SelectValue placeholder="Κατάσταση" />
              </SelectTrigger>
              <SelectContent className="bg-background border-white/10">
                <SelectItem value="all" className="text-xs">Όλες οι Καταστάσεις</SelectItem>
                {STATUSES.map((s) => (
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
              Φόρτωση αιτημάτων...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">
                {search || statusFilter !== "all" ? "Δεν βρέθηκαν αποτελέσματα" : "Κανένα αίτημα ακόμη"}
              </p>
              <p className="text-xs text-muted-foreground">
                {search ? "Δοκιμάστε διαφορετική αναζήτηση" : "Τα αιτήματα επισκευής θα εμφανιστούν εδώ."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/2 text-left">
                    {["#", "Πελάτης", "Επικοινωνία", "Συσκευή", "Serial / Κωδικός", "Ημερομηνία", "Τιμή (χωρίς ΦΠΑ)", "Κατάσταση", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((req) => (
                    <tr key={req.id} className="hover:bg-white/3 transition-colors" data-testid={`row-repair-${req.id}`}>
                      <td className="px-4 py-4">
                        <span className="text-xs font-mono text-muted-foreground">#{req.id}</span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-foreground">{req.firstName} {req.lastName}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <a href={`tel:${req.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <Phone className="w-3 h-3 text-primary shrink-0" />{req.phone}
                          </a>
                          <a href={`mailto:${req.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="w-3 h-3 text-primary shrink-0" />{req.email}
                          </a>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">{req.deviceName}</p>
                            {req.notes && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px] truncate" title={req.notes}>
                                {req.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <Hash className="w-3 h-3 text-primary shrink-0" />
                            <span className="text-xs font-mono">{req.serialNumber}</span>
                          </div>
                          {req.deviceCode && (
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-primary shrink-0" />
                              <span className="text-xs font-mono text-muted-foreground">{req.deviceCode}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(req.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <PriceCell
                          req={req}
                          onSave={(id, price) => priceMutation.mutate({ id, price })}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          value={req.status}
                          onValueChange={(val) => statusMutation.mutate({ id: req.id, status: val })}
                        >
                          <SelectTrigger className="h-8 text-xs w-44 border-white/10 bg-card" data-testid={`select-status-${req.id}`}>
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
                      <td className="px-4 py-4">
                        <button
                          onClick={() => printRepairInvoice(req)}
                          title="Εκτύπωση Δελτίου / PDF"
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-xs whitespace-nowrap"
                          data-testid={`btn-invoice-${req.id}`}
                        >
                          <Printer className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </td>
                    </tr>
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
