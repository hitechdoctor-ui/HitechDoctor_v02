import { Navbar } from "@/components/layout/navbar";
import { Seo } from "@/components/seo";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Wifi,
  HardDrive,
  Battery,
  Shield,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Clock,
  Phone,
  Cpu,
  ServerCrash,
  ScanLine,
} from "lucide-react";
import { Link } from "wouter";

// === Individual services — split one per entry ===
const allServices = [
  {
    id: "episkeui-kiniton",
    icon: Smartphone,
    title: "Επισκευή Κινητών",
    subtitle: "iPhone, Samsung, Xiaomi, Huawei & όλες οι μάρκες",
    description:
      "Αντικατάσταση οθόνης, μπαταρίας, κάμερας και επισκευή πλακέτας. Χρησιμοποιούμε μόνο γνήσια ανταλλακτικά με εγγύηση.",
    features: ["Αλλαγή οθόνης & αφής", "Αντικατάσταση μπαταρίας", "Επισκευή μετά από βρέξιμο", "Επισκευή πλακέτας"],
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d3?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Επισκευή κινητών smartphone iPhone Samsung Θεσσαλονίκη",
    priceFrom: "€20",
    timeFrom: "30 λεπτά",
    tag: "Δημοφιλές",
  },
  {
    id: "episkeui-tablet",
    icon: Tablet,
    title: "Επισκευή Tablet",
    subtitle: "iPad, Samsung Tab, Lenovo, Huawei MatePad",
    description:
      "Επισκευή οθόνης, αντικατάσταση μπαταρίας και επισκευή πλακέτας tablet. Γρήγορη διάγνωση, αξιόπιστη λύση.",
    features: ["Αλλαγή οθόνης tablet", "Αντικατάσταση μπαταρίας", "Επισκευή θύρας φόρτισης", "Επισκευή πλακέτας"],
    image: "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Επισκευή tablet iPad Samsung Θεσσαλονίκη",
    priceFrom: "€30",
    timeFrom: "1 ώρα",
    tag: null,
  },
  {
    id: "episkeui-laptop",
    icon: Laptop,
    title: "Επισκευή Laptop",
    subtitle: "Dell, HP, Lenovo, ASUS, Acer, Apple MacBook",
    description:
      "Επισκευή οθόνης, αναβάθμιση RAM/SSD, αντικατάσταση μπαταρίας, ανανέωση thermal paste και γενική συντήρηση.",
    features: ["Αλλαγή οθόνης laptop", "Αναβάθμιση RAM & SSD", "Αντικατάσταση μπαταρίας", "Καθαρισμός & thermal paste"],
    image: "https://images.unsplash.com/photo-1544099858-75fd73aa1e28?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Επισκευή laptop notebook Θεσσαλονίκη",
    priceFrom: "€35",
    timeFrom: "2 ώρες",
    tag: null,
  },
  {
    id: "episkeui-desktop",
    icon: Monitor,
    title: "Επισκευή Desktop",
    subtitle: "Επιτραπέζιοι υπολογιστές, All-in-One, iMac",
    description:
      "Αναβάθμιση εξαρτημάτων, επισκευή τροφοδοτικού, αντικατάσταση σκληρού δίσκου και πλήρης γενική συντήρηση.",
    features: ["Αντικατάσταση τροφοδοτικού", "Αναβάθμιση RAM & SSD", "Επισκευή κάρτας γραφικών", "Καθαρισμός & συντήρηση"],
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Επισκευή desktop υπολογιστής Θεσσαλονίκη",
    priceFrom: "€40",
    timeFrom: "2 ώρες",
    tag: null,
  },
  {
    id: "it-support",
    icon: Cpu,
    title: "IT Support",
    subtitle: "Τεχνική υποστήριξη επί τόπου ή εξ αποστάσεως",
    description:
      "Format, εγκατάσταση Windows/macOS/Linux, αντιική προστασία, ρύθμιση email και πλήρης IT υποστήριξη για ιδιώτες και επιχειρήσεις.",
    features: ["Format & εγκατάσταση OS", "Αφαίρεση ιών & malware", "Ρύθμιση email & Office", "Απομακρυσμένη υποστήριξη"],
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=900",
    imageAlt: "IT Support υπολογιστών εξ αποστάσεως Θεσσαλονίκη",
    priceFrom: "€40",
    timeFrom: "1 ώρα",
    tag: "Επιχειρήσεις",
  },
  {
    id: "dixtia-wifi",
    icon: Wifi,
    title: "Δίκτυα & Wi-Fi",
    subtitle: "Εγκατάσταση και ρύθμιση δικτύων για σπίτι & επιχείρηση",
    description:
      "Σχεδιασμός και εγκατάσταση ενσύρματων και ασύρματων δικτύων. Ρύθμιση router, access points, VPN και firewall.",
    features: ["Εγκατάσταση Wi-Fi & mesh", "Ρύθμιση router & access point", "Εγκατάσταση VPN", "Ασφάλεια δικτύου"],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Εγκατάσταση δίκτυο Wi-Fi router Θεσσαλονίκη",
    priceFrom: "€50",
    timeFrom: "2 ώρες",
    tag: null,
  },
  {
    id: "anaktisi-dedomenon",
    icon: HardDrive,
    title: "Ανάκτηση Δεδομένων",
    subtitle: "HDD, SSD, USB, κάρτες μνήμης, RAID",
    description:
      "Ανάκτηση αρχείων από κατεστραμμένους, χαλασμένους ή μορφοποιημένους δίσκους. Δωρεάν αξιολόγηση — δεν χρεωνόμαστε αν δεν επιτύχουμε.",
    features: ["Ανάκτηση από HDD/SSD", "Ανάκτηση από USB & κάρτα", "Ανάκτηση μετά από format", "Ανάκτηση από RAID"],
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Ανάκτηση δεδομένων σκληρός δίσκος SSD USB Θεσσαλονίκη",
    priceFrom: "€60",
    timeFrom: "24 ώρες",
    tag: "Δωρεάν αξιολόγηση",
  },
  {
    id: "allagi-batarias",
    icon: Battery,
    title: "Αλλαγή Μπαταρίας",
    subtitle: "Κινητά, tablet, laptop & smartwatch",
    description:
      "Γρήγορη αντικατάσταση μπαταρίας σε κινητά, tablet και laptop. Χρησιμοποιούμε γνήσιες ή πιστοποιημένες μπαταρίες υψηλής χωρητικότητας.",
    features: ["Μπαταρία κινητού", "Μπαταρία tablet", "Μπαταρία laptop", "Μπαταρία smartwatch"],
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Αλλαγή μπαταρία κινητό tablet laptop Θεσσαλονίκη",
    priceFrom: "€15",
    timeFrom: "20 λεπτά",
    tag: "Εξπρές",
  },
  {
    id: "prostasia-iosmon",
    icon: Shield,
    title: "Αντιική Προστασία",
    subtitle: "Αφαίρεση ιών, malware & ransomware",
    description:
      "Πλήρης σάρωση και αφαίρεση κακόβουλου λογισμικού. Εγκατάσταση και ρύθμιση αξιόπιστου antivirus για μακροχρόνια προστασία.",
    features: ["Σάρωση & αφαίρεση ιών", "Αφαίρεση ransomware", "Εγκατάσταση antivirus", "Ρύθμιση τείχους προστασίας"],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Αφαίρεση ιών antivirus υπολογιστής Θεσσαλονίκη",
    priceFrom: "€30",
    timeFrom: "1 ώρα",
    tag: null,
  },
  {
    id: "diagnostiko",
    icon: ScanLine,
    title: "Διαγνωστικός Έλεγχος",
    subtitle: "Πλήρης τεχνικός έλεγχος της συσκευής σας",
    description:
      "Λεπτομερής διαγνωστικός έλεγχος οποιασδήποτε συσκευής. Θα λάβετε αναλυτική έκθεση με τα προβλήματα και τις λύσεις, χωρίς υποχρέωση επισκευής.",
    features: ["Έλεγχος hardware", "Έλεγχος software", "Αναλυτική έκθεση", "Δωρεάν για επισκευές"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=900",
    imageAlt: "Διαγνωστικός έλεγχος τεχνικός υπολογιστής κινητό Θεσσαλονίκη",
    priceFrom: "€10",
    timeFrom: "30 λεπτά",
    tag: null,
  },
];

const whyUsPoints = [
  { icon: Clock, title: "Γρήγορη Εξυπηρέτηση", desc: "Οι περισσότερες επισκευές ολοκληρώνονται αυθημερόν." },
  { icon: Shield, title: "Γραπτή Εγγύηση", desc: "Κάθε εργασία συνοδεύεται από εγγύηση καλής λειτουργίας." },
  { icon: CheckCircle2, title: "Γνήσια Ανταλλακτικά", desc: "Μόνο πιστοποιημένα ανταλλακτικά υψηλής ποιότητας." },
  { icon: Phone, title: "Διαφάνεια & Ενημέρωση", desc: "Σε ενημερώνουμε σε κάθε βήμα — χωρίς κρυφές χρεώσεις." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "HiTech Doctor",
  "url": "https://hitechdoctor.com",
  "description": "Επισκευές κινητών, tablet, laptop, IT Support, ανάκτηση δεδομένων και δίκτυα. Γρήγορη εξυπηρέτηση με εγγύηση.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Υπηρεσίες HiTech Doctor",
    "itemListElement": allServices.map((s, i) => ({
      "@type": "Offer",
      "position": i + 1,
      "name": s.title,
      "description": s.description,
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "EUR",
        "minPrice": s.priceFrom.replace("€", ""),
      },
    })),
  },
};

