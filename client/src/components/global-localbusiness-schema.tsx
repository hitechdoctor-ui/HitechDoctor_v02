import { Helmet } from "react-helmet-async";
import { buildLocalBusinessJsonLd, buildOrganizationJsonLd } from "@/lib/business-info";

/** LocalBusiness & Organization JSON-LD σε όλες τις δημόσιες σελίδες (Google Business/SEO/AI discovery). */
export function GlobalLocalBusinessSchema() {
  const localBusiness = buildLocalBusinessJsonLd();
  const organization = buildOrganizationJsonLd();
  
  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
    </Helmet>
  );
}

