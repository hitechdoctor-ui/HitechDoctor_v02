import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { RepairRequestModal } from "@/components/repair-request-modal";
import { MessageCircle, X, Send, Loader2, Bot, ArrowRight, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { OPEN_REPAIR_CHAT_EVENT } from "@/lib/repair-chat-events";
import { guessDeviceModelFromMessages, type RepairChatCta } from "@shared/repair-assistant";

type Turn = { role: "user" | "assistant"; content: string; ctas?: RepairChatCta[] };

function normalizeCtaHref(href: string): string {
  try {
    return new URL(href.trim(), "https://hitechdoctor.com").href;
  } catch {
    return href.startsWith("http") ? href : `https://hitechdoctor.com${href.startsWith("/") ? href : `/${href}`}`;
  }
}

/** Ίδιο tab: μόνο path για SPA (χωρίς νέο παράθυρο). */
function toAppPath(href: string): string {
  const h = href.trim();
  if (!h || h === "#") return "#";
  if (h.startsWith("/")) return h;
  try {
    const u = new URL(h);
    return u.pathname + u.search + u.hash;
  } catch {
    return h.startsWith("/") ? h : `/${h}`;
  }
}

const ctaBtnClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold",
  "bg-gradient-to-r from-primary to-cyan-600 text-white shadow-md shadow-primary/25",
  "border border-primary/40 hover:opacity-95 transition-opacity",
  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card text-center"
);

const WELCOME =
  "Γεια σας! Είμαι ο HiTech Doctor. Περιγράψτε μου τι συμβαίνει με τη συσκευή σας (μάρκα, μοντέλο αν το ξέρετε, και το πρόβλημα) — θα σας κατευθύνω στην κατάλληλη επισκευή.";

