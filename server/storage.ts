import { db } from "./db";
import {
  products,
  customers,
  orders,
  orderItems,
  type Product,
  type InsertProduct,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CheckoutPayload
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;

  // Orders
  getOrders(): Promise<any[]>; // Will return orders with customer details
  createOrder(payload: CheckoutPayload): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // --- Products ---
  async getProducts(category?: string): Promise<Product[]> {
    if (category) {
      return await db.select().from(products).where(eq(products.category, category));
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

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.email, email));
    return customer;
  }

  // --- Orders ---
  async getOrders(): Promise<any[]> {
    // Basic join to get orders with customer name and email
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

  async createOrder(payload: CheckoutPayload): Promise<Order> {
    // Determine customer
    let customerId: number;
    const existingCustomer = await this.getCustomerByEmail(payload.customer.email);
    
    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Optionally update phone/address if new
      await db.update(customers).set({
        phone: payload.customer.phone || existingCustomer.phone,
        address: payload.customer.address || existingCustomer.address
      }).where(eq(customers.id, customerId));
    } else {
      const [newCustomer] = await db.insert(customers).values(payload.customer).returning();
      customerId = newCustomer.id;
    }

    // Calculate total amount
    let totalAmount = 0;
    const itemsToInsert: InsertOrderItem[] = [];

    for (const item of payload.items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      
      const price = parseFloat(product.price);
      totalAmount += price * item.quantity;
      
      itemsToInsert.push({
        orderId: 0, // placeholder, updated below
        productId: product.id,
        quantity: item.quantity,
        priceAtTime: product.price,
      });
    }

    // Create the order
    const [order] = await db.insert(orders).values({
      customerId,
      totalAmount: totalAmount.toString(),
      status: "pending"
    }).returning();

    // Insert order items
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
}

export const storage = new DatabaseStorage();
