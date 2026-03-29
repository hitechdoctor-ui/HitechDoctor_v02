import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { resolveRepairSlugToPath } from "@/lib/repair-slug-resolve";

/**
 * Ανακατεύθυνση από κανονικό URL `/repair/:slug` (για AI & CTA) προς την πραγματική σελίδα επισκευής.
 */
export default function RepairRedirectPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const path = resolveRepairSlugToPath(slug);
    if (path) {
      setLocation(path);
    } else {
      setLocation("/services");
    }
  }, [slug, setLocation]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
      Ανακατεύθυνση…
    </div>
  );
}
