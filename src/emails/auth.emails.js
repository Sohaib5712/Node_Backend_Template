import process from "process";
import { sendEmail, baseTemplate, codeBlock, btn, alertBox, fallbackLink, BRAND } from "./mailer.js";

export const sendVerificationEmail = async (email, code) => {
  const content = `
    <h2 style="color:${BRAND.textColor};margin:0 0 16px;">Welcome to ${BRAND.name}!</h2>
    <p>Thank you for signing up. Please verify your email address using the code below:</p>
    ${codeBlock(code)}
    <p style="font-size:13px;color:${BRAND.mutedColor};">This code will expire in <strong>24 hours</strong>.</p>
    <p style="font-size:13px;color:${BRAND.mutedColor};">If you didn't request this, you can safely ignore this email.</p>
  `;
  return sendEmail(
    email,
    `Verify Your Email — ${BRAND.name}`,
    baseTemplate(content, `Your verification code is ${code}`),
  );
};

export const send2FAEmail = async (email, code) => {
  const content = `
    <h2 style="color:${BRAND.textColor};margin:0 0 16px;">Your 2FA Code</h2>
    <p>Use the following code to complete your sign-in:</p>
    ${codeBlock(code)}
    ${alertBox("This code is valid for <strong>10 minutes</strong>. Never share it with anyone.")}
    <p style="font-size:13px;color:${BRAND.mutedColor};">If you didn't request this, please secure your account immediately.</p>
  `;
  return sendEmail(email, `Your 2FA Code — ${BRAND.name}`, baseTemplate(content, "Your sign-in code"));
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  const content = `
    <h2 style="color:${BRAND.textColor};margin:0 0 16px;">Reset Your Password</h2>
    <p>We received a request to reset your password. Click the button below to set a new one:</p>
    ${btn(resetUrl, "Reset Password")}
    ${fallbackLink(resetUrl)}
    <p style="font-size:13px;color:${BRAND.mutedColor};">This link will expire in <strong>10 minutes</strong>.</p>
    <p style="font-size:13px;color:${BRAND.mutedColor};">If you didn't request this, you can safely ignore this email.</p>
  `;
  return sendEmail(
    email,
    `Reset Your Password — ${BRAND.name}`,
    baseTemplate(content, "Password reset link inside"),
  );
};

export const sendPasswordResetCodeEmail = async (email, code) => {
  const content = `
    <h2 style="color:${BRAND.textColor};margin:0 0 16px;">Reset Your Password</h2>
    <p>Use the verification code below to reset your password:</p>
    ${codeBlock(code)}
    <p style="font-size:13px;color:${BRAND.mutedColor};">This code will expire in <strong>10 minutes</strong>.</p>
    <p style="font-size:13px;color:${BRAND.mutedColor};">If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(
    email,
    `Your Password Reset Code — ${BRAND.name}`,
    baseTemplate(content, `Your reset code is ${code}`),
  );
};
