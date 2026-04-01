/**
 * Μετά την υποβολή αιτήματος επισκευής: προσφορά τζαμιού μόνο για κινητό + οθόνη/μπαταρία·
 * στα υπόλοιπα, μήνυμα «επισκεφτείτε το κατάστημα» ανά κατηγορία.
 */

export type VisitStoreVariant = "playstation" | "computer" | "tablet" | "apple_watch" | "generic";

const SCREEN_RE = /οθόν|οθον|screen|display|lcd|oled|amoled|τζάμι\s*οθ|σπασμέν/i;
const BATTERY_RE = /μπαταρ|battery/i;
const PORT_RE = /θύρ|φόρτισ|charging|usb|connector|πιοζ|πορτ|lightning|type[\s-]?c/i;

/** Μη-κινητές συσκευές στο κείμενο — δεν προσφέρουμε τζάμι κινητού */
const NON_PHONE_DEVICE_RE =
  /playstation|ps\s*5|ps\s*4|ps5|ps4|dualsense|joystick|χειριστήρι|χειριστηρ|desktop|pc\b|laptop|macbook|imac|tablet|ipad|surface|apple\s*watch|galaxy\s*watch/i;

export function inferVisitVariantFromPath(pathname: string): VisitStoreVariant {
  const p = pathname.toLowerCase();
  if (p.includes("playstation") || p.includes("episkeui-playstation") || /\bps[45]\b/.test(p)) {
    return "playstation";
  }
  if (p.includes("laptop") || p.includes("episkevi-laptop") || p.includes("desktop") || p.includes("episkevi-desktop")) {
    return "computer";
  }
  if (p.includes("tablet") || p.includes("episkevi-tablet")) {
    return "tablet";
  }
  if (p.includes("apple-watch") || p.includes("apple_watch") || p.includes("service-apple-watch")) {
    return "apple_watch";
  }
  return "generic";
}

export function isSmartphoneRepairPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return (
    p.includes("/episkevi-iphone") ||
    p.includes("/episkevi-v2-iphone") ||
    p.includes("/episkevi-samsung") ||
    p.includes("/episkevi-xiaomi") ||
    p.includes("/episkevi-huawei") ||
    p.includes("/episkevi-oneplus")
  );
}

function isLikelyPhoneDevice(deviceName: string, notes: string): boolean {
  return /iphone|samsung|galaxy|xiaomi|redmi|poco|huawei|oneplus|pixel|κινητ|smartphone|tilefono|τηλέφων/i.test(
    `${deviceName} ${notes}`
  );
}

/**
 * true = κατάλληλο για προσφορά τζαμιού, false = όχι, null = αβέβαιο
 */
export function inferTemperedFromNotes(deviceName: string, notes: string): boolean | null {
  const blob = `${deviceName}\n${notes}`;
  if (NON_PHONE_DEVICE_RE.test(blob) && !isLikelyPhoneDevice(deviceName, notes)) {
    return false;
  }
  if (PORT_RE.test(blob) && !SCREEN_RE.test(blob) && !BATTERY_RE.test(blob)) {
    return false;
  }
  if (SCREEN_RE.test(blob) || BATTERY_RE.test(blob)) {
    return isLikelyPhoneDevice(deviceName, notes) ? true : null;
  }
  return null;
}

export function resolveRepairSubmitUpsell(args: {
  pathname: string;
  deviceName: string;
  notes: string;
  /** true/false από τη σελίδα (καρτέλα οθόνης/μπαταρίας κινητού). undefined = αυτόματη εκτίμηση */
  temperedGlassOffer?: boolean;
  visitStoreVariant?: VisitStoreVariant;
}): { kind: "tempered" } | { kind: "visit"; variant: VisitStoreVariant } {
  const pathVariant = args.visitStoreVariant ?? inferVisitVariantFromPath(args.pathname);

  if (args.temperedGlassOffer === true) {
    return { kind: "tempered" };
  }
  if (args.temperedGlassOffer === false) {
    return { kind: "visit", variant: pathVariant };
  }

  if (!isSmartphoneRepairPath(args.pathname)) {
    const hint = inferTemperedFromNotes(args.deviceName, args.notes);
    if (hint === true && isLikelyPhoneDevice(args.deviceName, args.notes)) {
      return { kind: "tempered" };
    }
    return { kind: "visit", variant: pathVariant };
  }

  const hint = inferTemperedFromNotes(args.deviceName, args.notes);
  if (hint === true) return { kind: "tempered" };
  if (hint === false) return { kind: "visit", variant: "generic" };
  return { kind: "visit", variant: "generic" };
}

export type VisitStoreUpsellStrings = {
  title: string;
  body: string;
  linkHref: string;
  linkLabel: string;
};

export function getVisitStoreUpsellCopy(
  variant: VisitStoreVariant,
  requestId: number | null
): VisitStoreUpsellStrings {
  const ref =
    requestId != null
      ? ` Αναφέρετε το αίτημα #${requestId} στο κατάστημα για ταχύτερη εξυπηρέτηση.`
      : " Αναφέρετε το online αίτημά σας στο κατάστημα.";

  switch (variant) {
    case "playstation":
      return {
        title: "Επισκεφτείτε το κατάστημά μας",
        body: `Για επισκευές PlayStation, χειριστηρίων DualSense και αξεσουάρ, περάστε από το εργαστήριό μας στο κέντρο της Αθήνας — εκεί μπορούμε να δούμε τη βλάβη επί τόπου και να σας ενημερώσουμε για χρόνο και κόστος.${ref}`,
        linkHref: "/contact",
        linkLabel: "Διεύθυνση & επικοινωνία",
      };
    case "computer":
      return {
        title: "Επισκεφτείτε το κατάστημά μας",
        body: `Για επισκευές υπολογιστών, αναβαθμίσεις, πληκτρολόγια και περιφερειακά, το κατάστημά μας είναι το σωστό σημείο για διάγνωση και άμεση εξυπηρέτηση.${ref}`,
        linkHref: "/contact",
        linkLabel: "Διεύθυνση & επικοινωνία",
      };
    case "tablet":
      return {
        title: "Επισκεφτείτε το κατάστημά μας",
        body: `Για tablet και μεγάλες οθόνες, η φυσική παράδοση της συσκευής μας βοηθά να επιβεβαιώσουμε την ακριβή βλάβη και να σας δώσουμε σαφή εικόνα κόστους και χρόνου.${ref}`,
        linkHref: "/contact",
        linkLabel: "Διεύθυνση & επικοινωνία",
      };
    case "apple_watch":
      return {
        title: "Επισκεφτείτε το κατάστημά μας",
        body: `Για Apple Watch και μικρές συσκευές φοριούνται, το κατάστημα επιτρέπει ασφαλή παράδοση και λεπτομερή έλεγχο πριν την επισκευή.${ref}`,
        linkHref: "/contact",
        linkLabel: "Διεύθυνση & επικοινωνία",
      };
    default:
      return {
        title: "Επισκεφτείτε το κατάστημά μας",
        body: `Θα χαρούμε να σας δούμε στο εργαστήριό μας στην Αθήνα — εκεί ολοκληρώνουμε τη διάγνωση, συζητάμε επιλογές και παραδίδουμε τη συσκευή με γραπτή εγγύηση.${ref}`,
        linkHref: "/contact",
        linkLabel: "Διεύθυνση & επικοινωνία",
      };
  }
}
