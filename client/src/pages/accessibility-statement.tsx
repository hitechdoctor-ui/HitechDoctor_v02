import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { Accessibility } from "lucide-react";

export default function AccessibilityStatement() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Δήλωση Προσβασιμότητας | HiTech Doctor"
        description="Η δέσμευσή μας για την προσβασιμότητα του ιστοτόπου hitechdoctor.com."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Δήλωση Προσβασιμότητας" }]} className="mb-6" />
          <div className="flex items-center gap-3 mb-2">
            <Accessibility className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-display font-black">Δήλωση Προσβασιμότητας</h1>
          </div>
          <p className="text-xs text-muted-foreground">Τελευταία ενημέρωση: Μάρτιος 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:mb-1">
            <h2>Δέσμευσή μας</h2>
            <p>Το HiTech Doctor δεσμεύεται να διασφαλίσει ότι ο ιστότοπός μας είναι προσβάσιμος σε όσο το δυνατό περισσότερους χρήστες, συμπεριλαμβανομένων ατόμων με αναπηρία.</p>

            <h2>Πρότυπα Προσβασιμότητας</h2>
            <p>Προσπαθούμε να συμμορφωνόμαστε με τις <strong>Κατευθυντήριες Γραμμές Προσβασιμότητας Περιεχομένου Ιστού (WCAG) 2.1</strong> επιπέδου AA.</p>

            <h2>Τεχνικές Δυνατότητες</h2>
            <p>Ο ιστότοπός μας παρέχει:</p>
            <ul>
              <li>Εργαλείο προσβασιμότητας με μεγέθυνση κειμένου, υψηλή αντίθεση, grayscale, απόκρυψη εικόνων, παύση animations και ανάδειξη συνδέσμων</li>
              <li>Υποστήριξη πλοήγησης με πληκτρολόγιο</li>
              <li>Σχολιασμό εικόνων με εναλλακτικό κείμενο (alt text)</li>
              <li>Σαφή δομή επικεφαλίδων (H1, H2, H3)</li>
              <li>Responsive design για κινητά και tablet</li>
              <li>Επαρκή αντίθεση χρωμάτων</li>
            </ul>

            <h2>Γνωστά Ζητήματα</h2>
            <p>Εργαζόμαστε συνεχώς για τη βελτίωση της προσβασιμότητας. Αν αντιμετωπίζετε δυσκολία με οποιοδήποτε περιεχόμενο, παρακαλούμε επικοινωνήστε μαζί μας.</p>

            <h2>Επικοινωνία</h2>
            <p>Αν χρειάζεστε βοήθεια ή έχετε σχόλια για την προσβασιμότητα: <a href="mailto:info@hitechdoctor.com" className="text-primary hover:underline">info@hitechdoctor.com</a> ή τηλέφωνο <a href="tel:6981882005" className="text-primary hover:underline">698 188 2005</a>.</p>

            <h2>Αυτό το Εργαλείο Προσβασιμότητας</h2>
            <p>Μπορείτε να βρείτε το εργαλείο προσβασιμότητας ως <strong>κυκλικό κουμπί με εικονίδιο αναπηρικού αμαξιδίου</strong> στη δεξιά πλευρά της οθόνης, σε όλες τις σελίδες. Παρέχει επιλογές για:</p>
            <ul>
              <li>Αύξηση/μείωση μεγέθους κειμένου</li>
              <li>Προσαρμογή ύψους γραμμής</li>
              <li>Ευανάγνωστη γραμματοσειρά</li>
              <li>Υψηλή αντίθεση, ασπρόμαυρο, απόκρυψη εικόνων</li>
              <li>Μάσκα ανάγνωσης, ανάδειξη συνδέσμων και focus</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
