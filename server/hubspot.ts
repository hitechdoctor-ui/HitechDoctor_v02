import type { HubSpotContactRow, HubSpotCustomerPayload } from "@shared/hubspot";

const HUBSPOT_API = "https://api.hubapi.com";

/** Properties to request — last contact: notes_last_contacted, fallbacks for modified dates */
const CONTACT_PROPERTIES = [
  "firstname",
  "lastname",
  "email",
  "phone",
  "mobilephone",
  "lastmodifieddate",
  "notes_last_contacted",
  "hs_lastmodifieddate",
].join(",");

const MAX_PAGES = 50;

function parseHubSpotDate(v: string | null | undefined): string | null {
  if (v == null || String(v).trim() === "") return null;
  const s = String(v).trim();
  const num = Number(s);
  if (!Number.isNaN(num) && num > 1e11) return new Date(num).toISOString();
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return null;
}

function pickLastContact(p: Record<string, string | null | undefined>): string | null {
  const candidates = [
    p.notes_last_contacted,
    p.hs_lastmodifieddate,
    p.lastmodifieddate,
  ];
  let best: string | null = null;
  let bestMs = 0;
  for (const c of candidates) {
    const iso = parseHubSpotDate(c ?? undefined);
    if (!iso) continue;
    const ms = new Date(iso).getTime();
    if (ms >= bestMs) {
      bestMs = ms;
      best = iso;
    }
  }
  return best;
}

function mapResult(obj: {
  id: string;
  properties?: Record<string, string | null> | null;
}): HubSpotContactRow {
  const p = obj.properties ?? {};
  const first = (p.firstname ?? "").trim();
  const last = (p.lastname ?? "").trim();
  const name = [first, last].filter(Boolean).join(" ") || "—";
  const email = (p.email ?? "").trim() || "—";
  const phone = (p.phone ?? p.mobilephone ?? "").trim() || "—";
  return {
    id: String(obj.id),
    name,
    email,
    phone,
    lastContactAt: pickLastContact(p as Record<string, string | null | undefined>),
  };
}

type HubSpotListResponse = {
  results?: Array<{ id: string; properties?: Record<string, string | null> | null }>;
  paging?: { next?: { after?: string } };
};

/** Fetches all contacts (paginated) using a private app access token. */
export async function fetchHubSpotContacts(): Promise<HubSpotContactRow[]> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not set in environment");
  }

  const rows: HubSpotContactRow[] = [];
  let after: string | undefined;
  let pages = 0;

  do {
    const url = new URL(`${HUBSPOT_API}/crm/v3/objects/contacts`);
    url.searchParams.set("limit", "100");
    url.searchParams.set("properties", CONTACT_PROPERTIES);
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(60_000),
    });

    const text = await res.text();
    if (!res.ok) {
      let msg = text.slice(0, 500);
      try {
        const j = JSON.parse(text) as { message?: string };
        if (j.message) msg = j.message;
      } catch {
        /* use raw */
      }
      throw new Error(`HubSpot ${res.status}: ${msg}`);
    }

    let data: HubSpotListResponse;
    try {
      data = JSON.parse(text) as HubSpotListResponse;
    } catch {
      throw new Error("Invalid JSON from HubSpot");
    }

    for (const r of data.results ?? []) {
      rows.push(mapResult(r));
    }

    after = data.paging?.next?.after;
    pages += 1;
    if (pages >= MAX_PAGES) break;
  } while (after);

  return rows;
}

function splitFullName(full: string): { firstname: string; lastname: string } {
  const t = full.trim();
  if (!t) return { firstname: "Contact", lastname: "" };
  const i = t.indexOf(" ");
  if (i === -1) return { firstname: t, lastname: "" };
  return { firstname: t.slice(0, i).trim(), lastname: t.slice(i + 1).trim() };
}

async function searchContactIdByEmail(email: string, token: string): Promise<string | null> {
  const res = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email.trim().toLowerCase(),
            },
          ],
        },
      ],
      properties: ["email"],
      limit: 1,
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: { id: string }[] };
  return data.results?.[0]?.id ?? null;
}

/**
 * Creates or updates a HubSpot contact by email (no duplicate emails).
 * Safe to call without awaiting from request handlers — log errors only.
 */
export async function createHubSpotContact(customerData: HubSpotCustomerPayload): Promise<void> {
  const token = process.env.HUBSPOT_ACCESS_TOKEN?.trim();
  if (!token) {
    return;
  }

  const email = customerData.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return;
  }

  const { firstname, lastname } = splitFullName(customerData.name);
  const phone = (customerData.phone ?? "").trim();

  const properties: Record<string, string> = {
    email,
    firstname,
    lastname,
  };
  if (phone) properties.phone = phone;

  let contactId = await searchContactIdByEmail(email, token);

  if (!contactId) {
    const createRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
      signal: AbortSignal.timeout(30_000),
    });
    if (createRes.ok) return;

    const errText = await createRes.text();
    contactId = await searchContactIdByEmail(email, token);
    if (!contactId) {
      throw new Error(`HubSpot create ${createRes.status}: ${errText.slice(0, 400)}`);
    }
  }

  const patchRes = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts/${contactId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!patchRes.ok) {
    const t = await patchRes.text();
    throw new Error(`HubSpot patch ${patchRes.status}: ${t.slice(0, 400)}`);
  }
}

/** Queue HubSpot sync after DB work — does not block I/O. */
export function queueHubSpotContactSync(customer: HubSpotCustomerPayload): void {
  setImmediate(() => {
    void createHubSpotContact(customer).catch((e) =>
      console.error("[hubspot] createHubSpotContact:", e instanceof Error ? e.message : e)
    );
  });
}
