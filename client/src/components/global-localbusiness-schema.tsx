import { Helmet } from "react-helmet-async";
import { buildLocalBusinessJsonLd } from "@/lib/business-info";

/** LocalBusiness JSON-LD σε όλες τις δημόσιες σελίδες (Google Business/SEO). */
export function GlobalLocalBusinessSchema() {
  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessJsonLd()) }}
      />
    </Helmet>
  );
}

