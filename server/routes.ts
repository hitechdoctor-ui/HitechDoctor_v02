import type { Express, Request } from "express";
import type { Server } from "http";
import { mkdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import multer from "multer";
import { storage } from "./storage";
import { runFixmobilePdfSyncFromDisk, FIXMOBILE_UPLOAD_DIR, FIXMOBILE_PDF } from "./fixmobile-sync";
import type { AdminUser, RepairRequest } from "@shared/schema";
import { api, errorSchemas } from "@shared/routes";
import {
  insertRepairRequestSchema,
  insertRepairItemSchema,
  insertSubscriptionSchema,
  insertWebsiteInquirySchema,
  checkoutPayloadSchema,
  productOfferInterestPublicSchema,
  boxnowDropoffPublicSchema,
  insertSupplierSchema,
  insertRepairPriceOverrideSchema,
} from "@shared/schema";
import { z } from "zod";
import {
  sendRepairConfirmationEmail,
  sendWebsiteInquiryEmail,
  sendWebsiteInquiryClientEmail,
  sendProductOfferInterestEmail,
  sendBoxnowDropoffEmail,
  sendRepairChatLeadEmail,
} from "./email";
import { runImeiLookup } from "./imei-lookup";
import { fetchHubSpotContacts } from "./hubspot";
import bcrypt from "bcrypt";
import { sendOrderStatusEmail } from "./nodemailer-mail";
import { resolveCheckStatus } from "./check-status";
import { refreshCompetitorPrices } from "./price-compare";
import { APIError } from "openai";
import { getRepairCatalogPromptBlock, runRepairAssistantChat } from "./chat-assistant";
import {
  compactAssistantDisplayText,
  splitAssistantReply,
  tryParseLeadFromText,
  guessDeviceModelFromMessages,
} from "@shared/repair-assistant";
import { runSupplierSyncJob, syncJobs, newSyncJobId } from "./supplier-sync";

const BCRYPT_ROUNDS = 12;

const fixmobileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 },
});

async function getAdminUserFromRequest(req: Request): Promise<AdminUser | null> {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64").toString("utf8");
    const payload = JSON.parse(decoded) as { email?: string };
    if (!payload?.email) return null;
    return (await storage.getAdminByEmail(payload.email)) ?? null;
  } catch {
    return null;
  }
}

