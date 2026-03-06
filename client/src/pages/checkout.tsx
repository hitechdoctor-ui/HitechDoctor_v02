import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { useCartStore } from "@/store/cart";
import { useCheckout } from "@/hooks/use-orders";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ArrowLeft, Loader2, Truck, Building2, CreditCard, Store } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Αντικαταβολή",
    desc: "Πληρώνετε μετρητά στον courier",
    icon: Truck,
  },
  {
    id: "bank",
    label: "Τραπεζική Κατάθεση",
    desc: "Κατάθεση σε τράπεζα",
    icon: Building2,
  },
  {
    id: "card",
    label: "Πληρωμή με Κάρτα",
    desc: "Visa, Mastercard, AMEX",
    icon: CreditCard,
  },
  {
    id: "store",
    label: "Πληρωμή στο Κατάστημα",
    desc: "Μετρητά ή κάρτα on-site",
    icon: Store,
  },
] as const;

type PaymentMethodId = typeof PAYMENT_METHODS[number]["id"];

const checkoutFormSchema = z.object({
  name: z.string().min(2, "Το όνομα είναι υποχρεωτικό"),
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().min(10, "Το τηλέφωνο είναι υποχρεωτικό"),
  address: z.string().min(5, "Η διεύθυνση είναι υποχρεωτική"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { mutateAsync: doCheckout, isPending } = useCheckout();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cod");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" }
  });

  const formatPrice = (price: string | number) => 
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(Number(price));

  const onSubmit = async (data: CheckoutFormValues) => {
    if (items.length === 0) return;

    try {
      await doCheckout({
        customer: data,
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        paymentMethod,
      });
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Σφάλμα",
        description: "Υπήρξε ένα πρόβλημα κατά την ολοκλήρωση της παραγγελίας.",
      });
    }
  };

  if (isSuccess) {
    const selected = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4">Ευχαριστούμε!</h1>
          <p className="text-xl text-muted-foreground mb-3 max-w-md">
            Η παραγγελία σας καταχωρήθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.
          </p>
          {selected && (
            <p className="text-sm text-muted-foreground mb-8">
              Τρόπος πληρωμής: <span className="text-primary font-semibold">{selected.label}</span>
            </p>
          )}
          <Link href="/">
            <Button size="lg" className="rounded-xl px-8">Επιστροφή στην Αρχική</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Ολοκλήρωση Αγοράς" description="Ολοκληρώστε την παραγγελία σας με ασφάλεια." />
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/eshop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Συνέχεια Αγορών
        </Link>

        <h1 className="text-3xl font-display font-bold mb-8">Ολοκλήρωση Αγοράς</h1>

        {items.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl">
            <p className="text-xl text-muted-foreground mb-6">Το καλάθι σας είναι άδειο.</p>
            <Link href="/eshop">
              <Button>Πάμε για ψώνια</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-7 space-y-6">

              {/* Step 1: Shipping details */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
                  Στοιχεία Αποστολής
                </h2>
                
                <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ονοματεπώνυμο</Label>
                      <Input
                        id="name"
                        data-testid="input-name"
                        placeholder="Γιώργος Παπαδόπουλος"
                        className="bg-black/20"
                        {...form.register("name")}
                      />
                      {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Τηλέφωνο</Label>
                      <Input
                        id="phone"
                        data-testid="input-phone"
                        placeholder="6912345678"
                        className="bg-black/20"
                        {...form.register("phone")}
                      />
                      {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      data-testid="input-email"
                      placeholder="giorgos@example.com"
                      className="bg-black/20"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Πλήρης Διεύθυνση</Label>
                    <Textarea
                      id="address"
                      data-testid="input-address"
                      placeholder="Οδός, Αριθμός, Τ.Κ., Πόλη"
                      className="bg-black/20 resize-none"
                      {...form.register("address")}
                    />
                    {form.formState.errors.address && <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>}
                  </div>
                </form>
              </div>

              {/* Step 2: Payment method */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
                  Τρόπος Πληρωμής
                </h2>

                <div className="grid sm:grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map(method => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        data-testid={`payment-${method.id}`}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/20 bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                          isSelected ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm", isSelected ? "text-primary" : "text-foreground")}>
                            {method.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{method.desc}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-primary ml-auto shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <Button 
                  type="submit"
                  form="checkout-form"
                  size="lg" 
                  className="w-full mt-6 h-14 text-lg bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 rounded-xl"
                  disabled={isPending}
                  data-testid="button-submit-order"
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Ολοκλήρωση Παραγγελίας
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-5">
              <div className="bg-card border border-white/5 rounded-3xl p-6 sm:p-8 sticky top-28">
                <h2 className="text-xl font-bold mb-6">Σύνοψη Παραγγελίας</h2>
                
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                  {items.map(item => (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg bg-black/40 shrink-0 overflow-hidden border border-white/5">
                        {item.product.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">{item.product.name}</h4>
                        <p className="text-muted-foreground text-xs mt-1">Αντικείμενα: {item.quantity}</p>
                        <p className="text-primary font-bold text-sm mt-1">{formatPrice(Number(item.product.price) * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Υποσύνολο</span>
                    <span>{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Μεταφορικά</span>
                    <span>Δωρεάν</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Τρόπος πληρωμής</span>
                    <span className="text-foreground font-medium">
                      {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="font-bold">Τελικό Σύνολο</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
