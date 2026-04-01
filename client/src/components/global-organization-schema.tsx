import { Helmet } from "react-helmet-async";
import { buildOrganizationJsonLd } from "@/lib/business-info";

/** Organization JSON-LD σε όλες τις δημόσιες σελίδες — ταίριασμα με στοιχεία footer / επικοινωνίας */
export function GlobalOrganizationSchema() {
  return (
    <Helmet>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />
    </Helmet>
  );
}
