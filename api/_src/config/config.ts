import dotenv from 'dotenv';

dotenv.config();

const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || '3600';
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'coolIssuer';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'superencryptedsecret';

const SMS_USERNAME = process.env.SMS_USERNAME || 'sandbox';
const SMS_API_KEY = process.env.SMS_API_KEY || '';
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || '';

const EMAIL_HOST = process.env.EMAIL_HOST || '';
const EMAIL_PORT = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587;
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY || '';
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET || '';
const PESAPAL_ENV = process.env.PESAPAL_ENV || 'sandbox';
const PESAPAL_CALLBACK_URL = process.env.PESAPAL_CALLBACK_URL || '';

const FLW_PUBLIC_KEY = process.env.FLW_PUBLIC_KEY || '';
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY || '';
const FLW_ENCRYPTION_KEY = process.env.FLW_ENCRYPTION_KEY || '';
const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH || '';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const config = {
    email: {
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        user: EMAIL_USER,
        pass: EMAIL_PASS
    },
    supabase: {
        url: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
        jwtSecret: SUPABASE_JWT_SECRET
    },
    sms: {
        username: SMS_USERNAME,
        apiKey: SMS_API_KEY,
        senderId: SMS_SENDER_ID
    },
    pesapal: {
        consumerKey: PESAPAL_CONSUMER_KEY,
        consumerSecret: PESAPAL_CONSUMER_SECRET,
        env: PESAPAL_ENV,
        callbackUrl: PESAPAL_CALLBACK_URL
    },
    flutterwave: {
        publicKey: FLW_PUBLIC_KEY,
        secretKey: FLW_SECRET_KEY,
        encryptionKey: FLW_ENCRYPTION_KEY,
        secretHash: FLW_SECRET_HASH
    },
    server: {
        port: SERVER_PORT,
        frontendUrl: FRONTEND_URL,
        token: {
            expireTime: SERVER_TOKEN_EXPIRETIME,
            issuer: SERVER_TOKEN_ISSUER,
            secret: SERVER_TOKEN_SECRET
        }
    }
};

