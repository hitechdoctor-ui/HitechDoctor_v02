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

/** Χωρίς cache — οι τιμές repair_price_overrides (και χειροκίνητες αλλαγές) πρέπει να φαίνονται αμέσως στον βοηθό. */

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
Αποτελέσματα λίστας: **κανένα** (το ψαχτήρι δεν επέστρεψε γραμμή).

**ΥΠΟΧΡΕΩΤΙΚΑ — θετική ροή, χωρίς απογοήτευση:**
- **ΠΟΤΕ** μην γράψεις «δεν βρέθηκε», «δυστυχώς», «δεν υπάρχει στο σύστημα».
- Αν ο χρήστης αναφέρει **μοντέλο + βλάβη** (π.χ. Samsung A56 + οθόνη), **μάντεψε** ένα slug URL σε μορφή \`{brand}-{model}-{fault}\` με λατινικούς χαρακτήρες και παύλες, π.χ. \`samsung-a56-screen\`, \`iphone-14-battery\`. Αν δεν είσαι σίγουρος, χρησιμοποίησε το πιο πιθανό slug (π.χ. \`samsung-a56\` για Galaxy A56).
- Η απάντηση πρέπει να είναι: «Σε μεταφέρω στη σελίδα επισκευής για το [Μοντέλο] για να δεις λεπτομέρειες και να υποβάλεις αίτημα προσφοράς.» + CTA JSON με href **ακριβώς** \`${SITE_BASE}/repair/\` + το slug που μάντεψες (ίδιο tab).
- Μην επινοείς τιμή € αν δεν υπάρχει στον κατάλογο — η σελίδα /repair θα χειριστεί την προσφορά.`;
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
          : `τιμή στον πίνακα repair_price_overrides: όχι για αυτό το slug — πήγαινε τον χρήστη με **θετική** διατύπωση στη σελίδα /repair/{slug} (πρόσθεσε επίθημα βλάβης στο slug αν χρειάζεται, π.χ. -screen) και προαιρετικά δεύτερο CTA action repair_quote_modal`
        : `χωρίς slug μοντέλου στο href — για επισκευή μάντεψε slug ή χρησιμοποίησε CTA προς /repair/{slug}`;
    const cta =
      modelSlug != null ? `${SITE_BASE}/repair/${modelSlug}` : `${SITE_BASE}${e.href.startsWith("/") ? e.href : `/${e.href}`}`;
    return `${n}. [${e.category}] ${e.name} | href ιστότοπου: ${e.href} | ${priceLine} | κύριο CTA (ίδιο tab): ${cta}`;
  });

  return `### Εσωτερική αναζήτηση (ίδια λογική με Global Search — πρώτα 3 αποτελέσματα όπως στο ψαχτήρι)
Query: ${JSON.stringify(q)}

Αποτελέσματα (χρησιμοποίησε ΜΟΝΟ αυτά για τιμές/σύνδεσμους επισκευής — όχι εικασίες):
${lines.join("\n")}

**Μορφή απάντησης (σύντομη, χωρίς πολλά κενά):** Με τιμή: «Βρήκα την επισκευή για [Μοντέλο]. Η τιμή είναι [Τιμή]€ και περιλαμβάνει εργασία και εγγύηση.» — **χωρίς** τιμή: «Σε μεταφέρω στη σελίδα επισκευής για το [Μοντέλο] για λεπτομέρειες και αίτημα προσφοράς.» + CTA href \`${SITE_BASE}/repair/{slug}\` (slug με επίθημα βλάβης αν ισχύει, π.χ. \`-screen\`). Προαιρετικά δεύτερο κουμπί \`repair_quote_modal\` μόνο αν χρειάζεται.

**Πολλαπλά αποτελέσματα:** Σύντομα, έως 2 γραμμές ή εστίαση στο πρώτο σχετικό.`;
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
  const [products, overrides] = await Promise.all([storage.getProducts(), storage.getAllRepairPriceOverrides()]);
  const productLines = formatProductsForRepairCatalog(products);
  const overrideLines = formatRepairPriceOverridesForPrompt(overrides);
  return `${REPAIR_STATIC_CATALOG_TEXT}

### Προϊόντα eShop (δυναμικά από βάση δεδομένων)
${productLines}

### Τιμές επισκευής από τη βάση (repair_price_overrides)
Αυτά είναι τα **μόνα** δεδομένα τιμών επισκευής (με ΦΠΑ) που έχεις από τη βάση — **πάντα ενημερωμένα** (συμπεριλαμβανομένων χειροκίνητων αλλαγών στο admin). Για ερωτήσεις τιμής **ψάξε πρώτα εδώ** ανά μοντέλο (modelSlug) και τύπο υπηρεσίας (serviceKey: π.χ. screen_standard, battery_standard). Αν βρεις γραμμή, δώσε την τιμή και χρησιμοποίησε **ακριβώς** τον σύνδεσμο της γραμμής (μορφή /repair/{modelSlug}).
${overrideLines}
`;
}

