import { cn } from "@/lib/utils";
import {
  breakdownFromTotalInclVat,
  formatRepairEuro,
  REPAIR_WORK_FEE_EUR,
} from "@shared/repair-pricing";

type Props = {
  /** Τελική τιμή με ΦΠΑ (όπως εμφανίζεται στο site) */
  totalInclVat: number;
  className?: string;
};

export function RepairPriceBreakdownCard({ totalInclVat, className }: Props) {
  const b = breakdownFromTotalInclVat(totalInclVat);

  return (
    <div
      className={cn(
        "rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm",
        className
      )}
      data-testid="repair-price-breakdown"
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2.5">
        Ανάλυση τιμής (ενδεικτική)
      </p>
      <dl className="space-y-2">
        <div className="flex justify-between gap-3 text-muted-foreground">
          <dt>Ανταλλακτικό:</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatRepairEuro(b.partNet)}</dd>
        </div>
        <div className="text-muted-foreground">
          <div className="flex justify-between gap-3">
            <dt className="leading-snug pr-2">
              Εργασία &amp; Εγγύηση: {REPAIR_WORK_FEE_EUR} €
            </dt>
            <dd className="shrink-0 font-semibold text-foreground tabular-nums">{formatRepairEuro(b.workFee)}</dd>
          </div>
          <p className="text-[10px] text-muted-foreground/90 mt-1 leading-snug">
            (Περιλαμβάνει 3 μήνες εγγύηση HiTech Doctor)
          </p>
        </div>
        <div className="flex justify-between gap-3 text-muted-foreground">
          <dt>ΦΠΑ 24%:</dt>
          <dd className="font-semibold text-foreground tabular-nums">{formatRepairEuro(b.vatAmount)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-primary/20 pt-2 mt-2 text-foreground">
          <dt className="font-bold">ΣΥΝΟΛΟ:</dt>
          <dd className="font-extrabold text-primary tabular-nums text-base">{formatRepairEuro(b.totalInclVat)}</dd>
        </div>
      </dl>
    </div>
  );
}
