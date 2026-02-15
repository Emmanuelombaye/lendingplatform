import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';

export const getPublicSettings = async (req: Request, res: Response) => {
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

export const submitContactForm = async (req: Request, res: Response) => {
    try {
        const { fullName, email, subject, message } = req.body;

        if (!fullName || !email || !message) {
            return sendResponse(res, 400, false, 'Please provide full name, email, and message');
        }

        const newMessage = await prisma.message.create({
            data: {
                fullName,
                email,
                subject,
                message
            }
        });

        sendResponse(res, 201, true, 'Message sent successfully', newMessage);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Failed to send message');
    }
};
