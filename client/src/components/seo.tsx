import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

/** Αποφεύγει διπλό suffix όταν το title ήδη περιέχει «| HiTech Doctor». */
function buildDocumentTitle(title: string): string {
  const t = title.trim();
  if (/\|\s*HiTech Doctor/i.test(t)) return t;
  return `${t} | HiTech Doctor`;
}

/** Meta description ~160 χαρακτήρες, κόβει σε όριο λέξης όπου είναι εφικτό. */
function clampMetaDescription(description: string, max = 158): string {
  const d = description.trim().replace(/\s+/g, " ");
  if (d.length <= max) return d;
  const cut = d.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = (lastSpace > 48 ? cut.slice(0, lastSpace) : cut).trimEnd();
  return `${base}…`;
}

export function Seo({ title, description, image, url }: SeoProps) {
  const siteTitle = buildDocumentTitle(title);
  const metaDesc = clampMetaDescription(description);

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={metaDesc} />

      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content="website" />
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDesc} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
