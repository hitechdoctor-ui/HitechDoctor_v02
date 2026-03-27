const IPSW_API = "https://api.ipsw.me/v4";

export type IpswDevice = {
  name: string;
  identifier: string;
};

export type IpswFirmware = {
  identifier: string;
  version: string;
  buildid: string;
  sha1sum: string;
  md5sum: string;
  sha256sum: string;
  filesize: number;
  url: string;
  releasedate: string;
  uploaddate: string;
  signed: boolean;
};

export type IpswDeviceDetail = {
  name: string;
  identifier: string;
  firmwares: IpswFirmware[];
};

/** Sort newest iPhone identifiers first (e.g. iPhone18,x before iPhone12,x). */
export function compareIphoneIdentifiers(a: string, b: string): number {
  const ma = a.match(/^iPhone(\d+),(\d+)$/);
  const mb = b.match(/^iPhone(\d+),(\d+)$/);
  if (!ma || !mb) return a.localeCompare(b, "en");
  const sa = parseInt(ma[1], 10) * 100 + parseInt(ma[2], 10);
  const sb = parseInt(mb[1], 10) * 100 + parseInt(mb[2], 10);
  return sb - sa;
}

export async function fetchIphoneDevices(): Promise<IpswDevice[]> {
  const res = await fetch(`${IPSW_API}/devices`);
  if (!res.ok) throw new Error("Αδυναμία φόρτωσης συσκευών");
  const data = (await res.json()) as IpswDevice[];
  return data
    .filter((d) => d.identifier.startsWith("iPhone"))
    .sort((x, y) => compareIphoneIdentifiers(x.identifier, y.identifier));
}

export async function fetchDeviceFirmwares(identifier: string): Promise<IpswDeviceDetail> {
  const res = await fetch(`${IPSW_API}/device/${encodeURIComponent(identifier)}`);
  if (!res.ok) throw new Error("Αδυναμία φόρτωσης firmware");
  return res.json();
}

export function formatFirmwareSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${Math.round(bytes / 1e3)} KB`;
}
