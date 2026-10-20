import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wrench,
  MessageSquare,
  Clock,
  CheckCircle2,
  ShoppingCart,
  Euro,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  AlertTriangle,
  BarChart3,
  MessageCircle,
  Flame,
  Activity,
  Settings,
  LineChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import {
  type AdminOverviewPeriod,
  type AdminOverviewResponse,
  type AdminOverviewAction,
} from "@shared/admin-overview";
import { useMemo, useState, type ComponentType } from "react";

function formatEuro(n: number): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Intl.DateTimeFormat("el-GR", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(y, m - 1, d),
  );
}

function pctDelta(current: number, previous: number): { value: number; up: boolean } {
  if (previous === 0) return { value: current > 0 ? 100 : 0, up: current >= 0 };
  const v = Math.round(((current - previous) / previous) * 100);
  return { value: Math.abs(v), up: v >= 0 };
}

function DeltaBadge({ current, previous, label }: { current: number; previous: number; label: string }) {
  const d = pctDelta(current, previous);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
        d.up
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
          : "bg-rose-500/10 text-rose-400 border-rose-500/25"
      }`}
    >
      {d.up ? <TrendingUp className="w-3 h-3" aria-hidden /> : <TrendingDown className="w-3 h-3" aria-hidden />}
      {d.up ? "+" : "−"}
      {d.value}% {label}
    </span>
  );
}

type KpiCardProps = {
  title: string;
  value: string | number;
  subtext?: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  delta?: { current: number; previous: number; label: string };
};

function KpiCard({ title, value, subtext, href, icon: Icon, color, delta }: KpiCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent px-3.5 py-3.5 transition-all hover:border-primary/35 hover:from-primary/[0.08]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
            {title}
          </p>
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-background/40 border border-white/10 ${color}`}
          >
            <Icon className="w-4 h-4" aria-hidden />
          </div>
        </div>
        <div className="text-2xl sm:text-[1.75rem] font-extrabold tabular-nums tracking-tight text-foreground">
          {value}
        </div>
        {subtext ? <p className="text-[11px] mt-1 font-medium text-yellow-400 truncate">{subtext}</p> : null}
        {delta ? (
          <div className="mt-2">
            <DeltaBadge current={delta.current} previous={delta.previous} label={delta.label} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function actionKindStyles(kind: AdminOverviewAction["kind"]): string {
  switch (kind) {
    case "repair_pending":
      return "border-yellow-400/35 bg-yellow-400/[0.06]";
    case "repair_ready":
      return "border-emerald-400/35 bg-emerald-400/[0.06]";
    case "order_pending":
      return "border-sky-400/35 bg-sky-400/[0.06]";
    case "message_pending":
      return "border-violet-400/35 bg-violet-400/[0.06]";
    default:
      return "border-white/10 bg-white/[0.03]";
  }
}

async function fetchOverview(period: AdminOverviewPeriod): Promise<AdminOverviewResponse> {
  const res = await fetch(`/api/admin/overview?period=${period}`, {
    headers: getAdminAuthHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as AdminOverviewResponse;
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<AdminOverviewPeriod>("week");

  const overviewQ = useQuery({
    queryKey: ["admin-overview", period] as const,
    queryFn: () => fetchOverview(period),
    refetchInterval: 60_000,
  });

  const data = overviewQ.data;
  const kpi = data?.kpi;
  const chartData = useMemo(() => {
    const daily = data?.analytics?.daily ?? [];
    return daily.map((d) => ({
      ...d,
      label: formatDayLabel(d.date),
    }));
  }, [data?.analytics?.daily]);

  return (
    <AdminLayout>
      <Seo title="Επισκόπηση" description="Admin Dashboard" />

      <div className="-mt-1 mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground">
            Επισκόπηση
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            KPI · ενέργειες · analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as AdminOverviewPeriod)}>
            <SelectTrigger
              className="h-9 w-[140px] text-xs border-white/10 bg-background/40"
              aria-label="Περίοδος analytics"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10">
              <SelectItem value="day" className="text-xs">
                Σήμερα
              </SelectItem>
              <SelectItem value="week" className="text-xs">
                7 ημέρες
              </SelectItem>
              <SelectItem value="month" className="text-xs">
                30 ημέρες
              </SelectItem>
            </SelectContent>
          </Select>
          <Link
            href="/admin/settings"
            className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" aria-hidden />
            Ρυθμίσεις
          </Link>
        </div>
      </div>

      {overviewQ.isError ? (
        <div
          className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          role="alert"
        >
          Αποτυχία φόρτωσης επισκόπησης. Ανανεώστε τη σελίδα.
        </div>
      ) : null}

      {/* A. KPI */}
      <section className="mb-5" aria-label="Βασικοί δείκτες">
        {overviewQ.isLoading || !kpi ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[110px] rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            <KpiCard
              title="Νέα επισκευές"
              value={kpi.repairsToday}
              subtext={`${kpi.repairsPending} σε αναμονή`}
              href="/admin/repair-requests"
              icon={Wrench}
              color="text-yellow-400"
              delta={{ current: kpi.repairsToday, previous: kpi.repairsTodayPrev, label: "vs χθες" }}
            />
            <KpiCard
              title="Αδιάβαστα"
              value={kpi.unreadMessages}
              href="/admin/website-inquiries"
              icon={MessageSquare}
              color="text-violet-400"
              delta={{
                current: kpi.unreadMessages,
                previous: kpi.unreadMessagesPrev,
                label: "vs χθες",
              }}
            />
            <KpiCard
              title="Σε εξέλιξη"
              value={kpi.repairsInProgress}
              href="/admin/repair-requests"
              icon={Clock}
              color="text-sky-400"
            />
            <KpiCard
              title="Έτοιμες"
              value={kpi.repairsReady}
              subtext="ολοκληρωμένες"
              href="/admin/repair-requests"
              icon={CheckCircle2}
              color="text-emerald-400"
            />
            <KpiCard
              title="Παραγγελίες σήμερα"
              value={kpi.ordersToday}
              href="/admin/orders"
              icon={ShoppingCart}
              color="text-primary"
              delta={{ current: kpi.ordersToday, previous: kpi.ordersTodayPrev, label: "vs χθες" }}
            />
            {data?.canViewFinancials ? (
              <KpiCard
                title="Έσοδα μήνα"
                value={formatEuro(kpi.monthRevenue)}
                href="/admin/oikonomika"
                icon={Euro}
                color="text-amber-400"
                delta={{
                  current: kpi.monthRevenue,
                  previous: kpi.monthRevenuePrev,
                  label: "vs προηγ.",
                }}
              />
            ) : (
              <KpiCard
                title="Αναμονή"
                value={kpi.repairsPending}
                href="/admin/repair-requests"
                icon={AlertTriangle}
                color="text-yellow-400"
              />
            )}
          </div>
        )}
      </section>

      {/* B. Needs action */}
      <section className="mb-5" aria-label="Χρειάζεται ενέργεια">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent overflow-hidden">
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-3 border-b border-white/8">
            <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden />
            <h2 className="text-sm sm:text-base font-display font-bold tracking-tight">Χρειάζεται ενέργεια</h2>
          </div>
          <div className="p-3 sm:p-4">
            {overviewQ.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-xl bg-white/5" />
                ))}
              </div>
            ) : !data?.actions.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Όλα εντάξει — δεν υπάρχουν επείγοντα.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {data.actions.map((a) => (
                  <li
                    key={a.id}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${actionKindStyles(a.kind)}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{a.subtitle}</p>
                    </div>
                    <Button asChild size="sm" variant="outline" className="shrink-0 border-white/15 h-8 text-xs">
                      <Link href={a.href}>
                        {a.actionLabel}
                        <ExternalLink className="w-3 h-3 ml-1" aria-hidden />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* C + D. Analytics — μόνο όταν το API επιστρέφει analytics (super admin) */}
      {data?.analytics ? (
        <section className="mb-5 space-y-4" aria-label="Analytics">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" aria-hidden />
                Analytics
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Επισκέψεις ιστοτόπου και AI Doctor (πρώτο-πρόσωπο tracking)
              </p>
            </div>
            <Button variant="outline" size="sm" className="border-white/15 shrink-0 w-full sm:w-auto" asChild>
              <Link href="/admin/insights">Περισσότερες λεπτομέρειες</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="bg-card/80 border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide">Επισκέψεις σήμερα</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">{data.analytics.visitsToday}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <DeltaBadge
                  current={data.analytics.visitsToday}
                  previous={data.analytics.visitsYesterday}
                  label="vs χθες"
                />
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide">7 ημερών</CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums">{data.analytics.visitsWeek}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[11px] text-muted-foreground">
                Μήνας:{" "}
                <span className="text-foreground font-semibold tabular-nums">{data.analytics.visitsMonth}</span>
              </CardContent>
            </Card>
            <Card className="bg-card/80 border-white/10">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-violet-400" aria-hidden />
                  AI Doctor σήμερα
                </CardDescription>
                <CardTitle className="text-3xl font-bold tabular-nums text-violet-200">
                  {data.analytics.chatToday}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-[11px] text-muted-foreground">
                Ερωτήματα στο chat επισκευών
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/80 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" aria-hidden />
                <CardTitle className="text-base font-display">Τάση 7 ημερών</CardTitle>
              </div>
              <CardDescription className="text-xs">Επισκέψεις (teal) και μηνύματα AI (violet)</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] w-full pt-2">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Δεν υπάρχουν δεδομένα
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillVisitsOverview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(174 72% 46%)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="hsl(174 72% 46%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="fillChatOverview" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(263 70% 58%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(263 70% 58%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={36}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15, 18, 28, 0.94)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="visits"
                      name="Επισκέψεις"
                      stroke="hsl(174 72% 46%)"
                      fill="url(#fillVisitsOverview)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="chat"
                      name="AI Doctor"
                      stroke="hsl(263 70% 58%)"
                      fill="url(#fillChatOverview)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {data.analytics.topPages.length > 0 ? (
            <Card className="bg-card/80 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" aria-hidden />
                  Top σελίδες
                </CardTitle>
                <CardDescription className="text-xs">Σύμφωνα με την επιλεγμένη περίοδο</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.analytics.topPages.map((row, i) => {
                  const max = data.analytics!.topPages[0]?.count || 1;
                  const w = Math.round((row.count / max) * 100);
                  return (
                    <div key={`${row.path}-${i}`} className="space-y-1">
                      <div className="flex justify-between text-xs gap-2">
                        <span
                          className={`truncate font-medium ${i === 0 ? "text-amber-200" : "text-foreground/90"}`}
                        >
                          {i === 0 ? "" : `${i + 1}. `}
                          {row.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground shrink-0">{row.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${i === 0 ? "bg-amber-400/80" : "bg-primary/50"}`}
                          style={{ width: `${w}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : null}

          {data.ga4 ? (
            data.ga4.configured ? (
              <Card className="bg-card/80 border-white/10 border-blue-500/15">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-blue-400" aria-hidden />
                    Google Analytics 4
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ενεργοί χρήστες</p>
                    <p className="text-2xl font-bold tabular-nums text-blue-200">
                      {data.ga4.activeUsers ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Προβολές σελίδας</p>
                    <p className="text-2xl font-bold tabular-nums text-blue-200">
                      {data.ga4.screenPageViews ?? "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card/80 border-white/10 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-blue-400" aria-hidden />
                    Σύνδεση GA4
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Το Google Analytics 4 δεν είναι ακόμα ρυθμισμένο. Ολοκληρώστε τη σύνδεση από τις Ρυθμίσεις.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="bg-blue-500/90 hover:bg-blue-500 text-white">
                    <Link href="/admin/settings">
                      <Settings className="w-4 h-4 mr-2" aria-hidden />
                      Άνοιγμα Ρυθμίσεων
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          ) : null}
        </section>
      ) : null}
    </AdminLayout>
  );
}
