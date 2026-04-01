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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
      <div className="container mx-auto px-4 pb-3 pt-2.5">
        <div
          className={cn(
            "group relative flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-muted/30 px-1 py-1 pl-3 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition-all duration-300",
            "focus-within:border-primary/25 focus-within:bg-muted/40 focus-within:shadow-[0_12px_40px_rgba(0,210,200,0.08),0_0_0_1px_rgba(0,210,200,0.12)]",
            "dark:shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]"
          )}
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/10 border border-primary/20 text-primary"
            aria-hidden
          >
            <Sparkles className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <input
            type="search"
            enterKeyHint="send"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={PLACEHOLDER}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none"
            aria-label={PLACEHOLDER}
            autoComplete="off"
            data-testid="navbar-ai-chat-input"
          />
          <button
            type="button"
            onClick={openChat}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
              "bg-gradient-to-br from-primary to-cyan-600 text-primary-foreground shadow-md shadow-primary/25",
              "hover:opacity-95 active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
            aria-label="Άνοιγμα AI chat"
            data-testid="navbar-ai-chat-submit"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/80 sm:text-left sm:pl-1">
          AI βοηθός επισκευών & eShop · οι απαντήσεις βασίζονται στον κατάλογό μας
        </p>
      </div>
    </div>
  );
}
