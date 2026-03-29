import { Resend } from "resend";
import type { RepairRequest, Subscription, WebsiteInquiry, ProductOfferInterest, BoxnowDropoffRequest } from "@shared/schema";

const FROM_EMAIL = "HiTech Doctor <noreply@hitechdoctor.com>";
const ADMIN_EMAIL = "info@hitechdoctor.com";

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
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
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;">
        <span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span>
      </div>
      <div style="font-size:12px;color:#666;">Επισκευές Κινητών &amp; IT Support — Αθήνα</div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;margin-bottom:16px;">
      <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;text-align:center;color:#fff;">Αίτημα Επισκευής Παραλήφθηκε!</h1>
      <p style="margin:0 0 24px 0;font-size:13px;color:#888;text-align:center;">Θα επικοινωνήσουμε μαζί σας το συντομότερο.</p>
      <div style="background:#050C19;border-radius:12px;padding:18px;margin-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:5px 0;color:#888;font-size:12px;width:40%;">Αριθμός:</td>
            <td style="padding:5px 0;color:#00D2C8;font-weight:700;font-size:13px;">${INVOICE_NUM(req.id)}</td></tr>
          <tr><td style="padding:5px 0;color:#888;font-size:12px;">Πελάτης:</td>
            <td style="padding:5px 0;color:#fff;font-size:13px;">${req.firstName} ${req.lastName}</td></tr>
          <tr><td style="padding:5px 0;color:#888;font-size:12px;">Συσκευή:</td>
            <td style="padding:5px 0;color:#fff;font-size:13px;">${req.deviceName}</td></tr>
          <tr><td style="padding:5px 0;color:#888;font-size:12px;">Serial:</td>
            <td style="padding:5px 0;color:#aaa;font-family:monospace;font-size:12px;">${req.serialNumber}</td></tr>
          ${req.notes ? `<tr><td style="padding:5px 0;color:#888;font-size:12px;">Πρόβλημα:</td>
            <td style="padding:5px 0;color:#ccc;font-size:12px;font-style:italic;">${req.notes}</td></tr>` : ""}
        </table>
      </div>
      ${priceBlock}
    </div>
    <div style="background:#0a1628;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px 28px;margin-bottom:16px;">
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div><p style="margin:0 0 2px 0;font-size:11px;color:#555;">Τηλέφωνο</p>
          <a href="tel:6981882005" style="color:#00D2C8;font-size:14px;font-weight:700;text-decoration:none;">6981882005</a></div>
        <div><p style="margin:0 0 2px 0;font-size:11px;color:#555;">Email</p>
          <a href="mailto:info@hitechdoctor.com" style="color:#00D2C8;font-size:13px;text-decoration:none;">info@hitechdoctor.com</a></div>
      </div>
    </div>
    <div style="text-align:center;padding:12px;">
      <p style="margin:0;font-size:11px;color:#444;">© 2026 HiTech Doctor — hitechdoctor.com</p>
    </div>
  </div>
