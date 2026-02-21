import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendResponse } from "../utils/response";

export const healthCheck = async (req: Request, res: Response) => {
  try {
    const timeoutPromise = (ms: number) => new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), ms)
    );

    // Test database connection with a 5s race
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise(5000)
    ]);

    // Test basic database operations
    const userCount = await Promise.race([prisma.user.count(), timeoutPromise(2000)]);
    const applicationCount = await Promise.race([prisma.application.count(), timeoutPromise(2000)]);

    sendResponse(res, 200, true, "System is healthy", {
      database: "connected",
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        applications: applicationCount,
      },
    });
  } catch (error) {
    console.error("Health check failed:", error);
    sendResponse(res, 503, false, "System is unhealthy", {
      database: "disconnected",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPublicSettings = async (req: Request, res: Response) => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 5000)
    );

    let settings = await Promise.race([
      prisma.settings.findFirst(),
      timeoutPromise
    ]) as any;

    if (!settings) {
      settings = await prisma.settings.create({
        data: {}, // Use defaults
      });
    }
    sendResponse(res, 200, true, "Settings fetched", settings);
  } catch (error) {
    console.error("Settings fetch error:", error);
    sendResponse(res, 500, false, "Server Error or Database Timeout");
  }
};

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { fullName, email, subject, message } = req.body;

    if (!fullName || !email || !message) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide full name, email, and message",
      );
    }

    const newMessage = await prisma.message.create({
      data: {
        fullName,
        email,
        subject,
        message,
      },
    });

    sendResponse(res, 201, true, "Message sent successfully", newMessage);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Failed to send message");
  }
};
