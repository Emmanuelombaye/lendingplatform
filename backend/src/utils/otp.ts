import crypto from "crypto";
import axios from "axios";
import nodemailer from "nodemailer";
import { config } from "../config/config";

export function generateOTP(length = 6): string {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, "0");
}

export async function sendEmailOTP(email: string, otp: string): Promise<boolean> {
  const { host, port, user, pass } = config.email;

  console.log(`[AUTH] Attempting to send Email OTP ${otp} to ${email}`);

  if (!host || !user || !pass) {
    console.warn("[AUTH] EMAIL credentials missing. OTP will only be visible in server logs.");
    console.log(`[SIMULATOR] OTP for ${email} is: ${otp}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass,
      },
    });

    await transporter.sendMail({
      from: `"VERTEX Loans" <${user}>`,
      to: email,
      subject: "Verification Code - VERTEX Loans",
      text: `Your VERTEX Loans verification code is: ${otp}. Valid for 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
          <h2 style="color: #2563eb; font-weight: 900;">VERTEX LOANS</h2>
          <p style="color: #64748b; font-size: 16px;">Please use the following verification code to complete your request:</p>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`[AUTH] Email sent successfully to ${email}`);
    return true;
  } catch (error: any) {
    console.error("[AUTH] Email Gateway Error:", error.message);
    return false;
  }
}

export async function sendOTP(phone: string, otp: string): Promise<boolean> {
  // ... existing phone logic (optional to keep for backward compatibility)
  const { username, apiKey, senderId } = config.sms;

  // Professional Log
  console.log(`[AUTH] Attempting to send OTP ${otp} to ${phone}`);

  // If no API key, we can't send real SMS, so we fallback to console
  if (!apiKey || apiKey === "") {
    console.warn("[AUTH] SMS_API_KEY is missing. OTP will only be visible in server logs.");
    console.log(`[SIMULATOR] OTP for ${phone} is: ${otp}`);
    return true;
  }

  try {
    // Normalize phone number (Ensure it starts with +)
    let recipients = phone.trim();
    if (recipients.startsWith("0")) {
      recipients = "+254" + recipients.slice(1);
    } else if (!recipients.startsWith("+")) {
      recipients = "+" + recipients;
    }

    const isSandbox = username.toLowerCase() === 'sandbox';
    const url = isSandbox
      ? "https://api.sandbox.africastalking.com/version1/messaging"
      : "https://api.africastalking.com/version1/messaging";

    const params = new URLSearchParams();
    params.append("username", username);
    params.append("to", recipients);
    params.append("message", `Your VERTEX Loans verification code is: ${otp}. Valid for 10 minutes.`);
    if (senderId) params.append("from", senderId);

    const response = await axios.post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "apiKey": apiKey
      }
    });

    const data = response.data;
    const recipientResponse = data.SMSMessageData.Recipients[0];

    if (recipientResponse.status === "Success") {
      console.log(`[AUTH] SMS sent successfully to ${phone}. MessageId: ${recipientResponse.messageId}`);
      return true;
    } else {
      console.error(`[AUTH] SMS delivery failed for ${phone}: ${recipientResponse.status}`);
      return false;
    }
  } catch (error: any) {
    console.error("[AUTH] SMS Gateway Error:", error.response?.data || error.message);
    return false;
  }
}
