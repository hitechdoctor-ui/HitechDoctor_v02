/** Custom event ώστε το useAuth να ενημερώνεται μετά από login/logout στην ίδια καρτέλα. */
export const ADMIN_AUTH_CHANGE_EVENT = "hitech-admin-auth-change";

export function notifyAdminAuthChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
}
