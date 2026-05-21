import { createPortal } from "react-dom";
import { Link, useLocation } from "wouter";
import { Home, Wrench, MessageCircle, ShoppingCart } from "lucide-react";
import { requestOpenRepairChat } from "@/lib/repair-chat-events";
import { cn } from "@/lib/utils";

function isRepairsPath(path: string): boolean {
  return (
    path.startsWith("/services") ||
    path.startsWith("/episkevi-") ||
    path.startsWith("/episkevi-v2-") ||
    path.startsWith("/apple-service")
  );
}

export function MobileBottomNav() {
  const [loc] = useLocation();

  /** Portal στο body: αποφεύγει “σπασμένο” fixed όταν κάποιος πρόγονος έχει transform/filter (το fixed γίνεται σχετικό με εκείνο το container αντί για το viewport). */
  const nav = (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[140] w-full border-t border-white/10 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]"
      aria-label="Κύρια πλοήγηση"
    >
      <div className="mx-auto flex h-16 w-full max-w-lg items-stretch justify-around">
        <Link
          href="/"
          className={cn(
            "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation text-muted-foreground transition-colors active:bg-white/5",
            loc === "/" && "text-primary"
          )}
        >
          <Home className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold leading-tight">Αρχική</span>
        </Link>

        <Link
          href="/services"
          className={cn(
            "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation text-muted-foreground transition-colors active:bg-white/5",
            isRepairsPath(loc) && "text-primary"
          )}
        >
          <Wrench className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold leading-tight">Επισκευές</span>
        </Link>

        <button
          type="button"
          onClick={() => requestOpenRepairChat()}
          className="flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation text-muted-foreground transition-colors active:bg-white/5"
          aria-label="Άνοιγμα συνομιλίας AI Doctor"
        >
          <MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold leading-tight">Chat</span>
        </button>

        <Link
          href="/checkout"
          className={cn(
            "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation text-muted-foreground transition-colors active:bg-white/5",
            (loc.startsWith("/checkout") || loc.startsWith("/eshop")) && "text-primary"
          )}
        >
          <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-[10px] font-semibold leading-tight">Καλάθι</span>
        </Link>
      </div>
    </nav>
  );

  if (typeof document === "undefined") return null;
  return createPortal(nav, document.body);
}
