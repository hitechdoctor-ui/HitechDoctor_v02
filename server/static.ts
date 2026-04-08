import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const LOCALBUSINESS_JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "HiTech Doctor",
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
  if (html.includes("</head>")) return html.replace("</head>", `${script}</head>`);
  return `${script}${html}`;
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Assets with content hashes: 1 year immutable cache
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
    }),
  );

  // Other static files (favicon, images, etc) — but NOT index.html (no-cache)
  app.use(
    express.static(distPath, {
      maxAge: "7d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        }
      },
    }),
  );

  // SPA fallback: serve index.html for all non-asset routes
  app.use("/{*path}", async (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    const indexPath = path.resolve(distPath, "index.html");
    const html = await fs.promises.readFile(indexPath, "utf-8");
    res.status(200).set({ "Content-Type": "text/html" }).send(injectLocalBusinessJsonLdIntoHead(html));
  });
}
