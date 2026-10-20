import { AdminLayout } from "@/components/layout/admin-layout";
import { Seo } from "@/components/seo";
import { Link } from "wouter";
import { ArrowLeft, LineChart, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <Seo title="Ρυθμίσεις" description="Admin Settings" />

      <div className="-mt-1 mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <Link
            href="/admin"
            className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            Επισκόπηση
          </Link>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-primary" aria-hidden />
            Ρυθμίσεις
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Βοήθεια σύνδεσης analytics και τεχνικές ρυθμίσεις
          </p>
        </div>
      </div>

      <div className="space-y-4 max-w-3xl">
        <Card className="bg-card/80 border-white/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="text-base font-display flex items-center gap-2">
              <LineChart className="w-4 h-4 text-blue-400" aria-hidden />
              Google Analytics 4
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Η Επισκόπηση εμφανίζει αριθμούς GA4 μόνο όταν το server είναι ρυθμισμένο. Τα νούμερα
              «Επισκέψεις» στην Επισκόπηση είναι πρώτο-πρόσωπο tracking του ιστοτόπου· το GA4 είναι
              ξεχωριστή πηγή.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <div>
              <p className="text-foreground font-semibold text-xs uppercase tracking-wide mb-2">
                Server (Data API)
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  Ορίστε{" "}
                  <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                    GA4_PROPERTY_ID
                  </code>{" "}
                  (αριθμός property, όχι Measurement ID).
                </li>
                <li>
                  Service account με ρόλο Viewer στο GA4 property· credentials μέσω Google
                  Application Default Credentials στον server.
                </li>
              </ul>
            </div>
            <div>
              <p className="text-foreground font-semibold text-xs uppercase tracking-wide mb-2">
                Frontend (browser tag)
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                <li>
                  Στο build:{" "}
                  <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                    VITE_GA_MEASUREMENT_ID=G-…
                  </code>
                </li>
                <li>Ο επισκέπτης πρέπει να έχει αποδεχτεί cookies ανάλυσης.</li>
              </ul>
            </div>
            <div>
              <p className="text-foreground font-semibold text-xs uppercase tracking-wide mb-2">
                Φίλτρα πρώτο-πρόσωπου tracking
              </p>
              <p className="text-xs sm:text-sm">
                Εξαίρεση IP / health checks:{" "}
                <code className="text-[11px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                  ANALYTICS_EXCLUDE_IPS
                </code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
