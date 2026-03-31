import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { RepairRequestModal } from "@/components/repair-request-modal";
import { MessageCircle, X, Send, Loader2, Bot, ArrowRight, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getAnalyticsSessionId } from "@/lib/analytics-session";
import { OPEN_REPAIR_CHAT_EVENT } from "@/lib/repair-chat-events";
import { COOKIE_CONSENT_EVENT } from "@/components/cookie-banner";
import { resolveRepairSlugToPathWithFallbacks } from "@/lib/repair-slug-resolve";
import { guessDeviceModelFromMessages, type RepairChatCta } from "@shared/repair-assistant";

type Turn = { role: "user" | "assistant"; content: string; ctas?: RepairChatCta[] };

/**
 * Το URL() με base χαλάει hosts χωρίς σχήμα: `maps.app.goo.gl/x` → `https://hitechdoctor.com/maps.app.goo.gl/x`.
 */
function coerceAmbiguousHref(raw: string): string {
  const s = raw.trim();
  if (!s || s === "#") return s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  const lower = s.toLowerCase();
  const mapOrGoogle =
    lower.startsWith("maps.app.goo.gl") ||
    lower.startsWith("goo.gl") ||
    lower.startsWith("maps.google.") ||
    lower.startsWith("www.google.com/maps") ||
    lower.startsWith("google.com/maps");
  const ourSite = lower.startsWith("hitechdoctor.com") || lower.startsWith("www.hitechdoctor.com");
  if (mapOrGoogle || ourSite) {
    return `https://${s.replace(/^\/+/, "")}`;
  }
  return s;
}

function normalizeCtaHref(href: string): string {
  const coerced = coerceAmbiguousHref(href.trim());
  if (!coerced || coerced === "#") return coerced;
  if (coerced.startsWith("/") && !coerced.startsWith("//")) {
    try {
      return new URL(coerced, "https://hitechdoctor.com").href;
    } catch {
      return `https://hitechdoctor.com${coerced}`;
    }
  }
  try {
    return new URL(coerced).href;
  } catch {
    return coerced.startsWith("http") ? coerced : `https://hitechdoctor.com/${coerced.replace(/^\/+/, "")}`;
  }
}

function isInternalSiteHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "hitechdoctor.com" ||
    h === "www.hitechdoctor.com" ||
    h === "localhost" ||
    h === "127.0.0.1"
  );
}

/**
 * Εσωτερικό → path για wouter `Link`. Εξωτερικό (Maps, κ.λπ.) → πλήρες URL για `<a target="_blank">`.
 * Η παλιά λογική pathname-only έκοβε το host (π.χ. maps.app.goo.gl/xxx → `/xxx` → 404).
 */
function resolveChatLink(href: string): { kind: "internal"; to: string } | { kind: "external"; href: string } {
  const raw = href.trim();
  if (!raw || raw === "#") return { kind: "internal", to: "#" };
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return { kind: "internal", to: raw };
  }
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    try {
      u = new URL(raw, "https://hitechdoctor.com");
    } catch {
      return { kind: "internal", to: raw.startsWith("/") ? raw : `/${raw}` };
    }
  }
  if (isInternalSiteHost(u.hostname)) {
    return { kind: "internal", to: u.pathname + u.search + u.hash };
  }
  return { kind: "external", href: u.href };
}

const ctaBtnClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
  "bg-gradient-to-r from-primary to-cyan-600 text-white shadow-md shadow-primary/25",
  "border border-primary/40 hover:opacity-95 transition-opacity",
  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card text-center",
  "cursor-pointer"
);

