import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wrench, AlertCircle, Clock, CheckCircle2, XCircle,
  Search, X, Phone, Mail, Smartphone, Hash, Lock,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type RepairRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";

// ── Status config ────────────────────────────────────────────────────────────
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

// ── Search Input ─────────────────────────────────────────────────────────────
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
    { label: "Σύνολο",         value: requests?.length ?? 0, icon: Wrench,     color: "text-primary",    bg: "bg-primary/10 border-primary/20"          },
    { label: "Νέα",            value: byStatus("pending"),   icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20"    },
    { label: "Σε Εξέλιξη",    value: byStatus("in-progress"),icon: Clock,      color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20"        },
    { label: "Ολοκληρωμένα",  value: byStatus("completed"),  icon: CheckCircle2,color: "text-green-400", bg: "bg-green-400/10 border-green-400/20"      },
    { label: "Ακυρωμένα",     value: byStatus("cancelled"),  icon: XCircle,    color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20"          },
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
                    {["#", "Πελάτης", "Επικοινωνία", "Συσκευή", "Serial / Κωδικός", "Ημερομηνία", "Κατάσταση"].map((h) => (
                      <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{h}</th>
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
