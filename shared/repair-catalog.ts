import type { Product } from "./schema";

/**
 * Βάση URL για prompts (production).
 *
 * **Συντήρηση AI chat:** Όταν αλλάζουν πολιτικές, footer/επικοινωνία, FAQ, νέα routes ή
 * βασικό copy στο hitechdoctor.com, ενημέρωσε παράλληλα αυτό το αρχείο (REPAIR_STATIC_CATALOG_TEXT)
 * και έλεγξε το `server/chat-repair.ts` (buildRepairAssistantSystemPrompt) για CTA/ενότητες πρόθεσης.
 */
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
    const specs: string[] = [];
    if (p.ram) specs.push(`RAM: ${p.ram}`);
    if (p.storage) specs.push(`Αποθ: ${p.storage}`);
    if (p.color) specs.push(`Χρώμα: ${p.color}`);
    const specsMeta = specs.length ? ` | ${specs.join(", ")}` : "";
    // Include first 200 chars of description for spec-based recommendations
    const descSnippet = p.description ? ` | specs: ${p.description.slice(0, 200).replace(/\n/g, " ")}` : "";
    return `- ${p.name} | μάρκα: ${brand} | τιμή HiTech: ${fmtEur(p.price)} | ${availabilityLine(p)} | κατηγορία: ${cat}${specsMeta}${descSnippet} | ${SITE_BASE}/eshop/${p.slug}`;
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
## Στοιχεία καταστήματος HiTech Doctor
- Διεύθυνση: Στρατηγού Μακρυγιάννη 109, Μοσχάτο 18345, Αττική
- Google Maps πλοήγηση: https://maps.app.goo.gl/aSg3CYrBwq7Dqe8b9
- Τηλέφωνο / Viber / WhatsApp: +30 698 188 2005
- Email: info@hitechdoctor.com
- Ώρες λειτουργίας: Δευτέρα–Παρασκευή 10:00–19:00 | Σάββατο 10:00–16:00 | Κυριακή Κλειστά
- Σελίδα επικοινωνίας & χάρτης: ${SITE_BASE}/epikoinonia
- Αποστολή συσκευής (BoxNow locker): ${SITE_BASE}/services/apostoli-syskevis
- Αρ. ΓΕΜΗ (εμφανές στο site): 56870309000
- ΑΦΜ / ΔΟΥ: μην επινοείς· πες ότι αναγράφονται στα εκδιδόμενα παραστατικά και στη σελίδα επικοινωνίας αν ζητηθούν

## Νομικές σελίδες & πολιτικές (ίδιο περιεχόμενο με τον ιστότοπο)
- Πολιτική επιστροφών & υπαναχώρησης (προϊόντα eShop vs επισκευή): ${SITE_BASE}/politiki-epistrofon
- Όροι χρήσης ιστότοπου & eShop: ${SITE_BASE}/oroi-chrisis
- Όροι τεχνικού ελέγχου & επισκευής (συσκευή στο εργαστήριο, GDPR συσκευής): ${SITE_BASE}/oroi-episkeuis
- Πολιτική cookies: ${SITE_BASE}/politiki-cookies
- Τρόποι πληρωμής: ${SITE_BASE}/tropoi-pliromis
- Συχνές ερωτήσεις (FAQ): ${SITE_BASE}/faq

**Σύνοψη για απαντήσεις χρηστών (μην αντιφάσκεις με τις σελίδες):**
- Προϊόντα eShop: δικαίωμα υπαναχώρησης **14 ημερολογιακές ημέρες** από την παραλαβή (σε κατάσταση μεταπώλησης, πλήρη συσκευασία όπου ισχύει)· αίτημα **εγγράφως (email)**· μετά έλεγχο, **επιστροφή χρημάτων εντός 7 εργάσιμων ημερών** όπου προβλέπεται. Έξοδα επιστροφής συνήθως πελάτη εκτός αν ορίζεται αλλιώς.
- Επισκευή (υπηρεσία): μετά **ολοκλήρωση** εργασίας και παράδοση **δεν** παρέχεται επιστροφή χρημάτων για την εκτελεσμένη επισκευή (πλαίσιο νόμου)· η **εγγύηση** καλύπτει **ανταλλακτικό και εργασία** σύμφωνα με τους όρους επισκευής.
- Επικοινωνία για επιστροφές προϊόντων: info@hitechdoctor.com, τηλ. +30 698 188 2005, διεύθυνση όπως παραπάνω.

