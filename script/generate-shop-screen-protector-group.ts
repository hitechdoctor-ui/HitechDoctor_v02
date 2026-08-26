/**
 * Generates client/src/data/screenProtectorShopGroups.json
 * Run: npx tsx script/generate-shop-screen-protector-group.ts
 */
import { writeFileSync } from "fs";
import { join } from "path";

type Entry = { brand: string; model: string; aliases?: string[] };

function d(brand: string, model: string, extraAliases: string[] = []): Entry {
  const aliases = [model, ...extraAliases];
  if (brand === "Samsung" && model.startsWith("Galaxy ")) {
    aliases.push(model.replace(/^Galaxy /, ""));
  }
  if (brand === "OnePlus") {
    aliases.push(model.replace(/^OnePlus /, ""));
  }
  if (brand === "Xiaomi") {
    aliases.push(model.replace(/^(Redmi|POCO|Mi|Black Shark) /, ""));
  }
  return { brand, model, aliases: [...new Set(aliases)] };
}

const ogPlusBigCurve: Entry[] = [
  d("Xiaomi", "Redmi Note 9S", ["Note 9S"]),
  d("Xiaomi", "Redmi Note 9 Pro", ["Note 9 Pro"]),
  d("Xiaomi", "Redmi Note 9 Pro Max", ["Note 9 Pro Max"]),
  d("Xiaomi", "Redmi Note 10 Pro", ["Note 10 Pro"]),
  d("Xiaomi", "Redmi Note 10 Pro Max", ["Note 10 Pro Max"]),
  d("Xiaomi", "Redmi Note 10 Lite", ["Note 10 Lite"]),
  d("Xiaomi", "Redmi Note 11 Pro", ["Note 11 Pro"]),
  d("Xiaomi", "Redmi Note 11 Pro+", ["Note 11 Pro+"]),
  d("Xiaomi", "Redmi Note 11E Pro", ["Note 11E Pro"]),
  d("Xiaomi", "Redmi Note 12 Pro 4G", ["Note 12 Pro"]),
  d("Xiaomi", "Redmi K40", ["K40"]),
  d("Xiaomi", "Redmi K40S", ["K40S"]),
  d("Xiaomi", "Redmi K40 Pro", ["K40 Pro"]),
  d("Xiaomi", "Redmi K40 Pro+", ["K40 Pro+"]),
  d("Xiaomi", "Redmi K30 Ultra", ["K30 Ultra"]),
  d("Xiaomi", "Redmi K30S", ["K30S"]),
  d("Xiaomi", "Redmi K30i", ["K30i"]),
  d("Xiaomi", "Redmi K30 Pro", ["K30 Pro"]),
  d("Xiaomi", "Redmi K30 Pro Zoom", ["K30 Pro Zoom"]),
  d("Xiaomi", "POCO F4", ["F4"]),
  d("Xiaomi", "POCO F3", ["F3"]),
  d("Xiaomi", "POCO X2", ["X2"]),
  d("Xiaomi", "POCO X3", ["X3"]),
  d("Xiaomi", "POCO X3 Pro", ["X3 Pro"]),
  d("Xiaomi", "POCO X3 NFC", ["X3 NFC"]),
  d("Xiaomi", "POCO X4 Pro 5G", ["X4 Pro"]),
  d("Xiaomi", "POCO M2 Pro", ["M2 Pro"]),
  d("Xiaomi", "POCO F2 Pro", ["F2 Pro"]),
  d("Xiaomi", "Mi 10i 5G", ["10i"]),
  d("Xiaomi", "Mi 10T 5G", ["10T"]),
  d("Xiaomi", "Mi 10T Pro 5G", ["10T Pro"]),
  d("Xiaomi", "Mi 10T Lite 5G", ["10T Lite"]),
  d("Xiaomi", "Mi 11T", ["11T"]),
  d("Xiaomi", "Mi 11T Pro", ["11T Pro"]),
  d("Xiaomi", "Mi 11X", ["11X"]),
  d("Xiaomi", "Mi 11X Pro", ["11X Pro"]),
  d("Xiaomi", "Mi 11i", ["11i"]),
  d("Xiaomi", "Black Shark 4"),
  d("Xiaomi", "Black Shark 4 Pro"),
  d("Xiaomi", "Black Shark 4S"),
  d("Xiaomi", "Black Shark 4S Pro"),
  d("Samsung", "Galaxy A80", ["A80"]),
  d("Samsung", "Galaxy A90", ["A90"]),
  d("Huawei", "P Smart 2021"),
  d("Honor", "X8"),
  d("Honor", "X8A"),
  d("Honor", "X10"),
  d("LG", "K42"),
  d("LG", "K52"),
  d("LG", "K61"),
  d("LG", "K62"),
  d("LG", "K62 Plus"),
  d("LG", "K92"),
  d("OnePlus", "Ace 2V"),
  d("OnePlus", "Nord 3"),
  d("OnePlus", "Nord CE 3", ["Nord CE3"]),
  d("OnePlus", "Nord N100", ["N100", "OnePlus Nord N100", "1+ Nord N100"]),
  d("Realme", "GT3"),
  d("Realme", "GT Neo 5 SE"),
  d("Realme", "GT Neo5"),
  d("Vivo", "Y200"),
  d("Vivo", "V29E Global", ["V29E"]),
];

const groups = [
  {
    id: "shop-og-plus-big-curve-esd",
    label: "OG+ Big Shining Curve — ESD Anti-Static",
    source: "shop-inventory",
    screenSize: "6.67\"",
    screenType: "Curved",
    notchType: "Punch-hole",
    devices: ogPlusBigCurve,
  },
];

const out = join(process.cwd(), "client/src/data/screenProtectorShopGroups.json");
writeFileSync(out, `${JSON.stringify(groups, null, 2)}\n`);
console.log(`Wrote ${groups.length} shop group(s), ${ogPlusBigCurve.length} devices → ${out}`);
