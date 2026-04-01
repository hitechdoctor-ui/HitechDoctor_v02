import { useState, useEffect, Fragment } from "react";
import { X, Accessibility, Type, Eye, Navigation2, Plus, Minus, AlignLeft, AlignCenter, Book, Contrast, Palette, ImageOff, PauseCircle, Link2, Scan, Focus, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Option {
  key: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  deaction: () => void;
}

export function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Record<string, boolean>>({});
  const [fontSize, setFontSize] = useState(100);
  const [lineHeight, setLineHeight] = useState(100);

  const toggle = (key: string, action: () => void, deaction: () => void) => {
    const next = !active[key];
    setActive((prev) => ({ ...prev, [key]: next }));
    if (next) action(); else deaction();
  };

  const applyFontSize = (size: number) => {
    document.documentElement.style.fontSize = `${size}%`;
  };

  const applyLineHeight = (lh: number) => {
    document.documentElement.style.lineHeight = `${lh / 100 * 1.5}`;
  };

  useEffect(() => { applyFontSize(fontSize); }, [fontSize]);
  useEffect(() => { applyLineHeight(lineHeight); }, [lineHeight]);

  const VISUAL_OPTIONS: Option[] = [
    {
      key: "contrast", label: "Υψηλή Αντίθεση", icon: Contrast,
      action: () => document.documentElement.classList.add("a11y-contrast"),
      deaction: () => document.documentElement.classList.remove("a11y-contrast"),
    },
    {
      key: "grayscale", label: "Ασπρόμαυρο", icon: Palette,
      action: () => document.documentElement.classList.add("a11y-grayscale"),
      deaction: () => document.documentElement.classList.remove("a11y-grayscale"),
    },
    {
      key: "hideimages", label: "Απόκρυψη Εικόνων", icon: ImageOff,
      action: () => document.documentElement.classList.add("a11y-hideimages"),
      deaction: () => document.documentElement.classList.remove("a11y-hideimages"),
    },
    {
      key: "pauseanim", label: "Παύση Animations", icon: PauseCircle,
      action: () => document.documentElement.classList.add("a11y-pauseanim"),
      deaction: () => document.documentElement.classList.remove("a11y-pauseanim"),
    },
  ];

  const ORIENT_OPTIONS: Option[] = [
    {
      key: "links", label: "Ανάδειξη Συνδέσμων", icon: Link2,
      action: () => document.documentElement.classList.add("a11y-links"),
      deaction: () => document.documentElement.classList.remove("a11y-links"),
    },
    {
      key: "readmask", label: "Μάσκα Ανάγνωσης", icon: Scan,
      action: () => {
        const mask = document.createElement("div");
        mask.id = "a11y-readmask";
        mask.style.cssText = "position:fixed;pointer-events:none;z-index:9999;left:0;right:0;height:40px;background:rgba(0,210,200,0.15);border-top:2px solid rgba(0,210,200,0.4);border-bottom:2px solid rgba(0,210,200,0.4);top:50%;transform:translateY(-50%)";
        document.body.appendChild(mask);
        const onMove = (e: MouseEvent) => { mask.style.top = `${e.clientY - 20}px`; mask.style.transform = "none"; };
        document.addEventListener("mousemove", onMove);
        (mask as any)._cleanup = () => { document.removeEventListener("mousemove", onMove); };
      },
      deaction: () => {
        const mask = document.getElementById("a11y-readmask");
        if (mask) { (mask as any)._cleanup?.(); mask.remove(); }
      },
    },
    {
      key: "focus", label: "Ανάδειξη Focus", icon: Focus,
      action: () => document.documentElement.classList.add("a11y-focus"),
      deaction: () => document.documentElement.classList.remove("a11y-focus"),
    },
    {
      key: "structure", label: "Δομή Σελίδας", icon: LayoutTemplate,
      action: () => document.documentElement.classList.add("a11y-structure"),
      deaction: () => document.documentElement.classList.remove("a11y-structure"),
    },
  ];

  const reset = () => {
    [...VISUAL_OPTIONS, ...ORIENT_OPTIONS].forEach((o) => o.deaction());
    setActive({});
    setFontSize(100);
    setLineHeight(100);
    document.documentElement.style.fontSize = "";
    document.documentElement.style.lineHeight = "";
    document.documentElement.classList.remove("a11y-readable");
  };

  return (
    <div className="relative pointer-events-auto z-[160] shrink-0">
      {/* Accessibility CSS */}
      <style>{`
        .a11y-contrast { filter: contrast(180%) !important; }
        .a11y-grayscale { filter: grayscale(100%) !important; }
        .a11y-hideimages img { visibility: hidden !important; }
        .a11y-pauseanim * { animation-play-state: paused !important; transition: none !important; }
        .a11y-links a { text-decoration: underline !important; outline: 2px solid rgba(0,210,200,0.6) !important; outline-offset: 2px; }
        .a11y-focus *:focus { outline: 3px solid #00D2C8 !important; outline-offset: 3px; }
        .a11y-structure h1, .a11y-structure h2, .a11y-structure h3 { outline: 2px dashed rgba(0,210,200,0.5) !important; }
        .a11y-readable body { font-family: Arial, sans-serif !important; }
      `}</style>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Επιλογές Προσβασιμότητας"
        data-testid="btn-accessibility"
        className="relative z-[1] w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Accessibility className="w-5 h-5" aria-hidden />
      </button>

      {/* Panel — αριστερά του κουμπιού ώστε να μην καλύπτει το AI */}
      {open && (
        <Fragment>
          <div className="fixed inset-0 z-[161]" onClick={() => setOpen(false)} />
          <div className="absolute right-full mr-3 bottom-0 z-[162] w-[min(18rem,calc(100vw-5rem))] max-h-[min(70vh,32rem)] bg-card border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/8 bg-white/3">
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold">Προσβασιμότητα</span>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary transition-colors">Επαναφορά</button>
                <button type="button" onClick={() => setOpen(false)} className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10" aria-label="Κλείσιμο πίνακα προσβασιμότητας"><X className="w-3.5 h-3.5" aria-hidden /></button>
              </div>
            </div>

            <div className="p-4 space-y-4 flex-1 min-h-0 overflow-y-auto">
              {/* Text */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Type className="w-3 h-3" aria-hidden />Κείμενο</p>
                <div className="space-y-2">
                  {/* Font size */}
                  <div className="flex items-center justify-between bg-background/60 rounded-xl px-3 py-2">
                    <span className="text-xs text-muted-foreground">Μέγεθος Κειμένου</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setFontSize((v) => Math.max(80, v - 10))} className="w-6 h-6 rounded-lg bg-white/10 hover:bg-primary/20 flex items-center justify-center" aria-label="Μείωση μεγέθους κειμένου"><Minus className="w-3 h-3" aria-hidden /></button>
                      <span className="text-xs font-mono w-8 text-center">{fontSize}%</span>
                      <button type="button" onClick={() => setFontSize((v) => Math.min(150, v + 10))} className="w-6 h-6 rounded-lg bg-white/10 hover:bg-primary/20 flex items-center justify-center" aria-label="Αύξηση μεγέθους κειμένου"><Plus className="w-3 h-3" aria-hidden /></button>
                    </div>
                  </div>
                  {/* Line height */}
                  <div className="flex items-center justify-between bg-background/60 rounded-xl px-3 py-2">
                    <span className="text-xs text-muted-foreground">Ύψος Γραμμής</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setLineHeight((v) => Math.max(80, v - 10))} className="w-6 h-6 rounded-lg bg-white/10 hover:bg-primary/20 flex items-center justify-center" aria-label="Μείωση ύψους γραμμής"><Minus className="w-3 h-3" aria-hidden /></button>
                      <span className="text-xs font-mono w-8 text-center">{lineHeight}%</span>
                      <button type="button" onClick={() => setLineHeight((v) => Math.min(200, v + 10))} className="w-6 h-6 rounded-lg bg-white/10 hover:bg-primary/20 flex items-center justify-center" aria-label="Αύξηση ύψους γραμμής"><Plus className="w-3 h-3" aria-hidden /></button>
                    </div>
                  </div>
                  {/* Readable font */}
                  <button
                    type="button"
                    onClick={() => toggle("readable",
                      () => document.documentElement.classList.add("a11y-readable"),
                      () => document.documentElement.classList.remove("a11y-readable")
                    )}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${active["readable"] ? "bg-primary/20 border border-primary/40 text-primary" : "bg-background/60 border border-transparent text-muted-foreground hover:border-white/15"}`}
                  >
                    <Book className="w-3.5 h-3.5" aria-hidden />
                    Ευανάγνωστη Γραμματοσειρά
                  </button>
                  {/* Text align */}
                  <button
                    type="button"
                    onClick={() => toggle("align",
                      () => document.documentElement.style.setProperty("--text-align", "left"),
                      () => document.documentElement.style.removeProperty("--text-align")
                    )}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${active["align"] ? "bg-primary/20 border border-primary/40 text-primary" : "bg-background/60 border border-transparent text-muted-foreground hover:border-white/15"}`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" aria-hidden />
                    Στοίχιση Κειμένου
                  </button>
                </div>
              </div>

              {/* Visual */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Eye className="w-3 h-3" aria-hidden />Οπτικό</p>
                <div className="space-y-1.5">
                  {VISUAL_OPTIONS.map((o) => (
                    <button
                      type="button"
                      key={o.key}
                      onClick={() => toggle(o.key, o.action, o.deaction)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${active[o.key] ? "bg-primary/20 border border-primary/40 text-primary" : "bg-background/60 border border-transparent text-muted-foreground hover:border-white/15"}`}
                    >
                      <o.icon className="w-3.5 h-3.5" aria-hidden />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5"><Navigation2 className="w-3 h-3" aria-hidden />Πλοήγηση</p>
                <div className="space-y-1.5">
                  {ORIENT_OPTIONS.map((o) => (
                    <button
                      type="button"
                      key={o.key}
                      onClick={() => toggle(o.key, o.action, o.deaction)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${active[o.key] ? "bg-primary/20 border border-primary/40 text-primary" : "bg-background/60 border border-transparent text-muted-foreground hover:border-white/15"}`}
                    >
                      <o.icon className="w-3.5 h-3.5" aria-hidden />
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
}
