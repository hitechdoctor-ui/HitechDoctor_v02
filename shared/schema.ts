import { pgTable, text, serial, integer, timestamp, numeric, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
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
  color: text("color"),
  storage: text("storage"),
  preOrder: boolean("pre_order").default(false),
  variantGroup: text("variant_group"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => [uniqueIndex("customers_email_idx").on(t.email)]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount").notNull(),
  paymentMethod: text("payment_method").default("cod"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: numeric("price_at_time").notNull(),
});

// ── Repair Requests (CRM) ────────────────────────────────────────────────────
export const repairRequests = pgTable("repair_requests", {
  id: serial("id").primaryKey(),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Repair Items (cost breakdown per repair) ──────────────────────────────────
export const repairItems = pgTable("repair_items", {
  id: serial("id").primaryKey(),
  repairRequestId: integer("repair_request_id").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Subscriptions (Antivirus €55/yr, Website €150/yr) ────────────────────────
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  type: text("type").notNull(), // "antivirus" | "website"
  startDate: timestamp("start_date").notNull(),
  renewalDate: timestamp("renewal_date").notNull(),
  price: numeric("price").notNull(),
  status: text("status").notNull().default("active"), // "active" | "expired" | "cancelled"
  antivirusName: text("antivirus_name"),
  notes: text("notes"),
  notifiedMonthBefore: boolean("notified_month_before").default(false),
  notifiedTenDaysBefore: boolean("notified_ten_days_before").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Website Inquiries (leads from web-designer page) ─────────────────────────
export const websiteInquiries = pgTable("website_inquiries", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  prepayment: numeric("prepayment"),
  prepaymentIncludesVat: boolean("prepayment_includes_vat").default(true),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // "pending" | "contacted" | "won" | "lost"
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertRepairItemSchema = createInsertSchema(repairItems).omit({ id: true, createdAt: true });

export const insertRepairRequestSchema = createInsertSchema(repairRequests).omit({ id: true, createdAt: true }).extend({
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().min(10, "Εισάγετε έγκυρο αριθμό τηλεφώνου"),
  firstName: z.string().min(2, "Εισάγετε το όνομά σας"),
  lastName: z.string().min(2, "Εισάγετε το επίθετό σας"),
  deviceName: z.string().min(2, "Εισάγετε το όνομα της συσκευής"),
  serialNumber: z.string().min(3, "Εισάγετε τον αριθμό σειράς"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, notifiedMonthBefore: true, notifiedTenDaysBefore: true }).extend({
  email: z.string().email("Μη έγκυρο email"),
  customerName: z.string().min(2, "Εισάγετε το όνομα πελάτη"),
  type: z.enum(["antivirus", "website"]),
  startDate: z.coerce.date(),
  renewalDate: z.coerce.date(),
  price: z.string(),
});

export const insertWebsiteInquirySchema = createInsertSchema(websiteInquiries).omit({ id: true, createdAt: true }).extend({
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().min(10, "Εισάγετε έγκυρο αριθμό τηλεφώνου"),
  firstName: z.string().min(2, "Εισάγετε το όνομά σας"),
  lastName: z.string().min(2, "Εισάγετε το επίθετό σας"),
});

// Type definitions
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type RepairRequest = typeof repairRequests.$inferSelect;
export type InsertRepairRequest = z.infer<typeof insertRepairRequestSchema>;

export type RepairItem = typeof repairItems.$inferSelect;
export type InsertRepairItem = z.infer<typeof insertRepairItemSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type WebsiteInquiry = typeof websiteInquiries.$inferSelect;
export type InsertWebsiteInquiry = z.infer<typeof insertWebsiteInquirySchema>;

// Order payload for checkout
export const checkoutPayloadSchema = z.object({
  customer: insertCustomerSchema,
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
  })),
  paymentMethod: z.enum(["cod", "bank", "card", "store"]).default("cod"),
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
