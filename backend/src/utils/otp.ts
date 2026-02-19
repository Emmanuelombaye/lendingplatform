// utils/otp.ts
import crypto from "crypto";

export function generateOTP(length = 6): string {
  return crypto.randomInt(0, Math.pow(10, length)).toString().padStart(length, "0");
}

export function sendOTP(phone: string, otp: string): Promise<boolean> {
  // Integrate with SMS provider here
  // For demo, just log
  console.log(`Sending OTP ${otp} to phone ${phone}`);
  return Promise.resolve(true);
}
