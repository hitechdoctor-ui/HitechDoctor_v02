import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  loading: boolean;
  loadingSlot?: ReactNode;
  scrollKey: number;
  className?: string;
};

/**
 * Περιοχή μηνυμάτων με scroll· διατηρεί το ιστορικό στο session και επιτρέπει scroll προς τα πάνω.
 * Auto-scroll στο τέλος όταν προστίθενται μηνύματα ή εμφανίζεται loading.
 */
export function ChatWindow({ children, loading, loadingSlot, scrollKey, className }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevKeyRef = useRef(scrollKey);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = scrollKey > prevKeyRef.current;
    prevKeyRef.current = scrollKey;
    if (grew || loading) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [scrollKey, loading]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 py-3 max-h-[min(50vh,420px)]",
        "[scrollbar-width:thin]",
        className
      )}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      <div className="space-y-3 pr-1">
        {children}
        {loading && loadingSlot}
      </div>
    </div>
  );
}
