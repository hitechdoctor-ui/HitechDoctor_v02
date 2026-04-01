import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Shield, FileText, Lock, UserCheck, AlertTriangle, CheckSquare, Wrench } from "lucide-react";

export default function Terms() {
  return (
    <>
      <Seo
        title="Όροι Τεχνικού Ελέγχου & Επισκευής | HiTech Doctor"
        description="Πολιτική επισκευής, προστασία προσωπικών δεδομένων (GDPR) και δήλωση συγκατάθεσης πελάτη."
      />
      <Navbar />

      <main className="min-h-screen pt-28 pb-20">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Όροι Τεχνικού Ελέγχου<br className="hidden sm:block" /> & Επισκευής
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Παρακαλούμε διαβάστε προσεκτικά τους παρακάτω όρους πριν από την παράδοση της συσκευής σας.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

          {/* Section 1 — Γενικοί Όροι */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 border border-white/8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold">1. Γενικοί Όροι Επισκευής</h2>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Ο πελάτης αποδέχεται την εκτέλεση τεχνικού ελέγχου για τη διάγνωση της βλάβης.
              </p>
              <div className="flex gap-3 p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/20">
                <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <p>
                  Το κατάστημα <strong className="text-foreground">δεν φέρει ευθύνη</strong> για τυχόν απώλεια δεδομένων κατά τη διάρκεια της επισκευής.
                  Συνιστάται η λήψη αντιγράφου ασφαλείας <strong className="text-foreground">(Back-up)</strong> από τον πελάτη πριν την παράδοση.
                </p>
              </div>
              <p>
                Εάν η συσκευή έχει υποστεί επαφή με υγρό ή προηγούμενη κακή παρέμβαση, υπάρχει πιθανότητα
                εμφάνισης επιπλέον προβλημάτων κατά την αποσυναρμολόγηση.
              </p>
            </div>
          </section>

          {/* Section 3 — GDPR */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 border border-white/8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-display font-bold">3. Πολιτική Προστασίας Προσωπικών Δεδομένων (GDPR)</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              Σύμφωνα με τον Κανονισμό (ΕΕ) 2016/679, το κατάστημά μας σας ενημερώνει και ζητά τη
              συγκατάθεσή σας για τα εξής:
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: UserCheck,
                  title: "Συλλογή Δεδομένων",
                  text: "Συλλέγουμε τα στοιχεία σας αποκλειστικά για την επικοινωνία μαζί σας σχετικά με την πορεία της επισκευής και την έκδοση των νόμιμων παραστατικών.",
                  color: "text-green-400",
                  bg: "bg-green-400/8 border-green-400/15",
                },
                {
                  icon: Lock,
                  title: "Πρόσβαση στη Συσκευή",
                  text: "Κατά τη διάρκεια του service, οι τεχνικοί ενδέχεται να έχουν πρόσβαση στο λειτουργικό σύστημα της συσκευής αποκλειστικά και μόνο για τη δοκιμή καλής λειτουργίας των εξαρτημάτων (π.χ. κάμερα, μικρόφωνο, οθόνη).",
                  color: "text-blue-400",
                  bg: "bg-blue-400/8 border-blue-400/15",
                },
                {
                  icon: Shield,
                  title: "Εχεμύθεια",
                  text: "Δεσμευόμαστε ότι δεν θα γίνει καμία αντιγραφή, αποθήκευση ή διαρροή προσωπικών σας αρχείων (φωτογραφίες, μηνύματα, επαφές) σε τρίτους ή σε δικά μας μέσα.",
                  color: "text-primary",
                  bg: "bg-primary/8 border-primary/15",
                },
                {
                  icon: UserCheck,
                  title: "Δικαιώματα",
                  text: "Έχετε το δικαίωμα πρόσβασης, διόρθωσης ή διαγραφής των στοιχείων επικοινωνίας σας από το αρχείο μας μετά την ολοκλήρωση της συναλλαγής.",
                  color: "text-purple-400",
                  bg: "bg-purple-400/8 border-purple-400/15",
                },
              ].map((item) => (
                <div key={item.title} className={`flex gap-4 p-4 rounded-xl border ${item.bg}`}>
                  <item.icon className={`w-5 h-5 ${item.color} shrink-0 mt-0.5`} />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4 — Δήλωση Συγκατάθεσης */}
          <section className="glass-panel rounded-2xl p-6 md:p-8 border border-white/8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                <CheckSquare className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-display font-bold">4. Δήλωση Συγκατάθεσης</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5 font-medium">Δηλώνω υπεύθυνα ότι:</p>
            <div className="space-y-3">
              {[
                "Επιτρέπω την επεξεργασία των δεδομένων μου για τους σκοπούς της επισκευής.",
                "Έχω ενημερωθεί για την ανάγκη λήψης αντιγράφων ασφαλείας και το κατάστημα δεν ευθύνεται για τυχόν απώλεια αρχείων.",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/3 border border-white/8">
                  <div className="w-5 h-5 rounded border-2 border-primary/40 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 mt-4">
              Η συγκατάθεση παρέχεται κατά την υποβολή αιτήματος επισκευής μέσω της αντίστοιχης φόρμας.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}

function Wrench({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
