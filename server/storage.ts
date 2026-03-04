import { db } from "./db";
import {
  products,
  customers,
  orders,
  orderItems,
  repairRequests,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type RepairRequest,
  type InsertRepairRequest,
  type CheckoutPayload
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(category?: string, subcategory?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerOrders(customerId: number): Promise<any[]>;

  // Orders
  getOrders(): Promise<any[]>;
  getOrderItems(orderId: number): Promise<any[]>;
  createOrder(payload: CheckoutPayload): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Repair Requests
  getRepairRequests(): Promise<RepairRequest[]>;
  getRepairRequestsByEmail(email: string): Promise<RepairRequest[]>;
  createRepairRequest(data: InsertRepairRequest): Promise<RepairRequest>;
  updateRepairRequestStatus(id: number, status: string): Promise<RepairRequest>;
  updateRepairRequest(id: number, data: { status?: string; price?: string | null }): Promise<RepairRequest>;
}

export class DatabaseStorage implements IStorage {
  // --- Products ---
  async getProducts(category?: string, subcategory?: string): Promise<Product[]> {
    const conditions = [];
    if (category) conditions.push(eq(products.category, category));
    if (subcategory) conditions.push(eq(products.subcategory, subcategory));
    if (conditions.length > 0) {
      return await db.select().from(products).where(and(...conditions));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    if (!updated) throw new Error("Product not found");
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // --- Customers ---
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  async getCustomerOrders(customerId: number): Promise<any[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));
  }

  // --- Orders ---
  async getOrders(): Promise<any[]> {
    const results = await db.select({
      order: orders,
      customerName: customers.name,
      customerEmail: customers.email,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt));

    return results.map(row => ({
      ...row.order,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
    }));
  }

  async getOrderItems(orderId: number): Promise<any[]> {
    const rows = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      priceAtTime: orderItems.priceAtTime,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.imageUrl,
    })
    .from(orderItems)
    .leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
    return rows;
  }

  async createOrder(payload: CheckoutPayload): Promise<Order> {
    let customerId: number;
    const existingCustomer = await this.getCustomerByEmail(payload.customer.email);

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await db.update(customers).set({
        phone: payload.customer.phone || existingCustomer.phone,
        address: payload.customer.address || existingCustomer.address
      }).where(eq(customers.id, customerId));
    } else {
      const [newCustomer] = await db.insert(customers).values(payload.customer).returning();
      customerId = newCustomer.id;
    }

    let totalAmount = 0;
    const itemsToInsert: InsertOrderItem[] = [];

    for (const item of payload.items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const price = parseFloat(product.price);
      totalAmount += price * item.quantity;
      itemsToInsert.push({
        orderId: 0,
        productId: product.id,
        quantity: item.quantity,
        priceAtTime: product.price,
      });
    }

    const [order] = await db.insert(orders).values({
      customerId,
      totalAmount: totalAmount.toString(),
      status: "pending"
    }).returning();

    for (const item of itemsToInsert) {
      item.orderId = order.id;
      await db.insert(orderItems).values(item);
    }

    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    if (!updated) throw new Error("Order not found");
    return updated;
  }

  // --- Repair Requests ---
  async getRepairRequests(): Promise<RepairRequest[]> {
    return await db.select().from(repairRequests).orderBy(desc(repairRequests.createdAt));
  }

  async getRepairRequestsByEmail(email: string): Promise<RepairRequest[]> {
    return await db.select().from(repairRequests)
      .where(eq(repairRequests.email, email))
      .orderBy(desc(repairRequests.createdAt));
  }

  async createRepairRequest(data: InsertRepairRequest): Promise<RepairRequest> {
    const [created] = await db.insert(repairRequests).values(data).returning();
    return created;
  }

  async updateRepairRequestStatus(id: number, status: string): Promise<RepairRequest> {
    const [updated] = await db.update(repairRequests)
      .set({ status })
      .where(eq(repairRequests.id, id))
      .returning();
    if (!updated) throw new Error("Repair request not found");
    return updated;
  }

  async updateRepairRequest(id: number, data: { status?: string; price?: string | null }): Promise<RepairRequest> {
    const [updated] = await db.update(repairRequests)
      .set(data)
      .where(eq(repairRequests.id, id))
      .returning();
    if (!updated) throw new Error("Repair request not found");
    return updated;
  }
}

export const storage = new DatabaseStorage();
