import OpenAI from "openai";
import { z } from "zod";

export const contactIntakeFieldsSchema = z.object({
  name: z.string().trim().max(200).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  email: z.string().trim().max(200).nullable().optional(),
  device_model: z.string().trim().max(200).nullable().optional(),
  message: z.string().trim().max(4000).nullable().optional(),
});

export type ContactIntakeFields = z.infer<typeof contactIntakeFieldsSchema>;

const SYSTEM_PROMPT = `Είσαι βοηθός εξαγωγής δεδομένων για φόρμα επικοινωνίας καταστήματος επισκευών κινητών (HiTech Doctor, Ελλάδα).
Από το ελεύθερο κείμενο του πελάτη (ελληνικά ή αγγλικά) εξάγεις ΜΟΝΟ JSON με τα πεδία:
- name: πλήρες όνομα πελάτη ή null
- phone: τηλέφωνο (κατά προτίμηση ψηφία, π.χ. 69xxxxxxxx) ή null
- email: email ή null
- device_model: μοντέλο συσκευής (π.χ. iPhone 13, Samsung S24) ή null
- message: σύντομη περιγραφή προβλήματος / αιτήματος σε καθαρά ελληνικά (ή κράτα το νόημα) ή null αν δεν υπάρχει

Κανόνες:
- Μην επινοείς στοιχεία που δεν αναφέρονται.
- Αν κάτι είναι αβέβαιο, βάλε null.
- phone: αφαίρεσε κενά/παύλες όπου γίνεται.
- Απάντησε ΜΟΝΟ με έγκυρο JSON object, χωρίς markdown.`;

function emptyFields(): ContactIntakeFields {
  return {
    name: null,
    phone: null,
    email: null,
    device_model: null,
    message: null,
  };
}

function normalizeParsed(raw: unknown): ContactIntakeFields {
  const parsed = contactIntakeFieldsSchema.safeParse(raw);
  if (!parsed.success) return emptyFields();
  const d = parsed.data;
  const blank = (v: string | null | undefined) => {
    if (v == null) return null;
    const t = v.trim();
    if (!t || t.toLowerCase() === "null" || t === "-") return null;
    return t;
  };
  return {
    name: blank(d.name),
    phone: blank(d.phone)?.replace(/[^\d+]/g, "") || null,
    email: blank(d.email),
    device_model: blank(d.device_model),
    message: blank(d.message),
  };
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("INVALID_JSON");
  }
}

async function extractWithGemini(text: string): Promise<ContactIntakeFields> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");

  const model = process.env.GEMINI_API_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${SYSTEM_PROMPT}\n\n---\nΚείμενο πελάτη:\n${text}` }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[contact-ai-intake] Gemini HTTP", res.status, body.slice(0, 300));
    if (res.status === 401 || res.status === 403) throw new Error("GEMINI_UNAUTHORIZED");
    if (res.status === 429) throw new Error("AI_RATE_LIMIT");
    throw new Error("GEMINI_FAILED");
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const out =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!out.trim()) throw new Error("EMPTY_COMPLETION");
  return normalizeParsed(extractJsonObject(out));
}

async function extractWithOpenAI(text: string): Promise<ContactIntakeFields> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY_MISSING");

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_API_MODEL?.trim() || "gpt-4o-mini";
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: text },
    ],
  });
  const out = completion.choices[0]?.message?.content?.trim();
  if (!out) throw new Error("EMPTY_COMPLETION");
  return normalizeParsed(extractJsonObject(out));
}

export async function extractContactIntakeFields(text: string): Promise<{
  fields: ContactIntakeFields;
  provider: "gemini" | "openai";
}> {
  const cleaned = text.trim();
  if (cleaned.length < 3) {
    return { fields: emptyFields(), provider: process.env.GEMINI_API_KEY?.trim() ? "gemini" : "openai" };
  }

  if (process.env.GEMINI_API_KEY?.trim()) {
    try {
      const fields = await extractWithGemini(cleaned);
      return { fields, provider: "gemini" };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "AI_RATE_LIMIT" || msg === "GEMINI_UNAUTHORIZED") throw err;
      console.warn("[contact-ai-intake] Gemini failed, trying OpenAI:", msg);
    }
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    const fields = await extractWithOpenAI(cleaned);
    return { fields, provider: "openai" };
  }

  throw new Error("AI_KEY_MISSING");
}
