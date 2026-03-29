import { PDFParse } from "pdf-parse";

export type ParsedPriceRow = {
  model: string;
  netPrice: number;
  /** Ανά γραμμή προϊόντος από λέξεις-κλειδιά στο κείμενο πριν την τιμή */
  serviceKey: "screen_standard" | "battery_standard";
};

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
