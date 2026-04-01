import 'dotenv/config'; 
import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRedirects } from "./redirects";
import { setupGoogleOAuth } from "./google-oauth";
import { registerViberWebhook, scheduleViberWebhookRegistration } from "./viber";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { exec } from "node:child_process";
import { storage } from "./storage";
import { sendSubscriptionRenewalEmail } from "./email";
import { seedProductsIfEmpty, seedAdminIfEmpty } from "./seed";

const app = express();
/** Για σωστό client IP πίσω από reverse proxy (π.χ. nginx) — χρησιμοποιείται στο analytics geolocation */
app.set("trust proxy", 1);
const httpServer = createServer(app);
/** Πριν το express.json — το Viber HMAC πρέπει να υπολογίζεται στο raw σώμα (βλ. viber-bot middleware). */
registerViberWebhook(app);

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

/** Google OAuth (passport) + session — πριν από τα υπόλοιπα API routes */
setupGoogleOAuth(app);

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
    if (!process.env.OPENAI_API_KEY?.trim()) {
      log(
        "OPENAI_API_KEY λείπει — το AI chat επισκευών (/api/chat/repair-assistant) θα επιστρέφει 503. Ορίστε το στο .env ή στα environment variables του host (Railway/Netlify/VPS).",
        "express"
      );
    }

    registerRedirects(app);
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Internal Error:", err);
      if (res.headersSent) return next(err);
      res.status(status).json({ message });
    });

    // Redirect middleware (registerRedirects) τρέχει πριν από static/Vite — τα GET/HEAD παλιών paths παίρνουν 301 πρώτα.
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

        const viberBase =
          process.env.VIBER_PUBLIC_BASE_URL?.trim() ||
          process.env.PUBLIC_APP_URL?.trim() ||
          process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
        if (viberBase) {
          const origin = viberBase.startsWith("http") ? viberBase : `https://${viberBase}`;
          scheduleViberWebhookRegistration(origin);
        } else if (process.env.VIBER_AUTH_TOKEN?.trim()) {
          log(
            "VIBER_AUTH_TOKEN ορίστηκε αλλά λείπει VIBER_PUBLIC_BASE_URL (ή PUBLIC_APP_URL / RAILWAY_PUBLIC_DOMAIN) — το setWebhook δεν εκτελέστηκε.",
            "express"
          );
        }
        
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