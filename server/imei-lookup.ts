import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path";
import type { ImeiLookupSuccess } from "@shared/imei-lookup";

const IMEI_INFO_ENDPOINT = "https://apiv4.imei.info/imei_api.php";

/** Community TAC DB (updated regularly). Used as free fallback when no paid IMEI API key is set. */
const TAC_CSV_URL =
  process.env.IMEI_TAC_CSV_URL?.trim() ||
  "https://raw.githubusercontent.com/MoazEb/tac-database/main/tac_full.csv";
const TAC_CACHE_DIR = path.join(process.cwd(), "server", "data");
const TAC_CACHE_PATH = path.join(TAC_CACHE_DIR, "tac_full.csv");
/** Seeded + learned TAC rows (newer devices missing from the community CSV). */
const TAC_OVERRIDES_PATH = path.join(TAC_CACHE_DIR, "tac_overrides.json");
const TAC_LEARNED_PATH = path.join(TAC_CACHE_DIR, "tac_learned.json");
/** Refresh cached CSV after 7 days */
const TAC_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
/** Live lookup via Jina reader → fccid.io when local DB misses a TAC. */
const FCCID_PROXY =
  process.env.IMEI_FCCID_PROXY_URL?.trim() || "https://r.jina.ai/https://fccid.io/TAC/{tac}";

type TacEntry = { brand: string; specs: string };

let tacMap: Map<string, TacEntry> | null = null;
let tacLoadPromise: Promise<Map<string, TacEntry>> | null = null;

function pickStr(obj: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() && String(v) !== "undefined") return String(v).trim();
  }
  return "";
}

function parseFindMy(text: string): string {
  const t = text.replace(/\s+/g, " ");
  const m =
    /Find My (?:iPhone|iPad|Mac)?\s*:\s*(ON|OFF)/i.exec(t) ||
    /Find My\s*:\s*(ON|OFF)/i.exec(t) ||
    /\bFMI\b\s*:\s*(ON|OFF)/i.exec(t) ||
    /\biCloud\b[^.\n]{0,40}\b(ON|OFF)\b/i.exec(t);
  if (!m) return "—";
  return m[1].toUpperCase() === "ON" ? "ON (Find My)" : "OFF";
}

function parseWarranty(text: string): string {
  const t = text.replace(/\s+/g, " ");
  const m =
    /(?:warranty|εγγύηση|applecare)[^\n:]{0,20}[:]\s*([^\n]+)/i.exec(t) ||
    /\b(Active|Inactive|Expired|Out Of Warranty|Valid)\b/i.exec(t);
  if (m) return (m[1] ?? m[0]).trim().slice(0, 120);
  return "—";
}

function parseModel(text: string, fallbackObj: Record<string, unknown>): string {
  const direct = pickStr(fallbackObj, [
    "model",
    "model_name",
    "modelName",
    "device",
    "device_name",
    "name",
    "product",
    "phoneModel",
  ]);
  if (direct) return direct.slice(0, 200);
  const t = text.replace(/\s+/g, " ");
  const m =
    /(?:model|μοντέλο|device)\s*[:]\s*([^\n]+)/i.exec(text) ||
    /(iPhone\s+[\w\s\+]+(?:Pro\s+Max|Pro|Plus|mini|Max)?)/i.exec(t) ||
    /(iPad\s+[\w\s\+]+)/i.exec(t) ||
    /(Apple Watch[^\n]{0,40})/i.exec(t) ||
    /(MacBook\s+[\w\s]+)/i.exec(t);
  if (m) return (m[1] ?? m[0]).trim().slice(0, 200);
  const firstLine = text.split(/\r?\n/).map((l) => l.trim()).find(Boolean);
  if (firstLine && firstLine.length < 180) return firstLine;
  return text.trim().slice(0, 200) || "—";
}

function deepMergeRead(obj: unknown, keys: string[]): string {
  if (!obj || typeof obj !== "object") return "";
  const o = obj as Record<string, unknown>;
  const direct = pickStr(o, keys);
  if (direct) return direct;
  for (const v of Object.values(o)) {
    if (v && typeof v === "object") {
      const inner = deepMergeRead(v, keys);
      if (inner) return inner;
    }
  }
  return "";
}

