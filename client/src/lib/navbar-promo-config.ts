/**
 * Promo bar κάτω από το navbar — εύκολη αλλαγή προϊόντος χωρίς deploy κώδικα.
 * featuredSlug: slug προϊόντος από admin/eShop. Κενό = πρώτο διαθέσιμο laptop.
 */
export const NAVBAR_PROMO_CONFIG = {
  featuredSlug: "dynabook-satellite-pro-c50d-b-ryzen5-grade-b",
  badge: "Μεταχειρισμένο Laptop",
  headline: "Dynabook Satellite Pro · Ryzen 5 · πληκτρολόγιο GR",
  ctaLabel: "Δείτε προσφορά",
  fallbackHref: "/eshop?tab=laptop",
  /** Εμφανίζεται άμεσα αν το API δεν έχει ακόμα το προϊόν (π.χ. πριν το seed). */
  staticFallback: {
    name: "Dynabook Satellite Pro C50D-B Ryzen 5 GRADE B",
    description: "SSD · 8GB DDR4 · πληκτρολόγιο GR/EN · 1 χρόνο εγγύηση",
    price: "250",
    imageUrl: "/images/laptops/dynabook-satellite-pro-c50d-b-ryzen5.jpg",
    href: "/eshop/dynabook-satellite-pro-c50d-b-ryzen5-grade-b",
  },
} as const;
