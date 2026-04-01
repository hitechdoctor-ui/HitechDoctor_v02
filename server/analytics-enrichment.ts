import type { Request } from "express";

/** Cache IP → geo ώστε να μην υπερβαίνουμε τα όρια του δωρεάν ipapi.co */
const GEO_CACHE = new Map<string, { city: string | null; region: string | null; expires: number }>();
const GEO_TTL_MS = 24 * 60 * 60 * 1000;
const GEO_FETCH_TIMEOUT_MS = 2500;

function isPrivateOrLocalIp(ip: string): boolean {
  const s = ip.trim().toLowerCase();
  if (!s) return true;
  if (s === "::1" || s === "127.0.0.1" || s === "localhost" || s === "unknown") return true;
  if (s.startsWith("10.")) return true;
  if (s.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(s)) return true;
  if (s.startsWith("169.254.")) return true;
  if (s.startsWith("fe80:") || s.startsWith("fc") || s.startsWith("fd")) return true;
  return false;
}

export function getClientIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string") {
    const first = xf.split(",")[0]?.trim();
    if (first && !isPrivateOrLocalIp(first)) {
      if (first.startsWith("::ffff:")) return first.slice(7);
      return first;
    }
  }
  const real = req.headers["x-real-ip"];
  if (typeof real === "string") {
    const t = real.trim();
    if (t && !isPrivateOrLocalIp(t)) {
      if (t.startsWith("::ffff:")) return t.slice(7);
      return t;
    }
  }
  const raw = req.socket?.remoteAddress;
  if (raw && !isPrivateOrLocalIp(raw)) {
    if (raw.startsWith("::ffff:")) return raw.slice(7);
    return raw;
  }
  return null;
}

/**
 * Απλό parsing User-Agent (χωρίς εξωτερική βιβλιοθήκη).
 * Στόχος: iOS, Android, Windows, macOS, Linux + κύριοι browsers.
 */
export function parseUserAgent(ua: string | null): { osFamily: string; browserFamily: string } {
  if (!ua || !ua.trim()) return { osFamily: "Άγνωστο", browserFamily: "Άγνωστο" };
  const u = ua;

  let osFamily = "Άλλο";
  if (/iPhone|iPad|iPod/i.test(u)) osFamily = "iOS";
  else if (/Android/i.test(u)) osFamily = "Android";
  else if (/Windows NT|Win64|Win32|Windows Phone/i.test(u)) osFamily = "Windows";
  else if (/Mac OS X|Macintosh/i.test(u) && !/iPhone|iPad|iPod/i.test(u)) osFamily = "macOS";
  else if (/Linux/i.test(u) && !/Android/i.test(u)) osFamily = "Linux";

  let browserFamily = "Άλλο";
  if (/Edg\//i.test(u)) browserFamily = "Edge";
  else if (/OPR\/|Opera/i.test(u)) browserFamily = "Opera";
  else if (/SamsungBrowser/i.test(u)) browserFamily = "Samsung Internet";
  else if (/Firefox|FxiOS/i.test(u)) browserFamily = "Firefox";
  else if (/Chrome|CriOS/i.test(u)) browserFamily = "Chrome";
  else if (/Safari/i.test(u) && !/Chrome|CriOS|Chromium/i.test(u)) browserFamily = "Safari";

  return { osFamily, browserFamily };
}

/** Δωρεάν tier: https://ipapi.co — city + region (πολιτεία/περιοχή) */
export async function lookupGeoForIp(ip: string): Promise<{ city: string | null; region: string | null }> {
  if (isPrivateOrLocalIp(ip)) return { city: null, region: null };

  const now = Date.now();
  const hit = GEO_CACHE.get(ip);
  if (hit && hit.expires > now) return { city: hit.city, region: hit.region };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEO_FETCH_TIMEOUT_MS);
  try {
    const url = `https://ipapi.co/${encodeURIComponent(ip)}/json/`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      GEO_CACHE.set(ip, { city: null, region: null, expires: now + 60 * 60 * 1000 });
      return { city: null, region: null };
    }
    const j = (await res.json()) as Record<string, unknown>;
    if (j.error) {
      GEO_CACHE.set(ip, { city: null, region: null, expires: now + 60 * 60 * 1000 });
      return { city: null, region: null };
    }
    const city = typeof j.city === "string" && j.city.trim() ? j.city.trim() : null;
    const region = typeof j.region === "string" && j.region.trim() ? j.region.trim() : null;
    GEO_CACHE.set(ip, { city, region, expires: now + GEO_TTL_MS });
    return { city, region };
  } catch {
    return { city: null, region: null };
  } finally {
    clearTimeout(timer);
  }
}
