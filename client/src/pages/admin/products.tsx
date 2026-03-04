import { useState, useMemo } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema } from "@shared/schema";
import { Plus, Edit, Trash2, Package, Search, X, FileText, AlignLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { RichTextEditor } from "@/components/rich-text-editor";

const formSchema = insertProductSchema.extend({
  price: z.coerce.string().min(1, "Υποχρεωτικό"),
  fullDescription: z.string().optional(),
});

type ProductFormData = z.infer<typeof formSchema>;

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [richContent, setRichContent] = useState("");
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

  const form = useForm<ProductFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "", fullDescription: "", price: "", imageUrl: "", category: "mobile" },
  });

  const openNew = () => {
    setEditingId(null);
    setRichContent("");
    form.reset({ name: "", description: "", fullDescription: "", price: "", imageUrl: "", category: "mobile" });
    setIsDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    const full = product.fullDescription ?? "";
    setRichContent(full);
    form.reset({
      name: product.name,
      description: product.description,
      fullDescription: full,
      price: String(product.price),
      imageUrl: product.imageUrl || "",
      category: product.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Είστε σίγουροι;")) {
      await deleteProduct(id);
      toast({ title: "Διαγράφηκε επιτυχώς" });
    }
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const payload = { ...data, fullDescription: richContent };
      if (editingId) {
        await updateProduct({ id: editingId, ...payload });
        toast({ title: "Ενημερώθηκε επιτυχώς" });
      } else {
        await createProduct(payload);
        toast({ title: "Δημιουργήθηκε επιτυχώς" });
      }
      setIsDialogOpen(false);
    } catch {
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
        <Button onClick={openNew} className="bg-primary text-primary-foreground" data-testid="btn-new-product">
          <Plus className="w-4 h-4 mr-2" />
          Νέο Προϊόν
        </Button>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Επεξεργασία Προϊόντος" : "Νέο Προϊόν"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
            {/* Name + Price + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 space-y-1.5">
                <Label>Όνομα Προϊόντος</Label>
                <Input className="bg-background" {...form.register("name")} data-testid="input-product-name" />
              </div>
              <div className="space-y-1.5">
                <Label>Τιμή (€)</Label>
                <Input type="number" step="0.01" className="bg-background" {...form.register("price")} data-testid="input-product-price" />
              </div>
              <div className="space-y-1.5">
                <Label>Κατηγορία</Label>
                <Controller
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-background" data-testid="select-product-category">
                        <SelectValue placeholder="Επιλογή" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile">Κινητά</SelectItem>
                        <SelectItem value="accessory">Αξεσουάρ</SelectItem>
                        <SelectItem value="repair">Επισκευή</SelectItem>
                        <SelectItem value="part">Ανταλλακτικά</SelectItem>
                        <SelectItem value="service">Υπηρεσία</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <Label>URL Εικόνας</Label>
                <Input className="bg-background" placeholder="https://..." {...form.register("imageUrl")} />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-3.5 h-3.5 text-primary" />
                <Label className="text-sm font-semibold">Σύντομη Περιγραφή</Label>
                <span className="text-[10px] text-muted-foreground/60 border border-white/10 rounded px-1.5 py-0.5">plain text</span>
              </div>
              <Textarea
                className="bg-background resize-none text-sm"
                rows={3}
                placeholder="Μικρή περιγραφή για listings, κάρτες, meta description..."
                {...form.register("description")}
                data-testid="input-product-short-desc"
              />
              <p className="text-[11px] text-muted-foreground/50">Εμφανίζεται στην κάρτα προϊόντος και στο meta description (SEO).</p>
            </div>

            {/* Full Description - Rich Text */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <Label className="text-sm font-semibold">Πλήρης Περιγραφή</Label>
                <span className="text-[10px] text-primary/70 border border-primary/20 bg-primary/5 rounded px-1.5 py-0.5">rich text editor</span>
              </div>
              <RichTextEditor
                value={richContent}
                onChange={setRichContent}
                placeholder="Γράψτε λεπτομερή περιγραφή με μορφοποίηση, λίστες, τίτλους..."
              />
              <p className="text-[11px] text-muted-foreground/50">Εμφανίζεται στη σελίδα του προϊόντος. Υποστηρίζει μορφοποίηση, λίστες, επικεφαλίδες.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/8">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Ακύρωση</Button>
              <Button type="submit" className="bg-primary text-primary-foreground" data-testid="btn-product-save">Αποθήκευση</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Search ── */}
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

      {/* ── Table ── */}
      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="w-[80px]">Εικόνα</TableHead>
              <TableHead>Όνομα</TableHead>
              <TableHead>Σύντομη Περιγραφή</TableHead>
              <TableHead>Κατηγορία</TableHead>
              <TableHead>Τιμή</TableHead>
              <TableHead className="text-right">Ενέργειες</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Φόρτωση...</TableCell></TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {search ? `Δεν βρέθηκαν αποτελέσματα για "${search}"` : "Δεν υπάρχουν προϊόντα"}
              </TableCell></TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-white/5 hover:bg-white/5" data-testid={`row-product-${product.id}`}>
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-black/50 flex items-center justify-center overflow-hidden">
                      {product.imageUrl
                        ? <img src={product.imageUrl} className="w-full h-full object-cover" alt="" />
                        : <Package className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[180px]">
                    <p className="truncate">{product.name}</p>
                    {(product as any).fullDescription && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-primary/70 mt-0.5">
                        <FileText className="w-2.5 h-2.5" />
                        πλήρης περιγραφή
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                  </TableCell>
                  <TableCell><span className="px-2 py-1 rounded bg-white/10 text-xs uppercase">{product.category}</span></TableCell>
                  <TableCell className="font-semibold text-primary">{Number(product.price).toFixed(2)} €</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(product)} data-testid={`btn-edit-product-${product.id}`}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20 hover:text-destructive" onClick={() => handleDelete(product.id)} data-testid={`btn-delete-product-${product.id}`}>
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
