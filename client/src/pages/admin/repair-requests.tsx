import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wrench, AlertCircle, Clock, CheckCircle2, XCircle,
  Search, X, Phone, Mail, Smartphone, Hash, Lock, Printer, Euro,
  ChevronDown, ChevronUp, Plus, Trash2, Package, Download,
} from "lucide-react";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import { apiRequest, getAdminAuthHeaders, invalidateRepairFinancialQueries } from "@/lib/queryClient";
import { type RepairRequest, type RepairItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, Fragment } from "react";

const VAT_RATE = 0.24;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

// ── Invoice print ─────────────────────────────────────────────────────────────
function printRepairInvoice(req: RepairRequest, items: RepairItem[] = []) {
  const hasItems = items.length > 0;
  const itemsTotal = hasItems
    ? items.reduce((s, i) => s + parseFloat(i.amount), 0)
    : req.price ? parseFloat(req.price) : null;
  const vatAmount = itemsTotal !== null ? itemsTotal * VAT_RATE : null;
  const totalWithVat = itemsTotal !== null ? itemsTotal * (1 + VAT_RATE) : null;

  const invoiceDate = new Date(req.createdAt!).toLocaleDateString("el-GR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const itemsRows = hasItems
    ? items.map(i => `<tr><td>${i.description}</td><td style="text-align:right">${fmt(parseFloat(i.amount))}</td></tr>`).join("")
    : req.price
      ? `<tr><td>Υπηρεσία επισκευής</td><td style="text-align:right">${fmt(parseFloat(req.price))}</td></tr>`
      : "";

  const priceSection = itemsTotal !== null ? `
    <table class="price-table">
      ${hasItems ? `<thead><tr><th>Περιγραφή</th><th style="text-align:right">Ποσό</th></tr></thead><tbody>${itemsRows}</tbody>` : ""}
    </table>
    <table class="price-table" style="margin-top:12px">
      <tr><td class="label">Υποσύνολο (χωρίς ΦΠΑ)</td><td class="value">${fmt(itemsTotal)}</td></tr>
      <tr><td class="label">ΦΠΑ 24%</td><td class="value">${fmt(vatAmount!)}</td></tr>
      <tr class="total-row">
        <td class="label"><strong>Σύνολο (με ΦΠΑ)</strong></td>
        <td class="value total-value"><strong>${fmt(totalWithVat!)}</strong></td>
      </tr>
    </table>` : `<p style="color:#888;font-size:13px;">Η τιμή δεν έχει οριστεί ακόμα.</p>`;

  const html = `<!DOCTYPE html>
<html lang="el"><head>
<meta charset="UTF-8"/>
<title>Δελτίο Παροχής Υπηρεσιών #REPR-${String(req.id).padStart(4,"0")}</title>
<style>
* { box-sizing:border-box; margin:0; padding:0; }
body { font-family:Arial,Helvetica,sans-serif; color:#1a1a2e; background:#fff; padding:50px 60px; font-size:14px; line-height:1.6; }
.header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #00D2C8; padding-bottom:24px; margin-bottom:28px; }
.brand { font-size:28px; font-weight:900; color:#00D2C8; }
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
.price-table { width:100%; max-width:420px; margin-left:auto; border-collapse:collapse; }
.price-table th { background:#f7f9fc; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#666; padding:8px 14px; text-align:left; border-bottom:2px solid #e5e5e5; }
.price-table td { padding:8px 14px; font-size:13px; border-bottom:1px solid #f0f0f0; }
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
    <div class="brand-sub">Επισκευές Κινητών &amp; IT Support<br/>Σπάρτη, Λακωνία | Τηλ: 6981882005 | info@hitechdoctor.com</div>
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
  </div>
  <div class="info-block">
    <div class="section-title">Στοιχεία Συσκευής</div>
    <p><span class="lbl">Συσκευή</span><br/>${req.deviceName}</p>
    <p><span class="lbl">Serial Number</span><br/>${req.serialNumber}</p>
    ${req.deviceCode ? `<p><span class="lbl">Κωδικός</span><br/>${req.deviceCode}</p>` : ""}
  </div>
</div>
<div class="section">
  <div class="section-title">${hasItems ? "Ανάλυση Εργασιών & Ανταλλακτικών" : "Περιγραφή Εργασιών"}</div>
  ${hasItems ? "" : `<p style="font-size:13px;color:#333;margin-bottom:16px;">${req.notes || "Επισκευή — " + req.deviceName}</p>`}
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

// ── Status config ─────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "pending",     label: "Νέο",          icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "in-progress", label: "Σε Εξέλιξη",   icon: Clock,       color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/30"   },
  { value: "completed",   label: "Ολοκληρώθηκε", icon: CheckCircle2,color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" },
  { value: "cancelled",   label: "Ακυρώθηκε",    icon: XCircle,     color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30"     },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUSES.find((s) => s.value === status) ?? STATUSES[0];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
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
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
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

// ── Repair Items Detail Panel ─────────────────────────────────────────────────
function RepairDetailPanel({ req }: { req: RepairRequest }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newDesc, setNewDesc] = useState("");
  const [newAmt, setNewAmt] = useState("");
  const [manualPrice, setManualPrice] = useState(req.price ?? "");
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmt, setEditAmt] = useState("");

  const { data: items = [], isLoading } = useQuery<RepairItem[]>({
    queryKey: ["/api/repair-requests", req.id, "items"],
    queryFn: async () => {
      const res = await fetch(`/api/repair-requests/${req.id}/items`, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load items");
      return res.json();
    },
  });

  const addItem = useMutation({
    mutationFn: () => apiRequest("POST", `/api/repair-requests/${req.id}/items`, {
      description: newDesc.trim(),
      amount: parseFloat(newAmt).toFixed(2),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests", req.id, "items"] });
      invalidateRepairFinancialQueries(queryClient);
      setNewDesc(""); setNewAmt("");
      toast({ title: "Προστέθηκε", description: "Το στοιχείο χρέωσης αποθηκεύτηκε." });
    },
    onError: () => toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης.", variant: "destructive" }),
  });

  const deleteItem = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/repair-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests", req.id, "items"] });
      invalidateRepairFinancialQueries(queryClient);
      toast({ title: "Διαγράφηκε" });
    },
  });

  const updateItem = useMutation({
    mutationFn: ({ id, description, amount }: { id: number; description: string; amount: string }) =>
      apiRequest("PUT", `/api/repair-items/${id}`, { description, amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests", req.id, "items"] });
      invalidateRepairFinancialQueries(queryClient);
      setEditingItemId(null);
      toast({ title: "Ενημερώθηκε" });
    },
  });

  const savePrice = useMutation({
    mutationFn: (price: string | null) => apiRequest("PATCH", `/api/repair-requests/${req.id}`, { price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
      invalidateRepairFinancialQueries(queryClient);
      toast({ title: "Αποθηκεύτηκε", description: "Η τιμή ενημερώθηκε." });
    },
  });

  const itemsNetTotal = items.reduce((s, i) => s + parseFloat(i.amount), 0);
  const manualNet = parseFloat(manualPrice);
  const displayNet = items.length > 0 ? itemsNetTotal : (!isNaN(manualNet) && manualNet > 0 ? manualNet : null);
  const displayVat = displayNet !== null ? displayNet * VAT_RATE : null;
  const displayTotal = displayNet !== null ? displayNet * (1 + VAT_RATE) : null;

  const manualInputNet = parseFloat(manualPrice);
  const hasManualVal = manualPrice !== "" && !isNaN(manualInputNet) && manualInputNet > 0;

  return (
    <tr>
      <td colSpan={11} className="px-0 py-0">
        <div className="bg-background/60 border-t border-b border-white/8 px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Left: Line items editor ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-display font-bold">Ανάλυση Εργασιών & Χρεώσεων</h3>
              </div>

              {isLoading ? (
                <div className="text-xs text-muted-foreground py-4 flex items-center gap-2">
                  <span className="w-3 h-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
                  Φόρτωση...
                </div>
              ) : (
                <>
                  {items.length > 0 && (
                    <div className="rounded-xl border border-white/8 overflow-hidden mb-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-white/5 text-left">
                            <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Περιγραφή</th>
                            <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 text-right">Ποσό</th>
                            <th className="px-3 py-2 w-16"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {items.map((item) => (
                            <tr key={item.id} className="hover:bg-white/3">
                              {editingItemId === item.id ? (
                                <>
                                  <td className="px-3 py-2">
                                    <input
                                      value={editDesc}
                                      onChange={e => setEditDesc(e.target.value)}
                                      className="w-full bg-background border border-primary/30 rounded-lg px-2 py-1 text-xs outline-none"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input
                                      type="number" step="0.01" value={editAmt}
                                      onChange={e => setEditAmt(e.target.value)}
                                      className="w-20 bg-background border border-primary/30 rounded-lg px-2 py-1 text-xs outline-none text-right ml-auto block"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => updateItem.mutate({ id: item.id, description: editDesc, amount: parseFloat(editAmt).toFixed(2) })}
                                        className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                                      >✓</button>
                                      <button
                                        onClick={() => setEditingItemId(null)}
                                        className="text-[10px] px-2 py-1 rounded bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
                                      >✗</button>
                                    </div>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td
                                    className="px-3 py-2.5 text-xs text-foreground cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => { setEditingItemId(item.id); setEditDesc(item.description); setEditAmt(item.amount); }}
                                  >{item.description}</td>
                                  <td className="px-3 py-2.5 text-xs font-medium text-right">{fmt(parseFloat(item.amount))}</td>
                                  <td className="px-3 py-2.5">
                                    <button
                                      onClick={() => deleteItem.mutate(item.id)}
                                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                        {items.length > 0 && (
                          <tfoot>
                            <tr className="bg-white/3 border-t border-white/10">
                              <td className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Σύνολο (χωρίς ΦΠΑ)</td>
                              <td className="px-3 py-2 text-sm font-bold text-primary text-right">{fmt(itemsNetTotal)}</td>
                              <td></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}

                  {/* Add new item */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Περιγραφή</label>
                      <input
                        value={newDesc}
                        onChange={e => setNewDesc(e.target.value)}
                        placeholder="π.χ. Αλλαγή οθόνης, Μπαταρία..."
                        className="w-full h-9 px-3 text-xs bg-card border border-white/10 rounded-xl outline-none focus:border-primary/40 transition-colors text-foreground placeholder:text-muted-foreground/50"
                        data-testid={`input-item-desc-${req.id}`}
                        onKeyDown={e => { if (e.key === "Enter" && newDesc.trim() && newAmt) addItem.mutate(); }}
                      />
                    </div>
                    <div className="w-28">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Ποσό (€)</label>
                      <input
                        type="number" step="0.01" min="0"
                        value={newAmt} onChange={e => setNewAmt(e.target.value)}
                        placeholder="0,00"
                        className="w-full h-9 px-3 text-xs bg-card border border-white/10 rounded-xl outline-none focus:border-primary/40 transition-colors text-right text-foreground placeholder:text-muted-foreground/50"
                        data-testid={`input-item-amount-${req.id}`}
                        onKeyDown={e => { if (e.key === "Enter" && newDesc.trim() && newAmt) addItem.mutate(); }}
                      />
                    </div>
                    <button
                      onClick={() => { if (newDesc.trim() && newAmt) addItem.mutate(); }}
                      disabled={!newDesc.trim() || !newAmt || addItem.isPending}
                      className="h-9 px-4 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5"
                      data-testid={`btn-add-item-${req.id}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Προσθήκη
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1.5">Κλικ σε περιγραφή για επεξεργασία. Enter για γρήγορη αποθήκευση.</p>
                </>
              )}
            </div>

            {/* ── Right: Price box with VAT calculation ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
                  <Euro className="w-3.5 h-3.5 text-primary" />
                </div>
                <h3 className="text-sm font-display font-bold">Τιμή & Υπολογισμός ΦΠΑ</h3>
              </div>

              {/* Manual price input box */}
              <div className="bg-card border border-white/10 rounded-2xl p-4 mb-4">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-2 block">
                  {items.length > 0 ? "Χειροκίνητη τιμή (προαιρετικό)" : "Τιμή χωρίς ΦΠΑ (€)"}
                </label>
                <div className="flex gap-2 items-center mb-3">
                  <div className="flex-1 flex items-center gap-2 h-10 px-3 bg-background border border-white/10 rounded-xl focus-within:border-primary/40 transition-colors">
                    <span className="text-muted-foreground text-sm">€</span>
                    <input
                      type="number" min="0" step="0.01"
                      value={manualPrice}
                      onChange={e => setManualPrice(e.target.value)}
                      placeholder="π.χ. 20"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40"
                      data-testid={`input-manual-price-${req.id}`}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const trimmed = manualPrice.trim();
                      const parsed = parseFloat(trimmed);
                      savePrice.mutate(trimmed === "" || isNaN(parsed) ? null : parsed.toFixed(2));
                    }}
                    disabled={savePrice.isPending}
                    className="h-10 px-4 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary text-xs font-semibold transition-all disabled:opacity-40"
                    data-testid={`btn-save-price-${req.id}`}
                  >
                    Αποθήκευση
                  </button>
                </div>

                {/* Live VAT calculation from manual input */}
                {hasManualVal && items.length === 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold mb-0.5">Χωρίς ΦΠΑ</p>
                      <p className="text-sm font-semibold text-foreground">{fmt(manualInputNet)}</p>
                    </div>
                    <div className="bg-primary/8 border border-primary/20 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] text-primary/70 uppercase tracking-wider font-bold mb-0.5">Με ΦΠΑ 24%</p>
                      <p className="text-base font-bold text-primary">{fmt(manualInputNet * 1.24)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary (items OR manual price) */}
              {displayNet !== null && (
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Σύνοψη Κόστους</p>
                    {items.length === 0 && req.priceIncludesVat !== null && req.priceIncludesVat !== undefined && (
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${req.priceIncludesVat ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/15 text-muted-foreground"}`}>
                        Συμφωνήθηκε {req.priceIncludesVat ? "με ΦΠΑ" : "χωρίς ΦΠΑ"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Σύνολο χωρίς ΦΠΑ</span>
                      <span className="font-medium">{fmt(displayNet)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">ΦΠΑ 24%</span>
                      <span className="font-medium">{fmt(displayVat!)}</span>
                    </div>
                    <div className="flex justify-between border-t border-primary/15 pt-2 mt-2">
                      <span className="text-sm font-bold">Σύνολο με ΦΠΑ</span>
                      <span className="text-lg font-bold text-primary">{fmt(displayTotal!)}</span>
                    </div>
                    {items.length === 0 && req.priceIncludesVat && displayTotal && (
                      <div className="flex justify-between text-[10px] text-primary font-semibold pt-1">
                        <span>✓ Τελική τιμή πελάτη (με ΦΠΑ)</span>
                        <span>{fmt(displayTotal)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Print button */}
              <button
                onClick={() => printRepairInvoice(req, items)}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-primary/10 border border-white/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-sm font-medium"
                data-testid={`btn-invoice-panel-${req.id}`}
              >
                <Printer className="w-4 h-4" />
                Εκτύπωση Δελτίου / PDF
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type MeResponse = { ok?: boolean; role?: string; id?: number };

type AdminUserRow = { id: number; name: string; email: string; role: string };

export default function AdminRepairRequests() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { data: me } = useQuery<MeResponse>({
    queryKey: ["/api/admin/me"],
  });
  const isStaff = me?.role === "staff";

  const { data: assignUsers = [] } = useQuery<AdminUserRow[]>({
    queryKey: ["/api/admin/users"],
    enabled: !isStaff,
  });

  const { data: requests, isLoading } = useQuery<RepairRequest[]>({
    queryKey: ["/api/admin/repair-requests"],
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assignedToUserId }: { id: number; assignedToUserId: number | null }) =>
      apiRequest("PATCH", `/api/repair-requests/${id}`, { assignedToUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
      toast({ title: "Αποθηκεύτηκε", description: "Η ανάθεση ενημερώθηκε." });
    },
    onError: () => toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης.", variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/repair-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
      invalidateRepairFinancialQueries(queryClient);
      toast({ title: "Ενημερώθηκε", description: "Η κατάσταση αποθηκεύτηκε." });
    },
    onError: () => toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης.", variant: "destructive" }),
  });

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!requests) return [];
    const q = search.toLowerCase().trim();
    return requests.filter((r) => {
      const matchesSearch = !q ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) || r.phone.includes(q) ||
        r.deviceName.toLowerCase().includes(q) || r.serialNumber.toLowerCase().includes(q) ||
        (r.notes ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const byStatus = (v: string) => requests?.filter((r) => r.status === v).length ?? 0;

  const stats = [
    { label: "Σύνολο",       value: requests?.length ?? 0, icon: Wrench,      color: "text-primary",    bg: "bg-primary/10 border-primary/20"       },
    { label: "Νέα",          value: byStatus("pending"),   icon: AlertCircle,  color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { label: "Σε Εξέλιξη",  value: byStatus("in-progress"),icon: Clock,       color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"     },
    { label: "Ολοκληρωμένα",value: byStatus("completed"),  icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20"   },
    { label: "Ακυρωμένα",   value: byStatus("cancelled"),  icon: XCircle,      color: "text-red-400",   bg: "bg-red-400/10 border-red-400/20"       },
  ];

  return (
    <AdminLayout>
      <Seo title="Αιτήματα Επισκευής — Admin" description="CRM αιτημάτων επισκευής" />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold">Αιτήματα Επισκευής</h1>
          <p className="text-muted-foreground mt-1">Διαχείριση και παρακολούθηση αιτημάτων επισκευής</p>
          {isStaff && (
            <p className="text-xs text-amber-400/90 mt-2">
              Βλέπετε μόνο τα αιτήματα που έχουν ανατεθεί στον λογαριασμό σας.
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/15 hover:border-primary/40"
          disabled={!requests || requests.length === 0}
          onClick={() => {
            const rows = (requests ?? []).map((r: RepairRequest) => ({
              "ID": r.id,
              "Επώνυμο": r.lastName,
              "Όνομα": r.firstName,
              "Τηλέφωνο": r.phone,
              "Email": r.email || "",
              "Συσκευή": r.deviceName,
              "Serial": r.serialNumber || "",
              "Κωδικός": r.deviceCode || "",
              "Βλάβη": r.notes || "",
              "Τιμή (€)": r.price ? Number(r.price).toFixed(2) : "",
              "Κατάσταση": STATUSES.find(s => s.value === r.status)?.label ?? r.status,
              "Ημερομηνία": formatDateEl(r.createdAt),
            }));
            exportToCsv(`epithefseis_${new Date().toISOString().slice(0,10)}.csv`, rows);
          }}
          data-testid="button-export-repairs"
        >
          <Download className="w-4 h-4" />
          Εξαγωγή CSV
        </Button>
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
                <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} / {requests?.length ?? 0} αιτήματα</p>
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
                    {["", "#", "Πελάτης", "Επικοινωνία", "Συσκευή", "Serial / Κωδικός", "Τιμή", "Ημερομηνία", "Υπεύθυνος", "Κατάσταση", ""].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((req) => {
                    const isExpanded = expandedRows.has(req.id);
                    return (
                      <Fragment key={req.id}>
                        <tr
                          className={`hover:bg-white/3 transition-colors border-b border-white/5 ${isExpanded ? "bg-white/3" : ""}`}
                          data-testid={`row-repair-${req.id}`}
                        >
                          {/* Expand toggle */}
                          <td className="px-3 py-4 w-10">
                            <button
                              onClick={() => toggleRow(req.id)}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isExpanded ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"}`}
                              data-testid={`btn-expand-${req.id}`}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
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
                                  <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[180px] truncate" title={req.notes}>{req.notes}</p>
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
                          <td className="px-4 py-4 whitespace-nowrap">
                            {req.price ? (() => {
                              const net = parseFloat(req.price);
                              const gross = net * (1 + VAT_RATE);
                              const agreedIsGross = req.priceIncludesVat === true;
                              return (
                                <div className="space-y-0.5">
                                  <div className="text-xs font-medium text-foreground">
                                    {agreedIsGross ? fmt(gross) : fmt(net)}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground/50 font-normal">
                                    {agreedIsGross ? "με ΦΠΑ" : "χωρίς ΦΠΑ"}
                                  </div>
                                  <div className="text-[10px] text-primary/70">
                                    {agreedIsGross ? `(net: ${fmt(net)})` : `(+ΦΠΑ: ${fmt(gross)})`}
                                  </div>
                                </div>
                              );
                            })() : (
                              <span className="text-xs text-muted-foreground/40">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(req.createdAt)}</span>
                          </td>
                          <td className="px-4 py-4 max-w-[160px]">
                            {isStaff ? (
                              <span className="text-xs text-muted-foreground">
                                {req.assignedToUserId != null ? "Εσείς" : "—"}
                              </span>
                            ) : (
                              <Select
                                value={req.assignedToUserId != null ? String(req.assignedToUserId) : "none"}
                                onValueChange={(v) =>
                                  assignMutation.mutate({
                                    id: req.id,
                                    assignedToUserId: v === "none" ? null : parseInt(v, 10),
                                  })
                                }
                                disabled={assignMutation.isPending}
                              >
                                <SelectTrigger className="h-8 text-xs border-white/10 bg-card" data-testid={`select-assign-${req.id}`}>
                                  <SelectValue placeholder="Ανάθεση" />
                                </SelectTrigger>
                                <SelectContent className="bg-background border-white/10">
                                  <SelectItem value="none" className="text-xs">— χωρίς ανάθεση</SelectItem>
                                  {assignUsers
                                    .filter((u) => u.role === "staff")
                                    .map((u) => (
                                      <SelectItem key={u.id} value={String(u.id)} className="text-xs">
                                        {u.name}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            )}
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
                              onClick={() => toggleRow(req.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all text-xs whitespace-nowrap font-medium"
                              data-testid={`btn-details-${req.id}`}
                            >
                              <Euro className="w-3 h-3" />
                              Λεπτομέρειες
                            </button>
                          </td>
                        </tr>
                        {isExpanded && <RepairDetailPanel req={req} />}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
