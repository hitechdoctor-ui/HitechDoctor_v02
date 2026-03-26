import 'dotenv/config'; 
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { exec } from "node:child_process";
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

app.use(compression({ level: 6, threshold: 1024 }));

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

async function checkSubscriptionExpiry() {
  try {
    log("[subscriptions] Running expiry check...", "cron");
    const in30 = await storage.getExpiringSubscriptions(33);
    for (const sub of in30) {
      const now = new Date();
      const renewal = new Date(sub.renewalDate);
      const daysLeft = Math.ceil((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30 && !sub.notifiedMonthBefore) {
        await sendSubscriptionRenewalEmail(sub, daysLeft);
        await storage.updateSubscription(sub.id, { notifiedMonthBefore: true });
        log(`[subscriptions] 30-day notice sent for sub #${sub.id}`, "cron");
      }
    }
    log("[subscriptions] Expiry check complete.", "cron");
  } catch (err) {
    console.error("[subscriptions] Expiry check error:", err);
  }
}

(async () => {
  try {
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Error:", err);
      if (res.headersSent) return next(err);
      res.status(status).json({ message });
    });

    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    /**
     * ΡΥΘΜΙΣΗ ΓΙΑ RAILWAY & LOCAL
     * Χρησιμοποιούμε τη θύρα που δίνει το περιβάλλον (Railway) ή την 5000/5173
     */
    const port = Number(process.env.PORT) || 8080;
    
    // Στο production (Railway) χρησιμοποιούμε 0.0.0.0 για να δέχεται εξωτερική κίνηση
    const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "::";

    httpServer.listen(
      {
        port,
        host,
        ipv6Only: false,
      },
      () => {
        log(`serving on port ${port} — Host: ${host}`);
        
        // Άνοιγμα browser μόνο τοπικά
        if (process.env.NODE_ENV === "development" && process.env.OPEN_BROWSER !== "0") {
          const url = `http://localhost:${port}`;
          const openCmd =
            process.platform === "win32"
              ? `start "" "${url}"`
              : process.platform === "darwin"
                ? `open "${url}"`
                : `xdg-open "${url}"`;
          exec(openCmd, () => {});
        }
        
        seedProductsIfEmpty();
        seedAdminIfEmpty();
        checkSubscriptionExpiry();
        setInterval(checkSubscriptionExpiry, 24 * 60 * 60 * 1000);
      }
    );
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();