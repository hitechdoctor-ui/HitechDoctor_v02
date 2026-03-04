import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Plus, Edit, Trash2, Package, Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertProductSchema.extend({
  price: z.coerce.string().min(1, "Υποχρεωτικό"),
});

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subcategory ?? "").toLowerCase().includes(q) ||
        String(p.price).includes(q)
    );
  }, [products, search]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", price: "", imageUrl: "", category: "mobile" }
  });

  const openNew = () => {
    setEditingId(null);
    form.reset({ name: "", description: "", price: "", imageUrl: "", category: "mobile" });
    setIsDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    form.reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl || "",
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if(confirm("Είστε σίγουροι;")) {
      await deleteProduct(id);
      toast({ title: "Διαγράφηκε επιτυχώς" });
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await updateProduct({ id: editingId, ...data });
        toast({ title: "Ενημερώθηκε επιτυχώς" });
      } else {
        await createProduct(data);
        toast({ title: "Δημιουργήθηκε επιτυχώς" });
      }
      setIsDialogOpen(false);
    } catch (e) {
      toast({ variant: "destructive", title: "Σφάλμα", description: "Αποτυχία αποθήκευσης" });
    }
  };

  return (
    <AdminLayout>
      <Seo title="Διαχείριση Προϊόντων" description="Admin" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Προϊόντα</h1>
          <p className="text-muted-foreground">Διαχειριστείτε τον κατάλογο προϊόντων σας</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Button onClick={openNew} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Νέο Προϊόν
          </Button>
          <DialogContent className="bg-card border-white/10 sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Επεξεργασία" : "Νέο Προϊόν"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label>Όνομα</Label>
                  <Input className="bg-background" {...form.register("name")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Περιγραφή</Label>
                  <Textarea className="bg-background resize-none" {...form.register("description")} />
                </div>
                <div className="space-y-2">
                  <Label>Τιμή (€)</Label>
                  <Input type="number" step="0.01" className="bg-background" {...form.register("price")} />
                </div>
                <div className="space-y-2">
                  <Label>Κατηγορία</Label>
                  <Controller
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Επιλογή" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile">Κινητά</SelectItem>
                          <SelectItem value="accessory">Αξεσουάρ</SelectItem>
                          <SelectItem value="part">Ανταλλακτικά</SelectItem>
                          <SelectItem value="service">Υπηρεσία</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>URL Εικόνας</Label>
                  <Input className="bg-background" placeholder="https://..." {...form.register("imageUrl")} />
                  <p className="text-xs text-muted-foreground">Αφήστε κενό για προεπιλογή</p>
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="w-full sm:w-auto">Αποθήκευση</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Search bar ── */}
      <div className="mb-4 flex items-center gap-2 px-3 h-10 rounded-xl border border-white/10 bg-card hover:border-white/20 focus-within:border-primary/40 focus-within:shadow-[0_0_0_2px_rgba(0,210,200,0.1)] transition-all max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Αναζήτηση προϊόντος, κατηγορίας, τιμής…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          data-testid="input-product-search"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[80px]">Εικόνα</TableHead>
              <TableHead>Όνομα</TableHead>
              <TableHead>Κατηγορία</TableHead>
              <TableHead>Τιμή</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Φόρτωση...</TableCell></TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                {search ? `Δεν βρέθηκαν αποτελέσματα για "${search}"` : "Δεν υπάρχουν προϊόντα"}
              </TableCell></TableRow>
            ) : (
              filteredProducts.map(product => (
                <TableRow key={product.id} className="border-white/5 hover:bg-white/5">
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-black/50 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell><span className="px-2 py-1 rounded bg-white/10 text-xs uppercase">{product.category}</span></TableCell>
                  <TableCell>{Number(product.price).toFixed(2)} €</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
