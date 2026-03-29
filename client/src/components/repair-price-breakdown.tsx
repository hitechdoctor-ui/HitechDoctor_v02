import { cn } from "@/lib/utils";
import { formatRepairEuro } from "@shared/repair-pricing";

type Props = {
  /** Τελική τιμή με ΦΠΑ (όπως εμφανίζεται στο site) */
  totalInclVat: number;
  className?: string;
};

export function RepairPriceBreakdownCard({ totalInclVat, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm",
        className
      )}
      data-testid="repair-price-breakdown"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
        Τελική τιμή (με ΦΠΑ)
      </p>
      <p className="text-lg font-extrabold text-primary tabular-nums">{formatRepairEuro(totalInclVat)}</p>
      <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
        Στην τιμή περιλαμβάνεται το ανταλλακτικό, η εργασία και γραπτή εγγύηση 3 μηνών από τη HiTech Doctor.
      </p>
    </div>
  );
}
