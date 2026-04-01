/**
 * Κεντρικά στοιχεία επιχείρησης (footer, επικοινωνία, structured data).
 * Για Google Merchant Center: ορίστε VITE_BUSINESS_AFM και VITE_BUSINESS_DOU στο .env του build.
 */
const env = import.meta.env;

export const BUSINESS_TRADE_NAME = "HiTech Doctor";

export const BUSINESS_REGISTERED_NAME =
  (env.VITE_BUSINESS_LEGAL_NAME as string | undefined)?.trim() || BUSINESS_TRADE_NAME;

export const BUSINESS_GEMI = "56870309000";

export const BUSINESS_STREET_ADDRESS = "Στρατηγού Μακρυγιάννη 109";
export const BUSINESS_ADDRESS_LOCALITY = "Μοσχάτο";
export const BUSINESS_ADDRESS_REGION = "Αττική";
export const BUSINESS_POSTAL_CODE = "18345";
export const BUSINESS_COUNTRY_CODE = "GR";
export const BUSINESS_MAPS_URL = "https://maps.app.goo.gl/aSg3CYrBwq7Dqe8b9";

export const BUSINESS_PHONE_DISPLAY = "698 188 2005";
export const BUSINESS_PHONE_E164 = "+306981882005";
export const BUSINESS_EMAIL = "info@hitechdoctor.com";
export const BUSINESS_SITE_URL = "https://hitechdoctor.com";

export const BUSINESS_GEO = {
  latitude: 37.9528736,
  longitude: 23.6792087,
} as const;

/** Εμφανίσιμο ωράριο (συμβατό με footer / επικοινωνία) */
export const BUSINESS_HOURS_SUMMARY =
  "Δευτέρα – Παρασκευή 10:00–19:00 · Σάββατο 10:00–16:00 · Κυριακή κλειστά";

export const BUSINESS_AFM = (env.VITE_BUSINESS_AFM as string | undefined)?.trim() ?? "";
export const BUSINESS_DOU = (env.VITE_BUSINESS_DOU as string | undefined)?.trim() ?? "";

export function formatBusinessAddressOneLine(): string {
  return `${BUSINESS_STREET_ADDRESS}, ${BUSINESS_ADDRESS_LOCALITY} ${BUSINESS_POSTAL_CODE}, ${BUSINESS_ADDRESS_REGION}, Ελλάδα`;
}

export function buildOrganizationJsonLd(): Record<string, unknown> {
  const org: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_REGISTERED_NAME,
    alternateName: BUSINESS_TRADE_NAME,
    url: BUSINESS_SITE_URL,
    logo: `${BUSINESS_SITE_URL}/favicon.png`,
    email: BUSINESS_EMAIL,
    telephone: BUSINESS_PHONE_E164,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_STREET_ADDRESS,
      addressLocality: BUSINESS_ADDRESS_LOCALITY,
      addressRegion: BUSINESS_ADDRESS_REGION,
      postalCode: BUSINESS_POSTAL_CODE,
      addressCountry: BUSINESS_COUNTRY_CODE,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BUSINESS_PHONE_E164,
        email: BUSINESS_EMAIL,
        contactType: "customer service",
        areaServed: "GR",
        availableLanguage: ["Greek", "el"],
      },
    ],
    identifier: {
      "@type": "PropertyValue",
      name: "ΓΕΜΗ",
      value: BUSINESS_GEMI,
    },
  };
  if (BUSINESS_AFM) {
    org.taxID = BUSINESS_AFM;
  }
  return org;
}

export function buildLocalBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_REGISTERED_NAME,
    alternateName: BUSINESS_TRADE_NAME,
    description: "Επαγγελματική επισκευή κινητών τηλεφώνων, tablet και laptop στην Αθήνα.",
    url: BUSINESS_SITE_URL,
    telephone: BUSINESS_PHONE_E164,
    email: BUSINESS_EMAIL,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS_STREET_ADDRESS,
      addressLocality: BUSINESS_ADDRESS_LOCALITY,
      addressRegion: BUSINESS_ADDRESS_REGION,
      postalCode: BUSINESS_POSTAL_CODE,
      addressCountry: BUSINESS_COUNTRY_CODE,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BUSINESS_GEO.latitude,
      longitude: BUSINESS_GEO.longitude,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "10:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "16:00",
      },
    ],
    ...(BUSINESS_AFM ? { taxID: BUSINESS_AFM } : {}),
  };
}
