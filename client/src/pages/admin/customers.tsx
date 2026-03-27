import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useCustomers } from "@/hooks/use-customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Mail, Phone, MapPin, ChevronRight, Download, Search, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";
import { useMemo, useState } from "react";

export default function AdminCustomers() {
  const { data: customers, isLoading } = useCustomers();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!customers) return [];
    const s = q.trim().toLowerCase();
    if (!s) return customers;
    return customers.filter((c) => {
      const name = c.name.toLowerCase();
      const email = c.email.toLowerCase();
      const phone = (c.phone ?? "").replace(/\s/g, "");
      const qDigits = s.replace(/\D/g, "");
      const phoneDigits = phone.replace(/\D/g, "");
      const phoneMatch =
        qDigits.length >= 3 && phoneDigits.includes(qDigits);
      return (
        name.includes(s) ||
        email.includes(s) ||
        phone.includes(s.replace(/\s/g, "")) ||
        phoneMatch
      );
    });
  }, [customers, q]);

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <AdminLayout>
      <Seo title="CRM Πελατών" description="Admin" />
      
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold">Πελατολόγιο (CRM)</h1>
          <p className="text-muted-foreground">
            Αρχείο πελατών και στοιχεία επικοινωνίας — κλικ για Καρτέλα.{" "}
            <Link href="/admin/hubspot" className="text-primary hover:underline font-medium">
              HubSpot επαφές →
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:ml-auto">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Αναζήτηση: όνομα, email, τηλέφωνο..."
              className="pl-9 pr-9 h-10 bg-card border-white/10"
              data-testid="input-customers-search"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                aria-label="Καθαρισμός"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-white/15 hover:border-primary/40"
          disabled={!customers || customers.length === 0}
          onClick={() => {
            const rows = (customers ?? []).map(c => ({
              "ID": c.id,
              "Ονοματεπώνυμο": c.name,
              "Email": c.email,
              "Τηλέφωνο": c.phone || "",
              "Διεύθυνση": c.address || "",
              "Εγγραφή": formatDateEl(c.createdAt),
            }));
            exportToCsv(`pelates_${new Date().toISOString().slice(0,10)}.csv`, rows);
          }}
          data-testid="button-export-customers"
        >
          <Download className="w-4 h-4" />
          Εξαγωγή CSV
        </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Ονοματεπώνυμο</TableHead>
              <TableHead>Στοιχεία Επικοινωνίας</TableHead>
              <TableHead>Διεύθυνση</TableHead>
              <TableHead>Εγγραφή</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Φόρτωση...</TableCell></TableRow>
            ) : customers?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Δεν υπάρχουν πελάτες</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Δεν βρέθηκαν πελάτες με αυτή την αναζήτηση</TableCell></TableRow>
            ) : (
              filtered.map(customer => (
                <TableRow
                  key={customer.id}
                  className="border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  data-testid={`row-customer-${customer.id}`}
                >
                  <TableCell className="font-medium text-base">
                    <Link href={`/admin/customers/${customer.id}`}>
                      <a className="hover:text-primary transition-colors">{customer.name}</a>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2"><Mail className="w-3 h-3" /> {customer.email}</span>
                      {customer.phone && <span className="flex items-center gap-2"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.address ? (
                      <span className="flex items-start gap-2 text-sm text-muted-foreground max-w-xs line-clamp-2">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> {customer.address}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`}>
                      <a
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-medium transition-all"
                        data-testid={`btn-view-customer-${customer.id}`}
                      >
                        Καρτέλα <ChevronRight className="w-3.5 h-3.5" />
                      </a>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
