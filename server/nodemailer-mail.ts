import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

export function getPublicSiteUrl(): string {
  const u = process.env.SITE_URL || process.env.PUBLIC_APP_URL || process.env.VITE_SITE_URL;
  if (u) return u.replace(/\/$/, "");
  return "http://localhost:5000";
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Εκκρεμεί",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
};

function buildOrderStatusHtml(params: {
  orderId: number;
  statusLabel: string;
  checkStatusUrl: string;
}): string {
  const ticket = `#ORD-${String(params.orderId).padStart(4, "0")}`;
  return `<!DOCTYPE html>
<html lang="el"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,Helvetica,sans-serif;color:#e0e0e0;">
  <div style="max-width:560px;margin:0 auto;padding:24px;">
    <div style="text-align:center;margin-bottom:20px;">
      <span style="font-size:24px;font-weight:900;color:#00D2C8;">HiTech</span><span style="font-size:24px;font-weight:900;color:#fff;">Doctor</span>
    </div>
    <div style="background:#0a1628;border:1px solid rgba(0,210,200,0.15);border-radius:16px;padding:28px;">
      <h1 style="margin:0 0 12px 0;font-size:18px;color:#fff;">Ενημέρωση παραγγελίας</h1>
      <p style="margin:0 0 16px 0;font-size:14px;color:#aaa;">Η κατάσταση της παραγγελίας σας ενημερώθηκε.</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:8px 0;color:#888;font-size:12px;">Ticket ID</td>
          <td style="padding:8px 0;text-align:right;color:#00D2C8;font-weight:700;font-size:14px;">${ticket}</td></tr>
        <tr><td style="padding:8px 0;color:#888;font-size:12px;">Νέα κατάσταση</td>
          <td style="padding:8px 0;text-align:right;color:#fff;font-weight:700;font-size:14px;">${params.statusLabel}</td></tr>
      </table>
      <div style="text-align:center;margin-top:24px;">
        <a href="${params.checkStatusUrl}" style="display:inline-block;background:#00D2C8;color:#0a1628;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:14px;">
          Έλεγχος κατάστασης (Check Repair Status)
        </a>
      </div>
      <p style="margin:20px 0 0 0;font-size:11px;color:#555;text-align:center;">Αν το κουμπί δεν λειτουργεί, αντιγράψτε: ${params.checkStatusUrl}</p>
    </div>
  </div>
</body></html>`;
}

export async function sendOrderStatusEmail(params: {
  to: string;
  orderId: number;
  status: string;
}): Promise<void> {
  const transporter = getTransport();
  const statusLabel = ORDER_STATUS_LABELS[params.status] ?? params.status;
  const checkStatusUrl = `${getPublicSiteUrl()}/check-status`;
  const html = buildOrderStatusHtml({
    orderId: params.orderId,
    statusLabel,
    checkStatusUrl,
  });

  if (!transporter) {
    console.warn("[nodemailer] SMTP_HOST δεν έχει οριστεί — παράλειψη email ενημέρωσης παραγγελίας.");
    return;
  }

  const from =
    process.env.SMTP_FROM ||
    (process.env.SMTP_USER ? `"HiTech Doctor" <${process.env.SMTP_USER}>` : undefined);
  if (!from) {
    console.warn("[nodemailer] Ορίστε SMTP_FROM ή SMTP_USER για αποστολή email.");
    return;
  }

  await transporter.sendMail({
    from,
    to: params.to,
    subject: `Ενημέρωση παραγγελίας #ORD-${String(params.orderId).padStart(4, "0")} — ${statusLabel}`,
    html,
  });
}
