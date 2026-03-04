import { useState, useEffect, useCallback, Fragment } from "react";
import { X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const POPUP_KEY = "htd_exit_popup_shown";

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const show = useCallback(() => {
    if (sessionStorage.getItem(POPUP_KEY)) return;
    sessionStorage.setItem(POPUP_KEY, "1");
    setVisible(true);
  }, []);

  useEffect(() => {
    let scrollTriggered = false;

    const onScroll = () => {
      if (scrollTriggered) return;
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= 0.5) {
        scrollTriggered = true;
        show();
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseleave", onMouseOut);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseOut);
    };
  }, [show]);

  const close = () => setVisible(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    toast({ title: "Επιτυχία!", description: "Η έκπτωση στάλθηκε στο email σας." });
  };

  if (!visible) return null;

  return (
    <Fragment>
      <div className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="fixed inset-0 z-[181] flex items-center justify-center px-4 pointer-events-none">
        <div
          className="relative bg-card border border-white/15 rounded-2xl shadow-2xl shadow-black/60 w-full max-w-md p-7 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
            data-testid="btn-popup-close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold mb-4">
            <Tag className="w-3 h-3" />
            ΑΠΟΚΛΕΙΣΤΙΚΗ ΠΡΟΣΦΟΡΑ
          </div>

          {!submitted ? (
            <Fragment>
              <h2 className="text-2xl font-display font-black text-foreground mb-2 leading-tight">
                Ξεκίνα την επόμενη<br />
                <span className="text-primary">συνεργασία σου με -20%!</span>
              </h2>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                Μην το αφήνεις για αργότερα. Κάνε εγγραφή τώρα και λάβε την προσφορά στο email σου για την πρώτη σου υπηρεσία.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Το email σου..."
                  required
                  className="w-full h-11 px-4 rounded-xl bg-background border border-white/15 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_0_2px_rgba(0,210,200,0.1)] transition-all"
                  data-testid="input-popup-email"
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90"
                  data-testid="btn-popup-submit"
                >
                  Θέλω το -20% τώρα!
                </Button>
              </form>

              <p className="text-[10px] text-muted-foreground/50 mt-3 text-center">
                Δεν κάνουμε spam. Μπορείτε να διαγραφείτε ανά πάσα στιγμή.
              </p>
            </Fragment>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center mx-auto mb-4">
                <Tag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Το -20% είναι δικό σου!</h3>
              <p className="text-sm text-muted-foreground">Στείλαμε τον κωδικό προσφοράς στο <span className="text-primary font-semibold">{email}</span>.</p>
              <Button onClick={close} className="mt-4 bg-primary text-primary-foreground h-9 px-6">Κλείσιμο</Button>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}
