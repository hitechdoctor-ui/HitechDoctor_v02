import { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { notifyAdminAuthChange } from "@/lib/admin-auth-events";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/lib/admin-auth-storage";
import { cn } from "@/lib/utils";

/** Επίσημο πολύχρωμο G (Google branding). */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function decodeAdminToken(token: string | null): { name?: string; email?: string; role?: string } {
  if (!token) return {};
  try {
    const decoded = atob(token);
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

export function AdminAuthPanel({ onLogin }: { onLogin: (token: string) => void }) {
  const search = useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleAvailable, setGoogleAvailable] = useState(false);

  const googleError = useMemo(() => {
    const q = search.startsWith("?") ? search : search ? `?${search}` : "";
    return new URLSearchParams(q).get("google_error");
  }, [search]);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then((r) => r.json())
      .then((d: { google?: boolean }) => setGoogleAvailable(!!d.google))
      .catch(() => setGoogleAvailable(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, data.token);
        notifyAdminAuthChange();
        onLogin(data.token);
      } else {
        setError(data.message || "Λάθος email ή κωδικός");
      }
    } catch {
      setError("Σφάλμα σύνδεσης — δοκιμάστε ξανά");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">HiTech Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Σύνδεση με email και κωδικό</p>
        </div>

        {googleError ? (
          <p className="mb-4 text-sm text-center text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">
            Η σύνδεση με Google απέτυχε. Δοκιμάστε ξανά ή χρησιμοποιήστε κωδικό.
          </p>
        ) : null}

        {googleAvailable ? (
          <a
            href="/api/auth/google"
            className={cn(
              "mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-[#747775] bg-white px-4 py-2.5 text-sm font-medium text-[#1f1f1f] shadow-sm transition-colors",
              "hover:bg-[#f8f9fa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "dark:border-[#8e918f] dark:bg-[#131314] dark:text-[#e3e3e3] dark:hover:bg-[#1f1f1f]"
            )}
            data-testid="button-admin-google"
          >
            <GoogleIcon className="h-5 w-5 shrink-0" />
            Σύνδεση με Google
          </a>
        ) : null}

        {googleAvailable ? (
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ή</span>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-9"
              required
              autoComplete="email"
              data-testid="input-admin-email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type={showPass ? "text" : "password"}
              placeholder="Κωδικός"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 pr-10"
              required
              autoComplete="current-password"
              data-testid="input-admin-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPass ? "Απόκρυψη κωδικού" : "Εμφάνιση κωδικού"}
            >
              {showPass ? <EyeOff className="w-4 h-4" aria-hidden /> : <Eye className="w-4 h-4" aria-hidden />}
            </button>
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center bg-red-400/10 border border-red-400/20 rounded-lg py-2 px-3">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full h-11" disabled={loading} data-testid="button-admin-login">
            {loading ? "Σύνδεση..." : "Σύνδεση"}
          </Button>
        </form>
        <p className="text-center mt-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            ← Επιστροφή στο site
          </Link>
        </p>
      </div>
    </div>
  );
}

/** Αυτόνομη σελίδα σύνδεσης `/auth` (ίδιο περιεχόμενο με το admin login). */
export default function AuthPage() {
  const [, setLocation] = useLocation();
  return (
    <AdminAuthPanel
      onLogin={() => {
        setLocation("/admin");
      }}
    />
  );
}
