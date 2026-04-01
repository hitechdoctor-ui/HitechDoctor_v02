import { useState } from "react";
import { Seo } from "@/components/seo";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Search, Package, Wrench, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { Link } from "wouter";

type Step = { label: string; state: "done" | "current" | "pending" };

type Result =
  | {
      ok: true;
      kind: "order" | "repair";
      ticket: string;
      status: string;
      statusLabel: string;
      cancelled: boolean;
      deviceName?: string;
      steps: Step[];
      progressPercent: number;
    }
  | null;

export default function CheckStatusPage() {
  const [ticketId, setTicketId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/public/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: ticketId.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message ?? "Δεν βρέθηκε καταχώρηση.");
        return;
      }
      setResult(data);
    } catch {
      setError("Σφάλμα δικτύου. Δοκιμάστε ξανά.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Seo
        title="Έλεγχος κατάστασης παραγγελίας / επισκευής"
        description="Εισάγετε Ticket ID και email για να δείτε την πρόοδο."
      />

      <div className="max-w-lg mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary font-display font-bold text-xl hover:opacity-90">
            HiTech Doctor
          </Link>
          <h1 className="mt-6 text-2xl md:text-3xl font-display font-bold text-foreground">
            Έλεγχος κατάστασης
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Παραγγελία eShop (<span className="font-mono text-xs">ORD-…</span>) ή αίτημα επισκευής (
            <span className="font-mono text-xs">REPR-…</span>)
          </p>
        </div>

        <Card className="border-white/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Αναζήτηση
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket">Αριθμός Παραγγελίας / Ticket ID</Label>
                <Input
                  id="ticket"
                  placeholder="π.χ. ORD-12 ή REPR-45"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="font-mono"
                  autoComplete="off"
                  data-testid="check-status-ticket"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Το email που δώσατε στην παραγγελία / αίτημα"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  data-testid="check-status-email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Αναζήτηση…" : "Αναζήτηση"}
              </Button>
            </form>

            {error && (
              <p className="mt-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {result.kind === "order" ? (
                  <Package className="w-4 h-4" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                <span>{result.kind === "order" ? "Παραγγελία eShop" : "Αίτημα επισκευής"}</span>
              </div>
              <CardTitle className="text-xl font-mono text-primary">{result.ticket}</CardTitle>
              {result.deviceName && (
                <p className="text-sm text-muted-foreground">{result.deviceName}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Κατάσταση
                </p>
                <p className="text-lg font-semibold text-foreground">{result.statusLabel}</p>
              </div>

              {result.cancelled ? (
                <p className="text-sm text-amber-400/90 border border-amber-400/20 rounded-lg px-3 py-2 bg-amber-400/5">
                  Αυτή η καταχώρηση έχει ακυρωθεί.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Πρόοδος</span>
                      <span>{result.progressPercent}%</span>
                    </div>
                    <Progress value={result.progressPercent} className="h-2" />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Στάδια
                    </p>
                    <ol className="space-y-2">
                      {result.steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-sm"
                        >
                          {step.state === "done" && (
                            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                          )}
                          {step.state === "current" && (
                            <Circle className="w-5 h-5 text-primary fill-primary/30 shrink-0" />
                          )}
                          {step.state === "pending" && (
                            <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                          )}
                          <span
                            className={
                              step.state === "current"
                                ? "font-semibold text-primary"
                                : step.state === "done"
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            }
                          >
                            {step.label}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <p className="text-center mt-10 text-sm text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            ← Επιστροφή στην αρχική
          </Link>
        </p>
      </div>
    </div>
  );
}
