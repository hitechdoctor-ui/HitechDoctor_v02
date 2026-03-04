import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { Cookie } from "lucide-react";

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Πολιτική Cookies | HiTech Doctor"
        description="Πληροφορίες για τα cookies που χρησιμοποιεί το hitechdoctor.com και πώς μπορείτε να τα διαχειριστείτε."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Πολιτική Cookies" }]} className="mb-6" />
          <div className="flex items-center gap-3 mb-2">
            <Cookie className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-display font-black">Πολιτική Cookies</h1>
          </div>
          <p className="text-xs text-muted-foreground">Τελευταία ενημέρωση: Μάρτιος 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:mb-1">
            <h2>Τι είναι τα Cookies;</h2>
            <p>Τα cookies είναι μικρά αρχεία κειμένου που αποθηκεύονται στη συσκευή σας όταν επισκέπτεστε έναν ιστότοπο. Χρησιμοποιούνται για να θυμάται ο ιστότοπος τις προτιμήσεις σας και να βελτιώνει την εμπειρία πλοήγησης.</p>

            <h2>Τα Cookies που Χρησιμοποιούμε</h2>
            <p><strong>Απαραίτητα Cookies:</strong> Απαιτούνται για τη βασική λειτουργία του ιστοτόπου. Χωρίς αυτά, ορισμένες υπηρεσίες (π.χ. καλάθι αγορών) δεν μπορούν να λειτουργήσουν. Δεν μπορούν να απενεργοποιηθούν.</p>
            <ul>
              <li><strong>htd_cookie_consent</strong> — Αποθηκεύει την επιλογή αποδοχής/απόρριψης cookies. Διάρκεια: 1 χρόνο.</li>
              <li><strong>session</strong> — Αναγνωριστικό περιόδου σύνδεσης. Διάρκεια: περίοδος σύνδεσης.</li>
            </ul>

            <p><strong>Cookies Ανάλυσης (Αναλυτικά):</strong> Μας βοηθούν να κατανοήσουμε πώς οι χρήστες αλληλεπιδρούν με τον ιστότοπο. Όλα τα δεδομένα είναι ανώνυμα.</p>
            <ul>
              <li><strong>_ga, _ga_*</strong> — Google Analytics. Παρακολουθεί επισκεψιμότητα. Διάρκεια: 2 χρόνια.</li>
              <li><strong>_gid</strong> — Google Analytics. Διάρκεια: 24 ώρες.</li>
            </ul>

            <p><strong>Marketing Cookies:</strong> Χρησιμοποιούνται για την προβολή σχετικών διαφημίσεων.</p>
            <ul>
              <li><strong>_fbp</strong> — Facebook Pixel. Διάρκεια: 90 ημέρες.</li>
            </ul>

            <h2>Διαχείριση Cookies</h2>
            <p>Μπορείτε ανά πάσα στιγμή να αλλάξετε τις προτιμήσεις σας κάνοντας κλικ στο κουμπί "Ρυθμίσεις Cookies" ή διαγράφοντας τα cookies μέσα από τις ρυθμίσεις του browser σας.</p>
            <p>Οδηγοί για κύριους browsers: <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Chrome</a> · <a href="https://support.mozilla.org/el/kb/block-websites-storing-cookies-site-data-firefox" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Firefox</a> · <a href="https://support.apple.com/el-gr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Safari</a></p>

            <h2>Επικοινωνία</h2>
            <p>Για ερωτήσεις σχετικά με την Πολιτική Cookies, επικοινωνήστε μαζί μας: <a href="mailto:info@hitechdoctor.com" className="text-primary hover:underline">info@hitechdoctor.com</a></p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
