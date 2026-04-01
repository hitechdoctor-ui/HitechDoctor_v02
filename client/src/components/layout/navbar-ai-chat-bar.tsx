import { useCallback, useState } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { requestOpenRepairChat } from "@/lib/repair-chat-events";
import { cn } from "@/lib/utils";

const PLACEHOLDER = "Ρωτήστε τον AI Doctor για επισκευές, eShop, τιμές…";

export function NavbarAiChatBar() {
  const [value, setValue] = useState("");

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
      className="w-full border-t border-white/[0.06] bg-gradient-to-b from-transparent to-background/40"
      role="search"
      aria-label="AI αναζήτηση και chat"
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-3.5 pt-2 sm:px-6">
        <div
          className={cn(
            "group relative flex w-full flex-col gap-0 overflow-hidden rounded-[1.75rem] border border-white/12 bg-muted/35 shadow-[0_10px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-md transition-all duration-300 sm:rounded-[2rem]",
            "focus-within:border-primary/30 focus-within:bg-muted/45 focus-within:shadow-[0_16px_48px_rgba(0,210,200,0.1),0_0_0_1px_rgba(0,210,200,0.14)]",
            "dark:border-white/10 dark:shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]"
          )}
        >
          {/* Κύρια ζώνη prompt — πιο «ψηλό» κουτί, όχι λεπτή γραμμή */}
          <div className="flex gap-3 px-4 pb-1 pt-4 sm:gap-3.5 sm:px-5 sm:pt-5">
            <span
              className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-cyan-500/15 border border-primary/25 text-primary sm:h-12 sm:w-12"
              aria-hidden
            >
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
            </span>
            <textarea
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

          {/* Κάτω γραμμή ενεργειών — ισορροπεί οπτικά το ύψος (πιο «φαρδύ» block) */}
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-2.5 sm:px-5 sm:py-3">
            <p className="min-w-0 text-[10px] leading-snug text-muted-foreground/85 sm:max-w-[70%] sm:text-[11px]">
              AI βοηθός επισκευών &amp; eShop · απαντήσεις από τον κατάλογό μας
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
