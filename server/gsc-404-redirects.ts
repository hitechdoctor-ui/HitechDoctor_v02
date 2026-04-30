/**
 * Αντιστοιχίσεις 301 από Google Search Console (ευρετήριο > σελίδες με σφάλμα 404 > εξαγωγή).
 *
 * Πώς να το γεμίσετε:
 * 1) Εξαγωγή CSV από το GSC και τρέξτε:
 *    npx tsx script/parse-gsc-404-csv.ts /path/to/Export.csv
 *    Αντιγράψτε το output στο αντικείμενο παρακάτω και διορθώστε κάθε στόχο (δεν είναι "// TODO").
 * 2) Ή προσθέστε χειροκίνητα: μόνο pathname, πεζά, χωρίς domain (όπως το normalizes το redirect middleware).
 *
 * Οι εγγραφές εδώ **υπερισχύουν** των υπόλοιπων στο EXACT_REDIRECTS (εφαρμόζονται τελευταίες).
 */
export const GSC_404_EXACT_REDIRECTS: Record<string, string> = {
  // Παράδειγμα (διαγράψτε αν δεν χρειάζεται):
  // "/pages/old-promo": "/eshop",
  // "/product/palio-sku": "/eshop",
};
