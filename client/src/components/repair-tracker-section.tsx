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
      className="mx-auto w-full max-w-xl scroll-mt-24 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8"
      aria-labelledby="repair-tracker-heading"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
        <div>
          <h2
            id="repair-tracker-heading"
            className="font-display text-xl font-bold tracking-tight text-foreground md:text-2xl"
          >
            Έλεγχος Κατάστασης Επισκευής
          </h2>
          <p className="text-sm text-muted-foreground">
            Για πραγματική κατάσταση χρησιμοποιήστε τη σελίδα{" "}
            <a href="/check-status" className="text-primary font-medium hover:underline">
              Έλεγχος κατάστασης
            </a>
            . Για αυτόματες ειδοποιήσεις Viber, ανοίξτε το chat μας και στείλτε τον κωδικό{" "}
            <span className="font-mono text-foreground/90">REPR</span> με τον αριθμό αιτήματός σας.
          </p>
        </div>
        <a
          href={buildViberUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-[#7360f2]/30 bg-[#7360f2]/8 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[#7360f2]/15"
        >
          <SiViber className="h-4 w-4 shrink-0" style={{ color: VIBER_HEX }} />
          <span className="text-[13px] leading-snug">Άνοιγμα Viber (HiTech Doctor)</span>
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
            className="h-11 font-mono text-sm"
          />
        </div>
        <Button
          type="submit"
          className="h-11 shrink-0 rounded-xl border-0 bg-primary px-8 font-semibold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90"
        >
          Έλεγχος
        </Button>
      </form>

      {checked && activeIndex >= 0 && (
        <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-xs text-muted-foreground">
            Επίδειξη κατάστασης (demo) — η πραγματική ροή συντονίζεται μέσω Viber μετά την παραλαβή της συσκευής.
          </p>

          <div className="flex h-2.5 gap-1 overflow-hidden rounded-full bg-border p-0.5">
            {STAGES.map((s, i) => (
              <div
                key={s.key}
                className={cn(
                  "h-full min-w-0 flex-1 rounded-full transition-all duration-500",
                  i <= activeIndex ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.4)]" : "bg-muted",
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
                    active && "border-primary/40 bg-primary/8 ring-1 ring-primary/30",
                    done && !active && "border-border bg-muted/40 opacity-80",
                    !done && !active && "border-border bg-transparent opacity-40",
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
