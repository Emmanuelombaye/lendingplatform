import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { sendResponse } from '../utils/response';
import { config } from '../config/config';

const generateToken = (id: number, role: string) => {
    return jwt.sign({ id, role }, config.server.token.secret, {
        expiresIn: Number(config.server.token.expireTime) || 3600,
    });
};

export const register = async (req: Request, res: Response) => {
    try {
        const { fullName, email, phone, password } = req.body;

        const userExists = await prisma.user.findUnique({
            where: { email },
        });

        if (userExists) {
            return sendResponse(res, 400, false, 'User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                fullName,
                email,
                phone,
                passwordHash,
            },
        });

        if (user) {
            sendResponse(res, 201, true, 'User registered successfully', {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            sendResponse(res, 400, false, 'Invalid user data');
        }
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && user.passwordHash && (await bcrypt.compare(password, user.passwordHash))) {
            sendResponse(res, 200, true, 'Login successful', {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            sendResponse(res, 401, false, 'Invalid email or password');
        }
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (user && (await bcrypt.compare(password, user.passwordHash || ''))) {
            if (user.role !== 'ADMIN') {
                return sendResponse(res, 403, false, 'Access denied: Admins only');
            }

            sendResponse(res, 200, true, 'Admin Login successful', {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user.id, user.role),
            });
        } else {
            sendResponse(res, 401, false, 'Invalid email or password');
        }
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { email, googleId, fullName, photoUrl } = req.body;

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    fullName,
                    email,
                    googleId,
                    role: 'USER',
                }
            });
        } else if (!user.googleId) {
            // Link account
            user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId }
            });
        }

        sendResponse(res, 200, true, 'Google login successful', {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const facebookLogin = async (req: Request, res: Response) => {
    try {
        const { email, facebookId, fullName, photoUrl } = req.body;

        let user = await prisma.user.findUnique({ where: { facebookId } });

        if (!user && email) {
            user = await prisma.user.findUnique({ where: { email } });
        }

        if (!user) {
            user = await prisma.user.create({
                data: {
                    fullName,
                    email: email || undefined,
                    facebookId,
                    role: 'USER',
                }
            });
        } else if (!user.facebookId) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { facebookId }
            });
        }

        sendResponse(res, 200, true, 'Facebook login successful', {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

const verifyTelegramAuth = (data: any, botToken: string) => {
    const { hash, ...checkData } = data;
    const dataCheckString = Object.keys(checkData)
        .sort()
        .map(key => `${key}=${checkData[key]}`)
        .join('\n');

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return hmac === hash;
};

export const telegramLogin = async (req: Request, res: Response) => {
    try {
        const telegramData = req.body;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!telegramData.hash) {
            return sendResponse(res, 400, false, 'Missing Telegram hash');
        }

        // Verify Telegram Auth
        if (botToken && !verifyTelegramAuth(telegramData, botToken)) {
            return sendResponse(res, 401, false, 'Invalid Telegram authentication');
        }

        const { id, first_name, username, photo_url } = telegramData;
        let user = await prisma.user.findUnique({ where: { telegramId: id.toString() } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    fullName: first_name + (username ? ` (${username})` : ''),
                    telegramId: id.toString(),
                    role: 'USER',
                }
            });
        }

        sendResponse(res, 200, true, 'Telegram login successful', {
            id: user.id,
            fullName: user.fullName,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
};

export const getProfile = async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.user.id;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true
            }
        });
        if (user) {
            sendResponse(res, 200, true, 'User profile fetched', user);
        } else {
            sendResponse(res, 404, false, 'User not found');
        }
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, 'Server Error');
    }
}
