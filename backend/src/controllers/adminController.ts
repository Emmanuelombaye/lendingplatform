import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

export const getAllApplications = async (req: Request, res: Response) => {
    try {
        const applications = await prisma.application.findMany({
            include: {
                user: {
                    select: { fullName: true, email: true, phone: true }
                },
                documents: true,
                loan: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        sendResponse(res, 200, true, 'All applications fetched', applications);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as any;
        const { status } = req.body; // APPROVED, REJECTED, REVIEW

        const application = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                user: true
            }
        });

        // Create dynamic notification based on status change (client sees in real time via polling)
        if (status === 'APPROVED') {
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    applicationId: application.id,
                    type: 'SUCCESS',
                    title: 'Loan Approved! 🎉',
                    message: `Congratulations! Your loan application for KES ${Number(application.loanAmount).toLocaleString()} has been approved. Pay the processing fee to activate your loan.`,
                    persistent: true,
                    actionUrl: '/dashboard'
                }
            });
        } else if (status === 'REJECTED') {
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    applicationId: application.id,
                    type: 'ERROR',
                    title: 'Loan Application Update',
                    message: 'Your loan application has been declined. Please contact support for more information.',
                    persistent: true,
                    actionUrl: '/dashboard'
                }
            });
        }

        sendResponse(res, 200, true, `Application ${status}`, application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const confirmProcessingFee = async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.params as any;

        const application = await prisma.application.update({
            where: { id: parseInt(applicationId) },
            data: { processingFeePaid: true },
            include: {
                user: true
            }
        });

        // Create processing fee confirmed notification
        await prisma.notification.create({
            data: {
                userId: application.userId,
                applicationId: application.id,
                type: 'SUCCESS',
                title: '✅ Processing Fee Verified!',
                message: `Your processing fee has been verified by admin. Your loan of KES ${Number(application.loanAmount).toLocaleString()} is now being activated.`,
                persistent: true
            }
        });

        // Create Loan automatically if approved and fee paid
        if (application.status === 'APPROVED') {
            const loanAmount = Number(application.loanAmount);
            const monthlyInterestRate = 0.06;
            const months = application.repaymentPeriod;

            const monthlyInterest = loanAmount * monthlyInterestRate;
            const totalInterest = monthlyInterest * months;
            const totalRepayment = loanAmount + totalInterest;
            const monthlyInstallment = totalRepayment / months;

            // Calculate end date
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + months);

            const loan = await prisma.loan.create({
                data: {
                    applicationId: application.id,
                    userId: application.userId,
                    principalAmount: loanAmount,
                    interestRate: 6.0, // Should come from settings
                    totalInterest,
                    totalRepayment,
                    monthlyInstallment,
                    startDate: new Date(),
                    endDate,
                    status: 'PENDING_DISBURSEMENT'
                }
            });

            // Create loan disbursal notification
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    loanId: loan.id,
                    type: 'SUCCESS',
                    title: 'Loan Ready for Withdrawal! 💰',
                    message: `Your loan of KES ${loanAmount.toLocaleString()} has been approved and is ready for withdrawal. Please go to the Withdraw tab to select your payout method.`,
                    persistent: true
                }
            });
        }

        sendResponse(res, 200, true, 'Processing fee confirmed', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getAllLoans = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            include: {
                application: {
                    include: {
                        user: { select: { fullName: true, phone: true } }
                    }
                }
            }
        });
        sendResponse(res, 200, true, 'Loans fetched', loans);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getSettings = async (req: Request, res: Response) => {
    try {
        let settings = await prisma.settings.findFirst();
        if (!settings) {
            settings = await prisma.settings.create({
                data: {} // Use defaults
            });
        }
        sendResponse(res, 200, true, 'Settings fetched', settings);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const { interestRateDefault, processingFeePercent, minLoan, maxLoan, maxMonths } = req.body;

        let settings = await prisma.settings.findFirst();

        if (settings) {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: {
                    interestRateDefault,
                    processingFeePercent,
                    minLoan,
                    maxLoan,
                    maxMonths
                }
            });
        } else {
            settings = await prisma.settings.create({
                data: {
                    interestRateDefault,
                    processingFeePercent,
                    minLoan,
                    maxLoan,
                    maxMonths
                }
            });
        }

        sendResponse(res, 200, true, 'Settings updated', settings);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const [totalApplications, pendingReview, approved, activeLoans] = await Promise.all([
            prisma.application.count(),
            prisma.application.count({ where: { status: 'REVIEW' } }),
            prisma.application.count({ where: { status: 'APPROVED' } }),
            prisma.loan.findMany({ where: { status: 'ACTIVE' } })
        ]);

        const disbursedCapital = activeLoans.reduce((acc: number, loan: any) => acc + Number(loan.principalAmount), 0);
        const totalInterest = activeLoans.reduce((acc: number, loan: any) => acc + Number(loan.totalInterest), 0);

        const stats = {
            totalApplications,
            pendingReview,
            approved,
            disbursedCapital,
            totalInterest
        };

        sendResponse(res, 200, true, 'Analytics fetched', stats);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const updateProgress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as any;
        const { processingProgress, progressNote } = req.body;

        const progress = Math.min(100, Math.max(0, parseInt(processingProgress) || 0));

        const application = await prisma.application.update({
            where: { id: parseInt(id) },
            data: { processingProgress: progress, progressNote: progressNote || null }
        });

        sendResponse(res, 200, true, 'Progress updated', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const updateApplicationProgress = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as any;
        const { processingProgress, progressNote } = req.body;

        const application = await prisma.application.update({
            where: { id: parseInt(id) },
            data: {
                processingProgress,
                progressNote
            }
        });

        sendResponse(res, 200, true, 'Progress updated', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

/**
 * Get applications with pending payment evidence (submitted fee proof, awaiting admin verification)
 */
export const getPendingPaymentEvidences = async (req: Request, res: Response) => {
    try {
        const applications = await (prisma.application as any).findMany({
            where: {
                status: 'APPROVED',
                processingFeePaid: false,
                paymentEvidenceUrl: { not: null }
            } as any,
            include: {
                user: {
                    select: { fullName: true, email: true, phone: true }
                },
                documents: true,
                loan: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        sendResponse(res, 200, true, 'Pending payment evidences fetched', applications);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

/**
 * Get all pending withdrawal requests (disbursements)
 */
export const getPendingWithdrawals = async (req: Request, res: Response) => {
    try {
        const withdrawals = await prisma.transaction.findMany({
            where: {
                type: 'DISBURSEMENT',
                status: 'PENDING'
            },
            include: {
                user: {
                    select: { fullName: true, email: true, phone: true }
                },
                loan: true
            },
            orderBy: { createdAt: 'desc' }
        });

        sendResponse(res, 200, true, 'Pending withdrawals fetched', withdrawals);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

/**
 * Update withdrawal (disbursement) status
 */
export const updateWithdrawalStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as any;
        const { status, reference } = req.body; // COMPLETED, REJECTED

        const transaction = await prisma.transaction.update({
            where: { id: parseInt(id) },
            data: {
                status: status as any,
                transactionId: reference
            },
            include: { loan: true }
        });

        // If completed, update loan status to ACTIVE
        if (status === 'COMPLETED' && transaction.loanId) {
            await prisma.loan.update({
                where: { id: transaction.loanId },
                data: { status: 'ACTIVE' }
            });

            // Notify user
            await prisma.notification.create({
                data: {
                    userId: transaction.userId,
                    loanId: transaction.loanId,
                    type: 'SUCCESS',
                    title: 'Loan Disbursed! 💸',
                    message: `Your loan of KES ${Number(transaction.amount).toLocaleString()} has been disbursed successfully. You can now start using the funds.`,
                    persistent: true
                }
            });
        } else if (status === 'REJECTED') {
            await prisma.notification.create({
                data: {
                    userId: transaction.userId,
                    loanId: transaction.loanId,
                    type: 'ERROR',
                    title: 'Withdrawal Failed ❌',
                    message: `Your withdrawal request of KES ${Number(transaction.amount).toLocaleString()} was declined. Please contact support.`,
                    persistent: true
                }
            });
        }

        sendResponse(res, 200, true, `Withdrawal ${status}`, transaction);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};
