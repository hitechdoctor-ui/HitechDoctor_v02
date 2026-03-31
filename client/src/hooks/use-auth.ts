import { useSyncExternalStore } from "react";
import { ADMIN_AUTH_CHANGE_EVENT } from "@/lib/admin-auth-events";

const ADMIN_TOKEN_KEY = "hitech_admin_token";

/** Σταθερό snapshot για άκυρο base64/JSON — όχι νέο `{}` σε κάθε getSnapshot (βλ. React #185). */
const INVALID_TOKEN_USER = Object.freeze({}) as AuthUser;

export type AuthUser = {
  email?: string;
  name?: string;
  role?: string;
};

type SnapshotCache = { raw: string; user: AuthUser };

let snapshotCache: SnapshotCache | null = null;

function parseTokenToUser(raw: string): AuthUser {
  try {
    const decoded = atob(raw);
    const p = JSON.parse(decoded) as AuthUser;
    if (p && typeof p === "object") {
      return Object.freeze({ ...p }) as AuthUser;
    }
  } catch {
    // ignore
  }
  return INVALID_TOKEN_USER;
}

/**
 * Πρέπει να επιστρέφει την ίδια αναφορά όσο δεν αλλάζει το token στο localStorage
 * (απαίτηση useSyncExternalStore — αλλιώς «Maximum update depth exceeded»).
 */
function readUserFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const t = localStorage.getItem(ADMIN_TOKEN_KEY);
    const raw = t?.trim() ?? "";
    if (!raw) {
      snapshotCache = null;
      return null;
    }
    if (snapshotCache?.raw === raw) {
      return snapshotCache.user;
    }
    const user = parseTokenToUser(raw);
    snapshotCache = { raw, user };
    return user;
  } catch {
    snapshotCache = null;
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
