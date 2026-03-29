const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");

dotenv.config();

const app = express();

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false
}));

// Lazy Prisma Initializer
let prisma;
function getPrisma() {
    if (!prisma) {
        console.log("[PRISMA] 🚀 Initializing CommonJS Singleton...");
        prisma = new PrismaClient({ log: ['error', 'warn'] });
    }
    return prisma;
}

// Routes
app.get("/api/test-db", async (req, res) => {
    try {
        const client = getPrisma();
        await client.$queryRaw`SELECT 1 as test`;
        res.json({ ok: true, timestamp: new Date() });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/test.js", (req, res) => {
     res.json({ status: "alive (cjs)", timestamp: new Date() });
});

// Since the subroutes are TS/ESM, we use dynamic import
app.use(async (req, res, next) => {
    try {
        if (req.url.startsWith("/api/auth")) {
             const { default: auth } = await import("./_src/routes/authRoutes.js");
             return auth(req, res, next);
        }
        if (req.url.startsWith("/api/public")) {
             const { default: pub } = await import("./_src/routes/publicRoutes.js");
             return pub(req, res, next);
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = app;
