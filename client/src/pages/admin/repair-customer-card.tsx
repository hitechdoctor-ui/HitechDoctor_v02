import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft, User, Phone, Mail, Smartphone, Hash, Lock, Clock, Wrench,
} from "lucide-react";
import { type RepairRequest } from "@shared/schema";
import { apiRequest, invalidateRepairFinancialQueries } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import {
  RepairDetailPanel,
  RepairStatusBadge,
  RepairIdBadge,
  REPAIR_STATUSES,
} from "@/components/admin/repair-detail-panel";
import {
  customerRepairGroupKey,
  decodeCustomerKey,
  pickCurrentRepair,
} from "@/lib/repair-customer-groups";

type MeResponse = { ok?: boolean; role?: string; id?: number; superAdmin?: boolean };
type AdminUserRow = { id: number; name: string; email: string; role: string };

function formatDate(d: string | Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function createdAtMs(r: RepairRequest): number {
  return r.createdAt ? new Date(r.createdAt).getTime() : 0;
}

export default function AdminRepairCustomerCard() {
  const params = useParams<{ key: string }>();
  const key = decodeCustomerKey(params.key ?? "");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: me } = useQuery<MeResponse>({ queryKey: ["/api/admin/me"] });
  const isStaff = me?.role === "staff";

  const { data: assignUsers = [] } = useQuery<AdminUserRow[]>({
    queryKey: ["/api/admin/users"],
    enabled: !isStaff && me?.superAdmin === true,
  });

  const { data: requests, isLoading } = useQuery<RepairRequest[]>({
    queryKey: ["/api/admin/repair-requests"],
  });

  const customerRequests = useMemo(() => {
    if (!requests || !key) return [];
    return requests
      .filter((r) => customerRepairGroupKey(r) === key)
      .sort((a, b) => createdAtMs(b) - createdAtMs(a));
  }, [requests, key]);

  const current = useMemo(() => pickCurrentRepair(customerRequests), [customerRequests]);
  const history = useMemo(
    () => customerRequests.filter((r) => r.id !== current?.id),
    [customerRequests, current?.id],
  );

  const profile = current ?? customerRequests[0];

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

  const assignMutation = useMutation({
    mutationFn: ({ id, assignedToUserId }: { id: number; assignedToUserId: number | null }) =>
      apiRequest("PATCH", `/api/repair-requests/${id}`, { assignedToUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/repair-requests"] });
      toast({ title: "Αποθηκεύτηκε", description: "Η ανάθεση ενημερώθηκε." });
    },
    onError: () => toast({ title: "Σφάλμα", description: "Αδυναμία αποθήκευσης.", variant: "destructive" }),
  });

  return (
    <AdminLayout>
      <Seo
        title={profile ? `${profile.firstName} ${profile.lastName} — Επισκευές` : "Καρτέλα πελάτη"}
        description="Ιστορικό επισκευών πελάτη"
      />

      <div className="mb-6">
        <Link
          href="/admin/repair-requests"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Πίσω στη λίστα πελατών
        </Link>

        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-muted-foreground py-8">
            <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
            Φόρτωση καρτέλας...
          </div>
        ) : !profile ? (
          <Card className="bg-card border-white/8">
            <CardContent className="py-12 text-center">
              <p className="text-sm font-semibold text-foreground mb-1">Δεν βρέθηκε πελάτης</p>
              <p className="text-xs text-muted-foreground">Το κλειδί καρτέλας δεν αντιστοιχεί σε αιτήματα.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h1>
                {current?.createdAt ? (
                  <p className="mt-1.5 text-sm sm:text-base font-semibold text-foreground/90 inline-flex items-center gap-1.5 tabular-nums">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    {formatDate(current.createdAt)}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Phone className="w-3.5 h-3.5 text-primary" />{profile.phone}
                    </a>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Mail className="w-3.5 h-3.5 text-primary" />{profile.email}
                    </a>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {customerRequests.length} {customerRequests.length === 1 ? "αίτημα" : "αιτήματα"} συνολικά
                </p>
              </div>
            </div>

            {current && (
              <section className="mb-8" data-testid="section-current-repair">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-display font-bold uppercase tracking-wider text-primary">
                    {current.status === "pending" || current.status === "in-progress"
                      ? "Τρέχον / νέο αίτημα"
                      : "Πιο πρόσφατο αίτημα"}
                  </h2>
                </div>
                <Card className="bg-card border-primary/30 shadow-[0_0_24px_rgba(0,210,200,0.08)] overflow-hidden">
                  <CardHeader className="border-b border-white/8 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <RepairIdBadge id={current.id} status={current.status} />
                          <RepairStatusBadge status={current.status} />
                        </div>
                        <CardTitle className="text-lg font-display flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-primary shrink-0" />
                          {current.deviceName || "Χωρίς όνομα συσκευής"}
                        </CardTitle>
                        {current.notes && (
                          <p className="text-sm text-muted-foreground leading-relaxed flex items-start gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" aria-hidden />
                            <span>{current.notes}</span>
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {current.serialNumber && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Hash className="w-3 h-3 text-primary" />{current.serialNumber}
                            </span>
                          )}
                          {current.deviceCode && (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Lock className="w-3 h-3 text-primary" />{current.deviceCode}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0 min-w-[160px]">
                        <Select
                          value={current.status}
                          onValueChange={(val) => statusMutation.mutate({ id: current.id, status: val })}
                        >
                          <SelectTrigger className="h-9 text-xs border-white/10 bg-background" data-testid={`select-status-${current.id}`}>
                            <SelectValue><RepairStatusBadge status={current.status} /></SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-background border-white/10">
                            {REPAIR_STATUSES.map((s) => (
                              <SelectItem key={s.value} value={s.value} className="text-xs">
                                <RepairStatusBadge status={s.value} />
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!isStaff && (
                          <Select
                            value={current.assignedToUserId != null ? String(current.assignedToUserId) : "none"}
                            onValueChange={(v) =>
                              assignMutation.mutate({
                                id: current.id,
                                assignedToUserId: v === "none" ? null : parseInt(v, 10),
                              })
                            }
                            disabled={assignMutation.isPending}
                          >
                            <SelectTrigger className="h-9 text-xs border-white/10 bg-background" data-testid={`select-assign-${current.id}`}>
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5">
                    <RepairDetailPanel req={current} />
                  </CardContent>
                </Card>
              </section>
            )}

            <section data-testid="section-repair-history">
              <h2 className="text-sm font-display font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Ιστορικό επισκευών
              </h2>
              {history.length === 0 ? (
                <Card className="bg-card border-white/8">
                  <CardContent className="py-8 text-center text-xs text-muted-foreground">
                    Δεν υπάρχουν προηγούμενες επισκευές για αυτόν τον πελάτη.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {history.map((req) => (
                    <Card key={req.id} className="bg-card border-white/8 overflow-hidden" data-testid={`history-repair-${req.id}`}>
                      <CardHeader className="border-b border-white/8 pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <RepairIdBadge id={req.id} status={req.status} />
                              <RepairStatusBadge status={req.status} />
                              <span className="text-xs text-muted-foreground">{formatDate(req.createdAt)}</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                              {req.deviceName || "Χωρίς όνομα συσκευής"}
                            </p>
                            {req.notes && (
                              <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1.5">
                                <Wrench className="w-3 h-3 text-primary shrink-0 mt-0.5" aria-hidden />
                                <span>{req.notes}</span>
                              </p>
                            )}
                          </div>
                          <Select
                            value={req.status}
                            onValueChange={(val) => statusMutation.mutate({ id: req.id, status: val })}
                          >
                            <SelectTrigger className="h-8 text-xs w-40 border-white/10 bg-background" data-testid={`select-status-${req.id}`}>
                              <SelectValue><RepairStatusBadge status={req.status} /></SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-background border-white/10">
                              {REPAIR_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value} className="text-xs">
                                  <RepairStatusBadge status={s.value} />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <RepairDetailPanel req={req} />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
