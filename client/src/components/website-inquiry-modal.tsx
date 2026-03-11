import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Globe, CheckCircle2, Mail, Phone, User } from "lucide-react";

const VAT = 0.24;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

const formSchema = z.object({
  firstName: z.string().min(2, "Εισάγετε το όνομά σας"),
  lastName: z.string().min(2, "Εισάγετε το επίθετό σας"),
  phone: z.string().min(10, "Εισάγετε έγκυρο αριθμό τηλεφώνου"),
  email: z.string().email("Μη έγκυρο email"),
  prepaymentRaw: z.string().optional(),
  prepaymentIncludesVat: z.boolean().default(true),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebsiteInquiryModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      prepaymentRaw: "",
      prepaymentIncludesVat: true,
      notes: "",
    },
  });

  const prepaymentRaw = form.watch("prepaymentRaw") || "";
  const prepaymentIncludesVat = form.watch("prepaymentIncludesVat");
  const rawNum = parseFloat(prepaymentRaw.replace(",", ".")) || 0;

  let net = 0;
  let vatAmt = 0;
  let gross = 0;
  if (rawNum > 0) {
    if (prepaymentIncludesVat) {
      gross = rawNum;
      net = gross / (1 + VAT);
      vatAmt = gross - net;
    } else {
      net = rawNum;
      vatAmt = net * VAT;
      gross = net + vatAmt;
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const payload: Record<string, unknown> = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
        prepaymentIncludesVat: values.prepaymentIncludesVat,
        notes: values.notes || null,
        status: "pending",
      };
      if (rawNum > 0) {
        payload.prepayment = net.toFixed(2);
      }
      return apiRequest("POST", "/api/website-inquiries", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/website-inquiries"] });
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Σφάλμα", description: "Παρακαλώ προσπαθήστε ξανά.", variant: "destructive" });
    },
  });

  function onSubmit(values: FormValues) {
    mutation.mutate(values);
  }

  function handleClose(v: boolean) {
    if (!v) {
      form.reset();
      setSubmitted(false);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            Αίτημα Κατασκευής Ιστοσελίδας
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-2">Το αίτημά σας στάλθηκε!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Θα επικοινωνήσουμε μαζί σας το συντομότερο για να συζητήσουμε το project σας.
            </p>
            <Button onClick={() => handleClose(false)} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              Κλείσιμο
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Όνομα</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input {...field} placeholder="π.χ. Γιώργος" className="pl-9" data-testid="input-inquiry-firstname" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Επίθετο</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="π.χ. Παπαδόπουλος" data-testid="input-inquiry-lastname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Τηλέφωνο</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input {...field} placeholder="69XXXXXXXX" className="pl-9" data-testid="input-inquiry-phone" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="yourname@example.com" className="pl-9" data-testid="input-inquiry-email" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Prepayment section */}
              <div className="rounded-2xl border border-white/10 bg-white/3 p-4 space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Προκαταβολή (προαιρετικό)</p>

                <FormField
                  control={form.control}
                  name="prepaymentRaw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Ποσό {prepaymentIncludesVat ? "με ΦΠΑ" : "χωρίς ΦΠΑ"} (€)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0,00"
                          inputMode="decimal"
                          data-testid="input-inquiry-prepayment"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prepaymentIncludesVat"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <FormLabel className="text-xs text-muted-foreground cursor-pointer">
                        Το ποσό περιλαμβάνει ΦΠΑ 24%
                      </FormLabel>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-inquiry-vat"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {rawNum > 0 && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Χωρίς ΦΠΑ:</span>
                      <span className="text-foreground font-semibold">{fmt(net)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">ΦΠΑ 24%:</span>
                      <span className="text-muted-foreground">{fmt(vatAmt)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold border-t border-amber-500/20 pt-1.5 mt-1.5">
                      <span className="text-amber-400">Με ΦΠΑ:</span>
                      <span className="text-amber-400">{fmt(gross)}</span>
                    </div>
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Περιγραφή Project</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Περιγράψτε τι θέλετε να φτιάξουμε..."
                        className="resize-none"
                        rows={3}
                        data-testid="textarea-inquiry-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-12 font-extrabold text-black border-0"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)", boxShadow: "0 0 20px rgba(251,191,36,0.3)" }}
                data-testid="button-inquiry-submit"
              >
                {mutation.isPending ? "Αποστολή..." : "Αποστολή Αιτήματος →"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
