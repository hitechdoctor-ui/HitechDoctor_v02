import type { Express, RequestHandler } from "express";

/**
 * Μόνιμα 301 redirects για URLs που εμφανίστηκαν ως 404 στο Search Console (παλιό Shopify/WP).
 * Εκτελείται πριν τα API routes· αγνοεί `/api`, Vite dev (`/@`), κ.λπ.
 */
function normalizePath(path: string): string {
  try {
    const noQuery = path.split("?")[0] || "/";
    let p = decodeURIComponent(noQuery);
    if (!p.startsWith("/")) p = `/${p}`;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p.toLowerCase();
  } catch {
    return "/";
  }
}

/** Ακριβείς αντιστοιχίσεις (κανονικοποιημένο path → νέο path). */
const EXACT_REDIRECTS: Record<string, string> = {
  /** robots.txt → στατικό αρχείο (αποφυγή injection / διαφορετικού περιεχομένου στο URL /robots.txt) */
  "/robots.txt": "/robots-static.txt",
  "/contact-us": "/contact",
  "/pages/contact-us": "/contact",
  "/pages/contact": "/contact",
  "/epikoinonia": "/contact",
  "/order-tracking": "/check-status",
  "/track-order": "/check-status",
  "/tropoi-kai-methodoi-plirwmis": "/tropoi-pliromis",
  "/tropoi-plirwmis": "/tropoi-pliromis",
  "/payment-methods": "/tropoi-pliromis",
  "/episkevi-service-iphone": "/services/episkeui-iphone",
  "/episkevi-iphone": "/services/episkeui-iphone",
  "/service-iphone": "/services/episkeui-iphone",
  "/iphone-repair": "/services/episkeui-iphone",
  "/episkevi-service-samsung": "/services/episkeui-samsung",
  "/service-samsung-kinita": "/services/episkeui-samsung",
  "/samsung-repair": "/services/episkeui-samsung",
  "/episkevi-service-xiaomi": "/services/episkeui-xiaomi",
  "/xiaomi-repair": "/services/episkeui-xiaomi",
  "/episkevi-service-huawei": "/services/episkeui-huawei",
  "/huawei-repair": "/services/episkeui-huawei",
  "/episkevi-laptop": "/services/episkeui-laptop",
  "/laptop-repair": "/services/episkeui-laptop",
  "/episkevi-tablet": "/services/episkeui-tablet",
  "/tablet-repair": "/services/episkeui-tablet",
  "/episkevi-desktop": "/services/episkeui-desktop",
  "/desktop-repair": "/services/episkeui-desktop",
  "/episkevi-samsung": "/services/episkeui-samsung",
  "/episkevi-xiaomi": "/services/episkeui-xiaomi",
  "/episkevi-huawei": "/services/episkeui-huawei",
  "/episkevi-oneplus": "/services/episkeui-oneplus",
  "/collections/episkevi-kinitwn": "/services/episkeui-kiniton",
  "/collections/episkevi-iphone": "/services/episkeui-iphone",
  "/collections/episkevi-samsung": "/services/episkeui-samsung",
  "/collections/mobile-repair": "/services/episkeui-kiniton",
  "/collections/all": "/eshop",
  "/collections/frontpage": "/",
  "/cart": "/eshop",
  "/checkout-old": "/checkout",
  "/blogs/news": "/blog",
  "/blog-news": "/blog",
  "/pages/about-us": "/sxetika-me-mas",
  "/about-us": "/sxetika-me-mas",
  "/pages/faq": "/faq",
  "/pages/terms": "/oroi-episkeuis",
  "/terms": "/oroi-episkeuis",
  "/pages/privacy": "/politiki-cookies",
  "/pages/cookies": "/politiki-cookies",
  "/apple-service-center": "/apple-service",
  "/iphone-service": "/apple-service",
  "/ipsw": "/services/ipsw-download",
  "/ipsw-download": "/services/ipsw-download",
  "/imei": "/services/imei-check",
  "/imei-check": "/services/imei-check",
  "/device-shipping": "/services/apostoli-syskevis",
  "/apostoli-syskevis": "/services/apostoli-syskevis",
  "/send-device": "/services/apostoli-syskevis",
  "/web-design": "/web-designer",
  "/website-design": "/web-designer",
  "/product/episkevi-othonis-laptop": "/services/episkeui-laptop",
  "/product/episkevi-othonis-laptop-oem": "/services/episkeui-laptop",
  "/product/episkevi-othonis-laptop-copy": "/services/episkeui-laptop",
  "/product/episkevi-mpataria-laptop": "/services/episkeui-laptop",
  "/product/episkevi-pliktrologiou-laptop": "/services/episkeui-laptop",
  "/product/episkevi-laptop-service": "/services/episkeui-laptop",
};

