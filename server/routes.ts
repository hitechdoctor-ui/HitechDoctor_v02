import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { insertRepairRequestSchema, insertRepairItemSchema, insertSubscriptionSchema, insertWebsiteInquirySchema } from "@shared/schema";
import { z } from "zod";
import { sendRepairConfirmationEmail, sendWebsiteInquiryEmail, sendWebsiteInquiryClientEmail } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Admin Auth ---
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body || {};
    const adminEmail = process.env.ADMIN_EMAIL || "info@hitechdoctor.com";
    const adminPass = process.env.ADMIN_PASSWORD || "hitech2026!";
    if (email === adminEmail && password === adminPass) {
      const token = Buffer.from(`${email}:${adminPass}:${Date.now()}`).toString("base64");
      res.json({ ok: true, token });
    } else {
      res.status(401).json({ ok: false, message: "Λάθος email ή κωδικός" });
    }
  });

  app.get("/api/admin/me", (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.replace("Bearer ", "");
    if (!token) return res.status(401).json({ ok: false });
    try {
      const decoded = Buffer.from(token, "base64").toString("utf8");
      const adminEmail = process.env.ADMIN_EMAIL || "info@hitechdoctor.com";
      const adminPass = process.env.ADMIN_PASSWORD || "hitech2026!";
      if (decoded.startsWith(`${adminEmail}:${adminPass}:`)) {
        return res.json({ ok: true, email: adminEmail });
      }
    } catch {}
    res.status(401).json({ ok: false });
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

  // --- Customers API ---
  app.get(api.customers.list.path, async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
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
      const id = parseInt(req.params.id);
      const orderList = await storage.getCustomerOrders(id);
      res.json(orderList);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer orders" });
    }
  });

  app.get("/api/customers/:id/subscriptions", async (req, res) => {
    try {
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
      const order = await storage.updateOrderStatus(id, input.status);
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
      const schema = z.object({
        status: z.string().optional(),
        price: z.string().nullable().optional(),
        priceIncludesVat: z.boolean().optional(),
      });
      const data = schema.parse(req.body);
      if (data.price !== undefined && data.priceIncludesVat === undefined) {
        (data as typeof data & { priceIncludesVat?: boolean }).priceIncludesVat = false;
      }
      const request = await storage.updateRepairRequest(id, data);
      res.json(request);
    } catch (err) {
      res.status(404).json({ message: "Repair request not found" });
    }
  });

  app.patch("/api/repair-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.string() }).parse(req.body);
      const request = await storage.updateRepairRequestStatus(id, status);
      res.json(request);
    } catch (err) {
      res.status(404).json({ message: "Repair request not found" });
    }
  });

  // --- Repair Items API ---
  app.get("/api/repair-requests/:id/items", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await storage.getRepairItems(id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch repair items" });
    }
  });

  app.post("/api/repair-requests/:id/items", async (req, res) => {
    try {
      const repairRequestId = parseInt(req.params.id);
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
      const schema = z.object({
        description: z.string().min(1).optional(),
        amount: z.string().optional(),
      });
      const data = schema.parse(req.body);
      const item = await storage.updateRepairItem(id, data);
      res.json(item);
    } catch (err) {
      res.status(404).json({ message: "Repair item not found" });
    }
  });

  app.delete("/api/repair-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRepairItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: "Repair item not found" });
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

  return httpServer;
}
