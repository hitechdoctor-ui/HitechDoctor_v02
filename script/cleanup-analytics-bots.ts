/**
 * Καθαρισμός site_analytics από bots / crawlers και (προαιρετικά) μη-Ελλάδα.
 *
 * Usage:
 *   npx tsx script/cleanup-analytics-bots.ts              # dry-run (default)
 *   npx tsx script/cleanup-analytics-bots.ts --execute    # διαγραφή
 *   npx tsx script/cleanup-analytics-bots.ts --execute --non-gr
 *
 * Flags:
 *   --execute   Εφαρμογή διαγραφών (χωρίς αυτό: μόνο μέτρηση)
 *   --non-gr    Διαγραφή γραμμών εκτός GR:
 *               - geo_country IS NOT NULL AND upper(geo_country) <> 'GR'
 *               - city/region heuristic (μη-ελληνικές περιοχές)
 *               - επιπλέον: re-lookup distinct client_ip μέσω ipapi.co όταν λείπει country
 *   --no-ip-lookup  Με --non-gr: παράλειψη ipapi re-lookup (μόνο stored country + heuristic)
 *   --bots-only Μόνο UA bots (αγνοεί --non-gr)
 *
 * Limitation: Πριν το migration 0013 δεν αποθηκευόταν country — για παλιές γραμμές
 * χωρίς geo_country χρειάζεται --non-gr (IP re-lookup, rate-limited).
 */
import "dotenv/config";
import { and, ilike, inArray, isNotNull, or, sql } from "drizzle-orm";
import { db, pool } from "../server/db.ts";
import { siteAnalytics } from "../shared/schema.ts";
import {
  DEFAULT_ANALYTICS_BOT_UA_SUBSTRINGS,
  analyticsExcludedUaSubstrings,
  parseAnalyticsExcludedIps,
} from "../server/analytics-filter.ts";
import { lookupGeoForIp } from "../server/analytics-enrichment.ts";

const args = new Set(process.argv.slice(2));
const EXECUTE = args.has("--execute");
const NON_GR = args.has("--non-gr") && !args.has("--bots-only");
const BOTS_ONLY = args.has("--bots-only");
const NO_IP_LOOKUP = args.has("--no-ip-lookup");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function countBotUaRows(): Promise<number> {
  const uaSubs = analyticsExcludedUaSubstrings();
  if (uaSubs.length === 0) return 0;
  const uaConds = uaSubs.map((sub) => ilike(siteAnalytics.userAgent, `%${sub}%`));
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(siteAnalytics)
    .where(or(...uaConds)!);
  return Number(row?.c ?? 0);
}

async function deleteBotUaRows(): Promise<number> {
  const uaSubs = analyticsExcludedUaSubstrings();
  if (uaSubs.length === 0) return 0;
  const uaConds = uaSubs.map((sub) => ilike(siteAnalytics.userAgent, `%${sub}%`));
  const deleted = await db
    .delete(siteAnalytics)
    .where(or(...uaConds)!)
    .returning({ id: siteAnalytics.id });
  return deleted.length;
}

async function countBlankUaRows(): Promise<number> {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(siteAnalytics)
    .where(
      or(
        sql`${siteAnalytics.userAgent} is null`,
        sql`trim(${siteAnalytics.userAgent}) = ''`
      )!
    );
  return Number(row?.c ?? 0);
}

async function deleteBlankUaRows(): Promise<number> {
  const deleted = await db
    .delete(siteAnalytics)
    .where(
      or(
        sql`${siteAnalytics.userAgent} is null`,
        sql`trim(${siteAnalytics.userAgent}) = ''`
      )!
    )
    .returning({ id: siteAnalytics.id });
  return deleted.length;
}

async function countExcludedIpRows(): Promise<number> {
  const ips = parseAnalyticsExcludedIps();
  if (ips.length === 0) return 0;
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(siteAnalytics)
    .where(inArray(siteAnalytics.clientIp, ips));
  return Number(row?.c ?? 0);
}

async function deleteExcludedIpRows(): Promise<number> {
  const ips = parseAnalyticsExcludedIps();
  if (ips.length === 0) return 0;
  const deleted = await db
    .delete(siteAnalytics)
    .where(inArray(siteAnalytics.clientIp, ips))
    .returning({ id: siteAnalytics.id });
  return deleted.length;
}

async function countStoredNonGr(): Promise<number> {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(siteAnalytics)
    .where(
      and(
        isNotNull(siteAnalytics.geoCountry),
        sql`upper(${siteAnalytics.geoCountry}) <> 'GR'`
      )!
    );
  return Number(row?.c ?? 0);
}

async function deleteStoredNonGr(): Promise<number> {
  const deleted = await db
    .delete(siteAnalytics)
    .where(
      and(isNotNull(siteAnalytics.geoCountry), sql`upper(${siteAnalytics.geoCountry}) <> 'GR'`)!
    )
    .returning({ id: siteAnalytics.id });
  return deleted.length;
}

