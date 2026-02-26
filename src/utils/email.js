/**
 * 🔧 UNIVERSAL EMAIL SERVICE (Reusable Across Projects)
 * -----------------------------------------------------
 * Just change the values in the CONFIG section below (brand name, colors, logo, etc.)
 * and it will automatically update the entire email template.
 */

import nodemailer from "nodemailer";
import dotenv from "dotenv";
import process from "process";
dotenv.config();

/* --------------------------------------------------------------------------
 * 🧠 CONFIG — Change these once per project
 * -------------------------------------------------------------------------- */
const BRAND = {
  name: "AI-Driven", // Project / Brand name
  domain: "https://dirveteam.veloxlogistics.co.uk", 
  logoUrl: "https://ojiiz.com/logo.png",
  primaryColor: "#4F46E5", // Main color for buttons, headers, etc.
  textColor: "#111",
  accentBg: "#f3f4f6",
  footerBg: "#fafafa",
  emailFromName: "AI-Driven Support", // From name in emails
  supportEmail: process.env.SMTP_USER, // Default sender
};

/* --------------------------------------------------------------------------
 * ✉️ Nodemailer Transporter
 * -------------------------------------------------------------------------- */
const transporter = nodemailer.createTransport({
  host: String(process.env.SMTP_HOST),
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: String(process.env.SMTP_USER),
    pass: String(process.env.SMTP_PASS),
  },
});

/* --------------------------------------------------------------------------
 * 📩 Base Email Template — All emails use this layout
 * -------------------------------------------------------------------------- */
const baseEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${BRAND.name} Email</title>
  </head>
  <body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f6f7fb;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f6f7fb" style="padding:30px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <tr>
              <td align="center" bgcolor="${BRAND.primaryColor}" style="padding:25px;">
                <img src="${BRAND.logoUrl}" alt="${BRAND.name} Logo" width="120" style="display:block; margin:0 auto; border-radius:8px;" />
              </td>
            </tr>
            <tr>
              <td style="padding:40px 30px 20px; color:${BRAND.textColor}; font-size:16px; line-height:1.6;">
                ${content}
              </td>
            </tr>
            <tr>
              <td style="padding:30px; text-align:center; color:#777; font-size:12px; background-color:${BRAND.footerBg}; border-top:1px solid #eee;">
                <p style="margin:4px 0;">This is an automated message, please do not reply.</p>
                <p style="margin:4px 0;">© ${new Date().getFullYear()} <strong>${BRAND.name}</strong>. All rights reserved.</p>
                <p style="margin:4px 0;">${BRAND.domain}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

/* --------------------------------------------------------------------------
 * 🚀 Generic Email Sender
 * -------------------------------------------------------------------------- */
export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"${BRAND.emailFromName}" <${BRAND.supportEmail}>`,
    to,
    subject,
    html,
  };
  return await transporter.sendMail(mailOptions);
};

/* --------------------------------------------------------------------------
 * 📬 Email Templates
 * -------------------------------------------------------------------------- */

/**
 * 1. Verification Email
 */
export const sendVerificationEmail = async (email, code) => {
  const content = `
    <h1 style="text-align:center; color:${BRAND.textColor}; font-size:24px; margin-bottom:20px;">
      Welcome to ${BRAND.name}!
    </h1>
    <p>Thank you for signing up. Please verify your email address using the code below:</p>
    <div style="text-align:center; margin:30px 0;">
      <div style="display:inline-block; background:${BRAND.primaryColor}; color:#fff; padding:16px 28px; border-radius:8px; font-size:24px; letter-spacing:6px; font-weight:700;">
        ${code}
      </div>
    </div>
    <p>This code will expire in 24 hours.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;
  return await sendEmail(email, `Verify Your Email - ${BRAND.name}`, baseEmailTemplate(content));
};

/**
 * 2. Two-Factor Authentication Email
 */
export const send2FAEmail = async (email, code) => {
  const content = `
    <h1 style="text-align:center; color:${BRAND.textColor}; font-size:22px;">Your ${BRAND.name} 2FA Code</h1>
    <p>Use the following code to complete your sign-in process:</p>
    <div style="text-align:center; margin:25px 0;">
      <div style="display:inline-block; background:${BRAND.accentBg}; padding:16px 30px; font-size:26px; font-weight:700; color:${BRAND.primaryColor}; border-radius:10px; letter-spacing:5px;">
        ${code}
      </div>
    </div>
    <p>This code is valid for 10 minutes. Please do not share it with anyone.</p>
    <p>If you didn’t request this code, you can ignore this email.</p>
  `;
  return await sendEmail(email, `Your 2FA Code - ${BRAND.name}`, baseEmailTemplate(content));
};

/**
 * 3. Password Reset (via token link)
 */
export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const content = `
    <h1 style="text-align:center; color:${BRAND.textColor}; font-size:24px;">Reset Your Password</h1>
    <p>We received a request to reset your password. Click the button below to set a new one:</p>
    <div style="text-align:center; margin:30px 0;">
      <a href="${resetUrl}" style="display:inline-block; background:${BRAND.primaryColor}; color:#fff; padding:14px 28px; border-radius:6px; text-decoration:none; font-weight:600;">Reset Password</a>
    </div>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break:break-all; color:${BRAND.primaryColor};">${resetUrl}</p>
    <p>This link will expire in 10 minutes.</p>
  `;
  return await sendEmail(email, `Reset Your Password - ${BRAND.name}`, baseEmailTemplate(content));
};

/**
 * 4. Password Reset Code Email
 */
export const sendPasswordResetCodeEmail = async (email, code) => {
  const content = `
    <h1 style="text-align:center; color:${BRAND.textColor}; font-size:24px;">Reset Your Password</h1>
    <p>Use the verification code below to reset your password:</p>
    <div style="text-align:center; margin:30px 0;">
      <div style="display:inline-block; background:${BRAND.primaryColor}; color:#fff; padding:16px 30px; border-radius:10px; font-size:28px; letter-spacing:6px; font-weight:700;">
        ${code}
      </div>
    </div>
    <p>This code will expire in <strong>10 minutes</strong>.</p>
    <p>If you didn’t request this, please ignore this email.</p>
  `;
  return await sendEmail(email, `Your Password Reset Code - ${BRAND.name}`, baseEmailTemplate(content));
};
