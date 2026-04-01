import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Link } from "wouter";
import { Activity, BarChart3, Flame, LineChart, MessageCircle, TrendingDown, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AnalyticsStats = {
  today: number;
  yesterday: number;
  weekTotal: number;
  monthTotal: number;
  activeNow: number;
  dailyLast7Days: { date: string; count: number }[];
};

type ChatActivityStats = {
  today: number;
  dailyLast7Days: { date: string; count: number }[];
};

type TopPagesResponse = {
  period: string;
  rows: { path: string; count: number }[];
};

type Ga4AdminResponse = {
  configured: boolean;
  period?: string;
  activeUsers?: number;
  screenPageViews?: number;
  propertyId?: string;
  reason?: string;
  error?: string;
};

async function fetchAdminJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: getAdminAuthHeaders() });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

function formatDayLabel(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Intl.DateTimeFormat("el-GR", { weekday: "short", day: "numeric", month: "short" }).format(
    new Date(y, m - 1, d)
  );
}

function pctVsYesterday(today: number, yesterday: number): { value: number; up: boolean } {
  if (yesterday === 0) return { value: today > 0 ? 100 : 0, up: today >= 0 };
  const v = Math.round(((today - yesterday) / yesterday) * 100);
  return { value: Math.abs(v), up: v >= 0 };
}

