import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { config } from "./config/config";

dotenv.config();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`[INIT] Created missing uploads directory at: ${uploadDir}`);
}

const app: Express = express();

// 0. Request Logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
  next();
});

import { limiter } from "./middleware/limiter";

const allowedOrigins = [
  "https://admin.getvertexloans.com",
  "https://getvertexloans.com",
  "https://www.getvertexloans.com",
  "https://admin-nu-blush-61.vercel.app",
  "https://vertex-admin-nu.vercel.app",
  "https://vertexloans.onrender.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
];

// 1. CORS 'Hammer' Fix - Very permissive and robust to ensure no CORS blocking
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // List of specifically allowed domains for credential support
  const isAllowedDomain = !origin ||
    allowedOrigins.some(o => origin.toLowerCase().includes(o.replace('https://', '').replace('http://', ''))) ||
    origin.endsWith('.vercel.app') ||
    origin.includes('getvertexloans.com');

  if (origin && isAllowedDomain) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (origin) {
    // Fallback for debugging, allow the origin anyway but log it
    console.warn(`[CORS] Debug-allowing origin: ${origin}`);
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Using standard cors as a backup layer
app.use(cors({
  origin: true, // Mirrors the request origin
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir)); // Serve uploaded documents and payment screenshots
// Helmet configured to be more compatible with cross-origin requests
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
app.use(limiter);

app.get("/", (req: Request, res: Response) => {
  res.send("Vertex Loans Backend is running");
});

import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import documentRoutes from './routes/documentRoutes';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';
import loanRoutes from './routes/loanRoutes';
import userRoutes from './routes/userRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/users', userRoutes);

// 2. Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  // Ensure CORS headers are present even on errors
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

export default app;
