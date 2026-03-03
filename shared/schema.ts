import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  imageUrl: text("image_url"),
  images: text("images").array(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  slug: text("slug"),
  compatibleModels: text("compatible_models").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount").notNull(),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertRepairRequestSchema = createInsertSchema(repairRequests).omit({ id: true, createdAt: true }).extend({
  email: z.string().email("Μη έγκυρο email"),
  phone: z.string().min(10, "Εισάγετε έγκυρο αριθμό τηλεφώνου"),
  firstName: z.string().min(2, "Εισάγετε το όνομά σας"),
  lastName: z.string().min(2, "Εισάγετε το επίθετό σας"),
  deviceName: z.string().min(2, "Εισάγετε το όνομα της συσκευής"),
  serialNumber: z.string().min(3, "Εισάγετε τον αριθμό σειράς"),
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

// Order payload for checkout
export const checkoutPayloadSchema = z.object({
  customer: insertCustomerSchema,
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number(),
  }))
});

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;
