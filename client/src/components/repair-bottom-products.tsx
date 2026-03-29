import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Shield, Package, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@shared/schema";

interface Props {
  /** "screen" = τζαμάκια πρώτα, μετά θήκες | "other" = θήκες + τζαμάκια μαζί */
  serviceType?: "screen" | "other";
}

function useAccessoryProducts(subcategory: string) {
  return useQuery<Product[]>({
    queryKey: ["/api/products", "accessory", subcategory],
    queryFn: () =>
      fetch(`/api/products?category=accessory&subcategory=${subcategory}`).then((r) => r.json()),
    staleTime: 5 * 60 * 1000,
  });
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/eshop/${(product as any).slug || product.id}`}>
      <div className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/8 transition-all duration-200 overflow-hidden cursor-pointer h-full">
        {(product as any).imageUrl ? (
          <div className="aspect-square bg-muted/30 flex items-center justify-center p-3">
            <img
              src={(product as any).imageUrl}
              alt={product.name}
              className="h-24 w-24 object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.target as HTMLImageElement).parentElement!.style.display = "none";
              }}
            />
          </div>
        ) : (
          <div className="aspect-square bg-muted/20 flex items-center justify-center">
            <Package className="w-10 h-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </p>
          <p className="text-base font-extrabold text-primary mt-auto">
            €{product.price}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ProductRow({
  products,
  label,
  icon: Icon,
  eshopHref,
}: {
  products: Product[];
  label: string;
  icon: React.ElementType;
  eshopHref: string;
}) {
  if (products.length === 0) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">{label}</h3>
        </div>
        <Link href={eshopHref}>
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary gap-1 h-7 px-2">
            Δείτε όλα <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export function RepairBottomProducts({ serviceType = "screen" }: Props) {
  const { data: screenProtectors = [] } = useAccessoryProducts("screen-protectors");
  const { data: cases = [] } = useAccessoryProducts("cases");

  const hasAny = screenProtectors.length > 0 || cases.length > 0;
  if (!hasAny) return null;

  return (
    <section className="mt-12 border-t border-border pt-10 pb-2 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-base font-display font-bold text-foreground">
          {serviceType === "screen" ? "Προστατέψτε τη νέα σας οθόνη" : "Αξεσουάρ για τη συσκευή σας"}
        </h2>
      </div>

      {serviceType === "screen" ? (
        <>
          <ProductRow
            products={screenProtectors}
            label="Τζάμια Προστασίας"
            icon={Shield}
            eshopHref="/eshop?tab=screen-protectors"
          />
          <ProductRow
            products={cases}
            label="Θήκες Προστασίας"
            icon={Package}
            eshopHref="/eshop?tab=cases"
          />
        </>
      ) : (
        <>
          <ProductRow
            products={cases}
            label="Θήκες Προστασίας"
            icon={Package}
            eshopHref="/eshop?tab=cases"
          />
          <ProductRow
            products={screenProtectors}
            label="Τζάμια Προστασίας"
            icon={Shield}
            eshopHref="/eshop?tab=screen-protectors"
          />
        </>
      )}
    </section>
  );
}
