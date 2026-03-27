import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Download,
  Smartphone,
  BookOpen,
  ChevronRight,
  Sparkles,
  HardDrive,
  Apple,
  Tablet,
  Laptop,
  Watch,
  Search,
  Loader2,
  Cpu,
  Battery,
  Droplets,
  Keyboard,
  Camera,
  Usb,
  Crown,
} from "lucide-react";
import { SiApple, SiViber } from "react-icons/si";
import { buildViberUrl } from "@/lib/viber";
import { requestImeiLookup } from "@/lib/imei-client";
import { ImeiResultCard } from "@/components/imei-result-card";
import type { ImeiLookupSuccess } from "@shared/imei-lookup";

const GLASS =
  "rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_48px_rgba(0,0,0,0.45)]";

const COMPREHENSIVE_APPLE_SERVICES = [
  {
    id: "iphone",
    title: "iPhone",
    description: "Επισκευές όλων των μοντέλων iPhone με γνήσια ανταλλακτικά.",
    icon: Smartphone,
    brandIcon: SiApple,
    accent: "from-cyan-500/20 to-blue-600/10",
    iconTint: "text-cyan-200/95",
    services: [
      { label: "Αλλαγή οθόνης & αφής", icon: Smartphone },
      { label: "Αντικατάσταση μπαταρίας", icon: Battery },
      { label: "Επισκευή πλακέτας (logic board)", icon: Cpu },
      { label: "Υγρασία / βύθιση", icon: Droplets },
    ],
    repairHref: "/services/episkeui-iphone",
    repairCta: "Σελίδα επισκευής iPhone",
    viberMessage: "Γεια σας, ενδιαφέρομαι για επισκευή iPhone — HiTech Doctor",
  },
  {
    id: "ipad",
    title: "iPad",
    description: "Tablet Apple — οθόνη, μπαταρία και θύρες φόρτισης.",
    icon: Tablet,
    brandIcon: SiApple,
    accent: "from-violet-500/20 to-fuchsia-600/10",
    iconTint: "text-violet-200/95",
    services: [
      { label: "Οθόνη LCD / αφή", icon: Tablet },
      { label: "Μπαταρία", icon: Battery },
      { label: "Θύρα φόρτισης / USB-C", icon: Usb },
      { label: "Κάμερα & Face ID", icon: Camera },
    ],
    repairHref: "/services/episkeui-tablet",
    repairCta: "Σελίδα επισκευής iPad & Tablet",
    viberMessage: "Γεια σας, ενδιαφέρομαι για επισκευή iPad — HiTech Doctor",
  },
  {
    id: "macbook",
    title: "MacBook",
    description: "Laptop Apple — οθόνη, πληκτρολόγιο και αναβαθμίσεις.",
    icon: Laptop,
    brandIcon: SiApple,
    accent: "from-emerald-500/20 to-teal-600/10",
    iconTint: "text-emerald-200/95",
    services: [
      { label: "Οθόνη Retina / Flexgate", icon: Laptop },
      { label: "Μπαταρία & τροφοδοτικό", icon: Battery },
      { label: "Πληκτρολόγιο & trackpad", icon: Keyboard },
      { label: "SSD / RAM (όπου εφαρμόζεται)", icon: Cpu },
    ],
    repairHref: "/services/episkeui-laptop",
    repairCta: "Σελίδα επισκευής Laptop / MacBook",
    viberMessage: "Γεια σας, ενδιαφέρομαι για επισκευή MacBook — HiTech Doctor",
  },
  {
    id: "watch",
    title: "Apple Watch",
    description: "Ρολόι Apple — οθόνη, μπαταρία και στεγανότητα.",
    icon: Watch,
    brandIcon: SiApple,
    accent: "from-orange-500/20 to-rose-600/10",
    iconTint: "text-orange-200/95",
    services: [
      { label: "Οθόνη / κρύσταλλο", icon: Watch },
      { label: "Μπαταρία", icon: Battery },
      { label: "Digital Crown & κουμπί", icon: Crown },
      { label: "Βλάβη από υγρασία", icon: Droplets },
    ],
    repairHref: "/services/episkeui-apple-watch",
    repairCta: "Σελίδα επισκευής Apple Watch",
    viberMessage: "Γεια σας, ενδιαφέρομαι για επισκευή Apple Watch — HiTech Doctor",
  },
] as const;

function normalizeImeiDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, 15);
}

const HUB_CATEGORIES = [
  {
    id: "firmware",
    title: "Firmware Downloads",
    titleEl: "Λήψεις Firmware",
    description: "Επίσημα αρχεία .ipsw, υπογεγραμμένα builds και σύνδεσμοι Apple CDN για κάθε iPhone.",
    icon: Download,
    accent: "from-cyan-500/25 to-blue-600/10",
    href: "/services/ipsw-download",
    cta: "Άνοιγμα IPSW Tool",
  },
  {
    id: "imei",
    title: "Device Tools (IMEI)",
    titleEl: "Εργαλεία συσκευής (IMEI)",
    description: "Έλεγχος IMEI με μοντέλο, iCloud και εγγύηση μέσω IMEI.info API (απαιτείται κλειδί στο server).",
    icon: Smartphone,
    accent: "from-violet-500/25 to-fuchsia-600/10",
    href: "/services/imei-check",
    cta: "Άνοιγμα IMEI Check",
  },
  {
    id: "guides",
    title: "Step-by-Step Guides",
    titleEl: "Οδηγοί βήμα-βήμα",
    description: "Αναλυτικοί οδηγοί για backup, DFU, επαναφορά και ασφαλή διαχείριση της συσκευής σας.",
    icon: BookOpen,
    accent: "from-emerald-500/20 to-teal-600/10",
    href: "#guides",
    cta: "Δείτε τους οδηγούς",
  },
] as const;

const ESSENTIAL_TOOLS = [
  {
    name: "iTunes (Windows)",
    description: "Επίσημο πρόγραμμα της Apple για συγχρονισμό και επαναφορά μέσω Windows.",
    href: "https://www.apple.com/itunes/",
    icon: SiApple,
    label: "Apple.com",
  },
  {
    name: "3uTools",
    description: "Δημοφιλές εργαλείο διαχείρισης iOS — flash, backup και επιπλέον λειτουργίες.",
    href: "https://www.3u.com/",
    icon: HardDrive,
    label: "3u.com",
  },
] as const;

const GUIDE_PLACEHOLDERS = [
  {
    title: "How to Backup your iPhone",
    titleEl: "Πώς να κάνετε backup το iPhone σας",
    tag: "Backup",
    eta: "Σύντομα",
  },
  {
    title: "Entering DFU Mode",
    titleEl: "Είσοδος σε λειτουργία DFU",
    tag: "Recovery",
    eta: "Σύντομα",
  },
  {
    title: "Factory Reset Safely",
    titleEl: "Εργοστασιακή επαναφορά με ασφάλεια",
    tag: "Reset",
    eta: "Σύντομα",
  },
  {
    title: "Checking iOS Version",
    titleEl: "Έλεγχος έκδοσης iOS",
    tag: "System",
    eta: "Σύντομα",
  },
] as const;

