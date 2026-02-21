// utils/otp.ts
import crypto from "crypto";
import axios from "axios";
import { config } from "../config/config";

export function generateOTP(length = 6): string {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, "0");
}

export async function sendOTP(phone: string, otp: string): Promise<boolean> {
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
