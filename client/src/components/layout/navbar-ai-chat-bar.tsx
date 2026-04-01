import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { requestOpenRepairChat } from "@/lib/repair-chat-events";
import { setNavbarAiBarCollapsed } from "@/lib/navbar-ai-bar-dock";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "Ρωτήστε τον AI Doctor για επισκευές, eShop, τιμές…";

/** Μετά από τόσο scroll η μπάρα «μαζεύεται» — η πρόσβαση συνεχίζεται από το κουμπί chat + Sparkles. */
const SCROLL_COLLAPSE_PX = 96;

export function NavbarAiChatBar() {
  const [value, setValue] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const next = y > SCROLL_COLLAPSE_PX;
      setCollapsed(next);
      setNavbarAiBarCollapsed(next);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      setNavbarAiBarCollapsed(false);
    };
  }, []);

  /** Πρώην ⌘K στο GlobalSearch — τώρα εστίαση στη μπάρα AI (αν είναι κρυμμένη, ανεβαίνει η σελίδα στην κορυφή). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) {
          return;
        }
        e.preventDefault();
        const focusBar = () => textareaRef.current?.focus({ preventScroll: false });

        if (window.scrollY > SCROLL_COLLAPSE_PX) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          window.setTimeout(focusBar, 420);
        } else {
          focusBar();
          textareaRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const openChat = useCallback(() => {
    const q = value.trim();
    requestOpenRepairChat(q ? { draftQuery: q } : {});
    setValue("");
  }, [value]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      openChat();
    }
  };

  return (
    <div
      className={cn(
        "w-full overflow-hidden border-primary/20 bg-gradient-to-b from-zinc-200/70 via-zinc-100/80 to-zinc-200/65 dark:from-zinc-950 dark:via-[#060d18] dark:to-zinc-950",
        "motion-safe:transition-[max-height,opacity,margin,padding,border-color] motion-safe:duration-500 motion-safe:ease-out",
        collapsed
          ? "pointer-events-none max-h-0 border-t-0 opacity-0 py-0 [margin-bottom:0]"
          : "max-h-[min(340px,55vh)] border-t-2 opacity-100"
      )}
      role="search"
      aria-label="AI αναζήτηση και chat"
      aria-hidden={collapsed}
    >
      <div
        className={cn(
          "navbar-ai-chat-wrap mx-auto w-full max-w-6xl px-4 pb-3.5 pt-2 sm:px-6",
          collapsed && "navbar-ai-chat-wrap-collapsed"
        )}
      >
        <div className="navbar-ai-ambient-glow" aria-hidden />
        <div
          className={cn(
            "group relative z-[1] flex w-full flex-col gap-0 overflow-hidden rounded-[1.75rem] border-2 border-primary/35 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,165,160,0.12)] backdrop-blur-xl transition-all duration-300 sm:rounded-[2rem]",
            "dark:border-primary/40 dark:bg-[rgba(6,14,26,0.92)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,210,200,0.18),inset_0_1px_0_rgba(0,210,200,0.06)]",
            "focus-within:border-primary/55 focus-within:shadow-[0_12px_40px_rgba(0,165,160,0.2),0_0_0_2px_rgba(0,165,160,0.2)]",
            "dark:focus-within:border-primary/60 dark:focus-within:shadow-[0_16px_48px_rgba(0,210,200,0.15),0_0_0_2px_rgba(0,210,200,0.22)]"
          )}
        >
          <div className="flex gap-3 px-4 pb-1 pt-4 sm:gap-3.5 sm:px-5 sm:pt-5">
            <span
              className="navbar-ai-sparkle-icon mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-cyan-500/15 border border-primary/25 text-primary sm:h-12 sm:w-12"
              aria-hidden
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
            </span>
            <textarea
              ref={textareaRef}
              id="navbar-ai-chat-input"
              rows={2}
              enterKeyHint="send"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={PLACEHOLDER}
              className="max-h-32 min-h-[3.25rem] w-full resize-none overflow-y-auto bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/75 outline-none sm:min-h-[3.5rem] sm:text-base"
              aria-label={PLACEHOLDER}
              autoComplete="off"
              data-testid="navbar-ai-chat-input"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-primary/15 bg-zinc-100/90 px-4 py-2.5 dark:border-primary/20 dark:bg-black/35 sm:px-5 sm:py-3">
            <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-medium leading-snug text-zinc-600 dark:text-zinc-300 sm:max-w-[75%] sm:text-[11px]">
              <span>AI βοηθός επισκευών &amp; eShop · απαντήσεις από τον κατάλογό μας</span>
              <kbd
                className="hidden shrink-0 rounded-md border border-zinc-300/80 bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-zinc-700 shadow-sm dark:border-white/15 dark:bg-white/10 dark:text-zinc-200 sm:inline"
                title="Ctrl+K σε Windows / Linux"
              >
                ⌘K
              </kbd>
            </p>
            <button
              type="button"
              onClick={openChat}
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all sm:h-12 sm:w-12 sm:rounded-[0.85rem]",
                "bg-gradient-to-br from-primary to-cyan-600 text-primary-foreground shadow-lg shadow-primary/30",
                "hover:opacity-95 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
              aria-label="Άνοιγμα AI chat"
              data-testid="navbar-ai-chat-submit"
            >
              <ArrowUp className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
