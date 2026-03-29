import OpenAI from "openai";
import { storage } from "./storage";
import { formatProductsForRepairCatalog, REPAIR_STATIC_CATALOG_TEXT, SITE_BASE } from "@shared/repair-catalog";

let catalogCache: { text: string; at: number } | null = null;
const CATALOG_TTL_MS = 5 * 60 * 1000;

export async function getRepairCatalogPromptBlock(): Promise<string> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.text;
  }
  const products = await storage.getProducts();
  const productLines = formatProductsForRepairCatalog(products);
  const text = `${REPAIR_STATIC_CATALOG_TEXT}

### Προϊόντα eShop (δυναμικά από βάση δεδομένων)
${productLines}
`;
  catalogCache = { text, at: now };
  return text;
}

export function buildRepairAssistantSystemPrompt(catalogBlock: string): string {
  return `Είσαι ο «HiTech Doctor», ο επίσημος βοηθός επισκευών του καταστήματος HiTech Doctor στην Αθήνα (ιστότοπος: ${SITE_BASE}).

Γλώσσα: Ελληνικά (μόνο).

Ρόλος:
- Ρώτα σύντομα, βήμα-βήμα, για τη βλάβη: τύπος συσκευής (κινητό, tablet, laptop κ.λπ.), μάρκα και μοντέλο αν το ξέρει, και τι ακριβώς συμβαίνει (1–2 ερωτήσεις ανά μήνυμα).
- Μη δίνεις ιατρικές/νομικές συμβουλές. Μόνο τεχνολογία καταναλωτή.
- Για προϊόντα eShop: οι τιμές και η διαθεσιμότητα (σε απόθεμα / προ-παραγγελία) στον ΚΑΤΑΛΟΓΟ παρακάτω προέρχονται από τη βάση δεδομένων μας — αναφέρεις τιμή και διαθεσιμότητα ΜΟΝΟ όπως αναγράφονται εκεί. Μην επινοείς τιμές ή απόθεμα.
- Για επισκευές (οθόνη, μπαταρία κ.λπ.) οι τιμές είναι στις σελίδες μοντέλων επισκευής· μην επινοείς νούμερα που δεν υπάρχουν στον κατάλογο.
- Στο τέλος, όταν έχεις αρκετά στοιχεία, πρότεινε 1–3 συγκεκριμένες επιλογές από τον ΚΑΤΑΛΟΓΟ παρακάτω (πλήρη URL https://...).
- Χρησιμοποίησε ΜΟΝΟ συνδέσμους που εμφανίζονται στον ΚΑΤΑΛΟΓΟ. Μην επινοείς slug ή διαδρομές.
- Αν δεν ταιριάζει κάτι στον κατάλογο, πρότεινε ${SITE_BASE}/epikoinonia ή ${SITE_BASE}/services.

ΚΑΤΑΛΟΓΟΣ (η μόνη πηγή αληθινών συνδέσμων, τιμών eShop και διαθεσιμότητας):
${catalogBlock}`;
}

export type ChatTurn = { role: "user" | "assistant"; content: string };

export async function runRepairAssistantChat(
  messages: ChatTurn[],
  catalogBlock: string
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }
  const model = process.env.OPENAI_API_MODEL?.trim() || "gpt-4o";
  const openai = new OpenAI({ apiKey });
  const system = buildRepairAssistantSystemPrompt(catalogBlock);

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 1500,
    temperature: 0.35,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("EMPTY_COMPLETION");
  return text;
}
