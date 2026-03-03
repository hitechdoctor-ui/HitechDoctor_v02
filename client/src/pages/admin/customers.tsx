import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useCustomers } from "@/hooks/use-customers";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Phone, MapPin } from "lucide-react";

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
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Πελατολόγιο (CRM)</h1>
        <p className="text-muted-foreground">Αρχείο πελατών και στοιχεία επικοινωνίας</p>
      </div>

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>Ονοματεπώνυμο</TableHead>
              <TableHead>Στοιχεία Επικοινωνίας</TableHead>
              <TableHead>Διεύθυνση</TableHead>
              <TableHead>Εγγραφή</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Φόρτωση...</TableCell></TableRow>
            ) : customers?.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Δεν υπάρχουν πελάτες</TableCell></TableRow>
            ) : (
              customers?.map(customer => (
                <TableRow key={customer.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-base">{customer.name}</TableCell>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
