import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useCustomers } from "@/hooks/use-customers";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package, ShoppingCart, Users, Euro, Wrench,
  Clock, CheckCircle2, XCircle, AlertCircle, Hash, Smartphone, Phone, Mail,
  Lock,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { type RepairRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// ── Status config ────────────────────────────────────────────────────────────
const STATUSES = [
  { value: "pending", label: "Νέο", icon: AlertCircle, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
  { value: "in-progress", label: "Σε Εξέλιξη", icon: Clock, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  { value: "completed", label: "Ολοκληρώθηκε", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10 border-green-400/30" },
  { value: "cancelled", label: "Ακυρώθηκε", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/30" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUSES.find((s) => s.value === status) ?? STATUSES[0];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function formatDate(dateStr: string | Date | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(dateStr));
}

// ── Repair Requests Table ────────────────────────────────────────────────────
function RepairRequestsTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        <span className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin mr-3" />
        Φόρτωση αιτημάτων...
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Wrench className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Κανένα αίτημα ακόμη</p>
        <p className="text-xs text-muted-foreground">Τα αιτήματα επισκευής θα εμφανιστούν εδώ.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 text-left">
            <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Πελάτης</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Επικοινωνία</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Συσκευή</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Serial / Κωδικός</th>
            <th className="pb-3 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ημερομηνία</th>
            <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Κατάσταση</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-white/3 transition-colors" data-testid={`row-repair-${req.id}`}>
              {/* ID */}
              <td className="py-4 pr-4">
                <span className="text-xs font-mono text-muted-foreground">#{req.id}</span>
              </td>

              {/* Πελάτης */}
              <td className="py-4 pr-4">
                <p className="font-semibold text-foreground text-sm">{req.firstName} {req.lastName}</p>
              </td>

              {/* Επικοινωνία */}
              <td className="py-4 pr-4">
                <div className="flex flex-col gap-0.5">
                  <a href={`tel:${req.phone}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Phone className="w-3 h-3 text-primary shrink-0" />
                    {req.phone}
                  </a>
                  <a href={`mailto:${req.email}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Mail className="w-3 h-3 text-primary shrink-0" />
                    {req.email}
                  </a>
                </div>
              </td>

              {/* Συσκευή */}
              <td className="py-4 pr-4">
                <div className="flex items-start gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{req.deviceName}</p>
                    {req.notes && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 max-w-[160px] truncate" title={req.notes}>
                        {req.notes}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              {/* Serial / Κωδικός */}
              <td className="py-4 pr-4">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Hash className="w-3 h-3 text-primary shrink-0" />
                    <span className="text-xs font-mono text-foreground">{req.serialNumber}</span>
                  </div>
                  {req.deviceCode && (
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-xs font-mono text-muted-foreground">{req.deviceCode}</span>
                    </div>
                  )}
                </div>
              </td>

              {/* Ημερομηνία */}
              <td className="py-4 pr-4">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(req.createdAt)}
                </span>
              </td>

              {/* Κατάσταση */}
              <td className="py-4">
                <Select
                  value={req.status}
                  onValueChange={(val) => statusMutation.mutate({ id: req.id, status: val })}
                >
                  <SelectTrigger
                    className="h-8 text-xs w-40 border-white/10 bg-card"
                    data-testid={`select-status-${req.id}`}
                  >
                    <SelectValue>
                      <StatusBadge status={req.status} />
                    </SelectValue>
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
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: orders } = useOrders();
  const { data: products } = useProducts();
  const { data: customers } = useCustomers();
  const { data: repairRequests } = useQuery<RepairRequest[]>({
    queryKey: ["/api/repair-requests"],
  });

  const totalRevenue = orders?.reduce((sum, order) => {
    if (order.status !== "cancelled") return sum + Number(order.totalAmount);
    return sum;
  }, 0) || 0;

  const pendingRepairs = repairRequests?.filter((r) => r.status === "pending").length ?? 0;
  const inProgressRepairs = repairRequests?.filter((r) => r.status === "in-progress").length ?? 0;

  const stats = [
    {
      title: "Συνολικά Έσοδα",
      value: new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(totalRevenue),
      icon: Euro,
      color: "text-green-400",
    },
    {
      title: "Παραγγελίες",
      value: orders?.length ?? 0,
      icon: ShoppingCart,
      color: "text-blue-400",
    },
    {
      title: "Προϊόντα",
      value: products?.length ?? 0,
      icon: Package,
      color: "text-purple-400",
    },
    {
      title: "Πελάτες",
      value: customers?.length ?? 0,
      icon: Users,
      color: "text-orange-400",
    },
    {
      title: "Αιτήματα Επισκευής",
      value: repairRequests?.length ?? 0,
      icon: Wrench,
      color: "text-primary",
      subtext: pendingRepairs > 0 ? `${pendingRepairs} νέα` : inProgressRepairs > 0 ? `${inProgressRepairs} σε εξέλιξη` : undefined,
    },
  ];

  return (
    <AdminLayout>
      <Seo title="Dashboard" description="Admin Dashboard" />

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Επισκόπηση</h1>
        <p className="text-muted-foreground mt-1">Στατιστικά, αιτήματα επισκευής και δεδομένα καταστήματος</p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-white/5 tech-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtext && (
                <p className="text-xs text-yellow-400 mt-0.5 font-medium">{stat.subtext}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Repair Requests CRM ── */}
      <Card className="bg-card border-white/8">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Wrench className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-display font-bold">Αιτήματα Επισκευής</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {repairRequests?.length ?? 0} συνολικά
                {pendingRepairs > 0 && (
                  <span className="ml-2 text-yellow-400 font-semibold">· {pendingRepairs} νέα</span>
                )}
              </p>
            </div>
          </div>
          {/* Status legend */}
          <div className="hidden lg:flex items-center gap-2">
            {STATUSES.map((s) => (
              <StatusBadge key={s.value} status={s.value} />
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <RepairRequestsTable />
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
