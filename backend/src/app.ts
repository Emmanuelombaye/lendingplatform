import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config/config';

dotenv.config();

const app: Express = express();

import { limiter } from './middleware/limiter';

const allowedOrigins = [
    'https://admin.getvertexloans.com',
    'https://getvertexloans.com',
    'https://www.getvertexloans.com',
    'https://admin-nu-blush-61.vercel.app',
    'https://vertex-admin-nu.vercel.app',
    'https://vertexloans.onrender.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
];

// 1. CORS should be configured BEFORE body parsers to handle OPTIONS preflight requests
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [];
        const combinedAllowed = [...allowedOrigins, ...envOrigins];

        if (combinedAllowed.includes(origin) || combinedAllowed.includes('*') || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight response for 24 hours
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(limiter);

app.get('/', (req: Request, res: Response) => {
    res.send('Vertex Loans Backend is running');
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

export default app;
