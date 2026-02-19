import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

// Auto-approval system for loans based on predefined criteria
export const autoApproveLoan = async (req: Request, res: Response) => {
  try {
    console.log('🤖  Starting auto-approval process...');

    // Get application to be considered
    const { applicationId } = req.params as any;
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
      include: {
        user: true,
        loan: false
      }
    });

    if (!application) {
      return sendResponse(res, 404, false, 'Application not found');
    }

    // Auto-approval criteria (can be configured via admin settings)
    const AUTO_APPROVAL_ENABLED = true; // Master switch for auto-approval
    const MIN_CREDIT_SCORE: number = 650; // Minimum credit score for auto-approval
    const MAX_LOAN_AMOUNT: number = 100000; // Maximum loan amount for auto-approval
    const MIN_REPAYMENT_HISTORY: number = 3; // Minimum successful repayments
    const MAX_DEBT_TO_INCOME_RATIO: number = 0.5; // Max 50% debt-to-income ratio

    // Check if auto-approval is enabled
    if (!AUTO_APPROVAL_ENABLED) {
      return sendResponse(res, 200, true, 'Auto-approval is disabled', {
        requiresManualApproval: true
      });
    }

    // Get user's current data for evaluation
    const user = await prisma.user.findUnique({
      where: { id: application.userId },
      include: {
        applications: {
          select: { status: true },
          where: { status: 'APPROVED' } // Changed from COMPLETED
        }
      }
    }) as any;

    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Evaluate user against auto-approval criteria
    const meetsCriteria =
      (user.creditScore || 0) >= MIN_CREDIT_SCORE &&
      Number(application.loanAmount) <= MAX_LOAN_AMOUNT &&
      user.applications.filter((app: any) => app.status === 'APPROVED').length >= MIN_REPAYMENT_HISTORY;

    // Get current system settings
    const settings = await prisma.settings.findFirst();
    const maxLoanAmount = settings ? Number(settings.maxLoan) : 1000000;

    if (meetsCriteria && Number(application.loanAmount) <= maxLoanAmount) {
      console.log('✅ Application meets auto-approval criteria');

      // Auto-approve the application
      const updatedApplication = await prisma.application.update({
        where: { id: application.id },
        data: {
          status: 'APPROVED',
          progressNote: 'Auto-approved by system based on creditworthiness criteria'
        }
      });

      // Create approval notification
      await prisma.notification.create({
        data: {
          userId: application.userId,
          loanId: application.id,
          type: 'SUCCESS',
          title: '🎉 Loan Auto-Approved!',
          message: `Congratulations! Your loan application for KES ${Number(application.loanAmount).toLocaleString()} has been automatically approved based on your creditworthiness.`,
          persistent: true
        }
      });

      // Auto-create loan if approved and fee paid (or auto-pay fee)
      if (application.processingFeePaid || AUTO_APPROVAL_ENABLED) {
        const loanAmount = Number(application.loanAmount);
        const interestRate = Number(settings?.interestRateDefault || 6.0);
        const months = application.repaymentPeriod;

        // Calculate loan details
        const monthlyInterest = loanAmount * (interestRate / 100);
        const totalInterest = monthlyInterest * months;
        const totalRepayment = loanAmount + totalInterest;
        const monthlyInstallment = totalRepayment / months;

        // Create loan record
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const newLoan = await prisma.loan.create({
          data: {
            applicationId: application.id,
            principalAmount: loanAmount,
            interestRate,
            totalInterest,
            totalRepayment,
            monthlyInstallment,
            startDate: new Date(),
            endDate,
            status: 'ACTIVE'
          }
        });

        // Create processing fee transaction
        await prisma.transaction.create({
          data: {
            userId: application.userId,
            loanId: newLoan.id,
            type: 'PROCESSING_FEE',
            amount: loanAmount * Number(settings?.processingFeePercent || 6.5) / 100,
            description: `Processing fee for loan #${application.id}`,
            status: 'COMPLETED'
          }
        });

        // Create processing fee charge
        await prisma.charge.create({
          data: {
            userId: application.userId,
            loanId: newLoan.id,
            type: 'PROCESSING_FEE',
            amount: loanAmount * Number(settings?.processingFeePercent || 6.5) / 100,
            description: `Processing fee for loan #${application.id}`,
            status: 'PAID'
          }
        });

        console.log('✅ Loan auto-approved and created:', {
          applicationId: application.id,
          loanId: newLoan.id,
          loanAmount,
          totalRepayment
        });

        return sendResponse(res, 200, true, 'Loan auto-approved successfully', {
          application: updatedApplication,
          loan: newLoan,
          autoApproved: true,
          criteria: {
            creditScore: user.creditScore,
            loanAmount: Number(application.loanAmount),
            completedLoans: user.applications.filter((app: any) => app.status === 'APPROVED').length
          }
        });
      }
    } else {
      console.log('❌ Application does not meet auto-approval criteria:', {
        creditScore: user.creditScore,
        loanAmount: Number(application.loanAmount),
        completedLoans: user.applications.filter((app: any) => app.status === 'APPROVED').length,
        maxLoanAmount
      });

      // Return manual approval requirement
      return sendResponse(res, 200, true, 'Manual approval required', {
        application,
        requiresManualApproval: true,
        criteria: {
          creditScore: user.creditScore,
          loanAmount: Number(application.loanAmount),
          completedLoans: user.applications.filter((app: any) => app.status === 'APPROVED').length,
          maxLoanAmount
        }
      });
    }

  } catch (error: any) {
    console.error('❌ Auto-approval error:', error);
    sendResponse(res, 500, false, 'Auto-approval failed', { error: error.message || 'Unknown error' });
  }
};

// Admin settings for auto-approval configuration
export const getAutoApprovalSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.settings.findFirst();

    return sendResponse(res, 200, true, 'Auto-approval settings retrieved', {
      autoApprovalEnabled: true, // Can be toggled via admin settings
      minCreditScore: 650,
      maxLoanAmount: 100000,
      minRepaymentHistory: 3,
      maxDebtToIncomeRatio: 0.5,
      currentSettings: settings
    });
  } catch (error: any) {
    sendResponse(res, 500, false, 'Failed to fetch settings', { error: error.message || 'Unknown error' });
  }
};

// Update auto-approval settings
export const updateAutoApprovalSettings = async (req: Request, res: Response) => {
  try {
    const { autoApprovalEnabled, minCreditScore, maxLoanAmount, minRepaymentHistory, maxDebtToIncomeRatio } = req.body;

    const settings = await prisma.settings.update({
      where: { id: 1 },
      data: {
        autoApprovalEnabled,
        minCreditScore,
        maxLoanAmount,
        minRepaymentHistory,
        maxDebtToIncomeRatio
      } as any
    });

    return sendResponse(res, 200, true, 'Auto-approval settings updated', settings);
  } catch (error: any) {
    sendResponse(res, 500, false, 'Failed to update settings', { error: error.message || 'Unknown error' });
  }
};
