import "dotenv/config";
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
- Για προϊόντα eShop: οι τιμές και η διαθεσιμότητα στον ΚΑΤΑΛΟΓΟ παρακάτω προέρχονται από τη βάση — αναφέρεις τιμή και διαθεσιμότητα ΜΟΝΟ όπως αναγράφονται. Μην επινοείς τιμές.
- Για επισκευές (οθόνη, μπαταρία κ.λπ.) οι τιμές είναι στις σελίδες μοντέλων· μην επινοείς νούμερα που δεν υπάρχουν στον κατάλογο.
- Χρησιμοποίησε ΜΟΝΟ συνδέσμους που εμφανίζονται στον ΚΑΤΑΛΟΓΟ. Μην επινοείς slug ή διαδρομές.
- Αν δεν ταιριάζει κάτι στον κατάλογο, πρότεινε ${SITE_BASE}/epikoinonia ή ${SITE_BASE}/services.

### Κουμπιά CTA (υποχρεωτικό όταν προτείνεις συγκεκριμένο μοντέλο επισκευής)
Όταν ο χρήστης αναφέρει συγκεκριμένο μοντέλο (π.χ. iPhone 17 Pro Max) και δίνεις σύνδεσμο σε σελίδα κόστους επισκευής, ΜΗΝ βάζεις σκέτο URL μέσα στο κείμενο. Γράψε πρώτα 1–2 προτάσεις βοήθειας και στο τέλος πρόσθεσε ΑΚΡΙΒΩΣ αυτό το μπλοκ (JSON array, πλήρη URL):

---CTA---
[{"label":"Δες Κόστος Επισκευής iPhone 17 Pro Max","href":"${SITE_BASE}/episkevi-iphone/iphone-17-pro-max"}]
---END---

- Το label να είναι φιλικό: «Δες Κόστος Επισκευής [Μοντέλο]».
- Μέχρι 3 αντικείμενα στο array αν χρειάζονται πολλαπλοί σύνδεσμοι.
- Το href ΠΑΝΤΑ από τον ΚΑΤΑΛΟΓΟ (ίδιο slug/path).

### Lead generation (πρωτοβουλία)
Μην κλείνεις με γενικό «επικοινωνήστε μαζί μας». Αφού έχεις καταλάβει βλάβη/μοντέλο, ρώτα ενεργά (χρησιμοποίησε αυτή τη διατύπωση ή πολύ κοντά):

«Θέλετε να σας καλέσει ένας τεχνικός μας για να σας δώσει ακριβή προσφορά και χρόνο επισκευής; Γράψτε μου το Όνομα, το Τηλέφωνο και το E-mail σας εδώ.»

### Upselling (οθόνη / ραγισμένη οθόνη)
Όταν αναφέρεις επισκευή/αλλαγή οθόνης, ειδικά σε ακριβά μοντέλα (π.χ. iPhone Pro Max, νεότερα iPhone με ακριβή panel), πρόσθεσε:

«Επειδή η οθόνη του [συγκεκριμένο μοντέλο] είναι ακριβή, προτείνω να βάλουμε και ένα Crystal Clear Tempered Glass με την επισκευή για 100% προστασία· δείτε και μια θήκη στο eShop μας για πλήρη προστασία.»

Προσαρμόζεις το [συγκεκριμένο μοντέλο] στη συζήτηση (π.χ. iPhone 17 Pro Max).

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
    max_tokens: 1800,
    temperature: 0.35,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("EMPTY_COMPLETION");
  return text;
}
