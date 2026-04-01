import { pgTable, text, integer, timestamp, numeric, boolean, uniqueIndex, index } from "drizzle-orm/pg-core";
import type { InferInsertModel } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Products ---
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  fullDescription: text("full_description"),
  price: numeric("price").notNull(),
  imageUrl: text("image_url"),
  images: text("images").array(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  slug: text("slug"),
  compatibleModels: text("compatible_models").array(),
  brand: text("brand"),
  /** RAM (π.χ. 8GB) — για σύνθεση query σύγκρισης τιμών */
  ram: text("ram"),
  color: text("color"),
  storage: text("storage"),
  /** Τιμές ανταγωνιστών (EUR) — ενημέρωση από script ή χειροκίνητα */
  priceKotsovolos: numeric("price_kotsovolos"),
  priceSkroutz: numeric("price_skroutz"),
  priceBestPrice: numeric("price_bestprice"),
  lastPriceUpdate: timestamp("last_price_update"),
  /** Χειροκίνητα URLs όταν το αυτόματο fetch αποτυγχάνει */
  urlKotsovolos: text("url_kotsovolos"),
  urlSkroutz: text("url_skroutz"),
  urlBestPrice: text("url_bestprice"),
  /** Αν true, η τιμή στο αντίστοιχο price* είναι χειροκίνητη — το refresh δεν κάνει scraping για αυτό το κατάστημα */
  manualKotsovolos: boolean("manual_kotsovolos").default(false),
  manualSkroutz: boolean("manual_skroutz").default(false),
  manualBestPrice: boolean("manual_bestprice").default(false),
  preOrder: boolean("pre_order").default(false),
  variantGroup: text("variant_group"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Customers ---
export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  /** Viber unique user id (από webhook όταν ο πελάτης μηνύμα στο bot) — για ειδοποιήσεις κατάστασης */
  viberUserId: text("viber_user_id"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [uniqueIndex("customers_email_idx").on(t.email)]);

// --- Orders ---
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerId: integer("customer_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount").notNull(),
  paymentMethod: text("payment_method").default("cod"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time").notNull(),
});

// --- Repair Requests (CRM) ---
export const repairRequests = pgTable("repair_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  deviceName: text("device_name").notNull(),
  serialNumber: text("serial_number").notNull(),
  deviceCode: text("device_code"),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  /** Προαιρετικό Viber user id για αυτό το αίτημα (ή συμπλήρωση από διαχειριστή / bot REPR#) */
  viberUserId: text("viber_user_id"),
  price: numeric("price"),
  priceIncludesVat: boolean("price_includes_vat").default(false),
  /** Διαχειριστής / προσωπικό στο οποίο έχει ανατεθεί το αίτημα (ρόλος staff βλέπει μόνο τα δικά του). */
  assignedToUserId: integer("assigned_to_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const repairItems = pgTable("repair_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  repairRequestId: integer("repair_request_id").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Subscriptions ---
export const subscriptions = pgTable("subscriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(),
  startDate: timestamp("start_date").notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  price: numeric("price").notNull(),
  status: text("status").notNull().default("active"),
  antivirusName: text("antivirus_name"),
  notes: text("notes"),
  notifiedMonthBefore: boolean("notified_month_before").default(false),
  notifiedTenDaysBefore: boolean("notified_ten_days_before").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Admin Users ---
export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [uniqueIndex("admin_users_email_idx").on(t.email)]);

// --- Site analytics (SPA page views, admin overview) ---
export const siteAnalytics = pgTable(
  "site_analytics",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionId: text("session_id").notNull(),
    pagePath: text("page_path").notNull(),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    /** Κανονικοποιημένο OS: iOS, Android, Windows, macOS, Linux, Άλλο, … */
    osFamily: text("os_family"),
    /** Κανονικοποιημένος browser: Chrome, Safari, Firefox, Edge, … */
    browserFamily: text("browser_family"),
    /** Πόλη από ipapi.co (ή παρόμοιο) βάσει IP */
    geoCity: text("geo_city"),
    /** Περιοχή / νομός (region) από geolocation API */
    geoRegion: text("geo_region"),
    visitedAt: timestamp("visited_at").defaultNow(),
  },
  (t) => [
    index("site_analytics_visited_at_idx").on(t.visitedAt),
    index("site_analytics_page_path_idx").on(t.pagePath),
    index("site_analytics_session_id_idx").on(t.sessionId),
    index("site_analytics_os_family_idx").on(t.osFamily),
    index("site_analytics_geo_city_idx").on(t.geoCity),
  ]
);

/** Ερωτήσεις χρηστών στον AI βοηθό επισκευών — για στατιστικά admin. */
export const chatActivity = pgTable(
  "chat_activity",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    sessionId: text("session_id").notNull(),
    message: text("message").notNull(),
    askedAt: timestamp("asked_at").defaultNow(),
  },
  (t) => [index("chat_activity_asked_at_idx").on(t.askedAt)]
);

// --- IPSW download tracking (public tool page) ---
export const ipswDownloadEvents = pgTable("ipsw_download_events", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  deviceIdentifier: text("device_identifier").notNull(),
  deviceName: text("device_name"),
  version: text("version").notNull(),
  buildId: text("build_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Website Inquiries ---
export const websiteInquiries = pgTable("website_inquiries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  prepayment: numeric("prepayment"),
  prepaymentIncludesVat: boolean("prepayment_includes_vat").default(true),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Αποστολή συσκευής — BoxNow locker + κωδικός αναφοράς HiTech */
export const boxnowDropoffRequests = pgTable("boxnow_dropoff_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  referenceCode: text("reference_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  deviceNote: text("device_note"),
  lockerId: text("locker_id").notNull(),
  lockerAddress: text("locker_address").notNull(),
  lockerPostalCode: text("locker_postal_code"),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Προμηθευτές — XML feed για συγχρονισμό κόστους / τιμών επισκευών */
export const suppliers = pgTable("suppliers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  xmlUrl: text("xml_url").notNull(),
  /** Εργασία (€) που προστίθεται στο κόστος αγοράς πριν το ΦΠΑ */
  workFee: numeric("work_fee").notNull().default("60"),
  /** ΦΠΑ % (π.χ. 24) */
  vatRate: numeric("vat_rate").notNull().default("24"),
  lastSync: timestamp("last_sync"),
  createdAt: timestamp("created_at").defaultNow(),
});

/** Γραμμές τελευταίου συγχρονισμού ανά προμηθευτή (SKU, κόστος, τελική τιμή) */
export const supplierSyncItems = pgTable(
  "supplier_sync_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    supplierId: integer("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    externalSku: text("external_sku").notNull(),
    title: text("title"),
    purchaseCost: numeric("purchase_cost").notNull(),
    sellingPrice: numeric("selling_price").notNull(),
    syncedAt: timestamp("synced_at").defaultNow(),
  },
  (t) => [uniqueIndex("supplier_sync_supplier_sku_idx").on(t.supplierId, t.externalSku), index("supplier_sync_supplier_idx").on(t.supplierId)]
);

/**
 * Επισκευές: τελικές τιμές με ΦΠΑ (ενημερώνονται από sync όταν το external_sku ταιριάζει με το XML).
 * Το frontend μπορεί να διαβάζει αυτά τα δεδομένα μέσω API για εμφάνιση τιμών.
 */
export const repairPriceOverrides = pgTable(
  "repair_price_overrides",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    brand: text("brand").notNull(),
    modelSlug: text("model_slug").notNull(),
    /** π.χ. screen_oem, battery, port */
    serviceKey: text("service_key").notNull().default("screen_oem"),
    /** SKU από XML προμηθευτή — αν ταιριάζει, το sync ενημερώνει το price */
    externalSku: text("external_sku"),
    price: numeric("price").notNull(),
    purchaseCost: numeric("purchase_cost"),
    supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    uniqueIndex("repair_price_brand_slug_service_idx").on(t.brand, t.modelSlug, t.serviceKey),
    uniqueIndex("repair_price_external_sku_unique").on(t.externalSku),
  ]
);

/** eShop: «Θέλω καλύτερη προσφορά» — όνομα + κινητό, snapshot ονόματος προϊόντος */
export const productOfferInterests = pgTable("product_offer_interests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  /** Για σύνδεσμο στο admin προς `/eshop/:slug` */
  productSlug: text("product_slug"),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  /** Πρόσθετη περιγραφή / σημειώσεις πελάτη */
  notes: text("notes"),
  /** Τύπος αιτήματος: better_price | bundle | bulk */
  offerType: text("offer_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- Schemas & Types ---
/** Cast: drizzle-zod `createInsertSchema().omit({ …: true })` προκαλεί TS2322 (boolean → never) σε ορισμένες εκδόσεις. */
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true }) as z.ZodTypeAny;
export const insertRepairItemSchema = createInsertSchema(repairItems).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertRepairRequestSchema = createInsertSchema(repairRequests)
  .omit({ id: true, createdAt: true, assignedToUserId: true, viberUserId: true }) as z.ZodTypeAny;
/** JSON requests send ISO date strings; drizzle-zod expects Date objects — coerce so POST /api/subscriptions validates. */
export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({ id: true, createdAt: true })
  .extend({
    startDate: z.coerce.date(),
    renewalDate: z.coerce.date(),
  }) as z.ZodTypeAny;
export const insertWebsiteInquirySchema = createInsertSchema(websiteInquiries).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertProductOfferInterestSchema = createInsertSchema(productOfferInterests).omit({ id: true, createdAt: true }) as z.ZodTypeAny;

/** Δημόσιο POST — id προϊόντος + στοιχεία πελάτη + προαιρετικές σημειώσεις. */
export const productOfferInterestPublicSchema = z.object({
  productId: z.number().int().positive(),
  customerName: z.string().min(1, "Συμπληρώστε το όνομά σας").max(200),
  phone: z.string().min(10, "Μη έγκυρο κινητό").max(32),
  notes: z.string().max(1000).optional(),
  offerType: z.enum(["better_price", "bundle", "bulk"]).optional(),
});

/** Δημόσιο POST — αποστολή συσκευής μέσω BoxNow (στοιχεία + επιλεγμένο locker) */
export const boxnowDropoffPublicSchema = z.object({
  customerName: z.string().min(2, "Συμπληρώστε το όνομά σας").max(200),
  phone: z.string().min(10, "Μη έγκυρο τηλέφωνο").max(32),
  email: z.union([z.string().email("Μη έγκυρο email"), z.literal("")]).optional(),
  deviceNote: z.string().max(2000).optional(),
  lockerId: z.string().min(1, "Επιλέξτε locker από τον χάρτη"),
  lockerAddress: z.string().min(1),
  lockerPostalCode: z.string().max(32).optional(),
});

export type Product = typeof products.$inferSelect;
/** Insert type από το Drizzle — αποφεύγει προβλήματα z.infer στο createInsertSchema (boolean → never). */
export type InsertProduct = InferInsertModel<typeof products>;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type RepairRequest = typeof repairRequests.$inferSelect;
export type RepairItem = typeof repairItems.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type WebsiteInquiry = typeof websiteInquiries.$inferSelect;
export type ProductOfferInterest = typeof productOfferInterests.$inferSelect;
export type InsertProductOfferInterest = InferInsertModel<typeof productOfferInterests>;
export type Supplier = typeof suppliers.$inferSelect;
export type SupplierSyncItem = typeof supplierSyncItems.$inferSelect;
export type RepairPriceOverride = typeof repairPriceOverrides.$inferSelect;
export type InsertSupplier = InferInsertModel<typeof suppliers>;
export type InsertRepairPriceOverride = InferInsertModel<typeof repairPriceOverrides>;

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true, createdAt: true, lastSync: true }) as z.ZodTypeAny;
export const insertRepairPriceOverrideSchema = createInsertSchema(repairPriceOverrides).omit({ id: true, updatedAt: true }) as z.ZodTypeAny;
export type BoxnowDropoffRequest = typeof boxnowDropoffRequests.$inferSelect;
export type InsertBoxnowDropoffRequest = InferInsertModel<typeof boxnowDropoffRequests>;
export type IpswDownloadEvent = typeof ipswDownloadEvents.$inferSelect;
export type SiteAnalyticsRow = typeof siteAnalytics.$inferSelect;
export type ChatActivityRow = typeof chatActivity.$inferSelect;

// Προσθήκη του Schema για το Checkout
export const checkoutPayloadSchema = z.object({
  customer: insertCustomerSchema,
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
  })),
  paymentMethod: z.enum(["cod", "bank", "card", "store"]).default("cod"),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;