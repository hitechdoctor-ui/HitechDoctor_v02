import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getAdminAuthHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RepairPriceOverride } from "@shared/schema";
import { Pencil, Trash2, Search, Loader2 } from "lucide-react";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAdminAuthHeaders(), ...init?.headers },
  });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(j.message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function rowMatchesQuery(row: RepairPriceOverride, q: string): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const hay = [row.brand, row.modelSlug, row.serviceKey, row.externalSku ?? ""].join(" ").toLowerCase();
  return hay.includes(s);
}

export default function AdminRepairPriceOverridesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [editRow, setEditRow] = useState<RepairPriceOverride | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editNet, setEditNet] = useState("");
  const [editSku, setEditSku] = useState("");
  const [deleteRow, setDeleteRow] = useState<RepairPriceOverride | null>(null);

  const listQ = useQuery({
    queryKey: ["admin-repair-price-overrides"],
    queryFn: () => fetchJson<RepairPriceOverride[]>("/api/admin/repair-price-overrides"),
  });

  const filtered = useMemo(() => {
    const rows = listQ.data ?? [];
    return rows.filter((r) => rowMatchesQuery(r, filter));
  }, [listQ.data, filter]);

  const openEdit = (row: RepairPriceOverride) => {
    setEditRow(row);
    setEditPrice(String(row.price ?? ""));
    setEditNet(row.purchaseCost != null ? String(row.purchaseCost) : "");
    setEditSku(row.externalSku ?? "");
  };

  const closeEdit = () => {
    setEditRow(null);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editRow) return;
      await fetchJson<RepairPriceOverride>(`/api/admin/repair-price-overrides/${editRow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: editPrice.trim(),
          purchaseCost: editNet.trim() === "" ? null : editNet.trim(),
          externalSku: editSku.trim() === "" ? null : editSku.trim(),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-repair-price-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/repair-prices"] });
      toast({ title: "Αποθηκεύτηκε" });
      closeEdit();
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Σφάλμα", description: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/repair-price-overrides/${id}`, {
        method: "DELETE",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(j.message ?? `HTTP ${res.status}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-repair-price-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/repair-prices"] });
      toast({ title: "Διαγράφηκε η εγγραφή" });
      setDeleteRow(null);
    },
    onError: (e: Error) => toast({ variant: "destructive", title: "Σφάλμα", description: e.message }),
  });

  return (
    <AdminLayout>
      <Seo title="Repair overrides — Admin" description="Διαχείριση αντιστοιχίσεων τιμών επισκευής" />
      <div className="space-y-6 max-w-6xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Αντιστοιχίσεις επισκευών</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Προβολή και επεξεργασία εγγραφών από <code className="text-primary">repair_price_overrides</code> (PDF FixMobile,
            XML sync). Η <strong>τελική τιμή</strong> είναι με ΦΠΑ· το <strong>καθαρό κόστος</strong> είναι net από PDF/προμηθευτή.
          </p>
        </div>

        <Card className="bg-card border-primary/25">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Λίστα overrides</CardTitle>
            <CardDescription>
              Φιλτράρισμα ανά μοντέλο, μάρκα, υπηρεσία ή SKU. Εμφανίζονται {filtered.length} από {listQ.data?.length ?? 0} εγγραφές.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Αναζήτηση (π.χ. iPhone 12, battery_standard, …)"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9"
              />
            </div>

            {listQ.isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground py-8">
                <Loader2 className="w-5 h-5 animate-spin" />
                Φόρτωση…
              </div>
            )}
            {listQ.isError && (
              <p className="text-sm text-destructive">{(listQ.error as Error).message}</p>
            )}
            {!listQ.isLoading && listQ.data && listQ.data.length === 0 && (
              <p className="text-sm text-muted-foreground">Δεν υπάρχουν εγγραφές. Τρέξτε Sync από το Supplier Sync.</p>
            )}
            {listQ.data && listQ.data.length > 0 && (
              <div className="rounded-md border border-white/10 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Υπηρεσία</TableHead>
                      <TableHead>Μάρκα</TableHead>
                      <TableHead>Μοντέλο (slug)</TableHead>
                      <TableHead className="text-right">Τιμή πώλησης (€, με ΦΠΑ)</TableHead>
                      <TableHead className="text-right">Καθαρό κόστος (PDF net)</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="w-[100px] text-right">Ενέργειες</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{row.serviceKey}</TableCell>
                        <TableCell className="text-sm">{row.brand}</TableCell>
                        <TableCell className="text-sm font-medium">{row.modelSlug}</TableCell>
                        <TableCell className="text-right tabular-nums">{String(row.price)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {row.purchaseCost != null ? String(row.purchaseCost) : "—"}
                        </TableCell>
                        <TableCell className="font-mono text-xs max-w-[200px] truncate" title={row.externalSku ?? undefined}>
                          {row.externalSku ?? "—"}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(row)}>
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => setDeleteRow(row)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!editRow} onOpenChange={(o) => !o && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Επεξεργασία αντιστοίχισης</DialogTitle>
          </DialogHeader>
          {editRow && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {editRow.brand} · <span className="text-foreground">{editRow.modelSlug}</span> ·{" "}
                <code className="text-primary">{editRow.serviceKey}</code>
              </p>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Τιμή πώλησης (€, με ΦΠΑ)</Label>
                <Input id="edit-price" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} inputMode="decimal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-net">Καθαρό κόστος / net (PDF)</Label>
                <Input
                  id="edit-net"
                  value={editNet}
                  onChange={(e) => setEditNet(e.target.value)}
                  placeholder="Κενό = κανένα"
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">External SKU</Label>
                <Input id="edit-sku" value={editSku} onChange={(e) => setEditSku(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeEdit}>
              Άκυρο
            </Button>
            <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !editPrice.trim()}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteRow} onOpenChange={(o) => !o && setDeleteRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή εγγραφής;</AlertDialogTitle>
            <AlertDialogDescription>
              Θα αφαιρεθεί η αντιστοίχιση για{" "}
              <strong>
                {deleteRow?.brand} / {deleteRow?.modelSlug}
              </strong>{" "}
              ({deleteRow?.serviceKey}). Η ενέργεια δεν αναιρείται.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Άκυρο</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-600/90"
              onClick={() => deleteRow && deleteMutation.mutate(deleteRow.id)}
            >
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
