import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { Link } from "wouter";
import { FileText } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Όροι Χρήσης Ιστότοπου & eShop | HiTech Doctor"
        description="Όροι χρήσης του hitechdoctor.com, ηλεκτρονικού καταστήματος και online υπηρεσιών. Σύνδεση με πολιτική επιστροφών και όρους επισκευής."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Όροι Χρήσης" }]} className="mb-6" />
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-display font-black">Όροι Χρήσης Ιστότοπου & eShop</h1>
          </div>
          <p className="text-xs text-muted-foreground">Τελευταία ενημέρωση: Μάρτιος 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-8 prose-h2:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:mb-1">
            <p>
              Ο ιστότοπος <strong>hitechdoctor.com</strong> λειτουργεί από την επιχείρηση <strong>HiTech Doctor</strong>. Με την πλοήγηση, την παραγγελία προϊόντων ή τη χρήση υπηρεσιών μέσω του site, αποδέχεστε τους παρόντες όρους. Αν διαφωνείτε, παρακαλούμε μην χρησιμοποιείτε τον ιστότοπο.
            </p>

            <h2>1. Πεδίο εφαρμογής</h2>
            <p>
              Οι παρόντες όροι καλύπτουν τη χρήση του ιστότοπου, το ηλεκτρονικό κατάστημα (eShop) και τις online πληροφορίες/κρατήσεις που σχετίζονται με τις δραστηριότητές μας. Η <strong>επισκευή συσκευών</strong> διέπεται επιπλέον από τους{" "}
              <Link href="/oroi-episkeuis" className="text-primary hover:underline">
                Όρους τεχνικού ελέγχου & επισκευής
              </Link>
              , τους οποίους αποδέχεστε κατά την παράδοση της συσκευής.
            </p>

            <h2>2. Προϊόντα & παραγγελίες</h2>
            <p>
              Οι περιγραφές, οι φωτογραφίες και οι τιμές στο eShop στοχεύουν στην ακριβή απεικόνιση των προϊόντων. Ενδέχεται τεχνικά σφάλματα ή εκπτώσεις που διορθώνονται χωρίς προειδοποίηση. Η ολοκλήρωση πώλησης επιβεβαιώνεται με την αποστολή σχετικού μηνύματος ή παραστατικού, σύμφωνα με τη διαδικασία checkout.
            </p>

            <h2>3. Επιστροφές προϊόντων & υπαναχώρηση</h2>
            <p>
              Για προϊόντα eShop ισχύει η{" "}
              <Link href="/politiki-epistrofon" className="text-primary hover:underline">
                Πολιτική επιστροφών & υπαναχώρησης
              </Link>
              , συμπεριλαμβανομένης της προθεσμίας 14 ημερών και της επιστροφής χρημάτων εντός 7 εργάσιμων ημερών όπου προβλέπεται.
            </p>

            <h2>4. Πληρωμές & ασφάλεια</h2>
            <p>
              Οι διαθέσιμοι τρόποι πληρωμής περιγράφονται στη σελίδα{" "}
              <Link href="/tropoi-pliromis" className="text-primary hover:underline">Τρόποι πληρωμής</Link>. Φροντίζουμε για ασφαλείς συνδέσεις (HTTPS)· η ασφάλεια της συσκευής και των διαπιστευτηρίων σας εξαρτάται και από εσάς.
            </p>

            <h2>5. Περιορισμός ευθύνης</h2>
            <p>
              Ο ιστότοπος παρέχεται «ως έχει». Δεν ευθυνόμαστε για έμμεσες ζημίες από χρήση ή αδυναμία πρόσβασης, εκτός όπου ο νόμος απαγορεύει τον περιορισμό. Για υπηρεσίες επισκευής ισχύουν οι ειδικότεροι όροι του εργαστηρίου.
            </p>

            <h2>6. Προσωπικά δεδομένα & cookies</h2>
            <p>
              Η επεξεργασία δεδομένων για επισκευές και παραγγελίες περιγράφεται στους όρους επισκευής και στην{" "}
              <Link href="/politiki-cookies" className="text-primary hover:underline">Πολιτική cookies</Link>. Χρησιμοποιούμε cookies σύμφωνα με την ενημέρωση που λαμβάνετε μέσω του banner συναίνεσης.
            </p>

            <h2>7. Εφαρμοστέο δίκαιο</h2>
            <p>
              Το ελληνικό δίκαιο διέπει τους παρόντες όρους. Αρμόδια για την επίλυση διαφορών ορίζονται τα δικαστήρια των Αθηνών, χωρίς να παραβλάπτονται τα υποχρεωτικά δικαιώματα του καταναλωτή.
            </p>

            <h2>8. Επικοινωνία</h2>
            <p>
              Για ερωτήσεις σχετικά με τους παρόντες όρους:{" "}
              <Link href="/epikoinonia" className="text-primary hover:underline">Επικοινωνία</Link>.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