function normalizeUpstreamJson(data: unknown, imei: string): ImeiLookupSuccess {
  if (typeof data !== "object" || data === null) {
    throw new Error("Άκυρη απάντηση παρόχου");
  }
  const obj = data as Record<string, unknown>;
  const status = String(obj.status ?? "").toLowerCase();
  if (status === "error" || status === "failed") {
    throw new Error(String(obj.status_msg ?? obj.message ?? obj.error ?? "Αποτυχία ελέγχου IMEI"));
  }

  let resultText = typeof obj.result === "string" ? obj.result : "";
  if (obj.result_json != null) {
    if (typeof obj.result_json === "object") {
      const nested = obj.result_json as Record<string, unknown>;
      const model = deepMergeRead(nested, ["model", "model_name", "name", "device"]) || parseModel(resultText, nested);
      const rawIcloud = deepMergeRead(nested, ["icloud", "fmi", "find_my_iphone", "findMyIphone", "findMy"]);
      let icloud = "—";
      if (rawIcloud) {
        const u = rawIcloud.toUpperCase();
        if (/\bON\b|TRUE|1|YES|ENABLED/.test(u)) icloud = "ON (Find My)";
        else if (/\bOFF\b|FALSE|0|NO|DISABLED/.test(u)) icloud = "OFF";
        else icloud = rawIcloud.slice(0, 80);
      } else icloud = parseFindMy(resultText);
      const rawWar = deepMergeRead(nested, ["warranty", "warranty_status", "applecare", "coverage", "warrantyStatus"]);
      const warranty = rawWar || parseWarranty(resultText);
      return {
        ok: true,
        imei,
        model: model || parseModel(resultText, obj),
        icloud,
        warranty,
        tac: imei.slice(0, 8),
        details: resultText.trim() || undefined,
        provider: "imei_info_v4",
      };
    }
    if (typeof obj.result_json === "string") {
      try {
        const parsed = JSON.parse(obj.result_json) as Record<string, unknown>;
        return normalizeUpstreamJson({ ...obj, result_json: parsed, result: resultText }, imei);
      } catch {
        /* fall through */
      }
    }
  }

  const model = parseModel(resultText, obj);
  const icloud = parseFindMy(resultText);
  const warranty = parseWarranty(resultText);

  return {
    ok: true,
    imei,
    model,
    icloud,
    warranty,
    tac: imei.slice(0, 8),
    details: resultText.trim() || undefined,
    provider: "imei_info_v4",
  };
}

/** GET with {imei} and {key} placeholders, optional {service}. */
async function fetchCustomTemplate(imei: string): Promise<ImeiLookupSuccess> {
  const template = process.env.IMEI_LOOKUP_URL_TEMPLATE?.trim();
  const key = process.env.IMEI_LOOKUP_API_KEY ?? "";
  if (!template) throw new Error("IMEI_LOOKUP_URL_TEMPLATE not set");

  const url = template
    .replace(/\{imei\}/g, encodeURIComponent(imei))
    .replace(/\{key\}/g, encodeURIComponent(key))
    .replace(/\{service\}/g, encodeURIComponent(process.env.IMEI_INFO_SERVICE_ID ?? "1"));

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  const normalized = normalizeUpstreamJson(data, imei);
  return { ...normalized, provider: "custom_url" };
}

async function fetchImeiInfoV4(imei: string): Promise<ImeiLookupSuccess> {
  const key = process.env.IMEI_INFO_API_KEY?.trim();
  const serviceId = process.env.IMEI_INFO_SERVICE_ID?.trim() ?? "1";
  if (!key) throw new Error("IMEI_INFO_API_KEY not configured");

  const url = new URL(IMEI_INFO_ENDPOINT);
  url.searchParams.set("format", "json");
  url.searchParams.set("key", key);
  url.searchParams.set("imei", imei);
  url.searchParams.set("service", serviceId);

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(25_000),
  });
  if (!res.ok) throw new Error(`IMEI API HTTP ${res.status}`);
  const data: unknown = await res.json();
  return normalizeUpstreamJson(data, imei);
}

function cacheIsFresh(filePath: string): boolean {
  try {
    const st = statSync(filePath);
    return st.size > 1_000_000 && Date.now() - st.mtimeMs < TAC_CACHE_MAX_AGE_MS;
  } catch {
    return false;
  }
}

