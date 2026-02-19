import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

// Create new application
export const createApplication = async (req: Request, res: Response) => {
  try {
    const { userId, loanAmount, repaymentPeriod } = req.body;

    // Validate required fields
    if (!userId || !loanAmount || !repaymentPeriod) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide userId, loanAmount, and repaymentPeriod"
      );
    }

    // Create the application
    const application = await prisma.application.create({
      data: {
        userId,
        loanAmount,
        repaymentPeriod,
        status: 'SUBMITTED', // PENDING - requires manual admin approval
        progressNote: 'Application submitted - awaiting admin review'
      }
    });

    // Create notification
    const notificationTitle = '📋 Application Submitted';
    const notificationMessage = `Your loan application for KES ${Number(loanAmount).toLocaleString()} has been submitted and is awaiting admin review.`;

    await prisma.notification.create({
      data: {
        userId,
        loanId: application.id,
        type: 'INFO',
        title: notificationTitle,
        message: notificationMessage,
        persistent: false
      }
    });

    // No auto-approval - loan will be created only after admin approval
    sendResponse(res, 201, true, 'Application submitted successfully', {
      application,
      autoApproved: false,
      requiresManualApproval: true,
      message: 'Application is pending admin approval'
    });
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
// Upload document for an application
export const uploadDocument = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendResponse(res, 400, false, 'No file uploaded');
        }

        const { id } = req.params;
        const { type, documentType } = req.body;
        const finalType = String(type || documentType);

        if (!finalType) {
            return sendResponse(res, 400, false, 'Document type is required');
        }

        const document = await prisma.document.create({
            data: {
                applicationId: parseInt(id as string),
                documentType: finalType,
                filePath: req.file.path
            }
        });

        sendResponse(res, 201, true, 'File uploaded successfully', document);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};
