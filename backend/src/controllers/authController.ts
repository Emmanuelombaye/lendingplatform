import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../utils/prisma";
import { sendResponse } from "../utils/response";
import { config } from "../config/config";

const generateToken = (id: number, role: string) => {
  return jwt.sign({ id, role }, config.server.token.secret, {
    expiresIn: Number(config.server.token.expireTime) || 3600,
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Full name, email, and password are required",
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide a valid email address",
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 8 characters long",
      );
    }

    // Check if user already exists by email or phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase().trim()) {
        return sendResponse(
          res,
          400,
          false,
          "An account with this email already exists",
        );
      }
      if (existingUser.phone === phone?.trim()) {
        return sendResponse(
          res,
          400,
          false,
          "An account with this phone number already exists",
        );
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with normalized data
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        passwordHash,
        isVerified: true, // Auto-verify for now
      },
    });

    if (user) {
      const token = generateToken(user.id, user.role);

      // Log successful registration
      console.log(`New user registered: ${user.email} (ID: ${user.id})`);

      sendResponse(res, 201, true, "Account created successfully", {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        token: token,
      });
    } else {
      sendResponse(res, 500, false, "Failed to create user account");
    }
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle specific database errors
    if (error.code === "P2002") {
      if (error.meta?.target?.includes("email")) {
        return sendResponse(
          res,
          400,
          false,
          "An account with this email already exists",
        );
      }
      if (error.meta?.target?.includes("phone")) {
        return sendResponse(
          res,
          400,
          false,
          "An account with this phone number already exists",
        );
      }
      return sendResponse(
        res,
        400,
        false,
        "Account with this information already exists",
      );
    }

    sendResponse(
      res,
      500,
      false,
      "Unable to create account. Please try again.",
    );
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    // Find user by email (case insensitive)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    // Update last login (optional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    const token = generateToken(user.id, user.role);

    // Log successful login
    console.log(`User logged in: ${user.email} (ID: ${user.id})`);

    sendResponse(res, 200, true, "Login successful", {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      kycStatus: user.kycStatus,
      isVerified: user.isVerified,
      token: token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    sendResponse(res, 500, false, "Login failed. Please try again.");
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, "Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash || ""))) {
      if (user.role !== "ADMIN") {
        return sendResponse(res, 403, false, "Access denied: Admins only");
      }

      sendResponse(res, 200, true, "Admin Login successful", {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      sendResponse(res, 401, false, "Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { email, googleId, fullName, photoUrl } = req.body;

    if (!email || !googleId) {
      return sendResponse(res, 400, false, "Google authentication data missing");
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName,
          email,
          googleId,
          role: "USER",
        },
      });
    } else if (!user.googleId) {
      // Link account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    sendResponse(res, 200, true, "Google login successful", {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const facebookLogin = async (req: Request, res: Response) => {
  try {
    const { email, facebookId, fullName, photoUrl } = req.body;

    if (!facebookId) {
      return sendResponse(res, 400, false, "Facebook authentication data missing");
    }

    let user = await prisma.user.findUnique({ where: { facebookId } });

    if (!user && email) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName,
          email: email || undefined,
          facebookId,
          role: "USER",
        },
      });
    } else if (!user.facebookId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { facebookId },
      });
    }

    sendResponse(res, 200, true, "Facebook login successful", {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

const verifyTelegramAuth = (data: any, botToken: string) => {
  const { hash, ...checkData } = data;
  const dataCheckString = Object.keys(checkData)
    .sort()
    .map((key) => `${key}=${checkData[key]}`)
    .join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return hmac === hash;
};

export const telegramLogin = async (req: Request, res: Response) => {
  try {
    const telegramData = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!telegramData.id || !telegramData.hash) {
      return sendResponse(res, 400, false, "Telegram authentication data missing");
    }

    // Verify Telegram Auth
    if (botToken && !verifyTelegramAuth(telegramData, botToken)) {
      return sendResponse(res, 401, false, "Invalid Telegram authentication");
    }

    const { id, first_name, username, photo_url } = telegramData;
    let user = await prisma.user.findUnique({
      where: { telegramId: id.toString() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: first_name + (username ? ` (${username})` : ""),
          telegramId: id.toString(),
          role: "USER",
        },
      });
    }

    sendResponse(res, 200, true, "Telegram login successful", {
      id: user.id,
      fullName: user.fullName,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const getProfile = async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        kycStatus: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        applications: {
          select: {
            id: true,
            loanAmount: true,
            repaymentPeriod: true,
            status: true,
            processingFeePaid: true,
            processingProgress: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (user) {
      sendResponse(res, 200, true, "User profile retrieved successfully", user);
    } else {
      sendResponse(res, 404, false, "User profile not found");
    }
  } catch (error: any) {
    console.error("Get profile error:", error);
    sendResponse(res, 500, false, "Failed to retrieve user profile");
  }
};
