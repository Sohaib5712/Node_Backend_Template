/**
 * mailer.js — Core email transport, branded base template, and building blocks.
 * All email modules import from here.
 */

import nodemailer from "nodemailer";
import process from "process";
import dotenv from "dotenv";

dotenv.config();

// ── Brand config ──────────────────────────────────────────────────────────────

export const BRAND = {
  name: process.env.BRAND_NAME || "Your App",
  domain: process.env.CLIENT_URL || "https://yourapp.com",
  logoUrl: `${process.env.CLIENT_URL || "https://yourapp.com"}/logo.png`,
  primaryColor: process.env.BRAND_COLOR || "#4F46E5",
  textColor: "#111111",
  mutedColor: "#6b7280",
  accentBg: "#f3f4f6",
  footerBg: "#fafafa",
  emailFromName: process.env.BRAND_NAME || "Your App",
  supportEmail: process.env.SMTP_USER,
};

// ── Transport ─────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: String(process.env.SMTP_HOST),
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: String(process.env.SMTP_USER),
    pass: String(process.env.SMTP_PASS),
  },
});

// ── Base template ─────────────────────────────────────────────────────────────

export function baseTemplate(content, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${BRAND.name}</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ""}
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f6f7fb" style="padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff"
             style="border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr>
          <td align="center" bgcolor="${BRAND.primaryColor}" style="padding:24px 30px;">
            <span style="font-size:26px;font-weight:700;color:#ffffff;letter-spacing:.5px;">${BRAND.name}</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 36px 28px;color:${BRAND.textColor};font-size:15px;line-height:1.65;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 36px;text-align:center;color:${BRAND.mutedColor};font-size:12px;
                     background:${BRAND.footerBg};border-top:1px solid #e5e7eb;">
            <p style="margin:4px 0;">This is an automated message — please do not reply.</p>
            <p style="margin:4px 0;">© ${new Date().getFullYear()} <strong>${BRAND.name}</strong>. All rights reserved.</p>
            <p style="margin:4px 0;"><a href="${BRAND.domain}" style="color:${BRAND.primaryColor};text-decoration:none;">${BRAND.domain}</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Shared building blocks ────────────────────────────────────────────────────

export function btn(href, label) {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;background:${BRAND.primaryColor};color:#fff;
       padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;
       letter-spacing:.3px;">${label}</a>
  </div>`;
}

export function codeBlock(code) {
  return `<div style="text-align:center;margin:28px 0;">
    <div style="display:inline-block;background:${BRAND.accentBg};color:${BRAND.textColor};
         padding:16px 32px;border-radius:10px;font-size:28px;font-weight:700;letter-spacing:7px;">
      ${code}
    </div>
  </div>`;
}

export function alertBox(msg, color = "#fef3c7", borderColor = "#f59e0b") {
  return `<div style="background:${color};border-left:4px solid ${borderColor};
               padding:14px 18px;border-radius:6px;margin:20px 0;font-size:14px;">
    ${msg}
  </div>`;
}

export function fallbackLink(href) {
  return `<p style="font-size:13px;color:${BRAND.mutedColor};margin-top:12px;">
    If the button doesn't work, copy and paste this link:<br/>
    <a href="${href}" style="color:${BRAND.primaryColor};word-break:break-all;">${href}</a>
  </p>`;
}

// ── Core sender ───────────────────────────────────────────────────────────────

export async function sendEmail(to, subject, html) {
  return transporter.sendMail({
    from: `"${BRAND.emailFromName}" <${BRAND.supportEmail}>`,
    to,
    subject,
    html,
  });
}
