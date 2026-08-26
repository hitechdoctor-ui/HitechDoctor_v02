import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Seo } from "@/components/seo";
import { ScreenProtectorChecker } from "@/components/ScreenProtectorChecker";
import { Shield } from "lucide-react";

export default function ScreenProtectorCheckerPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="Έλεγχος Συμβατότητας Τζαμιού"
        description="Διαδραστικό εργαλείο για τεχνικούς: βρείτε ποιες συσκευές μοιράζονται το ίδιο προστατευτικό τζάμι οθόνης."
        path="/tools/screen-protector-checker"
      />
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-white/5 bg-gradient-to-b from-cyan-950/20 to-background px-4 py-10 sm:py-14">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <Shield className="h-3.5 w-3.5" aria-hidden />
              Εργαλείο εργαστηρίου
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              Έλεγχος Συμβατότητας Τζαμιού
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Αναζητήστε μάρκα ή μοντέλο για να δείτε όλες τις συσκευές που χρησιμοποιούν το ίδιο
              ακριβώς προστατευτικό τζάμι — ιδανικό για γρήγορο έλεγχο στο εργαστήριο.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-8 sm:py-10">
          <ScreenProtectorChecker />
        </section>
      </main>

      <Footer />
    </div>
  );
}