export function RepairChatbot() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageScrolled, setPageScrolled] = useState(false);
  const [serviceTermsAccepted, setServiceTermsAccepted] = useState(false);
  const [repairFormOpen, setRepairFormOpen] = useState(false);
  const [repairFormDeviceName, setRepairFormDeviceName] = useState("");

  useEffect(() => {
    const onScroll = () => setPageScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const openFromHero = () => setOpen(true);
    window.addEventListener(OPEN_REPAIR_CHAT_EVENT, openFromHero);
    return () => window.removeEventListener(OPEN_REPAIR_CHAT_EVENT, openFromHero);
  }, []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!serviceTermsAccepted) {
      toast({
        variant: "destructive",
        title: "Όροι & εγγύηση",
        description: "Επιλέξτε το πλαίσιο αποδοχής των Όρων Service και της Εγγύησης 3 μηνών πριν την αποστολή.",
      });
      return;
    }
    setInput("");
    const next: Turn[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/chat/repair-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, serviceTermsAccepted: true }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        message?: string;
        ctas?: RepairChatCta[];
        leadEmailSent?: boolean;
      };
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Σφάλμα",
          description: data.message ?? "Δοκιμάστε ξανά αργότερα.",
        });
        setMessages((m) => m.slice(0, -1));
        setInput(text);
        return;
      }
      if (data.leadEmailSent) {
        toast({
          title: "Τα στοιχεία στάλθηκαν",
          description: "Θα επικοινωνήσει μαζί σας τεχνικός μας σύντομα.",
        });
      }
      if (data.reply) {
        setMessages([
          ...next,
          { role: "assistant", content: data.reply, ctas: data.ctas?.length ? data.ctas : undefined },
        ]);
      }
    } catch {
      toast({ variant: "destructive", title: "Σφάλμα δικτύου", description: "Ελέγξτε τη σύνδεσή σας." });
      setMessages((m) => m.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, serviceTermsAccepted, toast]);

  return (
    <div className="relative z-[158] flex flex-col items-end gap-2 pointer-events-none shrink-0">
      {open && (
        <div
          className="pointer-events-auto w-[min(100vw-2rem,400px)] rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.45)] flex flex-col overflow-hidden max-h-[min(70vh,560px)]"
          role="dialog"
          aria-label="Συνομιλία AI Doctor"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-primary/10">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">AI Doctor</p>
                <p className="text-[10px] text-muted-foreground">Εκπαιδευμένος Βοηθός AI επισκευών</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8"
              onClick={() => setOpen(false)}
              aria-label="Κλείσιμο"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <ChatWindow
            scrollKey={messages.length}
            loading={loading}
            loadingSlot={
              <div className="flex items-center gap-2 text-muted-foreground text-xs py-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                Σκέφτομαι…
              </div>
            }
          >
            {messages.length === 0 && (
              <div className="rounded-xl bg-muted/40 border border-border px-3 py-2.5 text-sm text-muted-foreground leading-relaxed">
                {WELCOME}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
                data-chat-message
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm leading-snug whitespace-pre-wrap break-words [&_p]:my-1",
                  m.role === "user"
                    ? "ml-6 bg-primary/15 border border-primary/25 text-foreground"
                    : "mr-4 bg-muted/30 border border-white/8 text-foreground"
                )}
              >
                {m.content}
                {m.role === "assistant" && m.ctas && m.ctas.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {m.ctas.map((c, j) => {
                      if (c.action === "repair_quote_modal") {
                        return (
                          <Button
                            key={j}
                            type="button"
                            className={ctaBtnClass}
                            onClick={() => {
                              setRepairFormDeviceName(
                                guessDeviceModelFromMessages(
                                  messages.map((t) => ({ role: t.role, content: t.content }))
                                )
                              );
                              setRepairFormOpen(true);
                            }}
                          >
                            <Wrench className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
                            {c.label}
                          </Button>
                        );
                      }
                      const path = toAppPath(normalizeCtaHref(c.href));
                      if (path === "#") return null;
                      return (
                        <Link key={j} href={path} className={ctaBtnClass}>
                          <ArrowRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
                          {c.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </ChatWindow>

          <div className="border-t border-white/10 bg-background/80 p-3">
            <label className="flex items-start gap-2.5 cursor-pointer select-none mb-3">
              <input
                type="checkbox"
                checked={serviceTermsAccepted}
                onChange={(e) => setServiceTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-card text-primary focus:ring-primary"
                data-testid="checkbox-repair-chat-terms"
              />
              <span className="text-[11px] leading-snug text-muted-foreground">
                <span className="text-primary font-semibold">*</span> Αποδέχομαι τους Όρους Service και την Εγγύηση 3 μηνών.{" "}
                <Link href="/oroi-episkeuis" className="text-primary hover:underline">
                  Όροι επισκευής
                </Link>
              </span>
            </label>
            <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Περιγράψτε τη βλάβη…"
              className="bg-card border-white/10 text-sm h-10"
              disabled={loading}
              maxLength={4000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              data-testid="input-repair-chat"
            />
            <Button
              type="button"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={loading || !input.trim() || !serviceTermsAccepted}
              onClick={() => void send()}
              aria-label="Αποστολή"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "pointer-events-auto h-12 w-12 rounded-full shadow-lg border transition-colors duration-300",
          pageScrolled
            ? "border-amber-400/70 bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-900 hover:opacity-95 shadow-amber-500/35"
            : "border-primary/30 bg-gradient-to-br from-primary to-cyan-600 text-white hover:opacity-95 shadow-primary/25",
          !open && "motion-safe:animate-fab-bounce",
          open && "motion-reduce:animate-none animate-none",
          open && (pageScrolled ? "ring-2 ring-amber-400/60" : "ring-2 ring-primary/50")
        )}
        aria-expanded={open}
        aria-label={open ? "Κλείσιμο συνομιλίας" : "Άνοιγμα συνομιλίας AI Doctor"}
        data-testid="button-repair-chat-toggle"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </Button>

      <RepairRequestModal
        open={repairFormOpen}
        onOpenChange={setRepairFormOpen}
        defaultDeviceName={repairFormDeviceName}
      />
    </div>
  );
}
