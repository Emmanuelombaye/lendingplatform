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
            data: { status }
        });

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
            data: { processingFeePaid: true }
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

            await prisma.loan.create({
                data: {
                    applicationId: application.id,
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
        }

        sendResponse(res, 200, true, 'Processing fee confirmed and loan processed', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getLoans = async (req: Request, res: Response) => {
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
