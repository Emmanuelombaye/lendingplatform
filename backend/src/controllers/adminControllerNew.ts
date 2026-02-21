import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { sendResponse } from "../utils/response";

// Get all applications
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

// Update application status
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

        // Create dynamic notification based on status change
        if (status === 'APPROVED') {
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    loanId: application.id,
                    type: 'SUCCESS',
                    title: 'Loan Approved! 🎉',
                    message: `Congratulations! Your loan application for KES ${Number(application.loanAmount).toLocaleString()} has been approved. Funds will be disbursed within 24 hours.`,
                    persistent: true
                }
            });
        } else if (status === 'REJECTED') {
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    loanId: application.id,
                    type: 'ERROR',
                    title: 'Loan Rejected',
                    message: `We regret to inform you that your loan application for KES ${Number(application.loanAmount).toLocaleString()} has been rejected. Please review our criteria and reapply.`,
                    persistent: true
                }
            });
        } else if (status === 'REVIEW') {
            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    loanId: application.id,
                    type: 'INFO',
                    title: 'Loan Under Review',
                    message: `Your loan application for KES ${Number(application.loanAmount).toLocaleString()} is currently under review. We will notify you of the decision soon.`,
                    persistent: true
                }
            });
        }

        sendResponse(res, 200, true, 'Application status updated', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

// Confirm processing fee
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

        // Create processing fee notification
        await prisma.notification.create({
            data: {
                userId: application.userId,
                loanId: application.id,
                type: 'INFO',
                title: 'Processing Fee Charged',
                message: `A processing fee of KES ${(Number(application.loanAmount) * 0.065).toLocaleString()} has been charged to your account for loan #${application.id}.`,
                persistent: false
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
                    status: 'ACTIVE'
                }
            });

            await prisma.notification.create({
                data: {
                    userId: application.userId,
                    loanId: loan.id,
                    type: 'SUCCESS',
                    title: 'Loan Disbursed! 💸',
                    message: `Your loan of KES ${loanAmount.toLocaleString()} has been disbursed to your account. Your first repayment is due on ${endDate.toLocaleDateString()}.`,
                    persistent: true
                }
            });
        }

        sendResponse(res, 200, true, 'Processing fee confirmed and application updated', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

// Get all loans
export const getAllLoans = async (req: Request, res: Response) => {
    try {
        const loans = await prisma.loan.findMany({
            include: {
                application: {
                    include: {
                        user: {
                            select: { fullName: true, email: true, phone: true }
                        }
                    }
                },
                repayments: true
            },
            orderBy: { id: 'desc' }
        });

        sendResponse(res, 200, true, 'All loans fetched', loans);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

// Get analytics
export const getAnalytics = async (req: Request, res: Response) => {
    try {
        const [
            totalApplications,
            approvedApplications,
            rejectedApplications,
            totalLoans,
            totalLoanAmount,
            totalRepayments,
            activeLoans,
            completedLoans
        ] = await Promise.all([
            prisma.application.count(),
            prisma.application.count({ where: { status: 'APPROVED' } }),
            prisma.application.count({ where: { status: 'REJECTED' } }),
            prisma.loan.count(),
            prisma.loan.aggregate({ _sum: { principalAmount: true } }),
            prisma.repayment.aggregate({ _sum: { amountPaid: true } }),
            prisma.loan.count({ where: { status: 'ACTIVE' } }),
            prisma.loan.count({ where: { status: 'COMPLETED' } })
        ]);

        const analytics = {
            applications: {
                total: totalApplications,
                approved: approvedApplications,
                rejected: rejectedApplications,
                pending: totalApplications - approvedApplications - rejectedApplications
            },
            loans: {
                total: totalLoans,
                active: activeLoans,
                completed: completedLoans,
                totalAmount: Number(totalLoanAmount._sum.principalAmount || 0),
                totalRepayments: Number(totalRepayments._sum.amountPaid || 0)
            }
        };

        sendResponse(res, 200, true, 'Analytics fetched', analytics);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

// Update application progress
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
