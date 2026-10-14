/** Draws an unread count badge on the site favicon (tab icon). */

const DEFAULT_HREF = "/favicon.png";

let originalHref: string | null = null;
let baseImage: HTMLImageElement | null = null;
let baseReady: Promise<HTMLImageElement> | null = null;

function getLink(): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (!originalHref) {
    originalHref = link.getAttribute("href") || DEFAULT_HREF;
  }
  return link;
}

function loadBase(): Promise<HTMLImageElement> {
  if (baseImage?.complete) return Promise.resolve(baseImage);
  if (baseReady) return baseReady;
  baseReady = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      baseImage = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error("favicon load failed"));
    img.src = originalHref || DEFAULT_HREF;
  });
  return baseReady;
}

/** Set badge count on favicon. Pass 0 to restore original icon. */
export async function setFaviconBadge(count: number): Promise<void> {
  if (typeof document === "undefined") return;
  const link = getLink();

  if (!count || count < 1) {
    if (originalHref) link.href = originalHref;
    return;
  }

  try {
    const img = await loadBase();
    const size = 64;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);

    const label = count > 99 ? "99+" : String(count);
    const r = 14;
    const cx = size - r - 2;
    const cy = r + 2;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = "#E11D48";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${label.length > 2 ? 16 : 20}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, cx, cy + 1);

    link.href = canvas.toDataURL("image/png");
  } catch {
    // Keep original favicon if canvas/CORS fails
  }
}

/** Prefix document title with (n) when there are unread notifications. */
export function setDocumentTitleBadge(count: number, baseTitle?: string): void {
  if (typeof document === "undefined") return;
  const base =
    baseTitle ||
    document.title.replace(/^\(\d+\+?\)\s*/, "").trim() ||
    "HiTech Admin";
  document.title = count > 0 ? `(${count > 99 ? "99+" : count}) ${base}` : base;
}
