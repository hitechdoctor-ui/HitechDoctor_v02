# Inline Φόρμα Αιτημάτων Ιστοσελίδων

## What & Why
Προσθήκη ενσωματωμένης (inline) φόρμας με τίτλο "Αιτήματα κατασκευής Ιστοσελίδων" απευθείας στη σελίδα `/web-designer`, ώστε οι επισκέπτες να μπορούν να συμπληρώσουν αίτημα χωρίς να χρειάζεται να ανοίξουν modal.

## Done looks like
- Υπάρχει νέα ενότητα στη σελίδα web-designer με τίτλο "Αιτήματα κατασκευής Ιστοσελίδων"
- Η φόρμα περιέχει τα πεδία: Όνομα, Επίθετο, Τηλέφωνο, Email, Περιγραφή Project
- Μετά την υποβολή εμφανίζεται μήνυμα επιτυχίας
- Τα δεδομένα αποστέλλονται στο ίδιο endpoint (`POST /api/website-inquiries`) που χρησιμοποιεί και το υπάρχον modal
- Η ενότητα ταιριάζει οπτικά με το υπόλοιπο στυλ της σελίδας (gold/amber theme)

## Out of scope
- Τροποποίηση ή αφαίρεση του υπάρχοντος WebsiteInquiryModal
- Αλλαγές στο backend ή στο schema της βάσης δεδομένων
- Πεδίο Προκαταβολής (αυτό παραμένει μόνο στο admin modal)

## Tasks
1. **Inline φόρμα στη σελίδα web-designer** — Προσθήκη νέας ενότητας με inline φόρμα αιτημάτων στο τέλος της σελίδας (πριν το final CTA), χρησιμοποιώντας τα ίδια πεδία και το ίδιο API endpoint με το υπάρχον modal, με success state μετά την υποβολή.

## Relevant files
- `client/src/pages/web-designer.tsx`
- `client/src/components/website-inquiry-modal.tsx`
- `shared/schema.ts`
