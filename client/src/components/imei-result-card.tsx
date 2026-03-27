import { Loader2, Shield } from "lucide-react";
import { SiApple } from "react-icons/si";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ImeiLookupSuccess } from "@shared/imei-lookup";

const GLASS =
  "rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_48px_rgba(0,0,0,0.45)]";

type Props = {
  loading?: boolean;
  error?: string | null;
  data?: ImeiLookupSuccess | null;
  /** Shown while loading or when highlighting TAC */
  imeiDigits?: string;
  className?: string;
};

export function ImeiResultCard({ loading, error, data, imeiDigits = "", className }: Props) {
  const displayImei = data?.imei ?? imeiDigits;
  const tac = displayImei.length >= 8 ? displayImei.slice(0, 8) : "—";
  const rest = displayImei.length > 8 ? displayImei.slice(8) : "";

  if (!loading && !error && !data) return null;

  const isError = Boolean(error && !loading);
  return (
    <div className={cn("pointer-events-auto", className)}>
      <div
        className={cn(
          GLASS,
          "p-5 md:p-6 animate-in fade-in slide-in-from-top-2 duration-300",
          isError
            ? "border border-amber-500/35 bg-amber-500/[0.07]"
            : "border border-emerald-500/25 bg-emerald-500/[0.07]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/15">
              <Shield className="h-6 w-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white md:text-xl">Αποτέλεσμα ελέγχου</h3>
              <p className="mt-0.5 text-xs text-zinc-500">Έλεγχος IMEI συσκευής — Model, iCloud, Warranty</p>
            </div>
          </div>
          <SiApple className="h-7 w-7 text-zinc-500 opacity-80" aria-hidden />
        </div>

        {loading && (
          <div className="mt-6 flex items-center justify-center gap-2 py-4 text-sm text-zinc-400">
            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
            Έλεγχος IMEI…
          </div>
        )}

        {error && (
          <p className="mt-5 text-sm text-amber-400/95" role="alert">
            {error}
          </p>
        )}

        {!loading && data && (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-0 bg-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Live — {data.provider === "custom_url" ? "Custom API" : "IMEI.info API"}
              </Badge>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-black/25 px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">IMEI / TAC</dt>
              <dd className="mt-1 font-mono text-sm text-zinc-300">
                <span className="text-cyan-400/90">{data.tac || tac}</span>
                <span className="text-zinc-500">{rest}</span>
              </dd>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3 sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Μοντέλο</dt>
                <dd className="mt-1 font-display text-base font-semibold text-white">{data.model}</dd>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">iCloud / Find My</dt>
                <dd className="mt-1">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1 text-sm font-bold",
                      data.icloud.includes("ON")
                        ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                        : data.icloud.includes("OFF")
                          ? "bg-zinc-500/20 text-zinc-300 ring-1 ring-zinc-500/30"
                          : "bg-white/10 text-zinc-300 ring-1 ring-white/15",
                    )}
                  >
                    {data.icloud}
                  </span>
                </dd>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-black/20 px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Εγγύηση</dt>
                <dd className="mt-1 font-display text-base font-semibold text-white">{data.warranty}</dd>
              </div>
            </div>

            {data.details && (
              <div className="rounded-2xl border border-white/[0.06] bg-black/15 px-4 py-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Πλήρης απάντηση παρόχου</dt>
                <dd className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">{data.details}</dd>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
