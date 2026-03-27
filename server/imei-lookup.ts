import type { ImeiLookupSuccess } from "@shared/imei-lookup";

const IMEI_INFO_ENDPOINT = "https://apiv4.imei.info/imei_api.php";

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

export async function runImeiLookup(imeiDigits: string): Promise<ImeiLookupSuccess> {
  const imei = imeiDigits.replace(/\D/g, "");
  if (imei.length !== 15) {
    throw new Error("Απαιτείται έγκυρο IMEI 15 ψηφίων");
  }

  const hasCustom = Boolean(process.env.IMEI_LOOKUP_URL_TEMPLATE?.trim());
  const hasImeiInfo = Boolean(process.env.IMEI_INFO_API_KEY?.trim());
  if (!hasCustom && !hasImeiInfo) {
    throw new Error(
      "IMEI API: ρυθμίστε IMEI_INFO_API_KEY (IMEI.info API) ή IMEI_LOOKUP_URL_TEMPLATE στο .env του server"
    );
  }

  if (process.env.IMEI_LOOKUP_URL_TEMPLATE?.trim()) {
    return fetchCustomTemplate(imei);
  }
  return fetchImeiInfoV4(imei);
}
