import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RepairRequestModal } from "@/components/repair-request-modal";
import { Fragment, useState } from "react";
import {
  Gamepad2, Wrench, CheckCircle2, AlertTriangle, Clock,
  Phone, HardDrive, Zap, Wifi, ChevronRight, Shield, Star,
  Disc3, Fan, Cable, CircuitBoard,
} from "lucide-react";

// ── PlayStation models ────────────────────────────────────────────────────────
const PS_MODELS = [
  {
    id: "ps5",
    name: "PlayStation 5",
    abbr: "PS5",
    year: "2020–σήμερα",
    color: "from-blue-900/60 to-slate-900/80",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    badge: "Νέο",
    badgeColor: "bg-blue-500",
    repairs: [
      { label: "Επισκευή θύρας HDMI", price: "€70–€90", note: "Πιο συχνή βλάβη PS5" },
      { label: "Αντικατάσταση ανεμιστήρα", price: "€50–€70", note: "Υπερθέρμανση / θόρυβος" },
      { label: "Επισκευή μονάδας δίσκου", price: "€90–€120", note: "Μόνο Digital Edition" },
      { label: "Επισκευή θυρών USB", price: "€45–€65", note: "" },
      { label: "Αντικατάσταση τροφοδοτικού", price: "€80–€110", note: "" },
    ],
  },
  {
    id: "ps4-pro",
    name: "PlayStation 4 Pro",
    abbr: "PS4 Pro",
    year: "2016–2020",
    color: "from-slate-900/60 to-gray-900/80",
    border: "border-primary/25",
    accent: "text-primary",
    badge: "",
    badgeColor: "",
    repairs: [
      { label: "Επισκευή θύρας HDMI", price: "€55–€75", note: "Πιο συχνή βλάβη" },
      { label: "Αντικατάσταση ανεμιστήρα", price: "€40–€55", note: "Θόρυβος ή υπερθέρμανση" },
      { label: "Επισκευή μονάδας δίσκου", price: "€65–€85", note: "" },
      { label: "Αντικατάσταση θερμόπαστας", price: "€35–€50", note: "Deep clean + νέα πάστα" },
      { label: "Επισκευή θυρών USB", price: "€40–€55", note: "" },
    ],
  },
  {
    id: "ps4-slim",
    name: "PlayStation 4 Slim",
    abbr: "PS4 Slim",
    year: "2016–2020",
    color: "from-slate-900/60 to-gray-900/80",
    border: "border-white/12",
    accent: "text-slate-300",
    badge: "",
    badgeColor: "",
    repairs: [
      { label: "Επισκευή θύρας HDMI", price: "€50–€70", note: "" },
      { label: "Αντικατάσταση ανεμιστήρα", price: "€35–€50", note: "" },
      { label: "Επισκευή μονάδας δίσκου", price: "€55–€75", note: "" },
      { label: "Αντικατάσταση θερμόπαστας", price: "€30–€45", note: "" },
      { label: "Επισκευή θυρών USB", price: "€35–€50", note: "" },
    ],
  },
  {
    id: "ps4",
    name: "PlayStation 4",
    abbr: "PS4",
    year: "2013–2020",
    color: "from-slate-900/60 to-gray-900/80",
    border: "border-white/12",
    accent: "text-slate-300",
    badge: "",
    badgeColor: "",
    repairs: [
      { label: "Επισκευή θύρας HDMI", price: "€50–€70", note: "Πιο συχνό πρόβλημα" },
      { label: "Αντικατάσταση ανεμιστήρα", price: "€35–€50", note: "" },
      { label: "Επισκευή μονάδας δίσκου", price: "€55–€75", note: "" },
      { label: "Αντικατάσταση θερμόπαστας", price: "€30–€45", note: "Καθαρισμός + deep clean" },
      { label: "Επισκευή τροφοδοτικού", price: "€50–€70", note: "" },
    ],
  },
  {
    id: "ps3",
    name: "PlayStation 3",
    abbr: "PS3",
    year: "2006–2017",
    color: "from-zinc-900/60 to-stone-900/80",
    border: "border-white/8",
    accent: "text-zinc-400",
    badge: "",
    badgeColor: "",
    repairs: [
      { label: "YLOD — Επισκευή πλακέτας", price: "€45–€70", note: "Yellow Light of Death" },
      { label: "Αντικατάσταση θερμόπαστας", price: "€30–€40", note: "Καθαρισμός + deep clean" },
      { label: "Επισκευή μονάδας δίσκου (Blu-ray)", price: "€50–€70", note: "" },
      { label: "Επισκευή τροφοδοτικού", price: "€45–€60", note: "" },
    ],
  },
];

