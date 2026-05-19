#!/usr/bin/env node
/**
 * Εφαρμόζει λιανικές τιμές από χονδρικές Innovx (JSON map) στο server/seed-data/products.json
 * Λιανική = χονδρική × RETAIL_MULTIPLIER, στρογγυλοποίηση 2 δεκαδικών.
 *
 * Χρήση: node scripts/apply-innovx-retail-prices.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PRODUCTS_PATH = path.join(ROOT, "server/seed-data/products.json");
const MAP_PATH = path.join(ROOT, "server/seed-data/innovx-wholesale-by-slug.json");

const RETAIL_MULTIPLIER = 1.3;

function retailFromWholesale(wh) {
  return (Math.round(wh * RETAIL_MULTIPLIER * 100) / 100).toFixed(2);
}

function formatProductsJson(arr) {
  return (
    "[" +
    arr.map((obj, i) => (i === 0 ? "" : ",\n ") + JSON.stringify(obj)).join("") +
    "]\n"
  );
}

const rawMap = JSON.parse(fs.readFileSync(MAP_PATH, "utf8"));
const wholesaleBySlug = { ...rawMap };
delete wholesaleBySlug.__meta;

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
let updated = 0;
const missingInDb = [];
for (const slug of Object.keys(wholesaleBySlug)) {
  if (!products.some((p) => p.slug === slug)) missingInDb.push(slug);
}

for (const p of products) {
  const wh = wholesaleBySlug[p.slug];
  if (wh == null) continue;
  const newPrice = retailFromWholesale(wh);
  if (p.price !== newPrice) {
    p.price = newPrice;
    updated++;
  }
}

fs.writeFileSync(PRODUCTS_PATH, formatProductsJson(products), "utf8");
console.log(`Innovx retail applied: ${updated} προϊόν(τα) ενημερώθηκαν (multiplier ×${RETAIL_MULTIPLIER}).`);
if (missingInDb.length)
  console.warn("Στο χάρτισμα υπάρχουν slug χωρίς αντιστοιχία στο products.json:", missingInDb);
