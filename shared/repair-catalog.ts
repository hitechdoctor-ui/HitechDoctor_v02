import type { Product } from "./schema";

/** Βάση URL για prompts (production). */
export const SITE_BASE = "https://hitechdoctor.com";

function fmtEur(price: string | number): string {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(n)) return String(price);
  return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR" }).format(n);
}

function availabilityLine(p: Product): string {
  if (p.preOrder) return "διαθεσιμότητα: προ-παραγγελία";
  return "διαθεσιμότητα: σε απόθεμα (όπως στο eShop)";
}

/**
 * Προϊόντα eShop από τη βάση — τιμή, μάρκα, διαθεσιμότητα, σύνδεσμος (για ακριβείς απαντήσεις AI).
 * Χρησιμοποιείται από server/chat-repair.ts μετά το storage.getProducts().
 */
export function formatProductsForRepairCatalog(products: Product[]): string {
  const rows = products.filter((p) => p.slug && p.slug.length > 0);
  if (rows.length === 0) return "(Δεν υπάρχουν ενεργά προϊόντα eShop στον κατάλογο.)";

  const line = (p: Product) => {
    const brand = p.brand?.trim() || "—";
    const cat = p.subcategory ?? p.category;
    const extras = [p.ram, p.storage, p.color].filter(Boolean).join(", ");
    const meta = extras ? ` | ${extras}` : "";
    return `- ${p.name} | μάρκα: ${brand} | τιμή HiTech: ${fmtEur(p.price)} | ${availabilityLine(p)} | κατηγορία: ${cat}${meta} | ${SITE_BASE}/eshop/${p.slug}`;
  };

  const apple = rows.filter(
    (p) =>
      (p.brand && /apple|iphone/i.test(p.brand)) ||
      /iphone/i.test(p.name)
  );
  const xiaomiRedmi = rows.filter(
    (p) =>
      (p.brand && /xiaomi|redmi|poco/i.test(p.brand)) ||
      /redmi|poco|xiaomi/i.test(p.name)
  );
  const rest = rows.filter((p) => !apple.includes(p) && !xiaomiRedmi.includes(p));

  const parts: string[] = [];
  if (apple.length) {
    parts.push("#### Apple / iPhone (από βάση)\n" + apple.map(line).join("\n"));
  }
  if (xiaomiRedmi.length) {
    parts.push("#### Xiaomi / Redmi / POCO (από βάση)\n" + xiaomiRedmi.map(line).join("\n"));
  }
  if (rest.length) {
    parts.push("#### Λοιπά προϊόντα eShop (από βάση)\n" + rest.map(line).join("\n"));
  }
  return parts.join("\n\n");
}

/**
 * Στατικός κατάλογος επισκευών & σελίδων (ιστότοπος HiTech Doctor).
 * Ο assistant πρέπει να προτείνει ΜΟΝΟ συνδέσμους από εδώ + από τα προϊόντα eShop παραπάνω.
 */
export const REPAIR_STATIC_CATALOG_TEXT = `
## Κεντρικές σελίδες υπηρεσιών
- Επισκευή κινητών (γενικά): ${SITE_BASE}/services/episkeui-kiniton
- Επισκευή iPhone (hub): ${SITE_BASE}/services/episkeui-iphone
- Επισκευή Samsung: ${SITE_BASE}/services/episkeui-samsung
- Επισκευή Xiaomi / Redmi / Poco: ${SITE_BASE}/services/episkeui-xiaomi
- Επισκευή Huawei: ${SITE_BASE}/services/episkeui-huawei
- Επισκευή OnePlus: ${SITE_BASE}/services/episkeui-oneplus
- Επισκευή Tablet: ${SITE_BASE}/services/episkeui-tablet
- Επισκευή Laptop: ${SITE_BASE}/services/episkeui-laptop
- Επισκευή Desktop: ${SITE_BASE}/services/episkeui-desktop
- Επισκευή Apple Watch: ${SITE_BASE}/services/episkeui-apple-watch
- Επισκευή PlayStation: ${SITE_BASE}/services/episkeui-playstation
- Όλες οι υπηρεσίες: ${SITE_BASE}/services
- Επικοινωνία / ραντεβού: ${SITE_BASE}/epikoinonia
- eShop: ${SITE_BASE}/eshop
- Αποστολή συσκευής (BoxNow): ${SITE_BASE}/services/apostoli-syskevis
- IMEI Check: ${SITE_BASE}/services/imei-check
- IPSW Download: ${SITE_BASE}/services/ipsw-download

## Μοτίβα URL ανά μάρκα (σελίδα συγκεκριμένου μοντέλου)
Κάθε μοντέλο έχει δική σελίδα με τιμές οθόνης / μπαταρίας / θύρας (όπου ισχύει).
- iPhone: ${SITE_BASE}/episkevi-iphone/{slug} — π.χ. slug: iphone-15-pro, iphone-14, se-3
- Samsung Galaxy: ${SITE_BASE}/episkevi-samsung/{slug}
- Xiaomi / Redmi / Poco: ${SITE_BASE}/episkevi-xiaomi/{slug}
- Huawei: ${SITE_BASE}/episkevi-huawei/{slug}
- OnePlus: ${SITE_BASE}/episkevi-oneplus/{slug}
- Laptop: ${SITE_BASE}/episkevi-laptop/{slug}
- Tablet: ${SITE_BASE}/episkevi-tablet/{slug}
- Desktop: ${SITE_BASE}/episkevi-desktop/{slug}

## Τύποι βλαβών → τυπικές εργασίες (ενδεικτικά)
- Ραγισμένη / μαύρη οθόνη, δεν ανάβει αφής → αλλαγή οθόνης (ανά μοντέλο στη σελίδα μοντέλου)
- Γρήγορη αποφόρτιση, shutdown → αλλαγή μπαταρίας
- Δεν φορτίζει, χαλαρή θύρα → επισκευή/αλλαγή θύρας φόρτισης
- Νερό / υγρά → διαγνωστικός έλεγχος (επικοινωνία ή αίτημα επισκευής)
- Software / iOS restore → IPSW ή επικοινωνία

Μην επινοείς slug· αν δεν ξέρεις το ακριβές slug, δώσε το hub της μάρκας και πες στον χρήστη να επιλέξει μοντέλο από τη λίστα.
`.trim();
