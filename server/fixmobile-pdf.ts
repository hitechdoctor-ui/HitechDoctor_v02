import { PDFParse } from "pdf-parse";

export type ParsedPriceRow = { model: string; netPrice: number };

/** Εξαγωγή απλού κειμένου από buffer PDF */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text ?? "";
  } finally {
    await parser.destroy().catch(() => {});
  }
}

const SKIP_LINE =
  /^(σελίδα|page|μοντέλο|τιμή|€|eur|fix|mobile|ποσό|σύνολο|σύνολο|λίστα|ημερομηνία|vat|φπα|χωρίς|με\s)/i;

/**
 * Από το πλήρες κείμενο PDF, εξάγει γραμμές «μοντέλο + τιμή χωρίς ΦΠΑ».
 * Η τιμή υποτίθεται στο τέλος της γραμμής (δεκαδικά με , ή .).
 */
export function extractModelPriceRowsFromText(text: string): ParsedPriceRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const out: ParsedPriceRow[] = [];

  for (const line of lines) {
    if (SKIP_LINE.test(line)) continue;
    if (!/[a-zA-Zα-ωΑ-Ω]/.test(line)) continue;

    const priceMatch = line.match(/(\d{1,4}[.,]\d{1,2}|\d{2,4})\s*$/);
    if (!priceMatch) continue;

    const model = line.slice(0, line.length - priceMatch[0].length).replace(/\s+/g, " ").trim();
    const netPrice = parseFloat(priceMatch[1].replace(",", "."));
    if (model.length < 3 || !Number.isFinite(netPrice) || netPrice < 2 || netPrice > 5000) continue;

    out.push({ model, netPrice });
  }

  return out;
}

export async function parsePdfPriceRows(buffer: Buffer): Promise<ParsedPriceRow[]> {
  const text = await extractPdfText(buffer);
  return extractModelPriceRowsFromText(text);
}
