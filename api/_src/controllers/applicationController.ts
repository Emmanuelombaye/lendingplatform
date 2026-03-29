import { Request, Response } from 'express';
import path from 'path';
import { ApplicationMode } from '@prisma/client';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

// Create new application
export const createApplication = async (req: Request, res: Response) => {
  try {
    // Get userId from the authenticated user (JWT token via protect middleware)
    // @ts-ignore
    const userId = req.user?.id;
    const {
      loanAmount,
      repaymentPeriod,
      mode: rawMode,
      idType,
      idNumber,
      tinNumber,
      businessName,
      businessRegNo,
      onlineFormData,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return sendResponse(res, 401, false, "Uthibitisho unahitajika");
    }

    if (!loanAmount || !repaymentPeriod) {
      return sendResponse(
        res,
        400,
        false,
        "Tafadhali toa `loanAmount` na `repaymentPeriod`"
      );
    }

    const parsedAmount = Number(loanAmount);
    const parsedPeriod = Number(repaymentPeriod);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return sendResponse(res, 400, false, "Kiasi cha mkopo si sahihi");
    }

    if (isNaN(parsedPeriod) || parsedPeriod <= 0) {
      return sendResponse(res, 400, false, "Muda wa malipo si sahihi");
    }

    // Determine application mode – default to MANUAL to keep existing behaviour
    const normalizedMode = typeof rawMode === 'string' ? rawMode.toUpperCase() : 'MANUAL';
    const mode: ApplicationMode =
      normalizedMode === 'ONLINE' ? 'ONLINE' : 'MANUAL';

    // Create the application (online or manual share the same pipeline)
    const application = await prisma.application.create({
      data: {
        userId,
        loanAmount: parsedAmount,
        repaymentPeriod: parsedPeriod,
        status: 'SUBMITTED',
        progressNote: 'Maombi yametumwa - yanasubiri ukaguzi wa msimamizi',
        mode,
        // Structured details are only meaningful for ONLINE applications but remain optional
        idType: mode === 'ONLINE' ? (idType || null) : null,
        idNumber: mode === 'ONLINE' ? (idNumber || null) : null,
        tinNumber: mode === 'ONLINE' ? (tinNumber || null) : null,
        businessName: mode === 'ONLINE' ? (businessName || null) : null,
        businessRegNo: mode === 'ONLINE' ? (businessRegNo || null) : null,
        onlineFormData: mode === 'ONLINE' ? (onlineFormData || null) : null,
      }
    });

    // Create notification
    const notificationTitle = '📋 Application Submitted';
    const notificationMessage = `Your loan application for TZS ${Number(loanAmount).toLocaleString()} has been submitted and is awaiting admin review.`;

    await prisma.notification.create({
      data: {
        userId,
        applicationId: application.id,
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

    const parsedId = parseInt(id as string);
    if (isNaN(parsedId)) {
      return sendResponse(res, 400, false, 'Invalid application ID');
    }

    if (!finalType) {
      return sendResponse(res, 400, false, 'Document type is required');
    }

    const filePathForDb = 'uploads/' + path.basename(req.file.path);

    const document = await prisma.document.create({
      data: {
        applicationId: parsedId,
        documentType: finalType,
        filePath: filePathForDb
      }
    });

    sendResponse(res, 201, true, 'File uploaded successfully', document);
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'Server Error');
  }
};
