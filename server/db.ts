import 'dotenv/config'; // <--- ΠΡΟΣΘΕΣΕ ΑΥΤΗ ΤΗ ΓΡΑΜΜΗ ΠΡΩΤΗ
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: true, 
});

/** Αποφεύγει crash του process σε προσωρινά σφάλματα δικτύου (π.χ. Neon EADDRNOTAVAIL). */
pool.on("error", (err) => {
  console.error("[db] idle client error (pool will reconnect):", err.message);
});

export const db = drizzle(pool, { schema });