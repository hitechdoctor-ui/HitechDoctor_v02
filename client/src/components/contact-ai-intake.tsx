import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Loader2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export type ContactAiFields = {
  name: string | null;
  phone: string | null;
  email: string | null;
  device_model: string | null;
  message: string | null;
};

type Props = {
  onExtracted: (fields: ContactAiFields) => void;
  className?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function ContactAiIntake({ onExtracted, className = "" }: Props) {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseTextRef = useRef("");

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognitionCtor());
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setError("Η φωνητική υπαγόρευση δεν υποστηρίζεται σε αυτόν τον browser. Γράψτε το κείμενο.");
      return;
    }
    setError(null);
    setHint(null);
    baseTextRef.current = text.trim();
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = "el-GR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let interim = "";
      let finalChunk = "";
      for (let i = 0; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finalChunk += r[0].transcript;
        else interim += r[0].transcript;
      }
      const prefix = baseTextRef.current ? `${baseTextRef.current} ` : "";
      setText(`${prefix}${finalChunk}${interim}`.trim());
      if (finalChunk) {
        baseTextRef.current = `${prefix}${finalChunk}`.trim();
      }
    };
    rec.onerror = (ev) => {
      setListening(false);
      if (ev.error === "not-allowed") {
        setError("Επιτρέψτε πρόσβαση στο μικρόφωνο για υπαγόρευση.");
      } else if (ev.error !== "aborted") {
        setError("Πρόβλημα με την υπαγόρευση. Δοκιμάστε ξανά ή γράψτε το κείμενο.");
      }
    };
    rec.onend = () => setListening(false);
    try {
      rec.start();
      setListening(true);
      setHint("Μιλήστε… π.χ. «Είμαι ο Γιώργος, 698…, iPhone 13, δεν ανοίγει»");
    } catch {
      setError("Δεν ξεκίνησε το μικρόφωνο. Δοκιμάστε ξανά.");
      setListening(false);
    }
  }, [text]);

  async function runExtract() {
    const payload = text.trim();
    if (payload.length < 3) {
      setError("Γράψτε ή υπαγορεύστε λίγο περισσότερα πριν τη συμπλήρωση.");
      return;
    }
    if (listening) stopListening();
    setBusy(true);
    setError(null);
    setHint(null);
    try {
      const res = await apiRequest("POST", "/api/contact/ai-intake", { text: payload });
      const data = (await res.json()) as { fields: ContactAiFields };
      onExtracted(data.fields);
      const filled = Object.entries(data.fields)
        .filter(([, v]) => typeof v === "string" && v.trim())
        .map(([k]) => k);
      setHint(
        filled.length
          ? `Συμπληρώθηκαν: ${filled.join(", ")}. Ελέγξτε και πατήστε Αποστολή.`
          : "Δεν εντοπίστηκαν καθαρά πεδία — συμπληρώστε χειροκίνητα.",
      );
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const apiMsg = raw.includes(": ") ? raw.slice(raw.indexOf(": ") + 2) : raw;
      try {
        const parsed = JSON.parse(apiMsg) as { message?: string };
        setError(parsed.message || "Αποτυχία AI συμπλήρωσης.");
      } catch {
        setError(apiMsg.length < 160 && !apiMsg.startsWith("<") ? apiMsg : "Αποτυχία AI συμπλήρωσης. Δοκιμάστε ξανά.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`rounded-xl border border-primary/25 bg-primary/[0.06] p-3 space-y-2.5 ${className}`}
      data-testid="contact-ai-intake"
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-foreground">Γρήγορη συμπλήρωση με AI</p>
          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
            Μιλήστε ή γράψτε ελεύθερα — συμπληρώνουμε αυτόματα όνομα, τηλέφωνο, email, συσκευή και μήνυμα.
          </p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        disabled={busy}
        placeholder="π.χ. Με λένε Μαρία, 6981234567, maria@email.com, Samsung A54, σπασμένη οθόνη…"
        className="w-full rounded-xl bg-background/50 border border-white/10 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-none"
        data-testid="input-contact-ai-text"
      />

      <div className="flex flex-wrap gap-2">
        {voiceSupported ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => (listening ? stopListening() : startListening())}
            className={`gap-1.5 border-white/15 ${listening ? "border-red-500/50 text-red-400 bg-red-500/10" : ""}`}
            data-testid="btn-contact-ai-mic"
          >
            {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {listening ? "Στοπ" : "Μικρόφωνο"}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground px-1">
            <Keyboard className="w-3 h-3" />
            Φωνή μη διαθέσιμη — γράψτε
          </span>
        )}
        <Button
          type="button"
          size="sm"
          disabled={busy || text.trim().length < 3}
          onClick={() => void runExtract()}
          className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          data-testid="btn-contact-ai-fill"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Συμπλήρωση πεδίων
        </Button>
      </div>

      {error ? (
        <p className="text-[11px] text-red-400 font-medium" role="alert" data-testid="text-contact-ai-error">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p className="text-[11px] text-emerald-400/90 font-medium" data-testid="text-contact-ai-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
