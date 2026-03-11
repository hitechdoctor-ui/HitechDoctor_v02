import { useState, Fragment, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, XCircle, Download, Search } from "lucide-react";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import type { Subscription } from "@shared/schema";

const PRICE = "55.00";

const formSchema = z.object({
  customerName: z.string().min(2, "Εισάγετε το όνομα πελάτη"),
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().optional(),
  antivirusName: z.string().optional(),
  startDate: z.string().min(1, "Επιλέξτε ημερομηνία έναρξης"),
  status: z.enum(["active", "expired", "cancelled"]),
  notes: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

function daysUntil(date: string | Date) {
  const now = new Date();
  const d = new Date(date);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function renewalBadge(sub: Subscription) {
  if (sub.status !== "active") return null;
  const days = daysUntil(sub.renewalDate);
  if (days < 0) return <Badge variant="destructive" className="text-[10px]">Έληξε</Badge>;
  if (days <= 10) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">⚠️ {days}μ</Badge>;
  if (days <= 30) return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">📅 {days}μ</Badge>;
  return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">✓ {days}μ</Badge>;
}

function statusLabel(status: string) {
  if (status === "active") return <span className="text-emerald-400 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Ενεργή</span>;
  if (status === "expired") return <span className="text-red-400 text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" />Έληξε</span>;
  return <span className="text-muted-foreground text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" />Ακυρώθηκε</span>;
}

const STATUS_FILTERS = [
  { value: "all",       label: "Όλες" },
  { value: "active",    label: "Ενεργές" },
  { value: "expired",   label: "Έληξαν" },
  { value: "cancelled", label: "Ακυρωμένες" },
];

export default function AdminAntivirusSubscriptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: subs = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions", "antivirus"],
    queryFn: () => fetch("/api/subscriptions?type=antivirus").then(r => r.json()),
  });

  const filtered = useMemo(() => {
    let list = subs;
    if (statusFilter !== "all") list = list.filter(s => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.customerName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone || "").includes(q) ||
        ((s as any).antivirusName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [subs, search, statusFilter]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { customerName: "", email: "", phone: "", antivirusName: "", startDate: "", status: "active", notes: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ customerName: "", email: "", phone: "", antivirusName: "", startDate: new Date().toISOString().slice(0, 10), status: "active", notes: "" });
    setFormOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditing(sub);
    form.reset({
      customerName: sub.customerName,
      email: sub.email,
      phone: sub.phone || "",
      antivirusName: (sub as any).antivirusName || "",
      startDate: new Date(sub.startDate).toISOString().slice(0, 10),
      status: sub.status as "active" | "expired" | "cancelled",
      notes: sub.notes || "",
    });
    setFormOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const start = new Date(values.startDate);
      const renewal = new Date(start);
      renewal.setFullYear(renewal.getFullYear() + 1);
      return apiRequest("POST", "/api/subscriptions", {
        ...values,
        type: "antivirus",
        price: PRICE,
        startDate: start.toISOString(),
        renewalDate: renewal.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setFormOpen(false);
      toast({ title: "Συνδρομή δημιουργήθηκε!" });
    },
    onError: () => toast({ title: "Σφάλμα", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => {
      const start = new Date(values.startDate);
      const renewal = new Date(start);
      renewal.setFullYear(renewal.getFullYear() + 1);
      return apiRequest("PATCH", `/api/subscriptions/${editing!.id}`, {
        ...values,
        renewalDate: renewal.toISOString(),
        notifiedMonthBefore: false,
        notifiedTenDaysBefore: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setFormOpen(false);
      toast({ title: "Συνδρομή ενημερώθηκε!" });
    },
    onError: () => toast({ title: "Σφάλμα", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      setDeleteId(null);
      toast({ title: "Διαγράφηκε!" });
    },
    onError: () => toast({ title: "Σφάλμα", variant: "destructive" }),
  });

  function onSubmit(values: FormValues) {
    if (editing) updateMutation.mutate(values);
    else createMutation.mutate(values);
  }

  const expiringCount = subs.filter(s => s.status === "active" && daysUntil(s.renewalDate) <= 30).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-sky-400" />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-foreground">Συνδρομές Antivirus</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">€55 / χρόνο — ανανέωση κάθε 12 μήνες</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline" size="sm" className="gap-2 border-white/15 hover:border-primary/40"
              disabled={subs.length === 0}
              onClick={() => {
                const rows = subs.map((s: Subscription) => ({
                  "ID": s.id, "Πελάτης": s.customerName, "Email": s.email,
                  "Τηλέφωνο": s.phone || "", "Antivirus": (s as any).antivirusName || "",
                  "Τιμή (€)": Number(s.price).toFixed(2),
                  "Έναρξη": formatDateEl(s.startDate), "Ανανέωση": formatDateEl(s.renewalDate),
                  "Κατάσταση": s.status, "Σημειώσεις": s.notes || "",
                }));
                exportToCsv(`syndromites_antivirus_${new Date().toISOString().slice(0,10)}.csv`, rows);
              }}
              data-testid="button-export-antivirus"
            >
              <Download className="w-4 h-4" />Εξαγωγή CSV
            </Button>
            <Button onClick={openCreate} className="gap-2" data-testid="button-add-antivirus">
              <Plus className="w-4 h-4" />Νέα Συνδρομή
            </Button>
          </div>
        </div>

        {expiringCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {expiringCount} συνδρομή/-ές λήγουν εντός 30 ημερών!
          </div>
        )}

        {/* Search + Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Αναζήτηση πελάτη, email, antivirus..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
              data-testid="input-search-antivirus"
            />
          </div>
          <div className="flex gap-1">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  statusFilter === f.value
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-muted-foreground hover:text-foreground border border-white/8 hover:border-white/15"
                }`}
                data-testid={`filter-antivirus-${f.value}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Φόρτωση...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{subs.length === 0 ? "Δεν υπάρχουν συνδρομές antivirus ακόμα." : "Δεν βρέθηκαν αποτελέσματα."}</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  {["Πελάτης", "Email / Τηλ.", "Antivirus", "Έναρξη", "Λήξη", "Κατάσταση", ""].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, i) => (
                  <Fragment key={sub.id}>
                    <tr className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`} data-testid={`row-antivirus-${sub.id}`}>
                      <td className="px-4 py-3 font-semibold text-foreground">{sub.customerName}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">{sub.email}</div>
                        {sub.phone && <div className="text-xs text-muted-foreground">{sub.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{(sub as any).antivirusName || "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(sub.startDate).toLocaleDateString("el-GR")}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">{new Date(sub.renewalDate).toLocaleDateString("el-GR")}</div>
                        <div className="mt-0.5">{renewalBadge(sub)}</div>
                      </td>
                      <td className="px-4 py-3">{statusLabel(sub.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors" data-testid={`button-edit-sub-${sub.id}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition-colors" data-testid={`button-delete-sub-${sub.id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Επεξεργασία Συνδρομής" : "Νέα Συνδρομή Antivirus"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="customerName" render={({ field }) => (
                <FormItem><FormLabel>Όνομα Πελάτη</FormLabel><FormControl><Input {...field} data-testid="input-sub-name" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" data-testid="input-sub-email" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Τηλέφωνο</FormLabel><FormControl><Input {...field} data-testid="input-sub-phone" /></FormControl></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="antivirusName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Όνομα Antivirus</FormLabel>
                  <FormControl><Input {...field} placeholder="π.χ. ESET, Bitdefender, Kaspersky..." data-testid="input-sub-antivirus-name" /></FormControl>
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem><FormLabel>Ημ. Έναρξης</FormLabel><FormControl><Input {...field} type="date" data-testid="input-sub-start" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Κατάσταση</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-sub-status"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ενεργή</SelectItem>
                        <SelectItem value="expired">Έληξε</SelectItem>
                        <SelectItem value="cancelled">Ακυρώθηκε</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Σημειώσεις</FormLabel><FormControl><Textarea {...field} rows={2} className="resize-none" data-testid="textarea-sub-notes" /></FormControl></FormItem>
              )} />
              <div className="p-3 rounded-xl bg-sky-500/8 border border-sky-500/20 text-xs text-sky-400">
                <strong>Τιμή:</strong> €55,00 / χρόνο — η λήξη υπολογίζεται αυτόματα (+12 μήνες)
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full" data-testid="button-sub-save">
                {editing ? "Αποθήκευση" : "Δημιουργία Συνδρομής"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Διαγραφή Συνδρομής;</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Η ενέργεια αυτή δεν αναιρείται.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="flex-1">Ακύρωση</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleteId!)} disabled={deleteMutation.isPending} className="flex-1">Διαγραφή</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
