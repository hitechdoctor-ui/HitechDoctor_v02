/** Payload for create/update sync from local CRM → HubSpot. */
export type HubSpotCustomerPayload = {
  name: string;
  email: string;
  phone?: string | null;
};

/** HubSpot CRM contact row (normalized for admin UI). */
export type HubSpotContactRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** ISO date string or null */
  lastContactAt: string | null;
};
