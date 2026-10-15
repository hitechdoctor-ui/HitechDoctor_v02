import type { RepairRequest } from "@shared/schema";

export type CustomerRepairGroup = {
  key: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  requests: RepairRequest[];
  openCount: number;
  pendingCount: number;
  latest: RepairRequest;
};

/** Ομαδοποίηση: email (κανονικό) · αλλιώς τηλέφωνο · αλλιώς μοναδικό id. */
export function customerRepairGroupKey(req: RepairRequest): string {
  const email = (req.email || "").trim().toLowerCase();
  if (email) return `e:${email}`;
  const phone = (req.phone || "").replace(/\s+/g, "");
  if (phone) return `p:${phone}`;
  return `id:${req.id}`;
}

export function encodeCustomerKey(key: string): string {
  return encodeURIComponent(key);
}

export function decodeCustomerKey(encoded: string): string {
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

export function customerCardPath(key: string): string {
  return `/admin/repair-requests/customer/${encodeCustomerKey(key)}`;
}

function createdAtMs(r: RepairRequest): number {
  return r.createdAt ? new Date(r.createdAt).getTime() : 0;
}

export function groupRepairRequestsByCustomer(requests: RepairRequest[]): CustomerRepairGroup[] {
  const map = new Map<string, RepairRequest[]>();
  for (const req of requests) {
    const key = customerRepairGroupKey(req);
    const list = map.get(key);
    if (list) list.push(req);
    else map.set(key, [req]);
  }

  const groups: CustomerRepairGroup[] = [];
  Array.from(map.entries()).forEach(([key, list]) => {
    const sorted = [...list].sort((a, b) => createdAtMs(b) - createdAtMs(a));
    const latest = sorted[0];
    groups.push({
      key,
      firstName: latest.firstName,
      lastName: latest.lastName ?? "",
      phone: latest.phone,
      email: latest.email,
      requests: sorted,
      openCount: sorted.filter((r) => r.status === "pending" || r.status === "in-progress").length,
      pendingCount: sorted.filter((r) => r.status === "pending").length,
      latest,
    });
  });

  return groups.sort((a, b) => {
    if (a.openCount !== b.openCount) return b.openCount - a.openCount;
    return createdAtMs(b.latest) - createdAtMs(a.latest);
  });
}

/** Νεότερο ανοιχτό αίτημα, αλλιώς το νεότερο συνολικά. */
export function pickCurrentRepair(requests: RepairRequest[]): RepairRequest | undefined {
  const sorted = [...requests].sort((a, b) => createdAtMs(b) - createdAtMs(a));
  return sorted.find((r) => r.status === "pending" || r.status === "in-progress") ?? sorted[0];
}
