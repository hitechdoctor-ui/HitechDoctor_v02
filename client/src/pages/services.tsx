import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Smartphone,
  Laptop,
  Shield,
  Zap,
  Wifi,
  HardDrive,
  Battery,
  Monitor,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Clock,
  Phone,
} from "lucide-react";
import { Link } from "wouter";

const mainServices = [
  {
    id: "episkeues-kinition",
    icon: Smartphone,
    title: "Επισκευές Κινητών & Tablet",
    subtitle: "iPhone, Samsung, Xiaomi, Huawei και όλες οι μάρκες",
    description:
      "Εξειδικευμένες επισκευές smartphone και tablet με γνήσια ανταλλακτικά. Κάθε επισκευή γίνεται από πιστοποιημένο τεχνικό και συνοδεύεται από γραπτή εγγύηση.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/20",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    features: [
      "Αλλαγή οθόνης & αφής",
      "Αντικατάσταση μπαταρίας",
      "Επισκευή πλακέτας & μικροηλεκτρονική",
      "Αλλαγή κάμερας & φορτιστή",
      "Επισκευή μετά από βρέξιμο",
      "Ξεκλείδωμα & unlock δικτύου",
      "Ανάκτηση δεδομένων",
    ],
    image:
      "https://images.unsplash.com/photo-1512054502232-10a0a035d672?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Επισκευή κινητών τηλεφώνων iPhone Samsung στη Θεσσαλονίκη",
    priceFrom: "€20",
    timeFrom: "30 λεπτά",
  },
  {
    id: "it-support",
    icon: Laptop,
    title: "IT Support & Υπολογιστές",
    subtitle: "Desktop, Laptop, Mac — επί τόπου ή εξ αποστάσεως",
    description:
      "Πλήρης τεχνική υποστήριξη για επιχειρήσεις και ιδιώτες. Από αναβαθμίσεις υλικού έως εγκατάσταση λογισμικού και προστασία από ιούς — είμαστε εδώ για κάθε πρόβλημα.",
    color: "from-purple-500/20 to-indigo-500/20",
    borderColor: "border-purple-500/20",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    features: [
      "Format & επανεγκατάσταση Windows/macOS",
      "Αναβάθμιση RAM & SSD",
      "Αφαίρεση ιών & malware",
      "Ρύθμιση δικτύου & router",
      "Εγκατάσταση λογισμικού",
      "Απομακρυσμένη υποστήριξη",
      "Backup & ανάκτηση δεδομένων",
    ],
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=900",
    imageAlt: "IT Support υπολογιστών laptop επισκευή Θεσσαλονίκη",
    priceFrom: "€40",
    timeFrom: "1 ώρα",
  },
  {
    id: "dixtia-kai-ptyxiaki",
    icon: Wifi,
    title: "Δίκτυα & Υποδομή",
    subtitle: "Εγκατάσταση και διαχείριση δικτύων για σπίτι & επιχείρηση",
    description:
      "Σχεδιάζουμε και εγκαθιστούμε αξιόπιστα ενσύρματα και ασύρματα δίκτυα. Ρυθμίζουμε routers, access points και VPN για απόλυτη σύνδεση και ασφάλεια.",
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/20",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    features: [
      "Εγκατάσταση Wi-Fi & mesh δικτύων",
      "Ρύθμιση router & access point",
      "Δομημένη καλωδίωση",
      "Εγκατάσταση VPN",
      "Διαχείριση firewall",
      "Παρακολούθηση δικτύου",
      "Δίκτυα για μικρές επιχειρήσεις",
    ],
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Εγκατάσταση δικτύου Wi-Fi επιχείρηση Θεσσαλονίκη",
    priceFrom: "€50",
    timeFrom: "2 ώρες",
  },
  {
    id: "anaktisi-dedomenon",
    icon: HardDrive,
    title: "Ανάκτηση Δεδομένων",
    subtitle: "Σβησμένα αρχεία, χαλασμένος δίσκος, μορφοποιημένη κάρτα",
    description:
      "Χρησιμοποιούμε εξειδικευμένα εργαλεία για να ανακτήσουμε τα δεδομένα σας από κατεστραμμένους σκληρούς δίσκους, SSD, USB και κάρτες μνήμης. Δεν χρεωνόμαστε αν δεν επιτύχουμε.",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/20",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    features: [
      "Ανάκτηση από κατεστραμμένο HDD/SSD",
      "Ανάκτηση σβησμένων αρχείων",
      "Ανάκτηση από USB & κάρτα μνήμης",
      "Ανάκτηση μετά από format",
      "Επισκευή κατεστραμμένου partition",
      "Ανάκτηση από RAID",
      "Δωρεάν αξιολόγηση",
    ],
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Ανάκτηση δεδομένων σκληρός δίσκος SSD USB",
    priceFrom: "€60",
    timeFrom: "24 ώρες",
  },
];

const miniServices = [
  { icon: Battery, title: "Αλλαγή Μπαταρίας", desc: "Για κινητά, laptop & tablet" },
  { icon: Monitor, title: "Επισκευή Οθόνης", desc: "Αντικατάσταση & βαθμονόμηση" },
  { icon: Shield, title: "Αντιική Προστασία", desc: "Εγκατάσταση & σάρωση" },
  { icon: Wrench, title: "Γενική Συντήρηση", desc: "Καθαρισμός, ανανέωση thermal paste" },
];

