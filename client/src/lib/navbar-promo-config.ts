/**
 * Promo bar κάτω από το navbar — εύκολη αλλαγή προϊόντος χωρίς deploy κώδικα.
 * featuredSlug: slug προϊόντος από admin/eShop. Κενό = πρώτο διαθέσιμο laptop.
 */
export const NAVBAR_PROMO_CONFIG = {
  featuredSlug: "lenovo-thinkpad-l540-i5-4300m-grade-b-240ssd",
  badge: "Μεταχειρισμένο Laptop",
  headline: "ThinkPad L540 · i5 · SSD · GRADE B",
  ctaLabel: "Δείτε προσφορά",
  fallbackHref: "/eshop?tab=laptop",
  /** Εμφανίζεται άμεσα αν το API δεν έχει ακόμα το προϊόν (π.χ. πριν το seed). */
  staticFallback: {
    name: "Lenovo Thinkpad L540 Intel i5-4300M GRADE B",
    description: "240GB SSD · 8GB RAM · 1 χρόνο εγγύηση",
    price: "250",
    imageUrl: "/images/laptops/lenovo-thinkpad-l540.jpg",
    href: "/eshop?tab=laptop",
  },
} as const;
