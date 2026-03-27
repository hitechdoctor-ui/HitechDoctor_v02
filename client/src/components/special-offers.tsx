import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceDisclaimer } from "@/components/price-disclaimer";
import { RepairRequestModal } from "@/components/repair-request-modal";
import {
  Rocket, Shield, CheckCircle2, HardDrive, Wrench, Monitor,
  ShoppingCart, Zap, Clock, ArrowRight, Star,
} from "lucide-react";

const UPGRADE_FEATURES = [
  { icon: HardDrive, text: "Εγκατάσταση SSD 250GB" },
  { icon: Zap,       text: "Δωρεάν Εσωτερικός Καθαρισμός & Πάστα" },
  { icon: Wrench,    text: "Επιδιόρθωση / Εγκατάσταση Λογισμικού & Office" },
];

export function SpecialOffers() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-16 border-t border-white/8" aria-label="Ειδικές Προσφορές">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Heading */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Αποκλειστικές Προσφορές</p>
              <h2 className="text-2xl font-display font-extrabold text-foreground leading-tight">Special Offers</h2>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent hidden sm:block" />
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* ── Card 1: Business Refresh ── */}
          <div className="relative flex flex-col rounded-3xl overflow-hidden border border-blue-500/30"
            style={{ background: "linear-gradient(145deg, #0d1a3a 0%, #0f2050 60%, #0a1628 100%)" }}>

            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #2563eb, #60a5fa, #2563eb)" }} />

            {/* Limited badge */}
            <div className="absolute top-5 right-5">
              <Badge className="bg-amber-500 text-black text-[9px] font-extrabold px-2 py-1 rounded-full animate-pulse">
                ΠΕΡΙΟΡΙΣΜΕΝΗ ΠΡΟΣΦΟΡΑ
              </Badge>
            </div>

            <div className="p-7 flex flex-col flex-1">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-blue-300/70 font-bold uppercase tracking-widest">Πακέτο Αναβάθμισης</p>
                  <h3 className="text-lg font-display font-extrabold text-white leading-tight">Business Refresh</h3>
                </div>
              </div>

              <p className="text-xs text-blue-100/60 mb-5 mt-1">
                Δώστε νέα ζωή στον επαγγελματικό σας υπολογιστή — γρήγορος, καθαρός, έτοιμος για δουλειά.
              </p>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {UPGRADE_FEATURES.map((f) => (
                  <li key={f.text} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                      <f.icon className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-sm text-blue-50/85 font-medium">{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="flex items-end gap-3 mb-6 p-4 rounded-2xl"
                style={{ background: "rgba(37,99,235,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
                <div>
                  <p className="text-[10px] text-blue-300/60 font-semibold uppercase tracking-widest mb-0.5">Τιμή Πακέτου</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-white" style={{ textShadow: "0 0 20px rgba(96,165,250,0.5)" }}>
                      100€
                    </span>
                    <span className="text-sm text-blue-300/70 font-semibold">+ ΦΠΑ</span>
                  </div>
                  <p className="text-[10px] text-blue-300/50 mt-0.5">αντί κανονικής τιμής αγοράς</p>
                </div>
                <div className="ml-auto shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-blue-300/70">
                    <Clock className="w-3 h-3" />
                    <span>Παράδοση εντός ημέρας</span>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => setModalOpen(true)}
                className="mt-auto w-full h-12 font-bold text-base rounded-xl border-0 tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  boxShadow: "0 0 24px rgba(59,130,246,0.35)",
                }}
                data-testid="button-special-offer-book">
                <Wrench className="w-4 h-4 mr-2" />
                Κλείστε Ραντεβού
              </Button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[11px] text-blue-300/60">Δωρεάν αξιολόγηση · Πληρώνετε μόνο αν συμφωνήσετε</p>
              </div>
            </div>
          </div>

          {/* ── Card 2: Refurbished PCs ── */}
          <div className="relative flex flex-col rounded-3xl overflow-hidden border border-white/12"
            style={{ background: "linear-gradient(145deg, #111827 0%, #1a2436 60%, #0d1420 100%)" }}>

            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #475569, #94a3b8, #475569)" }} />

            <div className="p-7 flex flex-col flex-1">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-1">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, #334155, #64748b)" }}>
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400/70 font-bold uppercase tracking-widest">Refurbished</p>
                  <h3 className="text-lg font-display font-extrabold text-white leading-tight">Επαγγελματικοί Υπολογιστές</h3>
                </div>
              </div>

              <p className="text-sm text-slate-300/70 leading-relaxed mt-2 mb-5">
                Χρειάζεστε νέο εξοπλισμό; Επιλέξτε <strong className="text-white">επώνυμα μεταχειρισμένα συστήματα</strong> με εγγύηση 1 έτους και κερδίστε έως{" "}
                <strong className="text-emerald-400">60% της αξίας</strong> ενός καινούργιου.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Shield,      label: "Εγγύηση 1 Έτους",      sub: "Γραπτή εγγύηση" },
                  { icon: Star,        label: "Επώνυμα Brands",        sub: "Dell, HP, Lenovo..." },
                  { icon: CheckCircle2,label: "Grade A / A-",          sub: "Άριστη κατάσταση" },
                  { icon: Rocket,      label: "Έτοιμα προς Χρήση",    sub: "Windows εγκ/μένο" },
                ].map((b) => (
                  <div key={b.label} className="p-3 rounded-xl flex items-start gap-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <b.icon className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{b.label}</p>
                      <p className="text-[10px] text-slate-400">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price teaser */}
              <div className="p-4 rounded-2xl mb-6"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-[10px] text-emerald-400/70 font-semibold uppercase tracking-widest">Τιμές από</p>
                    <p className="text-3xl font-extrabold text-emerald-400">€40</p>
                    <p className="text-[10px] text-emerald-400/60">έως €500+</p>
                  </div>
                  <div className="flex-1 pl-3 border-l border-emerald-500/20">
                    <p className="text-xs text-slate-300/80 leading-relaxed">
                      Εξοικονομήστε έως <strong className="text-emerald-400">60%</strong> σε σχέση με καινούργιο υπολογιστή ίδιων προδιαγραφών.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <Link href="/eshop?tab=desktop" className="mt-auto">
                <Button
                  className="w-full h-12 font-bold text-base rounded-xl border-0 tracking-wide"
                  style={{
                    background: "linear-gradient(135deg, #334155, #475569)",
                    boxShadow: "0 0 20px rgba(71,85,105,0.3)",
                  }}
                  data-testid="button-refurbished-eshop">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Δείτε τους Υπολογιστές στο e-Shop
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <p className="text-[11px] text-slate-400/60">Εγγύηση 1 έτους · Δωρεάν διαμόρφωση</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <PriceDisclaimer className="mt-8 text-center max-w-lg mx-auto" />

      <RepairRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDeviceName="Business Refresh — Αναβάθμιση PC"
      />
    </section>
  );
}
