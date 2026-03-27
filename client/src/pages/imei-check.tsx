import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ExternalLink,
  Loader2,
  Search,
  Shield,
  Sparkles,
  Hash,
  Phone,
  CheckCircle2,
  Ban,
  Lock,
  Calendar,
  ShoppingBag,
  BookOpen,
  Fingerprint,
  Info,
  Wand2,
} from "lucide-react";
import { SiApple } from "react-icons/si";
import { cn } from "@/lib/utils";

const GLASS =
  "rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_48px_rgba(0,0,0,0.45)]";

const DEMO_DEVICE = {
  model: "iPhone 15 Pro",
  capacity: "256 GB",
  color: "Natural Titanium",
  icloudOn: true,
  serial: "F2LQ7XXXXXX",
  carrier: "—",
  blacklist: "Δεν ελέγχθηκε",
  warranty: "—",
  purchase: "—",
} as const;

const SAMPLE_IMEI = "353456789012347";

const STEPS = [
  {
    n: 1,
    title: "Βρείτε το IMEI",
    body: "Καλέστε *#06# στην κλήση ή δείτε Ρυθμίσεις → Γενικά → Σχετικά → IMEI.",
    icon: Phone,
  },
  {
    n: 2,
    title: "Εισάγετε τον αριθμό",
    body: "Πληκτρολογήστε τους 15 ψηφία στο πεδίο και πατήστε Έλεγχος.",
    icon: Hash,
  },
  {
    n: 3,
    title: "Δείτε τα στοιχεία",
    body: "Εμφανίζονται μοντέλο, χωρητικότητα, iCloud και άλλα (σε πλήρη λειτουργία).",
    icon: CheckCircle2,
  },
] as const;

