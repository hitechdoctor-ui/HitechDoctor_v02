import { pgTable, text, integer, timestamp, numeric, boolean, uniqueIndex } from "drizzle-orm/pg-core";
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
  priceShopflix: numeric("price_shopflix"),
  lastPriceUpdate: timestamp("last_price_update"),
  /** Χειροκίνητα URLs όταν το αυτόματο fetch αποτυγχάνει */
  urlKotsovolos: text("url_kotsovolos"),
  urlSkroutz: text("url_skroutz"),
  urlBestPrice: text("url_bestprice"),
  urlShopflix: text("url_shopflix"),
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

// --- Schemas & Types ---
/** Cast: drizzle-zod `createInsertSchema().omit({ …: true })` προκαλεί TS2322 (boolean → never) σε ορισμένες εκδόσεις. */
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true }) as z.ZodTypeAny;
export const insertRepairItemSchema = createInsertSchema(repairItems).omit({ id: true, createdAt: true }) as z.ZodTypeAny;
export const insertRepairRequestSchema = createInsertSchema(repairRequests)
  .omit({ id: true, createdAt: true, assignedToUserId: true }) as z.ZodTypeAny;
/** JSON requests send ISO date strings; drizzle-zod expects Date objects — coerce so POST /api/subscriptions validates. */
export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({ id: true, createdAt: true })
  .extend({
    startDate: z.coerce.date(),
    renewalDate: z.coerce.date(),
  }) as z.ZodTypeAny;
export const insertWebsiteInquirySchema = createInsertSchema(websiteInquiries).omit({ id: true, createdAt: true }) as z.ZodTypeAny;

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
export type IpswDownloadEvent = typeof ipswDownloadEvents.$inferSelect;

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