/** Εργασία (€) + εγγύηση HiTech Doctor — σταθερό ποσό στη δημόσια τιμολόγηση */
export const REPAIR_WORK_FEE_EUR = 60;
/** ΦΠΑ ως δεκαδικό (24% → 0.24) */
export const REPAIR_VAT_RATE = 0.24;
/** Συντελεστής τελικής τιμής: (ανταλλακτικό + εργασία) × 1.24 */
export const REPAIR_GROSS_MULTIPLIER = 1 + REPAIR_VAT_RATE;

export type RepairPriceBreakdown = {
  /** Καθαρή αξία ανταλλακτικού (χωρίς ΦΠΑ), ώστε (ανταλλακτικό + εργασία) × 1.24 = συνολική τιμή */
  partNet: number;
  workFee: number;
  /** Άθροισμα πριν ΦΠΑ */
  netBeforeVat: number;
  /** Ποσό ΦΠΑ 24% */
  vatAmount: number;
  /** Τελική τιμή με ΦΠΑ */
  totalInclVat: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Από την τελική τιμή με ΦΠΑ T, υπολογίζει ανάλυση: T = (ανταλλακτικό + 60) × 1.24
 */
export function breakdownFromTotalInclVat(totalInclVat: number): RepairPriceBreakdown {
  const t = Math.max(0, totalInclVat);
  const netBeforeVat = t / REPAIR_GROSS_MULTIPLIER;
  const partNet = Math.max(0, netBeforeVat - REPAIR_WORK_FEE_EUR);
  const vatAmount = t - netBeforeVat;
  return {
    partNet: round2(partNet),
    workFee: REPAIR_WORK_FEE_EUR,
    netBeforeVat: round2(netBeforeVat),
    vatAmount: round2(vatAmount),
    totalInclVat: round2(t),
  };
}

export function formatRepairEuro(n: number): string {
  return n.toLocaleString("el-GR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
