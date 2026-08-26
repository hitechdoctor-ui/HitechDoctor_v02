import manualGroups from "@/data/screenProtectors.json";
import shopGroups from "@/data/screenProtectorShopGroups.json";
import seedProducts from "../../../server/seed-data/products.json";
import { SAMSUNG_SERIES } from "@/data/samsung-devices";
import { XIAOMI_SERIES } from "@/data/xiaomi-devices";
import { HUAWEI_SERIES } from "@/data/huawei-devices";
import { ONEPLUS_SERIES } from "@/data/oneplus-devices";
import { allModels as allIphoneModels } from "@/data/iphone-devices";

export interface ScreenProtectorDevice {
  brand: string;
  model: string;
  aliases?: string[];
}

export interface ScreenProtectorGroup {
  id: string;
  label?: string;
  source?: string;
  screenSize: string;
  screenType: "Flat" | "Curved" | "Foldable";
  notchType: string;
  devices: ScreenProtectorDevice[];
}

interface CatalogDevice {
  brand: string;
  model: string;
  screen: string;
  foldable?: boolean;
  aliases?: string[];
}

function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[″"']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function deviceKey(device: Pick<ScreenProtectorDevice, "brand" | "model">): string {
  return `${normalizeSearch(device.brand)}|${normalizeSearch(device.model)}`;
}

