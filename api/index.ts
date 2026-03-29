import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { PrismaClient } from '@prisma/client';

dotenv.config();

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
import { getPrisma } from './lib/prisma.js';

app.get("/api/test-db", async (req: Request, res: Response) => {
    try {
        const prisma = getPrisma();
        await prisma.$queryRaw`SELECT 1`;
        res.json({ ok: true, timestamp: new Date() });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/public/settings", async (req: Request, res: Response) => {
    console.log("🚀 API HIT: /api/public/settings");
    try {
        const prisma = getPrisma();
        console.log("✅ Prisma initialized");
        
        const settings = await prisma.settings.findFirst();
        console.log("✅ Query success");
        
        res.status(200).json(settings || {});
    } catch (err: any) {
        console.error("🔥 SETTINGS ERROR:", err);
        res.status(500).json({
            error: err.message,
            stack: err.stack,
            message: "Verify table 'settings' exists and Prisma engine is bundled."
        });
    }
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