export default function AppleServicePage() {
  const [imeiBar, setImeiBar] = useState("");
  const [imeiLoading, setImeiLoading] = useState(false);
  const [imeiError, setImeiError] = useState<string | null>(null);
  const [imeiResult, setImeiResult] = useState<ImeiLookupSuccess | null>(null);

  const handleImeiBarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setImeiError(null);
    const digits = normalizeImeiDigits(imeiBar);
    if (digits.length !== 15) {
      setImeiError("Εισάγετε έγκυρο IMEI 15 ψηφίων.");
      setImeiResult(null);
      return;
    }
    setImeiLoading(true);
    setImeiResult(null);
    try {
      const res = await requestImeiLookup(digits);
      if (!res.ok) {
        setImeiError(res.error);
        return;
      }
      setImeiResult(res);
    } catch {
      setImeiError("Αποτυχία σύνδεσης με τον server. Δοκιμάστε ξανά.");
    } finally {
      setImeiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060607] text-zinc-100 selection:bg-cyan-500/30">
      <Seo
        title="Apple Expert Hub — Firmware, εργαλεία & οδηγοί"
        description="Κέντρο υποστήριξης Apple από το HiTech Doctor: λήψεις IPSW, οδηγοί DFU & backup, χρήσιμα εργαλεία."
        url="https://hitechdoctor.com/apple-service"
      />
      <Helmet>
        <link rel="canonical" href="https://hitechdoctor.com/apple-service" />
      </Helmet>

      <Navbar />

      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[120%] -translate-x-1/2 rounded-full opacity-40 blur-[120px]"
          style={{ background: "radial-gradient(ellipse, rgba(0,200,220,0.35) 0%, transparent 65%)" }}
        />
        <div
          className="absolute bottom-0 right-0 h-[400px] w-[60%] translate-x-1/4 opacity-25 blur-[100px]"
          style={{ background: "radial-gradient(ellipse, rgba(120,80,255,0.4) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_40%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <main className="relative">
        {/* Hero */}
        <section className="container relative mx-auto max-w-6xl px-4 pt-14 pb-10 md:pt-20 md:pb-14 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            HiTech Doctor
            <span className="text-zinc-600">·</span>
            <span className="text-zinc-300">Apple Service Hub</span>
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
            Apple{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
              Expert Hub
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Ένα κεντρικό σημείο για επίσημα firmware, χρήσιμα εργαλεία και οδηγούς — με premium εμπειρία εμπνευσμένη από την Apple.
          </p>
        </section>

        {/* Comprehensive Apple Services */}
        <section className="container relative mx-auto max-w-6xl px-4 pb-12 md:pb-16">
          <div className="mb-8 text-center md:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/90">Apple Services</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
              Comprehensive Apple Services
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500 md:mx-0 mx-auto">
              Ολοκληρωμένες επισκευές και υποστήριξη για τις κύριες κατηγορίες συσκευών Apple — με την εμπειρία του HiTech Doctor.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {COMPREHENSIVE_APPLE_SERVICES.map((cat) => (
              <div
                key={cat.id}
                className={`group relative flex flex-col overflow-hidden ${GLASS} p-6 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06]`}
              >
                <div
                  className={`pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-gradient-to-br ${cat.accent} opacity-50 blur-3xl transition-opacity group-hover:opacity-80`}
                />
                <div className="relative flex items-center gap-3">
                  <Link
                    href={cat.repairHref}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] shadow-inner transition-colors hover:border-cyan-400/35 hover:bg-white/[0.1]"
                    aria-label={cat.repairCta}
                  >
                    <cat.icon className={`h-7 w-7 ${cat.iconTint}`} strokeWidth={1.5} />
                  </Link>
                  <Link
                    href={cat.repairHref}
                    className="rounded-lg opacity-80 transition-opacity hover:opacity-100"
                    aria-hidden
                  >
                    <cat.brandIcon className="relative h-6 w-6 text-zinc-400" />
                  </Link>
                </div>
                <h3 className="relative mt-5">
                  <Link
                    href={cat.repairHref}
                    className="group/title inline-flex items-center gap-1.5 font-display text-lg font-bold text-white transition-colors hover:text-cyan-200"
                  >
                    {cat.title}
                    <ChevronRight className="h-4 w-4 text-cyan-400/80 opacity-70 transition-transform group-hover/title:translate-x-0.5" />
                  </Link>
                </h3>
                <p className="relative mt-1 text-xs leading-relaxed text-zinc-500">{cat.description}</p>
                <Link
                  href={cat.repairHref}
                  className="relative mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400/90 hover:text-cyan-300"
                >
                  {cat.repairCta}
                  <ChevronRight className="h-3 w-3" />
                </Link>
                <ul className="relative mt-4 flex flex-col gap-2.5 border-t border-white/[0.06] pt-4">
                  {cat.services.map((s) => (
                    <li key={s.label} className="flex items-start gap-2 text-[13px] text-zinc-300">
                      <s.icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.75} />
                      <Link href={cat.repairHref} className="text-left hover:text-cyan-200/95">
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="relative mt-6 flex flex-col gap-2">
                  <Button
                    asChild
                    className="h-10 w-full rounded-xl border-0 bg-gradient-to-r from-cyan-500/90 to-blue-600/85 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.15)] hover:from-cyan-400 hover:to-blue-500"
                  >
                    <Link href={cat.repairHref}>{cat.repairCta}</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full rounded-xl border-white/15 bg-white/[0.04] text-sm font-semibold text-zinc-200 hover:border-cyan-400/25 hover:bg-white/[0.08]"
                  >
                    <Link href={`/contact?device=${encodeURIComponent(cat.title)}`}>Request Service</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full rounded-xl border-[#7360f2]/40 bg-[#7360f2]/12 text-[#c4b6ff] hover:border-[#7360f2]/55 hover:bg-[#7360f2]/20 hover:text-white"
                    asChild
                  >
                    <a href={buildViberUrl(cat.viberMessage)} target="_blank" rel="noopener noreferrer">
                      <SiViber className="mr-2 h-4 w-4" style={{ color: "#7360f2" }} />
                      Viber
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* IMEI search — glass bar */}
        <section className="container relative mx-auto max-w-6xl px-4 pb-16 md:pb-20">
          <div className={`${GLASS} p-5 md:p-6`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
              <div className="flex min-w-0 items-start gap-3 md:max-w-md">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-500/10">
                  <Search className="h-5 w-5 text-violet-300" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white md:text-lg">IMEI Check</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Εισάγετε 15 ψηφία και πατήστε Έλεγχο για live αποτελέσματα (Model, iCloud, Warranty) μέσω IMEI.info API.
                  </p>
                </div>
              </div>
              <form
                onSubmit={handleImeiBarSubmit}
                className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch md:max-w-xl md:flex-1"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="π.χ. 353456789012347"
                  value={imeiBar}
                  onChange={(e) => {
                    setImeiBar(normalizeImeiDigits(e.target.value));
                    setImeiError(null);
                    setImeiResult(null);
                  }}
                  className="h-11 border-white/12 bg-white/[0.06] font-mono text-sm tracking-wider text-white placeholder:text-zinc-600"
                  aria-label="IMEI 15 ψηφίων"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={imeiLoading}
                    className="h-11 shrink-0 rounded-xl border-0 bg-gradient-to-r from-violet-500 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.25)] hover:from-violet-400 hover:to-fuchsia-500 disabled:opacity-70"
                  >
                    {imeiLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Έλεγχος…
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Έλεγχος
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="h-11 rounded-xl border-white/15 bg-transparent text-zinc-300" asChild>
                    <Link
                      href={
                        normalizeImeiDigits(imeiBar).length === 15
                          ? `/services/imei-check?imei=${encodeURIComponent(normalizeImeiDigits(imeiBar))}`
                          : "/services/imei-check"
                      }
                    >
                      Πλήρες εργαλείο
                    </Link>
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <ImeiResultCard
            className="mt-5"
            loading={imeiLoading}
            error={imeiError && !imeiLoading ? imeiError : null}
            data={imeiResult}
            imeiDigits={normalizeImeiDigits(imeiBar)}
          />
        </section>

        {/* 3 category dashboard */}
        <section className="container relative mx-auto max-w-6xl px-4 pb-16 md:pb-20">
          <div className="mb-8 flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Κεντρικός πίνακας</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {HUB_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`group relative flex flex-col overflow-hidden ${GLASS} p-6 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06]`}
              >
                <div
                  className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gradient-to-br ${cat.accent} opacity-60 blur-3xl transition-opacity group-hover:opacity-90`}
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-inner">
                  <cat.icon className="h-6 w-6 text-cyan-200/90" strokeWidth={1.5} />
                </div>
                <h3 className="relative mt-5 font-display text-lg font-bold text-white">{cat.title}</h3>
                <p className="relative mt-1 text-xs font-medium text-zinc-500">{cat.titleEl}</p>
                <p className="relative mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{cat.description}</p>
                {cat.href.startsWith("#") ? (
                  <a href={cat.href} className="relative mt-6 inline-flex w-full">
                    <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.08] text-sm font-semibold text-white transition-all hover:border-cyan-400/30 hover:bg-white/[0.12]">
                      {cat.cta}
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </span>
                  </a>
                ) : (
                  <Link href={cat.href} className="relative mt-6 inline-flex w-full">
                    <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.08] text-sm font-semibold text-white transition-all hover:border-cyan-400/30 hover:bg-white/[0.12]">
                      {cat.cta}
                      <ChevronRight className="h-4 w-4 opacity-70" />
                    </span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Essential tools — IMEI έχει δική του σελίδα /services/imei-check */}
        <section className="container relative mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="mb-10 text-center md:text-left">
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">Essential Tools</h2>
            <p className="mt-2 text-sm text-zinc-500">Λήψεις από επίσημες πηγές — Windows / εργαλεία τρίτων.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {ESSENTIAL_TOOLS.map((tool) => (
              <div
                key={tool.name}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 ${GLASS} p-6 md:p-8`}
              >
                <div className="flex gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05]">
                    <tool.icon className={`h-7 w-7 ${tool.icon === SiApple ? "text-zinc-100" : "text-cyan-300"}`} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">{tool.name}</h3>
                    <p className="mt-1 max-w-md text-sm text-zinc-400">{tool.description}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wider text-zinc-600">{tool.label}</p>
                  </div>
                </div>
                <Button
                  asChild
                  className="h-12 shrink-0 rounded-2xl border-0 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 px-8 font-semibold text-white shadow-[0_0_32px_rgba(34,211,238,0.2)] hover:from-cyan-400 hover:to-blue-500"
                >
                  <a href={tool.href} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Λήψη
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Guides grid */}
        <section id="guides" className="scroll-mt-28 border-t border-white/[0.06] bg-black/25 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-10 flex flex-col items-center text-center md:items-start md:text-left">
              <div className="mb-3 inline-flex items-center gap-2 text-cyan-400/90">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-[0.25em]">Guides</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white md:text-3xl">Οδηγοί & άρθρα</h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-500">
                Placeholder τίτλοι — τα πλήρη άρθρα θα προστεθούν στο blog μας.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {GUIDE_PLACEHOLDERS.map((g) => (
                <div
                  key={g.title}
                  className={`group flex flex-col ${GLASS} p-5 transition-all hover:border-white/[0.12]`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge className="border-0 bg-white/[0.08] text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      {g.tag}
                    </Badge>
                    <span className="text-[10px] font-medium text-zinc-600">{g.eta}</span>
                  </div>
                  <p className="mt-4 font-display text-[15px] font-semibold leading-snug text-white group-hover:text-cyan-100">
                    {g.title}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">{g.titleEl}</p>
                  <div className="mt-4 flex items-center text-[11px] font-medium text-zinc-600">
                    <Apple className="mr-1.5 h-3.5 w-3.5 opacity-50" />
                    Placeholder
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link href="/blog">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-cyan-400/90 hover:text-cyan-300">
                  Μετάβαση στο Blog
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