const SERVICE_TILES = [
  {
    title: "Blacklist",
    desc: "Έλεγχος αν η συσκευή έχει δηλωθεί κλεμμένη σε δίκτυα.",
    icon: Ban,
    tone: "text-rose-300",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
  {
    title: "SIM lock & carrier",
    desc: "Κατάσταση κλειδώματος δικτύου και φορέας.",
    icon: Lock,
    tone: "text-amber-300",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "iPhone / Apple",
    desc: "Στοιχεία συμβατά με καταλόγους Apple & TAC.",
    icon: SiApple,
    tone: "text-zinc-200",
    bg: "bg-zinc-500/10 border-zinc-500/20",
  },
  {
    title: "Εγγύηση & αγορά",
    desc: "Ημερομηνίες εγγύησης και ιστορικό όπου είναι διαθέσιμο.",
    icon: Calendar,
    tone: "text-cyan-300",
    bg: "bg-cyan-500/10 border-cyan-500/20",
  },
] as const;

function normalizeImeiDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

export default function ImeiCheckPage() {
  const [location] = useLocation();
  const [imei, setImei] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!location.startsWith("/services/imei-check")) return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("imei");
    if (raw) {
      const d = normalizeImeiDigits(raw);
      if (d.length > 0) setImei(d);
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const digits = normalizeImeiDigits(imei);
    if (digits.length !== 15) {
      setError("Εισάγετε έγκυρο IMEI 15 ψηφίων.");
      setShowResult(false);
      return;
    }
    setLoading(true);
    setShowResult(false);
    window.setTimeout(() => {
      setLoading(false);
      setShowResult(true);
    }, 1400);
  };

  const digitsForResult = normalizeImeiDigits(imei);
  const tac = showResult && digitsForResult.length >= 8 ? digitsForResult.slice(0, 8) : "—";

  return (
    <div className="min-h-screen bg-[#060607] text-zinc-100 selection:bg-cyan-500/30">
      <Seo
        title="IMEI Check — Δωρεάν έλεγχος συσκευής (TAC, μοντέλο, iCloud)"
        description="Έλεγχος IMEI 15 ψηφίων: μοντέλο, χωρητικότητα, iCloud, TAC. Οδηγίες *#06*, συμβουλές για μεταχειρισμένα. HiTech Doctor — Apple Expert Hub (demo εμφάνιση)."
        url="https://hitechdoctor.com/services/imei-check"
      />
      <Helmet>
        <link rel="canonical" href="https://hitechdoctor.com/services/imei-check" />
      </Helmet>

      <Navbar />

      {/* IMEI φόρμα + αναζήτηση πάντα στην κορυφή (κολλητό κατά το scroll) */}
      <div className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#060607]/92 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="container relative mx-auto max-w-6xl px-4 py-4 md:py-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6">
            <div className="min-w-0 shrink-0 md:max-w-xs">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/90">
                IMEI Check
              </p>
              <h2 className="font-display text-lg font-bold tracking-tight text-white md:text-xl">
                Εισάγετε το IMEI
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                15 ψηφία · *#06# ή Ρυθμίσεις → Γενικά → Σχετικά
              </p>
            </div>
            <form onSubmit={handleSubmit} className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="imei-input-page" className="sr-only">
                IMEI 15 ψηφίων
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
                <Input
                  id="imei-input-page"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="π.χ. 353456789012347"
                  value={imei}
                  onChange={(e) => {
                    setImei(normalizeImeiDigits(e.target.value));
                    setError(null);
                  }}
                  className="h-12 min-h-12 flex-1 rounded-xl border-white/12 bg-white/[0.07] px-4 text-base tracking-widest text-white placeholder:text-zinc-600 focus-visible:border-cyan-400/40 focus-visible:ring-cyan-400/20 md:text-lg"
                  aria-invalid={!!error}
                  aria-describedby={error ? "imei-error-page" : undefined}
                />
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-xl border-0 bg-gradient-to-r from-violet-500 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.3)] hover:from-violet-400 hover:to-fuchsia-500 disabled:opacity-70 sm:min-w-[132px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Έλεγχος…
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4 opacity-90" />
                        Check IMEI
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-12 rounded-xl border-white/15 bg-white/[0.04] text-zinc-300 hover:bg-white/10"
                    onClick={() => {
                      setImei(SAMPLE_IMEI);
                      setError(null);
                    }}
                  >
                    <Wand2 className="mr-2 h-3.5 w-3.5" />
                    Δείγμα
                  </Button>
                </div>
              </div>
              {error && (
                <p id="imei-error-page" className="text-xs text-amber-400/90" role="alert">
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[120%] -translate-x-1/2 rounded-full opacity-35 blur-[120px]"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[60%] translate-x-1/4 opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(ellipse, rgba(0,200,220,0.25) 0%, transparent 70%)" }}
        />
      </div>

      <main className="relative">
        <div className="container relative mx-auto max-w-6xl px-4 py-12 md:py-16">
          <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
            <Link href="/services" className="hover:text-primary transition-colors">
              Υπηρεσίες
            </Link>
            <span>/</span>
            <Link href="/apple-service" className="hover:text-primary transition-colors">
              Expert Hub
            </Link>
            <span>/</span>
            <span className="text-zinc-300">IMEI Check</span>
          </nav>

          <div className="mb-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12">
            <div>
              <div className="mb-4 inline-flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  IMEI Check Service
                </span>
                <Badge className="border-0 bg-emerald-500/15 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Δωρεάν εργαλείο
                </Badge>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[2.65rem] lg:leading-tight">
                Έλεγχος IMEI συσκευής
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400 md:text-base">
                Κάθε κινητό, modem ή συσκευή με ενσωματωμένο modem έχει μοναδικό{" "}
                <strong className="font-semibold text-zinc-300">15ψήφιο IMEI</strong>. Με βάση τον αριθμό
                μπορείτε να δείτε στοιχεία για τη συσκευή — μάρκα, μοντέλο, TAC (Type Approval Code από τα
                πρώτα ψηφία) και πολλά ακόμη όταν συνδεθεί πραγματική υπηρεσία έρευνας.
              </p>
              <p className="mt-3 text-sm text-zinc-500">
                Η λειτουργία παρακάτω εμφανίζει{" "}
                <span className="text-zinc-400">επίδειξη (demo)</span> — τα δεδομένα αποτελέσματος είναι
                δείγματα· για πλήρη blacklist, carrier και εγγύηση απαιτείται σύνδεση με πάροχο δεδομένων.
              </p>
            </div>

            <Card className="border-white/10 bg-white/[0.03] backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                  <Info className="h-4 w-4 text-cyan-400" />
                  Γρήγορη επισκόπηση
                </CardTitle>
                <CardDescription className="text-zinc-500">
                  Όπως στα μεγάλα IMEI directories: TAC, προδιαγραφές, έλεγχοι δικτύου.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-zinc-400">
                <p>
                  Το IMEI δημιουργήθηκε επειδή το SIM δεν ταυτοποιεί μόνιμα τη συσκευή — μεταφέρεται εύκολα
                  σε άλλο τηλέφωνο. Γι&apos; αυτό χρειάζεστε το IMEI για εγγύηση, καταγγελία κλοπής και
                  φραγή από τον πάροχο.
                </p>
                <ul className="space-y-2 border-t border-white/10 pt-3 text-xs text-zinc-500">
                  <li className="flex gap-2">
                    <Fingerprint className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-400" />
                    Τα πρώτα 8 ψηφία (TAC) συνδέονται με μοντέλο & εγκεκριμένο τύπο συσκευής.
                  </li>
                  <li className="flex gap-2">
                    <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    Ο έλεγχος IMEI είναι από τα πιο χρήσιμα εργαλεία στη βιομηχανία GSM.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-violet-500/10 text-sm font-bold text-violet-300">
                  {s.n}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-zinc-500" />
                    <h3 className="font-display text-sm font-semibold text-white">{s.title}</h3>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{s.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={`${GLASS} p-6 md:p-8 lg:p-10`}>
              <div className="flex flex-wrap items-start gap-4 border-b border-white/[0.06] pb-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10">
                  <Shield className="h-7 w-7 text-violet-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-xl font-bold text-white md:text-2xl">Αποτέλεσμα ελέγχου</h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Το IMEI εισάγεται πάντα από το πεδίο στην κορυφή της σελίδας.
                  </p>
                </div>
              </div>

              {!showResult && !loading && (
                <p className="mt-8 text-center text-sm text-zinc-500">
                  Συμπληρώστε το IMEI στο πάνω πεδίο και πατήστε <span className="text-zinc-400">Check IMEI</span> για
                  επίδειξη αποτελεσμάτων.
                </p>
              )}

              {loading && (
                <div className="mt-10 flex items-center justify-center gap-2 text-sm text-zinc-500">
                  <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
                  Έλεγχος IMEI…
                </div>
              )}

              {showResult && (
                <div
                  className={`${GLASS} mt-8 border border-emerald-500/25 bg-emerald-500/[0.07] p-6 md:p-8 animate-in fade-in slide-in-from-top-2 duration-300`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <Badge className="border-0 bg-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-300">
                        Demo — βρέθηκε συσκευή
                      </Badge>
                      <p className="mt-2 max-w-xl text-xs text-zinc-500">
                        Τα πεδία παρακάτω είναι επίδειξη. Σε παραγωγή θα εμφανίζονται πραγματικά δεδομένα από
                        TAC database και παρόχους.
                      </p>
                    </div>
                    <SiApple className="h-8 w-8 text-zinc-400 opacity-80" />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3 sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        IMEI / TAC
                      </dt>
                      <dd className="mt-1 font-mono text-sm text-zinc-300">
                        <span className="text-cyan-400/90">{tac}</span>
                        <span className="text-zinc-500">{digitsForResult.slice(8)}</span>
                      </dd>
                      <p className="mt-1 text-[11px] text-zinc-600">TAC = πρώτα 8 ψηφία (Type Approval Code)</p>
                    </div>
                    {(
                      [
                        ["Μοντέλο", DEMO_DEVICE.model],
                        ["Χωρητικότητα", DEMO_DEVICE.capacity],
                        ["Χρώμα", DEMO_DEVICE.color],
                        ["Serial", DEMO_DEVICE.serial],
                        ["Φορέας (carrier)", DEMO_DEVICE.carrier],
                        ["Blacklist", DEMO_DEVICE.blacklist],
                        ["Εγγύηση", DEMO_DEVICE.warranty],
                        ["Ημ. αγοράς", DEMO_DEVICE.purchase],
                      ] as const
                    ).map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{k}</dt>
                        <dd className="mt-1 font-display text-base font-semibold text-white">{v}</dd>
                      </div>
                    ))}
                    <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        iCloud
                      </dt>
                      <dd className="mt-1 flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold",
                            DEMO_DEVICE.icloudOn
                              ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                              : "bg-red-500/20 text-red-300 ring-1 ring-red-400/30"
                          )}
                        >
                          {DEMO_DEVICE.icloudOn ? "ON (Find My)" : "OFF"}
                        </span>
                        <span className="text-xs text-zinc-600">(demo τιμή)</span>
                      </dd>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
                <Link href="/apple-service" className="text-sm font-medium text-violet-400/90 hover:text-violet-300">
                  ← Επιστροφή στο Expert Hub
                </Link>
                <a
                  href="https://support.apple.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400/90 hover:text-cyan-300"
                >
                  Apple Support
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Σχετικοί έλεγχοι</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Σε πλήρη υπηρεσία, αυτά τα σημεία είναι που ζητούν περισσότερο οι χρήστες — όπως στο{" "}
                  <span className="text-zinc-400">IMEI.info</span>.
                </p>
              </div>
              <div className="grid gap-3">
                {SERVICE_TILES.map((t) => (
                  <div
                    key={t.title}
                    className={cn("rounded-2xl border p-4 transition-colors", t.bg)}
                  >
                    <div className="flex items-start gap-3">
                      <t.icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.tone)} />
                      <div>
                        <p className="font-semibold text-white">{t.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-zinc-500">{t.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-5">
                <div className="flex items-center gap-2 text-amber-200">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="font-display text-sm font-semibold">Πριν αγοράσετε μεταχειρισμένο</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                  Επαληθεύστε IMEI, κατάσταση κλοπής, κλείδωμα δικτύου και αν τα χαρακτηριστικά ταιριάζουν με
                  την αγγελία. Ένας πλήρης έλεγχος μειώνει τον κίνδυνο.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-400" />
              <h2 className="font-display text-xl font-bold text-white">Γνώση & συχνές ερωτήσεις</h2>
            </div>
            <Accordion type="single" collapsible className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 md:px-6">
              <AccordionItem value="what" className="border-white/10">
                <AccordionTrigger className="text-left text-zinc-200 hover:no-underline">
                  Τι είναι το IMEI;
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  Το{" "}
                  <strong className="text-zinc-300">International Mobile Equipment Identity</strong> είναι
                  μοναδικός 15ψήφιος κωδικός που ταυτοποιεί τη συσκευή που χρησιμοποιεί κινητά δίκτυα. Τα
                  πρώτα 14 ψηφία ορίζονται από το GSM Association· το τελευταίο είναι check digit (αλγόριθμος
                  Luhn). Ο ευκολότερος τρόπος να το δείτε: καλέστε{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-cyan-300">
                    *#06#
                  </code>
                  .
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="why" className="border-white/10">
                <AccordionTrigger className="text-left text-zinc-200 hover:no-underline">
                  Γιατί να ελέγξω το IMEI;
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  Για εγγύηση και service, για καταγγελία κλεμμένου ή χαμένου τηλεφώνου στον πάροχο και την
                  αστυνομία, και για φραγή της συσκευής ώστε να μην λειτουργεί ακόμη κι αν αλλάξει SIM. Το IMEI
                  περιέχει επίσης πληροφορίες που συνδέονται με το μοντέλο μέσω TAC.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="how" className="border-white/10">
                <AccordionTrigger className="text-left text-zinc-200 hover:no-underline">
                  Πώς λειτουργεί ο έλεγχος TAC;
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  Τα πρώτα 8 ψηφία (TAC) χρησιμοποιούνται σε μεγάλες βάσεις δεδομένων για να εντοπιστεί το
                  ακριβές μοντέλο και οι προδιαγραφές. Μετά την ανεύρεση, εμφανίζονται τεχνικά στοιχεία και —
                  όπου υπάρχει διασύνδεση — επιπλέον ελέγχοι (blacklist, φορέας, simlock).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="demo" className="border-white/10 border-b-0">
                <AccordionTrigger className="text-left text-zinc-200 hover:no-underline">
                  Τι σημαίνει «demo» εδώ;
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400">
                  Η HiTech Doctor εμφανίζει δείγματα αποτελεσμάτων για να δείτε τη ροή της σελίδας. Για
                  πραγματικά δεδομένα απαιτείται ενσωμάτωση με επίσημες ή εμπορικές πηγές IMEI lookup — μπορούμε
                  να το προσθέσουμε στο μέλλον κατά προτίμησή σας.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
