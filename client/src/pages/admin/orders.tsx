import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useEffect } from "react";
import {
  ShoppingCart, Euro, CheckCircle2, XCircle, Clock, AlertCircle,
  ChevronDown, ChevronRight, Mail, Package, Search, X,
  User, Printer, Download, Plus, Trash2, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import { apiRequest } from "@/lib/queryClient";
import { api } from "@shared/routes";
import type { CheckoutPayload, Product } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

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

// ── Print order via browser window (full Greek Unicode support) ───────────────
function printOrderWindow(order: any, items: any[]) {
  const num = `#ORD-${String(order.id).padStart(4, "0")}`;
  const statusLabel = ORDER_STATUSES.find((s) => s.value === order.status)?.label ?? order.status;
  const totalNet = Number(order.totalAmount) / 1.24;
  const vatAmt = Number(order.totalAmount) - totalNet;

  const rows = items
    .map(
      (it) => `
      <tr>
        <td>${it.productName ?? "—"}</td>
        <td class="center">${it.quantity}</td>
        <td class="right">${formatPrice(it.priceAtTime)}</td>
        <td class="right bold">${formatPrice(Number(it.priceAtTime) * it.quantity)}</td>
      </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8" />
  <title>Παραγγελία ${num} — HiTech Doctor</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', Arial, sans-serif; background: #fff; color: #1a1a2e; font-size: 13px; }
    
    .header { background: #f0f4ff; border-bottom: 3px solid #00aaa5; padding: 28px 36px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand-name { font-size: 24px; font-weight: 900; color: #00888a; letter-spacing: -0.5px; margin-bottom: 6px; }
    .brand-sub { color: #6670aa; font-size: 11px; line-height: 1.7; }
    .order-badge { text-align: right; }
    .order-label { font-size: 22px; font-weight: 900; color: #1a1a2e; letter-spacing: 2px; }
    .order-num { color: #00888a; font-size: 13px; font-weight: 700; margin-top: 4px; }
    .order-date { color: #6670aa; font-size: 11px; margin-top: 2px; }
    
    .accent-bar { height: 3px; background: linear-gradient(90deg, #00D2C8, #0099ff); }
    
    .body { padding: 28px 36px; }
    
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px; }
    .info-box { background: #f4f6fb; border-radius: 10px; padding: 16px 20px; }
    .info-box-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #00D2C8; margin-bottom: 8px; }
    .info-box-name { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px; }
    .info-box-sub { font-size: 11px; color: #666; }
    .total-val { font-size: 20px; font-weight: 900; color: #00D2C8; margin-top: 6px; }
    
    .section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #8890aa; margin-bottom: 10px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    thead tr { background: #e6f7f7; }
    thead th { padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #007b7d; }
    tbody tr { border-bottom: 1px solid #eee; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 10px 14px; color: #1a1a2e; vertical-align: middle; }
    tbody tr:nth-child(even) td { background: #f9fafb; }
    .center { text-align: center; }
    .right { text-align: right; }
    .bold { font-weight: 700; }
    
    .totals { display: flex; justify-content: flex-end; margin-top: 4px; }
    .totals-box { background: #f0f4ff; border: 1px solid #c5d0ef; border-radius: 10px; padding: 18px 24px; min-width: 240px; }
    .totals-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .totals-row:last-child { margin-bottom: 0; padding-top: 10px; border-top: 1px solid #c5d0ef; }
    .totals-label { font-size: 11px; color: #666; }
    .totals-amount { font-size: 12px; font-weight: 600; color: #333; }
    .totals-total-label { font-size: 13px; font-weight: 800; color: #1a1a2e; }
    .totals-total-amount { font-size: 18px; font-weight: 900; color: #007b7d; }
    
    .footer { margin-top: 40px; padding: 16px 36px; background: #f0f4ff; border-top: 1px solid #c5d0ef; text-align: center; }
    .footer p { font-size: 10px; color: #666; line-height: 1.8; }
    
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand-name">HiTech Doctor</div>
      <div class="brand-sub">
        info@hitechdoctor.com &nbsp;|&nbsp; 698 188 2005<br/>
        www.hitechdoctor.com
      </div>
    </div>
    <div class="order-badge">
      <div class="order-label">ΠΑΡΑΓΓΕΛΙΑ</div>
      <div class="order-num">${num}</div>
      <div class="order-date">${formatDateShort(order.createdAt)}</div>
    </div>
  </div>
  <div class="accent-bar"></div>

  <div class="body">
    <div class="info-grid">
      <div class="info-box">
        <div class="info-box-label">Στοιχεία Πελάτη</div>
        <div class="info-box-name">${order.customerName ?? "—"}</div>
        <div class="info-box-sub">${order.customerEmail ?? ""}</div>
      </div>
      <div class="info-box">
        <div class="info-box-label">Κατάσταση / Σύνολο</div>
        <div class="info-box-name">${statusLabel}</div>
        <div class="total-val">${formatPrice(order.totalAmount)}</div>
      </div>
    </div>

    <div class="section-label">Προϊόντα Παραγγελίας</div>
    <table>
      <thead>
        <tr>
          <th>Προϊόν</th>
          <th class="center">Ποσ.</th>
          <th class="right">Τιμή μον.</th>
          <th class="right">Σύνολο</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span class="totals-label">Καθαρή αξία</span>
          <span class="totals-amount">${formatPrice(totalNet)}</span>
        </div>
        <div class="totals-row">
          <span class="totals-label">ΦΠΑ 24%</span>
          <span class="totals-amount">${formatPrice(vatAmt)}</span>
        </div>
        <div class="totals-row">
          <span class="totals-total-label">ΣΥΝΟΛΟ</span>
          <span class="totals-total-amount">${formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>
      Ευχαριστούμε για την παραγγελία σας!<br/>
      HiTech Doctor &nbsp;|&nbsp; info@hitechdoctor.com &nbsp;|&nbsp; 698 188 2005 &nbsp;|&nbsp; www.hitechdoctor.com
    </p>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
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

// ── Επιλογέας προϊόντος με αναζήτηση (χειροκίνητη παραγγελία) ─────────────────
function ManualOrderProductSelect({
  products,
  productId,
  onChange,
}: {
  products: Product[];
  productId: number;
  onChange: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === productId);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between border-white/10 bg-background text-xs font-normal h-9 px-3"
        >
          <span className="truncate text-left">{selected?.name ?? "Επιλογή προϊόντος"}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,360px)]" align="start">
        <Command>
          <CommandInput placeholder="Αναζήτηση προϊόντος…" className="h-9" />
          <CommandList>
            <CommandEmpty>Δεν βρέθηκε προϊόν.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.name} ${p.id}`}
                  onSelect={() => {
                    onChange(p.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4 shrink-0", productId === p.id ? "opacity-100" : "opacity-0")}
                  />
                  <span className="truncate">{p.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ── Χειροκίνητη παραγγελία (admin) ───────────────────────────────────────────
function ManualOrderDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products, isLoading: loadingProducts } = useProducts();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPayload["paymentMethod"]>("cod");
  const [lines, setLines] = useState<{ productId: number; quantity: number }[]>([{ productId: 0, quantity: 1 }]);

  useEffect(() => {
    if (!open) return;
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
    setPaymentMethod("cod");
    setLines([{ productId: 0, quantity: 1 }]);
  }, [open]);

  useEffect(() => {
    if (!open || !products?.length) return;
    setLines((prev) => {
      if (prev.length === 1 && prev[0].productId === 0) {
        return [{ productId: products[0].id, quantity: 1 }];
      }
      return prev;
    });
  }, [open, products]);

  const mutation = useMutation({
    mutationFn: (payload: CheckoutPayload) => apiRequest("POST", "/api/admin/orders", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      toast({ title: "Η παραγγελία δημιουργήθηκε" });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Αποτυχία";
      toast({ variant: "destructive", title: "Σφάλμα", description: msg });
    },
  });

  const handleSubmit = () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      toast({ variant: "destructive", title: "Συμπληρώστε όνομα και email πελάτη" });
      return;
    }
    const validLines = lines.filter((l) => l.productId > 0 && l.quantity >= 1);
    if (validLines.length === 0) {
      toast({ variant: "destructive", title: "Προσθέστε τουλάχιστον ένα προϊόν" });
      return;
    }
    const payload: CheckoutPayload = {
      customer: {
        name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim() || null,
        address: customerAddress.trim() || null,
      },
      items: validLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      paymentMethod,
    };
    mutation.mutate(payload);
  };

  const addLine = () => {
    const pid = products?.[0]?.id ?? 0;
    setLines((prev) => [...prev, { productId: pid, quantity: 1 }]);
  };

  const removeLine = (idx: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-white/10 bg-card">
        <DialogHeader>
          <DialogTitle>Προσθήκη παραγγελίας</DialogTitle>
        </DialogHeader>
        {loadingProducts ? (
          <p className="text-sm text-muted-foreground py-6">Φόρτωση προϊόντων…</p>
        ) : !products?.length ? (
          <p className="text-sm text-amber-400/90 py-4">Δεν υπάρχουν προϊόντα στο eShop. Προσθέστε προϊόντα πρώτα.</p>
        ) : (
          <div className="space-y-4 py-1">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Ονοματεπώνυμο πελάτη</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Πλήρες όνομα" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Τηλέφωνο</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Διεύθυνση (προαιρετικό)</Label>
                <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Τρόπος πληρωμής</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as CheckoutPayload["paymentMethod"])}>
                <SelectTrigger className="border-white/10 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cod">Αντικαταβολή</SelectItem>
                  <SelectItem value="bank">Τραπεζική κατάθεση</SelectItem>
                  <SelectItem value="card">Κάρτα</SelectItem>
                  <SelectItem value="store">Κατάστημα</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Γραμμές παραγγελίας</Label>
                <Button type="button" variant="outline" size="sm" className="h-8 gap-1" onClick={addLine}>
                  <Plus className="w-3.5 h-3.5" /> Γραμμή
                </Button>
              </div>
              {lines.map((line, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[160px] space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Προϊόν</Label>
                    <ManualOrderProductSelect
                      products={products}
                      productId={line.productId}
                      onChange={(id) => {
                        setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, productId: id } : row)));
                      }}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Ποσ.</Label>
                    <Input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setLines((prev) => prev.map((row, i) => (i === idx ? { ...row, quantity: q } : row)));
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-red-400"
                    onClick={() => removeLine(idx)}
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Ακύρωση</Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending || loadingProducts || !products?.length}>
            {mutation.isPending ? "Αποθήκευση…" : "Δημιουργία παραγγελίας"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      printOrderWindow(order, orderItems);
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
  const [manualOpen, setManualOpen] = useState(false);

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
  const totalRevenue = orders?.reduce((s: number, o: any) => (o.status === "completed" ? s + Number(o.totalAmount) : s), 0) ?? 0;
  const byStatus = (v: string) => orders?.filter((o: any) => o.status === v).length ?? 0;

  const stats = [
    { label: "Έσοδα (ολοκληρωμένες)", value: formatPrice(totalRevenue), icon: Euro, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { label: "Σύνολο Παραγγελιών", value: orders?.length ?? 0, icon: ShoppingCart, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { label: "Εκκρεμείς", value: byStatus("pending"), icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { label: "Ολοκληρωμένες", value: byStatus("completed"), icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10 border-green-400/20" },
    { label: "Ακυρωμένες", value: byStatus("cancelled"), icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
  ];

  return (
    <AdminLayout>
      <Seo title="Παραγγελίες — Admin" description="Διαχείριση παραγγελιών eShop" />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold">Παραγγελίες</h1>
          <p className="text-muted-foreground mt-1">Παρακολούθηση, αναζήτηση και διεκπεραίωση παραγγελιών eShop</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setManualOpen(true)}
            data-testid="btn-add-manual-order"
          >
            <Plus className="w-4 h-4" />
            Προσθήκη παραγγελίας
          </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/15 hover:border-primary/40"
          disabled={!orders || orders.length === 0}
          onClick={() => {
            const rows = (orders ?? []).map((o: any) => ({
              "ID": o.id,
              "Πελάτης": o.customerName || "",
              "Email": o.customerEmail || "",
              "Τηλέφωνο": o.customerPhone || "",
              "Ημερομηνία": formatDateEl(o.createdAt),
              "Σύνολο (€)": Number(o.totalAmount).toFixed(2),
              "Τρόπος Πληρωμής": o.paymentMethod || "",
              "Κατάσταση": ORDER_STATUSES.find(s => s.value === o.status)?.label ?? o.status,
            }));
            exportToCsv(`paraggelies_${new Date().toISOString().slice(0,10)}.csv`, rows);
          }}
          data-testid="button-export-orders"
        >
          <Download className="w-4 h-4" />
          Εξαγωγή CSV
        </Button>
        </div>
      </div>

      <ManualOrderDialog open={manualOpen} onOpenChange={setManualOpen} />

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
