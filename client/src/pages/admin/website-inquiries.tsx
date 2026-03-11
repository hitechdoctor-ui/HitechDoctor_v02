import { Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Globe, Mail, Phone, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import type { WebsiteInquiry } from "@shared/schema";

const VAT = 0.24;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

const STATUS_OPTIONS = [
  { value: "pending",   label: "Αναμένει",   color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  { value: "contacted", label: "Επικοινωνία", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { value: "won",       label: "Κλείστηκε",  color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "lost",      label: "Χάθηκε",     color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_OPTIONS.find(o => o.value === status) || STATUS_OPTIONS[0];
  return <Badge className={`${s.color} text-[10px] font-bold`}>{s.label}</Badge>;
}

export default function AdminWebsiteInquiries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery<WebsiteInquiry[]>({
    queryKey: ["/api/website-inquiries"],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest("PATCH", `/api/website-inquiries/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-inquiries"] });
    },
    onError: () => toast({ title: "Σφάλμα", variant: "destructive" }),
  });

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
              <p className="text-sm text-muted-foreground">Φόρμες επικοινωνίας από τη σελίδα Web Designer</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-white/15 hover:border-primary/40"
            disabled={!inquiries || inquiries.length === 0}
            onClick={() => {
              const rows = inquiries.map((inq: WebsiteInquiry) => ({
                "ID": inq.id,
                "Επώνυμο": inq.lastName,
                "Όνομα": inq.firstName,
                "Τηλέφωνο": inq.phone,
                "Email": inq.email,
                "Προκαταβολή (καθαρό €)": inq.prepayment ? Number(inq.prepayment).toFixed(2) : "",
                "Προκαταβολή (με ΦΠΑ €)": inq.prepayment ? (Number(inq.prepayment) * 1.24).toFixed(2) : "",
                "Κατάσταση": STATUS_OPTIONS.find(o => o.value === inq.status)?.label ?? inq.status,
                "Ημερομηνία": formatDateEl(inq.createdAt),
              }));
              exportToCsv(`aitimata_istoselidas_${new Date().toISOString().slice(0,10)}.csv`, rows);
            }}
            data-testid="button-export-inquiries"
          >
            <Download className="w-4 h-4" />
            Εξαγωγή CSV
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
                          {inq.notes && (
                            <p className="text-xs text-muted-foreground mt-2 italic max-w-md">{inq.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {prep !== null && (
                          <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-right">
                            <p className="text-[9px] text-amber-400/60 uppercase tracking-widest font-bold mb-0.5">Προκαταβολή</p>
                            <p className="text-xs text-muted-foreground">Καθαρό: {fmt(prep)}</p>
                            <p className="text-sm font-extrabold text-amber-400">Με ΦΠΑ: {fmt(gross!)}</p>
                          </div>
                        )}
                        <Select
                          value={inq.status}
                          onValueChange={(v) => updateMutation.mutate({ id: inq.id, status: v })}
                        >
                          <SelectTrigger className="w-36 h-9 text-xs" data-testid={`select-inquiry-status-${inq.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(o => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Fragment>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
