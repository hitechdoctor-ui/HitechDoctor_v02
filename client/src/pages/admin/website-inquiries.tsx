import { Fragment, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Globe, Mail, Phone, Download, Pencil, Printer, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import type { WebsiteInquiry } from "@shared/schema";

const VAT = 0.24;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

const STATUS_OPTIONS = [
  { value: "pending",   label: "Αναμένει",    color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "contacted", label: "Επικοινωνία", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { value: "won",       label: "Κλείστηκε",   color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "lost",      label: "Χάθηκε",      color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  return <Badge className={`${s.color} text-[10px] font-bold`}>{s.label}</Badge>;
}

const editSchema = z.object({
  firstName: z.string().min(1, "Υποχρεωτικό"),
  lastName: z.string().min(1, "Υποχρεωτικό"),
  phone: z.string().min(10, "Μη έγκυρο τηλέφωνο"),
  email: z.string().email("Μη έγκυρο email"),
  notes: z.string().optional(),
  prepayment: z.string().optional(),
  status: z.string(),
});
type EditValues = z.infer<typeof editSchema>;

function printInquiry(inq: WebsiteInquiry) {
  const statusLabel = STATUS_OPTIONS.find(s => s.value === inq.status)?.label ?? inq.status;
  const date = new Date(inq.createdAt!).toLocaleDateString("el-GR", { day: "2-digit", month: "long", year: "numeric" });
  const prep = inq.prepayment ? parseFloat(inq.prepayment) : null;
  const gross = prep !== null ? prep * (1 + VAT) : null;
  const html = `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>Αίτημα Ιστοσελίδας</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;color:#1a1a2e;background:#fff;padding:50px 60px;font-size:14px;line-height:1.6}
.header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #00D2C8;padding-bottom:24px;margin-bottom:28px}
.brand{font-size:24px;font-weight:900;color:#00D2C8}.brand span{color:#1a1a2e}
.brand-sub{font-size:12px;color:#555;margin-top:4px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
.lbl{font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px}
.notes-box{background:#f7f9fc;border-radius:8px;padding:14px 16px;font-size:13px;color:#444;line-height:1.6;margin-bottom:20px}
.section-title{font-size:11px;font-weight:700;text-transform:uppercase;color:#00D2C8;border-bottom:1px solid #e5e5e5;padding-bottom:6px;margin-bottom:12px}
.price-box{background:#f0fbfa;border:1px solid #00D2C8;border-radius:8px;padding:16px 20px;max-width:260px;margin-left:auto}
.pr{display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px}
.pt{display:flex;justify-content:space-between;padding-top:10px;border-top:1px solid #00D2C8;font-weight:700;font-size:15px;color:#00D2C8}
.footer{border-top:2px solid #e5e5e5;padding-top:20px;margin-top:40px;text-align:center;color:#777;font-size:11px}
@media print{body{padding:30px 40px}@page{margin:1.5cm}}
</style></head>
<body>
<div class="header">
  <div><div class="brand">HiTech<span>Doctor</span></div><div class="brand-sub">Κατασκευή Ιστοσελίδων — Αθήνα<br>698 188 2005 | info@hitechdoctor.com</div></div>
  <div style="text-align:right"><h2 style="font-size:18px;font-weight:700">Αίτημα Ιστοσελίδας</h2><p style="font-size:12px;color:#666;margin-top:4px">Ημερομηνία: ${date}</p><p style="font-size:12px;color:#666">Κατάσταση: <strong>${statusLabel}</strong></p></div>
</div>
<div class="grid">
  <div><div class="lbl">Ονοματεπώνυμο</div><strong>${inq.firstName} ${inq.lastName}</strong></div>
  <div><div class="lbl">Τηλέφωνο</div>${inq.phone}</div>
  <div><div class="lbl">Email</div>${inq.email}</div>
  <div><div class="lbl">Κατάσταση</div>${statusLabel}</div>
</div>
${inq.notes ? `<div class="section-title">Σχόλια / Σημειώσεις</div><div class="notes-box">${inq.notes}</div>` : ""}
${prep !== null ? `<div class="section-title">Οικονομικά</div><div class="price-box"><div class="pr"><span>Προκαταβολή (καθαρό):</span><span>${fmt(prep)}</span></div><div class="pr"><span>ΦΠΑ 24%:</span><span>${fmt(prep * VAT)}</span></div><div class="pt"><span>Με ΦΠΑ:</span><span>${fmt(gross!)}</span></div></div>` : ""}
<div class="footer">HiTech Doctor | info@hitechdoctor.com | 698 188 2005 | hitechdoctor.com</div>
</body></html>`;
  const w = window.open("", "_blank", "width=820,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

export default function AdminWebsiteInquiries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingInq, setEditingInq] = useState<WebsiteInquiry | null>(null);
  const [sendingEmail, setSendingEmail] = useState<number | null>(null);

  const { data: inquiries = [], isLoading } = useQuery<WebsiteInquiry[]>({
    queryKey: ["/api/website-inquiries"],
  });

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { firstName: "", lastName: "", phone: "", email: "", notes: "", prepayment: "", status: "pending" },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, any>) =>
      apiRequest("PATCH", `/api/website-inquiries/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-inquiries"] });
      setEditingInq(null);
      toast({ title: "Αποθηκεύτηκε" });
    },
    onError: () => toast({ title: "Σφάλμα", variant: "destructive" }),
  });

  function openEdit(inq: WebsiteInquiry) {
    setEditingInq(inq);
    form.reset({
      firstName: inq.firstName,
      lastName: inq.lastName,
      phone: inq.phone,
      email: inq.email,
      notes: inq.notes || "",
      prepayment: inq.prepayment ? inq.prepayment.toString() : "",
      status: inq.status,
    });
  }

  async function handleSendEmail(inq: WebsiteInquiry) {
    setSendingEmail(inq.id);
    try {
      await apiRequest("PATCH", `/api/website-inquiries/${inq.id}`, { sendClientEmail: true });
      toast({ title: "Email εστάλη", description: `Ειδοποίηση στάλθηκε στο ${inq.email}` });
    } catch {
      toast({ title: "Σφάλμα email", variant: "destructive" });
    } finally {
      setSendingEmail(null);
    }
  }

  function onSubmitEdit(values: EditValues) {
    if (!editingInq) return;
    updateMutation.mutate({ id: editingInq.id, ...values, prepayment: values.prepayment || null });
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-foreground">Αιτήματα Ιστοσελίδων</h1>
              <p className="text-sm text-muted-foreground">Επεξεργασία, Email πελάτη, Εκτύπωση παραστατικού</p>
            </div>
          </div>
          <Button
            variant="outline" size="sm" className="gap-2 border-white/15 hover:border-primary/40"
            disabled={inquiries.length === 0}
            onClick={() => {
              const rows = inquiries.map((inq: WebsiteInquiry) => ({
                "ID": inq.id, "Επώνυμο": inq.lastName, "Όνομα": inq.firstName,
                "Τηλέφωνο": inq.phone, "Email": inq.email,
                "Προκαταβολή (καθαρό €)": inq.prepayment ? Number(inq.prepayment).toFixed(2) : "",
                "Προκαταβολή (με ΦΠΑ €)": inq.prepayment ? (Number(inq.prepayment) * 1.24).toFixed(2) : "",
                "Κατάσταση": STATUS_OPTIONS.find(o => o.value === inq.status)?.label ?? inq.status,
                "Ημερομηνία": formatDateEl(inq.createdAt),
              }));
              exportToCsv(`aitimata_istoselidas_${new Date().toISOString().slice(0,10)}.csv`, rows);
            }}
            data-testid="button-export-inquiries"
          >
            <Download className="w-4 h-4" />Εξαγωγή CSV
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Φόρτωση...</div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Δεν υπάρχουν αιτήματα ακόμα.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => {
              const prep = inq.prepayment ? parseFloat(inq.prepayment) : null;
              const gross = prep !== null ? prep * (1 + VAT) : null;
              return (
                <Fragment key={inq.id}>
                  <div className="rounded-2xl border border-white/8 bg-card/40 p-5 hover:border-white/15 transition-colors" data-testid={`card-inquiry-${inq.id}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Globe className="w-4.5 h-4.5 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold text-foreground">{inq.firstName} {inq.lastName}</span>
                            <StatusBadge status={inq.status} />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(inq.createdAt!).toLocaleDateString("el-GR", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inq.phone}</span>
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inq.email}</span>
                          </div>
                          {inq.notes && <p className="text-xs text-muted-foreground mt-2 italic max-w-md">{inq.notes}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {prep !== null && (
                          <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-right">
                            <p className="text-[9px] text-amber-400/60 uppercase tracking-widest font-bold mb-0.5">Προκαταβολή</p>
                            <p className="text-xs text-muted-foreground">Καθαρό: {fmt(prep)}</p>
                            <p className="text-sm font-extrabold text-amber-400">Με ΦΠΑ: {fmt(gross!)}</p>
                          </div>
                        )}
                        <Select value={inq.status} onValueChange={(v) => updateMutation.mutate({ id: inq.id, status: v })}>
                          <SelectTrigger className="w-32 h-9 text-xs" data-testid={`select-inquiry-status-${inq.id}`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="gap-1 border-white/10 hover:border-sky-400/40 hover:text-sky-400 text-xs h-9" onClick={() => openEdit(inq)} data-testid={`button-edit-inquiry-${inq.id}`}>
                          <Pencil className="w-3 h-3" />Edit
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 border-white/10 hover:border-emerald-400/40 hover:text-emerald-400 text-xs h-9" onClick={() => handleSendEmail(inq)} disabled={sendingEmail === inq.id} data-testid={`button-email-inquiry-${inq.id}`}>
                          <Send className="w-3 h-3" />{sendingEmail === inq.id ? "..." : "Email"}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1 border-white/10 hover:border-primary/40 hover:text-primary text-xs h-9" onClick={() => printInquiry(inq)} data-testid={`button-print-inquiry-${inq.id}`}>
                          <Printer className="w-3 h-3" />Εκτύπωση
                        </Button>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!editingInq} onOpenChange={(o) => !o && setEditingInq(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Επεξεργασία Αιτήματος</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>Όνομα</FormLabel><FormControl><Input {...field} data-testid="input-edit-inq-firstname" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Επώνυμο</FormLabel><FormControl><Input {...field} data-testid="input-edit-inq-lastname" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Τηλέφωνο</FormLabel><FormControl><Input {...field} type="tel" data-testid="input-edit-inq-phone" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" data-testid="input-edit-inq-email" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Σημειώσεις</FormLabel><FormControl><Textarea {...field} rows={3} className="resize-none" data-testid="textarea-edit-inq-notes" /></FormControl></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="prepayment" render={({ field }) => (
                  <FormItem><FormLabel>Προκαταβολή (€ καθαρό)</FormLabel><FormControl><Input {...field} type="number" min="0" step="0.01" placeholder="0.00" data-testid="input-edit-inq-prepayment" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem><FormLabel>Κατάσταση</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-edit-inq-status"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>
              <Button type="submit" disabled={updateMutation.isPending} className="w-full" data-testid="button-save-inq-edit">Αποθήκευση</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
