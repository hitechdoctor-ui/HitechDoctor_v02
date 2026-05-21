/**
 * Κεντρικός ορισμός ρόλων / προνομίων admin & portal.
 * Έλεγχος super admin μέσω περιβάλλοντος στο server (`getSuperAdminEmail`).
 */

/** Προεπιλογή όταν λείπει `SUPER_ADMIN_EMAIL` στο περιβάλλον εκτέλεσης του server. */
const SUPER_ADMIN_EMAIL_FALLBACK = "hitechdoctor@gmail.com";

/**
 * Κανονικοποιημένο email κύριου διαχειριστή (lowercase).
 * Στο server: `process.env.SUPER_ADMIN_EMAIL`· αν λείπει/είναι κενό → fallback.
 * Το client δεν το χρειάζεται για guards (βλ. `platformOwner` στο API, `superAdmin` στο `/api/admin/me`).
 */
export function getSuperAdminEmail(): string {
  const raw =
    typeof process !== "undefined" && typeof process.env !== "undefined"
      ? String(process.env.SUPER_ADMIN_EMAIL ?? "").trim()
      : "";
  return raw ? normalizeAdminEmail(raw) : normalizeAdminEmail(SUPER_ADMIN_EMAIL_FALLBACK);
}

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  return !!email && normalizeAdminEmail(email) === getSuperAdminEmail();
}

/** Πλήρη προνόμια πλατφόρμας — βάσει ταυτότητας email (και τιμής περιβάλλοντος / fallback). */
export function isSuperAdminUser(user: { email: string }): boolean {
  return isSuperAdminEmail(user.email);
}

/** Πρόσβαση στο admin panel (όχι portal πελάτη). */
export const PRIVILEGED_ADMIN_ROLES = new Set(["superadmin", "admin", "staff"]);

export function isPrivilegedAdminRole(role: string | undefined | null): boolean {
  return !!role && PRIVILEGED_ADMIN_ROLES.has(role);
}
