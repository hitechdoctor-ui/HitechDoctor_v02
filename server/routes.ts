import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { insertRepairRequestSchema, insertRepairItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- Products API ---
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
      });
      const data = schema.parse(req.body);
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

  return httpServer;
}