export function AnalyticsDashboard() {
  const [topPeriod, setTopPeriod] = useState<"day" | "week" | "month" | "year">("week");

  const statsQ = useQuery({
    queryKey: ["admin-analytics-stats"] as const,
    queryFn: () => fetchAdminJson<AnalyticsStats>("/api/admin/analytics/stats"),
    refetchInterval: 60_000,
  });

  const chatQ = useQuery({
    queryKey: ["admin-analytics-chat"] as const,
    queryFn: () => fetchAdminJson<ChatActivityStats>("/api/admin/analytics/chat-activity"),
    refetchInterval: 60_000,
  });

  const topQ = useQuery({
    queryKey: ["admin-analytics-top-pages", topPeriod] as const,
    queryFn: () => fetchAdminJson<TopPagesResponse>(`/api/admin/analytics/top-pages?period=${topPeriod}`),
    refetchInterval: 60_000,
  });

  const ga4Q = useQuery({
    queryKey: ["admin-analytics-ga4", topPeriod] as const,
    queryFn: () => fetchAdminJson<Ga4AdminResponse>(`/api/admin/analytics/ga4?period=${topPeriod}`),
    refetchInterval: 120_000,
  });

  const chartData = useMemo(() => {
    const s = statsQ.data;
    const c = chatQ.data;
    if (!s?.dailyLast7Days) return [];
    return s.dailyLast7Days.map((d) => {
      const chatDay = c?.dailyLast7Days.find((x) => x.date === d.date);
      return {
        date: d.date,
        label: formatDayLabel(d.date),
        visits: d.count,
        chat: chatDay?.count ?? 0,
      };
    });
  }, [statsQ.data, chatQ.data]);

  const noAccess =
    statsQ.isFetched && statsQ.data === null && !statsQ.isLoading && !statsQ.isError;

  if (noAccess) return null;
  if (statsQ.isError) return null;

  const stats = statsQ.data;
  const chat = chatQ.data;
  const topRows = topQ.data?.rows ?? [];
  const topPage = topRows[0];

  const visitTrend = stats ? pctVsYesterday(stats.today, stats.yesterday) : { value: 0, up: true };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" aria-hidden />
            Analytics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Επισκέψεις ιστοτόπου, AI chat και δημοφιλείς σελίδες (τελευταία ενημέρωση κάθε ~1 λεπτό)
          </p>
          <p className="text-[11px] text-muted-foreground/90 mt-2 max-w-3xl leading-relaxed border-l-2 border-primary/30 pl-3">
            Τα νούμερα «Επισκέψεις» εδώ είναι{" "}
            <span className="text-foreground/90 font-medium">πρώτο-πρόσωπο</span> (καταγραφή SPA στον server)· το
            Google Analytics μετράει μόνο αν έχει οριστεί{" "}
            <code className="text-[10px] bg-white/5 px-1 rounded">VITE_GA_MEASUREMENT_ID=G-…</code> στο build και ο
            επισκέπτης έχει αποδεχτεί cookies ανάλυσης. Φίλτρα IP/health check: env{" "}
            <code className="text-[10px] bg-white/5 px-1 rounded">ANALYTICS_EXCLUDE_IPS</code>.
          </p>
        </div>
        <Button variant="outline" size="sm" className="border-white/15 shrink-0 w-full sm:w-auto" asChild>
          <Link href="/admin/insights" data-testid="btn-analytics-more-insights">
            Περισσότερες Λεπτομέρειες
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="bg-card/80 border-white/10 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground/90">
              Επισκέψεις σήμερα
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {statsQ.isLoading ? "—" : stats?.today ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex flex-wrap items-center gap-2">
            {stats && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                  visitTrend.up
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/25"
                }`}
              >
                {visitTrend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {visitTrend.up ? "+" : "−"}
                {visitTrend.value}% vs χθες
              </span>
            )}
            {stats != null && stats.activeNow > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                <Users className="w-3 h-3" />
                ~{stats.activeNow} ενεργοί (5΄)
              </span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground/90">
              Επισκέψεις 7 ημερών
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums">
              {statsQ.isLoading ? "—" : stats?.weekTotal ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">
              Μήνας: <span className="text-foreground font-semibold tabular-nums">{stats?.monthTotal ?? "—"}</span>{" "}
              συνολικές εμφανίσεις
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground/90 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-violet-400" />
              AI Doctor σήμερα
            </CardDescription>
            <CardTitle className="text-3xl font-bold tabular-nums text-violet-200">
              {chatQ.isLoading ? "—" : chat?.today ?? "—"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-[11px] text-muted-foreground">Ερωτήματα χρηστών στο chat επισκευών</p>
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground/90 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Top σελίδα
            </CardDescription>
            <CardTitle className="text-base font-semibold leading-snug line-clamp-2 min-h-[2.5rem]">
              {topQ.isLoading ? "—" : topPage ? topPage.path : "Δεν υπάρχουν δεδομένα"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 flex items-center justify-between gap-2">
            {topPage && (
              <span className="text-sm font-bold tabular-nums text-amber-200/95">{topPage.count} επισκέψεις</span>
            )}
            <Select value={topPeriod} onValueChange={(v) => setTopPeriod(v as typeof topPeriod)}>
              <SelectTrigger className="h-8 w-[130px] text-xs border-white/10 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Σήμερα</SelectItem>
                <SelectItem value="week">Εβδομάδα</SelectItem>
                <SelectItem value="month">Μήνας</SelectItem>
                <SelectItem value="year">Έτος</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 border-white/10 backdrop-blur-sm border-blue-500/15">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-display flex items-center gap-2">
                <LineChart className="w-4 h-4 text-blue-400" aria-hidden />
                Google Analytics 4 (Data API)
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Ίδια περίοδο με «Top σελίδα» πάνω — απαιτεί{" "}
                <code className="text-[10px] bg-white/5 px-1 rounded">GA4_PROPERTY_ID</code> (αριθμός property) + service
                account στο GA4 ως Viewer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm">
          {ga4Q.isLoading ? (
            <p className="text-muted-foreground">Φόρτωση GA4…</p>
          ) : ga4Q.data?.configured === false ? (
            <p className="text-muted-foreground leading-relaxed">
              Δεν είναι ενεργό: {ga4Q.data?.reason ?? "λείπει ρύθμιση server env."}
            </p>
          ) : ga4Q.data?.error ? (
            <p className="text-rose-300/95 text-xs leading-relaxed">Σφάλμα API: {ga4Q.data.error}</p>
          ) : (
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Ενεργοί χρήστες</p>
                <p className="text-2xl font-bold tabular-nums text-blue-200">{ga4Q.data?.activeUsers ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Προβολές σελίδας (GA4)</p>
                <p className="text-2xl font-bold tabular-nums text-blue-200">{ga4Q.data?.screenPageViews ?? "—"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 border-white/10 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-display">Τάση 7 ημερών</CardTitle>
          </div>
          <CardDescription className="text-xs">Επισκέψεις (teal) και μηνύματα AI (violet)</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] w-full pt-2">
          {chartData.length === 0 && statsQ.isLoading ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Φόρτωση…</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(174 72% 46%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(174 72% 46%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillChat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(263 70% 58%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(263 70% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15, 18, 28, 0.94)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelFormatter={(_, payload) => (payload?.[0]?.payload?.date as string) ?? ""}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="visits" name="Επισκέψεις" stroke="hsl(174 72% 46%)" fill="url(#fillVisits)" strokeWidth={2} />
                <Area type="monotone" dataKey="chat" name="AI chat" stroke="hsl(263 70% 58%)" fill="url(#fillChat)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {topRows.length > 0 && (
        <Card className="bg-card/80 border-white/10 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">Δημοφιλείς διαδρομές</CardTitle>
            <CardDescription className="text-xs">Σύμφωνα με την επιλεγμένη περίοδο</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topRows.map((row, i) => {
              const max = topRows[0]?.count || 1;
              const w = Math.round((row.count / max) * 100);
              return (
                <div key={`${row.path}-${i}`} className="space-y-1">
                  <div className="flex justify-between text-xs gap-2">
                    <span className={`truncate font-medium inline-flex items-center gap-1 ${i === 0 ? "text-amber-200" : "text-foreground/90"}`}>
                      {i === 0 ? <Flame className="w-3 h-3 text-amber-400 shrink-0" aria-hidden /> : null}
                      <span>{i === 0 ? "" : `${i + 1}. `}</span>
                      <span className="truncate">{row.path}</span>
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
      )}
    </div>
  );
}