## FAQ (σύντομη σύνοψη — λεπτομέρειες στη σελίδα /faq)
- Χρόνος επισκευής: συχνά 1–2 ώρες για οθόνη/μπαταρία· σύνθετες βλάβες 24–48 ώρες.
- Εγγύηση επισκευής: **6 μήνες** σε επισκευή και ανταλλακτικό (εκτός αν σε συγκεκριμένη σελίδα/προσφορά αναφέρεται άλλο).
- Ανταλλακτικά: υψηλής ποιότητας / συμβατά· για iPhone συχνά OEM ή γνήσια όπου διαθέσιμα — ενημέρωση πελάτη.
- Υγρά: μη φόρτιση/άνοιγμα πριν έρθουν — γρήγορη αντίδραση βοηθά.
- Αν δεν επισκευάζεται: χωρίς χρέωση διάγνωσης (όπως στο FAQ).
- Laptop/tablet/console: ναι — βλ. υπηρεσίες.
- Ραντεβού: τηλ. 698 188 2005, Viber, φόρμα επικοινωνίας, και walk-in.
- Τιμές: εξαρτώνται από συσκευή/βλάβη· δωρεάν εκτίμηση· τελική τιμή πριν ξεκινήσει εργασία.
- Πληρωμές: μετρητά, κάρτα, μεταφορά — λεπτομέρειες στη σελίδα τρόπων πληρωμής.
- Ωράριο: Δευ–Παρ 10:00–19:00, Σάβ 10:00–16:00, Κυριακή κλειστά.

## Κατασκευή Ιστοσελίδων / Web Design (HiTech Doctor)
Αν κάποιος ρωτήσει για ιστοσελίδα, web design, e-shop, WordPress, React, κατασκευή site — **ΜΗΝ** δίνεις γενικές συμβουλές. Παραπέμπεις ΑΜΕΣΑ στη σελίδα μας:
- Σελίδα web designer: ${SITE_BASE}/web-designer
- Τι κάνουμε: Εταιρικές ιστοσελίδες, e-shops, React/Next.js apps, SEO, Mobile-First design
- Stack: React / Next.js, TypeScript, Tailwind CSS, Node.js, PostgreSQL, Stripe
- Πακέτα: Starter €490 | Professional €990 | E-Commerce €1.490+
- Portfolio: Hydrofix, Regalo, Louloudotopos, BsNaomi, TheatreHood, AthEcs, Nikosapost, Metamorfosi
- Παράδειγμα απάντησης: "Φτιάχνουμε εμείς! Δείτε τα έργα μας και τα πακέτα τιμών στη σελίδα Web Designer μας."

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
- eShop (αγορά συσκευών & αξεσουάρ): ${SITE_BASE}/eshop
- IMEI Check: ${SITE_BASE}/services/imei-check
- IPSW Download: ${SITE_BASE}/services/ipsw-download

## Μοτίβα URL ανά μάρκα (σελίδα συγκεκριμένου μοντέλου)
- iPhone: ${SITE_BASE}/episkevi-iphone/{slug} — π.χ. 15-pro, 14, se-3
- Samsung Galaxy: ${SITE_BASE}/episkevi-samsung/{slug}
- Xiaomi / Redmi / Poco: ${SITE_BASE}/episkevi-xiaomi/{slug}
- Huawei: ${SITE_BASE}/episkevi-huawei/{slug}
- OnePlus: ${SITE_BASE}/episkevi-oneplus/{slug}
- Laptop: ${SITE_BASE}/episkevi-laptop/{slug}
- Tablet: ${SITE_BASE}/episkevi-tablet/{slug}
- Desktop: ${SITE_BASE}/episkevi-desktop/{slug}

## Τύποι βλαβών → τυπικές εργασίες
- Ραγισμένη / μαύρη οθόνη, δεν ανάβει αφής → αλλαγή οθόνης
- Γρήγορη αποφόρτιση, shutdown → αλλαγή μπαταρίας
- Δεν φορτίζει, χαλαρή θύρα → επισκευή/αλλαγή θύρας φόρτισης
- Νερό / υγρά → διαγνωστικός έλεγχος
- Software / iOS restore → IPSW ή επικοινωνία

Μην επινοείς slug· αν δεν ξέρεις το ακριβές slug, δώσε το hub της μάρκας.
`.trim();
