import { BetaAnalyticsDataClient } from "@google-analytics/data";

export type Ga4Period = "day" | "week" | "month" | "year";

export type Ga4SummaryResult = {
  configured: boolean;
  period?: Ga4Period;
  activeUsers?: number;
  screenPageViews?: number;
  propertyId?: string;
  /** Όταν λείπει ρύθμιση */
  reason?: string;
  /** Σφάλμα κλήσης Data API */
  error?: string;
};

function createClient(): BetaAnalyticsDataClient | null {
  const inline = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (inline) {
    try {
      const credentials = JSON.parse(inline) as Record<string, unknown>;
      return new BetaAnalyticsDataClient({ credentials });
    } catch {
      return null;
    }
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()) {
    try {
      return new BetaAnalyticsDataClient();
    } catch {
      return null;
    }
  }
  return null;
}

function dateRangeForPeriod(period: Ga4Period): { startDate: string; endDate: string } {
  switch (period) {
    case "day":
      return { startDate: "today", endDate: "today" };
    case "week":
      return { startDate: "7daysAgo", endDate: "today" };
    case "month":
      return { startDate: "30daysAgo", endDate: "today" };
    case "year":
      return { startDate: "365daysAgo", endDate: "today" };
    default:
      return { startDate: "7daysAgo", endDate: "today" };
  }
}

/**
 * Απαιτεί: GA4_PROPERTY_ID (αριθμός property, όχι G-xxx) + GOOGLE_APPLICATION_CREDENTIALS ή GA4_SERVICE_ACCOUNT_JSON.
 * Στο GA4: Admin → Property access → προσθέστε το service account ως Viewer.
 */
export async function fetchGa4Summary(period: Ga4Period): Promise<Ga4SummaryResult> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  if (!propertyId || !/^\d+$/.test(propertyId)) {
    return { configured: false, reason: "GA4_PROPERTY_ID not set (numeric Property ID from GA4 Admin)" };
  }

  const client = createClient();
  if (!client) {
    return {
      configured: false,
      reason: "Set GA4_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS for the Data API",
    };
  }

  const { startDate, endDate } = dateRangeForPeriod(period);
  const property = `properties/${propertyId}`;

  try {
    const [response] = await client.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
    });

    const row = response.rows?.[0];
    const metricValues = row?.metricValues ?? [];
    const activeUsers = Number(metricValues[0]?.value ?? 0) || 0;
    const screenPageViews = Number(metricValues[1]?.value ?? 0) || 0;

    return {
      configured: true,
      period,
      activeUsers,
      screenPageViews,
      propertyId,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { configured: true, period, error: msg, propertyId };
  }
}

