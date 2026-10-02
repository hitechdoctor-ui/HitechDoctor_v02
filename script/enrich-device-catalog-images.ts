/**
 * Συμπληρώνει image_url στο device-catalog.json (official/scdn/legacy + placeholder).
 * Χρήση: tsx script/enrich-device-catalog-images.ts [--verify]
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type CatalogFile = {
  __meta: Record<string, unknown>;
  products: Array<{
    name: string;
    slug: string;
    image_url?: string;
    [key: string]: unknown;
  }>;
};

const ROOT = process.cwd();
const CATALOG_PATH = path.join(ROOT, "server/seed-data/device-catalog.json");
const LEGACY_PATH = path.join(ROOT, "server/seed-data/legacy-product-images-source.json");

const LEGACY_BY_SLUG: Record<string, string> = Object.fromEntries(
  (JSON.parse(readFileSync(LEGACY_PATH, "utf8")) as Array<{ slug?: string; image_url?: string }>)
    .filter((p) => p.slug && p.image_url)
    .map((p) => [p.slug!, p.image_url!]),
);

/** Νέο slug → παλιό slug στο προηγούμενο catalog (ίδιο μοντέλο/χρώμα). */
const SLUG_ALIASES: Record<string, string> = {
  "samsung-galaxy-a16-4gb-128gb-black": "samsung-galaxy-a16-4g-128gb-black",
  "samsung-galaxy-a17-4g-4gb-128gb-gray": "samsung-galaxy-a17-4g-128gb-gray",
  "samsung-galaxy-a17-4g-4gb-128gb-black": "samsung-galaxy-a17-4g-128gb-black",
  "apple-iphone-16-5g-128gb-teal": "apple-iphone-16-128gb-teal",
  "apple-iphone-16-5g-8-128gb-white": "apple-iphone-16-128gb-white",
  "apple-iphone-17-8-256gb-lavender": "apple-iphone-17-256gb-lavender",
  "apple-iphone-17-8-256gb-mist-blue": "apple-iphone-17-256gb-blue",
  "apple-iphone-17-8-256gb-white": "apple-iphone-17-256gb-black",
  "apple-iphone-17-pro-256gb-cosmic-orange": "apple-iphone-17-pro-256gb-blue",
  "xiaomi-redmi-note-15-pro-5g-dual-sim-8-256gb-glacier-blue": "redmi-note-15-pro-5g-nfc-256gb-blue",
  "xiaomi-redmi-note-15-pro-5g-dual-sim-8-256gb-titanium-color":
    "redmi-note-15-pro-5g-nfc-256gb-titanium",
  "xiaomi-redmi-note-15-pro-plus-5g-dual-sim-8-256gb-glacier-blue":
    "redmi-note-15-pro-5g-nfc-256gb-black-1",
  "apple-fortistis-20w-usb-c-a2347": "apple-fortistis-20w-usb-c-a2347",
};

