import dotenv from 'dotenv';

dotenv.config();

const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const SERVER_TOKEN_EXPIRETIME = process.env.SERVER_TOKEN_EXPIRETIME || '3600';
const SERVER_TOKEN_ISSUER = process.env.SERVER_TOKEN_ISSUER || 'coolIssuer';
const SERVER_TOKEN_SECRET = process.env.SERVER_TOKEN_SECRET || 'superencryptedsecret';

const MYSQL_HOST = process.env.MYSQLHOST || 'localhost';
const MYSQL_DATABASE = process.env.MYSQLDATABASE || 'vertexloans';
const MYSQL_USER = process.env.MYSQLUSER || 'root';
const MYSQL_PASSWORD = process.env.MYSQLPASSWORD || '';

const MONGO_URL = process.env.MONGO_URL || '';

export const config = {
    mongo: {
        url: MONGO_URL
    },
    mysql: {
        host: MYSQL_HOST,
        database: MYSQL_DATABASE,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD
    },
    server: {
        port: SERVER_PORT,
        token: {
            expireTime: SERVER_TOKEN_EXPIRETIME,
            issuer: SERVER_TOKEN_ISSUER,
            secret: SERVER_TOKEN_SECRET
        }
    }
};
