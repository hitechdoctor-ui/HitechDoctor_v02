import "dotenv/config";
import OpenAI from "openai";
import { storage } from "./storage";
import type { Product, RepairPriceOverride } from "@shared/schema";
import { formatProductsForRepairCatalog, REPAIR_STATIC_CATALOG_TEXT, SITE_BASE } from "@shared/repair-catalog";
import {
  buildGlobalSearchIndex,
  extractRepairModelSlugFromHref,
  getGlobalSearchTopResults,
  type GlobalSearchIndexEntry,
} from "@/lib/global-search-index";

let catalogCache: { text: string; at: number } | null = null;
const CATALOG_TTL_MS = 5 * 60 * 1000;

let globalSearchIndexCache: GlobalSearchIndexEntry[] | null = null;
function getGlobalSearchIndexCached(): GlobalSearchIndexEntry[] {
  if (!globalSearchIndexCache) globalSearchIndexCache = buildGlobalSearchIndex();
  return globalSearchIndexCache;
}

const OVERRIDE_SERVICE_PRIORITY = [
  "screen_standard",
  "screen_oem",
  "battery_standard",
  "battery",
  "port",
] as const;

function formatEur(value: unknown): string {
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return new Intl.NumberFormat("el-GR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
}

/** Μία ενδεικτική τιμή επισκευής (με ΦΠΑ) από repair_price_overrides για το modelSlug. */
function pickRepairOverridePrice(overrides: RepairPriceOverride[], modelSlug: string): string | null {
  const rows = overrides.filter((o) => o.modelSlug === modelSlug);
  if (rows.length === 0) return null;
  for (const key of OVERRIDE_SERVICE_PRIORITY) {
    const r = rows.find((o) => o.serviceKey === key);
    const p = r?.price;
    if (p != null && String(p).trim() !== "") return formatEur(p);
  }
  const first = rows[0];
  return first?.price != null && String(first.price).trim() !== "" ? formatEur(first.price) : null;
}

function buildInternalSearchBlock(
  lastUserMessage: string,
  products: Product[],
  overrides: RepairPriceOverride[]
): string {
  const q = lastUserMessage.trim();
  if (q.length < 1) {
    return `### Εσωτερική αναζήτηση (ίδια λογική με Global Search)
(Δεν εκτελέστηκε — κενό τελευταίο μήνυμα χρήστη.)`;
  }

  const top = getGlobalSearchTopResults(products, getGlobalSearchIndexCached(), q, 3);
  if (top.length === 0) {
    return `### Εσωτερική αναζήτηση (ίδια λογική με Global Search)
Query: ${JSON.stringify(q)}
Αποτελέσματα: **ΚΑΝΕΝΑ** (0).

**ΥΠΟΧΡΕΩΤΙΚΑ:** Αν ο χρήστης αναφέρεται σε συγκεκριμένο μοντέλο/συσκευή και το παραπάνω αποτέλεσμα είναι κενό, πες ότι **το μοντέλο δεν βρέθηκε** στο σύστημα αναζήτησης του site. **ΜΗΝ** δώσεις τιμή επισκευής, **ΜΗΝ** επινοείς μοντέλο ή τιμή από μνήμη. Πρότεινε να επικοινωνήσουν μαζί μας για διαθεσιμότητα.`;
  }

  const lines = top.map((item, i) => {
    const n = i + 1;
    if (item.kind === "product") {
      const p = item.product;
      const slug = p.slug?.trim() || "";
      const price = p.price != null ? formatEur(p.price) : "—";
      const link = slug ? `${SITE_BASE}/eshop/${slug}` : `${SITE_BASE}/eshop`;
      return `${n}. [eShop] ${p.name} | τιμή eShop (με ΦΠΑ): ${price} € | σύνδεσμος: ${link}`;
    }
    const e = item.entry;
    const modelSlug = extractRepairModelSlugFromHref(e.href);
    const repairPrice = modelSlug ? pickRepairOverridePrice(overrides, modelSlug) : null;
    const priceLine =
      modelSlug != null
        ? repairPrice != null
          ? `τιμή επισκευής από repair_price_overrides (με ΦΠΑ): ${repairPrice} €`
          : `τιμή επισκευής: Επικοινωνήστε μαζί μας (δεν υπάρχει εγγραφή στον πίνακα για αυτό το slug)`
        : `τιμή επισκευής: Επικοινωνήστε μαζί μας (η σελίδα δεν έχει slug μοντέλου για τιμολόγηση από τη βάση)`;
    const cta =
      modelSlug != null ? `${SITE_BASE}/repair/${modelSlug}` : `${SITE_BASE}${e.href.startsWith("/") ? e.href : `/${e.href}`}`;
    return `${n}. [${e.category}] ${e.name} | href ιστότοπου: ${e.href} | ${priceLine} | CTA επισκευής (μορφή που χρησιμοποιείς): ${cta}`;
  });

  return `### Εσωτερική αναζήτηση (ίδια λογική με Global Search — πρώτα 3 αποτελέσματα όπως στο ψαχτήρι)
Query: ${JSON.stringify(q)}

Αποτελέσματα (χρησιμοποίησε ΜΟΝΟ αυτά για τιμές/σύνδεσμους επισκευής — όχι εικασίες):
${lines.join("\n")}

**Μορφή απάντησης (σύντομη, ελληνικά):** «Βρήκα την επισκευή για [Μοντέλο]. Η τιμή είναι [Τιμή]€ και περιλαμβάνει εργασία και εγγύηση.» — αν δεν υπάρχει τιμή στη γραμμή «τιμή επισκευής», αντί για νούμερο πες **«Επικοινωνήστε μαζί μας»** για την τιμή. Στο τέλος πρόσθεσε το μπλοκ CTA JSON με href μόνο σε μορφή \`${SITE_BASE}/repair/{slug}\` όταν υπάρχει slug· αλλιώς χρησιμοποίησε τον σύνδεσμο που δόθηκε παραπάνω.

**Πολλαπλά αποτελέσματα:** Αν υπάρχουν 2–3 γραμμές, μπορείς να δώσεις συνοπτικά έως 3 προτάσεις ή να εστιάσεις στο πιο σχετικό (πρώτο στη λίστα) εκτός αν ο χρήστης ζητά συγκεκριμένο άλλο.`;
}

function formatRepairPriceOverridesForPrompt(rows: RepairPriceOverride[]): string {
  if (rows.length === 0) {
    return "(Δεν υπάρχουν ακόμα εγγραφές στον πίνακα repair_price_overrides — για τιμές επισκευής παραπέμπεις στις σελίδες μοντέλου ή επικοινωνία.)";
  }
  const sorted = [...rows].sort((a, b) => `${a.brand}|${a.modelSlug}|${a.serviceKey}`.localeCompare(`${b.brand}|${b.modelSlug}|${b.serviceKey}`));
  return sorted
    .slice(0, 450)
    .map((r) => {
      const price = String(r.price ?? "").trim();
      const purchase = r.purchaseCost != null ? String(r.purchaseCost).trim() : "—";
      const href = `${SITE_BASE}/repair/${r.modelSlug}`;
      return `- brand: ${r.brand} | modelSlug: ${r.modelSlug} | service: ${r.serviceKey} | τελική τιμή (με ΦΠΑ): ${price} € | καθαρό κόστος (αν υπάρχει): ${purchase} | σύνδεσμος: ${href}`;
    })
    .join("\n");
}

export async function getRepairCatalogPromptBlock(): Promise<string> {
  const now = Date.now();
  if (catalogCache && now - catalogCache.at < CATALOG_TTL_MS) {
    return catalogCache.text;
  }
  const [products, overrides] = await Promise.all([storage.getProducts(), storage.getAllRepairPriceOverrides()]);
  const productLines = formatProductsForRepairCatalog(products);
  const overrideLines = formatRepairPriceOverridesForPrompt(overrides);
  const text = `${REPAIR_STATIC_CATALOG_TEXT}

### Προϊόντα eShop (δυναμικά από βάση δεδομένων)
${productLines}

### Τιμές επισκευής από τη βάση (repair_price_overrides)
Αυτά είναι τα **μόνα** δεδομένα τιμών επισκευής (με ΦΠΑ) που έχεις από τη βάση. Για ερωτήσεις τιμής **ψάξε πρώτα εδώ** ανά μοντέλο (modelSlug) και τύπο υπηρεσίας (serviceKey: π.χ. screen_standard, battery_standard). Αν βρεις γραμμή, δώσε την τιμή και χρησιμοποίησε **ακριβώς** τον σύνδεσμο της γραμμής (μορφή /repair/{modelSlug}).
${overrideLines}
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
- Για επισκευές (οθόνη, μπαταρία κ.λπ.): **πρώτα** το δυναμικό μπλοκ «Εσωτερική αναζήτηση» στο τέλος (ίδιο με το Global Search + τιμές από repair_price_overrides). **Μετά**, αν χρειάζεται συμπλήρωση, το τμήμα «Τιμές επισκευής από τη βάση» στον ΚΑΤΑΛΟΓΟ. Μην επινοείς τιμές.
- Όλοι οι σύνδεσμοι προς σελίδες επισκευής μοντέλου πρέπει να ακολουθούν **αυστηρά** τη μορφή: \`${SITE_BASE}/repair/{modelSlug}\` (μόνο το slug μετά το /repair/, χωρίς άλλες διαδρομές όπως /episkevi-iphone/… στο κείμενο ή στα CTA).
- Αν δεν υπάρχει τιμή στον πίνακα repair_price_overrides για το μοντέλο, παραπέμπε σε σελίδα μοντέλου με σύνδεσμο /repair/{modelSlug} αν το slug είναι γνωστό, αλλιώς ${SITE_BASE}/epikoinonia ή ${SITE_BASE}/services.

### Κουμπιά CTA (υποχρεωτικό όταν προτείνεις συγκεκριμένο μοντέλο επισκευής)
Όταν ο χρήστης αναφέρει συγκεκριμένο μοντέλο (π.χ. iPhone 17 Pro Max) και δίνεις σύνδεσμο σε σελίδα κόστους επισκευής, ΜΗΝ βάζεις σκέτο URL μέσα στο κείμενο. Γράψε πρώτα 1–2 προτάσεις βοήθειας και στο τέλος πρόσθεσε ΑΚΡΙΒΩΣ αυτό το μπλοκ (JSON array, πλήρη URL **μόνο** ως /repair/{slug}):

---CTA---
[{"label":"Δες Κόστος Επισκευής iPhone 17 Pro Max","href":"${SITE_BASE}/repair/iphone-17-pro-max"}]
---END---

- Το label να είναι φιλικό: «Δες Κόστος Επισκευής [Μοντέλο]».
- Μέχρι 3 αντικείμενα στο array αν χρειάζονται πολλαπλοί σύνδεσμοι.
- Το href: **πάντα** \`${SITE_BASE}/repair/\` + modelSlug (π.χ. iphone-12-pro), χωρίς εξαίρεση.

### Lead generation (πρωτοβουλία)
Μην κλείνεις με γενικό «επικοινωνήστε μαζί μας» **εκτός** αν το μπλοκ «Εσωτερική αναζήτηση» λέει ότι δεν βρέθηκε μοντέλο ή ότι η τιμή είναι «Επικοινωνήστε μαζί μας». Αφού έχεις καταλάβει βλάβη/μοντέλο, ρώτα ενεργά (χρησιμοποίησε αυτή τη διατύπωση ή πολύ κοντά):

«Θέλετε να σας καλέσει ένας τεχνικός μας για να σας δώσει ακριβή προσφορά και χρόνο επισκευής; Γράψτε μου το Όνομα, το Τηλέφωνο και το E-mail σας εδώ.»

### Upselling (οθόνη / ραγισμένη οθόνη)
Όταν αναφέρεις επισκευή/αλλαγή οθόνης, ειδικά σε ακριβά μοντέλα (π.χ. iPhone Pro Max, νεότερα iPhone με ακριβή panel), πρόσθεσε:

«Επειδή η οθόνη του [συγκεκριμένο μοντέλο] είναι ακριβή, προτείνω να βάλουμε και ένα Crystal Clear Tempered Glass με την επισκευή για 100% προστασία· δείτε και μια θήκη στο eShop μας για πλήρη προστασία.»

Προσαρμόζεις το [συγκεκριμένο μοντέλο] στη συζήτηση (π.χ. iPhone 17 Pro Max).

ΚΑΤΑΛΟΓΟΣ (eShop, τιμές επισκευής από repair_price_overrides, και στατικά στοιχεία):
${catalogBlock}

---

Μετά τον κατάλογο ακολουθεί **δυναμικό** μπλοκ «Εσωτερική αναζήτηση» (ανά αίτημα) για το **τελευταίο μήνυμα χρήστη**. Για τιμές/μοντέλα που σχετίζονται με αυτό το μήνυμα, **υπερισχύει** το μπλοκ αυτό έναντι εικασιών. Αν λέει 0 αποτελέσματα για συγκεκριμένο μοντέλο, **δεν** δίνεις τιμή.`;
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
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content?.trim() ?? "";
  const [products, overrides] = await Promise.all([storage.getProducts(), storage.getAllRepairPriceOverrides()]);
  const internalBlock = buildInternalSearchBlock(lastUser, products, overrides);
  const system = `${buildRepairAssistantSystemPrompt(catalogBlock)}\n\n${internalBlock}`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    max_tokens: 1800,
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("EMPTY_COMPLETION");
  return text;
}
