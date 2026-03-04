import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Phone, Mail, Clock, MapPin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const HOURS = [
  { day: "Δευτέρα – Παρασκευή", time: "09:00 – 20:00", open: true },
  { day: "Σάββατο", time: "09:00 – 15:00", open: true },
  { day: "Κυριακή", time: "Κλειστά", open: false },
];

const INFO_CARDS = [
  {
    icon: Phone,
    label: "Τηλέφωνο",
    value: "698 188 2005",
    href: "tel:+306981882005",
    cta: "Κλήση τώρα",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "698 188 2005",
    href: "https://wa.me/306981882005",
    cta: "Στείλε μήνυμα",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    glow: "group-hover:shadow-green-500/20",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@hitechdoctor.com",
    href: "mailto:info@hitechdoctor.com",
    cta: "Στείλε email",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    glow: "group-hover:shadow-primary/20",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("Επικοινωνία από hitechdoctor.com");
    const body = encodeURIComponent(
      `Όνομα: ${form.name}\nΤηλέφωνο: ${form.phone}\n\nΜήνυμα:\n${form.message}`
    );
    window.location.href = `mailto:info@hitechdoctor.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <Helmet>
        <title>Επικοινωνία | HiTech Doctor – Επισκευές Κινητών & Τεχνολογία</title>
        <meta name="description" content="Επικοινωνήστε με το HiTech Doctor. Τηλέφωνο, WhatsApp, email και χάρτης. Επισκευές κινητών, tablet, laptop και gaming console." />
        <meta property="og:title" content="Επικοινωνία | HiTech Doctor" />
        <meta property="og:description" content="Βρείτε μας στον χάρτη ή επικοινωνήστε μαζί μας τηλεφωνικά και email." />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-background">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pt-10 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <MapPin className="w-4 h-4" />
            Επικοινωνία
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
            Μιλήστε μαζί μας{" "}
            <span className="text-primary">σήμερα</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Έχετε πρόβλημα με συσκευή σας; Είμαστε εδώ για να βοηθήσουμε — γρήγορα και αξιόπιστα.
          </p>
        </section>

        {/* ── Info cards ───────────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INFO_CARDS.map((card) => (
              <a
                key={card.label}
                href={card.href}
                target={card.href.startsWith("http") ? "_blank" : undefined}
                rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                data-testid={`contact-card-${card.label.toLowerCase()}`}
                className={`group glass-panel border ${card.bg} rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-xl ${card.glow} hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl ${card.bg} border flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-1">{card.label}</p>
                  <p className={`text-lg font-black ${card.color}`}>{card.value}</p>
                </div>
                <span className={`text-xs font-semibold ${card.color} flex items-center gap-1 mt-auto`}>
                  {card.cta} →
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* ── Map + Hours + Form ────────────────────────────────────────── */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Map */}
            <div className="glass-panel border border-white/8 rounded-2xl overflow-hidden" data-testid="contact-map">
              <div className="p-4 border-b border-white/8 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Βρείτε μας στον χάρτη</span>
              </div>
              <div className="relative" style={{ paddingBottom: "75%" }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3146.0390747146344!2d23.679208700000004!3d37.9528736!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14a1bd64efaba529%3A0x8a6b3e558d0dc3d7!2sHitechDoctor!5e0!3m2!1sel!2sgr!4v1772586111895!5m2!1sel!2sgr"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(0.95)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="HiTech Doctor στον χάρτη"
                />
              </div>
              <div className="p-4">
                <a
                  href="https://maps.app.goo.gl/hitechdoctor"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-open-maps"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-sm font-semibold transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Άνοιγμα στο Google Maps
                </a>
              </div>
            </div>

            {/* Right: Hours + Quick form */}
            <div className="flex flex-col gap-4">

              {/* Hours */}
              <div className="glass-panel border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/8">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Ώρες Λειτουργίας</span>
                </div>
                <div className="flex flex-col gap-2">
                  {HOURS.map((h) => (
                    <div key={h.day} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-muted-foreground">{h.day}</span>
                      <span className={`text-sm font-bold ${h.open ? "text-emerald-400" : "text-red-400/70"}`}>
                        {h.time}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground/50 mt-3 pt-3 border-t border-white/8">
                  * Εκτός αδείας / αργιών. Για επείγοντα καλέστε στο 698 188 2005.
                </p>
              </div>

              {/* Quick contact form */}
              <div className="glass-panel border border-white/8 rounded-2xl p-5 flex-1">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/8">
                  <Send className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold">Γρήγορο Μήνυμα</span>
                </div>

                {sent ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Send className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-base font-bold text-emerald-400">Ευχαριστούμε!</p>
                    <p className="text-sm text-muted-foreground">Θα επικοινωνήσουμε μαζί σας σύντομα.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary mt-2"
                      onClick={() => { setSent(false); setForm({ name: "", phone: "", message: "" }); }}
                    >
                      Νέο μήνυμα
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Όνομα</label>
                      <input
                        type="text"
                        required
                        data-testid="input-contact-name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        placeholder="Το όνομά σας"
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Τηλέφωνο</label>
                      <input
                        type="tel"
                        data-testid="input-contact-phone"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="69x xxx xxxx"
                        className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1 block">Μήνυμα</label>
                      <textarea
                        required
                        rows={4}
                        data-testid="input-contact-message"
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Περιγράψτε το πρόβλημά σας..."
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 transition-colors resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      data-testid="btn-contact-submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-xl gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Αποστολή Μηνύματος
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
