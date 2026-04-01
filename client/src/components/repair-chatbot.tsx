import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { RepairRequestModal } from "@/components/repair-request-modal";
import {
  normalizeCtaHref,
  REPAIR_CHAT_WELCOME,
  RepairAssistantMessageRow,
  resolveChatLink,
  shouldOpenRepairQuoteModal,
} from "@/components/repair-chat-markup";
import { MessageCircle, X, Send, Loader2, Bot, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { fetchRepairAssistantReply, type RepairAssistantTurn } from "@/lib/repair-assistant-api";
import { OPEN_REPAIR_CHAT_EVENT, type OpenRepairChatDetail } from "@/lib/repair-chat-events";
import {
  detectRepairChatClientContext,
  buildRepairChatContextualWelcome,
  type RepairChatClientContext,
} from "@/lib/repair-chat-device";
import { COOKIE_CONSENT_EVENT } from "@/components/cookie-banner";
import { resolveRepairSlugToPathWithFallbacks } from "@/lib/repair-slug-resolve";
import type { RepairChatCta } from "@shared/repair-assistant";
import { guessDeviceModelFromMessages } from "@shared/repair-assistant";
import { getVisitStoreUpsellCopy, resolveRepairSubmitUpsell } from "@/lib/repair-submit-upsell";
import {
  getNavbarAiBarCollapsed,
  subscribeNavbarAiBarCollapsed,
} from "@/lib/navbar-ai-bar-dock";

type Turn = RepairAssistantTurn;

const WELCOME = REPAIR_CHAT_WELCOME;

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

export function RepairChatbot() {
  const { toast } = useToast();
  const [loc, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  openRef.current = open;
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
  const [navbarAiBarCollapsed, setNavbarAiBarCollapsed] = useState(getNavbarAiBarCollapsed);
  const clientContextRef = useRef<RepairChatClientContext>("desktop");

  useEffect(() => {
    return subscribeNavbarAiBarCollapsed(setNavbarAiBarCollapsed);
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    clientContextRef.current = detectRepairChatClientContext(navigator.userAgent);
  }, []);

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

  // ── Open από hero, mobile nav, μπάρα AI στο Navbar ─────────────────────────
  useEffect(() => {
    const openFromHero = (e: Event) => {
      const detail = (e as CustomEvent<OpenRepairChatDetail>).detail ?? {};
      setOpen(true);
      const q = detail.draftQuery?.trim();
      if (q) {
        setInput(q);
        return;
      }
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
        const ctx = detectRepairChatClientContext(ua);
        return [{ role: "assistant" as const, content: buildRepairChatContextualWelcome(ctx) }];
      });
    };
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
          // Χωρίς αυτόματο άνοιγμα — μόνο badge αν το chat είναι κλειστό
          if (!openRef.current) setUnreadCount((n) => n + 1);
          break;
        }
      }
    };

    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // ── Post-form upsell message in chat (ίδια λογική με το modal επιτυχίας) ──
  const handleRepairFormSuccess = useCallback(() => {
    const deviceName = repairFormDeviceName || "τη συσκευή σας";
    const pathOnly = (loc.split("?")[0] || "/").trim() || "/";
    const notesFromChat = messages.map((m) => m.content).join("\n");
    const upsell = resolveRepairSubmitUpsell({
      pathname: pathOnly,
      deviceName,
      notes: notesFromChat,
      temperedGlassOffer: undefined,
    });

    if (upsell.kind === "tempered") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: `Με την ολοκλήρωση της επισκευής (αλλαγή οθόνης ή μπαταρίας) στο ${deviceName}, μπορείτε να προσθέσετε νέο tempered glass με έκπτωση 50% στο κατάστημα· δείτε επίσης θήκες στο eShop για πλήρη προστασία.`,
          ctas: [{ label: "Τζάμια προστασίας −50%", href: "https://hitechdoctor.com/eshop?tab=screen-protectors" }],
        },
      ]);
    } else {
      const v = getVisitStoreUpsellCopy(upsell.variant, null);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: v.body.trim(),
          ctas: [{ label: v.linkLabel, href: v.linkHref }],
        },
      ]);
    }
    setOpen(true);
  }, [repairFormDeviceName, loc, messages]);

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
      const data = await fetchRepairAssistantReply({
        messages: next,
        serviceTermsAccepted: true,
        clientContext: clientContextRef.current,
      });
      if (!data.ok) {
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
  }, [input, loading, messages, serviceTermsAccepted, toast, setLocation]);

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
              className="shrink-0 h-10 w-10 rounded-xl text-foreground hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Κλείσιμο"
            >
              <X className="h-5 w-5 stroke-[2.5]" aria-hidden />
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
              <RepairAssistantMessageRow
                key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
                turn={m}
                onRepairQuoteCta={() => {
                  setRepairFormDeviceName(
                    guessDeviceModelFromMessages(messages.map((t) => ({ role: t.role, content: t.content })))
                  );
                  setRepairFormOpen(true);
                }}
              />
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
        {navbarAiBarCollapsed && !open && (
          <span
            className="pointer-events-none absolute -left-0.5 -top-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-br from-primary/90 to-cyan-600 text-primary-foreground shadow-md motion-safe:animate-pulse"
            aria-hidden
          >
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} />
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