</body></html>`;
}

function buildSubscriptionRenewalEmail(sub: Subscription, daysLeft: number): string {
  const typeLabel = sub.type === "antivirus" ? "Antivirus" : "Ιστοσελίδα";
  const renewalDateStr = new Date(sub.renewalDate).toLocaleDateString("el-GR", { day: "2-digit", month: "long", year: "numeric" });
  const urgencyColor = daysLeft <= 10 ? "#ef4444" : "#f59e0b";
  const urgencyLabel = daysLeft <= 10 ? `⚠️ Μόνο ${daysLeft} μέρες!` : `📅 ${daysLeft} μέρες ακόμα`;

  return `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>Ανανέωση Συνδρομής — HiTech Doctor</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;">
        <span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span>
      </div>
      <div style="font-size:12px;color:#666;">IT Support &amp; Web Services — Αθήνα</div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;margin-bottom:16px;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="display:inline-block;background:${urgencyColor}22;border:1px solid ${urgencyColor}44;border-radius:12px;padding:8px 16px;font-size:14px;font-weight:700;color:${urgencyColor};">
          ${urgencyLabel}
        </div>
      </div>
      <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;text-align:center;color:#fff;">Η Συνδρομή σας Λήγει Σύντομα</h1>
      <p style="margin:0 0 24px 0;font-size:13px;color:#888;text-align:center;">Ανανεώστε την συνδρομή <strong style="color:#fff;">${typeLabel}</strong> για να μην διακοπεί η υπηρεσία σας.</p>
      <div style="background:#050C19;border-radius:12px;padding:18px;margin-bottom:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;color:#888;font-size:12px;width:45%;">Πελάτης:</td>
            <td style="padding:6px 0;color:#fff;font-size:13px;font-weight:600;">${sub.customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Τύπος:</td>
            <td style="padding:6px 0;color:#00D2C8;font-size:13px;font-weight:700;">${typeLabel}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Ημ. Λήξης:</td>
            <td style="padding:6px 0;color:${urgencyColor};font-size:13px;font-weight:700;">${renewalDateStr}</td></tr>
          <tr><td style="padding:6px 0;color:#888;font-size:12px;">Ετήσια τιμή:</td>
            <td style="padding:6px 0;color:#fff;font-size:13px;">${fmt(parseFloat(sub.price))}</td></tr>
        </table>
      </div>
      <div style="text-align:center;">
        <a href="tel:6981882005" style="display:inline-block;background:linear-gradient(135deg,#00D2C8,#0099b8);color:#000;font-weight:800;font-size:14px;text-decoration:none;border-radius:12px;padding:12px 28px;">
          📞 Επικοινωνήστε: 6981882005
        </a>
      </div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(255,255,255,0.05);border-radius:16px;padding:20px 28px;margin-bottom:16px;">
      <div style="display:flex;gap:20px;flex-wrap:wrap;">
        <div><p style="margin:0 0 2px 0;font-size:11px;color:#555;">Τηλέφωνο</p>
          <a href="tel:6981882005" style="color:#00D2C8;font-size:14px;font-weight:700;text-decoration:none;">6981882005</a></div>
        <div><p style="margin:0 0 2px 0;font-size:11px;color:#555;">Email</p>
          <a href="mailto:info@hitechdoctor.com" style="color:#00D2C8;font-size:13px;text-decoration:none;">info@hitechdoctor.com</a></div>
      </div>
    </div>
    <div style="text-align:center;padding:12px;">
      <p style="margin:0;font-size:11px;color:#444;">© 2026 HiTech Doctor — hitechdoctor.com</p>
      <p style="margin:4px 0 0 0;font-size:10px;color:#333;">Λαμβάνετε αυτό το email γιατί έχετε ενεργή συνδρομή μαζί μας.</p>
    </div>
  </div>
</body></html>`;
}

function buildWebsiteInquiryEmail(inq: WebsiteInquiry): string {
  const prepayment = inq.prepayment ? parseFloat(inq.prepayment) : null;
  const vatAmt = prepayment !== null ? prepayment * VAT_RATE : null;
  const gross = prepayment !== null ? prepayment * (1 + VAT_RATE) : null;

  const prepBlock = prepayment !== null ? `
    <div style="margin:16px 0;background:#0d1a0d;border:1px solid rgba(0,200,100,0.2);border-radius:12px;padding:16px;">
      <p style="margin:0 0 10px 0;font-size:11px;font-weight:700;color:#4ade80;text-transform:uppercase;">Προκαταβολή</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:3px 0;color:#aaa;font-size:12px;">Χωρίς ΦΠΑ:</td>
          <td style="padding:3px 0;text-align:right;color:#fff;font-size:12px;">${fmt(prepayment)}</td></tr>
        <tr><td style="padding:3px 0;color:#aaa;font-size:12px;">ΦΠΑ 24%:</td>
          <td style="padding:3px 0;text-align:right;color:#aaa;font-size:12px;">${fmt(vatAmt!)}</td></tr>
        <tr style="border-top:1px solid rgba(0,200,100,0.2);">
          <td style="padding:8px 0 3px;color:#4ade80;font-weight:700;">Με ΦΠΑ:</td>
          <td style="padding:8px 0 3px;text-align:right;color:#4ade80;font-weight:900;font-size:15px;">${fmt(gross!)}</td></tr>
      </table>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>Νέο Αίτημα Κατασκευής Ιστοσελίδας — HiTech Doctor</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;">
        <span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span>
      </div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;margin-bottom:16px;">
      <h1 style="margin:0 0 8px 0;font-size:20px;font-weight:800;text-align:center;color:#fff;">🌐 Νέο Αίτημα Ιστοσελίδας</h1>
      <p style="margin:0 0 20px 0;font-size:13px;color:#888;text-align:center;">Νέο αίτημα κατασκευής από τη φόρμα επικοινωνίας</p>
      <div style="background:#050C19;border-radius:12px;padding:18px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:5px 0;color:#888;font-size:12px;width:40%;">Όνομα:</td>
            <td style="padding:5px 0;color:#fff;font-size:13px;">${inq.firstName} ${inq.lastName}</td></tr>
          <tr><td style="padding:5px 0;color:#888;font-size:12px;">Τηλέφωνο:</td>
            <td style="padding:5px 0;color:#00D2C8;font-size:13px;font-weight:700;">${inq.phone}</td></tr>
          <tr><td style="padding:5px 0;color:#888;font-size:12px;">Email:</td>
            <td style="padding:5px 0;color:#00D2C8;font-size:13px;">${inq.email}</td></tr>
          ${inq.notes ? `<tr><td style="padding:5px 0;color:#888;font-size:12px;vertical-align:top;">Σχόλια:</td>
            <td style="padding:5px 0;color:#ccc;font-size:12px;font-style:italic;">${inq.notes}</td></tr>` : ""}
        </table>
      </div>
      ${prepBlock}
    </div>
    <div style="text-align:center;padding:12px;">
      <p style="margin:0;font-size:11px;color:#444;">© 2026 HiTech Doctor — hitechdoctor.com</p>
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
    if (error) console.error("[email] Resend error:", error);
    else console.log(`[email] Confirmation sent to ${req.email} (${INVOICE_NUM(req.id)})`);
  } catch (err) {
    console.error("[email] Failed to send:", err);
  }
}

