import { type Express } from "express";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

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

export async function setupVite(server: Server, app: Express) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      template = injectLocalBusinessJsonLdIntoHead(template);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
