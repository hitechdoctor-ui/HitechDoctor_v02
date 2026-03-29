import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RepairPriceOverride } from "@shared/schema";
import type { IPhoneModel } from "@/data/iphone-devices";
import { screenTiers as buildScreenTiers } from "@/data/iphone-devices";

/** brand → modelSlug → serviceKey → τιμή με ΦΠΑ (€) */
export type RepairOverrideMap = Record<string, Record<string, Partial<Record<string, number>>>>;

export function buildRepairOverrideMap(rows: RepairPriceOverride[] | undefined): RepairOverrideMap {
  const m: RepairOverrideMap = {};
  if (!rows?.length) return m;
  for (const r of rows) {
    const p = parseFloat(String(r.price));
    if (!Number.isFinite(p)) continue;
    if (!m[r.brand]) m[r.brand] = {};
    const prev = m[r.brand]![r.modelSlug] ?? {};
    m[r.brand]![r.modelSlug] = { ...prev, [r.serviceKey]: p };
  }
  return m;
}

/** Εφαρμόζει overrides από PDF/XML στο στατικό μοντέλο iPhone. */
export function mergeIphoneModel(base: IPhoneModel, map: RepairOverrideMap): IPhoneModel {
  const o = map.iphone?.[base.slug];
  if (!o) return base;

  let nextScreen = base.screenTiers;
  if (o.screen_standard != null) {
    nextScreen = buildScreenTiers(o.screen_standard);
  }

  let nextBattery = base.batteryTiers;
  if (o.battery_standard != null) {
    nextBattery = base.batteryTiers.map((t, i) => (i === 2 ? { ...t, price: o.battery_standard! } : t));
  }

  let port = base.chargingPortPrice;
  if (o.charging_port != null) port = o.charging_port;

  return {
    ...base,
    screenTiers: nextScreen,
    batteryTiers: nextBattery,
    chargingPortPrice: port,
  };
}

/** Samsung / Xiaomi / Huawei / OnePlus — μονή τιμή ανά υπηρεσία. */
export function mergeAndroidRepairModel<
  T extends { slug: string; screenPrice: number; batteryPrice: number; portPrice: number },
>(base: T, brand: string, map: RepairOverrideMap): T {
  const o = map[brand]?.[base.slug];
  if (!o) return base;
  return {
    ...base,
    screenPrice: o.screen_standard ?? base.screenPrice,
    batteryPrice: o.battery_standard ?? base.batteryPrice,
    portPrice: o.charging_port ?? base.portPrice,
  };
}

export function useRepairPriceOverrideMap(): RepairOverrideMap {
  const { data } = useQuery({
    queryKey: ["/api/repair-prices"],
    queryFn: async () => {
      const r = await fetch("/api/repair-prices");
      if (!r.ok) throw new Error("repair-prices");
      return r.json() as Promise<{ overrides: RepairPriceOverride[] }>;
    },
    staleTime: 60_000,
  });
  return useMemo(() => buildRepairOverrideMap(data?.overrides), [data?.overrides]);
}
