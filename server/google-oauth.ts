/**
 * Google OAuth (passport-google-oauth20) για σύνδεση admin.
 * Railway: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET,
 * GOOGLE_CALLBACK_URL (προαιρετικό), PUBLIC_APP_URL (redirect μετά login).
 */
import type { Express, Request, Response } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import createMemoryStore from "memorystore";
import { Pool } from "pg";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { storage } from "./storage";

const BCRYPT_ROUNDS = 12;
const CALLBACK_PATH = "/api/auth/google/callback";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      role: string;
    }
  }
}

function publicAppBase(): string {
  const explicit = process.env.PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) return `https://${railway}`;
  return "";
}

export function setupGoogleOAuth(app: Express): void {
  const clientID = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const googleEnabled = !!(clientID && clientSecret);

  app.get("/api/auth/google/status", (_req: Request, res: Response) => {
    res.json({ google: googleEnabled });
  });

  if (!googleEnabled) {
    console.warn(
      "[google-oauth] Google σύνδεση απενεργοποιημένη — ορίστε GOOGLE_CLIENT_ID και GOOGLE_CLIENT_SECRET."
    );
    return;
  }

  const sessionSecret =
    process.env.SESSION_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim() ||
    "dev-only-change-SESSION_SECRET";

  if (process.env.NODE_ENV === "production" && sessionSecret === "dev-only-change-SESSION_SECRET") {
    console.warn(
      "[google-oauth] Χρησιμοποιείται αδύναμο SESSION_SECRET — ορίστε SESSION_SECRET στο production."
    );
  }

  const PgStore = connectPgSimple(session);
  const MemoryStore = createMemoryStore(session);

  let store: session.Store;
  if (process.env.DATABASE_URL?.trim()) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    store = new PgStore({
      pool,
      createTableIfMissing: true,
      tableName: "session",
    });
  } else {
    store = new MemoryStore({ checkPeriod: 86_400_000 });
    console.warn("[google-oauth] Χωρίς DATABASE_URL — session σε memory (κατάλληλο μόνο για dev).");
  }

  app.use(
    session({
      store,
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      name: "htd.oauth.sid",
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });
  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });

  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL?.trim() ||
    `${publicAppBase() || "https://hitechdoctor-production.up.railway.app"}${CALLBACK_PATH}`;

  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID!,
        clientSecret: clientSecret!,
        callbackURL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();
          if (!email) return done(new Error("no_email"));

          const name =
            profile.displayName?.trim() ||
            [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(" ").trim() ||
            email.split("@")[0]!;

          let user = await storage.getAdminByEmail(email);
          if (!user) {
            const randomHash = await bcrypt.hash(randomBytes(48).toString("hex"), BCRYPT_ROUNDS);
            await storage.createAdminUser(name, email, randomHash, "admin");
            user = await storage.getAdminByEmail(email);
          }
          if (!user) return done(new Error("provision_failed"));

          done(null, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          });
        } catch (err) {
          done(err as Error);
        }
      }
    )
  );

  app.get(
    "/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: true })
  );

  app.get(
    CALLBACK_PATH,
    passport.authenticate("google", {
      session: true,
      failureRedirect: "/admin?google_error=1",
    }),
    (req: Request, res: Response) => {
      const u = req.user as Express.User | undefined;
      if (!u?.email) {
        res.redirect("/admin?google_error=1");
        return;
      }
      const payload = JSON.stringify({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        ts: Date.now(),
      });
      const token = Buffer.from(payload).toString("base64");
      const base = publicAppBase() || `${req.protocol}://${req.get("host") || ""}`;
      res.redirect(`${base}/admin#hitech_google_auth=${encodeURIComponent(token)}`);
    }
  );
}
