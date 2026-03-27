/** Viber brand purple (official) */
export const VIBER_HEX = "#7360f2";

const VIBER_NUMBER = "306981882005";

/** Opens Viber chat with the business number (same as WhatsApp line). */
export function buildViberUrl(prefillText?: string): string {
  if (prefillText?.trim()) {
    return `viber://forward?text=${encodeURIComponent(prefillText.trim())}&number=${VIBER_NUMBER}`;
  }
  return `viber://chat?number=${VIBER_NUMBER}`;
}
