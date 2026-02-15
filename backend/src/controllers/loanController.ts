import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

export const getActiveLoan = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const application = await prisma.application.findFirst({
            where: {
                userId: userId,
                status: 'APPROVED',
                loan: {
                    status: 'ACTIVE'
                }
            },
            include: {
                loan: {
                    include: {
                        repayments: {
                            orderBy: { paymentDate: 'desc' }
                        }
                    }
                }
            }
        });

        if (!application || !application.loan) {
            return sendResponse(res, 404, false, 'No active loan found');
        }

        const loan = application.loan;

        // Calculate dynamic properties
        const totalPaid = loan.repayments.reduce((acc: number, r: any) => acc + Number(r.amountPaid), 0);
        const remainingBalance = Number(loan.totalRepayment) - totalPaid;
        const progress = (totalPaid / Number(loan.totalRepayment)) * 100;

        const loanDetails = {
            ...loan,
            totalPaid,
            remainingBalance,
            progress
        };

        sendResponse(res, 200, true, 'Active loan fetched', loanDetails);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const repayLoan = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { amount } = req.body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return sendResponse(res, 400, false, 'Invalid amount');
        }

        const application = await prisma.application.findFirst({
            where: {
                userId: userId,
                status: 'APPROVED',
                loan: {
                    status: 'ACTIVE'
                }
            },
            include: { loan: { include: { repayments: true } } }
        });

        if (!application || !application.loan) {
            return sendResponse(res, 404, false, 'No active loan found');
        }

        const loan = application.loan;
        const totalPaid = loan.repayments.reduce((acc: number, r: any) => acc + Number(r.amountPaid), 0);
        const currentBalance = Number(loan.totalRepayment) - totalPaid;

        if (amount > currentBalance) {
            return sendResponse(res, 400, false, `Amount exceeds remaining balance of ${currentBalance}`);
        }

        const newBalance = currentBalance - Number(amount);

        const repayment = await prisma.repayment.create({
            data: {
                loanId: loan.id,
                amountPaid: amount,
                remainingBalance: newBalance,
                status: 'PAID'
            }
        });

        if (newBalance <= 0) {
            await prisma.loan.update({
                where: { id: loan.id },
                data: { status: 'COMPLETED' }
            });
        }

        sendResponse(res, 200, true, 'Repayment successful', { repayment, newBalance });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};
