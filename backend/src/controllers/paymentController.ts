import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { PaymentService } from '../services/paymentService';

export const initiateProcessingFeePayment = async (req: Request, res: Response) => {
    try {
        const { applicationId } = req.params as { applicationId: string };
        // @ts-ignore
        const userId = req.user.id;

        const application = await prisma.application.findUnique({
            where: { id: parseInt(applicationId) },
            include: { user: true }
        });

        if (!application) {
            return sendResponse(res, 404, false, "Application not found");
        }

        if (application.userId !== userId) {
            return sendResponse(res, 403, false, "Unauthorized");
        }

        if (application.status !== 'APPROVED') {
            return sendResponse(res, 400, false, "Application must be approved before paying fee");
        }

        if (application.processingFeePaid) {
            return sendResponse(res, 400, false, "Processing fee already paid");
        }

        const settings = await prisma.settings.findFirst();
        const feePercent = settings ? Number(settings.processingFeePercent) : 6.5;
        const amount = Number(application.loanAmount) * (feePercent / 100);

        const tx_ref = `FEE-${application.id}-${Date.now()}`;

        const flwResponse = await PaymentService.initiateProcessingFee({
            amount,
            email: application.user.email || 'customer@example.com',
            phone: application.user.phone || '',
            fullName: application.user.fullName,
            tx_ref,
            callback_url: `${process.env.FRONTEND_URL || 'https://vertexloans.onrender.com'}/dashboard?payment=success&appId=${application.id}`
        });

        if (flwResponse.status === 'success') {
            sendResponse(res, 200, true, "Payment initiated", {
                link: flwResponse.data.link,
                tx_ref
            });
        } else {
            sendResponse(res, 400, false, "Failed to initiate payment", flwResponse);
        }

    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "Server Error");
    }
};

export const flutterwaveWebhook = async (req: Request, res: Response) => {
    // Note: In production, verify the Flutterwave signature headers
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = req.headers['verif-hash'];

    if (secretHash && signature !== secretHash) {
        return res.status(401).end();
    }

    const { status, tx_ref, id: flwTransactionId } = req.body.data || req.body;

    if (status === 'successful') {
        try {
            // Verify with Flutterwave API to be sure
            const verification = await PaymentService.verifyTransaction(flwTransactionId);

            if (verification.status === 'success' && verification.data.status === 'successful') {
                const txRefParts = tx_ref.split('-');
                if (txRefParts[0] === 'FEE') {
                    const applicationId = parseInt(txRefParts[1]);

                    // Update application
                    const application = await prisma.application.update({
                        where: { id: applicationId },
                        data: {
                            processingFeePaid: true,
                            processingProgress: 100,
                            progressNote: 'Processing fee paid via Flutterwave. Loan activated.'
                        },
                        include: { user: true }
                    });

                    // Create Transaction record
                    await prisma.transaction.create({
                        data: {
                            userId: application.userId,
                            type: 'PROCESSING_FEE',
                            amount: verification.data.amount,
                            description: `Processing fee paid via Flutterwave (Ref: ${tx_ref})`,
                            status: 'COMPLETED',
                            transactionId: tx_ref
                        }
                    });

                    // Create Loan (Logic from adminController)
                    const loanAmount = Number(application.loanAmount);
                    const monthlyInterestRate = 0.06;
                    const months = application.repaymentPeriod;

                    const monthlyInterest = loanAmount * monthlyInterestRate;
                    const totalInterest = monthlyInterest * months;
                    const totalRepayment = loanAmount + totalInterest;
                    const monthlyInstallment = totalRepayment / months;

                    const endDate = new Date();
                    endDate.setMonth(endDate.getMonth() + months);

                    const loan = await prisma.loan.create({
                        data: {
                            applicationId: application.id,
                            userId: application.userId,
                            principalAmount: loanAmount,
                            interestRate: 6.0,
                            totalInterest,
                            totalRepayment,
                            monthlyInstallment,
                            startDate: new Date(),
                            endDate,
                            status: 'PENDING_DISBURSEMENT'
                        }
                    });

                    // Notify user
                    await prisma.notification.create({
                        data: {
                            userId: application.userId,
                            applicationId: application.id,
                            type: 'SUCCESS',
                            title: '✅ Payment Confirmed!',
                            message: `Your processing fee of TZS ${verification.data.amount.toLocaleString()} has been confirmed. Your loan is now ready for withdrawal.`,
                            persistent: true,
                            actionUrl: '/dashboard'
                        }
                    });

                    return res.status(200).send('Webhook handled');
                }
            }
        } catch (error) {
            console.error("Webhook processing error:", error);
            return res.status(500).send('Webhook Error');
        }
    }

    res.status(200).send('Webhook received');
};
