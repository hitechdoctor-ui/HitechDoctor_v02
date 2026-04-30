/**
 * Διαβάζει CSV εξαγωγής Google Search Console (ή παρόμοιο) και εκτυπώνει snippet για server/gsc-404-redirects.ts
 *
 * Χρήση:
 *   npx tsx script/parse-gsc-404-csv.ts ./Downloads/Not\ found\ example.csv
 *
 * Ελέγχει στήλη URL / Address / ή πρώτη στήλη. Κάθε γραμμή παίρνει προεπιλεγμένο στόχο "/" — αλλάξτε χειροκίνητα.
 */
import { readFileSync } from "node:fs";

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (!inQ && c === ",") {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

function urlToPath(cell: string): string | null {
  const raw = cell.trim();
  if (!raw || /^not\s*set$/i.test(raw)) return null;
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      let p = u.pathname || "/";
      p = decodeURIComponent(p);
      if (!p.startsWith("/")) p = `/${p}`;
      if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
      return p.toLowerCase();
    }
    let p = raw.startsWith("/") ? raw : `/${raw}`;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p.toLowerCase();
  } catch {
    return null;
  }
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Χρήση: npx tsx script/parse-gsc-404-csv.ts <αρχείο.csv>");
    process.exit(1);
  }

  const text = readFileSync(file, "utf-8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) {
    console.error("Άδειο αρχείο");
    process.exit(1);
  }

  const header = parseCsvLine(lines[0]);
  const headerJoined = header.join(" ").toLowerCase();
  let col = header.findIndex((h) => /url|address|διεύθυνση/i.test(h));
  if (col < 0) col = 0;

  const hasHeader = /url|address|διεύθυνση|http|path/i.test(headerJoined);
  const startRow = hasHeader ? 1 : 0;

  const seen = new Set<string>();
  const paths: string[] = [];

  for (let i = startRow; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const cell = row[col] ?? "";
    const path = urlToPath(cell);
    if (!path || path === "/") continue;
    if (seen.has(path)) continue;
    seen.add(path);
    paths.push(path);
  }

  paths.sort();

  console.log("// --- Αντιγράψτε τις γραμμές στο GSC_404_EXACT_REDIRECTS (διορθώστε τους στόχους) ---\n");
  for (const p of paths) {
    const key = JSON.stringify(p);
    console.log(`  ${key}: "/", // TODO: στόχος (π.χ. /eshop ή /services/episkeui-iphone)`);
  }
  console.log(`\n// Σύνολο ${paths.length} μοναδικά paths`);
}

main();
