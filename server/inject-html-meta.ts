import {
  buildDocumentTitle,
  clampMetaDescription,
  resolveAbsoluteImageUrl,
  type PageSeoMeta,
} from "@shared/seo-meta";

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function upsertMetaTag(
  html: string,
  attr: "name" | "property",
  key: string,
  content: string,
): string {
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
    "i",
  );
  if (re.test(html)) return html.replace(re, tag);
  if (html.includes("</head>")) return html.replace("</head>", `    ${tag}\n  </head>`);
  return `${tag}${html}`;
}

function upsertTitle(html: string, title: string): string {
  const tag = `<title>${escapeAttr(title)}</title>`;
  if (/<title>[^<]*<\/title>/i.test(html)) {
    return html.replace(/<title>[^<]*<\/title>/i, tag);
  }
  if (html.includes("</head>")) return html.replace("</head>", `    ${tag}\n  </head>`);
  return `${tag}${html}`;
}

function upsertCanonical(html: string, url: string): string {
  const tag = `<link rel="canonical" href="${escapeAttr(url)}" />`;
  const re = /<link[^>]+rel=["']canonical["'][^>]*>/i;
  if (re.test(html)) return html.replace(re, tag);
  if (html.includes("</head>")) return html.replace("</head>", `    ${tag}\n  </head>`);
  return `${tag}${html}`;
}

/** Εισάγει/αντικαθιστά title, description, Open Graph & Twitter Card στο αρχικό HTML (για crawlers χωρίς JS). */
export function injectPageSeoIntoHtml(
  html: string,
  meta: PageSeoMeta,
  siteOrigin: string,
): string {
  const title = buildDocumentTitle(meta.title);
  const description = clampMetaDescription(meta.description);
  const image = resolveAbsoluteImageUrl(meta.image, siteOrigin);
  const type = meta.type ?? "website";

  let out = upsertTitle(html, title);
  out = upsertMeta(out, "name", "description", description);
  out = upsertMeta(out, "property", "og:title", title);
  out = upsertMeta(out, "property", "og:description", description);
  out = upsertMeta(out, "property", "og:type", type);
  out = upsertMeta(out, "property", "og:url", meta.url);
  out = upsertMeta(out, "property", "og:image", image);
  out = upsertMeta(out, "property", "og:site_name", "HiTech Doctor");
  out = upsertMeta(out, "property", "og:locale", "el_GR");
  out = upsertMeta(out, "name", "twitter:card", "summary_large_image");
  out = upsertMeta(out, "name", "twitter:title", title);
  out = upsertMeta(out, "name", "twitter:description", description);
  out = upsertMeta(out, "name", "twitter:image", image);
  out = upsertCanonical(out, meta.url);
  return out;
}

function upsertMeta(
  html: string,
  attr: "name" | "property",
  key: string,
  content: string,
): string {
  return upsertMetaTag(html, attr, key, content);
}
