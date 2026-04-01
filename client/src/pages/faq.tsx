import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { ReviewsSection } from "@/components/reviews-section";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const FAQS = [
  { q: "Πόσο καιρό κρατά μια επισκευή;", a: "Οι περισσότερες επισκευές (αλλαγή οθόνης, μπαταρίας) ολοκληρώνονται σε 1-2 ώρες. Πιο σύνθετες βλάβες (κύκλωμα, υγρά) μπορεί να χρειαστούν 24-48 ώρες." },
  { q: "Υπάρχει εγγύηση στις επισκευές;", a: "Ναι. Παρέχουμε 6 μήνες εγγύηση σε κάθε επισκευή και ανταλλακτικό. Αν εμφανιστεί πρόβλημα σχετικό με την επισκευή μέσα στους 6 μήνες, το διορθώνουμε δωρεάν." },
  { q: "Χρησιμοποιείτε γνήσια ανταλλακτικά;", a: "Χρησιμοποιούμε ανταλλακτικά υψηλής ποιότητας, πιστοποιημένα και συμβατά με τις προδιαγραφές του κατασκευαστή. Για iPhone προτείνουμε πάντα ανταλλακτικά OEM ή γνήσια Apple όπου είναι διαθέσιμα. Σας ενημερώνουμε πάντα για τις επιλογές." },
  { q: "Μπορώ να φέρω κινητό με νερά;", a: "Ναι, αναλαμβάνουμε βλάβες από υγρά. Σημαντικό: μην προσπαθήσεις να ανοίξεις ή να φορτίσεις τη συσκευή πριν έρθεις. Η γρήγορη αντίδραση αυξάνει σημαντικά τις πιθανότητες επιτυχούς επισκευής." },
  { q: "Τι γίνεται αν δεν μπορέσετε να το φτιάξετε;", a: "Δεν χρεώνουμε τίποτα για τη διάγνωση. Αν δεν μπορούμε να επισκευάσουμε τη συσκευή, σας ενημερώνουμε εντίμως και δεν πληρώνετε. Δεν υπάρχουν κρυφές χρεώσεις." },
  { q: "Κάνετε επισκευή και σε laptop;", a: "Ναι! Αναλαμβάνουμε επισκευές laptop (Windows & Mac), tablet (iPad & Android), και gaming console (PlayStation & Nintendo). Επικοινωνήστε μαζί μας για εκτίμηση." },
  { q: "Πώς κλείνω ραντεβού;", a: "Μπορείτε να μας καλέσετε στο 698 188 2005, να μας στείλετε μήνυμα στο Viber, ή να συμπληρώσετε τη φόρμα επικοινωνίας. Εξυπηρετούμε και walk-in χωρίς ραντεβού." },
  { q: "Ποιες είναι οι τιμές επισκευής;", a: "Οι τιμές εξαρτώνται από τη συσκευή και τη βλάβη. Η εκτίμηση είναι δωρεάν. Σας δίνουμε οριστική τιμή πριν ξεκινήσουμε — δεν υπάρχουν εκπλήξεις." },
  { q: "Δέχεστε κάρτα;", a: "Ναι, δεχόμαστε μετρητά, κάρτα (Visa, Mastercard), και μεταφορά. Βλέπε τη σελίδα Τρόποι Πληρωμής για περισσότερες πληροφορίες." },
  { q: "Τι ώρες λειτουργείτε;", a: "Δευτέρα–Παρασκευή: 10:00–19:00. Σάββατο: 10:00–16:00. Κυριακή: Κλειστά. Ειδικά ωράρια τις ημέρες αργιών — ελέγξτε την επικοινωνία μας." },
];

function FAQItem({ panelId, q, a }: { panelId: string; q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <article
      className={`rounded-xl border transition-colors ${open ? "border-primary/30 bg-card" : "border-white/8 bg-card/50 hover:border-white/15"}`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
        aria-controls={panelId}
      >
        <span className="text-sm font-semibold text-foreground pr-2">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-primary shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open ? (
        <p id={panelId} className="text-sm text-muted-foreground leading-relaxed px-5 pb-5 pt-0">
          {a}
        </p>
      ) : null}
    </article>
  );
}

export default function FAQ() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Seo
        title="Συχνές Ερωτήσεις (FAQ) | HiTech Doctor"
        description="Απαντήσεις στις πιο συχνές ερωτήσεις για επισκευή κινητών, εγγύηση, τιμές και ωράριο λειτουργίας."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Συχνές Ερωτήσεις" }]} className="mb-6" />
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-display font-black">Συχνές Ερωτήσεις</h1>
          </div>
          <p className="text-muted-foreground">Ό,τι θέλεις να ξέρεις — απαντημένο με ειλικρίνεια.</p>
        </div>
      </section>

      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="list-none p-0 m-0 space-y-3 mb-12">
          {FAQS.map((f, i) => (
            <li key={i}>
              <FAQItem panelId={`faq-panel-${i}`} q={f.q} a={f.a} />
            </li>
          ))}
        </ul>

        <aside className="bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/20 rounded-2xl p-6 text-center">
          <h2 className="font-bold text-foreground mb-2">Δεν βρήκες απάντηση;</h2>
          <p className="text-sm text-muted-foreground mb-4">Επικοινωνήστε μαζί μας — θα απαντήσουμε μέσα σε λίγα λεπτά.</p>
          <Link href="/epikoinonia">
            <Button className="bg-primary text-primary-foreground">Επικοινωνία</Button>
          </Link>
        </aside>
      </section>

      <ReviewsSection />
      <Footer />
    </div>
  );
}