export async function sendSubscriptionRenewalEmail(sub: Subscription, daysLeft: number): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping subscription renewal email");
    return;
  }
  const typeLabel = sub.type === "antivirus" ? "Antivirus" : "Ιστοσελίδα";
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [sub.email],
      bcc: [ADMIN_EMAIL],
      subject: `Η συνδρομή ${typeLabel} σας λήγει σε ${daysLeft} μέρες — HiTech Doctor`,
      html: buildSubscriptionRenewalEmail(sub, daysLeft),
    });
    if (error) console.error("[email] Subscription renewal error:", error);
    else console.log(`[email] Renewal notice sent to ${sub.email} (${daysLeft} days left)`);
  } catch (err) {
    console.error("[email] Failed to send renewal:", err);
  }
}

export async function sendRepairChatLeadEmail(params: {
  name: string;
  phone: string;
  email: string;
  deviceModel: string;
  transcriptSnippet: string;
}): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping repair chat lead email");
    return;
  }
  const subject = `Νέο Lead από AI Chatbot - ${params.deviceModel}`;
  const name = escHtml(params.name);
  const phone = escHtml(params.phone);
  const email = escHtml(params.email);
  const dm = escHtml(params.deviceModel);
  const snippet = escHtml(params.transcriptSnippet.slice(0, 8000));
  const telHref = escHtml(params.phone.replace(/\s/g, ""));
  const html = `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>${escHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;"><span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span></div>
      <div style="font-size:12px;color:#666;">Νέο lead — AI Chatbot επισκευών</div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;">
      <h1 style="margin:0 0 16px 0;font-size:18px;font-weight:800;color:#fff;">Κλήση τεχνικού — στοιχεία πελάτη</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        <tr><td style="padding:8px 0;color:#888;width:36%;">Μοντέλο (εκτίμηση)</td><td style="padding:8px 0;color:#fff;font-weight:600;">${dm}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Όνομα</td><td style="padding:8px 0;color:#fff;">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Τηλέφωνο</td><td style="padding:8px 0;"><a href="tel:${telHref}" style="color:#00D2C8;font-weight:700;text-decoration:none;">${phone}</a></td></tr>
        <tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;"><a href="mailto:${encodeURIComponent(params.email)}" style="color:#00D2C8;text-decoration:none;">${email}</a></td></tr>
      </table>
      <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
        <p style="margin:0 0 8px 0;font-size:11px;color:#888;text-transform:uppercase;">Πρόσφατο απόσπασμα συνομιλίας</p>
        <pre style="margin:0;font-size:12px;color:#ccc;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,monospace;">${snippet}</pre>
      </div>
    </div>
  </div>
</body></html>`;
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      replyTo: params.email,
      subject,
      html,
    });
    if (error) console.error("[email] Repair chat lead error:", error);
    else console.log(`[email] Repair chat lead sent (${params.deviceModel})`);
  } catch (err) {
    console.error("[email] Failed to send repair chat lead:", err);
  }
}