/** Άμεσα URLs (official / scdn / HMD / Apple CDN). */
const EXPLICIT_IMAGES: Record<string, string> = {
  "xiaomi-redmi-pad-2-11-4gb-128gb-mint-green":
    "https://i02.appmifile.com/337_operatorx_operatorx_xm/04/06/2025/502d918a8d73554d56c908e5b8f278db.jpg",
  "nokia-105-black": "https://fdn2.gsmarena.com/vv/bigpic/nokia-105-2023.jpg",
  "nokia-106-black": "https://fdn2.gsmarena.com/vv/bigpic/nokia-105-2023.jpg",
  "nokia-108-dual-sim-black": "https://fdn2.gsmarena.com/vv/bigpic/nokia-108-dual-sim.jpg",
  "nokia-108-dual-sim-blue": "https://fdn2.gsmarena.com/vv/bigpic/nokia-108-dual-sim.jpg",
  "nokia-125-black": "https://fdn2.gsmarena.com/vv/bigpic/nokia-125-2020.jpg",
  "nokia-150-dual-sim-greek-menu-black": "https://fdn2.gsmarena.com/vv/bigpic/nokia-150-2020.jpg",
  "nokia-150-dual-sim-greek-menu-pink": "https://fdn2.gsmarena.com/vv/bigpic/nokia-150-2020.jpg",
  "nokia-150-dual-sim-greek-menu-purple": "https://fdn2.gsmarena.com/vv/bigpic/nokia-150-2020.jpg",
  "nokia-150-dual-sim-greek-menu-blue": "https://fdn2.gsmarena.com/vv/bigpic/nokia-150-2020.jpg",
  "nokia-3310-dual-sim-16mb-greek-menu-yellow": "https://fdn2.gsmarena.com/vv/bigpic/nokia-3310-2017.jpg",
  "nokia-2660-flip-dual-sim-greek-menu-black": "https://fdn2.gsmarena.com/vv/bigpic/nokia-2660-flip.jpg",
  "nokia-5310-dual-sim-greek-menu-white-red":
    "https://images.ctfassets.net/wcfotm6rrl7u/1mDNLOcq6zqkfOChkBIRKN/231945afc41fe1da5fb7205f473fcb2d/nokia-5310-2024-white-front_back-int.png",
  "nokia-2660-flip-dual-sim-greek-menu-blue": "https://fdn2.gsmarena.com/vv/bigpic/nokia-2660-flip.jpg",
  "nokia-3210-dual-sim-scuba-blue":
    "https://images.ctfassets.net/wcfotm6rrl7u/53YBopvQ27tOe9C14yz1Co/6ed58c7d692b0c93b5b54c15e594a4e5/Nokia-3210-2024-ScubaBlue-FrontBack-Int.png",
  "nokia-3210-dual-sim-gold":
    "https://images.ctfassets.net/wcfotm6rrl7u/4PHLUPr3mWwt0B98sNMUyv/689d7b974f8c6c825b846258c7d390df/Nokia-3210-2024-Y2KGold-FrontBack-Int.png",
  "apple-iphone-17-pro-256gb-cosmic-orange": "/images/iphone-17-pro-max-256gb-cosmic-orange-back-front.webp",
  "apple-iphone-18-pro-12-256gb-black": "/images/iphone-17-pro-max-256gb-deep-blue-back-front.webp",
  "apple-iphone-18-pro-12-256gb-burgundy": "/images/iphone-17-pro-max-256gb-cosmic-orange-back-front.webp",
  "apple-iphone-18-pro-12-256gb-silver": "/images/iphone-17-pro-max-256gb-silver-back-front.webp",
  "apple-iphone-18-pro-max-12-256gb-black": "/images/iphone-17-pro-max-256gb-deep-blue-back-front.webp",
  "apple-iphone-18-pro-max-12-256gb-glacier": "/images/iphone-17-pro-max-256gb-silver-back-front.webp",
  "samsung-galaxy-a27-5g-dual-sim-6-128gb-black":
    "https://d.scdn.gr/images/sku_main_images/059363/59363684/xlarge_20250321104230_samsung_galaxy_a26_5g_dual_sim_6gb_128gb_black.jpeg",
  "samsung-galaxy-a27-5g-dual-sim-8-256gb-black":
    "https://d.scdn.gr/images/sku_main_images/059363/59363684/xlarge_20250321104230_samsung_galaxy_a26_5g_dual_sim_6gb_128gb_black.jpeg",
  "samsung-galaxy-a37-5g-8gb-256gb-awesome-charcoal":
    "https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg",
  "samsung-galaxy-a57-5g-8-128gb-awesome-navy":
    "https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg",
  "samsung-galaxy-a57-5g-8-256gb-awesome-navy":
    "https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg",
  "samsung-galaxy-a57-5g-8-256gb-awesome-gray":
    "https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg",
  "samsung-galaxy-a57-5g-8-256gb-awesome-icyblue":
    "https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg",
  "samsung-galaxy-a57-5g-8-256gb-awesome-lilac":
    "https://c.scdn.gr/images/sku_main_images/059321/59321064/xlarge_20250319165639_samsung_galaxy_a36_5g_dual_sim_6gb_128gb_awesome_black.jpeg",
  "samsung-galaxy-s26-ultra-5g-12-256gb-sky-blue":
    "https://d.scdn.gr/images/sku_main_images/062896/62896023/xlarge_20250904164453_samsung_galaxy_s25_fe_5g_dual_sim_8_256gb_jetblack.jpeg",
  "samsung-galaxy-s26-ultra-5g-12-512gb-black":
    "https://d.scdn.gr/images/sku_main_images/062896/62896023/xlarge_20250904164453_samsung_galaxy_s25_fe_5g_dual_sim_8_256gb_jetblack.jpeg",
  "xiaomi-redmi-a7-pro-nfc-dual-sim-4-64gb-black":
    "https://d.scdn.gr/images/sku_main_images/059838/59838897/xlarge_20250416093249_xiaomi_redmi_a5_4g_dual_sim_3gb_64gb_mayro.jpeg",
  "xiaomi-redmi-a7-pro-nfc-dual-sim-4-64gb-blue":
    "https://d.scdn.gr/images/sku_main_images/059838/59838897/xlarge_20250416093249_xiaomi_redmi_a5_4g_dual_sim_3gb_64gb_mayro.jpeg",
  "xiaomi-redmi-17-4g-dual-sim-nfc-128gb-black":
    "https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg",
  "xiaomi-redmi-17-4g-dual-sim-nfc-128gb-oak-green":
    "https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg",
  "xiaomi-redmi-17-4g-dual-sim-nfc-128gb-deep-blue":
    "https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg",
  "xiaomi-redmi-17-4g-dual-sim-nfc-256gb-black":
    "https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg",
  "xiaomi-redmi-17-4g-dual-sim-nfc-256gb-blue":
    "https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg",
  "xiaomi-redmi-17-5g-dual-sim-nfc-128gb-black":
    "https://b.scdn.gr/images/sku_main_images/062042/62042146/xlarge_20250806112755_xiaomi_redmi_15_nfc_5g_dual_sim_8gb_256gb_titan_gray.jpeg",
  "xiaomi-17t-pro-5g-12-512gb-black":
    "https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg",
  "xiaomi-17t-pro-5g-12-512gb-deep-blue":
    "https://d.scdn.gr/images/sku_main_images/065037/65037111/xlarge_20260119095656_xiaomi_redmi_note_15_pro_nfc_5g_dual_sim_8gb_256gb_black.jpeg",
  "apple-airpods-pro-3-white":
    "https://www.apple.com/v/airpods-pro/t/images/meta/og__c0ceegchesom_overview.png?202609132104",
  "apple-earpods-usb-c-white":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MU2G3?wid=1144&hei=1144&fmt=jpeg&qlt=95",
  "apple-fortistis-20w-usb-c-a2347": "/images/apple-20w-usb-c-charger-box.webp",
  "apple-charger-laptop-30w":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MY1W2?wid=1144&hei=1144&fmt=jpeg&qlt=95",
  "apple-braided-usb-c-cable-1m-white":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=1144&hei=1144&fmt=jpeg&qlt=95",
  "apple-usb-c-cable-240w-pd-2m-white":
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MQKJ3?wid=1144&hei=1144&fmt=jpeg&qlt=95",
  "samsung-galaxy-watch8-sm-l500-classic-46mm-white":
    "https://images.samsung.com/is/image/samsung/p6pim/uk/f2507/gallery/uk-galaxy-watch8-classic-l500-sm-l500nzwaeua-thumb-547707891",
  "samsung-galaxy-watch8-lte-sm-l325f-40mm-graphite":
    "https://images.samsung.com/is/image/samsung/p6pim/uk/f2507/gallery/uk-galaxy-watch8-l325-sm-l325fdaaeua-thumb-547700910",
  "samsung-galaxy-watch-ultra-2-47mm-titanium-gray":
    "https://images.samsung.com/is/image/samsung/p6pim/global/wearable/f2607/global-wearable-Galaxy_Watch_Ultra2_TitaniumGray_PeakForm_Gray_Front_PC_1600x864-554010656?$720_720_JPG$",
};

