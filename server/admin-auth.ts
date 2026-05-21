/**
 * Πρόσβαση στο admin panel/API επιτρέπεται ΜΟΝΟ σε ρόλους που ορίζονται ρητά από διαχειριστή.
 * Ο ρόλος `customer` (και οτιδήποτε άλλο εκτός της λίστας) ΔΕΝ έχει πρόσβαση — ούτε μέσω JWT ούτε μέσω login.
 */
export const PRIVILEGED_ADMIN_ROLES = new Set(["superadmin", "admin", "staff"]);

export function isPrivilegedAdminRole(role: string | undefined | null): boolean {
  return !!role && PRIVILEGED_ADMIN_ROLES.has(role);
}
