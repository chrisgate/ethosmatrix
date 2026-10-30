import nodemailer from "nodemailer";

export type Enquiry = {
  name: string; email: string; phone?: string; project_type?: string; location?: string; budget?: string;
  timeline?: string; preferred_date?: string; project?: string; subject?: string; message?: string;
};

/**
 * Emails the team about a new enquiry. Does nothing unless SMTP_URL and MAIL_TO are set
 * (e.g. SMTP_URL=smtps://user:pass@smtp.example.com:465), so local development needs no mail server.
 * Failures are logged but never block the visitor's submission.
 */
export async function notifyEnquiry(e: Enquiry) {
  const url = process.env.SMTP_URL;
  const to = process.env.MAIL_TO;
  if (!url || !to) return;
  try {
    const rows: [string, string | undefined][] = [
      ["Name", e.name], ["Email", e.email], ["Phone", e.phone], ["Project type", e.project_type],
      ["About project", e.project], ["Subject", e.subject], ["Location", e.location], ["Budget", e.budget],
      ["Timeline", e.timeline], ["Preferred date", e.preferred_date],
    ];
    const lines = rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
    if (e.message) lines.push("", e.message);
    await nodemailer.createTransport(url).sendMail({
      from: process.env.MAIL_FROM || to,
      to,
      replyTo: e.email,
      subject: `New enquiry from ${e.name}${e.project_type ? ` (${e.project_type})` : ""}`,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Could not send enquiry email:", err);
  }
}