async function downloadTacCsv(dest: string): Promise<void> {
  mkdirSync(path.dirname(dest), { recursive: true });
  const res = await fetch(TAC_CSV_URL, {
    headers: { "User-Agent": "HiTechDoctor-IMEI/1.0" },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    throw new Error(`Αποτυχία λήψης TAC DB (HTTP ${res.status})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1_000_000) {
    throw new Error("Αποτυχία λήψης TAC DB (άκυρο μέγεθος αρχείου)");
  }
  const tmp = `${dest}.tmp`;
  writeFileSync(tmp, buf);
  renameSync(tmp, dest);
}

function parseTacCsv(text: string): Map<string, TacEntry> {
  const map = new Map<string, TacEntry>();
  const lines = text.split(/\r?\n/);
  // Brand,TAC,SPECS — SPECS may contain commas inside quotes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const firstComma = line.indexOf(",");
    if (firstComma < 0) continue;
    const secondComma = line.indexOf(",", firstComma + 1);
    if (secondComma < 0) continue;
    const brand = line.slice(0, firstComma).trim();
    const tac = line.slice(firstComma + 1, secondComma).trim();
    let specs = line.slice(secondComma + 1).trim();
    if (specs.startsWith('"') && specs.endsWith('"')) {
      specs = specs.slice(1, -1).replace(/""/g, '"');
    }
    if (/^\d{8}$/.test(tac) && brand) {
      map.set(tac, { brand, specs });
    }
  }
  return map;
}

async function readJsonTacFile(filePath: string): Promise<Map<string, TacEntry>> {
  const map = new Map<string, TacEntry>();
  if (!existsSync(filePath)) return map;
  try {
    const raw = JSON.parse(await readFile(filePath, "utf8")) as Record<
      string,
      { brand?: string; specs?: string }
    >;
    for (const [tac, v] of Object.entries(raw)) {
      if (/^\d{8}$/.test(tac) && v?.brand) {
        map.set(tac, { brand: String(v.brand), specs: String(v.specs ?? v.brand) });
      }
    }
  } catch (err) {
    console.warn("[imei] Failed to read", filePath, err);
  }
  return map;
}

function rememberLearnedTac(tac: string, entry: TacEntry): void {
  try {
    mkdirSync(TAC_CACHE_DIR, { recursive: true });
    let existing: Record<string, TacEntry> = {};
    if (existsSync(TAC_LEARNED_PATH)) {
      existing = JSON.parse(readFileSync(TAC_LEARNED_PATH, "utf8")) as Record<string, TacEntry>;
    }
    existing[tac] = entry;
    writeFileSync(TAC_LEARNED_PATH, JSON.stringify(existing, null, 2) + "\n", "utf8");
    tacMap?.set(tac, entry);
  } catch (err) {
    console.warn("[imei] Failed to persist learned TAC:", err);
  }
}

async function loadTacMap(): Promise<Map<string, TacEntry>> {
  if (tacMap) return tacMap;
  if (tacLoadPromise) return tacLoadPromise;

  tacLoadPromise = (async () => {
    if (!cacheIsFresh(TAC_CACHE_PATH)) {
      try {
        console.log("[imei] Downloading TAC database…");
        await downloadTacCsv(TAC_CACHE_PATH);
        console.log("[imei] TAC database cached at", TAC_CACHE_PATH);
      } catch (err) {
        if (!existsSync(TAC_CACHE_PATH)) {
          throw err instanceof Error
            ? err
            : new Error("Αδυναμία λήψης βάσης TAC");
        }
        console.warn("[imei] TAC download failed, using existing cache:", err);
      }
    }
    const text = await readFile(TAC_CACHE_PATH, "utf8");
    const map = parseTacCsv(text);
    if (map.size < 1000) {
      throw new Error("Η βάση TAC φαίνεται άκυρη ή κενή");
    }
    const overrides = await readJsonTacFile(TAC_OVERRIDES_PATH);
    const learned = await readJsonTacFile(TAC_LEARNED_PATH);
    for (const [tac, entry] of overrides) map.set(tac, entry);
    for (const [tac, entry] of learned) map.set(tac, entry);
    tacMap = map;
    return map;
  })().finally(() => {
    tacLoadPromise = null;
  });

  return tacLoadPromise;
}

/** Prefer marketing name from SPECS, e.g. "Apple iPhone 13 Mini". */
function formatTacModel(brand: string, specs: string): string {
  const parts = specs.split(",").map((s) => s.trim()).filter(Boolean);
  const marketing = parts.find(
    (p) =>
      /iPhone|iPad|Galaxy|Pixel|Redmi|Huawei|Xiaomi|OnePlus|Motorola|Nokia/i.test(p) &&
      /[a-z]/.test(p),
  );
  if (marketing) return marketing.slice(0, 200);
  if (parts[0]) {
    const titled = parts[0]
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/\bIphone\b/g, "iPhone")
      .replace(/\bIpad\b/g, "iPad")
      .replace(/\bSamsung\b/g, "Samsung")
      .replace(/\bGalaxy\b/g, "Galaxy");
    if (/^samsung\b/i.test(brand) && !/^samsung\b/i.test(titled)) {
      return `Samsung ${titled}`.slice(0, 200);
    }
    return titled.slice(0, 200);
  }
  return brand.slice(0, 200) || "—";
}

/** Live TAC lookup when the community CSV is behind (new Galaxy / iPhone models). */
async function fetchFccidTac(tac: string): Promise<TacEntry | null> {
  const url = FCCID_PROXY.replace(/\{tac\}/g, encodeURIComponent(tac));
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "text/plain,text/markdown,*/*",
        "User-Agent": "HiTechDoctor-IMEI/1.0",
      },
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) return null;
    const text = await res.text();
    const brand =
      /\*\*Brand\*\*\s*([A-Z0-9][A-Z0-9 &.+-]{1,40})/i.exec(text)?.[1]?.trim() ||
      /Brand\*\*\s*([A-Z0-9][A-Z0-9 &.+-]{1,40})/i.exec(text)?.[1]?.trim() ||
      /Brand\s+([A-Z][A-Z0-9 &.+-]{1,40})\s/i.exec(text)?.[1]?.trim();
    const model =
      /\*\*Model\*\*\s*([^\n*]{2,80})/i.exec(text)?.[1]?.trim() ||
      /Model\*\*\s*([^\n*]{2,80})/i.exec(text)?.[1]?.trim() ||
      /Model\s+([A-Z0-9][^\n*]{2,80})/i.exec(text)?.[1]?.trim();
    if (!brand || !model) return null;
    if (/not found|unknown|security check/i.test(brand + model)) return null;
    const cleanModel = model.replace(/\*+/g, "").trim();
    const cleanBrand = brand.replace(/\*+/g, "").trim();
    const specs = `${cleanBrand} ${cleanModel}`.replace(/\s+/g, " ").trim();
    return { brand: cleanBrand, specs };
  } catch (err) {
    console.warn("[imei] fccid TAC lookup failed:", err);
    return null;
  }
}

async function resolveTacEntry(tac: string): Promise<TacEntry | null> {
  const map = await loadTacMap();
  const local = map.get(tac);
  if (local) return local;
  const live = await fetchFccidTac(tac);
  if (live) {
    rememberLearnedTac(tac, live);
    return live;
  }
  return null;
}

async function fetchTacFallback(imei: string): Promise<ImeiLookupSuccess> {
  const tac = imei.slice(0, 8);
  const hit = await resolveTacEntry(tac);
  if (!hit) {
    throw new Error(
      `Δεν βρέθηκε μοντέλο για TAC ${tac}. Δοκιμάστε άλλο IMEI ή ρυθμίστε IMEI_INFO_API_KEY για πλήρη έλεγχο (iCloud/εγγύηση).`,
    );
  }
  const model = formatTacModel(hit.brand, hit.specs);
  return {
    ok: true,
    imei,
    model,
    icloud: "—",
    warranty: "—",
    tac,
    details: `TAC lookup (δωρεάν): ${hit.brand} — ${hit.specs}\n\nΓια κατάσταση iCloud/Find My και εγγύηση, ρυθμίστε IMEI_INFO_API_KEY (IMEI.info) στο .env του server.`,
    provider: "tac_db",
  };
}

export async function runImeiLookup(imeiDigits: string): Promise<ImeiLookupSuccess> {
  const imei = imeiDigits.replace(/\D/g, "");
  if (imei.length !== 15) {
    throw new Error("Απαιτείται έγκυρο IMEI 15 ψηφίων");
  }

  if (process.env.IMEI_LOOKUP_URL_TEMPLATE?.trim()) {
    return fetchCustomTemplate(imei);
  }
  if (process.env.IMEI_INFO_API_KEY?.trim()) {
    return fetchImeiInfoV4(imei);
  }
  // Free model identification via TAC database (no API key required)
  return fetchTacFallback(imei);
}
