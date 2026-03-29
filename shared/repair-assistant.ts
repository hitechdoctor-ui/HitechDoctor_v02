/** Parsing για AI repair chat — CTA blocks & lead extraction */

export type RepairChatCta = {
  label: string;
  href: string;
  /** Άνοιγμα φόρμας αιτήματος επισκευής σε modal (ίδια σελίδα) */
  action?: "repair_quote_modal";
};

const CTA_RE = /---CTA---\s*([\s\S]*?)\s*---END---/;

/** Συμπύκνωση κενών/γραμμών ώστε το UI να μην «φουσκώνει» με κενά. */
export function compactAssistantDisplayText(text: string): string {
  return text
    .replace(/\n{4,}/g, "\n\n")
    .replace(/\n{3}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/**
 * Αφαιρεί το μπλοκ CTA από το κείμενο προς εμφάνιση και επιστρέφει τα κουμπιά.
 */
export function splitAssistantReply(raw: string): { displayText: string; ctas: RepairChatCta[] } {
  const m = raw.match(CTA_RE);
  let displayText = raw.replace(CTA_RE, "").trim();
  displayText = compactAssistantDisplayText(displayText);
  const ctas: RepairChatCta[] = [];
  if (m) {
    try {
      const parsed = JSON.parse(m[1].trim()) as unknown;
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (
            item &&
            typeof item === "object" &&
            "label" in item &&
            "href" in item &&
            typeof (item as RepairChatCta).label === "string" &&
            typeof (item as RepairChatCta).href === "string"
          ) {
            const row = item as RepairChatCta & { action?: string };
            const cta: RepairChatCta = {
              label: row.label.trim(),
              href: row.href.trim(),
            };
            if (row.action === "repair_quote_modal") {
              cta.action = "repair_quote_modal";
            }
            ctas.push(cta);
          }
        }
      }
    } catch {
      /* ignore malformed JSON */
    }
  }
  return { displayText, ctas };
}

/**
 * Αν το μήνυμα περιέχει email + ελληνικό κινητό 69xxxxxxxx, επιστρέφει lead.
 */
export function tryParseLeadFromText(text: string): { name: string; phone: string; email: string } | null {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i);
  if (!emailMatch) return null;
  const email = emailMatch[0];

  const phoneMatch = text.match(/(?:\+30|0030)?[\s.-]?(69\d{8})\b/);
  if (!phoneMatch) return null;
  const phone = phoneMatch[1];

  let rest = text
    .replace(emailMatch[0], " ")
    .replace(phoneMatch[0], " ")
    .replace(/[|•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (rest.length < 2) return null;
  const name = rest.slice(0, 200);
  return { name, phone, email };
}

/**
 * Εξάγει ενδεικτικό μοντέλο από πρόσφατα μηνύματα (για θέμα email).
 */
export function guessDeviceModelFromMessages(messages: { role: string; content: string }[]): string {
  const blob = messages.slice(-10).map((m) => m.content).join("\n");
  const patterns: RegExp[] = [
    /iPhone\s+\d+(?:\s+[A-Za-z]+)*(?:\s+Pro)?(?:\s+Max)?(?:\s+Plus)?(?:\s+mini|\s+e)?/i,
    /iPhone\s+(?:SE|se)(?:\s*\d|\s*3)/i,
    /Redmi\s+[\w\s+]+/i,
    /POCO\s+[\w\s+]+/i,
    /Galaxy\s+[A-Z]?\s*[\d\w]+/i,
    /Samsung\s+Galaxy[\s\w]+/i,
    /Xiaomi\s+[\w\s+]+/i,
  ];
  for (const p of patterns) {
    const m = blob.match(p);
    if (m) return m[0].replace(/\s+/g, " ").trim().slice(0, 120);
  }
  return "Συσκευή (δεν εντοπίστηκε συγκεκριμένο μοντέλο)";
}
