import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Supplier, SupplierSyncItem, RepairPriceOverride } from "@shared/schema";
import { RefreshCw, Loader2, Trash2, Plus, CloudDownload, FileText } from "lucide-react";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAdminAuthHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(j.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function AdminSupplierSyncPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [xmlUrl, setXmlUrl] = useState("");
  const [workFee, setWorkFee] = useState("60");
  const [vatRate, setVatRate] = useState("24");

  const [mapBrand, setMapBrand] = useState("iphone");
  const [mapSlug, setMapSlug] = useState("");
  const [mapService, setMapService] = useState("screen_oem");
  const [mapSku, setMapSku] = useState("");
  const [mapPrice, setMapPrice] = useState("");

  const [jobId, setJobId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncMessage, setSyncMessage] = useState("");
  const [syncing, setSyncing] = useState(false);

  const [pdfBusy, setPdfBusy] = useState(false);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const suppliersQ = useQuery({
    queryKey: ["admin-suppliers"],
    queryFn: () => fetchJson<Supplier[]>("/api/admin/suppliers"),
  });

  const itemsQ = useQuery({
    queryKey: ["admin-supplier-sync-items"],
    queryFn: () => fetchJson<SupplierSyncItem[]>("/api/admin/supplier-sync-items"),
  });

  const overridesQ = useQuery({
    queryKey: ["admin-repair-price-overrides"],
    queryFn: () => fetchJson<RepairPriceOverride[]>("/api/admin/repair-price-overrides"),
  });

  const pollJob = useCallback(
    async (id: string) => {
      const j = await fetchJson<{
        progress: number;
        message: string;
        done: boolean;
        error?: boolean;
        result?: { suppliersProcessed: number; itemsInserted: number; overridesUpdated: number; errors: string[] };
      }>(`/api/admin/sync-status/${id}`);
      setSyncProgress(j.progress);
      setSyncMessage(j.message);
      if (j.done) {
        setJobId(null);
        setSyncing(false);
        queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
        queryClient.invalidateQueries({ queryKey: ["admin-supplier-sync-items"] });
        queryClient.invalidateQueries({ queryKey: ["admin-repair-price-overrides"] });
        if (j.error) {
          toast({ variant: "destructive", title: "Σφάλμα συγχρονισμού", description: j.message });
        } else {
          const r = j.result;
          toast({
            title: "Συγχρονισμός ολοκληρώθηκε",
            description: r
              ? `Προμηθευτές: ${r.suppliersProcessed}, γραμμές: ${r.itemsInserted}, ενημερώσεις τιμών: ${r.overridesUpdated}`
              : undefined,
          });
          if (r?.errors?.length) {
            toast({
              variant: "destructive",
              title: "Προειδοποιήσεις",
              description: r.errors.slice(0, 5).join(" · "),
            });
          }
        }
      }
    },
    [queryClient, toast]
  );

  useEffect(() => {
    if (!jobId) return;
    const t = setInterval(() => {
      void pollJob(jobId);
    }, 450);
    void pollJob(jobId);
    return () => clearInterval(t);
  }, [jobId, pollJob]);

  const createSupplier = useMutation({
    mutationFn: async () => {
      await fetchJson<Supplier>("/api/admin/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          xmlUrl: xmlUrl.trim(),
          workFee,
          vatRate,
        }),
      });
    },
    onSuccess: () => {
      setName("");
      setXmlUrl("");
      setWorkFee("60");
      setVatRate("24");
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
      toast({ title: "Αποθηκεύτηκε ο προμηθευτής" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Σφάλμα", description: e.message }),
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/suppliers/${id}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(j.message ?? "Αποτυχία διαγραφής");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-suppliers"] });
      toast({ title: "Διαγράφηκε" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Σφάλμα", description: e.message }),
  });

  const startSync = async (supplierId?: number) => {
    setSyncing(true);
    setSyncProgress(0);
    setSyncMessage("Έναρξη…");
    try {
      const data = await fetchJson<{ jobId: string }>("/api/admin/sync-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierId ? { supplierId } : {}),
      });
      setJobId(data.jobId);
    } catch (e) {
      setSyncing(false);
      toast({ variant: "destructive", title: "Σφάλμα", description: (e as Error).message });
    }
  };

  const saveOverride = useMutation({
    mutationFn: async () => {
      await fetchJson("/api/admin/repair-price-overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: mapBrand.trim(),
          modelSlug: mapSlug.trim(),
          serviceKey: mapService.trim() || "screen_oem",
          ...(mapSku.trim() ? { externalSku: mapSku.trim() } : {}),
          price: mapPrice.trim(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-repair-price-overrides"] });
      toast({ title: "Αποθηκεύτηκε η τιμή επισκευής" });
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Σφάλμα", description: e.message }),
  });

  const uploadFixmobilePdf = async () => {
    const f = pdfFileRef.current?.files?.[0];
    if (!f) {
      toast({ variant: "destructive", title: "Επιλέξτε αρχείο PDF" });
      return;
    }
    setPdfBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/admin/upload-fixmobile-pdf", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: fd,
      });
      const j = (await res.json().catch(() => ({}))) as { message?: string; filename?: string };
      if (!res.ok) throw new Error(j.message ?? `HTTP ${res.status}`);
      toast({ title: "Αποθηκεύτηκε ο τιμοκατάλογος", description: j.filename ?? "PDF" });
      if (pdfFileRef.current) pdfFileRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["admin-repair-price-overrides"] });
    } catch (e) {
      toast({ variant: "destructive", title: "Σφάλμα", description: (e as Error).message });
    } finally {
      setPdfBusy(false);
    }
  };

  const syncFixmobilePdf = async () => {
    setPdfBusy(true);
    try {
      const r = await fetchJson<{
        screensParsed: number;
        batteriesParsed: number;
        screensMatched: number;
        batteriesMatched: number;
        upserted: number;
        unmatched: string[];
        errors: string[];
      }>("/api/admin/sync-fixmobile-pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      toast({
        title: "Συγχρονισμός PDF ολοκληρώθηκε",
        description: `Ενημερώσεις: ${r.upserted} · Οθόνες: ${r.screensMatched}/${r.screensParsed} · Μπαταρίες: ${r.batteriesMatched}/${r.batteriesParsed}`,
      });
      if (r.unmatched?.length) {
        toast({
          variant: "destructive",
          title: "Γραμμές χωρίς ταύτιση (δείγμα)",
          description: r.unmatched.slice(0, 8).join(" · "),
        });
      }
      if (r.errors?.length) {
        toast({ variant: "destructive", title: "Σφάλματα", description: r.errors.slice(0, 5).join(" · ") });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-repair-price-overrides"] });
    } catch (e) {
      toast({ variant: "destructive", title: "Σφάλμα", description: (e as Error).message });
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <AdminLayout>
      <Seo title="Supplier Sync — Admin" description="Συγχρονισμός τιμών από XML προμηθευτών" />
      <div className="space-y-8 max-w-5xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary" />
            Supplier Sync
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Τελική τιμή (με ΦΠΑ): <code className="text-primary">(κόστος αγοράς + εργασία) × (1 + ΦΠΑ% / 100)</code>.
            Προσθέστε αντιστοίχιση SKU παρακάτω ώστε το sync να ενημερώνει τις εγγραφές επισκευών.
          </p>
        </div>

        <Card className="bg-card border-primary/25">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              PDF FixMobile — Τιμοκατάλογος
            </CardTitle>
            <CardDescription>
              Ανεβάστε <strong className="text-foreground">ένα</strong> PDF τιμοκαταλόγου FixMobile (οθόνες και/ή μπαταρίες). Αποθηκεύεται ως{" "}
              <code className="text-xs text-primary">uploads/fixmobile/fixmobile.pdf</code>. Ο συγχρονισμός διαβάζει κάθε γραμμή και ταξινομεί ως οθόνη ή μπαταρία
              από λέξεις στο κείμενο (π.χ. «Οθόνη», «LCD», «Μπαταρία», «mAh»). Μετά εκτελέστε συγχρονισμό για ενημέρωση της βάσης.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <Label htmlFor="pdf-file">Αρχείο PDF</Label>
                <Input id="pdf-file" ref={pdfFileRef} type="file" accept="application/pdf" disabled={pdfBusy} />
              </div>
              <Button type="button" onClick={() => void uploadFixmobilePdf()} disabled={pdfBusy} className="gap-2">
                {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Upload PDF Price List
              </Button>
              <Button type="button" variant="secondary" onClick={() => void syncFixmobilePdf()} disabled={pdfBusy} className="gap-2">
                {pdfBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Συγχρονισμός από PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Γραμμή κειμένου: <code className="text-[11px]">Όνομα μοντέλου</code> ακολουθούμενο από την τιμή χωρίς ΦΠΑ (π.χ.{" "}
              <code className="text-[11px]">iPhone 15 Pro 85,50</code>). Τελική τιμή πώλησης (με ΦΠΑ):{" "}
              <code className="text-primary">(τιμή χωρίς ΦΠΑ + 60€) × 1,24</code>, όπως στο XML sync.
            </p>
          </CardContent>
        </Card>

        {(syncing || jobId) && (
          <Card className="bg-card border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                {syncing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : null}
                Συγχρονισμός
              </CardTitle>
              <CardDescription>{syncMessage || "—"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={syncProgress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2 tabular-nums">{Math.round(syncProgress)}%</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-white/8">
          <CardHeader>
            <CardTitle className="text-lg">Νέος προμηθευτής</CardTitle>
            <CardDescription>Όνομα, URL XML, εργασία (€) και ΦΠΑ %.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sup-name">Όνομα</Label>
                <Input id="sup-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="π.χ. Parts GR" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="sup-xml">XML URL</Label>
                <Input
                  id="sup-xml"
                  type="url"
                  value={xmlUrl}
                  onChange={(e) => setXmlUrl(e.target.value)}
                  placeholder="https://…/feed.xml"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sup-fee">Εργασία (€)</Label>
                <Input id="sup-fee" value={workFee} onChange={(e) => setWorkFee(e.target.value)} inputMode="decimal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sup-vat">ΦΠΑ (%)</Label>
                <Input id="sup-vat" value={vatRate} onChange={(e) => setVatRate(e.target.value)} inputMode="decimal" />
              </div>
            </div>
            <Button
              type="button"
              onClick={() => createSupplier.mutate()}
              disabled={createSupplier.isPending || !name.trim() || !xmlUrl.trim()}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Προσθήκη προμηθευτή
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/8">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Προμηθευτές</CardTitle>
              <CardDescription>Τελευταίος συγχρονισμός ανά γραμμή.</CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              disabled={syncing || !suppliersQ.data?.length}
              onClick={() => void startSync()}
            >
              <CloudDownload className="w-4 h-4" />
              Συγχρονισμός όλων
            </Button>
          </CardHeader>
          <CardContent>
            {suppliersQ.isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Φόρτωση…
              </div>
            )}
            {suppliersQ.data && suppliersQ.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν προμηθευτές ακόμα.</p>
            )}
            {suppliersQ.data && suppliersQ.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Όνομα</TableHead>
                    <TableHead>Εργασία / ΦΠΑ</TableHead>
                    <TableHead>Τελευταίο sync</TableHead>
                    <TableHead className="text-right">Ενέργειες</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suppliersQ.data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {String(s.workFee)}€ · ΦΠΑ {String(s.vatRate)}%
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.lastSync ? new Date(s.lastSync).toLocaleString("el-GR") : "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={syncing}
                          onClick={() => void startSync(s.id)}
                        >
                          Sync
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => {
                            if (confirm(`Διαγραφή «${s.name}»;`)) deleteSupplier.mutate(s.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-white/8">
          <CardHeader>
            <CardTitle className="text-lg">Αντιστοίχιση επισκευών (SKU → τιμή)</CardTitle>
            <CardDescription>
              Το <strong>SKU</strong> πρέπει να ταιριάζει με το πεδίο στο XML. Η τιμή είναι τελική (με ΦΠΑ) που θα ενημερώνεται
              αυτόματα από το sync όταν υπάρχει ίδιο SKU.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label>Μάρκα</Label>
                <Input value={mapBrand} onChange={(e) => setMapBrand(e.target.value)} placeholder="iphone" />
              </div>
              <div className="space-y-2">
                <Label>Slug μοντέλου</Label>
                <Input value={mapSlug} onChange={(e) => setMapSlug(e.target.value)} placeholder="iphone-15-pro" />
              </div>
              <div className="space-y-2">
                <Label>Υπηρεσία (κλειδί)</Label>
                <Input value={mapService} onChange={(e) => setMapService(e.target.value)} placeholder="screen_oem" />
              </div>
              <div className="space-y-2">
                <Label>SKU από XML</Label>
                <Input value={mapSku} onChange={(e) => setMapSku(e.target.value)} placeholder="ABC-123" />
              </div>
              <div className="space-y-2">
                <Label>Τιμή (€, τρέχουσα)</Label>
                <Input value={mapPrice} onChange={(e) => setMapPrice(e.target.value)} placeholder="189.00" />
              </div>
            </div>
            <Button type="button" onClick={() => saveOverride.mutate()} disabled={saveOverride.isPending || !mapSlug.trim() || !mapPrice.trim()}>
              Αποθήκευση αντιστοίχισης
            </Button>

            {overridesQ.data && overridesQ.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Μάρκα / Slug</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Τιμή</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overridesQ.data.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="text-sm">
                        {o.brand} / {o.modelSlug}
                        <span className="text-muted-foreground"> · {o.serviceKey}</span>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{o.externalSku ?? "—"}</TableCell>
                      <TableCell>{String(o.price)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-white/8">
          <CardHeader>
            <CardTitle className="text-lg">Τελευταίες γραμμές XML (cache)</CardTitle>
            <CardDescription>Αποτέλεσμα του τελευταίου συγχρονισμού ανά SKU.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {itemsQ.isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Φόρτωση…
              </div>
            )}
            {itemsQ.data && itemsQ.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν ακόμα δεδομένα sync.</p>
            )}
            {itemsQ.data && itemsQ.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Τίτλος</TableHead>
                    <TableHead>Κόστος</TableHead>
                    <TableHead>Τιμή πώλησης</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsQ.data.slice(0, 80).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.externalSku}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{row.title ?? "—"}</TableCell>
                      <TableCell>{String(row.purchaseCost)} €</TableCell>
                      <TableCell className="text-primary font-medium">{String(row.sellingPrice)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