export async function sendProductOfferInterestEmail(row: ProductOfferInterest): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping product offer interest email");
    return;
  }
  const pn = escHtml(row.productName);
  const cn = escHtml(row.customerName);
  const ph = escHtml(row.phone);
  const telHref = escHtml(row.phone.replace(/\s/g, ""));
  const subject = `Εκδήλωση ενδιαφέροντος για ${row.productName}`;
  const html = `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>${escHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;"><span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span></div>
      <div style="font-size:12px;color:#666;">eShop — Καλύτερη προσφορά</div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;">
      <h1 style="margin:0 0 16px 0;font-size:18px;font-weight:800;color:#fff;">Νέα εκδήλωση ενδιαφέροντος</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        <tr><td style="padding:8px 0;color:#888;width:40%;">Προϊόν</td><td style="padding:8px 0;color:#fff;font-weight:600;">${pn}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">ID προϊόντος</td><td style="padding:8px 0;color:#aaa;font-family:monospace;">${row.productId}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Όνομα</td><td style="padding:8px 0;color:#fff;">${cn}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Κινητό</td><td style="padding:8px 0;"><a href="tel:${telHref}" style="color:#00D2C8;font-weight:700;text-decoration:none;">${ph}</a></td></tr>
        <tr><td style="padding:8px 0;color:#888;">Ημερομηνία</td><td style="padding:8px 0;color:#ccc;">${new Date(row.createdAt!).toLocaleString("el-GR")}</td></tr>
      </table>
    </div>
  </div>
</body></html>`;
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject,
      html,
    });
    if (error) console.error("[email] Product offer interest error:", error);
    else console.log(`[email] Product offer interest sent (${row.productName})`);
  } catch (err) {
    console.error("[email] Failed to send product offer interest:", err);
  }
}

export async function sendBoxnowDropoffEmail(row: BoxnowDropoffRequest): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping boxnow dropoff email");
    return;
  }
  const code = escHtml(row.referenceCode);
  const name = escHtml(row.customerName);
  const phone = escHtml(row.phone);
  const em = row.email ? escHtml(row.email) : "";
  const addr = escHtml(row.lockerAddress);
  const postal = row.lockerPostalCode ? escHtml(row.lockerPostalCode) : "";
  const lid = escHtml(row.lockerId);
  const note = row.deviceNote ? escHtml(row.deviceNote) : "";
  const subject = `Αποστολή συσκευής — ${row.referenceCode} (BoxNow)`;
  const html = `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>${escHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;"><span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span></div>
      <div style="font-size:12px;color:#666;">Αποστολή συσκευής — BoxNow</div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.2);border-radius:16px;padding:24px 28px;margin-bottom:16px;text-align:center;">
      <p style="margin:0 0 8px 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Κωδικός αναφοράς (γράψτε τον στη συσκευασία)</p>
      <p style="margin:0;font-size:28px;font-weight:900;color:#00D2C8;font-family:monospace;letter-spacing:2px;">${code}</p>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;">
      <h1 style="margin:0 0 16px 0;font-size:18px;font-weight:800;color:#fff;">Στοιχεία &amp; locker</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
        <tr><td style="padding:8px 0;color:#888;width:40%;">Πελάτης</td><td style="padding:8px 0;color:#fff;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Τηλέφωνο</td><td style="padding:8px 0;"><a href="tel:${escHtml(row.phone.replace(/\s/g, ""))}" style="color:#00D2C8;font-weight:700;text-decoration:none;">${phone}</a></td></tr>
        ${row.email ? `<tr><td style="padding:8px 0;color:#888;">Email</td><td style="padding:8px 0;color:#ccc;">${em}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#888;">BoxNow Locker ID</td><td style="padding:8px 0;color:#aaa;font-family:monospace;font-size:12px;">${lid}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">Διεύθυνση locker</td><td style="padding:8px 0;color:#fff;">${addr}${postal ? `, ${postal}` : ""}</td></tr>
        ${row.deviceNote ? `<tr><td style="padding:8px 0;color:#888;vertical-align:top;">Συσκευή / σημ.</td><td style="padding:8px 0;color:#ccc;">${note}</td></tr>` : ""}
        <tr><td style="padding:8px 0;color:#888;">Ημερομηνία</td><td style="padding:8px 0;color:#ccc;">${new Date(row.createdAt!).toLocaleString("el-GR")}</td></tr>
      </table>
    </div>
  </div>