function extractScreenSize(screen: string): string {
  const match = screen.match(/([\d.]+)\s*[″"]/);
  return match ? `${match[1]}"` : "—";
}

function inferScreenType(screen: string, foldable?: boolean): ScreenProtectorGroup["screenType"] {
  if (foldable) return "Foldable";
  if (/curved|edge/i.test(screen)) return "Curved";
  return "Flat";
}

function inferNotchType(name: string, screen: string, foldable?: boolean): string {
  if (foldable) return "Foldable (Cover)";
  if (/dynamic island|iphone 1[567]/i.test(name)) return "Dynamic Island";
  if (/iphone x|iphone xs|iphone 11 pro(?! max)/i.test(name)) return "Notch";
  if (/iphone|galaxy s/i.test(name) && /pro max|plus|ultra|max/i.test(name)) return "Notch / Cutout";
  if (/punch|hole|dynamic/i.test(screen)) return "Punch-hole";
  if (/waterdrop|teardrop/i.test(screen)) return "Waterdrop";
  if (/notch/i.test(screen)) return "Notch";
  return "Punch-hole";
}

function buildAliases(brand: string, model: string): string[] {
  const aliases = new Set<string>([model]);

  if (brand === "Samsung" && model.startsWith("Galaxy ")) {
    const withoutGalaxy = model.replace(/^Galaxy /, "");
    aliases.add(withoutGalaxy);
    aliases.add(withoutGalaxy.replace(/\s5G$/i, "").trim());
    aliases.add(withoutGalaxy.replace(/\s4G$/i, "").trim());
  }

  if (brand === "Apple") {
    aliases.add(model.replace(/^iPhone /, ""));
  }

  if (brand === "Xiaomi") {
    aliases.add(model.replace(/^Redmi /, ""));
    aliases.add(model.replace(/^POCO /, ""));
    aliases.add(model.replace(/^Poco /, ""));
  }

  if (brand === "Huawei") {
    aliases.add(model.replace(/^Huawei /, ""));
  }

  if (brand === "OnePlus") {
    aliases.add(model.replace(/^OnePlus /, ""));
  }

  return [...aliases].filter(Boolean);
}

function parseSamsungName(name: string): CatalogDevice {
  const model = name.replace(/^Samsung\s+/i, "");
  const fromCatalog = SAMSUNG_SERIES.flatMap((series) => series.models).find((entry) => entry.name === name);
  const screen = fromCatalog?.screen ?? "6.5″";
  return {
    brand: "Samsung",
    model,
    screen,
    foldable: fromCatalog?.foldable,
    aliases: buildAliases("Samsung", model),
  };
}

function parseIphoneName(name: string): CatalogDevice {
  const fromCatalog = allIphoneModels().find((entry) => entry.name === name);
  const model = name.startsWith("iPhone ") ? name : `iPhone ${name}`;
  return {
    brand: "Apple",
    model: model.replace(/^Apple\s+/i, ""),
    screen: fromCatalog?.screen ?? "6.1″",
    aliases: buildAliases("Apple", model.replace(/^Apple\s+/i, "")),
  };
}

function parseGenericName(name: string, brand: string): CatalogDevice {
  const model = name.replace(new RegExp(`^${brand}\\s+`, "i"), "");
  return {
    brand,
    model,
    screen: "6.5″",
    aliases: buildAliases(brand, model),
  };
}

function catalogDevicesFromRepairPages(): CatalogDevice[] {
  const devices: CatalogDevice[] = [];

  for (const series of SAMSUNG_SERIES) {
    for (const model of series.models) {
      devices.push({
        brand: "Samsung",
        model: model.name.replace(/^Samsung\s+/i, ""),
        screen: model.screen,
        foldable: model.foldable,
        aliases: buildAliases("Samsung", model.name.replace(/^Samsung\s+/i, "")),
      });
    }
  }

  for (const series of XIAOMI_SERIES) {
    for (const model of series.models) {
      const brand = "Xiaomi";
      const deviceModel = model.name;
      devices.push({
        brand,
        model: deviceModel,
        screen: model.screen,
        aliases: buildAliases(brand, deviceModel),
      });
    }
  }

  for (const series of HUAWEI_SERIES) {
    for (const model of series.models) {
      const deviceModel = model.name.replace(/^Huawei\s+/i, "");
      devices.push({
        brand: "Huawei",
        model: deviceModel,
        screen: model.screen,
        aliases: buildAliases("Huawei", deviceModel),
      });
    }
  }

  for (const series of ONEPLUS_SERIES) {
    for (const model of series.models) {
      const deviceModel = model.name.replace(/^OnePlus\s+/i, "");
      devices.push({
        brand: "OnePlus",
        model: deviceModel,
        screen: model.screen,
        aliases: buildAliases("OnePlus", deviceModel),
      });
    }
  }

  for (const model of allIphoneModels()) {
    devices.push({
      brand: "Apple",
      model: model.name,
      screen: model.screen,
      aliases: buildAliases("Apple", model.name),
    });
  }

  return devices;
}

function parseSeedMobileName(rawName: string): CatalogDevice | null {
  const cleaned = rawName
    .replace(/\(\d+\/\d+GB\)\s*[\w\s-]+$/i, "")
    .replace(/\s+\d+GB\b.*$/i, "")
    .replace(/\s+\d+TB\b.*$/i, "")
    .trim();

  if (/^Samsung Galaxy/i.test(cleaned)) return parseSamsungName(cleaned);
  if (/^Apple iPhone/i.test(cleaned)) return parseIphoneName(cleaned.replace(/^Apple\s+/i, ""));
  if (/^iPhone/i.test(cleaned)) return parseIphoneName(cleaned);
  if (/^Redmi|^POCO|^Poco|^Xiaomi/i.test(cleaned)) {
    return {
      brand: "Xiaomi",
      model: cleaned,
      screen: "6.67″",
      aliases: buildAliases("Xiaomi", cleaned),
    };
  }
  if (/^Huawei/i.test(cleaned)) return parseGenericName(cleaned, "Huawei");
  if (/^OnePlus/i.test(cleaned)) return parseGenericName(cleaned, "OnePlus");
  if (/^Realme/i.test(cleaned)) {
    return {
      brand: "Realme",
      model: cleaned.replace(/^Realme\s+/i, ""),
      screen: "6.5″",
      aliases: buildAliases("Realme", cleaned.replace(/^Realme\s+/i, "")),
    };
  }

  return null;
}

function autoGroupKey(device: CatalogDevice): string {
  return [
    normalizeSearch(device.brand),
    normalizeSearch(device.screen),
    device.foldable ? "foldable" : "flat",
  ].join("|");
}

function toProtectorDevice(device: CatalogDevice): ScreenProtectorDevice {
  return {
    brand: device.brand,
    model: device.model,
    aliases: device.aliases,
  };
}

function buildAutoGroups(devices: CatalogDevice[]): ScreenProtectorGroup[] {
  const buckets = new Map<string, CatalogDevice[]>();

  for (const device of devices) {
    const key = autoGroupKey(device);
    const bucket = buckets.get(key) ?? [];
    bucket.push(device);
    buckets.set(key, bucket);
  }

  return [...buckets.entries()].map(([key, bucket], index) => {
    const sample = bucket[0];
    return {
      id: `auto-${key.replace(/\|/g, "-")}-${index}`,
      screenSize: extractScreenSize(sample.screen),
      screenType: inferScreenType(sample.screen, sample.foldable),
      notchType: inferNotchType(`${sample.brand} ${sample.model}`, sample.screen, sample.foldable),
      devices: bucket.map(toProtectorDevice),
    };
  });
}

function catalogDevicesFromSeedMobiles(): CatalogDevice[] {
  const devices: CatalogDevice[] = [];
  const seen = new Set<string>();

  for (const product of seedProducts as { category?: string; name?: string }[]) {
    if (product.category !== "mobile" || !product.name) continue;
    const parsed = parseSeedMobileName(product.name);
    if (!parsed) continue;
    const key = deviceKey(parsed);
    if (seen.has(key)) continue;
    seen.add(key);
    devices.push(parsed);
  }

  return devices;
}

function mergeManualAndAutoGroups(): ScreenProtectorGroup[] {
  const manual = [...(manualGroups as ScreenProtectorGroup[]), ...(shopGroups as ScreenProtectorGroup[])];
  const covered = new Set<string>();

  for (const group of manual) {
    for (const device of group.devices) {
      covered.add(deviceKey(device));
    }
  }

  const catalogMap = new Map<string, CatalogDevice>();
  for (const device of [...catalogDevicesFromRepairPages(), ...catalogDevicesFromSeedMobiles()]) {
    const key = deviceKey(device);
    if (!catalogMap.has(key)) {
      catalogMap.set(key, device);
    }
  }

  const uncovered: CatalogDevice[] = [];
  for (const device of catalogMap.values()) {
    if (!covered.has(deviceKey(device))) {
      uncovered.push(device);
    }
  }

  const autoGroups = buildAutoGroups(uncovered);
  return [...manual, ...autoGroups];
}

export const SCREEN_PROTECTOR_GROUPS: ScreenProtectorGroup[] = mergeManualAndAutoGroups();

export function deviceLabel(device: ScreenProtectorDevice): string {
  if (device.brand === "Apple" && device.model.startsWith("iPhone")) {
    return device.model;
  }
  if (device.brand === "OnePlus" && !device.model.startsWith("OnePlus")) {
    return `OnePlus ${device.model}`;
  }
  if (device.brand === "Xiaomi" && /^(Redmi|POCO|Poco|Mi|Black Shark)/i.test(device.model)) {
    return device.model;
  }
  if (device.brand === "Honor" || device.brand === "LG" || device.brand === "Vivo") {
    return `${device.brand} ${device.model}`;
  }
  return `${device.brand} ${device.model}`;
}

export function deviceSearchHaystack(device: ScreenProtectorDevice): string {
  const parts = [device.brand, device.model, ...(device.aliases ?? [])];
  return normalizeSearch(parts.join(" "));
}

export function deviceMatchesQuery(device: ScreenProtectorDevice, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return false;

  const haystack = deviceSearchHaystack(device);
  const tokens = normalizedQuery.split(" ").filter(Boolean);

  return tokens.every((token) => haystack.includes(token));
}

export function groupMatchesQuery(group: ScreenProtectorGroup, query: string): boolean {
  return group.devices.some((device) => deviceMatchesQuery(device, query));
}

export function findPrimaryMatch(
  group: ScreenProtectorGroup,
  query: string,
): ScreenProtectorDevice {
  const matches = group.devices.filter((device) => deviceMatchesQuery(device, query));
  if (matches.length === 0) return group.devices[0];
  return matches.sort((a, b) => deviceLabel(b).length - deviceLabel(a).length)[0];
}

export function normalizeSearchQuery(value: string): string {
  return normalizeSearch(value);
}

export function buildSearchSuggestions(query: string): Array<{
  group: ScreenProtectorGroup;
  device: ScreenProtectorDevice;
}> {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return [];

  const seen = new Set<string>();
  const suggestions: Array<{ group: ScreenProtectorGroup; device: ScreenProtectorDevice }> = [];

  for (const group of SCREEN_PROTECTOR_GROUPS) {
    for (const device of group.devices) {
      if (!deviceMatchesQuery(device, query)) continue;
      const key = `${group.id}:${deviceLabel(device)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      suggestions.push({ group, device });
    }
  }

  return suggestions.sort((a, b) =>
    deviceLabel(a.device).localeCompare(deviceLabel(b.device), "el"),
  );
}

export function totalDeviceCount(groups: ScreenProtectorGroup[] = SCREEN_PROTECTOR_GROUPS): number {
  return groups.reduce((count, group) => count + group.devices.length, 0);
}
