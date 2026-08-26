import {
  BUSINESS_GEMI,
  BUSINESS_TRADE_NAME,
  formatBusinessAddressOneLine,
  formatBusinessAfmDouLine,
} from "@/lib/business-info";
import { cn } from "@/lib/utils";

interface BusinessLegalBlockProps {
  className?: string;
  /** compact = footer · default = contact / legal pages */
  variant?: "default" | "compact";
}

/** Στοιχεία επιχείρησης — μορφή Merchant Center / διαφάνεια καταναλωτή. */
export function BusinessLegalBlock({ className, variant = "default" }: BusinessLegalBlockProps) {
  const textClass =
    variant === "compact"
      ? "text-[11px] text-muted-foreground leading-relaxed"
      : "text-sm text-muted-foreground leading-relaxed";

  return (
    <div className={cn("space-y-1", className)} data-testid="business-legal-block">
      <p className={textClass}>
        <span className="text-muted-foreground/70">Επωνυμία: </span>
        <span className={variant === "compact" ? "text-foreground" : "text-foreground font-medium"}>
          {BUSINESS_TRADE_NAME}
        </span>
      </p>
      <p className={textClass}>{formatBusinessAddressOneLine()}</p>
      <p className={textClass}>
        <span className="text-muted-foreground/70">Αρ. ΓΕΜΗ: </span>
        <span className="font-mono text-primary/90">{BUSINESS_GEMI}</span>
      </p>
      <p className={textClass}>{formatBusinessAfmDouLine()}</p>
    </div>
  );
}
