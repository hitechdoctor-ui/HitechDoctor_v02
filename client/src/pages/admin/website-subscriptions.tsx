import { useState, Fragment } from "react";
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
import { Globe, Plus, Pencil, Trash2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Subscription } from "@shared/schema";

const PRICE = "150.00";

const formSchema = z.object({
  customerName: z.string().min(2, "Εισάγετε το όνομα πελάτη"),
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().optional(),
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

export default function AdminWebsiteSubscriptions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: subs = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ["/api/subscriptions", "website"],
    queryFn: () => fetch("/api/subscriptions?type=website").then(r => r.json()),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { customerName: "", email: "", phone: "", startDate: "", status: "active", notes: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ customerName: "", email: "", phone: "", startDate: new Date().toISOString().slice(0, 10), status: "active", notes: "" });
    setFormOpen(true);
  }

  function openEdit(sub: Subscription) {
    setEditing(sub);
    form.reset({
      customerName: sub.customerName,
      email: sub.email,
      phone: sub.phone || "",
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
        type: "website",
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-400" />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-foreground">Συνδρομές Ιστοσελίδων</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-12">€150 / χρόνο — ανανέωση κάθε 12 μήνες</p>
          </div>
          <Button onClick={openCreate} className="gap-2" data-testid="button-add-website-sub">
            <Plus className="w-4 h-4" />
            Νέα Συνδρομή
          </Button>
        </div>

        {expiringCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {expiringCount} συνδρομή/-ές ιστοσελίδων λήγουν εντός 30 ημερών!
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Φόρτωση...</div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Δεν υπάρχουν συνδρομές ιστοσελίδων ακόμα.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-white/3">
                  {["Πελάτης", "Email / Τηλ.", "Έναρξη", "Λήξη", "Κατάσταση", "Σημειώσεις", ""].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((sub, i) => (
                  <Fragment key={sub.id}>
                    <tr className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                      <td className="px-4 py-3 font-semibold text-foreground">{sub.customerName}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">{sub.email}</div>
                        {sub.phone && <div className="text-xs text-muted-foreground">{sub.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(sub.startDate).toLocaleDateString("el-GR")}</td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-foreground">{new Date(sub.renewalDate).toLocaleDateString("el-GR")}</div>
                        <div className="mt-0.5">{renewalBadge(sub)}</div>
                      </td>
                      <td className="px-4 py-3">{statusLabel(sub.status)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">{sub.notes || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(sub.id)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition-colors">
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

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Επεξεργασία Συνδρομής" : "Νέα Συνδρομή Ιστοσελίδας"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="customerName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Όνομα Πελάτη / Επωνυμία</FormLabel>
                  <FormControl><Input {...field} placeholder="π.χ. Γιώργος Παπαδόπουλος ή ABC ΕΤΑΙΡΕΙΑ" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input {...field} type="email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Τηλέφωνο</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ημ. Έναρξης</FormLabel>
                    <FormControl><Input {...field} type="date" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Κατάσταση</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
                <FormItem>
                  <FormLabel>Σημειώσεις (π.χ. domain, URL site)</FormLabel>
                  <FormControl><Textarea {...field} rows={2} className="resize-none" placeholder="π.χ. mysite.gr — WordPress" /></FormControl>
                </FormItem>
              )} />
              <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-400">
                <strong>Τιμή:</strong> €150,00 / χρόνο — η λήξη υπολογίζεται αυτόματα (+12 μήνες)
              </div>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full">
                {editing ? "Αποθήκευση" : "Δημιουργία Συνδρομής"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
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
