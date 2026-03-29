import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { PrismaClient } from '@prisma/client';

dotenv.config();

// ─── Prisma Setup with Deferral ───────────────────────────────────────────────
let actualPrisma: PrismaClient;
const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        if (!actualPrisma) {
            actualPrisma = new PrismaClient({
                log: ['error', 'warn'],
            });
        }
        return (actualPrisma as any)[prop];
    }
});

const app: Express = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));

// Path redirection for Vercel
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        // Log the internal routing
        console.log(`[VERCEL-API] Processing: ${req.method} ${req.url}`);
    }
    next();
});

// ─── Internal Diagnostics ──────────────────────────────────────────────────
app.get("/api/diag", async (req: Request, res: Response) => {
    const diag: any = { status: "alive", timestamp: new Date() };
    try {
        await prisma.$queryRaw`SELECT 1`;
        diag.database = "connected";
    } catch (e: any) {
        diag.database = "disconnected";
        diag.error = e.message;
    }
    res.json(diag);
});

// ─── Standard Route Includes ──────────────────────────────────────────────
// We use dynamic imports to guarantee the Vercel function stays within memory limits
import authRoutes from './_src/routes/authRoutes.js';
import publicRoutes from './_src/routes/publicRoutes.js';
import applicationRoutes from './_src/routes/applicationRoutes.js';
import documentRoutes from './_src/routes/documentRoutes.js';
import adminRoutes from './_src/routes/adminRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// ─── Global Error Handler ──────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error("[CRITICAL] API Crash:", err);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: err.message
    });
});

// ─── Vercel Handler Export ─────────────────────────────────────────────────
export default app;