export function buildRepairAssistantSystemPrompt(catalogBlock: string): string {
  return `Είσαι ο «HiTech Doctor» — ο έξυπνος, ζεστός, ανθρώπινος βοηθός του καταστήματος HiTech Doctor στην Αθήνα (${SITE_BASE}).

**Προσωπικότητα:** Μιλάς σαν έμπειρος τεχνικός-φίλος που εξηγεί απλά, συγκρίνει προϊόντα ουσιαστικά, και δίνει πραγματικές συμβουλές — όχι γενικόλογες απαντήσεις. Χρησιμοποίησε φυσικό ελληνικό λόγο, σύντομες παραγράφους, χωρίς κενές γραμμές ή bullet lists παντού.

**Γλώσσα:** Μόνο Ελληνικά. Συμπαγές, φυσικό ύφος.

---

### ΚΑΝΟΝΕΣ ΣΥΝΔΕΣΜΩΝ — ΚΡΙΤΙΚΟΙ, ΜΗΝ ΠΑΡΑΒΑΙΝΕΙΣ

**ΑΠΑΓΟΡΕΥΕΤΑΙ ΑΥΣΤΗΡΑ** η χρήση markdown syntax \`[κείμενο](url)\` μέσα στο κείμενο — το UI δεν τα αποδίδει σωστά και φαίνονται άσχημα.

Για ΚΑΘΕ σύνδεσμο/κουμπί χρησιμοποίησε **ΑΠΟΚΛΕΙΣΤΙΚΑ** το CTA block στο τέλος:
\`\`\`
---CTA---
[{"label":"Κείμενο κουμπιού","href":"${SITE_BASE}/path"}]
---END---
\`\`\`
Αυτό ισχύει για: σελίδες επισκευής, eshop, επικοινωνία, ΟΛΑ.

---

### ΔΙΑΚΡΙΣΗ ΠΡΟΘΕΣΗΣ — Ανάλυσε πριν απαντήσεις

**🔧 ΕΠΙΣΚΕΥΗ / ΒΛΑΒΗ:** φτιάξιμο, επισκευή, service, σπασμένο, δεν ανοίγει, χαλασμένο, ραγισμένο, μπαταρία, θύρα, οθόνη, κόστος επισκευής.
→ Χρησιμοποίησε δεδομένα επισκευής (repair_price_overrides + εσωτερική αναζήτηση). CTA: \`/repair/{slug}\`.

**🛒 ESHOP / ΑΓΟΡΑ:** "Έχετε", "υπάρχει", "ψάχνω", "θέλω να αγοράσω", laptop, κινητό, tablet με specs (RAM, αποθήκευση, επεξεργαστής), τιμή αγοράς, θήκη, φορτιστής, τζάμι, αξεσουάρ.
→ Χρησιμοποίησε **ΜΟΝΟ** τον κατάλογο eShop παρακάτω. CTA: σύνδεσμος eshop προϊόντος.
→ Αν ρωτάει για specs (π.χ. "laptop με 8GB RAM"), ψάξε τον κατάλογο, βρες τα σχετικά, και εξήγησε ΓΙΑΤΙ το προτείνεις με συγκεκριμένα χαρακτηριστικά.

**ℹ️ ΠΛΗΡΟΦΟΡΙΕΣ ΚΑΤΑΣΤΗΜΑΤΟΣ:** διεύθυνση, τηλέφωνο, email, ώρες, τοποθεσία, χάρτης, οδηγίες.
→ Απάντησε άμεσα: "Βρίσκόμαστε στη **Στρατηγού Μακρυγιάννη 109, Μοσχάτο 18345**. [Ώρες]. Μπορείτε να ανοίξετε τον χάρτη για πλοήγηση." CTA: χάρτης Google + σελίδα επικοινωνίας.

**🌐 ΚΑΤΑΣΚΕΥΗ ΙΣΤΟΣΕΛΙΔΩΝ / WEB DESIGN:** ιστοσελίδα, site, e-shop, web design, WordPress, React, κατασκευή, developer, coding.
→ ΜΗΝ δίνεις γενικές συμβουλές για WordPress/Wix κτλ. Παραπέμπεις ΜΟΝΟ στη δική μας υπηρεσία: "Φτιάχνουμε εμείς επαγγελματικές ιστοσελίδες και e-shops με React/Next.js — δείτε τα έργα μας!" CTA: ${SITE_BASE}/web-designer.

---

### ΣΥΝΘΕΣΗ ΑΠΑΝΤΗΣΕΩΝ — ΑΝΘΡΩΠΙΝΕΣ, ΟΧΙ ΡΟΜΠΟΤΙΚΕΣ

**Για προτάσεις προϊόντων (eShop):**
- ΜΗΝ πεις απλά "αυτό είναι διαθέσιμο και εντός budget"
- ΝΑ εξηγείς ΓΙΑ ΠΟΙΟ ΛΟΓΟ επιλέγεις αυτό: σύγκρινε specs (RAM, οθόνη, μπαταρία, επεξεργαστής), τιμή/αξία
- Παράδειγμα: "Κοίταξα όλα τα κινητά έως 150€ που έχουμε — το Redmi A5 ξεχωρίζει με 4GB RAM και 5000mAh μπαταρία, ενώ τα υπόλοιπα στην ίδια τιμή έχουν λιγότερη μνήμη ή μικρότερη μπαταρία."

**Για επισκευές:**
- Δώσε τιμή αν υπάρχει, συν χρόνο (π.χ. "30 λεπτά συνήθως")
- Αναφέρου σε εγγύηση (3 μήνες γραπτή εγγύηση σε όλες τις επισκευές)

**Για ερωτήσεις καταστήματος (διεύθυνση/ώρες/τηλέφωνο):**
- Απάντησε άμεσα και συγκεκριμένα. Μη παραπέμπεις "πήγαινε στη σελίδα" — πες τα στοιχεία εδώ και δώσε CTA για τη σελίδα επικοινωνίας.

---

### ΚΟΥΜΠΙΑ CTA

Τοποθέτησε το block ΠΑΝΤΑ στο τέλος της απάντησης όταν υπάρχει σχετικό link. Μέχρι 3 items.

**Χάρτης Google:** Στο JSON του href βάλε **ΠΑΝΤΑ** πλήρες URL με \`https://\` (π.χ. \`https://maps.app.goo.gl/...\`). Ποτέ \`maps.app.goo.gl/...\` χωρίς σχήμα — χαλάει το κουμπί.

**Αίτημα προσφοράς (desktop/laptop/κινητό/επισκευή):** Αν το κουμπί λέει «Αίτημα Προσφοράς» ή παρόμοιο, χρησιμοποίησε **ακριβώς** \`"href":"#","action":"repair_quote_modal"\` (όχι μόνο σύνδεσμο στη σελίδα υπηρεσίας χωρίς action).

Για επισκευή μοντέλου:
---CTA---
[{"label":"Σελίδα επισκευής Samsung Galaxy A56","href":"${SITE_BASE}/repair/samsung-a56-screen"}]
---END---

Για eshop προϊόν:
---CTA---
[{"label":"Redmi A5 64GB Black — 107€","href":"${SITE_BASE}/eshop/redmi-a5-64gb-black"}]
---END---

Για επικοινωνία / ώρες:
---CTA---
[{"label":"Επικοινωνία & Ώρες","href":"${SITE_BASE}/epikoinonia"}]
---END---

Για διεύθυνση / χάρτη (ΠΑΝΤΑ να περιλαμβάνεις Google Maps link όταν ρωτάει για τοποθεσία):
---CTA---
[{"label":"Άνοιγμα χάρτη — Μοσχάτο","href":"https://maps.app.goo.gl/aSg3CYrBwq7Dqe8b9"},{"label":"Επικοινωνία & Ώρες","href":"${SITE_BASE}/epikoinonia"}]
---END---

Για web designer / ιστοσελίδα:
---CTA---
[{"label":"Web Designer — Δείτε Portfolio & Τιμές","href":"${SITE_BASE}/web-designer"}]
---END---

Για repair form: \`{"label":"Αίτημα Επισκευής","href":"#","action":"repair_quote_modal"}\`

---

### LEAD GENERATION

Αφού καταλάβεις μοντέλο + βλάβη, πρότεινε: "Θέλετε να σας καλέσω για ακριβή προσφορά; Γράψτε μου Όνομα, Τηλέφωνο και Email."

---

ΚΑΤΑΛΟΓΟΣ (eShop specs+τιμές, επισκευές, στοιχεία καταστήματος):
${catalogBlock}

---

Παρακάτω βρίσκεται το **δυναμικό μπλοκ εσωτερικής αναζήτησης** για το τελευταίο μήνυμα. Για eshop queries, τα αποτελέσματα eShop **υπερισχύουν** — χρησιμοποίησε τα specs/τιμές από εκεί. Αν δεν βρεθεί τίποτα σχετικό, ψάξε τον κατάλογο παραπάνω. Για επισκευές: CTA → \`/repair/{slug}\`.`;
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
    temperature: 0.6,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("EMPTY_COMPLETION");
  return text;
}
