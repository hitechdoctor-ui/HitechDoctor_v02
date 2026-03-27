import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { CheckCircle2, Wrench, Smartphone, Hash, Lock, Phone, Mail, User, Shield, ExternalLink } from "lucide-react";
import { apiRequest, invalidateRepairFinancialQueries } from "@/lib/queryClient";
import { insertRepairRequestSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

type FormValues = z.infer<typeof insertRepairRequestSchema>;

interface RepairRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDeviceName?: string;
}

export function RepairRequestModal({ open, onOpenChange, defaultDeviceName = "" }: RepairRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [gdprError, setGdprError] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [selectedBox, setSelectedBox] = useState<"net" | "gross">("net");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const priceNum = parseFloat(priceInput);
  const hasPrice = priceInput !== "" && !isNaN(priceNum) && priceNum > 0;
  const netPrice = hasPrice ? priceNum : 0;
  const grossPrice = hasPrice ? priceNum * 1.24 : 0;
  const agreedPrice = selectedBox === "net" ? netPrice : grossPrice;

  const fmt = (n: number) =>
    n.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  const form = useForm<FormValues>({
    resolver: zodResolver(insertRepairRequestSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      deviceName: defaultDeviceName,
      serialNumber: "",
      deviceCode: "",
      notes: "",
      status: "pending",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiRequest("POST", "/api/repair-requests", {
        ...data,
        ...(hasPrice ? { price: netPrice.toFixed(2), priceIncludesVat: selectedBox === "gross" } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests"] });
      invalidateRepairFinancialQueries(queryClient);
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Σφάλμα", description: "Αποτυχία υποβολής. Παρακαλώ προσπαθήστε ξανά.", variant: "destructive" });
    },
  });

  function handleClose(open: boolean) {
    if (!open) {
      setSubmitted(false);
      setGdprConsent(false);
      setGdprError(false);
      setPriceInput("");
      setSelectedBox("net");
      form.reset({ ...form.getValues(), deviceName: defaultDeviceName });
    }
    onOpenChange(open);
  }

  function handleSubmit(data: FormValues) {
    if (!gdprConsent) {
      setGdprError(true);
      return;
    }
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">Αίτημα Επισκευής Υποβλήθηκε!</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Λάβαμε το αίτημά σας. Θα επικοινωνήσουμε μαζί σας το συντομότερο για να κλείσουμε ραντεβού.
              </p>
            </div>
            <Button
              onClick={() => handleClose(false)}
              className="mt-2 border-0"
              style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))" }}
            >
              Κλείσιμο
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="mb-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Wrench className="w-4.5 h-4.5 text-primary" />
                </div>
                <DialogTitle className="text-lg font-display font-bold">Αίτημα Επισκευής</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-muted-foreground">
                Συμπληρώστε τα στοιχεία σας και θα επικοινωνήσουμε άμεσα μαζί σας.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">

                {/* Όνομα & Επίθετο */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <User className="w-3 h-3 text-primary" />Όνομα <span className="text-primary">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Γιώργης" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm" data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <User className="w-3 h-3 text-primary" />Επίθετο <span className="text-primary">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Παπαδόπουλος" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm" data-testid="input-last-name" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>

                {/* Τηλέφωνο & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-primary" />Κινητό <span className="text-primary">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="69XXXXXXXX" type="tel" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm" data-testid="input-phone" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-primary" />Email <span className="text-primary">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="name@email.com" type="email" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm" data-testid="input-email" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>

                {/* Όνομα Συσκευής */}
                <FormField control={form.control} name="deviceName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3 text-primary" />Όνομα Συσκευής <span className="text-primary">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="π.χ. iPhone 15 Pro Max" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm" data-testid="input-device-name" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                {/* Serial & Κωδικός */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={form.control} name="serialNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-primary" />Serial Number <span className="text-primary">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XXXXXXXXXX" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm font-mono" data-testid="input-serial-number" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="deviceCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-primary" />Κωδικός Συσκευής
                      </FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} placeholder="PIN / Passcode" type="password" className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm" data-testid="input-device-code" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )} />
                </div>

                {/* ── Price + VAT boxes ── */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 block">Τιμή Επισκευής (προαιρετικό)</label>

                  {/* Top row: 2 selectable boxes */}
                  <div className="grid grid-cols-2 gap-2">

                    {/* Box 1: Χωρίς ΦΠΑ — editable input */}
                    <button
                      type="button"
                      onClick={() => setSelectedBox("net")}
                      data-testid="box-price-net"
                      className={`rounded-xl border-2 py-3 px-3 flex flex-col items-center gap-1 transition-all cursor-pointer focus-within:ring-0 ${
                        selectedBox === "net"
                          ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(0,210,200,0.20)]"
                          : "border-white/10 bg-card hover:border-white/25"
                      }`}
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">Χωρίς ΦΠΑ</span>
                      <div className="flex items-center gap-1 w-full justify-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          onFocus={() => setSelectedBox("net")}
                          placeholder="0"
                          data-testid="input-repair-price"
                          className={`w-full bg-transparent text-center text-2xl font-black outline-none placeholder:text-muted-foreground/25 ${selectedBox === "net" ? "text-primary" : "text-foreground"}`}
                          style={{ WebkitAppearance: "none", MozAppearance: "textfield" } as object}
                        />
                        <span className={`text-2xl font-black select-none ${selectedBox === "net" ? "text-primary" : "text-muted-foreground"}`}>€</span>
                      </div>
                    </button>

                    {/* Box 2: Με ΦΠΑ — auto-calculated, selectable */}
                    <button
                      type="button"
                      onClick={() => setSelectedBox("gross")}
                      data-testid="box-price-gross"
                      className={`rounded-xl border-2 py-3 px-3 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        selectedBox === "gross"
                          ? "border-primary bg-primary/10 shadow-[0_0_16px_rgba(0,210,200,0.20)]"
                          : "border-white/10 bg-card hover:border-white/25"
                      }`}
                    >
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">Με ΦΠΑ (24%)</span>
                      <div className="flex items-center gap-1 justify-center">
                        <span className={`text-2xl font-black ${selectedBox === "gross" ? "text-primary" : "text-foreground"}`}>
                          {hasPrice ? grossPrice.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0"}
                        </span>
                        <span className={`text-2xl font-black select-none ${selectedBox === "gross" ? "text-primary" : "text-muted-foreground"}`}>€</span>
                      </div>
                    </button>
                  </div>

                  {/* Bottom: read-only agreed price */}
                  <div className="rounded-xl border border-white/10 bg-card/60 py-3 px-4 flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 select-none">
                      Τελική Συμφωνηθείσα Τιμή
                    </span>
                    <span className={`text-xl font-black transition-colors ${hasPrice ? "text-primary" : "text-muted-foreground/30"}`}>
                      {hasPrice ? fmt(agreedPrice) : "—"}
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 select-none">
                      {hasPrice ? (selectedBox === "net" ? "χωρίς ΦΠΑ" : "με ΦΠΑ 24%") : "επιλέξτε τιμή"}
                    </span>
                  </div>
                </div>

                {/* Σημειώσεις */}
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">Περιγραφή Προβλήματος</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Περιγράψτε το πρόβλημα της συσκευής σας..."
                        className="bg-card border-white/10 focus:border-primary/40 text-sm resize-none h-20"
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )} />

                {/* GDPR */}
                <div className={`rounded-xl p-3.5 border transition-colors ${gdprError ? "bg-red-500/5 border-red-500/30" : gdprConsent ? "bg-primary/5 border-primary/25" : "bg-white/3 border-white/10"}`}>
                  <label className="flex items-start gap-3 cursor-pointer select-none" htmlFor="gdpr-consent">
                    <div className="mt-0.5 shrink-0">
                      <input id="gdpr-consent" type="checkbox" checked={gdprConsent} onChange={(e) => { setGdprConsent(e.target.checked); if (e.target.checked) setGdprError(false); }} className="sr-only" data-testid="checkbox-gdpr" />
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${gdprConsent ? "bg-primary border-primary" : gdprError ? "border-red-400 bg-red-500/10" : "border-white/30 bg-card"}`}>
                        {gdprConsent && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        <Shield className="w-2.5 h-2.5 inline mr-1 text-primary" />
                        Επιτρέπω την επεξεργασία των δεδομένων μου για τους σκοπούς της επισκευής και έχω ενημερωθεί για την ανάγκη λήψης αντιγράφων ασφαλείας.{" "}
                        <Link href="/oroi-episkeuis" className="text-primary hover:underline inline-flex items-center gap-0.5" target="_blank" onClick={(e) => e.stopPropagation()}>
                          Διαβάστε τους Όρους & GDPR
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </p>
                      {gdprError && (
                        <p className="text-[10px] text-red-400 mt-1 font-medium">Απαιτείται η αποδοχή των όρων για να συνεχίσετε.</p>
                      )}
                    </div>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full h-11 font-semibold border-0 mt-1"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 20px rgba(0,210,200,0.25)" }}
                  data-testid="button-submit-repair"
                >
                  {mutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Υποβολή...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Υποβολή Αιτήματος Επισκευής
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
