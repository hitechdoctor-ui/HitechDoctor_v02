import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { ReviewsSection } from "@/components/reviews-section";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Wrench, Shield, Clock, Award, Users, Heart, ArrowRight, Phone } from "lucide-react";

const TEAM = [
  { name: "Δημήτρης", role: "Κύριος Τεχνικός iPhone & Apple", years: "8+ χρόνια εμπειρία" },
  { name: "Νίκος", role: "Τεχνικός Android & Samsung", years: "6+ χρόνια εμπειρία" },
  { name: "Ελένη", role: "Τεχνικός Laptop & Tablet", years: "5+ χρόνια εμπειρία" },
];

const STATS = [
  { value: "3.000+", label: "Επισκευές ολοκληρώθηκαν" },
  { value: "98%", label: "Ικανοποιημένοι πελάτες" },
  { value: "1 ώρα", label: "Μέσος χρόνος επισκευής" },
  { value: "6 μήνες", label: "Εγγύηση εργασίας" },
];

export default function About() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "Σχετικά με εμάς — HiTech Doctor",
    "url": "https://hitechdoctor.com/sxetika-me-mas",
    "description": "Επαγγελματική επισκευή κινητών τηλεφώνων στην Αθήνα.",
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Seo
        title="Σχετικά με εμάς | HiTech Doctor — Επισκευή Κινητών Αθήνα"
        description="Γνωρίστε την ομάδα του HiTech Doctor. Επαγγελματική επισκευή iPhone, Samsung, iPad και laptop στην Αθήνα με 8+ χρόνια εμπειρία."
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Σχετικά με εμάς" }]} className="mb-6" />
          <h1 className="text-4xl sm:text-5xl font-display font-black mb-4">
            Γνωρίστε το <span className="text-primary">HiTech Doctor</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Δεν είμαστε απλώς ένα κατάστημα επισκευής. Είμαστε οι άνθρωποι που θα φερθούν στο κινητό σου σαν να ήταν δικό τους.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl font-display font-bold mb-5">Η ιστορία μας</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>Όλα ξεκίνησαν από ένα σπασμένο iPhone και την απόφαση να μην πληρώσουμε ένα τυχαίο service για δεύτερης ποιότητας δουλειά.</p>
                <p>Σήμερα, με <strong className="text-foreground">8+ χρόνια εμπειρίας</strong>, έχουμε επισκευάσει πάνω από 3.000 συσκευές. iPhone, Samsung, iPad, laptop, PlayStation — αν έχει chip, το φτιάχνουμε.</p>
                <p>Πιστεύουμε ότι ο πελάτης πρέπει να φεύγει από εμάς με πλήρη εικόνα: τι επισκευάστηκε, με ποιο ανταλλακτικό, και γιατί. <strong className="text-foreground">Χωρίς εκπλήξεις στην τιμή. Χωρίς ψεύτικες υποσχέσεις.</strong></p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="bg-card border border-white/8 rounded-2xl p-5 text-center hover:border-primary/30 transition-colors">
                  <p className="text-3xl font-black text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-card/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold mb-8 text-center">Αυτό που μας ξεχωρίζει</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Clock, title: "Ταχύτητα", desc: "Οι περισσότερες επισκευές ολοκληρώνονται σε 1-2 ώρες." },
              { icon: Shield, title: "Εγγύηση", desc: "6 μήνες εγγύηση σε κάθε επισκευή και ανταλλακτικό." },
              { icon: Award, title: "Ποιότητα", desc: "Χρησιμοποιούμε μόνο πιστοποιημένα ανταλλακτικά υψηλής ποιότητας." },
              { icon: Heart, title: "Αξιοπιστία", desc: "Διαφάνεια στην τιμολόγηση. Ότι σου λέμε, κάνουμε." },
            ].map((v) => (
              <div key={v.title} className="bg-card border border-white/8 rounded-2xl p-5 text-center hover:border-primary/20 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center mx-auto mb-3">
                  <v.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{v.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold mb-2 text-center">Η Ομάδα μας</h2>
          <p className="text-muted-foreground text-center mb-8">Άνθρωποι με πάθος για την τεχνολογία — και αλλεργία στις χαλαρές δουλειές.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map((t) => (
              <div key={t.name} className="bg-card border border-white/8 rounded-2xl p-6 text-center hover:border-primary/30 transition-colors">
                <div className="w-16 h-16 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg">{t.name}</h3>
                <p className="text-xs text-primary font-semibold mt-1">{t.role}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.years}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-br from-primary/15 to-blue-500/10 border border-primary/25 rounded-2xl p-8">
            <Wrench className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-3">Ήρθε η ώρα να φτιάξουμε το κινητό σου</h2>
            <p className="text-muted-foreground mb-6">Επικοινωνήστε μαζί μας σήμερα. Εκτίμηση δωρεάν, αποτέλεσμα εγγυημένο.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/epikoinonia">
                <Button className="bg-primary text-primary-foreground h-11 px-6 gap-2">
                  <Phone className="w-4 h-4" />
                  Επικοινωνήστε μαζί μας
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="border-white/20 h-11 px-6 gap-2">
                  Οι Υπηρεσίες μας
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ReviewsSection />
      <Footer />
    </div>
  );
}