const IPHONE_SLUG_ALIASES: Record<string, string> = {
  "iphone-x": "iphone-x",
  "iphone-xr": "iphone-xr",
  "iphone-xs": "iphone-xs",
  "iphone-xs-max": "iphone-xs-max",
  "iphone-11": "iphone-11",
  "iphone-11-pro": "iphone-11-pro",
  "iphone-11-pro-max": "iphone-11-pro-max",
  "iphone-12-mini": "iphone-12-mini",
  "iphone-12": "iphone-12",
  "iphone-12-pro": "iphone-12-pro",
  "iphone-12-pro-max": "iphone-12-pro-max",
  "iphone-13-mini": "iphone-13-mini",
  "iphone-13": "iphone-13",
  "iphone-13-pro": "iphone-13-pro",
  "iphone-13-pro-max": "iphone-13-pro-max",
  "iphone-14": "iphone-14",
  "iphone-14-plus": "iphone-14-plus",
  "iphone-14-pro": "iphone-14-pro",
  "iphone-14-pro-max": "iphone-14-pro-max",
  "iphone-15": "iphone-15",
  "iphone-15-plus": "iphone-15-plus",
  "iphone-15-pro": "iphone-15-pro",
  "iphone-15-pro-max": "iphone-15-pro-max",
  "iphone-16": "iphone-16",
  "iphone-16-plus": "iphone-16-plus",
  "iphone-16-pro": "iphone-16-pro",
  "iphone-16-pro-max": "iphone-16-pro-max",
  "iphone-se": "iphone-se-2022",
  "iphone-se-2020": "iphone-se-2020",
  "iphone-se-2022": "iphone-se-2022",
  "iphone-8": "iphone-8",
  "iphone-8-plus": "iphone-8-plus",
};

for (const [legacy, slug] of Object.entries(IPHONE_SLUG_ALIASES)) {
  EXACT_REDIRECTS[`/iphone-model/${legacy}`] = `/episkevi-iphone/${slug}`;
  EXACT_REDIRECTS[`/iphone/${legacy}`] = `/episkevi-iphone/${slug}`;
  EXACT_REDIRECTS[`/products/${legacy}`] = `/episkevi-iphone/${slug}`;
}

export function registerRedirects(app: Express): void {
  const handler: RequestHandler = (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();

    const raw = (req.originalUrl || req.url || "").split("?")[0];
    if (
      raw.startsWith("/api") ||
      raw.startsWith("/@") ||
      raw.startsWith("/node_modules") ||
      raw.startsWith("/src/") ||
      raw.startsWith("/assets/") ||
      raw.match(/\.(js|css|map|ico|png|jpg|jpeg|webp|svg|woff2?|ttf|eot)$/i)
    ) {
      return next();
    }

    const path = normalizePath(raw);
    const direct = EXACT_REDIRECTS[path];
    if (direct) {
      return res.redirect(301, direct);
    }

    if (path.startsWith("/iphone-model/") || path.startsWith("/iphone-models/")) {
      const base = path.startsWith("/iphone-model/") ? "/iphone-model/" : "/iphone-models/";
      const rest = path.slice(base.length).replace(/^\/+/, "");
      if (!rest) return res.redirect(301, "/services/episkeui-iphone");
      const slug = rest.split("/")[0];
      const mapped = IPHONE_SLUG_ALIASES[slug] ?? slug;
      return res.redirect(301, `/episkevi-iphone/${mapped}`);
    }

    const segments = path.split("/").filter(Boolean);
    if (segments[0] === "episkevi-iphone" && segments.length >= 2) {
      return next();
    }

    if (path.startsWith("/product/")) {
      return res.redirect(301, "/eshop");
    }

    /** WooCommerce / παλιές κατηγορίες προϊόντων */
    if (path === "/product-category" || path.startsWith("/product-category/")) {
      return res.redirect(301, "/eshop");
    }

    if (path.startsWith("/products/")) {
      return res.redirect(301, "/eshop");
    }

    if (path.startsWith("/collections/")) {
      return res.redirect(301, "/eshop");
    }

    if (path.startsWith("/brand/") || path.startsWith("/brands/")) {
      return res.redirect(301, "/eshop");
    }

    if (
      path.startsWith("/wp-content/") ||
      path.startsWith("/wp-admin/") ||
      path.startsWith("/wp-includes/") ||
      path.startsWith("/wp-json/")
    ) {
      return res.redirect(301, "/");
    }

    if (path.startsWith("/tag/") || path.startsWith("/category/") || path.startsWith("/author/")) {
      return res.redirect(301, "/blog");
    }

    if (path.startsWith("/pages/") && path !== "/pages") {
      return res.redirect(301, "/");
    }

    next();
  };

  app.use(handler);
}
