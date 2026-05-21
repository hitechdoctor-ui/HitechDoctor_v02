import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Seo } from "@/components/seo";
import { PORTAL_TOKEN_STORAGE_KEY } from "@/lib/portal-auth-storage";
import { getPortalAuthHeaders } from "@/lib/queryClient";

type PortalSubscriptionRow = {
  id?: number;
  customerName?: string;
  type?: string;
  antivirusName?: string | null;
  status?: string;
  renewalDate?: string | null;
  price?: string | number;
};

export default function AccountPage() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PORTAL_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });

  const { data: me, isLoading: meLoading } = useQuery({
    queryKey: ["/api/portal/me", token],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/portal/me", { headers: getPortalAuthHeaders() });
      const json = await res.json();
      if (!json.ok) throw new Error("unauthorized");
      return json as { ok: boolean; id: number; email: string; name: string; role: string };
    },
    retry: false,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/portal/orders", token],
    enabled: !!token && !!me?.ok,
    queryFn: async () => {
      const res = await fetch("/api/portal/orders", { headers: getPortalAuthHeaders() });
      if (!res.ok) throw new Error("orders");
      return res.json() as Array<{
        id: number;
        totalAmount: string;
        status: string;
        paymentMethod?: string | null;
        createdAt: string;
        items?: unknown[];
      }>;
    },
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ["/api/portal/subscriptions", token],
    enabled: !!token && !!me?.ok,
    queryFn: async () => {
      const res = await fetch("/api/portal/subscriptions", { headers: getPortalAuthHeaders() });
      if (!res.ok) throw new Error("subs");
      return res.json() as PortalSubscriptionRow[];
    },
  });

  const logout = () => {
    try {
      localStorage.removeItem(PORTAL_TOKEN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setToken(null);
    setLocation("/auth");
  };

  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Seo title="Ο λογαριασμός μου" description="Σύνδεση πελάτη HiTech Doctor" />
        <p className="text-muted-foreground mb-4">Δεν είστε συνδεδεμένοι.</p>
        <Button asChild>
          <Link href="/auth">Σύνδεση / Εγγραφή</Link>
        </Button>
      </div>
    );
  }

  if (meLoading || !me) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Φόρτωση…</div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <Seo title={`Ο λογαριασμός μου — ${me.name}`} description="Στοιχεία και παραγγελίες πελάτη" />

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Ο λογαριασμός μου</h1>
          <p className="text-muted-foreground text-sm mt-1">{me.email}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/">Αρχική</Link>
          </Button>
          <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={logout}>
            Αποσύνδεση
          </Button>
        </div>
      </div>

      <Card className="mb-6 bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Στοιχεία επικοινωνίας</CardTitle>
          <CardDescription>Τα στοιχεία του λογαριασμού σας στο HiTech Doctor.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Όνομα: </span>
            <span className="font-medium">{me.name}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Email: </span>
            <span className="font-medium">{me.email}</span>
          </p>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Οι παραγγελίες μου</CardTitle>
          <CardDescription>Από το ηλεκτρονικό κατάστημα — συμπεριλαμβάνουν τρόπο πληρωμής και κατάσταση.</CardDescription>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <p className="text-sm text-muted-foreground">Φόρτωση παραγγελιών…</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Δεν υπάρχουν ακόμα καταχωρημένες παραγγελίες για αυτό το email.</p>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => (
                <li key={o.id} className="rounded-lg border border-white/10 p-3 text-sm">
                  <div className="flex justify-between gap-2 flex-wrap">
                    <span className="font-semibold">Παραγγελία #{o.id}</span>
                    <span className="text-muted-foreground">
                      {new Intl.DateTimeFormat("el-GR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(o.createdAt))}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Κατάσταση: <strong className="text-foreground">{o.status}</strong>
                    </span>
                    {o.paymentMethod ? (
                      <span>
                        Πληρωμή: <strong className="text-foreground">{o.paymentMethod}</strong>
                      </span>
                    ) : null}
                    <span>
                      Σύνολο:{" "}
                      <strong className="text-foreground">
                        {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(
                          Number(o.totalAmount)
                        )}
                      </strong>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Συνδρομές</CardTitle>
          <CardDescription>Συνδρομές που σχετίζονται με το email σας.</CardDescription>
        </CardHeader>
        <CardContent>
          {subsLoading ? (
            <p className="text-sm text-muted-foreground">Φόρτωση…</p>
          ) : subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Δεν βρέθηκαν συνδρομές για αυτό το email.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {subscriptions.map((s) => (
                <li key={s.id ?? `${s.type}-${s.renewalDate}`} className="rounded-lg border border-white/10 p-3 space-y-1">
                  <div className="font-semibold text-foreground">
                    {s.antivirusName?.trim() || s.type || "Συνδρομή"}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    {s.status ? (
                      <span>
                        Κατάσταση: <strong className="text-foreground">{s.status}</strong>
                      </span>
                    ) : null}
                    {s.renewalDate ? (
                      <span>
                        Ανανέωση:{" "}
                        <strong className="text-foreground">
                          {new Intl.DateTimeFormat("el-GR", { dateStyle: "medium" }).format(new Date(s.renewalDate))}
                        </strong>
                      </span>
                    ) : null}
                    {s.price != null ? (
                      <span>
                        Τιμή:{" "}
                        <strong className="text-foreground">
                          {new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(Number(s.price))}
                        </strong>
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
