import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wrench, AlertCircle, Clock, CheckCircle2, XCircle,
  Search, X, Phone, Mail, Smartphone, Download, ChevronRight, User,
} from "lucide-react";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import { type RepairRequest } from "@shared/schema";
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { RepairStatusBadge, REPAIR_STATUSES } from "@/components/admin/repair-detail-panel";
import {
  customerCardPath,
  groupRepairRequestsByCustomer,
  type CustomerRepairGroup,
} from "@/lib/repair-customer-groups";

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
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        data-testid="input-repair-search"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="shrink-0" aria-label="Καθαρισμός αναζήτησης">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground transition-colors" aria-hidden />
        </button>
      )}
    </div>
  );
}

type MeResponse = { ok?: boolean; role?: string; id?: number; superAdmin?: boolean };

export default function AdminRepairRequests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: me } = useQuery<MeResponse>({
    queryKey: ["/api/admin/me"],
  });
  const isStaff = me?.role === "staff";

  const { data: requests, isLoading } = useQuery<RepairRequest[]>({
    queryKey: ["/api/admin/repair-requests"],
  });

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

  const customerGroups = useMemo(
    () => groupRepairRequestsByCustomer(filtered),
    [filtered],
  );

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
          <p className="text-muted-foreground mt-1">Καρτέλες πελατών με ιστορικό και νέα αιτήματα</p>
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
              "Κατάσταση": REPAIR_STATUSES.find(s => s.value === r.status)?.label ?? r.status,
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

      <Card className="bg-card border-white/8">
        <CardHeader className="flex flex-col gap-3 pb-4 border-b border-white/8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
                <User className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold">Πελάτες</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {customerGroups.length} πελάτες · {filtered.length} αιτήματα
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
                {REPAIR_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    <RepairStatusBadge status={s.value} />
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
          ) : customerGroups.length === 0 ? (
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
            <ul className="divide-y divide-white/5">
              {customerGroups.map((group) => (
                <CustomerRow key={group.key} group={group} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

function CustomerRow({ group }: { group: CustomerRepairGroup }) {
  const href = customerCardPath(group.key);
  const latest = group.latest;

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-4 px-4 py-4 hover:bg-white/3 transition-colors group"
        data-testid={`row-customer-${group.key}`}
      >
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-foreground truncate">
              {group.firstName} {group.lastName}
            </p>
            {group.pendingCount > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                {group.pendingCount} νέα
              </span>
            )}
            {group.openCount > 0 && group.pendingCount === 0 && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-400/10 border border-blue-400/30 text-blue-400">
                σε εξέλιξη
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {group.requests.length} {group.requests.length === 1 ? "αίτημα" : "αιτήματα"}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {group.phone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3 h-3 text-primary" />{group.phone}
              </span>
            )}
            {group.email && (
              <span className="inline-flex items-center gap-1 truncate max-w-[220px]">
                <Mail className="w-3 h-3 text-primary" />{group.email}
              </span>
            )}
            {latest.deviceName && (
              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                <Smartphone className="w-3 h-3 text-primary" />{latest.deviceName}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <RepairStatusBadge status={latest.status} />
            <span className="text-[10px] text-muted-foreground">{formatDate(latest.createdAt)}</span>
            <span className="text-[10px] font-mono text-muted-foreground/70">#{latest.id}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-primary opacity-70 group-hover:opacity-100 transition-opacity">
          <span className="text-xs font-semibold hidden sm:inline">Άνοιγμα καρτέλας</span>
          <ChevronRight className="w-5 h-5" />
        </div>
      </Link>
    </li>
  );
}
