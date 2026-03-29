import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendResponse } from "../utils/response";

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return sendResponse(res, 400, false, "Phone and OTP are required");
    }
    const user = await prisma.user.findFirst({
      where: {
        phone: phone.trim(),
        otpCode: otp,
        otpExpiry: {
          gt: new Date(),
        },
      },
    });
    if (!user) {
      return sendResponse(res, 400, false, "Invalid or expired OTP");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiry: null },
    });
    return sendResponse(res, 200, true, "Phone verified successfully", {
      id: user.id,
      phone: user.phone,
      isVerified: true,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return sendResponse(res, 500, false, "Server error");
  }
};
