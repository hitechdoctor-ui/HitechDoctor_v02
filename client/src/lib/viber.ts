/** Viber brand purple (official) */
export const VIBER_HEX = "#7360f2";

/** Public Account URI από το Viber Admin (όχι τηλέφωνο). */
export const VIBER_PA_CHAT_URI = "hitechdoctor";

/**
 * Ανοίγει chat με το Viber PA μέσω deep link (ίδιο URI με το Admin Panel).
 * Με `prefillText` προσθέτει `&text=` (εμφανίζεται στο πεδίο μηνύματος).
 */
export function buildViberUrl(prefillText?: string): string {
  let url = `viber://pa?chatURI=${encodeURIComponent(VIBER_PA_CHAT_URI)}`;
  if (prefillText?.trim()) {
    url += `&text=${encodeURIComponent(prefillText.trim())}`;
  }
  return url;
}
