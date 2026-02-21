import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { sendResponse } from "../utils/response";

// Extend Request type to include processed form data
declare global {
  namespace Express {
    interface Request {
      formData?: any;
      validatedUser?: any;
    }
  }
}

/**
 * Middleware to validate database connection
 */
export const validateDatabaseConnection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Test database connection with a simple query and a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 5000)
    );

    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      timeoutPromise
    ]);

    next();
  } catch (error) {
    console.error("Database connection error:", error);
    return sendResponse(
      res,
      503,
      false,
      "Database connection unavailable. Please try again later.",
    );
  }
};

/**
 * Middleware to validate and sanitize form data
 */
export const validateFormData = (requiredFields: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const formData = req.body;
      const errors: string[] = [];

      // Check required fields
      requiredFields.forEach((field) => {
        if (
          !formData[field] ||
          (typeof formData[field] === "string" && formData[field].trim() === "")
        ) {
          errors.push(`${field} is required`);
        }
      });

      if (errors.length > 0) {
        return sendResponse(res, 400, false, errors.join(", "));
      }

      // Sanitize string fields
      const sanitizedData: any = {};
      Object.keys(formData).forEach((key) => {
        if (typeof formData[key] === "string") {
          sanitizedData[key] = formData[key].trim();
        } else {
          sanitizedData[key] = formData[key];
        }
      });

      req.formData = sanitizedData;
      next();
    } catch (error) {
      console.error("Form validation error:", error);
      return sendResponse(res, 400, false, "Invalid form data");
    }
  };
};

/**
 * Middleware to handle user authentication and form submission flow
 */
export const handleFormSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // If user is not authenticated, save form data temporarily
    if (!(req as any).user) {
      const formData = req.formData || req.body;

      // Store form data in session or temporary storage
      // For now, we'll just pass the data through and let the client handle redirect
      req.formData = {
        ...formData,
        requiresAuth: true,
        timestamp: Date.now(),
      };
    }

    next();
  } catch (error) {
    console.error("Form submission handler error:", error);
    return sendResponse(res, 500, false, "Form submission failed");
  }
};

/**
 * Middleware to validate email format
 */
export const validateEmail = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.formData || req.body;

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide a valid email address",
      );
    }

    // Normalize email to lowercase
    if (req.formData) {
      req.formData.email = email.toLowerCase().trim();
    } else {
      req.body.email = email.toLowerCase().trim();
    }
  }

  next();
};

/**
 * Middleware to validate phone number format
 */
export const validatePhone = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { phone } = req.formData || req.body;

  if (phone) {
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide a valid phone number",
      );
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (req.formData) {
      req.formData.phone = normalizedPhone;
    } else {
      req.body.phone = normalizedPhone;
    }
  }

  next();
};

/**
 * Middleware to check for duplicate user data
 */
export const checkDuplicateUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, phone } = req.formData || req.body;

    if (email || phone) {
      const whereConditions: any[] = [];

      if (email) {
        whereConditions.push({ email: email.toLowerCase().trim() });
      }

      if (phone) {
        whereConditions.push({ phone: phone.trim() });
      }

      const existingUser = await prisma.user.findFirst({
        where: { OR: whereConditions },
      });

      if (existingUser) {
        if (existingUser.email === email?.toLowerCase().trim()) {
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
    }

    next();
  } catch (error) {
    console.error("Duplicate check error:", error);
    return sendResponse(res, 500, false, "Unable to validate user data");
  }
};

/**
 * Middleware to validate password strength
 */
export const validatePasswordStrength = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { password } = req.formData || req.body;

  if (password) {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    if (errors.length > 0) {
      return sendResponse(res, 400, false, errors.join(". "));
    }
  }

  next();
};

/**
 * Middleware to handle application form submission
 */
export const handleApplicationSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loanAmount, repaymentPeriod } = req.formData || req.body;

    // Validate loan amount
    if (loanAmount) {
      const amount = parseFloat(loanAmount);
      if (isNaN(amount) || amount <= 0) {
        return sendResponse(
          res,
          400,
          false,
          "Please provide a valid loan amount",
        );
      }

      // Check against system limits
      const settings = await prisma.settings.findFirst();
      if (settings) {
        if (amount < parseFloat(settings.minLoan.toString())) {
          return sendResponse(
            res,
            400,
            false,
            `Minimum loan amount is ${settings.minLoan}`,
          );
        }
        if (amount > parseFloat(settings.maxLoan.toString())) {
          return sendResponse(
            res,
            400,
            false,
            `Maximum loan amount is ${settings.maxLoan}`,
          );
        }
      }
    }

    // Validate repayment period
    if (repaymentPeriod) {
      const period = parseInt(repaymentPeriod);
      if (isNaN(period) || period <= 0) {
        return sendResponse(
          res,
          400,
          false,
          "Please provide a valid repayment period",
        );
      }

      const settings = await prisma.settings.findFirst();
      if (settings && period > settings.maxMonths) {
        return sendResponse(
          res,
          400,
          false,
          `Maximum repayment period is ${settings.maxMonths} months`,
        );
      }
    }

    next();
  } catch (error) {
    console.error("Application validation error:", error);
    return sendResponse(res, 500, false, "Application validation failed");
  }
};

/**
 * Middleware to log form submissions for analytics
 */
export const logFormSubmission = (formType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    const userAgent = req.headers["user-agent"];
    const ip = req.ip || req.connection.remoteAddress;

    console.log(
      `[${timestamp}] Form submission - Type: ${formType}, IP: ${ip}, User-Agent: ${userAgent}`,
    );

    // You could also store this in a database table for analytics
    next();
  };
};

/**
 * Middleware to handle file upload validation
 */
export const validateFileUpload = (
  allowedTypes: string[] = ["image/jpeg", "image/png", "application/pdf"],
  maxSize: number = 10 * 1024 * 1024, // 10MB
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.file) {
      // Check file type
      if (!allowedTypes.includes(req.file.mimetype)) {
        return sendResponse(
          res,
          400,
          false,
          `File type not allowed. Accepted types: ${allowedTypes.join(", ")}`,
        );
      }

      // Check file size
      if (req.file.size > maxSize) {
        return sendResponse(
          res,
          400,
          false,
          `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
        );
      }
    }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (!allowedTypes.includes(file.mimetype)) {
          return sendResponse(
            res,
            400,
            false,
            `File type not allowed: ${file.originalname}`,
          );
        }

        if (file.size > maxSize) {
          return sendResponse(
            res,
            400,
            false,
            `File too large: ${file.originalname}`,
          );
        }
      }
    }

    next();
  };
};