/**
 * Fallback όταν το ipapi δεν επιστρέφει country: γνωστές ελληνικές περιοχές (ipapi English names).
 * Αν υπάρχει geo_region και δεν ταιριάζει → θεωρείται εκτός GR.
 */
const GREECE_REGION_SUBSTRINGS = [
  "attica",
  "macedonia",
  "thrace",
  "thessaly",
  "epirus",
  "ionian",
  "greece",
  "peloponnese",
  "aegean",
  "crete",
  "athos",
  "αττικ",
  "μακεδον",
  "θρακ",
  "θεσσαλ",
  "ηπειρ",
  "πελοπονν",
  "αιγαι",
  "κρητ",
];

function looksLikeGreeceRegion(region: string | null | undefined): boolean {
  if (!region || !region.trim()) return false;
  const r = region.toLowerCase();
  return GREECE_REGION_SUBSTRINGS.some((s) => r.includes(s));
}

async function cleanupNonGrByCityRegionHeuristic(execute: boolean): Promise<number> {
  // Γραμμές με πόλη/περιοχή που δεν μοιάζουν ελληνικές
  const rows = await db
    .select({
      id: siteAnalytics.id,
      city: siteAnalytics.geoCity,
      region: siteAnalytics.geoRegion,
    })
    .from(siteAnalytics)
    .where(
      and(
        or(isNotNull(siteAnalytics.geoCity), isNotNull(siteAnalytics.geoRegion))!,
        or(sql`${siteAnalytics.geoCountry} is null`, sql`trim(${siteAnalytics.geoCountry}) = ''`)!
      )!
    );

  const nonGrIds: number[] = [];
  for (const row of rows) {
    const hasRegion = !!(row.region && row.region.trim());
    const hasCity = !!(row.city && row.city.trim());
    if (!hasRegion && !hasCity) continue;
    if (hasRegion && looksLikeGreeceRegion(row.region)) continue;
    if (!hasRegion && hasCity) {
      // Πόλη χωρίς region — κράτα μόνο αν η πόλη είναι εμφανώς ελληνική (ασαφές· skip)
      continue;
    }
    // Region υπάρχει και δεν είναι ελληνική
    if (hasRegion && !looksLikeGreeceRegion(row.region)) {
      nonGrIds.push(row.id);
    }
  }

  console.log(`[cleanup] city/region heuristic non-GR candidates: ${nonGrIds.length}`);
  if (nonGrIds.length === 0) return 0;
  if (!execute) return nonGrIds.length;

  // Chunk deletes
  let deleted = 0;
  const chunk = 500;
  for (let i = 0; i < nonGrIds.length; i += chunk) {
    const slice = nonGrIds.slice(i, i + chunk);
    const res = await db
      .delete(siteAnalytics)
      .where(inArray(siteAnalytics.id, slice))
      .returning({ id: siteAnalytics.id });
    deleted += res.length;
  }
  return deleted;
}

/** Re-lookup IPs χωρίς geo_country· διαγράφει γραμμές με country ≠ GR. */
async function cleanupNonGrByIpLookup(execute: boolean): Promise<{
  ipsChecked: number;
  nonGrIps: number;
  rowsAffected: number;
  countriesResolved: number;
}> {
  const rows = await db
    .selectDistinct({ ip: siteAnalytics.clientIp })
    .from(siteAnalytics)
    .where(
      and(
        isNotNull(siteAnalytics.clientIp),
        or(sql`${siteAnalytics.geoCountry} is null`, sql`trim(${siteAnalytics.geoCountry}) = ''`)!
      )!
    );

  const ips = rows.map((r) => r.ip).filter((ip): ip is string => !!ip && ip.trim().length > 0);
  const nonGrIps: string[] = [];
  let checked = 0;
  let countriesResolved = 0;

  console.log(`[cleanup] IP re-lookup για ${ips.length} distinct IPs χωρίς country (ipapi.co)…`);
  for (const ip of ips) {
    checked++;
    try {
      const g = await lookupGeoForIp(ip);
      if (g.country) {
        countriesResolved++;
        if (g.country !== "GR") {
          nonGrIps.push(ip);
          console.log(`  non-GR ${ip} → ${g.country}`);
        } else if (execute) {
          await db
            .update(siteAnalytics)
            .set({ geoCountry: "GR" })
            .where(
              and(
                sql`${siteAnalytics.clientIp} = ${ip}`,
                or(
                  sql`${siteAnalytics.geoCountry} is null`,
                  sql`trim(${siteAnalytics.geoCountry}) = ''`
                )!
              )!
            );
        }
      }
    } catch (e) {
      console.warn(`  lookup failed ${ip}:`, e instanceof Error ? e.message : e);
    }
    // Soft rate-limit για free ipapi tier
    await sleep(350);
    if (checked % 40 === 0) console.log(`  … ${checked}/${ips.length}`);
  }

  let rowsAffected = 0;
  if (nonGrIps.length > 0) {
    if (execute) {
      const deleted = await db
        .delete(siteAnalytics)
        .where(inArray(siteAnalytics.clientIp, nonGrIps))
        .returning({ id: siteAnalytics.id });
      rowsAffected = deleted.length;
    } else {
      const [row] = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(siteAnalytics)
        .where(inArray(siteAnalytics.clientIp, nonGrIps));
      rowsAffected = Number(row?.c ?? 0);
    }
  }

  return { ipsChecked: checked, nonGrIps: nonGrIps.length, rowsAffected, countriesResolved };
}

