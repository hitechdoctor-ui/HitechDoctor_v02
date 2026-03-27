import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, RefreshCw, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HubSpotContactRow } from "@shared/hubspot";

const STORAGE_KEY = "hitech_admin_token";

async function fetchHubSpotContacts(): Promise<HubSpotContactRow[]> {
  const token = localStorage.getItem(STORAGE_KEY);
  const res = await fetch("/api/admin/hubspot/contacts", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { message?: string }).message || `Σφάλμα ${res.status}`);
  }
  return json as HubSpotContactRow[];
}

function formatDateEl(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("el-GR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function AdminHubspotContacts() {
  const queryClient = useQueryClient();
  const { data: contacts, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["admin", "hubspot", "contacts"],
    queryFn: fetchHubSpotContacts,
  });

  const errMsg = error instanceof Error ? error.message : null;

  return (
    <AdminLayout>
      <Seo title="HubSpot — Επαφές" description="Admin" />

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">CRM</span>
          </div>
          <h1 className="text-3xl font-display font-bold">HubSpot — Επαφές</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Λίστα επαφών από το HubSpot API (όνομα, email, τηλέφωνο, τελευταία επαφή). Το token ρυθμίζεται μόνο στον
            server (<span className="font-mono text-xs">HUBSPOT_ACCESS_TOKEN</span>).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-white/15 hover:border-primary/40 shrink-0"
          disabled={isFetching}
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ["admin", "hubspot", "contacts"] });
            void refetch();
          }}
          data-testid="button-hubspot-sync"
        >
          <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          Sync Now
        </Button>
      </div>

      {errMsg && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {errMsg}
        </div>
      )}

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Όνομα</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Τηλέφωνο</TableHead>
              <TableHead>Τελευταία επαφή</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Φόρτωση από HubSpot…
                </TableCell>
              </TableRow>
            ) : errMsg && !contacts ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Δεν ήταν δυνατή η φόρτωση.
                </TableCell>
              </TableRow>
            ) : !contacts?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Δεν βρέθηκαν επαφές.
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((row) => (
                <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-colors" data-testid={`hubspot-row-${row.id}`}>
                  <TableCell className="font-medium text-base">{row.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      {row.email}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      {row.phone}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      {formatDateEl(row.lastContactAt)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {contacts && contacts.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {contacts.length} επαφές · Sync Now ανανεώνει τη λίστα από το HubSpot
        </p>
      )}
    </AdminLayout>
  );
}
