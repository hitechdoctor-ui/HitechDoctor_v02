import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();

  const formatPrice = (price: number | string) => 
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(price));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10 flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Το Καλάθι μου
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p>Το καλάθι σας είναι άδειο</p>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Συνέχεια αγορών
              </Button>
            </div>
          ) : (
            items.map((item) => {
              const key = `${item.product.id}__${item.selectedModel ?? ''}`;
              return (
                <div key={key} className="flex gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="w-20 h-20 bg-black/50 rounded-lg overflow-hidden shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                        {item.selectedModel && (
                          <p className="text-xs text-primary mt-0.5">{item.selectedModel}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.selectedModel)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedModel)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedModel)}
                          className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatPrice(Number(item.product.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-6 border-t border-white/10 mt-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-muted-foreground">Σύνολο</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                {formatPrice(getCartTotal())}
              </span>
            </div>
            <Link href="/checkout">
              <Button 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-primary text-primary-foreground shadow-lg shadow-primary/25"
                onClick={() => onOpenChange(false)}
              >
                Ολοκλήρωση Αγοράς
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