/** AI μερικές φορές ξεχνά το action· κουμπιά τύπου «…Αίτημα Προσφοράς» προς σελίδες επισκευής → άνοιγμα φόρμας. */
function shouldOpenRepairQuoteModal(cta: RepairChatCta): boolean {
  if (cta.action === "repair_quote_modal") return true;
  if (!/(αίτημα|προσφορά)/i.test(cta.label)) return false;
  if (!/(επισκευ|desktop|laptop|υπολογιστ|κινητ|iphone|samsung|galaxy|tablet|mac|imac|dell|hp|lenovo)/i.test(cta.label)) {
    return false;
  }
  const h = cta.href.trim();
  if (h === "#" || h === "") return true;
  try {
    const u = new URL(normalizeCtaHref(h));
    if (!isInternalSiteHost(u.hostname)) return false;
    const p = u.pathname;
    if (
      p.startsWith("/services/episkeui-") ||
      /^\/episkevi-/.test(p) ||
      p.startsWith("/repair/")
    ) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

const WELCOME =
  "Γεια σας! Είμαι ο HiTech Doctor. Περιγράψτε μου τι συμβαίνει με τη συσκευή σας (μάρκα, μοντέλο αν το ξέρετε, και το πρόβλημα) — θα σας κατευθύνω στην κατάλληλη επισκευή.";

const INTRO_SESSION_KEY = "htd_chat_intro_done";
const COOKIE_STORE_KEY = "htd_cookie_consent";

// Module-level Set: resets on every page load (no sessionStorage issues)
const shownProactive = new Set<string>();

const PROACTIVE_MSGS: Array<{ key: string; depth: number; text: string; ctas?: RepairChatCta[] }> = [
  {
    key: "p1", depth: 0.30,
    text: "Γεια σας! 👋 Χρειάζεστε επισκευή για κάποια συσκευή; Περιγράψτε μου την βλάβη και θα σας βοηθήσω αμέσως.",
  },
  {
    key: "p2", depth: 0.62,
    text: "Θέλετε να μας στείλετε αίτημα επισκευής; Συμπληρώστε τη φόρμα και θα επικοινωνήσουμε άμεσα!",
    ctas: [{ label: "Αίτημα Επισκευής", href: "#", action: "repair_quote_modal" }],
  },
  {
    key: "p3", depth: 0.88,
    text: "Μπορώ να σας βοηθήσω με κάτι; Ρωτήστε με για τιμές, ώρες λειτουργίας ή οτιδήποτε άλλο!",
  },
];

/** Αποδίδει markdown links [text](url) ως κλικαρίσιμα links χωρίς να σπάσει το layout */
function ChatMessageContent({ content }: { content: string }) {
  const MD_LINK = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = MD_LINK.exec(content)) !== null) {
    if (m.index > last) parts.push(content.slice(last, m.index));
    const resolved = resolveChatLink(normalizeCtaHref(m[2]));
    const linkClass = "text-primary underline underline-offset-2 hover:opacity-80";
    parts.push(
      resolved.kind === "external" ? (
        <a
          key={m.index}
          href={resolved.href}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          {m[1]}
        </a>
      ) : (
        <Link key={m.index} href={resolved.to} className={linkClass}>
          {m[1]}
        </Link>
      )
    );
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push(content.slice(last));
  return <>{parts}</>;
}

export function RepairChatbot() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageScrolled, setPageScrolled] = useState(false);
  const [serviceTermsAccepted, setServiceTermsAccepted] = useState(false);
  const [repairFormOpen, setRepairFormOpen] = useState(false);
  const [repairFormDeviceName, setRepairFormDeviceName] = useState("");
  const [showAttention, setShowAttention] = useState(false);
  const attentionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── Scroll: μόνο για χρωματισμό του κουμπιού (όχι απόκρυψη του παραθύρου) ──
  useEffect(() => {
    const onScroll = () => setPageScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Cookie acceptance + first scroll → attention animation (once/session) ─
  useEffect(() => {
    if (sessionStorage.getItem(INTRO_SESSION_KEY)) return;

    let scrollCleanup: (() => void) | null = null;

    const triggerAttention = () => {
      if (sessionStorage.getItem(INTRO_SESSION_KEY)) return;
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
      setShowAttention(true);
      attentionTimerRef.current = setTimeout(() => setShowAttention(false), 4500);
    };

    const setupScrollListener = () => {
      if (sessionStorage.getItem(INTRO_SESSION_KEY)) return;
      const onFirstScroll = () => {
        if (window.scrollY > 80) {
          triggerAttention();
          window.removeEventListener("scroll", onFirstScroll);
        }
      };
      window.addEventListener("scroll", onFirstScroll, { passive: true });
      scrollCleanup = () => window.removeEventListener("scroll", onFirstScroll);
    };

    const consent = localStorage.getItem(COOKIE_STORE_KEY);
    if (consent === "accepted" || consent === "rejected") {
      setupScrollListener();
    }

    const onCookieConsent = () => setupScrollListener();
    window.addEventListener(COOKIE_CONSENT_EVENT, onCookieConsent);

    return () => {
      scrollCleanup?.();
      window.removeEventListener(COOKIE_CONSENT_EVENT, onCookieConsent);
      if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
    };
  }, []);

  // ── Open from hero button ─────────────────────────────────────────────────
  useEffect(() => {
    const openFromHero = () => setOpen(true);
    window.addEventListener(OPEN_REPAIR_CHAT_EVENT, openFromHero);
    return () => window.removeEventListener(OPEN_REPAIR_CHAT_EVENT, openFromHero);
  }, []);

  // ── Scroll-depth proactive messages → inject into chat ───────────────────
  useEffect(() => {
    const check = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable < 100) return;
      const depth = window.scrollY / scrollable;

      for (const msg of PROACTIVE_MSGS) {
        if (!shownProactive.has(msg.key) && depth >= msg.depth) {
          shownProactive.add(msg.key);

          const newTurn: Turn = { role: "assistant", content: msg.text, ctas: msg.ctas };
          setMessages((prev) => [...prev, newTurn]);
          // Open chat to show the proactive message
          setOpen(true);
          setUnreadCount(0);
          break;
        }
      }
    };

    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // ── Post-form upsell message in chat ─────────────────────────────────────
  const handleRepairFormSuccess = useCallback(() => {
    const deviceName = repairFormDeviceName || "τη συσκευή σας";
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant" as const,
        content: `Επειδή η οθόνη του ${deviceName} είναι ακριβή, προτείνω να βάλουμε και ένα Crystal Clear Tempered Glass με την επισκευή για 100% προστασία· δείτε και μια θήκη στο eShop μας για πλήρη προστασία.`,
        ctas: [{ label: "Τζάμια προστασίας −50%", href: "https://hitechdoctor.com/eshop?tab=screen-protectors" }],
      },
    ]);
    setOpen(true);
  }, [repairFormDeviceName]);

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
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": getAnalyticsSessionId(),
        },
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
        const ctas = data.ctas?.length ? data.ctas : undefined;
        setMessages([...next, { role: "assistant", content: data.reply, ctas }]);

        // Auto-navigate: αν 1 CTA πλοήγησης (όχι φόρμα προσφοράς / όχι #)
        const navCtas = (ctas ?? []).filter(
          (c) => !shouldOpenRepairQuoteModal(c) && c.href && c.href.trim() !== "#"
        );
        if (navCtas.length === 1) {
          const resolved = resolveChatLink(normalizeCtaHref(navCtas[0].href));
          if (resolved.kind === "external") {
            setTimeout(() => window.open(resolved.href, "_blank", "noopener,noreferrer"), 900);
          } else if (resolved.to.startsWith("/")) {
            const slugMatch = resolved.to.match(/^\/repair\/(.+)$/);
            const finalPath = slugMatch
              ? (resolveRepairSlugToPathWithFallbacks(slugMatch[1]) ?? resolved.to)
              : resolved.to;
            if (finalPath !== "#") setTimeout(() => setLocation(finalPath), 900);
          }
        }
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
      {/* Attention bubble: shown once after cookie consent + first scroll */}
      {showAttention && !open && (
        <div
          className="pointer-events-auto animate-in slide-in-from-bottom-2 fade-in duration-500 flex items-center gap-2 rounded-xl border border-primary/30 bg-card/95 backdrop-blur-sm px-3 py-2 shadow-lg shadow-black/30 text-sm font-semibold text-foreground max-w-[min(240px,calc(100vw-2rem))]"
          aria-hidden
        >
          <Bot className="w-4 h-4 text-primary shrink-0" />
          Μπορώ να βοηθήσω;
        </div>
      )}
      {open && (
        <div
          className={cn(
            "pointer-events-auto rounded-2xl border border-primary/20 bg-card/95 backdrop-blur-md flex flex-col overflow-hidden",
            "shadow-[0_8px_40px_rgba(0,0,0,0.45)] max-sm:shadow-2xl",
            /* Κινητό: πλάτος οθόνης με περιθώρια, πάνω από το κάτω μενού/FAB — όχι «κρυμμένο» στη γωνία */
            "max-sm:fixed max-sm:z-[160] max-sm:left-3 max-sm:right-3 max-sm:mx-auto max-sm:bottom-[calc(5.25rem+env(safe-area-inset-bottom)+3.75rem)] max-sm:max-h-[min(72dvh,560px)] max-sm:w-auto max-sm:max-w-lg",
            "sm:relative sm:w-[min(100vw-2rem,400px)] sm:max-h-[min(70vh,560px)]"
          )}
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
              <div className="rounded-xl bg-muted/40 border border-border px-2.5 py-2 text-xs text-muted-foreground leading-snug">
                {WELCOME}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
                data-chat-message
                className={cn(
                  "rounded-xl px-2.5 py-2 text-sm leading-snug whitespace-pre-wrap break-words [&_p]:my-0.5 [&_p+p]:mt-1",
                  m.role === "user"
                    ? "ml-5 bg-primary/15 border border-primary/25 text-foreground"
                    : "mr-3 bg-muted/30 border border-white/8 text-foreground"
                )}
              >
                <ChatMessageContent content={m.content} />
                {m.role === "assistant" && m.ctas && m.ctas.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-1">
                    {m.ctas.map((c, j) => {
                      if (shouldOpenRepairQuoteModal(c)) {
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
                      const resolved = resolveChatLink(normalizeCtaHref(c.href));
                      if (resolved.kind === "internal" && resolved.to === "#") return null;
                      if (resolved.kind === "external") {
                        return (
                          <a
                            key={j}
                            href={resolved.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={ctaBtnClass}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <ArrowRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
                            {c.label}
                          </a>
                        );
                      }
                      return (
                        <Link key={j} href={resolved.to} className={ctaBtnClass}>
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

      {/* Pulsing ring during attention animation */}
      {showAttention && !open && (
        <span
          className="absolute bottom-0 right-0 h-12 w-12 rounded-full animate-ping opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(185 100% 42%) 0%, transparent 70%)" }}
          aria-hidden
        />
      )}

      <div className="relative pointer-events-auto">
        {/* Unread badge */}
        {unreadCount > 0 && !open && (
          <span className="absolute -top-1 -right-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-in zoom-in duration-300">
            {unreadCount}
          </span>
        )}
      <Button
        type="button"
        onClick={() => {
          setOpen((o) => {
            if (!o) setUnreadCount(0); // reset unread when opening
            return !o;
          });
          if (showAttention) {
            setShowAttention(false);
            if (attentionTimerRef.current) clearTimeout(attentionTimerRef.current);
          }
        }}
        className={cn(
          "h-12 w-12 rounded-full shadow-lg border transition-colors duration-300",
          pageScrolled
            ? "border-amber-400/70 bg-gradient-to-br from-amber-400 to-yellow-500 text-neutral-900 hover:opacity-95 shadow-amber-500/35"
            : "border-primary/30 bg-gradient-to-br from-primary to-cyan-600 text-white hover:opacity-95 shadow-primary/25",
          showAttention && !open && "motion-safe:animate-bounce",
          !open && !showAttention && "motion-safe:animate-fab-bounce",
          open && "motion-reduce:animate-none animate-none",
          open && (pageScrolled ? "ring-2 ring-amber-400/60" : "ring-2 ring-primary/50")
        )}
        aria-expanded={open}
        aria-label={open ? "Κλείσιμο συνομιλίας" : "Άνοιγμα συνομιλίας AI Doctor"}
        data-testid="button-repair-chat-toggle"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </Button>
      </div>

      <RepairRequestModal
        open={repairFormOpen}
        onOpenChange={setRepairFormOpen}
        defaultDeviceName={repairFormDeviceName}
        onSubmitSuccess={handleRepairFormSuccess}
      />
    </div>
  );
}
