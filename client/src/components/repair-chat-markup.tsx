import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { guessDeviceModelFromMessages, type RepairChatCta } from "@shared/repair-assistant";
import type { RepairAssistantTurn } from "@/lib/repair-assistant-api";

/**
 * Το URL() με base χαλάει hosts χωρίς σχήμα: `maps.app.goo.gl/x` → `https://hitechdoctor.com/maps.app.goo.gl/x`.
 */
export function coerceAmbiguousHref(raw: string): string {
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

export function normalizeCtaHref(href: string): string {
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

export function isInternalSiteHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h === "hitechdoctor.com" ||
    h === "www.hitechdoctor.com" ||
    h === "localhost" ||
    h === "127.0.0.1"
  );
}

export function resolveChatLink(href: string): { kind: "internal"; to: string } | { kind: "external"; href: string } {
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

export const repairChatCtaBtnClass = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold",
  "bg-gradient-to-r from-primary to-cyan-600 text-white shadow-md shadow-primary/25",
  "border border-primary/40 hover:opacity-95 transition-opacity",
  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card text-center",
  "cursor-pointer"
);

export function shouldOpenRepairQuoteModal(cta: RepairChatCta): boolean {
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

export const REPAIR_CHAT_WELCOME =
  "Γεια σας! Είμαι ο HiTech Doctor. Περιγράψτε μου τι συμβαίνει με τη συσκευή σας (μάρκα, μοντέλο αν το ξέρετε, και το πρόβλημα) — θα σας κατευθύνω στην κατάλληλη επισκευή.";

/** Αποδίδει markdown links [text](url) ως κλικαρίσιμα links */
export function ChatMessageContent({ content }: { content: string }) {
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

type MessageRowProps = {
  turn: RepairAssistantTurn;
  onRepairQuoteCta: () => void;
};

export function RepairAssistantMessageRow({ turn, onRepairQuoteCta }: MessageRowProps) {
  return (
    <div
      data-chat-message
      className={cn(
        "rounded-xl px-2.5 py-2 text-sm leading-snug whitespace-pre-wrap break-words [&_p]:my-0.5 [&_p+p]:mt-1",
        turn.role === "user"
          ? "ml-5 bg-primary/15 border border-primary/25 text-foreground"
          : "mr-3 bg-muted/30 border border-white/8 text-foreground"
      )}
    >
      <ChatMessageContent content={turn.content} />
      {turn.role === "assistant" && turn.ctas && turn.ctas.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-1">
          {turn.ctas.map((c, j) => {
            if (shouldOpenRepairQuoteModal(c)) {
              return (
                <Button
                  key={j}
                  type="button"
                  className={repairChatCtaBtnClass}
                  onClick={() => {
                    onRepairQuoteCta();
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
                  className={repairChatCtaBtnClass}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <ArrowRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
                  {c.label}
                </a>
              );
            }
            return (
              <Link key={j} href={resolved.to} className={repairChatCtaBtnClass}>
                <ArrowRight className="w-4 h-4 shrink-0 opacity-90" aria-hidden />
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function guessDeviceFromTurns(messages: RepairAssistantTurn[]): string {
  return guessDeviceModelFromMessages(messages.map((t) => ({ role: t.role, content: t.content })));
}
