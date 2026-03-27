import type { ImeiLookupResponse } from "@shared/imei-lookup";

export async function requestImeiLookup(imei: string): Promise<ImeiLookupResponse> {
  const res = await fetch("/api/imei/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imei }),
  });
  const data = (await res.json()) as ImeiLookupResponse;
  return data;
}
