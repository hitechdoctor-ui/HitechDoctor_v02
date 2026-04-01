import { db } from "./db";
import {
  products,
  customers,
  orders,
  orderItems,
  repairRequests,
  repairItems,
  subscriptions,
  websiteInquiries,
  productOfferInterests,
  boxnowDropoffRequests,
  ipswDownloadEvents,
  siteAnalytics,
  chatActivity,
  suppliers,
  supplierSyncItems,
  repairPriceOverrides,
  adminUsers,
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
  type RepairItem,
  type InsertRepairItem,
  type Subscription,
  type InsertSubscription,
  type WebsiteInquiry,
  type InsertWebsiteInquiry,
  type ProductOfferInterest,
  type InsertProductOfferInterest,
  type BoxnowDropoffRequest,
  type InsertBoxnowDropoffRequest,
  type IpswDownloadEvent,
  type CheckoutPayload,
  type AdminUser,
  type Supplier,
  type InsertSupplier,
  type SupplierSyncItem,
  type RepairPriceOverride,
  type InsertRepairPriceOverride,
} from "@shared/schema";
import { eq, desc, and, sql, lte, gte, count, lt, isNotNull } from "drizzle-orm";
import { queueHubSpotContactSync } from "./hubspot";

export interface IStorage {
  // Products
  getProducts(category?: string, subcategory?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductCategories(): Promise<{ category: string; subcategory: string | null; count: number }[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Customers
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  getCustomerOrders(customerId: number): Promise<any[]>;
  upsertCustomerByEmail(name: string, email: string, phone?: string | null): Promise<Customer>;
  getCustomerSubscriptions(email: string): Promise<Subscription[]>;
  getCustomerInquiries(email: string): Promise<WebsiteInquiry[]>;
  updateCustomer(
    id: number,
    data: Partial<Pick<Customer, "name" | "phone" | "address" | "viberUserId">>
  ): Promise<Customer>;

  // Orders
  getOrders(): Promise<any[]>;
  getOrderWithCustomer(orderId: number): Promise<{
    order: Order;
    customerName: string;
    customerEmail: string;
    customerViberUserId: string | null;
  } | undefined>;
  getOrderItems(orderId: number): Promise<any[]>;
  createOrder(payload: CheckoutPayload): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;

  // Repair Requests
  getRepairRequests(): Promise<RepairRequest[]>;
  getRepairRequestsByEmail(email: string): Promise<RepairRequest[]>;
  getRepairRequestsForStaff(userId: number): Promise<RepairRequest[]>;
  getRepairRequestById(id: number): Promise<RepairRequest | undefined>;
  createRepairRequest(data: InsertRepairRequest): Promise<RepairRequest>;
  updateRepairRequestStatus(id: number, status: string): Promise<RepairRequest>;
  updateRepairRequest(
    id: number,
    data: {
      status?: string;
      price?: string | null;
      priceIncludesVat?: boolean;
      assignedToUserId?: number | null;
      viberUserId?: string | null;
    }
  ): Promise<RepairRequest>;

  // Repair Items (line items)
  getRepairItems(repairRequestId: number): Promise<RepairItem[]>;
  getRepairItemById(id: number): Promise<RepairItem | undefined>;
  /** Ολοκληρωμένες επισκευές με ποσό (γραμμές ή χειροκίνητη τιμή) — για Οικονομικά. */
  getCompletedRepairRevenueRows(): Promise<
    { id: number; createdAt: Date; total: number; customerName: string; email: string }[]
  >;
  createRepairItem(data: InsertRepairItem): Promise<RepairItem>;
  updateRepairItem(id: number, data: { description?: string; amount?: string }): Promise<RepairItem>;
  deleteRepairItem(id: number): Promise<void>;

  // Subscriptions
  getSubscriptions(type?: string): Promise<Subscription[]>;
  getSubscription(id: number): Promise<Subscription | undefined>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, data: Partial<InsertSubscription & { notifiedMonthBefore?: boolean; notifiedTenDaysBefore?: boolean }>): Promise<Subscription>;
  deleteSubscription(id: number): Promise<void>;
  getExpiringSubscriptions(daysAhead: number): Promise<Subscription[]>;

  // Website Inquiries
  getWebsiteInquiries(): Promise<WebsiteInquiry[]>;
  getWebsiteInquiry(id: number): Promise<WebsiteInquiry | undefined>;
  createWebsiteInquiry(data: InsertWebsiteInquiry): Promise<WebsiteInquiry>;
  updateWebsiteInquiry(id: number, data: Partial<{
    status: string; notes: string; firstName: string; lastName: string;
    phone: string; email: string; prepayment: string | null; prepaymentIncludesVat: boolean;
  }>): Promise<WebsiteInquiry>;

  // Product «καλύτερη προσφορά» (eShop)
  createProductOfferInterest(data: InsertProductOfferInterest): Promise<ProductOfferInterest>;
  getProductOfferInterests(): Promise<ProductOfferInterest[]>;

  createBoxnowDropoffRequest(data: InsertBoxnowDropoffRequest): Promise<BoxnowDropoffRequest>;
  getBoxnowDropoffRequests(): Promise<BoxnowDropoffRequest[]>;

  // Admin Users
  getAdminUsers(): Promise<Omit<AdminUser, "passwordHash">[]>;
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(name: string, email: string, passwordHash: string, role?: string): Promise<Omit<AdminUser, "passwordHash">>;
  deleteAdminUser(id: number): Promise<void>;
  updateAdminPassword(id: number, passwordHash: string): Promise<void>;

  // IPSW downloads
  recordIpswDownload(data: {
    deviceIdentifier: string;
    deviceName?: string | null;
    version: string;
    buildId: string;
  }): Promise<IpswDownloadEvent>;
  getIpswDownloadStats(): Promise<{
    total: number;
    last7Days: number;
    last30Days: number;
    byDevice: { deviceIdentifier: string; deviceName: string | null; count: number }[];
    recent: IpswDownloadEvent[];
  }>;

  trackPageVisit(data: {
    sessionId: string;
    pagePath: string;
    referrer?: string | null;
    userAgent?: string | null;
    osFamily: string;
    browserFamily: string;
    geoCity?: string | null;
    geoRegion?: string | null;
  }): Promise<void>;

  getAnalyticsStats(): Promise<{
    today: number;
    yesterday: number;
    weekTotal: number;
    monthTotal: number;
    activeNow: number;
    dailyLast7Days: { date: string; count: number }[];
  }>;

  getAnalyticsTopPages(period: "day" | "week" | "month" | "year"): Promise<{ path: string; count: number }[]>;

  getAnalyticsInsights(period: "day" | "week" | "month" | "year"): Promise<{
    totalInPeriod: number;
    byOs: { name: string; count: number }[];
    byBrowser: { name: string; count: number }[];
    topCities: { city: string; region: string | null; count: number }[];
  }>;

  trackChatMessage(data: { sessionId: string; message: string }): Promise<void>;

  getChatActivityStats(): Promise<{
    today: number;
    dailyLast7Days: { date: string; count: number }[];
  }>;

  // Suppliers & sync
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(data: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;
  replaceSupplierSyncItems(
    supplierId: number,
    rows: { externalSku: string; title: string | null; purchaseCost: string; sellingPrice: string }[]
  ): Promise<void>;
  updateRepairPriceOverridesFromSync(
    updates: { externalSku: string; price: string; purchaseCost: string; supplierId: number }[]
  ): Promise<number>;
  updateSupplierLastSync(id: number, at: Date): Promise<void>;
  getSupplierSyncItems(supplierId?: number): Promise<SupplierSyncItem[]>;
  getRepairPriceOverrides(): Promise<RepairPriceOverride[]>;
  /** Όλες οι εγγραφές (για δημόσιο API τιμών επισκευής). */
  getAllRepairPriceOverrides(): Promise<RepairPriceOverride[]>;
  upsertRepairPriceOverride(data: InsertRepairPriceOverride): Promise<RepairPriceOverride>;
  /** Πλήθος εγγραφών στον πίνακα repair_price_overrides ανά service_key (+ σύνολο). */
  getRepairPriceOverrideStats(): Promise<{
    total: number;
    byServiceKey: { serviceKey: string; count: number }[];
  }>;
  updateRepairPriceOverrideById(
    id: number,
    patch: { price?: string; purchaseCost?: string | null; externalSku?: string | null }
  ): Promise<RepairPriceOverride | undefined>;
  deleteRepairPriceOverride(id: number): Promise<boolean>;
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

  async getProductCategories(): Promise<{ category: string; subcategory: string | null; count: number }[]> {
    const rows = await db
      .select({
        category: products.category,
        subcategory: products.subcategory,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(products)
      .groupBy(products.category, products.subcategory);
    return rows;
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
    const rows = await db.select({
      id: orders.id,
      customerId: orders.customerId,
      totalAmount: orders.totalAmount,
      status: orders.status,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
    }).from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt));

    // Attach items for each order
    const result = [];
    for (const order of rows) {
      const items = await this.getOrderItems(order.id);
      result.push({ ...order, items });
    }
    return result;
  }

  async upsertCustomerByEmail(name: string, email: string, phone?: string | null): Promise<Customer> {
    const existing = await this.getCustomerByEmail(email);
    let result: Customer;
    if (existing) {
      if (phone && !existing.phone) {
        await db.update(customers).set({ phone }).where(eq(customers.id, existing.id));
        result = { ...existing, phone };
      } else {
        result = existing;
      }
    } else {
      const [created] = await db.insert(customers).values({ name, email, phone: phone || null }).returning();
      result = created;
    }
    queueHubSpotContactSync({ name: result.name, email: result.email, phone: result.phone });
    return result;
  }

  async getCustomerSubscriptions(email: string): Promise<Subscription[]> {
    return await db.select().from(subscriptions)
      .where(eq(subscriptions.email, email))
      .orderBy(desc(subscriptions.createdAt));
  }

  async getCustomerInquiries(email: string): Promise<WebsiteInquiry[]> {
    return await db.select().from(websiteInquiries)
      .where(eq(websiteInquiries.email, email))
      .orderBy(desc(websiteInquiries.createdAt));
  }

  async updateCustomer(
    id: number,
    data: Partial<Pick<Customer, "name" | "phone" | "address" | "viberUserId">>
  ): Promise<Customer> {
    const [updated] = await db.update(customers).set(data).where(eq(customers.id, id)).returning();
    if (!updated) throw new Error("Customer not found");
    return updated;
  }

  // --- Orders ---
  async getOrders(): Promise<any[]> {
    const results = await db.select({
      order: orders,
      customerName: customers.name,
      customerEmail: customers.email,
      customerViberUserId: customers.viberUserId,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt));

    return results.map(row => ({
      ...row.order,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerViberUserId: row.customerViberUserId ?? null,
    }));
  }

  async getOrderWithCustomer(orderId: number): Promise<{
    order: Order;
    customerName: string;
    customerEmail: string;
    customerViberUserId: string | null;
  } | undefined> {
    const rows = await db.select({
      order: orders,
      customerName: customers.name,
      customerEmail: customers.email,
      customerViberUserId: customers.viberUserId,
    })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .where(eq(orders.id, orderId))
      .limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return {
      order: row.order,
      customerName: row.customerName,
      customerEmail: row.customerEmail,
      customerViberUserId: row.customerViberUserId ?? null,
    };
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

    const customerForHubspot = await this.getCustomer(customerId);
    if (customerForHubspot) {
      queueHubSpotContactSync({
        name: customerForHubspot.name,
        email: customerForHubspot.email,
        phone: customerForHubspot.phone,
      });
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
      status: "pending",
      paymentMethod: payload.paymentMethod ?? "cod",
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

  async getRepairRequestsForStaff(userId: number): Promise<RepairRequest[]> {
    return await db.select().from(repairRequests)
      .where(eq(repairRequests.assignedToUserId, userId))
      .orderBy(desc(repairRequests.createdAt));
  }

  async getRepairRequestById(id: number): Promise<RepairRequest | undefined> {
    const [row] = await db.select().from(repairRequests).where(eq(repairRequests.id, id));
    return row;
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

  async updateRepairRequest(
    id: number,
    data: {
      status?: string;
      price?: string | null;
      priceIncludesVat?: boolean;
      assignedToUserId?: number | null;
      viberUserId?: string | null;
    }
  ): Promise<RepairRequest> {
    const [updated] = await db.update(repairRequests)
      .set(data)
      .where(eq(repairRequests.id, id))
      .returning();
    if (!updated) throw new Error("Repair request not found");
    return updated;
  }

  // --- Repair Items ---
  async getRepairItems(repairRequestId: number): Promise<RepairItem[]> {
    return await db.select().from(repairItems)
      .where(eq(repairItems.repairRequestId, repairRequestId))
      .orderBy(repairItems.createdAt);
  }

  async createRepairItem(data: InsertRepairItem): Promise<RepairItem> {
    const [created] = await db.insert(repairItems).values(data).returning();
    return created;
  }

  async getRepairItemById(id: number): Promise<RepairItem | undefined> {
    const [row] = await db.select().from(repairItems).where(eq(repairItems.id, id));
    return row;
  }

  async updateRepairItem(id: number, data: { description?: string; amount?: string }): Promise<RepairItem> {
    const [updated] = await db.update(repairItems)
      .set(data)
      .where(eq(repairItems.id, id))
      .returning();
    if (!updated) throw new Error("Repair item not found");
    return updated;
  }

  async deleteRepairItem(id: number): Promise<void> {
    await db.delete(repairItems).where(eq(repairItems.id, id));
  }

  async getCompletedRepairRevenueRows(): Promise<
    { id: number; createdAt: Date; total: number; customerName: string; email: string }[]
  > {
    const completed = await db.select().from(repairRequests).where(eq(repairRequests.status, "completed"));
    const rows: { id: number; createdAt: Date; total: number; customerName: string; email: string }[] = [];
    for (const r of completed) {
      const items = await this.getRepairItems(r.id);
      const total =
        items.length > 0
          ? items.reduce((s, i) => s + Number(i.amount), 0)
          : r.price
            ? Number(r.price)
            : 0;
      if (!r.createdAt) continue;
      const customerName = `${r.firstName} ${r.lastName}`.trim();
      rows.push({ id: r.id, createdAt: r.createdAt, total, customerName, email: r.email });
    }
    return rows;
  }

  // --- Subscriptions ---
  async getSubscriptions(type?: string): Promise<Subscription[]> {
    if (type) {
      return await db.select().from(subscriptions)
        .where(eq(subscriptions.type, type))
        .orderBy(desc(subscriptions.createdAt));
    }
    return await db.select().from(subscriptions).orderBy(desc(subscriptions.createdAt));
  }

  async getSubscription(id: number): Promise<Subscription | undefined> {
    const [sub] = await db.select().from(subscriptions).where(eq(subscriptions.id, id));
    return sub;
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(data).returning();
    return created;
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription & { notifiedMonthBefore?: boolean; notifiedTenDaysBefore?: boolean }>): Promise<Subscription> {
    const [updated] = await db.update(subscriptions)
      .set(data as any)
      .where(eq(subscriptions.id, id))
      .returning();
    if (!updated) throw new Error("Subscription not found");
    return updated;
  }

  async deleteSubscription(id: number): Promise<void> {
    await db.delete(subscriptions).where(eq(subscriptions.id, id));
  }

  async getExpiringSubscriptions(daysAhead: number): Promise<Subscription[]> {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return await db.select().from(subscriptions)
      .where(and(
        eq(subscriptions.status, "active"),
        lte(subscriptions.renewalDate, future),
        gte(subscriptions.renewalDate, now)
      ));
  }

  // --- Website Inquiries ---
  async getWebsiteInquiries(): Promise<WebsiteInquiry[]> {
    return await db.select().from(websiteInquiries).orderBy(desc(websiteInquiries.createdAt));
  }

  async getWebsiteInquiry(id: number): Promise<WebsiteInquiry | undefined> {
    const [inq] = await db.select().from(websiteInquiries).where(eq(websiteInquiries.id, id));
    return inq;
  }

  async createWebsiteInquiry(data: InsertWebsiteInquiry): Promise<WebsiteInquiry> {
    const [created] = await db.insert(websiteInquiries).values(data).returning();
    return created;
  }

  async updateWebsiteInquiry(id: number, data: Partial<{
    status: string; notes: string; firstName: string; lastName: string;
    phone: string; email: string; prepayment: string | null; prepaymentIncludesVat: boolean;
  }>): Promise<WebsiteInquiry> {
    const [updated] = await db.update(websiteInquiries)
      .set(data as any)
      .where(eq(websiteInquiries.id, id))
      .returning();
    if (!updated) throw new Error("Website inquiry not found");
    return updated;
  }

  async createProductOfferInterest(data: InsertProductOfferInterest): Promise<ProductOfferInterest> {
    const [created] = await db.insert(productOfferInterests).values(data).returning();
    return created;
  }

  async getProductOfferInterests(): Promise<ProductOfferInterest[]> {
    return await db.select().from(productOfferInterests).orderBy(desc(productOfferInterests.createdAt));
  }

  async createBoxnowDropoffRequest(data: InsertBoxnowDropoffRequest): Promise<BoxnowDropoffRequest> {
    const [created] = await db.insert(boxnowDropoffRequests).values(data).returning();
    return created;
  }

  async getBoxnowDropoffRequests(): Promise<BoxnowDropoffRequest[]> {
    return await db.select().from(boxnowDropoffRequests).orderBy(desc(boxnowDropoffRequests.createdAt));
  }

  // --- Admin Users ---
  async getAdminUsers(): Promise<Omit<AdminUser, "passwordHash">[]> {
    const all = await db.select().from(adminUsers).orderBy(adminUsers.createdAt);
    return all.map(({ passwordHash: _ph, ...rest }) => rest);
  }

  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async createAdminUser(name: string, email: string, passwordHash: string, role = "admin"): Promise<Omit<AdminUser, "passwordHash">> {
    const [created] = await db.insert(adminUsers).values({ name, email, passwordHash, role }).returning();
    const { passwordHash: _ph, ...rest } = created;
    return rest;
  }

  async deleteAdminUser(id: number): Promise<void> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
  }

  async updateAdminPassword(id: number, passwordHash: string): Promise<void> {
    await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.id, id));
  }

  // --- IPSW download tracking ---
  async recordIpswDownload(data: {
    deviceIdentifier: string;
    deviceName?: string | null;
    version: string;
    buildId: string;
  }): Promise<IpswDownloadEvent> {
    const [row] = await db.insert(ipswDownloadEvents).values({
      deviceIdentifier: data.deviceIdentifier,
      deviceName: data.deviceName ?? null,
      version: data.version,
      buildId: data.buildId,
    }).returning();
    return row;
  }

  async getIpswDownloadStats(): Promise<{
    total: number;
    last7Days: number;
    last30Days: number;
    byDevice: { deviceIdentifier: string; deviceName: string | null; count: number }[];
    recent: IpswDownloadEvent[];
  }> {
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [totalRow] = await db
      .select({ c: sql<number>`cast(count(*) as integer)` })
      .from(ipswDownloadEvents);
    const total = totalRow?.c ?? 0;

    const [r7] = await db
      .select({ c: sql<number>`cast(count(*) as integer)` })
      .from(ipswDownloadEvents)
      .where(gte(ipswDownloadEvents.createdAt, d7));
    const last7Days = r7?.c ?? 0;

    const [r30] = await db
      .select({ c: sql<number>`cast(count(*) as integer)` })
      .from(ipswDownloadEvents)
      .where(gte(ipswDownloadEvents.createdAt, d30));
    const last30Days = r30?.c ?? 0;

    const byDeviceRows = await db
      .select({
        deviceIdentifier: ipswDownloadEvents.deviceIdentifier,
        deviceName: sql<string | null>`max(${ipswDownloadEvents.deviceName})`,
        cnt: count(),
      })
      .from(ipswDownloadEvents)
      .groupBy(ipswDownloadEvents.deviceIdentifier)
      .orderBy(desc(count()));

    const recent = await db
      .select()
      .from(ipswDownloadEvents)
      .orderBy(desc(ipswDownloadEvents.createdAt))
      .limit(80);

    return {
      total,
      last7Days,
      last30Days,
      byDevice: byDeviceRows.map((r) => ({
        deviceIdentifier: r.deviceIdentifier,
        deviceName: r.deviceName,
        count: r.cnt,
      })),
      recent,
    };
  }

  // --- Site analytics & AI chat activity ---
  async trackPageVisit(data: {
    sessionId: string;
    pagePath: string;
    referrer?: string | null;
    userAgent?: string | null;
    osFamily: string;
    browserFamily: string;
    geoCity?: string | null;
    geoRegion?: string | null;
  }): Promise<void> {
    await db.insert(siteAnalytics).values({
      sessionId: data.sessionId.slice(0, 128),
      pagePath: data.pagePath.slice(0, 2048),
      referrer: data.referrer?.slice(0, 2048) ?? null,
      userAgent: data.userAgent?.slice(0, 512) ?? null,
      osFamily: data.osFamily.slice(0, 64),
      browserFamily: data.browserFamily.slice(0, 64),
      geoCity: data.geoCity?.slice(0, 128) ?? null,
      geoRegion: data.geoRegion?.slice(0, 128) ?? null,
    });
  }

  private startOfLocalDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private formatYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  async getAnalyticsStats(): Promise<{
    today: number;
    yesterday: number;
    weekTotal: number;
    monthTotal: number;
    activeNow: number;
    dailyLast7Days: { date: string; count: number }[];
  }> {
    const now = new Date();
    const startToday = this.startOfLocalDay(now);
    const startYesterday = new Date(startToday.getTime() - 86400000);
    const startWeek = new Date(startToday.getTime() - 6 * 86400000);
    const startMonth = new Date(startToday);
    startMonth.setDate(1);
    const activeSince = new Date(now.getTime() - 5 * 60 * 1000);

    const countSince = async (from: Date, to?: Date) => {
      const cond = to
        ? and(gte(siteAnalytics.visitedAt, from), lt(siteAnalytics.visitedAt, to))
        : gte(siteAnalytics.visitedAt, from);
      const [r] = await db.select({ c: sql<number>`cast(count(*) as integer)` }).from(siteAnalytics).where(cond);
      return r?.c ?? 0;
    };

    const today = await countSince(startToday);
    const yesterday = await countSince(startYesterday, startToday);
    const weekTotal = await countSince(startWeek);
    const monthTotal = await countSince(startMonth);

    const [activeRow] = await db
      .select({ c: sql<number>`cast(count(distinct ${siteAnalytics.sessionId}) as integer)` })
      .from(siteAnalytics)
      .where(gte(siteAnalytics.visitedAt, activeSince));
    const activeNow = activeRow?.c ?? 0;

    const dailyLast7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(startToday);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const c = await countSince(dayStart, dayEnd);
      dailyLast7Days.push({ date: this.formatYmd(dayStart), count: c });
    }

    return { today, yesterday, weekTotal, monthTotal, activeNow, dailyLast7Days };
  }

  async getAnalyticsTopPages(period: "day" | "week" | "month" | "year"): Promise<{ path: string; count: number }[]> {
    const now = new Date();
    const startToday = this.startOfLocalDay(now);
    let from = startToday;
    if (period === "week") from = new Date(startToday.getTime() - 6 * 86400000);
    else if (period === "month") {
      from = new Date(startToday);
      from.setDate(1);
    } else if (period === "year") {
      from = new Date(startToday.getFullYear(), 0, 1);
    }

    const rows = await db
      .select({
        path: siteAnalytics.pagePath,
        cnt: count(),
      })
      .from(siteAnalytics)
      .where(gte(siteAnalytics.visitedAt, from))
      .groupBy(siteAnalytics.pagePath)
      .orderBy(desc(count()))
      .limit(10);

    return rows.map((r) => ({ path: r.path, count: r.cnt }));
  }

  private analyticsPeriodStart(period: "day" | "week" | "month" | "year"): Date {
    const now = new Date();
    const startToday = this.startOfLocalDay(now);
    let from = startToday;
    if (period === "week") from = new Date(startToday.getTime() - 6 * 86400000);
    else if (period === "month") {
      from = new Date(startToday);
      from.setDate(1);
    } else if (period === "year") {
      from = new Date(startToday.getFullYear(), 0, 1);
    }
    return from;
  }

  async getAnalyticsInsights(period: "day" | "week" | "month" | "year"): Promise<{
    totalInPeriod: number;
    byOs: { name: string; count: number }[];
    byBrowser: { name: string; count: number }[];
    topCities: { city: string; region: string | null; count: number }[];
  }> {
    const from = this.analyticsPeriodStart(period);

    const [totalRow] = await db
      .select({ c: sql<number>`cast(count(*) as integer)` })
      .from(siteAnalytics)
      .where(gte(siteAnalytics.visitedAt, from));
    const totalInPeriod = totalRow?.c ?? 0;

    const osRows = await db
      .select({
        key: siteAnalytics.osFamily,
        cnt: count(),
      })
      .from(siteAnalytics)
      .where(gte(siteAnalytics.visitedAt, from))
      .groupBy(siteAnalytics.osFamily)
      .orderBy(desc(count()));

    const browserRows = await db
      .select({
        key: siteAnalytics.browserFamily,
        cnt: count(),
      })
      .from(siteAnalytics)
      .where(gte(siteAnalytics.visitedAt, from))
      .groupBy(siteAnalytics.browserFamily)
      .orderBy(desc(count()));

    const cityRows = await db
      .select({
        city: siteAnalytics.geoCity,
        region: siteAnalytics.geoRegion,
        cnt: count(),
      })
      .from(siteAnalytics)
      .where(and(gte(siteAnalytics.visitedAt, from), isNotNull(siteAnalytics.geoCity)))
      .groupBy(siteAnalytics.geoCity, siteAnalytics.geoRegion)
      .orderBy(desc(count()))
      .limit(10);

    const label = (v: string | null, fallback: string) => (v && v.trim() ? v.trim() : fallback);

    return {
      totalInPeriod,
      byOs: osRows.map((r) => ({ name: label(r.key, "Χωρίς καταγραφή"), count: r.cnt })),
      byBrowser: browserRows.map((r) => ({ name: label(r.key, "Χωρίς καταγραφή"), count: r.cnt })),
      topCities: cityRows.map((r) => ({
        city: r.city ?? "",
        region: r.region,
        count: r.cnt,
      })),
    };
  }

  async trackChatMessage(data: { sessionId: string; message: string }): Promise<void> {
    const msg = data.message.trim().slice(0, 4000);
    if (!msg) return;
    await db.insert(chatActivity).values({
      sessionId: data.sessionId.slice(0, 128),
      message: msg,
    });
  }

  async getChatActivityStats(): Promise<{
    today: number;
    dailyLast7Days: { date: string; count: number }[];
  }> {
    const now = new Date();
    const startToday = this.startOfLocalDay(now);

    const countChatSince = async (from: Date, to?: Date) => {
      const cond = to
        ? and(gte(chatActivity.askedAt, from), lt(chatActivity.askedAt, to))
        : gte(chatActivity.askedAt, from);
      const [r] = await db.select({ c: sql<number>`cast(count(*) as integer)` }).from(chatActivity).where(cond);
      return r?.c ?? 0;
    };

    const today = await countChatSince(startToday);
    const dailyLast7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(startToday);
      dayStart.setDate(dayStart.getDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      const c = await countChatSince(dayStart, dayEnd);
      dailyLast7Days.push({ date: this.formatYmd(dayStart), count: c });
    }

    return { today, dailyLast7Days };
  }

  // --- Suppliers & XML sync ---
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers).orderBy(desc(suppliers.id));
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [r] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return r;
  }

  async createSupplier(data: InsertSupplier): Promise<Supplier> {
    const [r] = await db.insert(suppliers).values(data).returning();
    return r;
  }

  async updateSupplier(id: number, data: Partial<InsertSupplier>): Promise<Supplier> {
    const [r] = await db.update(suppliers).set(data).where(eq(suppliers.id, id)).returning();
    if (!r) throw new Error("Supplier not found");
    return r;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async replaceSupplierSyncItems(
    supplierId: number,
    rows: { externalSku: string; title: string | null; purchaseCost: string; sellingPrice: string }[]
  ): Promise<void> {
    await db.delete(supplierSyncItems).where(eq(supplierSyncItems.supplierId, supplierId));
    if (rows.length === 0) return;
    await db.insert(supplierSyncItems).values(
      rows.map((row) => ({
        supplierId,
        externalSku: row.externalSku,
        title: row.title,
        purchaseCost: row.purchaseCost,
        sellingPrice: row.sellingPrice,
      }))
    );
  }

  async updateRepairPriceOverridesFromSync(
    updates: { externalSku: string; price: string; purchaseCost: string; supplierId: number }[]
  ): Promise<number> {
    let n = 0;
    for (const u of updates) {
      const result = await db
        .update(repairPriceOverrides)
        .set({
          price: u.price,
          purchaseCost: u.purchaseCost,
          supplierId: u.supplierId,
          updatedAt: new Date(),
        })
        .where(eq(repairPriceOverrides.externalSku, u.externalSku))
        .returning({ id: repairPriceOverrides.id });
      if (result.length) n += result.length;
    }
    return n;
  }

  async updateSupplierLastSync(id: number, at: Date): Promise<void> {
    await db.update(suppliers).set({ lastSync: at }).where(eq(suppliers.id, id));
  }

  async getSupplierSyncItems(supplierId?: number): Promise<SupplierSyncItem[]> {
    if (supplierId != null) {
      return await db
        .select()
        .from(supplierSyncItems)
        .where(eq(supplierSyncItems.supplierId, supplierId))
        .orderBy(desc(supplierSyncItems.syncedAt))
        .limit(500);
    }
    return await db.select().from(supplierSyncItems).orderBy(desc(supplierSyncItems.syncedAt)).limit(500);
  }

  async getRepairPriceOverrides(): Promise<RepairPriceOverride[]> {
    return await db.select().from(repairPriceOverrides).orderBy(desc(repairPriceOverrides.updatedAt)).limit(200);
  }

  async getAllRepairPriceOverrides(): Promise<RepairPriceOverride[]> {
    return await db.select().from(repairPriceOverrides).orderBy(desc(repairPriceOverrides.updatedAt));
  }

  async updateRepairPriceOverrideById(
    id: number,
    patch: { price?: string; purchaseCost?: string | null; externalSku?: string | null }
  ): Promise<RepairPriceOverride | undefined> {
    const [existing] = await db.select().from(repairPriceOverrides).where(eq(repairPriceOverrides.id, id)).limit(1);
    if (!existing) return undefined;
    const [row] = await db
      .update(repairPriceOverrides)
      .set({
        ...(patch.price !== undefined ? { price: patch.price } : {}),
        ...(patch.purchaseCost !== undefined ? { purchaseCost: patch.purchaseCost } : {}),
        ...(patch.externalSku !== undefined ? { externalSku: patch.externalSku } : {}),
        updatedAt: new Date(),
      })
      .where(eq(repairPriceOverrides.id, id))
      .returning();
    return row;
  }

  async deleteRepairPriceOverride(id: number): Promise<boolean> {
    const r = await db.delete(repairPriceOverrides).where(eq(repairPriceOverrides.id, id)).returning({ id: repairPriceOverrides.id });
    return r.length > 0;
  }

  async getRepairPriceOverrideStats(): Promise<{
    total: number;
    byServiceKey: { serviceKey: string; count: number }[];
  }> {
    const byServiceKeyRows = await db
      .select({
        serviceKey: repairPriceOverrides.serviceKey,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(repairPriceOverrides)
      .groupBy(repairPriceOverrides.serviceKey)
      .orderBy(repairPriceOverrides.serviceKey);

    const [totalRow] = await db
      .select({ c: sql<number>`cast(count(*) as integer)` })
      .from(repairPriceOverrides);

    return {
      total: totalRow?.c ?? 0,
      byServiceKey: byServiceKeyRows.map((r) => ({
        serviceKey: r.serviceKey,
        count: r.count,
      })),
    };
  }

  async upsertRepairPriceOverride(data: InsertRepairPriceOverride): Promise<RepairPriceOverride> {
    const sk = data.serviceKey ?? "screen_oem";
    const [byTriple] = await db
      .select()
      .from(repairPriceOverrides)
      .where(
        and(
          eq(repairPriceOverrides.brand, data.brand),
          eq(repairPriceOverrides.modelSlug, data.modelSlug),
          eq(repairPriceOverrides.serviceKey, sk)
        )
      )
      .limit(1);
    if (byTriple) {
      const [r] = await db
        .update(repairPriceOverrides)
        .set({
          price: data.price,
          externalSku: data.externalSku ?? byTriple.externalSku,
          purchaseCost: data.purchaseCost ?? null,
          supplierId: data.supplierId ?? null,
          updatedAt: new Date(),
        })
        .where(eq(repairPriceOverrides.id, byTriple.id))
        .returning();
      return r!;
    }
    const [created] = await db
      .insert(repairPriceOverrides)
      .values({ ...data, serviceKey: sk })
      .returning();
    return created;
  }
}

export const storage = new DatabaseStorage();

