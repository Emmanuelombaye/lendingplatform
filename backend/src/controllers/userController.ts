import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

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
                bankName: true,
                accountNumber: true,
                payBill: true,
                createdAt: true
            }
        });

        if (!user) return sendResponse(res, 404, false, 'User not found');
        sendResponse(res, 200, true, 'Profile fetched', user);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { fullName, phone, bankName, accountNumber, payBill } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                fullName,
                phone,
                bankName,
                accountNumber,
                payBill
            }
        });

        sendResponse(res, 200, true, 'Profile updated successfully', updatedUser);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getDashboardData = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        const [user, applications] = await Promise.all([
            prisma.user.findUnique({ where: { id: userId } }),
            prisma.application.findMany({
                where: { userId },
                include: { loan: true },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        if (!user) return sendResponse(res, 404, false, 'User not found');

        // Logic for eligibility (placeholder)
        const eligibilityLimit = 300000;
        const activeLoan = applications.find(app => app.loan && app.loan.status === 'ACTIVE');

        sendResponse(res, 200, true, 'Dashboard data fetched', {
            user: {
                fullName: user.fullName,
                kycStatus: user.kycStatus,
                isVerified: user.isVerified
            },
            eligibilityLimit,
            activeLoan: activeLoan ? activeLoan.loan : null,
            applications: applications.map(app => ({
                id: app.id,
                amount: app.loanAmount,
                status: app.status,
                progress: app.processingProgress,
                createdAt: app.createdAt
            }))
        });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const updateKycStatus = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { status } = req.body;

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                kycStatus: status,
                isVerified: status === 'VERIFIED'
            }
        });

        sendResponse(res, 200, true, 'KYC status updated', user);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || user.otpCode !== otp) {
            return sendResponse(res, 400, false, 'Invalid OTP');
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { isVerified: true, otpCode: null }
        });

        sendResponse(res, 200, true, 'OTP verified successfully');
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.passwordHash) {
            return sendResponse(res, 404, false, 'User not found or social login only');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return sendResponse(res, 400, false, 'Incorrect current password');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash }
        });

        sendResponse(res, 200, true, 'Password updated successfully');
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getActivityLogs = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user.id;

        // This is a simulation since we don't have an Activity table yet
        // In a real app, this would query a dedicated logs table
        const logs = [
            { id: 1, action: 'Login detected', details: 'Nairobi, Kenya', date: new Date().toISOString() },
            { id: 2, action: 'Profile updated', details: 'Bank details added', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, action: 'Login detected', details: 'Nairobi, Kenya', date: new Date(Date.now() - 172800000).toISOString() }
        ];

        sendResponse(res, 200, true, 'Activity logs fetched', logs);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};
