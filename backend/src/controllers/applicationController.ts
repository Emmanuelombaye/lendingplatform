import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

// Create new application
export const createApplication = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { loanAmount, repaymentPeriod } = req.body;

        const application = await prisma.application.create({
            data: {
                userId,
                loanAmount: parseFloat(loanAmount),
                repaymentPeriod: parseInt(repaymentPeriod),
            },
        });

        sendResponse(res, 201, true, 'Application created successfully', application);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

// Get my applications
export const getMyApplications = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        const applications = await prisma.application.findMany({
            where: { userId },
            include: {
                documents: true,
                loan: true,
                adminNotes: true
            },
            orderBy: { createdAt: 'desc' }
        });

        sendResponse(res, 200, true, 'Applications fetched', applications);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};
