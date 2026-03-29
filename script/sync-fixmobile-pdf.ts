/**
 * CLI: διαβάζει uploads/fixmobile/fixmobile.pdf και ενημερώνει repair_price_overrides (κατηγορία ανά γραμμή).
 * Απαιτεί DATABASE_URL / σύνδεση στη βάση όπως το κύριο app.
 */
import "dotenv/config";
import { runFixmobilePdfSyncFromDisk } from "../server/fixmobile-sync";

async function main() {
  const r = await runFixmobilePdfSyncFromDisk();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.errors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