const whyUsPoints = [
  { icon: Clock, title: "Γρήγορη Εξυπηρέτηση", desc: "Οι περισσότερες επισκευές ολοκληρώνονται αυθημερόν ή σε λίγες ώρες." },
  { icon: Shield, title: "Εγγύηση Επισκευής", desc: "Όλες οι εργασίες μας συνοδεύονται από γραπτή εγγύηση καλής λειτουργίας." },
  { icon: CheckCircle2, title: "Γνήσια Ανταλλακτικά", desc: "Χρησιμοποιούμε μόνο γνήσια ή πιστοποιημένα ανταλλακτικά υψηλής ποιότητας." },
  { icon: Phone, title: "Άμεση Επικοινωνία", desc: "Θα σε ενημερώνουμε σε κάθε βήμα — χωρίς αιφνιδιασμούς στην τιμή." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "HiTech Doctor",
  "url": "https://hitechdoctor.com",
  "description": "Επισκευές κινητών, IT Support και τεχνολογικές υπηρεσίες. Εξειδικευμένο κατάστημα επισκευής smartphone, tablet και υπολογιστών.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Υπηρεσίες HiTech Doctor",
    "itemListElement": mainServices.map((s, i) => ({
      "@type": "Offer",
      "position": i + 1,
      "name": s.title,
      "description": s.description,
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": s.priceFrom.replace("€", ""),
        "priceCurrency": "EUR",
        "minPrice": s.priceFrom.replace("€", ""),
      },
    })),
  },
};

export default function Services() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Υπηρεσίες"
        description="Επισκευές κινητών iPhone & Samsung, IT Support, ανάκτηση δεδομένων και δίκτυα. Γρήγορη εξυπηρέτηση με εγγύηση. HiTech Doctor."
        url="https://hitechdoctor.com/services"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="keywords" content="επισκευή κινητών, IT support, ανάκτηση δεδομένων, επισκευή laptop, αλλαγή οθόνης iPhone, αλλαγή μπαταρίας Samsung, δίκτυα Wi-Fi" />
        <link rel="canonical" href="https://hitechdoctor.com/services" />
      </Helmet>

      {/* Background blobs */}
      <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <Navbar />

      <main>
        {/* Hero */}
        <section className="container mx-auto px-4 pt-10 pb-16 text-center relative">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm">
            <Wrench className="w-3.5 h-3.5 mr-1.5" />
            Επαγγελματικές Τεχνολογικές Υπηρεσίες
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-6 leading-tight">
            Υπηρεσίες που<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-500">
              Εμπιστεύεσαι
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Από την επισκευή του smartphone σου έως τη διαχείριση της υποδομής ΙΤ της επιχείρησής σου — 
            παρέχουμε ολοκληρωμένες λύσεις με γρήγορη εξυπηρέτηση και εγγύηση ποιότητας.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Εξπρές εξυπηρέτηση
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              Γραπτή εγγύηση
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Γνήσια ανταλλακτικά
            </div>
          </div>
        </section>

        {/* Main Services */}
        <section className="container mx-auto px-4 pb-20" aria-label="Κύριες υπηρεσίες">
          <div className="space-y-16">
            {mainServices.map((service, idx) => (
              <article
                key={service.id}
                id={service.id}
                className={`grid lg:grid-cols-2 gap-10 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
              >
                <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                  <div className={`rounded-2xl overflow-hidden border ${service.borderColor} relative`}>
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      className="w-full h-72 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${service.badgeColor}`}>
                        Από {service.priceFrom}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full border font-medium ${service.badgeColor}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {service.timeFrom}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={idx % 2 === 1 ? "lg:order-1" : ""}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} border ${service.borderColor} flex items-center justify-center mb-4`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{service.subtitle}</p>
                  <h2 className="text-3xl font-display font-bold mb-4">{service.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{service.description}</p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8" aria-label={`Λίστα υπηρεσιών ${service.title}`}>
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/eshop">
                    <Button variant="outline" className="border-white/10">
                      Δες σχετικά προϊόντα
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Mini Services */}
        <section className="bg-card/40 border-y border-white/5 py-16" aria-label="Επιπλέον υπηρεσίες">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-display font-bold text-center mb-10">Και πολλά ακόμα…</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {miniServices.map((s) => (
                <Card key={s.title} className="bg-background/50 border-white/5">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="container mx-auto px-4 py-20" aria-label="Γιατί HiTech Doctor">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">Γιατί να μας Επιλέξεις</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Δεν είμαστε απλώς τεχνικοί. Είμαστε συνεργάτες που νοιάζονται για τη συσκευή και τα δεδομένα σου.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUsPoints.map((p) => (
              <div key={p.title} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-cyan-500/10 border-y border-primary/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold mb-4">Έτοιμος να Λύσεις το Πρόβλημά σου;</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Επικοινώνησε μαζί μας σήμερα για δωρεάν αξιολόγηση — χωρίς δεσμεύσεις.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/eshop">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-primary to-blue-600 border-0 shadow-lg shadow-primary/20">
                  Δες το eShop
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="tel:+30-000-000-0000">
                <Button size="lg" variant="outline" className="h-12 px-8 border-white/10">
                  <Phone className="w-4 h-4 mr-2" />
                  Τηλεφωνική Επικοινωνία
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
