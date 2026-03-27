import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiViber } from "react-icons/si";
import { cn } from "@/lib/utils";
import { VIBER_HEX, buildViberUrl } from "@/lib/viber";

const STAGES = [
  { key: "received", en: "Received", el: "Παραλαβή" },
  { key: "diagnosing", en: "Diagnosing", el: "Διάγνωση" },
  { key: "repairing", en: "Repairing", el: "Επισκευή" },
  { key: "ready", en: "Ready for Pickup", el: "Έτοιμο για παραλαβή" },
] as const;

function hashStage(ticket: string): number {
  let h = 2166136261;
  for (let i = 0; i < ticket.length; i++) {
    h ^= ticket.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 4;
}

export function RepairTrackerSection() {
  const [ticket, setTicket] = useState("");
  const [checked, setChecked] = useState(false);

  const activeIndex = useMemo(() => {
    if (!checked || !ticket.trim()) return -1;
    return hashStage(ticket.trim().toUpperCase());
  }, [checked, ticket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.trim()) return;
    setChecked(true);
  };

  return (
    <section
      id="repair-tracker"
      className="scroll-mt-24 rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-zinc-950/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8"
      aria-labelledby="repair-tracker-heading"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
        <div>
          <h2
            id="repair-tracker-heading"
            className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl"
          >
            Check Repair Status
          </h2>
          <p className="text-sm text-muted-foreground">Έλεγχος κατάστασης επισκευής — εισάγετε το Ticket ID</p>
        </div>
        <a
          href={buildViberUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#7360f2]/35 bg-[#7360f2]/12 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#7360f2]/20"
        >
          <SiViber className="h-4 w-4 shrink-0" style={{ color: VIBER_HEX }} />
          <span className="text-[13px] leading-snug">Get real-time updates via Viber</span>
        </a>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <Label htmlFor="ticket-id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ticket ID
          </Label>
          <Input
            id="ticket-id"
            name="ticket"
            autoComplete="off"
            placeholder="π.χ. HTD-2026-00142"
            value={ticket}
            onChange={(e) => {
              setTicket(e.target.value);
              setChecked(false);
            }}
            className="h-11 border-white/12 bg-white/[0.06] font-mono text-sm text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-xl border-0 bg-primary px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
        >
          Έλεγχος
        </Button>
      </form>

      {checked && activeIndex >= 0 && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs text-muted-foreground">
            Επίδειξη κατάστασης (demo) — η πραγματική ροή συντονίζεται μέσω Viber μετά την παραλαβή της συσκευής.
          </p>

          <div className="flex h-3 gap-1 overflow-hidden rounded-full bg-white/10 p-0.5">
            {STAGES.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "h-full min-w-0 flex-1 rounded-full transition-all duration-500",
                  i <= activeIndex ? "bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.45)]" : "bg-white/[0.07]",
                )}
                title={`${s.en} — ${s.el}`}
              />
            ))}
          </div>

          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STAGES.map((stage, i) => {
              const active = i === activeIndex;
              const done = i < activeIndex;
              return (
                <li
                  key={stage.key}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center transition-colors",
                    active && "border-primary/50 bg-primary/10 ring-1 ring-primary/40",
                    done && !active && "border-white/10 bg-white/[0.04] opacity-80",
                    !done && !active && "border-white/8 bg-transparent opacity-50",
                  )}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{stage.en}</p>
                  <p className="mt-1 text-xs font-medium text-foreground">{stage.el}</p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
