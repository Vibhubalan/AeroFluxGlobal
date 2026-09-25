import { readFile } from "node:fs/promises";
import path from "node:path";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function row(label: string, value: string) {
  if (!value.trim()) return "";
  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid #e6e1d8;width:120px;vertical-align:top;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#8a8178;">${label}</td>
    <td style="padding:14px 0;border-bottom:1px solid #e6e1d8;vertical-align:top;font-size:15px;line-height:1.5;color:#1a1a1a;">${escapeHtml(value)}</td>
  </tr>`;
}

export async function quoteMail(input: {
  name: string;
  company: string;
  email: string;
  phone: string;
  product: string;
  quoteItems: string;
  message: string;
  attachmentName: string;
}) {
  let logo: { filename: string; content: string; content_id: string } | null = null;
  try {
    const bytes = await readFile(path.join(process.cwd(), "public", "images", "logo.png"));
    logo = { filename: "logo.png", content: bytes.toString("base64"), content_id: "aeroflux-logo" };
  } catch {
    logo = null;
  }
  const heading = input.company || input.name;
  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f3f0ea;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f0ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">
          <tr>
            <td style="background:#141414;padding:28px 32px;">
              ${logo ? '<img src="cid:aeroflux-logo" width="220" alt="AeroFlux Global" style="display:block;border:0;height:auto;" />' : '<p style="margin:0;color:#ffffff;font-size:18px;letter-spacing:0.14em;">AEROFLUX GLOBAL</p>'}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b42318;">Quote enquiry</p>
              <h1 style="margin:0 0 24px;font-size:26px;line-height:1.2;font-weight:600;color:#141414;">${escapeHtml(heading)}</h1>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Name", input.name)}
                ${row("Company", input.company)}
                ${row("Email", input.email)}
                ${row("Phone", input.phone)}
                ${row("Product", input.product)}
                ${row("Quote list", input.quoteItems)}
                ${row("Attachment", input.attachmentName || "None")}
              </table>
              <p style="margin:28px 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#8a8178;">Message</p>
              <p style="margin:0;font-size:15px;line-height:1.6;color:#1a1a1a;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;font-size:12px;line-height:1.5;color:#8a8178;">AeroFlux Global Trading LLC · 140 Al Maarefh Business Center, Dubai, UAE</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  return { html, logo };
}
