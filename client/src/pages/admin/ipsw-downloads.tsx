import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Loader2, Smartphone } from "lucide-react";

const STORAGE_KEY = "hitech_admin_token";

type Stats = {
  total: number;
  last7Days: number;
  last30Days: number;
  byDevice: { deviceIdentifier: string; deviceName: string | null; count: number }[];
  recent: {
    id: number;
    deviceIdentifier: string;
    deviceName: string | null;
    version: string;
    buildId: string;
    createdAt: string;
  }[];
};

function formatDt(s: string) {
  return new Intl.DateTimeFormat("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(s));
}

async function fetchIpswStats(): Promise<Stats> {
  const token = localStorage.getItem(STORAGE_KEY);
  const res = await fetch("/api/admin/ipsw-downloads", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Αδυναμία φόρτωσης στατιστικών");
  return res.json();
}

export default function AdminIpswDownloadsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-ipsw-stats"],
    queryFn: fetchIpswStats,
  });

  return (
    <AdminLayout>
      <Seo title="IPSW λήψεις — Admin" description="Στατιστικά λήψεων IPSW" />
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            IPSW λήψεις
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Καταγραφές όταν οι επισκέπτες πατούν «Λήψη» στη σελίδα IPSW Download.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Φόρτωση…
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">{(error as Error).message}</p>
        )}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="bg-card border-white/8">
                <CardHeader className="pb-2">
                  <CardDescription>Σύνολο λήψεων</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">{data.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card border-white/8">
                <CardHeader className="pb-2">
                  <CardDescription>Τελευταίες 7 ημέρες</CardDescription>
                  <CardTitle className="text-3xl tabular-nums text-primary">{data.last7Days}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-card border-white/8">
                <CardHeader className="pb-2">
                  <CardDescription>Τελευταίες 30 ημέρες</CardDescription>
                  <CardTitle className="text-3xl tabular-nums">{data.last30Days}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Card className="bg-card border-white/8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  Ανά μοντέλο
                </CardTitle>
                <CardDescription>Πλήθος κλικ λήψης ανά device identifier.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {data.byDevice.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Δεν υπάρχουν εγγραφές ακόμα.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Μοντέλο</TableHead>
                        <TableHead>Identifier</TableHead>
                        <TableHead className="text-right">Λήψεις</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.byDevice.map((row) => (
                        <TableRow key={row.deviceIdentifier}>
                          <TableCell className="font-medium">{row.deviceName ?? "—"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {row.deviceIdentifier}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{row.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-white/8">
              <CardHeader>
                <CardTitle className="text-lg">Πρόσφατα</CardTitle>
                <CardDescription>Τελευταίες καταγραφές (έως 80).</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                {data.recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ημερομηνία</TableHead>
                        <TableHead>Συσκευή</TableHead>
                        <TableHead>Έκδοση</TableHead>
                        <TableHead>Build</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recent.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="text-xs whitespace-nowrap">{formatDt(r.createdAt)}</TableCell>
                          <TableCell>
                            <span className="text-sm">{r.deviceName ?? r.deviceIdentifier}</span>
                            <span className="block font-mono text-[10px] text-muted-foreground">{r.deviceIdentifier}</span>
                          </TableCell>
                          <TableCell className="tabular-nums">{r.version}</TableCell>
                          <TableCell className="font-mono text-xs">{r.buildId}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
