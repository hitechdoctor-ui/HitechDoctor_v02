import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { storage } from "./storage";
import { sendSubscriptionRenewalEmail } from "./email";
import { seedProductsIfEmpty, seedAdminIfEmpty } from "./seed";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// ── Subscription expiry check (runs every 24 hours) ──────────────────────────
async function checkSubscriptionExpiry() {
  try {
    log("[subscriptions] Running expiry check...", "cron");

    // Check subscriptions expiring in ~30 days (27–33 day window)
    const in30 = await storage.getExpiringSubscriptions(33);
    for (const sub of in30) {
      const now = new Date();
      const renewal = new Date(sub.renewalDate);
      const daysLeft = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 30 && !sub.notifiedMonthBefore) {
        await sendSubscriptionRenewalEmail(sub, daysLeft);
        await storage.updateSubscription(sub.id, { notifiedMonthBefore: true });
        log(`[subscriptions] 30-day notice sent for sub #${sub.id} (${sub.customerName})`, "cron");
      }
    }

    // Check subscriptions expiring in ~10 days (7–12 day window)
    const in10 = await storage.getExpiringSubscriptions(12);
    for (const sub of in10) {
      const now = new Date();
      const renewal = new Date(sub.renewalDate);
      const daysLeft = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 10 && !sub.notifiedTenDaysBefore) {
        await sendSubscriptionRenewalEmail(sub, daysLeft);
        await storage.updateSubscription(sub.id, { notifiedTenDaysBefore: true });
        log(`[subscriptions] 10-day notice sent for sub #${sub.id} (${sub.customerName})`, "cron");
      }
    }

    log("[subscriptions] Expiry check complete.", "cron");
  } catch (err) {
    console.error("[subscriptions] Expiry check error:", err);
  }
}

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
      // Auto-seed products if table is empty (first deployment)
      seedProductsIfEmpty();
      // Auto-seed superadmin if no admin users exist
      seedAdminIfEmpty();
      // Run subscription check on startup and then every 24 hours
      checkSubscriptionExpiry();
      setInterval(checkSubscriptionExpiry, 24 * 60 * 60 * 1000);
    },
  );
})();
