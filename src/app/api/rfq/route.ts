import { NextResponse } from "next/server";
import { dbConfigured, dbQuery } from "@/lib/server/db";
import { quoteMail } from "@/lib/server/quote-mail";
import { putStoredFile, readUpload, storageConfigured } from "@/lib/server/storage";

export async function POST(request: Request) {
  const form = await request.formData();
  if (String(form.get("company_website") ?? "").trim() !== "") {
    return NextResponse.redirect(new URL("/rfq-sent", request.url), 303);
  }
  const name = String(form.get("name") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = `${String(form.get("phone_code") ?? "").trim()} ${String(form.get("phone") ?? "").trim()}`.trim();
  const product = String(form.get("product") ?? "").trim();
  const quoteItems = String(form.get("quote_items") ?? "").trim();
  const message = String(form.get("message") ?? "").trim();
  if (!name || !email || !message) {
    return NextResponse.redirect(new URL("/rfq-error", request.url), 303);
  }
  const upload = readUpload(form.get("document"));
  let attachment: { filename: string; type: string; bytes: Buffer; content: string } | null = null;
  if (upload && upload.size <= 10 * 1024 * 1024) {
    const bytes = await upload.bytes();
    attachment = {
      filename: upload.name,
      type: upload.type,
      bytes,
      content: bytes.toString("base64"),
    };
  }
  const text = [
    `Name: ${name}`,
    `Company: ${company}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Product: ${product}`,
    `Quote list: ${quoteItems}`,
    `Attachment: ${attachment?.filename || "None"}`,
    "",
    message,
  ].join("\n");
  let storedPath: string | null = null;
  if (attachment) {
    if (!storageConfigured()) {
      return NextResponse.redirect(new URL("/rfq-error", request.url), 303);
    }
    const safeName = attachment.filename.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80);
    storedPath = `enquiries/${Date.now()}-${safeName}`;
    try {
      await putStoredFile(storedPath, attachment.bytes, attachment.type);
    } catch {
      return NextResponse.redirect(new URL("/rfq-error", request.url), 303);
    }
  }
  let submissionId = 0;
  if (dbConfigured()) {
    try {
      const saved = await dbQuery<{ id: number }>(
        `INSERT INTO rfq_submissions (name, company, email, phone, product, quote_items, message, attachment_path, attachment_type, attachment_data, mail_sent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE) RETURNING id`,
        [name, company, email, phone, product, quoteItems, message, storedPath, attachment?.type ?? null, null],
      );
      submissionId = saved.rows[0]?.id ?? 0;
    } catch {
      submissionId = 0;
    }
  }
  const apiKey = process.env.RESEND_API_KEY || "";
  const addresses = (value: string | undefined) =>
    (value || "")
      .split(/[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  const to = addresses(process.env.MAIL_TO);
  const cc = addresses(process.env.MAIL_CC);
  const bcc = addresses(process.env.MAIL_BCC);
  const from = process.env.MAIL_FROM || "onboarding@resend.dev";
  let sent = false;
  if (apiKey && to.length > 0) {
    const mail = await quoteMail({
      name,
      company,
      email,
      phone,
      product,
      quoteItems,
      message,
      attachmentName: attachment?.filename || "",
    });
    const payload: Record<string, unknown> = {
      from: from.includes("<") ? from : `AeroFlux Global <${from}>`,
      to,
      reply_to: `${name} <${email}>`,
      subject: `Quote enquiry from ${company || name}`,
      text,
      html: mail.html,
    };
    if (cc.length > 0) payload.cc = cc;
    if (bcc.length > 0) payload.bcc = bcc;
    const files: Array<Record<string, string>> = [];
    if (mail.logo) files.push(mail.logo);
    if (attachment) files.push({ filename: attachment.filename, content: attachment.content });
    if (files.length > 0) payload.attachments = files;
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    sent = response.ok;
    if (!sent) console.error(await response.text());
    if (sent && submissionId > 0) {
      await dbQuery("UPDATE rfq_submissions SET mail_sent = TRUE WHERE id = $1", [submissionId]).catch(() => undefined);
    }
  }
  if (!sent && submissionId === 0) {
    return NextResponse.redirect(new URL("/rfq-error", request.url), 303);
  }
  return NextResponse.redirect(new URL("/rfq-sent", request.url), 303);
}
