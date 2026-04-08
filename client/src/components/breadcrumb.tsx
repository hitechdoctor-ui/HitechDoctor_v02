import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Fragment } from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ label: "Αρχική", href: "/" }, ...items];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.label,
      "item": `https://www.hitechdoctor.com${item.href ?? ""}`,
    })),
  };

  return (
    <Fragment>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap ${className}`}
      >
        {allItems.map((item, i) => (
          <Fragment key={i}>
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" aria-hidden />}
            {i === 0 && <Home className="w-3 h-3 shrink-0" aria-hidden />}
            {item.href && i < allItems.length - 1 ? (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={i === allItems.length - 1 ? "text-foreground font-medium" : ""}>
                {item.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
    </Fragment>
  );
}
