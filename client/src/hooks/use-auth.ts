import { useSyncExternalStore } from "react";
import { ADMIN_AUTH_CHANGE_EVENT } from "@/lib/admin-auth-events";

const ADMIN_TOKEN_KEY = "hitech_admin_token";

export type AuthUser = {
  email?: string;
  name?: string;
  role?: string;
};

function readUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!t?.trim()) return null;
    try {
      const decoded = atob(t);
      const p = JSON.parse(decoded) as AuthUser;
      return p && typeof p === "object" ? p : {};
    } catch {
      return {};
    }
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, handler);
  };
}

/**
 * Συνδεδεμένος διαχειριστής: `user` ≠ null όταν υπάρχει admin token στο localStorage.
 */
export function useAuth(): { user: AuthUser | null } {
  const user = useSyncExternalStore(subscribe, readUserFromStorage, () => null);
  return { user };
}