async function main() {
  console.log(
    `[cleanup-analytics] mode=${EXECUTE ? "EXECUTE" : "DRY-RUN"} bots=${!BOTS_ONLY || true} nonGr=${NON_GR}`
  );
  console.log(
    `[cleanup-analytics] default bot UA tokens: ${DEFAULT_ANALYTICS_BOT_UA_SUBSTRINGS.length} (+ env extras)`
  );

  const botCount = await countBotUaRows();
  const blankUa = await countBlankUaRows();
  const exclIp = await countExcludedIpRows();
  console.log(`[cleanup] bot UA rows:     ${botCount}`);
  console.log(`[cleanup] blank/null UA:   ${blankUa}`);
  console.log(`[cleanup] excluded IPs:    ${exclIp}`);

  let deletedBots = 0;
  let deletedBlank = 0;
  let deletedIps = 0;
  if (EXECUTE) {
    deletedBots = await deleteBotUaRows();
    deletedBlank = await deleteBlankUaRows();
    deletedIps = await deleteExcludedIpRows();
    console.log(`[cleanup] deleted bot UA:   ${deletedBots}`);
    console.log(`[cleanup] deleted blank UA: ${deletedBlank}`);
    console.log(`[cleanup] deleted excl IP:  ${deletedIps}`);
  }

  let nonGrStored = 0;
  let nonGrDeleted = 0;
  let heuristicDeleted = 0;
  let ipLookup: Awaited<ReturnType<typeof cleanupNonGrByIpLookup>> | null = null;

  if (NON_GR) {
    nonGrStored = await countStoredNonGr();
    console.log(`[cleanup] stored non-GR (geo_country): ${nonGrStored}`);
    if (EXECUTE) {
      nonGrDeleted = await deleteStoredNonGr();
      console.log(`[cleanup] deleted stored non-GR: ${nonGrDeleted}`);
    }
    // Heuristic πρώτα (χωρίς API) — καθαρίζει California/Illinois/κ.λπ. από παλιά geo_city/region
    heuristicDeleted = await cleanupNonGrByCityRegionHeuristic(EXECUTE);
    console.log(
      `[cleanup] city/region heuristic: ${heuristicDeleted}${EXECUTE ? " deleted" : " would delete"}`
    );

    if (NO_IP_LOOKUP) {
      console.log("[cleanup] skipped IP re-lookup (--no-ip-lookup)");
    } else {
      ipLookup = await cleanupNonGrByIpLookup(EXECUTE);
      console.log(
        `[cleanup] IP lookup: checked=${ipLookup.ipsChecked} resolved=${ipLookup.countriesResolved} nonGrIps=${ipLookup.nonGrIps} rows=${ipLookup.rowsAffected}${EXECUTE ? " deleted" : " would delete"}`
      );
      if (ipLookup.countriesResolved === 0 && ipLookup.ipsChecked > 0) {
        console.log(
          "[cleanup] NOTE: ipapi δεν επέστρεψε country (πιθανό rate-limit). Χρησιμοποιήθηκε city/region heuristic· νέες εγγραφές θα έχουν geo_country."
        );
      }
    }
  } else {
    console.log(
      "[cleanup] skipped non-GR (πέρασε --non-gr για geo_country + IP re-lookup / city heuristic)."
    );
  }

  const totalTouched =
    deletedBots +
    deletedBlank +
    deletedIps +
    nonGrDeleted +
    heuristicDeleted +
    (ipLookup?.rowsAffected ?? 0);
  const would =
    botCount +
    blankUa +
    exclIp +
    (NON_GR ? nonGrStored + heuristicDeleted + (ipLookup?.rowsAffected ?? 0) : 0);
  console.log(
    EXECUTE
      ? `[cleanup] done. deleted≈${totalTouched}`
      : `[cleanup] dry-run would touch ≈${would} rows. Ξανατρέξε με --execute για διαγραφή.`
  );

  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("[cleanup-analytics] failed:", err);
  try {
    await pool.end();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