function placeholderImageUrl(productName: string): string {
  const label = productName.replace(/\s+/g, " ").trim().slice(0, 48);
  return `https://placehold.co/800x800/e8eef5/334155/png?text=${encodeURIComponent(label)}`;
}

function isDirectImageUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

function resolveImageUrl(slug: string, name: string): string {
  if (EXPLICIT_IMAGES[slug]) return EXPLICIT_IMAGES[slug];

  const alias = SLUG_ALIASES[slug];
  if (alias && LEGACY_BY_SLUG[alias]) return LEGACY_BY_SLUG[alias]!;

  if (LEGACY_BY_SLUG[slug]) return LEGACY_BY_SLUG[slug]!;

  return placeholderImageUrl(name);
}

async function verifyUrl(url: string): Promise<boolean> {
  if (url.startsWith("/") || url.includes("placehold.co")) return true;
  const isImage = (type: string, ok: boolean) =>
    ok && (type.startsWith("image/") || type.includes("octet-stream"));
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow" });
    const type = head.headers.get("content-type") ?? "";
    if (isImage(type, head.ok)) return true;
  } catch {
    /* fall through to GET probe */
  }
  try {
    const get = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { Range: "bytes=0-512" },
    });
    const type = get.headers.get("content-type") ?? "";
    return isImage(type, get.ok || get.status === 206);
  } catch {
    return false;
  }
}

async function main() {
  const verify = process.argv.includes("--verify");
  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8")) as CatalogFile;

  let ok = 0;
  let placeholders = 0;

  for (const product of catalog.products) {
    const url = resolveImageUrl(product.slug, product.name);
    product.image_url = url;
    if (url.includes("placehold.co")) placeholders++;

    if (verify && !url.startsWith("/")) {
      const valid = await verifyUrl(url);
      if (!valid) {
        console.warn(`[warn] Invalid image URL for ${product.slug}, using placeholder`);
        product.image_url = placeholderImageUrl(product.name);
        placeholders++;
      } else {
        ok++;
      }
    } else if (!url.includes("placehold.co")) {
      ok++;
    }
  }

  writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");
  console.log(
    `[enrich-device-catalog-images] Updated ${catalog.products.length} products (${ok} direct images, ${placeholders} placeholders).`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
