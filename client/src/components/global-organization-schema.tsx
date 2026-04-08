import { Helmet } from "react-helmet-async";
import { buildLocalBusinessJsonLd } from "@/lib/business-info";

/** Back-compat: merged Business JSON-LD is injected elsewhere. */
export function GlobalOrganizationSchema() {
  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildLocalBusinessJsonLd()) }}
      />
    </Helmet>
  );
}