</body></html>`;
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      bcc: row.email ? [row.email] : undefined,
      subject,
      html,
    });
    if (error) console.error("[email] BoxNow dropoff error:", error);
    else console.log(`[email] BoxNow dropoff sent (${row.referenceCode})`);
  } catch (err) {
    console.error("[email] Failed to send boxnow dropoff email:", err);
  }
}

export async function sendWebsiteInquiryEmail(inq: WebsiteInquiry): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping website inquiry email");
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `Νέο αίτημα ιστοσελίδας: ${inq.firstName} ${inq.lastName} — HiTech Doctor`,
      html: buildWebsiteInquiryEmail(inq),
    });
    if (error) console.error("[email] Website inquiry email error:", error);
    else console.log(`[email] Website inquiry notification sent (${inq.email})`);
  } catch (err) {
    console.error("[email] Failed to send website inquiry email:", err);
  }
}

export async function sendWebsiteInquiryClientEmail(inq: WebsiteInquiry): Promise<void> {
  const resend = getClient();
  if (!resend) {
    console.log("[email] RESEND_API_KEY not set — skipping client inquiry email");
    return;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [inq.email],
      bcc: [ADMIN_EMAIL],
      subject: `Το αίτημά σας για κατασκευή ιστοσελίδας — HiTech Doctor`,
      html: `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><title>Αίτημα Ιστοσελίδας</title></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#050C19,#0a1628);border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px 32px;margin-bottom:16px;text-align:center;">
      <div style="font-size:28px;font-weight:900;margin-bottom:4px;"><span style="color:#00D2C8;">HiTech</span><span style="color:#fff;">Doctor</span></div>
      <div style="font-size:12px;color:#666;">Κατασκευή Ιστοσελίδων — Αθήνα</div>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.1);border-radius:16px;padding:28px 32px;">
      <h1 style="margin:0 0 16px 0;font-size:20px;font-weight:800;color:#fff;">Λάβαμε το αίτημά σας!</h1>
      <p style="margin:0 0 16px 0;font-size:14px;color:#aaa;">Αγαπητέ/ή <strong style="color:#fff;">${inq.firstName} ${inq.lastName}</strong>,</p>
      <p style="margin:0 0 16px 0;font-size:14px;color:#aaa;">Σας ευχαριστούμε για το ενδιαφέρον σας για κατασκευή ιστοσελίδας. Θα επικοινωνήσουμε μαζί σας το συντομότερο για να συζητήσουμε τις ανάγκες σας.</p>
      ${inq.notes ? `<div style="background:#050C19;border-radius:10px;padding:16px;margin-bottom:16px;"><p style="margin:0 0 8px 0;font-size:11px;color:#00D2C8;font-weight:700;text-transform:uppercase;">Σχόλιά σας:</p><p style="margin:0;font-size:13px;color:#ccc;">${inq.notes}</p></div>` : ""}
      <div style="background:#050C19;border-radius:10px;padding:16px;">
        <p style="margin:0 0 8px 0;font-size:11px;color:#00D2C8;font-weight:700;text-transform:uppercase;">Επικοινωνήστε μαζί μας:</p>
        <p style="margin:0;font-size:13px;color:#ccc;">📞 698 188 2005 | ✉️ info@hitechdoctor.com</p>
      </div>
    </div>
  </div>
</body></html>`,
    });
    if (error) console.error("[email] Client inquiry email error:", error);
    else console.log(`[email] Client inquiry email sent to ${inq.email}`);
  } catch (err) {
    console.error("[email] Failed to send client inquiry email:", err);
  }
}
