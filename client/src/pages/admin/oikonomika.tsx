import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders } from "@/hooks/use-orders";
import { QUERY_FINANCIAL_REPAIR_REVENUE } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Euro, ShoppingCart, TrendingUp, CheckCircle2, Clock, XCircle, BarChart3, CalendarDays, Calendar, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type RepairRevenueRow = {
  id: number;
  createdAt: string;
  total: number;
  customerName: string;
  email: string;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);

function StatCard({
  title, value, sub, icon: Icon, color, accent,
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; color: string; accent: string;
}) {
  return (
    <Card className={`bg-card border-white/5 hover:border-white/10 transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, "-")}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-foreground w-20 text-right shrink-0">{fmt(value)}</span>
    </div>
  );
}

export default function AdminOikonomika() {
  const { data: orders } = useOrders();
  const { data: repairRevenue = [] } = useQuery<RepairRevenueRow[]>({
    queryKey: QUERY_FINANCIAL_REPAIR_REVENUE,
    queryFn: () =>
      fetch("/api/financial/repair-revenue", { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed to fetch repair revenue");
        return r.json();
      }),
  });

  const stats = useMemo(() => {
    const orderList = orders ?? [];
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);

    /** Έσοδα eShop: μόνο ολοκληρωμένες παραγγελίες (αναγνώριση όταν ολοκληρώνεται η παραγγελία). */
    const completedOrders = orderList.filter((o) => o.status === "completed");

    const calcOrders = (from: Date) =>
      completedOrders
        .filter((o) => new Date(o.createdAt) >= from)
        .reduce((s, o) => s + Number(o.totalAmount), 0);

    const calcRepairs = (from: Date) =>
      repairRevenue
        .filter((r) => new Date(r.createdAt) >= from)
        .reduce((s, r) => s + r.total, 0);

    const calc = (from: Date) => calcOrders(from) + calcRepairs(from);

    const todayRev = calc(todayStart);
    const weekRev = calc(weekStart);
    const monthRev = calc(monthStart);
    const yearRev = calc(yearStart);
    const allOrderRev = completedOrders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const allRepairRev = repairRevenue.reduce((s, r) => s + r.total, 0);
    const allRev = allOrderRev + allRepairRev;

    const byStatus = {
      completed: orderList.filter((o) => o.status === "completed").reduce((s, o) => s + Number(o.totalAmount), 0),
      pending: orderList.filter((o) => o.status === "pending").reduce((s, o) => s + Number(o.totalAmount), 0),
      cancelled: orderList.filter((o) => o.status === "cancelled").reduce((s, o) => s + Number(o.totalAmount), 0),
    };

    const countByStatus = {
      completed: orderList.filter((o) => o.status === "completed").length,
      pending: orderList.filter((o) => o.status === "pending").length,
      cancelled: orderList.filter((o) => o.status === "cancelled").length,
    };

    const monthlyMap: Record<string, number> = {};
    completedOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(o.totalAmount);
    });
    repairRevenue.forEach((r) => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + r.total;
    });

    const monthlyData: { label: string; key: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const greekMonths = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαϊ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];
      monthlyData.push({ key, label: `${greekMonths[d.getMonth()]} ${d.getFullYear()}`, revenue: monthlyMap[key] || 0 });
    }

    const maxMonthly = Math.max(...monthlyData.map((m) => m.revenue), 1);

    return {
      todayRev,
      weekRev,
      monthRev,
      yearRev,
      allRev,
      allOrderRev,
      allRepairRev,
      byStatus,
      countByStatus,
      monthlyData,
      maxMonthly,
      repairCompletedCount: repairRevenue.length,
    };
  }, [orders, repairRevenue]);

  const combinedTransactions = useMemo(() => {
    const orderList = orders ?? [];
    const fromOrders = orderList.map((o) => ({
      kind: "order" as const,
      id: o.id,
      customerName: o.customerName,
      email: o.customerEmail,
      createdAt: o.createdAt,
      status: o.status,
      amount: Number(o.totalAmount),
    }));
    const fromRepairs = repairRevenue.map((r) => ({
      kind: "repair" as const,
      id: r.id,
      customerName: r.customerName,
      email: r.email,
      createdAt: r.createdAt,
      status: "completed" as const,
      amount: r.total,
    }));
    return [...fromOrders, ...fromRepairs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [orders, repairRevenue]);

  const topCards = [
    {
      title: "Έσοδα Σήμερα",
      value: fmt(stats?.todayRev ?? 0),
      sub: new Intl.DateTimeFormat("el-GR", { day: "2-digit", month: "long", year: "numeric" }).format(new Date()),
      icon: CalendarDays,
      color: "text-primary",
      accent: "bg-primary/10",
    },
    {
      title: "Έσοδα Εβδομάδας",
      value: fmt(stats?.weekRev ?? 0),
      sub: "Τρέχουσα εβδομάδα",
      icon: TrendingUp,
      color: "text-blue-400",
      accent: "bg-blue-400/10",
    },
    {
      title: "Έσοδα Μήνα",
      value: fmt(stats?.monthRev ?? 0),
      sub: new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric" }).format(new Date()),
      icon: Calendar,
      color: "text-purple-400",
      accent: "bg-purple-400/10",
    },
    {
      title: "Έσοδα Έτους",
      value: fmt(stats?.yearRev ?? 0),
      sub: String(new Date().getFullYear()),
      icon: BarChart3,
      color: "text-orange-400",
      accent: "bg-orange-400/10",
    },
    {
      title: "Συνολικά Έσοδα",
      value: fmt(stats?.allRev ?? 0),
      sub: "Από την έναρξη",
      icon: Euro,
      color: "text-green-400",
      accent: "bg-green-400/10",
    },
  ];

  return (
    <AdminLayout>
      <Seo title="Οικονομικά" description="Οικονομική επισκόπηση HiTech Doctor" />

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Οικονομικά</h1>
        <p className="text-muted-foreground mt-1">Έσοδα, παραγγελίες και οικονομική επισκόπηση</p>
        <p className="text-xs text-muted-foreground/90 mt-2 max-w-3xl">
          Τα ποσά στα κυρίως στατιστικά ενημερώνονται όταν μια παραγγελία eShop ή ένα αίτημα επισκευής είναι σε κατάσταση <strong className="text-foreground/90">Ολοκληρώθηκε</strong>·
          περιλαμβάνουν eShop και επισκευές.
        </p>
      </div>

      {/* ── Revenue Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {topCards.map((c) => (
          <StatCard key={c.title} {...c} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── Monthly Revenue Trend ── */}
        <Card className="bg-card border-white/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Έσοδα τελευταίων 6 μηνών
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.monthlyData.map((m) => (
              <MiniBar
                key={m.key}
                label={m.label}
                value={m.revenue}
                max={stats.maxMonthly}
                color="bg-primary"
              />
            ))}
          </CardContent>
        </Card>

        {/* ── Orders Breakdown ── */}
        <Card className="bg-card border-white/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="w-4 h-4 text-primary" />
              Κατανομή Παραγγελιών
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <div className="flex items-center justify-between p-3 rounded-xl bg-green-400/5 border border-green-400/15">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <div>
                  <div className="text-sm font-semibold">Ολοκληρωμένες</div>
                  <div className="text-xs text-muted-foreground">{stats?.countByStatus.completed ?? 0} παραγγελίες</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">{fmt(stats?.byStatus.completed ?? 0)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-400/5 border border-yellow-400/15">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-yellow-400" />
                <div>
                  <div className="text-sm font-semibold">Σε Αναμονή</div>
                  <div className="text-xs text-muted-foreground">{stats?.countByStatus.pending ?? 0} παραγγελίες</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">{fmt(stats?.byStatus.pending ?? 0)}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-red-400/5 border border-red-400/15">
              <div className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-sm font-semibold">Ακυρωμένες</div>
                  <div className="text-xs text-muted-foreground">{stats?.countByStatus.cancelled ?? 0} παραγγελίες</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-red-400">{fmt(stats?.byStatus.cancelled ?? 0)}</div>
                <div className="text-xs text-muted-foreground">δεν υπολογίζονται</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-400/5 border border-cyan-400/15">
              <div className="flex items-center gap-3">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-sm font-semibold">Επισκευές (ολοκληρωμένες)</div>
                  <div className="text-xs text-muted-foreground">{stats?.repairCompletedCount ?? 0} αιτήματα</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-cyan-400">{fmt(stats?.allRepairRev ?? 0)}</div>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Σύνολο (eShop ολοκλ. + επισκευές)</span>
              <span className="text-base font-bold text-primary">{fmt(stats?.allRev ?? 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── All Orders Table ── */}
      <Card className="bg-card border-white/5">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
            <Euro className="w-4 h-4 text-primary" />
            Αναλυτικές Συναλλαγές (eShop + επισκευές)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">#</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Τύπος</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Πελάτης</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Ημερομηνία</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground">Κατάσταση</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground">Ποσό</th>
                </tr>
              </thead>
              <tbody>
                {combinedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted-foreground py-12 text-sm">
                      Δεν υπάρχουν συναλλαγές ακόμα
                    </td>
                  </tr>
                ) : (
                  combinedTransactions.map((row) => {
                    const statusCfg: Record<string, { label: string; color: string }> = {
                      pending:    { label: "Σε Αναμονή",     color: "text-yellow-400" },
                      completed:  { label: "Ολοκληρώθηκε",  color: "text-green-400" },
                      cancelled:  { label: "Ακυρώθηκε",     color: "text-red-400" },
                      "in-progress": { label: "Σε Εξέλιξη", color: "text-blue-400" },
                    };
                    const s =
                      row.kind === "repair"
                        ? { label: "Ολοκληρώθηκε", color: "text-green-400" }
                        : statusCfg[row.status] ?? { label: row.status, color: "text-muted-foreground" };
                    const cancelled = row.kind === "order" && row.status === "cancelled";
                    return (
                      <tr
                        key={row.kind === "order" ? `o-${row.id}` : `r-${row.id}`}
                        className="border-b border-white/4 hover:bg-white/2 transition-colors"
                        data-testid={row.kind === "order" ? `row-order-${row.id}` : `row-repair-rev-${row.id}`}
                      >
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {row.kind === "order" ? `#${row.id}` : `ΕΠ-${row.id}`}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                          {row.kind === "order" ? "eShop" : "Επισκευή"}
                        </td>
                        <td className="px-6 py-4 font-medium">{row.customerName}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">{row.email}</td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Intl.DateTimeFormat("el-GR", {
                            day: "2-digit", month: "2-digit", year: "numeric",
                          }).format(new Date(row.createdAt))}
                        </td>
                        <td className={`px-6 py-4 text-xs font-semibold ${s.color}`}>{s.label}</td>
                        <td className={`px-6 py-4 text-right font-bold ${cancelled ? "text-red-400 line-through opacity-50" : "text-foreground"}`}>
                          {fmt(row.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
