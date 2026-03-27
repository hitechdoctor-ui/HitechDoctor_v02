import { cn } from "@/lib/utils";

const TEXT = "Οι τιμές ενδέχεται να τροποποιηθούν χωρίς προειδοποίηση.";

type PriceDisclaimerProps = {
  className?: string;
  /** Αν true, λίγο πιο έντονο (π.χ. κάτω από κύρια τιμή) */
  emphasis?: boolean;
};

/**
 * Διακριτική σημείωση για μεταβολές τιμών — μικρή τυπογραφία, χαμηλή αντίθεση.
 */
export function PriceDisclaimer({ className, emphasis }: PriceDisclaimerProps) {
  return (
    <p
      role="note"
      className={cn(
        "text-[0.65rem] sm:text-[10px] leading-snug tracking-wide",
        emphasis ? "text-muted-foreground/70" : "text-muted-foreground/50",
        className,
      )}
    >
      {TEXT}
    </p>
  );
}
