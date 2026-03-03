import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Tag, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function EShop() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const { data: products, isLoading } = useProducts(activeCategory || undefined);
  const addItem = useCartStore(state => state.addItem);
  const { toast } = useToast();

  const categories = [
    { id: "", label: "Όλα" },
    { id: "mobile", label: "Κινητά" },
    { id: "accessory", label: "Αξεσουάρ" },
    { id: "part", label: "Ανταλλακτικά" },
  ];

  const formatPrice = (price: string | number) => 
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(price));

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast({
      title: "Προστέθηκε στο καλάθι",
      description: `${product.name} προστέθηκε επιτυχώς!`,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo 
        title="eShop" 
        description="Ανακαλύψτε κινητά, αξεσουάρ και ανταλλακτικά κορυφαίας ποιότητας στις καλύτερες τιμές." 
      />
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Κατάστημα</h1>
            <p className="text-muted-foreground">Βρείτε ακριβώς αυτό που ψάχνετε για τη συσκευή σας.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-card p-2 rounded-xl border border-white/5">
            <Filter className="w-4 h-4 text-muted-foreground ml-2 mr-1 hidden sm:block" />
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat.id 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-card rounded-2xl p-4 border border-white/5">
                <Skeleton className="w-full aspect-square rounded-xl mb-4 bg-white/5" />
                <Skeleton className="h-6 w-3/4 mb-2 bg-white/5" />
                <Skeleton className="h-4 w-1/2 mb-4 bg-white/5" />
                <Skeleton className="h-10 w-full rounded-lg bg-white/5" />
              </div>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-24 glass-panel rounded-3xl border-dashed">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Δεν βρέθηκαν προϊόντα</h3>
            <p className="text-muted-foreground">Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map(product => (
              <div 
                key={product.id} 
                className="bg-card rounded-2xl p-4 border border-white/5 hover:border-primary/30 tech-glow flex flex-col group"
              >
                <div className="relative w-full aspect-square rounded-xl bg-black/40 mb-4 overflow-hidden">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="w-10 h-10 mb-2 opacity-20" />
                      <span className="text-xs">No image</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-background/80 backdrop-blur text-xs font-bold px-2 py-1 rounded border border-white/10 uppercase tracking-wider text-primary">
                    {product.category}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold line-clamp-1 mb-1" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {product.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                    {formatPrice(product.price)}
                  </span>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    size="icon" 
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
