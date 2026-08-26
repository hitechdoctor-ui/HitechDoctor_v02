import { Helmet } from "react-helmet-async";
import {
  buildDocumentTitle,
  buildPageUrl,
  clampMetaDescription,
  resolveAbsoluteImageUrl,
  type OgType,
} from "@shared/seo-meta";

interface SeoProps {
  title: string;
  description: string;
  /** Absolute URL ή path (π.χ. /tools/screen-protector-checker) */
  url?: string;
  /** Συντομογραφία του url — path μόνο */
  path?: string;
  image?: string;
  type?: OgType;
  keywords?: string;
  noIndex?: boolean;
}

export function Seo({ title, description, image, url, path, type = "website", keywords, noIndex }: SeoProps) {
  const siteTitle = buildDocumentTitle(title);
  const metaDesc = clampMetaDescription(description);
  const canonical = url ?? (path ? buildPageUrl(path) : undefined);
  const ogImage = resolveAbsoluteImageUrl(image);

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={metaDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content={type} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="HiTech Doctor" />
      <meta property="og:locale" content="el_GR" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
