import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { CreditCard, Banknote, Building2, Smartphone, Shield, CheckCircle2 } from "lucide-react";

const METHODS = [
  {
    icon: Banknote,
    title: "Μετρητά",
    desc: "Αποδεχόμαστε μετρητά σε ευρώ για όλες τις υπηρεσίες και αγορές.",
    badge: "Πάντα Διαθέσιμο",
    badgeColor: "text-green-400 bg-green-400/10 border-green-400/25",
  },
  {
    icon: CreditCard,
    title: "Κάρτα (Visa / Mastercard)",
    desc: "Πληρωμή με χρεωστική ή πιστωτική κάρτα Visa και Mastercard. Χωρίς επιπλέον χρεώσεις.",
    badge: "Χωρίς Επιβάρυνση",
    badgeColor: "text-primary bg-primary/10 border-primary/25",
  },
  {
    icon: Building2,
    title: "Τραπεζική Μεταφορά",
    desc: "Πληρωμή μέσω τραπεζικής κατάθεσης ή IRIS. Ιδανικό για εταιρικούς πελάτες.",
    badge: "Εταιρείες",
    badgeColor: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  },
  {
    icon: Smartphone,
    title: "IRIS / Άμεση Πληρωμή",
    desc: "Στιγμιαία μεταφορά μέσω IRIS Pay χωρίς προμήθεια.",
    badge: "Ακαριαίο",
    badgeColor: "text-purple-400 bg-purple-400/10 border-purple-400/25",
  },
];

export default function PaymentMethods() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Τρόποι Πληρωμής | HiTech Doctor"
        description="Δείτε τους διαθέσιμους τρόπους πληρωμής στο HiTech Doctor: μετρητά, κάρτα, τραπεζική μεταφορά και IRIS."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Τρόποι Πληρωμής" }]} className="mb-6" />
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-display font-black">Τρόποι Πληρωμής</h1>
          </div>
          <p className="text-muted-foreground">Ευέλικτες επιλογές για κάθε ανάγκη.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {METHODS.map((m) => (
              <div key={m.title} className="bg-card border border-white/8 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
                    <m.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm">{m.title}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>{m.badge}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-3">
            {[
              "Δεν υπάρχουν κρυφές χρεώσεις ή επιβαρύνσεις σε καμία μέθοδο πληρωμής.",
              "Απόδειξη ή τιμολόγιο εκδίδεται για κάθε συναλλαγή.",
              "Εταιρικά τιμολόγια με ΑΦΜ εκδίδονται κατόπιν αιτήματος.",
              "Για πληροφορίες σχετικά με δόσεις, επικοινωνήστε μαζί μας.",
            ].map((n, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{n}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/3 border border-white/8 flex items-start gap-3">
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">Όλες οι πληρωμές με κάρτα διεκπεραιώνονται μέσω πιστοποιημένου POS terminal με πλήρη κρυπτογράφηση. Δεν αποθηκεύουμε στοιχεία καρτών.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
