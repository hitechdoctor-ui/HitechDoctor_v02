import { BUSINESS_COUNTRY_CODE, BUSINESS_SITE_URL_WWW } from "@/lib/business-info";

const env = import.meta.env;

/**
 * Τυπική χρέωση αποστολής (EUR) για structured data — ρύθμιση: VITE_MERCHANT_SHIPPING_RATE_EUR.
 * Κρατήστε την ευθυγραμμισμένη με την πραγματική τιμολόγηση μεταφορών στο checkout.
 */
const merchantShippingRateEur = String(
  (env.VITE_MERCHANT_SHIPPING_RATE_EUR as string | undefined)?.trim() || "5.00"
);

/** @see https://schema.org/OfferShippingDetails — απαιτείται από Google Merchant / Product rich results */
export function buildOfferShippingDetails(): Record<string, unknown> {
  return {
    "@type": "OfferShippingDetails",
    shippingRate: {
      "@type": "MonetaryAmount",
      value: merchantShippingRateEur,
      currency: "EUR",
    },
    shippingDestination: {
      "@type": "DefinedRegion",
      addressCountry: BUSINESS_COUNTRY_CODE,
    },
    deliveryTime: {
      "@type": "ShippingDeliveryTime",
      handlingTime: {
        "@type": "QuantitativeValue",
        minValue: 0,
        maxValue: 1,
        unitCode: "DAY",
      },
      transitTime: {
        "@type": "QuantitativeValue",
        minValue: 1,
        maxValue: 2,
        unitCode: "DAY",
      },
    },
  };
}

/**
 * Συμβατό με πολιτική επιστροφών eShop (14 ημέρες, έξοδα επιστροφής πελάτη όπου ισχύει).
 * @see https://schema.org/MerchantReturnPolicy
 */
export function buildMerchantReturnPolicy(): Record<string, unknown> {
  return {
    "@type": "MerchantReturnPolicy",
    "@id": `${BUSINESS_SITE_URL_WWW}/politiki-epistrofon#merchant-return-policy`,
    applicableCountry: BUSINESS_COUNTRY_CODE,
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 14,
    returnMethod: "https://schema.org/ReturnByMail",
    returnFees: "https://schema.org/ReturnShippingFees",
    url: `${BUSINESS_SITE_URL_WWW}/politiki-epistrofon`,
  };
}
