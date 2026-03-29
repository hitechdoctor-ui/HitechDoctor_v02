import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RepairRequestModal } from "@/components/repair-request-modal";
import {
  decodeRepairSlugToDisplayName,
  resolveRepairSlugToPathWithFallbacks,
} from "@/lib/repair-slug-resolve";

/**
 * `/repair/:slug` — αν βρεθεί μοντέλο, SPA redirect στην πραγματική σελίδα.
 * Αλλιώς σελίδα «προετοιμασία προσφοράς» + άνοιγμα φόρμας επισκευής.
 */
export default function RepairRedirectPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<"checking" | "fallback">("checking");
  const [modalOpen, setModalOpen] = useState(false);

  const displayName = decodeRepairSlugToDisplayName(slug) || "συσκευή σας";

  useEffect(() => {
    setPhase("checking");
    setModalOpen(false);
    const path = resolveRepairSlugToPathWithFallbacks(slug);
    if (path) {
      setLocation(path);
      return;
    }
    setPhase("fallback");
    const t = window.setTimeout(() => setModalOpen(true), 400);
    return () => window.clearTimeout(t);
  }, [slug, setLocation]);

  if (phase === "checking") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 text-muted-foreground text-sm">
        Ανακατεύθυνση…
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-10 max-w-lg mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
        <Wrench className="w-7 h-7 text-primary" aria-hidden />
      </div>
      <h1 className="text-xl font-display font-bold text-foreground mb-2">
        Προετοιμάζουμε την προσφορά για το {displayName}
      </h1>
      <p className="text-sm text-muted-foreground mb-6 leading-snug">
        Συμπληρώστε το αίτημα επισκευής για ακριβή κόστος και χρόνο — θα επικοινωνήσουμε άμεσα μαζί σας.
      </p>
      <Button
        type="button"
        size="lg"
        className="w-full max-w-sm text-base font-semibold"
        onClick={() => setModalOpen(true)}
      >
        <Wrench className="w-5 h-5 mr-2" aria-hidden />
        Αίτημα προσφοράς επισκευής
      </Button>

      <RepairRequestModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultDeviceName={displayName}
      />
    </div>
  );
}
