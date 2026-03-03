import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const { mutateAsync: updateStatus } = useUpdateOrderStatus();
  const { toast } = useToast();

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateStatus({ id, status });
      toast({ title: "Η κατάσταση ενημερώθηκε" });
    } catch (e) {
      toast({ variant: "destructive", title: "Σφάλμα κατά την ενημέρωση" });
    }
  };

  const formatPrice = (price: string | number) => 
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(price));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('el-GR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <Seo title="Διαχείριση Παραγγελιών" description="Admin" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Παραγγελίες</h1>
        <p className="text-muted-foreground">Παρακολούθηση και διεκπεραίωση παραγγελιών eShop</p>
      </div>

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Ημερομηνία</TableHead>
              <TableHead>Πελάτης</TableHead>
              <TableHead>Σύνολο</TableHead>
              <TableHead>Κατάσταση</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Φόρτωση...</TableCell></TableRow>
            ) : orders?.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Δεν υπάρχουν παραγγελίες</TableCell></TableRow>
            ) : (
              orders?.map(order => (
                <TableRow key={order.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-mono text-muted-foreground">#{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>Πελάτης #{order.customerId} (Δείτε στο CRM)</TableCell>
                  <TableCell className="font-bold">{formatPrice(order.totalAmount)}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={order.status} 
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="w-[140px] bg-background border-white/10 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <span className="flex items-center gap-2 text-amber-500">Εκκρεμεί</span>
                        </SelectItem>
                        <SelectItem value="completed">
                          <span className="flex items-center gap-2 text-green-500">Ολοκληρώθηκε</span>
                        </SelectItem>
                        <SelectItem value="cancelled">
                          <span className="flex items-center gap-2 text-red-500">Ακυρώθηκε</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
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
