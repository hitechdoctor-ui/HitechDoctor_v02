import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ArrowLeft, Globe2, MapPin, MonitorSmartphone, PieChart as PieChartIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type InsightsResponse = {
  period: string;
  totalInPeriod: number;
  byOs: { name: string; count: number }[];
  byBrowser: { name: string; count: number }[];
  topCities: { city: string; region: string | null; count: number }[];
};

const PIE_COLORS_OS = [
  "hsl(174 72% 46%)",
  "hsl(263 70% 58%)",
  "hsl(38 92% 50%)",
  "hsl(199 89% 48%)",
  "hsl(340 75% 55%)",
  "hsl(142 70% 45%)",
  "hsl(280 65% 55%)",
  "hsl(24 90% 55%)",
];

const PIE_COLORS_BROWSER = [
  "hsl(210 90% 55%)",
  "hsl(174 72% 46%)",
  "hsl(43 96% 56%)",
  "hsl(330 80% 60%)",
  "hsl(160 60% 45%)",
  "hsl(280 70% 58%)",
  "hsl(12 85% 55%)",
  "hsl(200 80% 50%)",
];

async function fetchInsights(period: string): Promise<InsightsResponse | null> {
  const res = await fetch(`/api/admin/analytics/insights?period=${period}`, {
    headers: getAdminAuthHeaders(),
  });
  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<InsightsResponse>;
}

function withPercent(rows: { name: string; count: number }[], total: number) {
  const t = total > 0 ? total : 1;
  return rows.map((r) => ({
    ...r,
    percent: Math.round((r.count / t) * 1000) / 10,
  }));
}

export default function AdminAnalyticsInsights() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month");

  const q = useQuery({
    queryKey: ["admin-analytics-insights", period] as const,
    queryFn: () => fetchInsights(period),
    refetchInterval: 120_000,
  });

  const total = q.data?.totalInPeriod ?? 0;
  const osData = useMemo(() => withPercent(q.data?.byOs ?? [], total), [q.data?.byOs, total]);
  const browserData = useMemo(() => withPercent(q.data?.byBrowser ?? [], total), [q.data?.byBrowser, total]);

  if (q.isFetched && q.data === null) {
    return (
      <AdminLayout>
        <Seo title="Insights — Admin" description="Αναλυτικά analytics" />
        <p className="text-muted-foreground">Δεν έχετε πρόσβαση.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Seo title="Analytics Insights — Admin" description="OS, browser, τοποθεσία επισκεπτών" />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Πίσω στο Dashboard
          </Link>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <PieChartIcon className="w-7 h-7 text-primary" aria-hidden />
            Analytics — Λεπτομέρειες
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Κατανομή λειτουργικού συστήματος και browser από User-Agent, και κορυφαίες πόλεις από IP (
            <span className="text-foreground/90">ipapi.co</span>
            ). Νέες επισκέψεις εμπλουτίζουν τα στατιστικά.
          </p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-[180px] border-white/10 bg-card" data-testid="select-insights-period">
            <SelectValue placeholder="Περίοδος" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Σήμερα</SelectItem>
            <SelectItem value="week">Τελευταίες 7 ημέρες</SelectItem>
            <SelectItem value="month">Τρέχων μήνας</SelectItem>
            <SelectItem value="year">Τρέχον έτος</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        Σύνολο εμφανίσεων στην περίοδο:{" "}
        <span className="font-bold tabular-nums text-foreground">{q.isLoading ? "—" : total}</span>
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <Card className="bg-card/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <MonitorSmartphone className="w-4 h-4 text-primary" aria-hidden />
              Λειτουργικό σύστημα
            </CardTitle>
            <CardDescription>Ποσοστό επισκέψεων ανά OS (από User-Agent)</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {q.isLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Φόρτωση…</div>
            ) : osData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Δεν υπάρχουν δεδομένα για την περίοδο.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {osData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_OS[i % PIE_COLORS_OS.length]} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _n, item) => [
                      `${value} επισκέψεις (${item?.payload?.percent ?? 0}%)`,
                      "Πλήθος",
                    ]}
                    contentStyle={{
                      background: "rgba(15, 18, 28, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-white/10">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-violet-400" aria-hidden />
              Browser
            </CardTitle>
            <CardDescription>Ποσοστό επισκέψεων ανά browser</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            {q.isLoading ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Φόρτωση…</div>
            ) : browserData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Δεν υπάρχουν δεδομένα για την περίοδο.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={100}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  >
                    {browserData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS_BROWSER[i % PIE_COLORS_BROWSER.length]} stroke="rgba(0,0,0,0.2)" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _n, item) => [
                      `${value} επισκέψεις (${item?.payload?.percent ?? 0}%)`,
                      "Πλήθος",
                    ]}
                    contentStyle={{
                      background: "rgba(15, 18, 28, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/80 border-white/10">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" aria-hidden />
            Top 10 πόλεων
          </CardTitle>
          <CardDescription>
            Βάσει IP (πόλη + περιοχή). Τοπικές / private IP δεν γεωκωδικοποιούνται.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Φόρτωση…</p>
          ) : !q.data?.topCities?.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Δεν υπάρχουν γεωγραφικά δεδομένα ακόμα — θα εμφανίζονται μετά από επισκέψεις από δημόσια IP.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Πόλη</TableHead>
                  <TableHead>Περιοχή</TableHead>
                  <TableHead className="text-right">Επισκέψεις</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data.topCities.map((row, i) => (
                  <TableRow key={`${row.city}-${row.region ?? ""}-${i}`} className="border-white/8">
                    <TableCell className="text-muted-foreground font-mono text-xs">{i + 1}</TableCell>
                    <TableCell className="font-medium">{row.city}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{row.region ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold text-primary">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
