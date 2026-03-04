import { Resend } from "resend";
import type { RepairRequest } from "@shared/schema";

const FROM_EMAIL = "HiTech Doctor <noreply@hitechdoctor.com>";
const ADMIN_EMAIL = "info@hitechdoctor.com";
const INVOICE_NUM = (id: number) => `#REPR-${String(id).padStart(4, "0")}`;
const VAT_RATE = 0.24;
const fmt = (n: number) => n.toFixed(2).replace(".", ",") + " €";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function buildConfirmationEmail(req: RepairRequest): string {
  const net = req.price ? parseFloat(req.price) : null;
  const vatAmount = net !== null ? net * VAT_RATE : null;
  const total = net !== null ? net * (1 + VAT_RATE) : null;

  const priceBlock = net !== null ? `
    <div style="margin:24px 0;background:#0a1628;border:1px solid rgba(0,210,200,0.2);border-radius:12px;padding:20px;">
      <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#00D2C8;">Εκτιμώμενο Κόστος Επισκευής</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;color:#aaa;font-size:13px;">Χωρίς ΦΠΑ:</td>
          <td style="padding:4px 0;text-align:right;color:#fff;font-size:13px;">${fmt(net)}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#aaa;font-size:13px;">ΦΠΑ 24%:</td>
          <td style="padding:4px 0;text-align:right;color:#aaa;font-size:13px;">${fmt(vatAmount!)}</td>
        </tr>
        <tr style="border-top:1px solid rgba(0,210,200,0.2);">
          <td style="padding:10px 0 4px 0;color:#00D2C8;font-weight:700;font-size:15px;">Με ΦΠΑ:</td>
          <td style="padding:10px 0 4px 0;text-align:right;color:#00D2C8;font-weight:900;font-size:18px;">${fmt(total!)}</td>
        </tr>
      </table>
      <p style="margin:10px 0 0 0;font-size:11px;color:#666;">* Η τιμή αυτή είναι εκτίμηση. Θα επιβεβαιωθεί μετά την αξιολόγηση της συσκευής.</p>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Επιβεβαίωση Αιτήματος Επισκευής</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;">
        <span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span>
      </div>
      <div style="font-size:12px;color:#666;">Επισκευές Κινητών &amp; IT Support — Σπάρτη, Λακωνία</div>
    </div>

    <!-- Main card -->
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;margin-bottom:16px;">
      <div style="width:52px;height:52px;background:rgba(0,210,200,0.1);border:1px solid rgba(0,210,200,0.3);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
        <span style="font-size:24px;">🔧</span>
      </div>
      <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;text-align:center;color:#fff;">Αίτημα Επισκευής Παραλήφθηκε!</h1>
      <p style="margin:0 0 24px 0;font-size:13px;color:#888;text-align:center;">Θα επικοινωνήσουμε μαζί σας το συντομότερο για να κλείσουμε ραντεβού.</p>

      <!-- Request info -->
      <div style="background:#050C19;border-radius:12px;padding:18px;margin-bottom:20px;">
        <p style="margin:0 0 12px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#00D2C8;">Στοιχεία Αιτήματος</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:5px 0;color:#888;font-size:12px;width:40%;">Αριθμός:</td>
            <td style="padding:5px 0;color:#00D2C8;font-weight:700;font-size:13px;">${INVOICE_NUM(req.id)}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#888;font-size:12px;">Πελάτης:</td>
            <td style="padding:5px 0;color:#fff;font-size:13px;">${req.firstName} ${req.lastName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#888;font-size:12px;">Συσκευή:</td>
            <td style="padding:5px 0;color:#fff;font-size:13px;">${req.deviceName}</td>
          </tr>
          <tr>
            <td style="padding:5px 0;color:#888;font-size:12px;">Serial:</td>
            <td style="padding:5px 0;color:#aaa;font-family:monospace;font-size:12px;">${req.serialNumber}</td>
          </tr>
          ${req.notes ? `<tr>
            <td style="padding:5px 0;color:#888;font-size:12px;">Πρόβλημα:</td>
            <td style="padding:5px 0;color:#ccc;font-size:12px;font-style:italic;">${req.notes}</td>
          </tr>` : ""}
        </table>
      </div>

      ${priceBlock}

      <!-- Steps -->
      <div style="background:#050C19;border-radius:12px;padding:18px;">
        <p style="margin:0 0 14px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#00D2C8;">Επόμενα Βήματα</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div style="width:24px;height:24px;min-width:24px;background:rgba(0,210,200,0.15);border:1px solid rgba(0,210,200,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#00D2C8;">1</div>
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Θα λάβετε κλήση ή email από εμάς για επιβεβαίωση ραντεβού</p>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div style="width:24px;height:24px;min-width:24px;background:rgba(0,210,200,0.15);border:1px solid rgba(0,210,200,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#00D2C8;">2</div>
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Αξιολόγηση και διάγνωση της συσκευής σας</p>
          </div>
          <div style="display:flex;align-items:flex-start;gap:10px;">
            <div style="width:24px;height:24px;min-width:24px;background:rgba(0,210,200,0.15);border:1px solid rgba(0,210,200,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#00D2C8;">3</div>
            <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Επισκευή και παράδοση — συνήθως εντός 24–48 ωρών</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact -->
    <div style="background:#0a1628;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px 28px;margin-bottom:16px;">
      <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;">Επικοινωνία</p>
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div>
          <p style="margin:0 0 2px 0;font-size:11px;color:#555;">Τηλέφωνο</p>
          <a href="tel:6981882005" style="color:#00D2C8;font-size:14px;font-weight:700;text-decoration:none;">6981882005</a>
        </div>
        <div>
          <p style="margin:0 0 2px 0;font-size:11px;color:#555;">Email</p>
          <a href="mailto:info@hitechdoctor.com" style="color:#00D2C8;font-size:13px;text-decoration:none;">info@hitechdoctor.com</a>
        </div>
        <div>
          <p style="margin:0 0 2px 0;font-size:11px;color:#555;">Τοποθεσία</p>
          <span style="color:#aaa;font-size:13px;">Σπάρτη, Λακωνία</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:12px;">
      <p style="margin:0;font-size:11px;color:#444;">© 2026 HiTech Doctor — hitechdoctor.com</p>
      <p style="margin:4px 0 0 0;font-size:10px;color:#333;">Το email αυτό εστάλη αυτόματα μετά την υποβολή αιτήματος επισκευής.</p>
    </div>
  </div>
</body></html>`;
}

export async function sendRepairConfirmationEmail(req: RepairRequest): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping email send");
    return;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [req.email],
      bcc: [ADMIN_EMAIL],
      subject: `Αίτημα Επισκευής ${INVOICE_NUM(req.id)} — HiTech Doctor`,
      html: buildConfirmationEmail(req),
    });

    if (error) {
      console.error("[email] Resend error:", error);
    } else {
      console.log(`[email] Confirmation sent to ${req.email} (${INVOICE_NUM(req.id)})`);
    }
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}