// ── Controller repairs ────────────────────────────────────────────────────────
const CONTROLLER_REPAIRS = [
  { label: "Stick drift (αντικ. αναλόγων)", price: "€20–€30", icon: Gamepad2 },
  { label: "Κολλημένα κουμπιά / triggers", price: "€15–€25", icon: Wrench },
  { label: "Επισκευή θύρας USB-C / micro-USB", price: "€20–€30", icon: Cable },
  { label: "Αντικατάσταση μπαταρίας", price: "€15–€25", icon: Zap },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQ = [
  {
    q: "Η πιο συχνή βλάβη στο PlayStation;",
    a: "Η θύρα HDMI — κυρίως λόγω βίαιης αφαίρεσης του καλωδίου ή φθοράς. Είναι επισκευάσιμη και ΔΕΝ απαιτεί νέα κονσόλα.",
  },
  {
    q: "Πόσο κοστίζει η επισκευή HDMI PS5;",
    a: "Η αντικατάσταση της θύρας HDMI σε PS5 κοστίζει €70–€90. Η διαδικασία απαιτεί αποσυναρμολόγηση και microsoldeing — εκτελείται μόνο από έμπειρους τεχνικούς.",
  },
  {
    q: "Το PS5 μου κάνει δυνατό θόρυβο — τι φταίει;",
    a: "Συνήθως φταίει ο ανεμιστήρας (σκόνη ή φθορά ρουλεμάν). Με καθαρισμό και ανανέωση θερμόπαστας το πρόβλημα λύνεται στο 90% των περιπτώσεων.",
  },
  {
    q: "Τι είναι το YLOD στο PS3;",
    a: "Το Yellow Light of Death (Κίτρινο Φως) είναι αστοχία της πλακέτας λόγω υπερθέρμανσης. Επισκευάζεται με reballing/reflowing και ανανέωση θερμόπαστας.",
  },
  {
    q: "Ισχύει η επισκευή για το παιχνίδι που ήταν μέσα στο δίσκο;",
    a: "Ναι, τα παιχνίδια εντός του δίσκου ΔΕΝ επηρεάζονται. Δεν γίνεται καμία επέμβαση σε δεδομένα χρήστη.",
  },
  {
    q: "Πόσος χρόνος χρειάζεται για την επισκευή;",
    a: "Οι περισσότερες επισκευές ολοκληρώνονται εντός 24–48 ωρών. Σε σύνθετες εργασίες πλακέτας (YLOD, HDMI PS5) μπορεί να χρειαστούν 2–3 εργάσιμες.",
  },
];

export default function ServicePlayStation() {
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Επισκευή PlayStation (PS5, PS4, PS3) Αθήνα | HiTech Doctor"
        description="Επαγγελματική επισκευή PlayStation PS5, PS4 Pro, PS4 Slim, PS4, PS3 στην Αθήνα. HDMI port, ανεμιστήρας, μονάδα δίσκου, controller. Τιμές από €20. Εγγύηση εργασίας."
        keywords="επισκευη playstation αθηνα, επισκευη ps5, επισκευη ps4, hdmi port playstation, ylod ps3, controller stick drift, επισκευη κονσολας"
        url="https://hitechdoctor.com/services/episkeui-playstation"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": "Επισκευή PlayStation",
          "provider": { "@type": "LocalBusiness", "name": "HiTech Doctor", "telephone": "+306981882005" },
          "areaServed": "Αθήνα",
          "description": "Επισκευή PlayStation PS5, PS4, PS3 — HDMI, ανεμιστήρας, δίσκος, controller",
        })}</script>
      </Helmet>

      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden border-b border-white/8 py-14 lg:py-20"
        style={{ background: "linear-gradient(145deg, #0a0f1e 0%, #0d1530 50%, #080c18 100%)" }}
      >
        <div className="absolute inset-0 circuit-bg opacity-30 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary transition-colors">Αρχική</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/services" className="hover:text-primary transition-colors">Υπηρεσίες</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground/80">Επισκευή PlayStation</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)", boxShadow: "0 0 30px rgba(59,130,246,0.3)" }}>
                  <Gamepad2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase tracking-widest mb-1">
                    Κονσόλες
                  </Badge>
                  <h1 className="text-3xl lg:text-4xl font-display font-extrabold text-white leading-tight">
                    Επισκευή PlayStation
                  </h1>
                </div>
              </div>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mb-6">
                Επαγγελματική επισκευή <strong className="text-white">PS5, PS4 Pro, PS4 Slim, PS4 και PS3</strong> στην Αθήνα.
                HDMI port, ανεμιστήρας, μονάδα δίσκου, controller stick drift — με εγγύηση εργασίας.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setModalOpen(true)}
                  className="h-11 px-7 font-bold border-0"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
                  data-testid="button-ps-book-hero"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Κλείστε Ραντεβού
                </Button>
                <a href="tel:6981882005">
                  <Button variant="outline" className="h-11 px-6 border-white/20 hover:border-blue-400/50 gap-2">
                    <Phone className="w-4 h-4" />
                    698 188 2005
                  </Button>
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 shrink-0 w-full lg:w-auto">
              {[
                { value: "24h", label: "Παράδοση", icon: Clock },
                { value: "6μ", label: "Εγγύηση", icon: Shield },
                { value: "PS3→PS5", label: "Μοντέλα", icon: Gamepad2 },
                { value: "€20+", label: "Από", icon: Wrench },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-2xl border border-white/8 text-center"
                  style={{ background: "rgba(255,255,255,0.03)" }}>
                  <s.icon className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                  <p className="text-lg font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HDMI alert banner */}
      <div className="bg-amber-500/10 border-y border-amber-500/25 py-3">
        <div className="container mx-auto px-4 max-w-5xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200/80">
            <strong className="text-amber-400">Πιο συχνή βλάβη:</strong> Χαλασμένη θύρα HDMI — ΔΕΝ χρειάζεται νέα κονσόλα! Επισκευάζουμε την ίδια την υποδοχή με microsoldeing από €50.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 max-w-5xl py-12 space-y-14">

        {/* PlayStation model cards */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-foreground mb-1">Τιμές ανά Μοντέλο</h2>
            <p className="text-sm text-muted-foreground">Επιλέξτε το μοντέλο σας για να δείτε τις τιμές επισκευής.</p>
          </div>

          {PS_MODELS.map((model) => (
            <div key={model.id} className={`rounded-3xl border ${model.border} overflow-hidden`}
              style={{ background: `linear-gradient(145deg, ${model.color.replace("from-", "").replace(" to-", ", ")})` }}>
              {/* Model header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center">
                    <Gamepad2 className={`w-5 h-5 ${model.accent}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-white">{model.name}</h3>
                      {model.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white ${model.badgeColor}`}>
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{model.year}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setModalOpen(true)}
                  className="h-8 px-4 text-xs font-bold border-0"
                  style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}
                  data-testid={`button-ps-book-${model.id}`}
                >
                  Ραντεβού
                </Button>
              </div>

              {/* Repairs table */}
              <div className="divide-y divide-white/5">
                {model.repairs.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3.5 hover:bg-white/3 transition-colors">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                      <div>
                        <span className="text-sm text-foreground/90 font-medium">{r.label}</span>
                        {r.note && (
                          <span className="ml-2 text-[10px] text-muted-foreground/60 italic">{r.note}</span>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${model.accent} whitespace-nowrap ml-4`}>{r.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Controller repairs */}
        <div>
          <h2 className="text-2xl font-display font-extrabold text-foreground mb-1">Επισκευή Controller</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Stick drift, κολλημένα κουμπιά, χαλασμένη θύρα φόρτισης — ισχύει για DualSense (PS5) και DualShock (PS4).
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {CONTROLLER_REPAIRS.map((r) => (
              <div key={r.label} className="flex items-center justify-between p-4 rounded-2xl border border-white/8 bg-card/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <r.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/90 font-medium">{r.label}</span>
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap ml-4">{r.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Common faults visual */}
        <div>
          <h2 className="text-2xl font-display font-extrabold text-foreground mb-5">Συχνές Βλάβες PlayStation</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Cable,        title: "Χαλασμένη HDMI",        desc: "Δεν εμφανίζει εικόνα στην τηλεόραση. Πιο κοινό πρόβλημα σε PS4/PS5.",       color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
              { icon: Fan,          title: "Υπερθέρμανση / Θόρυβος", desc: "Δυνατός ανεμιστήρας ή αυτόματο κλείσιμο λόγω θερμοκρασίας.",               color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { icon: Disc3,        title: "Μονάδα Δίσκου",          desc: "Δεν διαβάζει δίσκους, δεν εισέρχεται ή δεν εξέρχεται ο δίσκος.",            color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
              { icon: Zap,          title: "Πρόβλημα Τροφοδοσίας",   desc: "Δεν ανάβει ή σβήνει αμέσως. Πρόβλημα τροφοδοτικού ή πλακέτας.",             color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20" },
              { icon: CircuitBoard, title: "YLOD (PS3)",              desc: "Κίτρινο φως — αστοχία πλακέτας λόγω υπερθέρμανσης. Επισκευάσιμο.",          color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { icon: Gamepad2,     title: "Stick Drift Controller",  desc: "Ο χαρακτήρας κινείται μόνος του. Αντικαθίσταται ο αναλογικός δίαυλος.",     color: "text-primary",    bg: "bg-primary/10",    border: "border-primary/20" },
            ].map((f) => (
              <div key={f.title} className={`p-5 rounded-2xl border ${f.border} ${f.bg}`}>
                <f.icon className={`w-6 h-6 ${f.color} mb-3`} />
                <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-display font-extrabold text-foreground mb-5">Συχνές Ερωτήσεις</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-white/8 rounded-2xl overflow-hidden bg-card/40">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
                  data-testid={`faq-ps-${i}`}
                >
                  <span className="text-sm font-semibold text-foreground pr-4">{item.q}</span>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl p-8 text-center border border-blue-500/25"
          style={{ background: "linear-gradient(135deg, rgba(30,58,138,0.3) 0%, rgba(15,32,80,0.4) 100%)" }}>
          <Gamepad2 className="w-10 h-10 text-blue-400 mx-auto mb-3" />
          <h2 className="text-2xl font-display font-extrabold text-white mb-2">Χάλασε το PlayStation σου;</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Δωρεάν αξιολόγηση βλάβης — πληρώνετε μόνο αν συμφωνήσετε με την τιμή επισκευής.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => setModalOpen(true)}
              className="h-12 px-8 font-bold border-0"
              style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 0 24px rgba(59,130,246,0.35)" }}
              data-testid="button-ps-book-cta"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Κλείστε Ραντεβού
            </Button>
            <a href="tel:6981882005">
              <Button variant="outline" className="h-12 px-6 border-blue-500/30 hover:border-blue-400 gap-2 text-blue-300">
                <Phone className="w-4 h-4" />
                698 188 2005
              </Button>
            </a>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Δωρεάν αξιολόγηση
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Εγγύηση εργασίας 6 μήνες
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Παράδοση 24–48h
            </div>
          </div>
        </div>

      </main>

      <Footer />

      <RepairRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDeviceName="PlayStation"
      />
    </div>
  );
}