export default function Services() {
  return (
    <div className="min-h-screen bg-background circuit-bg">
      <Seo
        title="Υπηρεσίες Επισκευών"
        description="Επισκευές κινητών iPhone & Samsung, tablet, laptop, IT Support, ανάκτηση δεδομένων, δίκτυα Wi-Fi. Γρήγορη εξυπηρέτηση με εγγύηση. HiTech Doctor Θεσσαλονίκη."
        url="https://hitechdoctor.com/services"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta name="keywords" content="επισκευή κινητών Θεσσαλονίκη, επισκευή iPhone, επισκευή Samsung, επισκευή tablet, επισκευή laptop, IT support, ανάκτηση δεδομένων, δίκτυα Wi-Fi, αλλαγή οθόνης κινητό, αλλαγή μπαταρία" />
        <link rel="canonical" href="https://hitechdoctor.com/services" />
      </Helmet>

      {/* Background glows */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full blur-[180px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,210,200,0.07) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,130,180,0.07) 0%, transparent 70%)" }} />

      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section className="container mx-auto px-4 pt-10 pb-16 text-center relative">
          <Badge
            variant="outline"
            className="mb-5 border-primary/30 bg-primary/10 text-primary px-4 py-1.5 text-sm font-semibold tracking-wide"
          >
            <Wrench className="w-3.5 h-3.5 mr-1.5" />
            Επαγγελματικές Τεχνολογικές Υπηρεσίες
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-display font-extrabold mb-6 leading-tight text-foreground">
            Υπηρεσίες που{" "}
            <span className="gradient-text">Εμπιστεύεσαι</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Από την επισκευή του κινητού σου έως IT υποστήριξη και δίκτυα — παρέχουμε ολοκληρωμένες λύσεις με γρήγορη εξυπηρέτηση και γραπτή εγγύηση.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Clock, label: "Εξπρές εξυπηρέτηση" },
              { icon: Shield, label: "Γραπτή εγγύηση" },
              { icon: CheckCircle2, label: "Γνήσια ανταλλακτικά" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card pcb-border text-sm text-muted-foreground"
              >
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* ── All Services Grid ── */}
        <section className="container mx-auto px-4 pb-20" aria-label="Κατάλογος υπηρεσιών">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allServices.map((service) => (
              <article
                key={service.id}
                id={service.id}
                className="group relative bg-card pcb-border rounded-2xl overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(0,210,200,0.12)] transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />

                  {/* Icon badge */}
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-background/80 border border-primary/30 flex items-center justify-center icon-glow backdrop-blur-sm">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Tag */}
                  {service.tag && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-semibold">
                      {service.tag}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div>
                    <h2 className="text-lg font-display font-bold text-foreground mb-0.5">{service.title}</h2>
                    <p className="text-xs text-muted-foreground">{service.subtitle}</p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{service.description}</p>

                  {/* Features */}
                  <ul className="space-y-1.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Price & Time */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <span className="text-sm font-bold text-primary">Από {service.priceFrom}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {service.timeFrom}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Why Us ── */}
        <section className="bg-card/50 border-y border-primary/10 py-16" aria-label="Γιατί HiTech Doctor">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-3">Γιατί να μας Επιλέξεις</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Δεν είμαστε απλώς τεχνικοί. Είμαστε συνεργάτες που νοιάζονται για τη συσκευή και τα δεδομένα σου.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyUsPoints.map((p) => (
                <div key={p.title} className="bg-background pcb-border rounded-2xl p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-center icon-glow">
                    <p.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-20 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(0,210,200,0.06) 0%, rgba(0,0,0,0) 50%, rgba(0,130,180,0.06) 100%)" }}
        >
          <div className="absolute inset-0 circuit-bg opacity-50 pointer-events-none" />
          <div className="container mx-auto px-4 text-center relative">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Έτοιμος να Λύσεις το Πρόβλημά σου;
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Επικοινώνησε μαζί μας σήμερα για δωρεάν αξιολόγηση — χωρίς δεσμεύσεις.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/eshop">
                <Button
                  size="lg"
                  className="h-12 px-8 border-0 font-semibold"
                  style={{ background: "linear-gradient(135deg, hsl(185 100% 42%), hsl(200 90% 50%))", boxShadow: "0 0 24px rgba(0,210,200,0.3)" }}
                  data-testid="button-cta-eshop"
                >
                  Δες το eShop
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href="tel:+30-000-000-0000">
                <Button size="lg" variant="outline" className="h-12 px-8 border-primary/30 text-primary" data-testid="button-cta-phone">
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
