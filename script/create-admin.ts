/**
 * Προσωρινό script: δημιουργία ή ενημέρωση admin χρήστη στη Neon (DATABASE_URL).
 * Τρέξη: npx tsx script/create-admin.ts
 */
import "dotenv/config";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../server/db.ts";
import { adminUsers } from "../shared/schema.ts";

const BCRYPT_ROUNDS = 12;
const EMAIL = "admin@hitech.gr";
const PASSWORD = "admin123";
const NAME = "Admin HiTech";
const ROLE = "admin";

async function main() {
  const hash = await bcrypt.hash(PASSWORD, BCRYPT_ROUNDS);
  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, EMAIL));

  if (existing) {
    await db
      .update(adminUsers)
      .set({ passwordHash: hash, name: NAME, role: ROLE })
      .where(eq(adminUsers.id, existing.id));
    console.log(`[create-admin] Ενημερώθηκε ο χρήστης: ${EMAIL}`);
  } else {
    await db.insert(adminUsers).values({
      name: NAME,
      email: EMAIL,
      passwordHash: hash,
      role: ROLE,
    });
    console.log(`[create-admin] Δημιουργήθηκε admin: ${EMAIL}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("[create-admin] Σφάλμα:", err);
  process.exit(1);
});