function staffMayEditRepair(user: AdminUser, repair: Pick<RepairRequest, "assignedToUserId">): boolean {
  if (user.role !== "staff") return true;
  return repair.assignedToUserId != null && repair.assignedToUserId === user.id;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Δημόσιες τιμές επισκευής (από PDF sync / XML sync overrides) ---
  app.get("/api/repair-prices", async (_req, res) => {
    try {
      const overrides = await storage.getAllRepairPriceOverrides();
      res.json({ overrides });
    } catch (err) {
      console.error("[repair-prices]", err);
      res.status(500).json({ message: "Σφάλμα φόρτωσης τιμών" });
    }
  });

  // --- Admin Auth ---
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) return res.status(400).json({ ok: false, message: "Email και κωδικός απαιτούνται" });
      const user = await storage.getAdminByEmail(email);
      if (!user) return res.status(401).json({ ok: false, message: "Λάθος email ή κωδικός" });
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ ok: false, message: "Λάθος email ή κωδικός" });
      const payload = JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role, ts: Date.now() });
      const token = Buffer.from(payload).toString("base64");
      res.json({ ok: true, token, name: user.name, email: user.email, role: user.role });
    } catch (err) {
      console.error("[admin/login]", err);
      res.status(500).json({ ok: false, message: "Σφάλμα σύνδεσης" });
    }
  });

  app.get("/api/admin/me", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ ok: false });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ ok: false });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ ok: false });
      return res.json({ ok: true, id: user.id, email: user.email, name: user.name, role: user.role });
    } catch {
      res.status(401).json({ ok: false });
    }
  });

  // --- Admin Users CRUD ---
  app.get("/api/admin/users", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (!u) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      if (u.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const users = await storage.getAdminUsers();
      res.json(users);
    } catch { res.status(500).json({ message: "Σφάλμα" }); }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const actor = await getAdminUserFromRequest(req);
      if (!actor || actor.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8, "Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες"),
        role: z.enum(["admin", "superadmin", "staff"]).default("admin"),
      });
      const data = schema.parse(req.body);
      const existing = await storage.getAdminByEmail(data.email);
      if (existing) return res.status(409).json({ message: "Υπάρχει ήδη διαχειριστής με αυτό το email" });
      const hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
      const user = await storage.createAdminUser(data.name, data.email, hash, data.role);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    try {
      const actor = await getAdminUserFromRequest(req);
      if (!actor || actor.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id);
      const all = await storage.getAdminUsers();
      if (all.length <= 1) return res.status(400).json({ message: "Δεν μπορείτε να διαγράψετε τον τελευταίο διαχειριστή" });
      await storage.deleteAdminUser(id);
      res.json({ ok: true });
    } catch { res.status(500).json({ message: "Σφάλμα" }); }
  });

  app.patch("/api/admin/users/:id/password", async (req, res) => {
    try {
      const actor = await getAdminUserFromRequest(req);
      if (!actor || actor.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id);
      const schema = z.object({ password: z.string().min(8) });
      const { password } = schema.parse(req.body);
      const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      await storage.updateAdminPassword(id, hash);
      res.json({ ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  /** Λίστα αιτημάτων επισκευής για το admin: staff βλέπει μόνο ανατεθέντα σε αυτόν. */
  app.get("/api/admin/repair-requests", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (!u) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      if (u.role === "staff") {
        const list = await storage.getRepairRequestsForStaff(u.id);
        return res.json(list);
      }
      const requests = await storage.getRepairRequests();
      res.json(requests);
    } catch (error) {
      console.error("[admin/repair-requests]", error);
      res.status(500).json({ message: "Failed to fetch repair requests" });
    }
  });

  // --- Products API ---
  app.get("/api/products/categories", async (req, res) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get(api.products.list.path, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const subcategory = req.query.subcategory as string | undefined;
      const products = await storage.getProducts(category, subcategory);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get(api.products.get.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(id, input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(404).json({ message: "Product not found or update failed" });
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Product not found" });
    }
  });

  /** Χειροκίνητη ανανέωση τιμών ανταγωνιστών (Skroutz, Kotsovolos, κ.λπ.) για ένα προϊόν */
  app.post("/api/admin/products/:id/refresh-prices", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (!u) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const id = parseInt(req.params.id, 10);
      if (!Number.isFinite(id)) return res.status(400).json({ message: "Μη έγκυρο id" });
      const product = await storage.getProduct(id);
      if (!product) return res.status(404).json({ message: "Το προϊόν δεν βρέθηκε" });
      const result = await refreshCompetitorPrices(product);
      const updates: Record<string, unknown> = { lastPriceUpdate: result.lastPriceUpdate };
      if (result.priceKotsovolos != null) {
        updates.priceKotsovolos = result.priceKotsovolos;
        updates.manualKotsovolos = false;
      }
      if (result.priceSkroutz != null) {
        updates.priceSkroutz = result.priceSkroutz;
        updates.manualSkroutz = false;
      }
      if (result.priceBestPrice != null) {
        updates.priceBestPrice = result.priceBestPrice;
        updates.manualBestPrice = false;
      }
      const updated = await storage.updateProduct(id, updates as any);
      res.json({ product: updated, errors: result.errors });
    } catch (err) {
      console.error("[admin/refresh-prices]", err);
      res.status(500).json({ message: "Αποτυχία ανανέωσης τιμών" });
    }
  });

  // --- Customers API ---
  app.get(api.customers.list.path, async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (u?.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (u?.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (u?.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id);
      const orderList = await storage.getCustomerOrders(id);
      res.json(orderList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  });

  app.get("/api/customers/:id/subscriptions", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (u?.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      const subs = await storage.getCustomerSubscriptions(customer.email);
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer subscriptions" });
    }
  });

  app.get("/api/customers/:id/inquiries", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (u?.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      const inqs = await storage.getCustomerInquiries(customer.email);
      res.json(inqs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer inquiries" });
    }
  });

  // --- Orders & Checkout API ---
  app.get(api.orders.list.path, async (req, res) => {
    try {
      const ordersList = await storage.getOrders();
      res.json(ordersList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      console.error("Checkout error:", err);
      res.status(500).json({ message: "Failed to process checkout" });
    }
  });

  /** Χειροκίνητη παραγγελία από admin (ίδιο payload με checkout). */
  app.post("/api/admin/orders", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (!u || u.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const input = checkoutPayloadSchema.parse(req.body);
      if (!input.items?.length) {
        return res.status(400).json({ message: "Προσθέστε τουλάχιστον ένα προϊόν." });
      }
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("[admin/orders]", err);
      res.status(500).json({ message: "Αποτυχία δημιουργίας παραγγελίας" });
    }
  });

  app.post("/api/public/check-status", async (req, res) => {
    try {
      const body = z.object({
        ticketId: z.string().min(1, "Συμπληρώστε αριθμό ticket"),
        email: z.string().email("Μη έγκυρο email"),
      }).parse(req.body);
      const result = await resolveCheckStatus(storage, body.ticketId, body.email);
      if (!result.ok) return res.status(404).json(result);
      res.json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ ok: false, message: err.errors[0].message });
      }
      console.error("[check-status]", err);
      res.status(500).json({ ok: false, message: "Σφάλμα διακομιστή" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await storage.getOrderItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order items" });
    }
  });

  app.patch(api.orders.updateStatus.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.orders.updateStatus.input.parse(req.body);
      const before = await storage.getOrderWithCustomer(id);
      if (!before) return res.status(404).json({ message: "Order not found" });
      const order = await storage.updateOrderStatus(id, input.status);
      if (before.order.status !== order.status && before.customerEmail) {
        sendOrderStatusEmail({
          to: before.customerEmail,
          orderId: order.id,
          status: order.status,
        }).catch((e) => console.error("[order-status-email]", e));
      }
      res.json(order);
    } catch (err) {
      res.status(404).json({ message: "Order not found" });
    }
  });

  // --- Repair Requests API ---
  app.get("/api/repair-requests", async (req, res) => {
    try {
      const email = req.query.email as string | undefined;
      if (email) {
        const requests = await storage.getRepairRequestsByEmail(email);
        return res.json(requests);
      }
      const requests = await storage.getRepairRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repair requests" });
    }
  });

  app.post("/api/repair-requests", async (req, res) => {
    try {
      const input = insertRepairRequestSchema.parse(req.body);
      const request = await storage.createRepairRequest(input);
      res.status(201).json(request);
      sendRepairConfirmationEmail(request).catch((e) => console.error("[email] background send failed:", e));
      // Auto-upsert customer in CRM
      const fullName = `${input.firstName} ${input.lastName}`.trim();
      storage.upsertCustomerByEmail(fullName, input.email, input.phone).catch((e) =>
        console.error("[crm] repair upsert failed:", e)
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Failed to create repair request" });
    }
  });

  app.patch("/api/repair-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actor = await getAdminUserFromRequest(req);
      if (!actor) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const repair = await storage.getRepairRequestById(id);
      if (!repair) return res.status(404).json({ message: "Repair request not found" });
      if (!staffMayEditRepair(actor, repair)) return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const schema = z.object({
        status: z.string().optional(),
        price: z.string().nullable().optional(),
        priceIncludesVat: z.boolean().optional(),
        assignedToUserId: z.number().int().positive().nullable().optional(),
      });
      const data = schema.parse(req.body);
      if (data.price !== undefined && data.priceIncludesVat === undefined) {
        (data as typeof data & { priceIncludesVat?: boolean }).priceIncludesVat = false;
      }
      if (data.assignedToUserId !== undefined && actor.role === "staff") {
        return res.status(403).json({ message: "Δεν επιτρέπεται" });
      }
      const { assignedToUserId, ...rest } = data;
      const payload =
        assignedToUserId !== undefined
          ? { ...rest, assignedToUserId }
          : rest;
      const request = await storage.updateRepairRequest(id, payload);
      res.json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Repair request not found" });
    }
  });

  app.patch("/api/repair-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actor = await getAdminUserFromRequest(req);
      if (!actor) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const repair = await storage.getRepairRequestById(id);
      if (!repair) return res.status(404).json({ message: "Repair request not found" });
      if (!staffMayEditRepair(actor, repair)) return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const request = await storage.updateRepairRequestStatus(id, status);
      res.json(request);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Repair request not found" });
    }
  });

  // --- Repair Items API ---
  app.get("/api/repair-requests/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actor = await getAdminUserFromRequest(req);
      if (!actor) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const repair = await storage.getRepairRequestById(id);
      if (!repair) return res.status(404).json({ message: "Repair request not found" });
      if (!staffMayEditRepair(actor, repair)) return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const items = await storage.getRepairItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repair items" });
    }
  });

  app.post("/api/repair-requests/:id/items", async (req, res) => {
    try {
      const repairRequestId = parseInt(req.params.id);
      const actor = await getAdminUserFromRequest(req);
      if (!actor) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const repair = await storage.getRepairRequestById(repairRequestId);
      if (!repair) return res.status(404).json({ message: "Repair request not found" });
      if (!staffMayEditRepair(actor, repair)) return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const schema = z.object({
        description: z.string().min(1),
        amount: z.string(),
      });
      const { description, amount } = schema.parse(req.body);
      const item = await storage.createRepairItem({ repairRequestId, description, amount });
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create repair item" });
    }
  });

  app.put("/api/repair-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actor = await getAdminUserFromRequest(req);
      if (!actor) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const existing = await storage.getRepairItemById(id);
      if (!existing) return res.status(404).json({ message: "Repair item not found" });
      const repair = await storage.getRepairRequestById(existing.repairRequestId);
      if (!repair || !staffMayEditRepair(actor, repair)) return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const schema = z.object({
        description: z.string().min(1).optional(),
        amount: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const item = await storage.updateRepairItem(id, data);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Repair item not found" });
    }
  });

  app.delete("/api/repair-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const actor = await getAdminUserFromRequest(req);
      if (!actor) return res.status(401).json({ message: "Σύνδεση απαιτείται" });
      const existing = await storage.getRepairItemById(id);
      if (!existing) return res.status(404).json({ message: "Repair item not found" });
      const repair = await storage.getRepairRequestById(existing.repairRequestId);
      if (!repair || !staffMayEditRepair(actor, repair)) return res.status(403).json({ message: "Δεν επιτρέπεται" });
      await storage.deleteRepairItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Repair item not found" });
    }
  });

  app.get("/api/financial/repair-revenue", async (req, res) => {
    try {
      const u = await getAdminUserFromRequest(req);
      if (u?.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const rows = await storage.getCompletedRepairRevenueRows();
      res.json(rows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repair revenue" });
    }
  });

  // --- Subscriptions API ---
  app.get("/api/subscriptions", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const subs = await storage.getSubscriptions(type);
      res.json(subs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sub = await storage.getSubscription(id);
      if (!sub) return res.status(404).json({ message: "Subscription not found" });
      res.json(sub);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const input = insertSubscriptionSchema.parse(req.body);
      const sub = await storage.createSubscription(input);
      res.status(201).json(sub);
      // Auto-upsert customer in CRM
      storage.upsertCustomerByEmail(sub.customerName, sub.email, sub.phone).catch((e) =>
        console.error("[crm] subscription upsert failed:", e)
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.patch("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({
        customerName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        status: z.string().optional(),
        notes: z.string().optional(),
        antivirusName: z.string().optional(),
        renewalDate: z.coerce.date().optional(),
        notifiedMonthBefore: z.boolean().optional(),
        notifiedTenDaysBefore: z.boolean().optional(),
      });
      const data = schema.parse(req.body);
      const sub = await storage.updateSubscription(id, data);
      res.json(sub);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Subscription not found" });
    }
  });

  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSubscription(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Subscription not found" });
    }
  });

  // --- Website Inquiries API ---
  app.get("/api/website-inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getWebsiteInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch website inquiries" });
    }
  });

  app.post("/api/website-inquiries", async (req, res) => {
    try {
      const input = insertWebsiteInquirySchema.parse(req.body);
      const inquiry = await storage.createWebsiteInquiry(input);
      res.status(201).json(inquiry);
      sendWebsiteInquiryEmail(inquiry).catch((e) => console.error("[email] inquiry send failed:", e));
      // Auto-upsert customer in CRM
      storage.upsertCustomerByEmail(`${input.firstName} ${input.lastName}`.trim(), input.email, input.phone).catch((e) =>
        console.error("[crm] inquiry upsert failed:", e)
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Failed to create website inquiry" });
    }
  });

  app.patch("/api/website-inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schema = z.object({
        status: z.string().optional(),
        notes: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        prepayment: z.string().nullable().optional(),
        prepaymentIncludesVat: z.boolean().optional(),
        sendClientEmail: z.boolean().optional(),
      });
      const data = schema.parse(req.body);
      const { sendClientEmail, ...updateData } = data;
      const inquiry = await storage.updateWebsiteInquiry(id, updateData);
      res.json(inquiry);
      if (sendClientEmail) {
        sendWebsiteInquiryClientEmail(inquiry).catch((e) => console.error("[email] client inquiry send failed:", e));
      }
    } catch (err) {
      res.status(404).json({ message: "Website inquiry not found" });
    }
  });

  // --- IPSW download tracking (public page + admin stats) ---
  app.post("/api/ipsw/track", async (req, res) => {
    try {
      const schema = z.object({
        deviceIdentifier: z.string().min(1).max(128),
        deviceName: z.string().max(256).optional().nullable(),
        version: z.string().min(1).max(64),
        buildId: z.string().min(1).max(64),
      });
      const data = schema.parse(req.body);
      const row = await storage.recordIpswDownload(data);
      res.status(201).json({ ok: true, id: row.id });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Invalid payload" });
      }
      console.error("[ipsw/track]", err);
      res.status(500).json({ message: "Σφάλμα καταγραφής" });
    }
  });

  /** IMEI lookup — IMEI.info API v4 (IMEI_INFO_API_KEY) or custom GET URL (IMEI_LOOKUP_URL_TEMPLATE). */
  app.post("/api/imei/lookup", async (req, res) => {
    try {
      const schema = z.object({ imei: z.string().min(10).max(32) });
      const { imei } = schema.parse(req.body);
      const result = await runImeiLookup(imei);
      res.json(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Σφάλμα ελέγχου IMEI";
      const isConfig =
        msg.includes("ρυθμίστε") ||
        msg.includes("not configured") ||
        msg.includes("IMEI_LOOKUP_URL_TEMPLATE not set");
      const status = isConfig ? 503 : 400;
      res.status(status).json({ ok: false, error: msg });
    }
  });

  app.get("/api/admin/hubspot/contacts", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const contacts = await fetchHubSpotContacts();
      res.json(contacts);
    } catch (err) {
      console.error("[hubspot/contacts]", err);
      const msg = err instanceof Error ? err.message : "HubSpot error";
      const status = msg.includes("HUBSPOT_ACCESS_TOKEN") ? 503 : 500;
      res.status(status).json({ message: msg });
    }
  });

  /** Supplier XML sync — προμηθευτές & τιμές επισκευών */
  app.get("/api/admin/suppliers", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      res.json(await storage.getSuppliers());
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.post("/api/admin/suppliers", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const body = insertSupplierSchema.parse(req.body);
      const row = await storage.createSupplier(body);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Μη έγκυρα δεδομένα" });
      }
      console.error("[admin/suppliers POST]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.put("/api/admin/suppliers/:id", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: "Μη έγκυρο id" });
      const body = z
        .object({
          name: z.string().min(1).optional(),
          xmlUrl: z.string().url().optional(),
          workFee: z.union([z.string(), z.number()]).optional(),
          vatRate: z.union([z.string(), z.number()]).optional(),
        })
        .parse(req.body);
      const row = await storage.updateSupplier(id, body);
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Μη έγκυρα δεδομένα" });
      }
      console.error("[admin/suppliers PUT]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.delete("/api/admin/suppliers/:id", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ message: "Μη έγκυρο id" });
      await storage.deleteSupplier(id);
      res.status(204).end();
    } catch (err) {
      console.error("[admin/suppliers DELETE]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.post("/api/admin/sync-now", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const { supplierId } = z.object({ supplierId: z.number().int().positive().optional() }).parse(req.body ?? {});
      const jobId = newSyncJobId();
      syncJobs.set(jobId, { progress: 0, message: "Έναρξη…", done: false });
      void runSupplierSyncJob(jobId, supplierId).catch((err) => {
        console.error("[sync-now]", err);
        syncJobs.set(jobId, {
          progress: 100,
          message: err instanceof Error ? err.message : String(err),
          done: true,
          error: true,
        });
      });
      res.json({ jobId });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Μη έγκυρα δεδομένα" });
      }
      console.error("[admin/sync-now]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.get("/api/admin/sync-status/:jobId", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const job = syncJobs.get(req.params.jobId);
      if (!job) return res.status(404).json({ message: "Άγνωστη εργασία" });
      res.json(job);
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.get("/api/admin/supplier-sync-items", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      let sid: number | undefined;
      const q = req.query.supplierId;
      if (q != null && String(q) !== "") {
        const n = parseInt(String(q), 10);
        if (!Number.isNaN(n)) sid = n;
      }
      const rows = await storage.getSupplierSyncItems(sid);
      res.json(rows);
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  app.get("/api/admin/repair-price-overrides", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      res.json(await storage.getAllRepairPriceOverrides());
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  const repairPriceOverridePatchSchema = z
    .object({
      price: z.string().min(1).optional(),
      purchaseCost: z.union([z.string(), z.null()]).optional(),
      externalSku: z.union([z.string().max(512), z.null()]).optional(),
    })
    .refine((v) => v.price !== undefined || v.purchaseCost !== undefined || v.externalSku !== undefined, {
      message: "Τουλάχιστον ένα πεδίο προς ενημέρωση",
    });

  app.patch("/api/admin/repair-price-overrides/:id", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const body = repairPriceOverridePatchSchema.parse(req.body);
      const patch: {
        price?: string;
        purchaseCost?: string | null;
        externalSku?: string | null;
      } = {};
      if (body.price !== undefined) patch.price = body.price;
      if (body.purchaseCost !== undefined) patch.purchaseCost = body.purchaseCost;
      if (body.externalSku !== undefined) {
        const s = body.externalSku;
        patch.externalSku = s === null || s.trim() === "" ? null : s.trim();
      }
      const row = await storage.updateRepairPriceOverrideById(id, patch);
      if (!row) return res.status(404).json({ message: "Δεν βρέθηκε η εγγραφή" });
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Μη έγκυρα δεδομένα" });
      }
      const pg = err as { code?: string };
      if (pg.code === "23505") {
        return res.status(409).json({ message: "Το external SKU υπάρχει ήδη σε άλλη εγγραφή." });
      }
      console.error("[admin/repair-price-overrides PATCH]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.delete("/api/admin/repair-price-overrides/:id", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const id = z.coerce.number().int().positive().parse(req.params.id);
      const ok = await storage.deleteRepairPriceOverride(id);
      if (!ok) return res.status(404).json({ message: "Δεν βρέθηκε η εγγραφή" });
      res.status(204).send();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Μη έγκυρο id" });
      }
      console.error("[admin/repair-price-overrides DELETE]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  app.post("/api/admin/repair-price-overrides", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const body = insertRepairPriceOverrideSchema.parse(req.body);
      const row = await storage.upsertRepairPriceOverride(body);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0]?.message ?? "Μη έγκυρα δεδομένα" });
      }
      console.error("[admin/repair-price-overrides]", err);
      res.status(500).json({ message: "Σφάλμα" });
    }
  });

  /** Ανέβασμα ενιαίου PDF τιμοκαταλόγου FixMobile → uploads/fixmobile/fixmobile.pdf (οθόνες+μπαταρίες, κατηγορία ανά γραμμή) */
  app.post(
    "/api/admin/upload-fixmobile-pdf",
    fixmobileUpload.single("file"),
    async (req, res) => {
      const auth = req.headers.authorization || "";
      const token = auth.replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "Unauthorized" });
      try {
        const decoded = Buffer.from(token, "base64").toString("utf8");
        const payload = JSON.parse(decoded);
        if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
        const user = await storage.getAdminByEmail(payload.email);
        if (!user) return res.status(401).json({ message: "Unauthorized" });
        if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
        if (!req.file?.buffer?.length) return res.status(400).json({ message: "Απαιτείται αρχείο PDF" });
        mkdirSync(FIXMOBILE_UPLOAD_DIR, { recursive: true });
        await writeFile(FIXMOBILE_PDF, req.file.buffer);
        res.json({ ok: true, path: FIXMOBILE_PDF, filename: "fixmobile.pdf" });
      } catch (err) {
        console.error("[upload-fixmobile-pdf]", err);
        res.status(500).json({ message: "Σφάλμα αποθήκευσης" });
      }
    }
  );

  /** Διαβάζει τα αποθηκευμένα PDF και ενημερώνει repair_price_overrides */
  app.post("/api/admin/sync-fixmobile-pdf", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const result = await runFixmobilePdfSyncFromDisk();
      res.json(result);
    } catch (err) {
      console.error("[sync-fixmobile-pdf]", err);
      res.status(500).json({ message: err instanceof Error ? err.message : "Σφάλμα" });
    }
  });

  /** Πλήθος εγγραφών repair_price_overrides ανά service_key (πρόοδος αντιστοίχισης επισκευών) */
  app.get("/api/admin/repair-price-override-stats", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const stats = await storage.getRepairPriceOverrideStats();
      console.log("[repair-price-override-stats]", JSON.stringify(stats));
      res.json(stats);
    } catch (err) {
      console.error("[repair-price-override-stats]", err);
      res.status(500).json({ message: err instanceof Error ? err.message : "Σφάλμα" });
    }
  });

  app.get("/api/admin/ipsw-downloads", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const stats = await storage.getIpswDownloadStats();
      res.json(stats);
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  /** eShop: «Θέλω καλύτερη προσφορά» — αποθήκευση + email διαχειριστή */
  app.post("/api/product-offer-interest", async (req, res) => {
    try {
      const input = productOfferInterestPublicSchema.parse(req.body);
      const product = await storage.getProduct(input.productId);
      if (!product) return res.status(404).json({ message: "Το προϊόν δεν βρέθηκε" });
      const row = await storage.createProductOfferInterest({
        productId: product.id,
        productName: product.name,
        productSlug: product.slug ?? null,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
      });
      res.status(201).json({ ok: true, id: row.id });
      sendProductOfferInterestEmail(row).catch((e) => console.error("[email] product offer interest failed:", e));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("[product-offer-interest]", err);
      res.status(500).json({ message: "Σφάλμα αποστολής" });
    }
  });

  app.get("/api/admin/product-offer-interests", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const rows = await storage.getProductOfferInterests();
      res.json(rows);
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  /** AI βοηθός επισκευών (GPT-4 / OpenAI) — δημόσιο, χωρίς auth */
  app.post("/api/chat/repair-assistant", async (req, res) => {
    try {
      const schema = z.object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(12000),
            })
          )
          .min(1)
          .max(28),
        serviceTermsAccepted: z.boolean(),
      });
      const { messages, serviceTermsAccepted } = schema.parse(req.body);
      if (!serviceTermsAccepted) {
        return res.status(400).json({
          message: "Πρέπει να αποδεχτείτε τους Όρους Service και την Εγγύηση 3 μηνών για να στείλετε μήνυμα.",
        });
      }
      const catalogBlock = await getRepairCatalogPromptBlock();
      const rawReply = await runRepairAssistantChat(messages, catalogBlock);
      const { displayText, ctas } = splitAssistantReply(rawReply);

      let reply = displayText;
      let leadEmailSent = false;
      const last = messages[messages.length - 1];
      if (last?.role === "user") {
        const lead = tryParseLeadFromText(last.content);
        if (lead) {
          const deviceModel = guessDeviceModelFromMessages(messages);
          const transcriptSnippet = messages
            .slice(-8)
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n\n");
          await sendRepairChatLeadEmail({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            deviceModel,
            transcriptSnippet,
          });
          await storage.upsertCustomerByEmail(lead.name, lead.email, lead.phone).catch(() => {});
          leadEmailSent = true;
          const alreadyAck = /έλαβα|ευχαριστ|στοιχεία|θα σας καλέσ/i.test(reply);
          if (!alreadyAck) {
            reply +=
              "\n\n✅ Έλαβα τα στοιχεία σας — θα σας καλέσει τεχνικός μας σύντομα για ακριβή προσφορά και χρόνο επισκευής.";
          }
        }
      }

      reply = compactAssistantDisplayText(reply);

      res.json({ reply, ctas, leadEmailSent });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      if (err instanceof Error && err.message === "OPENAI_API_KEY_MISSING") {
        return res.status(503).json({ message: "Η υπηρεσία δεν είναι διαθέσιμη προσωρινά." });
      }
      if (err instanceof Error && err.message === "EMPTY_COMPLETION") {
        console.error("[chat/repair-assistant] empty completion");
        return res.status(503).json({ message: "Η υπηρεσία δεν απάντησε. Δοκιμάστε ξανά." });
      }
      if (err instanceof APIError) {
        console.error("[chat/repair-assistant] OpenAI", err.status, err.message);
        if (err.status === 401 || err.status === 403) {
          return res.status(503).json({ message: "Η υπηρεσία AI δεν είναι ρυθμισμένη σωστά (κλειδί API)." });
        }
        if (err.status === 429) {
          return res.status(429).json({ message: "Πολλά αιτήματα. Δοκιμάστε ξανά σε λίγα λεπτά." });
        }
        if (err.status === 404) {
          return res.status(503).json({ message: "Το μοντέλο AI δεν είναι διαθέσιμο. Ελέγξτε OPENAI_API_MODEL." });
        }
        return res.status(500).json({ message: "Σφάλμα συνομιλίας" });
      }
      console.error("[chat/repair-assistant]", err);
      res.status(500).json({ message: "Σφάλμα συνομιλίας" });
    }
  });

  /** Αποστολή συσκευής — BoxNow locker + κωδικός αναφοράς HiTech */
  app.post("/api/boxnow-dropoff", async (req, res) => {
    try {
      const input = boxnowDropoffPublicSchema.parse(req.body);
      const referenceCode = `HD-BN-${randomBytes(4).toString("hex").toUpperCase()}`;
      const row = await storage.createBoxnowDropoffRequest({
        referenceCode,
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: input.email && input.email !== "" ? input.email.trim() : null,
        deviceNote: input.deviceNote?.trim() || null,
        lockerId: input.lockerId,
        lockerAddress: input.lockerAddress.trim(),
        lockerPostalCode: input.lockerPostalCode?.trim() || null,
      });
      res.status(201).json({ ok: true, referenceCode: row.referenceCode });
      sendBoxnowDropoffEmail(row).catch((e) => console.error("[email] boxnow dropoff failed:", e));
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      console.error("[boxnow-dropoff]", err);
      res.status(500).json({ message: "Σφάλμα αποθήκευσης" });
    }
  });

  app.get("/api/admin/boxnow-dropoffs", async (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const payload = JSON.parse(decoded);
      if (!payload?.email) return res.status(401).json({ message: "Unauthorized" });
      const user = await storage.getAdminByEmail(payload.email);
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      if (user.role === "staff") return res.status(403).json({ message: "Δεν επιτρέπεται" });
      const rows = await storage.getBoxnowDropoffRequests();
      res.json(rows);
    } catch {
      res.status(401).json({ message: "Unauthorized" });
    }
  });

  return httpServer;
}
