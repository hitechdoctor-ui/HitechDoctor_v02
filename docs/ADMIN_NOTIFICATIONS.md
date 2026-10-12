# Admin Notifications & Dashboard Improvements

## Ενημερώσεις στο Admin Dashboard (12 Οκτ 2026)

### 🔔 **1. Ειδοποιήσεις για Προσφορές eShop**

Όταν ένας πελάτης συμπληρώνει τη φόρμα **"Θέλω καλύτερη προσφορά"** στο eShop:

#### ✅ Email Notification
- Στέλνεται αυτόματα email στο `info@hitechdoctor.com`
- Περιλαμβάνει: Όνομα, Τηλέφωνο, Προϊόν, Ημερομηνία

#### ✅ Viber Notification (Νέο!)
- Στέλνεται Viber μήνυμα στον admin (αν έχει ρυθμιστεί)
- **Ρύθμιση**: Προσθέστε στο `.env` ή Railway:
  ```bash
  ADMIN_VIBER_USER_ID=your_viber_user_id
  ```
- Για να βρείτε το Viber User ID σας:
  1. Στείλτε μήνυμα στο bot από το Viber σας
  2. Δείτε τα logs του server για το `viberUserId`

#### ✅ Browser Notifications (Νέο!)
- Όταν το admin dashboard είναι ανοιχτό, βλέπεις **πραγματικό χρόνο** notifications
- Λειτουργίες:
  - 🔔 **Desktop Notifications**: Εμφανίζονται στο λειτουργικό σύστημα
  - 🔊 **Ήχος**: Παίζει ήχος ειδοποίησης (μπορεί να απενεργοποιηθεί)
  - ⏱️ **Polling**: Ελέγχει κάθε 15 δευτερόλεπτα για νέα μηνύματα
- **Ενεργοποίηση**: Κλικ στο κουμπί 🔔 κάτω δεξιά στο dashboard

---

### 📊 **2. Αναδιοργάνωση Dashboard**

Η νέα διάταξη προτεραιοποιεί τα **μηνύματα πελατών**:

#### Σειρά εμφάνισης (από πάνω προς τα κάτω):
1. ✅ **Stats Cards** (Έσοδα, Παραγγελίες, Προϊόντα, Πελάτες, Επισκευές)
2. 🔥 **Πελάτες eShop — Καλύτερη Προσφορά** (πρώτα!)
3. 🔧 **Αιτήματα Επισκευής**
4. 📈 **Analytics Dashboard**
5. 📦 **eShop Product Search**

Πλέον τα μηνύματα από το eShop είναι **πρώτα και πιο ορατά**.

---

### 👤 **3. Βελτιωμένη Καρτέλα Πελάτη**

Νέο, **standard CRM-style design** με:

#### Πληροφορίες Πελάτη:
- 📧 Email (clickable για άμεση αποστολή)
- 📞 Τηλέφωνο (clickable για κλήση)
- 📍 Διεύθυνση
- 💬 Viber User ID (αν υπάρχει)

#### Στατιστικά Dashboard:
- 🛒 Παραγγελίες eShop + Συνολικό ποσό
- 🔧 Αιτήματα επισκευής + εκκρεμότητες
- 🏷️ Εκδηλώσεις ενδιαφέροντος (προσφορές)
- 📅 Μέλος από (ημερομηνία εγγραφής)

#### Activity Feed:
1. **Παραγγελίες eShop**: Πλήρης λίστα με status badges
2. **Αιτήματα Επισκευής**: Συσκευή + status + ημερομηνία
3. **Εκδηλώσεις Ενδιαφέροντος**: Όλες οι φορές που ζήτησε προσφορά

#### Navigation:
- Direct links σε παραγγελίες και προϊόντα
- Clean, modern UI με cards και tables
- Responsive για κινητά

**URL**: `/admin/customers/[id]`

---

### 🔧 **Τεχνικές Λεπτομέρειες**

#### Νέα API Endpoints:
```
GET /api/admin/customers/:id              # Πληροφορίες πελάτη
GET /api/admin/customers/:id/orders       # Παραγγελίες πελάτη
GET /api/admin/customers/:id/repairs      # Επισκευές πελάτη
```

#### Notification Monitor Component:
- Path: `client/src/components/admin/notification-monitor.tsx`
- Features:
  - Browser Notifications API
  - Real-time polling (15s interval)
  - Audio alerts (toggleable)
  - Persistent sound preference (localStorage)
  - Auto-dismiss after 10 seconds

#### Dashboard Changes:
- Reordered sections for better UX
- Added `NotificationMonitor` component
- Enhanced cards with better visual hierarchy

---

### 📝 **Οδηγίες Χρήσης**

#### Για Admin:

1. **Ενεργοποίηση Browser Notifications:**
   - Άνοιξε το dashboard: `/admin/dashboard`
   - Κλικ στο 🔔 κάτω δεξιά
   - Επίτρεψε notifications στο browser popup
   - Το εικονίδιο θα γίνει πράσινο ✅

2. **Ενεργοποίηση Viber Notifications:**
   - Πρόσθεσε `ADMIN_VIBER_USER_ID` στο `.env` ή Railway
   - Restart το server
   - Κάθε νέα προσφορά θα στέλνει Viber

3. **Προβολή Καρτέλας Πελάτη:**
   - Πήγαινε στο `/admin/customers`
   - Κλικ στο κουμπί "Καρτέλα" δίπλα στο πελάτη
   - Δες όλο το ιστορικό του (παραγγελίες, επισκευές, προσφορές)

---

### ✅ **Checklist Ολοκλήρωσης**

- [x] Email notifications για προσφορές
- [x] Viber notifications για προσφορές
- [x] Browser notifications (real-time)
- [x] Αναδιοργάνωση dashboard (μηνύματα πρώτα)
- [x] Νέα καρτέλα πελάτη (modern CRM UI)
- [x] API endpoints για customer detail
- [x] Polling system για νέα μηνύματα
- [x] Audio alerts με toggle
- [x] Persistent sound preferences
- [x] Documentation

---

### 🚀 **Επόμενα Βήματα**

1. Deploy στο Railway
2. Test browser notifications σε production
3. Προσθήκη `ADMIN_VIBER_USER_ID` στο Railway env
4. Monitor logs για επιβεβαίωση λειτουργίας

---

### 🐛 **Troubleshooting**

**Browser notifications δεν δουλεύουν:**
- Έλεγξε αν το site είναι σε HTTPS
- Έλεγξε browser permissions: `Settings > Privacy > Notifications`
- Δοκίμασε διαφορετικό browser

**Viber notifications δεν έρχονται:**
- Βεβαιώσου ότι το `ADMIN_VIBER_USER_ID` είναι σωστό
- Έλεγξε τα server logs για errors
- Στείλε test μήνυμα στο bot για verification

**Δεν φαίνονται προσφορές στο dashboard:**
- Refresh τη σελίδα
- Έλεγξε αν έχεις Super Admin δικαιώματα
- Δες το `/admin/product-offer-interests` για full list
