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
