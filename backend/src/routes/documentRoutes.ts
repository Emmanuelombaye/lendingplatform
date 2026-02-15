import express, { Request, Response } from 'express';
import { upload } from '../middleware/upload';
import { protect } from '../middleware/auth';
import { sendResponse } from '../utils/response';
import prisma from '../utils/prisma';

const router = express.Router();

router.post('/upload', protect, upload.single('document'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return sendResponse(res, 400, false, 'No file uploaded');
        }

        const { applicationId, documentType } = req.body;

        if (!applicationId || !documentType) {
            return sendResponse(res, 400, false, 'Application ID and Document Type are required');
        }

        const document = await prisma.document.create({
            data: {
                applicationId: parseInt(applicationId),
                documentType,
                filePath: req.file.path
            }
        });

        sendResponse(res, 201, true, 'File uploaded successfully', document);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
});

export default router;
