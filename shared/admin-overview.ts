import { z } from "zod";

export const adminOverviewPeriodSchema = z.enum(["day", "week", "month"]);
export type AdminOverviewPeriod = z.infer<typeof adminOverviewPeriodSchema>;

export const adminOverviewKpiSchema = z.object({
  repairsToday: z.number().int().nonnegative(),
  repairsTodayPrev: z.number().int().nonnegative(),
  repairsPending: z.number().int().nonnegative(),
  unreadMessages: z.number().int().nonnegative(),
  unreadMessagesPrev: z.number().int().nonnegative(),
  repairsInProgress: z.number().int().nonnegative(),
  repairsReady: z.number().int().nonnegative(),
  ordersToday: z.number().int().nonnegative(),
  ordersTodayPrev: z.number().int().nonnegative(),
  monthRevenue: z.number().nonnegative(),
  monthRevenuePrev: z.number().nonnegative(),
});

export const adminOverviewActionSchema = z.object({
  id: z.string(),
  kind: z.enum(["repair_pending", "repair_ready", "order_pending", "message_pending"]),
  title: z.string(),
  subtitle: z.string(),
  href: z.string(),
  actionLabel: z.string(),
  createdAt: z.string().nullable(),
});

export const adminOverviewAnalyticsDaySchema = z.object({
  date: z.string(),
  visits: z.number().int().nonnegative(),
  chat: z.number().int().nonnegative(),
});

export const adminOverviewAnalyticsSchema = z.object({
  visitsToday: z.number().int().nonnegative(),
  visitsYesterday: z.number().int().nonnegative(),
  visitsWeek: z.number().int().nonnegative(),
  visitsMonth: z.number().int().nonnegative(),
  chatToday: z.number().int().nonnegative(),
  daily: z.array(adminOverviewAnalyticsDaySchema),
  topPages: z.array(
    z.object({
      path: z.string(),
      label: z.string(),
      count: z.number().int().nonnegative(),
    }),
  ),
});

export const adminOverviewGa4Schema = z.object({
  configured: z.boolean(),
  activeUsers: z.number().int().nonnegative().optional(),
  screenPageViews: z.number().int().nonnegative().optional(),
  propertyId: z.string().optional(),
});

export const adminOverviewResponseSchema = z.object({
  generatedAt: z.string(),
  kpi: adminOverviewKpiSchema,
  actions: z.array(adminOverviewActionSchema).max(8),
  analytics: adminOverviewAnalyticsSchema.nullable(),
  ga4: adminOverviewGa4Schema.nullable(),
  canViewFinancials: z.boolean(),
});

export type AdminOverviewResponse = z.infer<typeof adminOverviewResponseSchema>;
export type AdminOverviewKpi = z.infer<typeof adminOverviewKpiSchema>;
export type AdminOverviewAction = z.infer<typeof adminOverviewActionSchema>;

/** Φιλικά ονόματα διαδρομών για Top σελίδες */
export function friendlyAnalyticsPathLabel(path: string): string {
  const raw = (path || "/").trim() || "/";
  const p = raw.split("?")[0] || "/";
  const map: Record<string, string> = {
    "/": "Αρχική",
    "/services": "Υπηρεσίες",
    "/services/episkeui-kiniton": "Επισκευή κινητών",
    "/services/episkeui-iphone": "Επισκευή iPhone",
    "/services/episkeui-samsung": "Επισκευή Samsung",
    "/services/episkeui-xiaomi": "Επισκευή Xiaomi",
    "/services/episkeui-huawei": "Επισκευή Huawei",
    "/services/episkeui-apple-watch": "Επισκευή Apple Watch",
    "/eshop": "eShop",
    "/contact": "Επικοινωνία",
    "/faq": "Συχνές ερωτήσεις",
    "/about": "Σχετικά",
    "/web-designer": "Κατασκευή ιστοσελίδων",
  };
  if (map[p]) return map[p];
  if (p.startsWith("/eshop/")) return `eShop · ${p.slice(7).replace(/-/g, " ")}`;
  if (p.startsWith("/services/")) return p.slice(10).replace(/-/g, " ");
  if (p.startsWith("/repair/")) return `Επισκευή · ${p.slice(8).replace(/-/g, " ")}`;
  return p.length > 40 ? `${p.slice(0, 37)}…` : p;
}
