import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useCustomers } from "@/hooks/use-customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, MapPin, ChevronRight, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { exportToCsv, formatDateEl } from "@/lib/csv-export";

export default function AdminCustomers() {
  const { data: customers, isLoading } = useCustomers();

  const formatDate = (dateString: string) => {
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
          <p className="text-muted-foreground">Αρχείο πελατών και στοιχεία επικοινωνίας — κλικ για Καρτέλα</p>
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
            ) : (
              customers?.map(customer => (
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
