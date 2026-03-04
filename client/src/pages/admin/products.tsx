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
import { Plus, Edit, Trash2, Package, Search, X, FileText, AlignLeft, ImagePlus, GripVertical, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { RichTextEditor } from "@/components/rich-text-editor";

const formSchema = insertProductSchema.extend({
  price: z.coerce.string().min(1, "Υποχρεωτικό"),
  fullDescription: z.string().optional(),
});

type ProductFormData = z.infer<typeof formSchema>;

// ── Extra Images Manager ─────────────────────────────────────────────────────
function ExtraImagesManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState("");

  const addImage = () => {
    const url = inputVal.trim();
    if (!url) return;
    if (images.includes(url)) {
      setInputVal("");
      return;
    }
    onChange([...images, url]);
    setInputVal("");
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  const moveDown = (idx: number) => {
    if (idx === images.length - 1) return;
    const next = [...images];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Gallery thumbnails */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((url, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-background border border-white/10 group"
            >
              {/* Drag handle aesthetic */}
              <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />

              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg bg-black/40 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              {/* URL - truncated */}
              <p className="flex-1 text-xs text-muted-foreground/70 truncate min-w-0 font-mono">
                {url}
              </p>

              {/* Position badge */}
              <span className="text-[9px] font-bold text-muted-foreground/40 shrink-0">
                #{idx + 1}
                {idx === 0 && (
                  <Star className="inline w-2.5 h-2.5 text-primary/50 ml-1" />
                )}
              </span>

              {/* Up/Down */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="text-[10px] leading-none text-muted-foreground/50 hover:text-foreground disabled:opacity-20 px-1"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(idx)}
                  disabled={idx === images.length - 1}
                  className="text-[10px] leading-none text-muted-foreground/50 hover:text-foreground disabled:opacity-20 px-1"
                >
                  ▼
                </button>
              </div>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-muted-foreground/50 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new URL row */}
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
          placeholder="https://... ή /images/photo.webp"
          className="bg-background text-sm flex-1"
          data-testid="input-extra-image-url"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addImage}
          disabled={!inputVal.trim()}
          className="shrink-0 gap-1.5 border-white/15 hover:border-primary/40 hover:text-primary"
          data-testid="btn-add-extra-image"
        >
          <ImagePlus className="w-4 h-4" />
          Προσθήκη
        </Button>
      </div>

      {images.length === 0 && (
        <p className="text-[11px] text-muted-foreground/40 italic">
          Δεν έχουν προστεθεί επιπλέον φωτογραφίες ακόμη.
        </p>
      )}

      <p className="text-[11px] text-muted-foreground/50">
        Η πρώτη (#1) εμφανίζεται κύρια στο gallery. Χρησιμοποιήστε ▲▼ για αλλαγή σειράς.
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [richContent, setRichContent] = useState("");
  const [extraImages, setExtraImages] = useState<string[]>([]);
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
    setExtraImages([]);
    form.reset({ name: "", description: "", fullDescription: "", price: "", imageUrl: "", category: "mobile" });
    setIsDialogOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product.id);
    const full = product.fullDescription ?? "";
    setRichContent(full);
    setExtraImages(product.images ?? []);
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
      const payload = {
        ...data,
        fullDescription: richContent,
        images: extraImages.length > 0 ? extraImages : null,
      };
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

      {/* ── Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Επεξεργασία Προϊόντος" : "Νέο Προϊόν"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">

            {/* ── Name + Price + Category ── */}
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
              <div className="sm:col-span-1" />
            </div>

            {/* ── Images Section ── */}
            <div className="rounded-2xl border border-white/10 bg-white/2 p-4 space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-white/8">
                <ImagePlus className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Φωτογραφίες Προϊόντος</h3>
              </div>

              {/* Cover image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="space-y-1.5">
                  <Label className="text-xs">
                    Κύρια Φωτογραφία (Cover)
                    <span className="ml-1.5 text-[9px] text-yellow-400/80 border border-yellow-400/20 bg-yellow-400/5 rounded px-1.5 py-0.5">κύρια</span>
                  </Label>
                  <Input
                    className="bg-background text-sm"
                    placeholder="https://... ή /images/photo.webp"
                    {...form.register("imageUrl")}
                    data-testid="input-product-image"
                  />
                  <p className="text-[10px] text-muted-foreground/50">Εμφανίζεται στη λίστα και στην κάρτα προϊόντος.</p>
                </div>

                {/* Cover preview */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground/60">Preview</Label>
                  <div className="w-full h-28 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center">
                    {form.watch("imageUrl") ? (
                      <img
                        src={form.watch("imageUrl") ?? ""}
                        alt="preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Package className="w-8 h-8 text-muted-foreground/20" />
                    )}
                  </div>
                </div>
              </div>

              {/* Extra images */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1.5">
                  Επιπλέον Φωτογραφίες (Gallery)
                  <span className="text-[9px] text-primary/70 border border-primary/20 bg-primary/5 rounded px-1.5 py-0.5">
                    {extraImages.length} φωτ.
                  </span>
                </Label>
                <ExtraImagesManager images={extraImages} onChange={setExtraImages} />
              </div>
            </div>

            {/* ── Short Description ── */}
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

            {/* ── Full Description ── */}
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
                    <div className="flex items-center gap-1.5">
                      <div className="w-10 h-10 rounded bg-black/50 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl
                          ? <img src={product.imageUrl} className="w-full h-full object-cover" alt="" />
                          : <Package className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      {(product.images ?? []).length > 0 && (
                        <span className="text-[9px] text-primary/60 font-semibold">
                          +{(product.images ?? []).length}
                        </span>
                      )}
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
