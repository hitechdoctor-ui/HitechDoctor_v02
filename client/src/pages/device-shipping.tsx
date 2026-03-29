import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BoxNowMap } from "@/components/BoxNowMap";
import type { BoxNowLockerSelected } from "@/lib/boxnow-types";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
  Package,
  Phone,
  Info,
} from "lucide-react";

function lockerLabel(s: BoxNowLockerSelected | null): string {
  if (!s) return "";
  const id = s.boxnowLockerId != null ? String(s.boxnowLockerId) : "";
  const addr = s.boxnowLockerAddressLine1 != null ? String(s.boxnowLockerAddressLine1) : "";
  const zip = s.boxnowLockerPostalCode != null ? String(s.boxnowLockerPostalCode) : "";
  return [zip, addr, id && `#${id}`].filter(Boolean).join(" · ");
}

export default function DeviceShippingPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deviceNote, setDeviceNote] = useState("");
  const [locker, setLocker] = useState<BoxNowLockerSelected | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const canSubmit =
    name.trim().length >= 2 &&
    phone.trim().length >= 10 &&
    locker != null &&
    String(locker.boxnowLockerId ?? "").length > 0;

  const handleSubmit = async () => {
    if (!locker || !canSubmit) {
      toast({
        variant: "destructive",
        title: "Συμπληρώστε τα πεδία",
        description: "Όνομα, τηλέφωνο και επιλογή BoxNow locker από τον χάρτη.",
      });
      return;
    }
    const lockerId = String(locker.boxnowLockerId ?? "");
    const lockerAddress = String(locker.boxnowLockerAddressLine1 ?? "").trim();
    const lockerPostal = locker.boxnowLockerPostalCode != null ? String(locker.boxnowLockerPostalCode).trim() : "";
    if (!lockerId || !lockerAddress) {
      toast({
        variant: "destructive",
        title: "Μη έγκυρο locker",
        description: "Επιλέξτε ξανά σημείο από τον χάρτη BoxNow.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/boxnow-dropoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          deviceNote: deviceNote.trim() || undefined,
          lockerId,
          lockerAddress,
          lockerPostalCode: lockerPostal || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; referenceCode?: string };
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: data.message ?? "Δοκιμάστε ξανά.",
        });
        return;
      }
      if (data.referenceCode) {
        setReferenceCode(data.referenceCode);
        toast({ title: "Εκδόθηκε κωδικός αναφοράς", description: data.referenceCode });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    if (!referenceCode) return;
    void navigator.clipboard.writeText(referenceCode).then(() => {
      toast({ title: "Αντιγράφηκε", description: referenceCode });
    });
  };

  return (
    <div className="min-h-screen bg-background circuit-bg flex flex-col">
      <Seo
        title="Αποστολή Συσκευής — BoxNow"
        description="Επιλέξτε BoxNow locker, συμπληρώστε τα στοιχεία σας και λάβετε κωδικό αναφοράς για την αποστολή."
      />
      <Helmet>
        <link rel="preconnect" href="https://widget-cdn.boxnow.gr" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://widget-v5.boxnow.gr" crossOrigin="anonymous" />
      </Helmet>
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <Link href="/services">
          <Button variant="ghost" size="sm" className="mb-6 gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
            Υπηρεσίες
          </Button>
        </Link>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Package className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Αποστολή Συσκευής</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Επιλέξτε <strong className="text-foreground">BoxNow Locker</strong> στον χάρτη, συμπληρώστε τα στοιχεία σας και
              εκδώστε <strong className="text-foreground">κωδικό αναφοράς HiTech</strong> — γράψτε τον καθαρά στη συσκευασία
              πριν την παράδοση στη θυρίδα.
            </p>
          </div>
        </div>

        {referenceCode ? (
          <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-6 h-6" />
                <CardTitle className="text-xl">Ο κωδικός σας εκδόθηκε</CardTitle>
              </div>
              <CardDescription>
                Αποθηκεύστε τον κωδικό. Θα λάβετε και email επιβεβαίωσης αν δώσατε διεύθυνση — το κατάστημα ενημερώνεται
                αυτόματα.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-6 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Κωδικός αναφοράς (γράψτε τον στη συσκευασία)</p>
                <p className="text-3xl sm:text-4xl font-mono font-black text-primary tracking-widest break-all">
                  {referenceCode}
                </p>
                <Button type="button" variant="outline" className="mt-4 gap-2" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                  Αντιγραφή
                </Button>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-sm text-muted-foreground">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  Συσκευάστε με ασφάλεια τη συσκευή, κλείστε καλά το δέμα και επισυνάψτε εμφανώς τον κωδικό. Στο locker
                  ακολουθήστε τις οδηγίες της BoxNow στην οθόνη ή στο app. Για επίσημο κωδικό παραγγελίας μέσω BoxNow Partner
                  API απαιτείται εταιρικό λογαριασμός — ο κωδικός HiTech είναι αριθμός αναγνώρισης για το κατάστημά μας.
                </p>
              </div>
              <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
                Νέο αίτημα
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">1. Στοιχεία επικοινωνίας</CardTitle>
                <CardDescription>Θα χρησιμοποιηθούν για επιβεβαίωση και παραλαβή.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ds-name">Ονοματεπώνυμο</Label>
                  <Input
                    id="ds-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="π.χ. Μαρία Παπαδοπούλου"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-phone">Κινητό</Label>
                  <Input
                    id="ds-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                    placeholder="698…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ds-email">Email (προαιρετικό)</Label>
                  <Input
                    id="ds-email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="για αντίγραφο κωδικού"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ds-note">Συσκευή / σημείωση (προαιρετικό)</Label>
                  <Textarea
                    id="ds-note"
                    value={deviceNote}
                    onChange={(e) => setDeviceNote(e.target.value)}
                    placeholder="π.χ. iPhone 13 — ραγισμένη οθόνη, κωδικός κλειδώματος: …"
                    rows={3}
                    className="resize-y min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">2. Επιλογή BoxNow Locker</CardTitle>
                <CardDescription>
                  Πατήστε «Επιλογή Locker BoxNow» και επιλέξτε το σημείο που σας εξυπηρετεί. Μετά την επιλογή θα εμφανιστούν τα
                  στοιχεία του locker παρακάτω.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BoxNowMap onSelect={setLocker} />
                {locker ? (
                  <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Επιλεγμένο locker</p>
                    <p className="text-sm text-foreground">{lockerLabel(locker)}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    Δεν έχετε επιλέξει ακόμα locker — ανοίξτε τον χάρτη και ολοκληρώστε την επιλογή.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">3. Έκδοση κωδικού</CardTitle>
                <CardDescription>Ο κωδικός εμφανίζεται εδώ και αποστέλλεται στο email μας (και στο δικό σας αν δώσατε).</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  size="lg"
                  className="w-full sm:w-auto gap-2"
                  disabled={!canSubmit || submitting}
                  onClick={() => void handleSubmit()}
                  data-testid="button-issue-code"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                  Έκδοση κωδικού αποστολής
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
