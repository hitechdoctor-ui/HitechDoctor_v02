/** Normalized IMEI lookup payload (server + client). */
export type ImeiLookupSuccess = {
  ok: true;
  imei: string;
  /** Display model / device name */
  model: string;
  /** e.g. "ON (Find My)", "OFF", "—" */
  icloud: string;
  /** Warranty / AppleCare status text */
  warranty: string;
  tac: string;
  /** Optional extra lines from provider */
  details?: string;
  provider: "imei_info_v4" | "custom_url";
};

export type ImeiLookupFailure = {
  ok: false;
  error: string;
};

export type ImeiLookupResponse = ImeiLookupSuccess | ImeiLookupFailure;
