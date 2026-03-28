import type { IStorage } from "./storage";

export type CheckStatusStep = { label: string; state: "done" | "current" | "pending" };

export type CheckStatusOk =
  | {
      ok: true;
      kind: "order";
      ticket: string;
      status: string;
      statusLabel: string;
      cancelled: boolean;
      steps: CheckStatusStep[];
      progressPercent: number;
    }
  | {
      ok: true;
      kind: "repair";
      ticket: string;
      status: string;
      statusLabel: string;
      cancelled: boolean;
      deviceName?: string;
      steps: CheckStatusStep[];
      progressPercent: number;
    };

const ORDER_LABELS: Record<string, string> = {
  pending: "Εκκρεμεί",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
};

const REPAIR_LABELS: Record<string, string> = {
  pending: "Νέο αίτημα",
  "in-progress": "Σε εξέλιξη",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
};

const REPAIR_FLOW = ["Παραλαβή", "Διάγνωση", "Επισκευή", "Έτοιμο"] as const;

function buildRepairSteps(status: string): { steps: CheckStatusStep[]; progressPercent: number; cancelled: boolean } {
  if (status === "cancelled") {
    return {
      cancelled: true,
      progressPercent: 0,
      steps: REPAIR_FLOW.map((label) => ({ label, state: "pending" as const })),
    };
  }
  if (status === "completed") {
    return {
      cancelled: false,
      progressPercent: 100,
      steps: REPAIR_FLOW.map((label) => ({ label, state: "done" as const })),
    };
  }
  let currentIdx = 0;
  if (status === "pending") currentIdx = 0;
  else if (status === "in-progress") currentIdx = 2;
  else currentIdx = 0;

  const steps: CheckStatusStep[] = REPAIR_FLOW.map((label, i) => {
    if (i < currentIdx) return { label, state: "done" };
    if (i === currentIdx) return { label, state: "current" };
    return { label, state: "pending" };
  });
  const progressPercent = Math.round(((currentIdx + 1) / REPAIR_FLOW.length) * 100);
  return { steps, progressPercent, cancelled: false };
}

const ORDER_FLOW = ["Λήψη παραγγελίας", "Επεξεργασία", "Αποστολή", "Παραλαβή"] as const;

function buildOrderSteps(status: string): { steps: CheckStatusStep[]; progressPercent: number; cancelled: boolean } {
  if (status === "cancelled") {
    return {
      cancelled: true,
      progressPercent: 0,
      steps: ORDER_FLOW.map((label) => ({ label, state: "pending" as const })),
    };
  }
  if (status === "completed") {
    return {
      cancelled: false,
      progressPercent: 100,
      steps: ORDER_FLOW.map((label) => ({ label, state: "done" as const })),
    };
  }
  const currentIdx = status === "pending" ? 0 : 0;
  const steps: CheckStatusStep[] = ORDER_FLOW.map((label, i) => {
    if (i < currentIdx) return { label, state: "done" };
    if (i === currentIdx) return { label, state: "current" };
    return { label, state: "pending" };
  });
  return { steps, progressPercent: status === "pending" ? 25 : 25, cancelled: false };
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Εξάγει αριθμό από ORD-12, REPR-0042, #ORD-5, κλπ. */
export function parseTicketId(raw: string): { type: "order" | "repair" | "ambiguous"; id: number } | null {
  const s = raw.trim().toUpperCase().replace(/^#/, "").replace(/\s+/g, "");
  const repr = s.match(/^REPR-?0*(\d+)$/);
  if (repr) return { type: "repair", id: parseInt(repr[1], 10) };
  const ord = s.match(/^ORD-?0*(\d+)$/);
  if (ord) return { type: "order", id: parseInt(ord[1], 10) };
  if (/^\d+$/.test(s)) return { type: "ambiguous", id: parseInt(s, 10) };
  return null;
}

export async function resolveCheckStatus(
  storage: IStorage,
  ticketInput: string,
  email: string
): Promise<CheckStatusOk | { ok: false; message: string }> {
  const em = normalizeEmail(email);
  if (!em) return { ok: false, message: "Συμπληρώστε έγκυρο email." };

  const parsed = parseTicketId(ticketInput);
  if (!parsed) return { ok: false, message: "Μη έγκυρος αριθμός παραγγελίας / ticket (π.χ. ORD-12 ή REPR-45)." };

  const tryOrder = async (id: number): Promise<CheckStatusOk | null> => {
    const row = await storage.getOrderWithCustomer(id);
    if (!row || normalizeEmail(row.customerEmail) !== em) return null;
    const { steps, progressPercent, cancelled } = buildOrderSteps(row.order.status);
    return {
      ok: true,
      kind: "order",
      ticket: `#ORD-${String(id).padStart(4, "0")}`,
      status: row.order.status,
      statusLabel: ORDER_LABELS[row.order.status] ?? row.order.status,
      cancelled,
      steps,
      progressPercent,
    };
  };

  const tryRepair = async (id: number): Promise<CheckStatusOk | null> => {
    const rep = await storage.getRepairRequestById(id);
    if (!rep || normalizeEmail(rep.email) !== em) return null;
    const { steps, progressPercent, cancelled } = buildRepairSteps(rep.status);
    return {
      ok: true,
      kind: "repair",
      ticket: `#REPR-${String(id).padStart(4, "0")}`,
      status: rep.status,
      statusLabel: REPAIR_LABELS[rep.status] ?? rep.status,
      cancelled,
      deviceName: rep.deviceName,
      steps,
      progressPercent,
    };
  };

  if (parsed.type === "order") {
    const o = await tryOrder(parsed.id);
    if (o) return o;
    return { ok: false, message: "Δεν βρέθηκε παραγγελία ή το email δεν ταιριάζει." };
  }
  if (parsed.type === "repair") {
    const r = await tryRepair(parsed.id);
    if (r) return r;
    return { ok: false, message: "Δεν βρέθηκε αίτημα επισκευής ή το email δεν ταιριάζει." };
  }

  const orderHit = await tryOrder(parsed.id);
  if (orderHit) return orderHit;
  const repairHit = await tryRepair(parsed.id);
  if (repairHit) return repairHit;
  return { ok: false, message: "Δεν βρέθηκε καταχώρηση με αυτόν τον αριθμό και email." };
}
