import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { Breadcrumb } from "@/components/breadcrumb";
import { Link } from "wouter";
import { Package, RotateCcw, Wrench, Mail, Phone, MapPin } from "lucide-react";
import {
  BUSINESS_EMAIL,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_E164,
  formatBusinessAddressOneLine,
} from "@/lib/business-info";

export default function ReturnsPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Πολιτική Επιστροφών & Υπαναχώρησης | HiTech Doctor"
        description="Προθεσμία 14 ημερών για προϊόντα eShop, επιστροφή χρημάτων εντός 7 εργάσιμων ημερών, ξεχωριστές ρυθμίσεις για υπηρεσίες επισκευής. Στοιχεία επικοινωνίας Μοσχάτο."
      />
      <Navbar />

      <section className="bg-gradient-to-b from-card/80 to-background border-b border-white/6 pt-24 pb-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Πολιτική Επιστροφών" }]} className="mb-6" />
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-display font-black">Πολιτική Επιστροφών & Υπαναχώρησης</h1>
          </div>
          <p className="text-xs text-muted-foreground">Τελευταία ενημέρωση: Μάρτιος 2026</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-10 prose-h2:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-foreground prose-ul:text-muted-foreground prose-li:mb-1">
            <p className="text-sm border border-white/10 rounded-xl p-4 bg-white/[0.02]">
              Η <strong>HiTech Doctor</strong> τηρεί διαφανείς κανόνες για αγορές από το ηλεκτρονικό μας κατάστημα και για τις υπηρεσίες επισκευής. Παρακάτω περιγράφουμε ξεχωριστά τα δικαιώματά σας ως καταναλωτή, ώστε να είναι σαφές τι ισχύει σε κάθε περίπτωση.
            </p>

            <h2 className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary shrink-0" />
              1. Προϊόντα (eShop — φυσικά είδη)
            </h2>
            <p>
              Για <strong>προϊόντα</strong> που αγοράζετε από το hitechdoctor.com (π.χ. αξεσουάρ, καινούργια ή μεταχειρισμένα είδη που πωλούνται ως προϊόντα), ως καταναλωτής έχετε δικαίωμα{" "}
              <strong>υπαναχώρησης εντός 14 ημερολογιακών ημερών</strong> από την παραλαβή, σύμφωνα με την ισχύουσα ελληνική και ενωσιακή νομοθεσία, εφόσον το είδος βρίσκεται στην αρχική του κατάσταση, με πλήρη συσκευασία και συνοδευτικά (όπου υπάρχουν), χωρίς σημάδια χρήσης που το καθιστούν μη μεταπωλήσιμο.
            </p>
            <ul>
              <li>Για να ασκήσετε υπαναχώρηση, ενημερώστε μας εγγράφως (email) εντός της προθεσμίας των 14 ημερών.</li>
              <li>Επιστρέφετε το προϊόν με ασφαλή μεταφορά· τα έξοδα επιστροφής επιβαρύνουν τον πελάτη, εκτός αν έχει συμφωνηθεί διαφορετικά ή ο νόμος ορίζει το αντίθετο.</li>
              <li>
                Μετά την έγκριση της επιστροφής και τον έλεγχο της κατάστασης του προϊόντος, η{" "}
                <strong>επιστροφή χρημάτων</strong> πραγματοποιείται <strong>εντός 7 εργάσιμων ημερών</strong> με τον ίδιο ή ισοδύναμο τρόπο πληρωμής που χρησιμοποιήθηκε στην αρχική συναλλαγή, εκτός αν συμφωνηθεί άλλως.
              </li>
            </ul>
            <p>
              Ελαττωματικά προϊόντα ή λάθος αποστολή: επικοινωνήστε άμεσα μαζί μας· θα διευθετήσουμε αντικατάσταση ή επιστροφή χρημάτων σύμφωνα με τον νόμο και τις συνθήκες της παραγγελίας.
            </p>

            <h2 className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary shrink-0" />
              2. Υπηρεσίες επισκευής (εργαστήριο)
            </h2>
            <p>
              Η επισκευή είναι <strong>υπηρεσία</strong> και όχι απλή πώληση προϊόντος. Μετά την ολοκλήρωση της εργασίας και την παράδοση της συσκευής σε λειτουργική κατάσταση,{" "}
              <strong>δεν παρέχεται επιστροφή χρημάτων</strong> για την ίδια την εκτελεσμένη επισκευή, στο πλαίσιο που επιτρέπει ο νόμος για συμβάσεις παροχής υπηρεσιών που έχουν ολοκληρωθεί με τη ρητή συγκατάθεση του πελάτη.
            </p>
            <p>
              Η <strong>εγγύηση</strong> που παρέχουμε για τις επισκευές καλύπτει το <strong>ανταλλακτικό</strong> και την <strong>εργασία</strong> σύμφωνα με τους όρους που σας κοινοποιούνται κατά την παράδοση (διάρκεια, εξαιρέσεις, όρια). Σε περίπτωση επανεμφάνισης του ίδιου προβλήματος εντός εγγύησης, αναλαμβάνουμε διόρθωση σύμφωνα με την πολιτική εγγύησης — όχι επιστροφή χρημάτων για ήδη ολοκληρωμένη επισκευή.
            </p>
            <p className="text-sm">
              Λεπτομέρειες διαδικασίας επισκευής και προσωπικών δεδομένων:{" "}
              <Link href="/oroi-episkeuis" className="text-primary hover:underline">
                Όροι τεχνικού ελέγχου & επισκευής
              </Link>
              .
            </p>

            <h2>3. Επικοινωνία για επιστροφές προϊόντων</h2>
            <p>Για αιτήματα υπαναχώρησης ή επιστροφής προϊόντων eShop, χρησιμοποιήστε:</p>
            <ul className="list-none pl-0 space-y-3 not-prose">
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Email:</strong>{" "}
                  <a href={`mailto:${BUSINESS_EMAIL}`} className="text-primary hover:underline">
                    {BUSINESS_EMAIL}
                  </a>{" "}
                  (αναφέρετε αριθμό παραγγελίας / στοιχεία αγοράς)
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Τηλέφωνο:</strong>{" "}
                  <a href={`tel:${BUSINESS_PHONE_E164.replace(/\s/g, "")}`} className="text-primary hover:underline">
                    {BUSINESS_PHONE_DISPLAY}
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>
                  <strong className="text-foreground">Φυσικό σημείο:</strong> {formatBusinessAddressOneLine()}
                </span>
              </li>
            </ul>

            <h2>4. Σύνδεση με άλλες πολιτικές</h2>
            <p>
              Για τους <Link href="/oroi-chrisis" className="text-primary hover:underline">Όρους χρήσης</Link> του ιστότοπου και του eShop, τους{" "}
              <Link href="/oroi-episkeuis" className="text-primary hover:underline">όρους επισκευής</Link>, τις{" "}
              <Link href="/tropoi-pliromis" className="text-primary hover:underline">μεθόδους πληρωμής</Link> και την{" "}
              <Link href="/politiki-cookies" className="text-primary hover:underline">πολιτική cookies</Link>, ακολουθήστε τους αντίστοιχους συνδέσμους.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
