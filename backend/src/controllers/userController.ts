import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../utils/prisma";
import { sendResponse } from "../utils/response";

export const getProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
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
      },
    });

    if (!user) return sendResponse(res, 404, false, "User not found");
    sendResponse(res, 200, true, "Profile fetched", user);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { fullName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        phone,
      },
    });

    sendResponse(res, 200, true, "Profile updated successfully", updatedUser);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        kycStatus: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) return sendResponse(res, 404, false, "User not found");

    // Fetch applications with loans
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        loan: {
          include: {
            repayments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Fetch charges
    const charges = await prisma.charge.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Calculate statistics
    const activeLoan = applications.find(
      (app) => app.loan && app.loan.status === "ACTIVE",
    );

    const totalBorrowed = applications
      .filter((app) => app.status === "APPROVED" && app.loan)
      .reduce((sum, app) => sum + Number(app.loanAmount), 0);

    const totalRepaid = applications
      .filter((app) => app.loan)
      .reduce((sum, app) => {
        const repayments = app.loan?.repayments || [];
        return (
          sum +
          repayments.reduce((repSum, rep) => repSum + Number(rep.amountPaid), 0)
        );
      }, 0);

    const totalChargesPaid = charges
      .filter((charge) => charge.status === "PAID")
      .reduce((sum, charge) => sum + Number(charge.amount), 0);

    // Calculate remaining balance for active loan
    let remainingBalance = 0;
    let nextPaymentDate = null;
    let monthlyPayment = 0;
    let loanProgress = 0;

    if (activeLoan?.loan) {
      const loan = activeLoan.loan;
      const totalRepayments = loan.repayments.reduce(
        (sum, rep) => sum + Number(rep.amountPaid),
        0,
      );
      remainingBalance = Number(loan.totalRepayment) - totalRepayments;
      monthlyPayment = Number(loan.monthlyInstallment);

      // Calculate progress (percentage paid)
      loanProgress =
        totalRepayments > 0
          ? Math.round((totalRepayments / Number(loan.totalRepayment)) * 100)
          : 0;

      // Calculate next payment date (assuming monthly payments)
      const lastPayment = loan.repayments[loan.repayments.length - 1];
      if (lastPayment) {
        const nextDate = new Date(lastPayment.paymentDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        nextPaymentDate = nextDate.toISOString().split("T")[0];
      } else {
        // First payment due 30 days after loan start
        const nextDate = new Date(loan.startDate);
        nextDate.setDate(nextDate.getDate() + 30);
        nextPaymentDate = nextDate.toISOString().split("T")[0];
      }
    }

    // Format data for frontend
    const dashboardData = {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus,
        isVerified: user.isVerified,
        memberSince: user.createdAt.toISOString().split("T")[0],
      },

      statistics: {
        totalBorrowed,
        totalRepaid,
        totalChargesPaid,
        availableCredit: 300000 - totalBorrowed, // Assuming 300k credit limit
        creditScore: 720, // This would come from a credit scoring service
        creditUtilization:
          totalBorrowed > 0 ? Math.round((totalBorrowed / 300000) * 100) : 0,
      },

      activeLoan: activeLoan
        ? {
            id: activeLoan.loan?.id,
            applicationId: activeLoan.id,
            loanAmount: Number(activeLoan.loanAmount),
            totalRepayment: Number(activeLoan.loan?.totalRepayment),
            monthlyPayment,
            remainingBalance,
            nextPaymentDate,
            progress: loanProgress,
            status: activeLoan.loan?.status,
            interestRate: Number(activeLoan.loan?.interestRate),
            startDate: activeLoan.loan?.startDate,
            endDate: activeLoan.loan?.endDate,
          }
        : null,

      applications: applications.map((app) => ({
        id: app.id,
        loanAmount: Number(app.loanAmount),
        repaymentPeriod: app.repaymentPeriod,
        status: app.status,
        processingProgress: app.processingProgress,
        progressNote: app.progressNote,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        loan: app.loan
          ? {
              id: app.loan.id,
              status: app.loan.status,
              interestRate: Number(app.loan.interestRate),
              totalRepayment: Number(app.loan.totalRepayment),
              monthlyInstallment: Number(app.loan.monthlyInstallment),
            }
          : null,
      })),

      transactions: transactions.map((txn) => ({
        id: txn.id,
        type: txn.type,
        amount: Number(txn.amount),
        description: txn.description,
        status: txn.status,
        date: txn.createdAt.toISOString().split("T")[0],
        transactionId: txn.transactionId,
        loanId: txn.loanId,
      })),

      charges: charges.map((charge) => ({
        id: charge.id,
        type: charge.type,
        amount: Number(charge.amount),
        description: charge.description,
        status: charge.status,
        date: charge.createdAt.toISOString().split("T")[0],
        dueDate: charge.dueDate?.toISOString().split("T")[0],
        paidDate: charge.paidDate?.toISOString().split("T")[0],
        loanId: charge.loanId,
      })),

      notifications: notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: notif.read,
        actionUrl: notif.actionUrl,
        time: formatTimeAgo(notif.createdAt),
        timestamp: notif.createdAt.toISOString(),
        loanId: notif.loanId,
        persistent: notif.persistent,
      })),
    };

    sendResponse(
      res,
      200,
      true,
      "Dashboard data fetched successfully",
      dashboardData,
    );
  } catch (error) {
    console.error("Dashboard data error:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { page = 1, limit = 10, type } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.transaction.count({ where }),
    ]);

    const formattedTransactions = transactions.map((txn) => ({
      id: txn.id,
      type: txn.type,
      amount: Number(txn.amount),
      description: txn.description,
      status: txn.status,
      date: txn.createdAt.toISOString(),
      transactionId: txn.transactionId,
      loanId: txn.loanId,
    }));

    sendResponse(res, 200, true, "Transactions fetched", {
      transactions: formattedTransactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const getCharges = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    const [charges, total] = await Promise.all([
      prisma.charge.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.charge.count({ where }),
    ]);

    const formattedCharges = charges.map((charge) => ({
      id: charge.id,
      type: charge.type,
      amount: Number(charge.amount),
      description: charge.description,
      status: charge.status,
      date: charge.createdAt.toISOString().split("T")[0],
      dueDate: charge.dueDate?.toISOString().split("T")[0],
      paidDate: charge.paidDate?.toISOString().split("T")[0],
      loanId: charge.loanId,
    }));

    sendResponse(res, 200, true, "Charges fetched", {
      charges: formattedCharges,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get charges error:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { page = 1, limit = 20, unread = false } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { userId };

    if (unread === "true") {
      where.read = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, read: false } }),
    ]);

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      read: notif.read,
      actionUrl: notif.actionUrl,
      time: formatTimeAgo(notif.createdAt),
      timestamp: notif.createdAt.toISOString(),
      loanId: notif.loanId,
      persistent: notif.persistent,
    }));

    sendResponse(res, 200, true, "Notifications fetched", {
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { notificationId } = req.params;

    await prisma.notification.updateMany({
      where: {
        id: Number(notificationId),
        userId,
      },
      data: { read: true },
    });

    sendResponse(res, 200, true, "Notification marked as read");
  } catch (error) {
    console.error("Mark notification read error:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    sendResponse(res, 200, true, "All notifications marked as read");
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return sendResponse(
        res,
        404,
        false,
        "User not found or social login only",
      );
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendResponse(res, 400, false, "Incorrect current password");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    sendResponse(res, 200, true, "Password updated successfully");
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Get recent activities from various tables
    const [recentApplications, recentTransactions, recentLogins] =
      await Promise.all([
        prisma.application.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, status: true, createdAt: true, updatedAt: true },
        }),
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { type: true, amount: true, status: true, createdAt: true },
        }),
        // This would come from a proper activity log table in production
        [],
      ]);

    const logs = [
      // Applications
      ...recentApplications.map((app) => ({
        id: `app_${app.id}`,
        action: `Application ${app.status.toLowerCase()}`,
        details: `Loan application #${app.id}`,
        date: app.updatedAt.toISOString(),
        type: "application",
      })),

      // Transactions
      ...recentTransactions.map((txn, index) => ({
        id: `txn_${index}`,
        action: `${txn.type.replace("_", " ").toLowerCase()} ${txn.status.toLowerCase()}`,
        details: `KES ${Number(txn.amount).toLocaleString()}`,
        date: txn.createdAt.toISOString(),
        type: "transaction",
      })),

      // Mock login activities (in production, implement proper session tracking)
      {
        id: "login_1",
        action: "Login detected",
        details: "Nairobi, Kenya • Web Browser",
        date: new Date().toISOString(),
        type: "security",
      },
      {
        id: "login_2",
        action: "Login detected",
        details: "Nairobi, Kenya • Mobile App",
        date: new Date(Date.now() - 86400000).toISOString(),
        type: "security",
      },
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    sendResponse(res, 200, true, "Activity logs fetched", logs);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, "Server Error");
  }
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60)
    return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffDays < 30)
    return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? "" : "s"} ago`;
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) === 1 ? "" : "s"} ago`;
  return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) === 1 ? "" : "s"} ago`;
}
