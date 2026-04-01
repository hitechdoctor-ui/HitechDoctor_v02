/** Πλατφόρμα από `navigator.userAgent` — API `clientContext` + καλωσόρισμα στο chat. */
export type RepairChatClientContext = "ios" | "android" | "desktop";

export function detectRepairChatClientContext(userAgent: string): RepairChatClientContext {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

/** Μήνυμα βοηθού όταν ανοίγει το chat από τη μπάρα AI χωρίς κείμενο αναζήτησης. */
export function buildRepairChatContextualWelcome(ctx: RepairChatClientContext): string {
  if (ctx === "ios") {
    return "Γεια σας! Βλέπω ότι συνδέεστε από **iPhone ή iPad** — μπορώ να σας προτείνω επισκευές, αξεσουάρ από το eShop (θήκες, τζάμια, φόρτιση) και να σας κατευθύνω στη σωστή υπηρεσία. Τι χρειάζεστε σήμερα;";
  }
  if (ctx === "android") {
    return "Γεια σας! Βλέπω ότι συνδέεστε από **Android** — πείτε μου τι ψάχνετε: επισκευή (Samsung, Xiaomi κ.λπ.), αξεσουάρ ή προϊόντα από το eShop· οι προτάσεις μου θα ταιριάζουν καλύτερα στη συσκευή σας.";
  }
  return "Γεια σας! Είμαι ο AI βοηθός του HiTech Doctor. Ρωτήστε με για επισκευές, το eShop, τιμές ή οτιδήποτε σχετικό με την τεχνολογία σας — θα σας απαντήσω με βάση τον κατάλογό μας.";
}
