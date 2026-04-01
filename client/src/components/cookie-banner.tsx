import { useState, useEffect, Fragment } from "react";
import { Link } from "wouter";
import { Cookie, X, Settings2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const COOKIE_KEY = "htd_cookie_consent";
export const COOKIE_CONSENT_EVENT = "htd:cookie-consent";

type ConsentState = "accepted" | "rejected" | "pending";

export function CookieBanner() {
  const [state, setState] = useState<ConsentState>("pending");
  const [showDetails, setShowDetails] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (stored === "accepted" || stored === "rejected") {
      setState(stored);
    }
    setMounted(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setState("accepted");
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: "accepted" }));
  };

  const reject = () => {
    localStorage.setItem(COOKIE_KEY, "rejected");
    setState("rejected");
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: "rejected" }));
  };

  if (!mounted || state !== "pending") return null;

  return (
    <Fragment>
      {/* Overlay */}
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-[1px] pointer-events-none" />

      {/* Banner */}
      <div
        role="dialog"
        aria-label="Ρυθμίσεις Cookies"
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[151] w-full max-w-2xl px-4"
      >
        <div className="bg-card border border-white/15 rounded-2xl shadow-2xl shadow-black/50 p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-foreground">Χρησιμοποιούμε Cookies</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Χρησιμοποιούμε cookies για να βελτιώσουμε την εμπειρία σας στον ιστότοπό μας, να αναλύουμε την επισκεψιμότητα και να σας προβάλλουμε εξατομικευμένο περιεχόμενο.
                Μπορείτε να επιλέξετε ποιες κατηγορίες επιθυμείτε να αποδεχτείτε.{" "}
                <Link href="/politiki-cookies" className="text-primary hover:underline">
                  Πολιτική Cookies
                </Link>
              </p>
            </div>
          </div>

          {/* Details (expandable) */}
          {showDetails && (
            <div id="cookie-banner-details" className="mb-3 p-3 rounded-xl bg-background/60 border border-white/8 text-xs text-muted-foreground space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                <div><span className="font-semibold text-foreground">Απαραίτητα Cookies</span> — Απαιτούνται για τη λειτουργία του site. Πάντα ενεργά.</div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div><span className="font-semibold text-foreground">Cookies Ανάλυσης</span> — Μας βοηθούν να κατανοούμε πώς χρησιμοποιείτε το site.</div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <div><span className="font-semibold text-foreground">Marketing Cookies</span> — Για εξατομικευμένες διαφημίσεις.</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={accept}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-4 text-xs font-semibold flex-1 sm:flex-none"
              data-testid="btn-cookie-accept"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden />
              Αποδοχή Όλων
            </Button>
            <Button
              type="button"
              onClick={reject}
              variant="outline"
              className="border-white/15 hover:border-white/30 h-8 px-4 text-xs flex-1 sm:flex-none"
              data-testid="btn-cookie-reject"
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" aria-hidden />
              Μόνο Απαραίτητα
            </Button>
            <Button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              variant="ghost"
              className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground ml-auto"
              data-testid="btn-cookie-settings"
              aria-expanded={showDetails}
              aria-controls="cookie-banner-details"
            >
              <Settings2 className="w-3.5 h-3.5 mr-1 shrink-0" aria-hidden />
              Ρυθμίσεις
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
