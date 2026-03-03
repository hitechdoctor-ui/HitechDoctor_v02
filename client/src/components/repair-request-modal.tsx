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
import { CheckCircle2, Wrench, Smartphone, Hash, Lock, Phone, Mail, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertRepairRequestSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

type FormValues = z.infer<typeof insertRepairRequestSchema>;

interface RepairRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDeviceName?: string;
}

export function RepairRequestModal({ open, onOpenChange, defaultDeviceName = "" }: RepairRequestModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      apiRequest("POST", "/api/repair-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/repair-requests"] });
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Σφάλμα", description: "Αποτυχία υποβολής. Παρακαλώ προσπαθήστε ξανά.", variant: "destructive" });
    },
  });

  function handleClose(open: boolean) {
    if (!open) {
      setSubmitted(false);
      form.reset({ ...form.getValues(), deviceName: defaultDeviceName });
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {submitted ? (
          /* ── Success state ── */
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
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-3">

                {/* Όνομα & Επίθετο */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <User className="w-3 h-3 text-primary" />Όνομα <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Γιώργης"
                            className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm"
                            data-testid="input-first-name"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <User className="w-3 h-3 text-primary" />Επίθετο <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Παπαδόπουλος"
                            className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm"
                            data-testid="input-last-name"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Τηλέφωνο & Email */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-primary" />Κινητό <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="69XXXXXXXX"
                            type="tel"
                            className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm"
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-primary" />Email <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="name@email.com"
                            type="email"
                            className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm"
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Όνομα Συσκευής */}
                <FormField
                  control={form.control}
                  name="deviceName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3 text-primary" />Όνομα Συσκευής <span className="text-primary">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="π.χ. iPhone 15 Pro Max"
                          className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm"
                          data-testid="input-device-name"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Serial & Κωδικός */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Hash className="w-3 h-3 text-primary" />Serial Number <span className="text-primary">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="XXXXXXXXXX"
                            className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm font-mono"
                            data-testid="input-serial-number"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="deviceCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-primary" />Κωδικός Συσκευής
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="PIN / Passcode"
                            type="password"
                            className="bg-card border-white/10 focus:border-primary/40 h-9 text-sm"
                            data-testid="input-device-code"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Σημειώσεις */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
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
                  )}
                />

                {/* Privacy note */}
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <Lock className="w-2.5 h-2.5 inline mr-1 text-primary" />
                  Τα στοιχεία σας χρησιμοποιούνται αποκλειστικά για την επεξεργασία του αιτήματος επισκευής και δεν κοινοποιούνται σε τρίτους.
                </p>

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
