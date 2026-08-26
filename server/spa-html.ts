import { injectPageSeoIntoHtml } from "./inject-html-meta";
import { resolvePageSeo } from "./resolve-page-seo";
import { getCanonicalSiteOrigin } from "./sitemap";
import type { IStorage } from "./storage";

const LOCALBUSINESS_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "HiTech Doctor",
  image: "https://hitechdoctor.com/og-image.png",
  telephone: "+306981882005",
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Στρατηγού Μακρυγιάννη 109",
    addressLocality: "Μοσχάτο",
    postalCode: "18345",
    addressCountry: "GR",
  },
  openingHours: [
    "Mo 10:00-15:00",
    "We 10:00-15:00",
    "Sa 10:00-15:00",
    "Tu 10:00-14:00",
    "Th 10:00-14:00",
    "Fr 10:00-14:00",
    "Tu 17:30-21:00",
    "Th 17:30-21:00",
    "Fr 17:30-21:00",
  ],
  hasMap: "https://maps.app.goo.gl/aSg3CYrBwq7Dqe8b9",
  geo: {
    "@type": "GeoCoordinates",
    latitude: 37.9528736,
    longitude: 23.6792087,
  },
  areaServed: "Athens, Greece",
  sameAs: [
    "https://facebook.com/hitechdoctor",
    "https://instagram.com/hitechdoctor",
    "https://tiktok.com/@hitechdoctor",
  ],
});

function injectLocalBusinessJsonLdIntoHead(html: string): string {
  const script = `<script type="application/ld+json">${LOCALBUSINESS_JSON_LD}</script>`;
  if (html.includes(script)) return html;
  if (html.includes("</head>")) return html.replace("</head>", `    ${script}\n  </head>`);
  return `${script}${html}`;
}

/** Προετοιμασία SPA HTML: JSON-LD + σελίδα-ειδικά Open Graph meta για social crawlers. */
export async function prepareSpaHtml(
  html: string,
  requestUrl: string,
  storage?: IStorage,
): Promise<string> {
  const siteOrigin = getCanonicalSiteOrigin();
  const pathname = (() => {
    try {
      return new URL(requestUrl, siteOrigin).pathname;
    } catch {
      return requestUrl.split("?")[0]?.split("#")[0] ?? "/";
    }
  })();

  const meta = await resolvePageSeo(pathname, siteOrigin, storage);
  let out = injectPageSeoIntoHtml(html, meta, siteOrigin);
  out = injectLocalBusinessJsonLdIntoHead(out);
  return out;
}
