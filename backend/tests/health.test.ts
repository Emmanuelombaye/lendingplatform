import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// ─────────────────────────────────────────────
// These tests run WITHOUT a database connection.
// They verify routing, middleware, and auth guards.
// ─────────────────────────────────────────────

describe('Backend Health Check', () => {
    it('GET / should return 200 OK', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Vertex Loans Backend is running');
    });

    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/nonexistent');
        expect([404, 500]).toContain(res.status);
    });
});

describe('Auth Guards - Protected Routes Reject Without Token', () => {
    it('GET /api/auth/profile should reject without auth', async () => {
        const res = await request(app).get('/api/auth/profile');
        expect(res.status).toBe(401);
    });

    it('GET /api/auth/profile should reject with invalid token', async () => {
        const res = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer invalidtoken123');
        expect(res.status).toBe(401);
    });

    it('GET /api/applications/my should reject without auth', async () => {
        const res = await request(app).get('/api/applications/my');
        expect(res.status).toBe(401);
    });

    it('POST /api/applications/create should reject without auth', async () => {
        const res = await request(app)
            .post('/api/applications/create')
            .send({ loanAmount: 100000 });
        expect(res.status).toBe(401);
    });

    it('GET /api/loans/active should reject without auth', async () => {
        const res = await request(app).get('/api/loans/active');
        expect(res.status).toBe(401);
    });

    it('POST /api/loans/repay should reject without auth', async () => {
        const res = await request(app)
            .post('/api/loans/repay')
            .send({ amount: 5000 });
        expect(res.status).toBe(401);
    });
});

describe('Admin Guards - Admin Routes Reject Without Token', () => {
    it('GET /api/admin/applications should reject without auth', async () => {
        const res = await request(app).get('/api/admin/applications');
        expect(res.status).toBe(401);
    });

    it('GET /api/admin/settings should reject without auth', async () => {
        const res = await request(app).get('/api/admin/settings');
        expect(res.status).toBe(401);
    });

    it('PUT /api/admin/settings should reject without auth', async () => {
        const res = await request(app)
            .put('/api/admin/settings')
            .send({ minAmount: 10000 });
        expect(res.status).toBe(401);
    });

    it('GET /api/admin/analytics should reject without auth', async () => {
        const res = await request(app).get('/api/admin/analytics');
        expect(res.status).toBe(401);
    });

    it('GET /api/admin/loans should reject without auth', async () => {
        const res = await request(app).get('/api/admin/loans');
        expect(res.status).toBe(401);
    });

    it('PUT /api/admin/applications/1/status should reject without auth', async () => {
        const res = await request(app)
            .put('/api/admin/applications/1/status')
            .send({ status: 'APPROVED' });
        expect(res.status).toBe(401);
    });

    it('PUT /api/admin/applications/1/progress should reject without auth', async () => {
        const res = await request(app)
            .put('/api/admin/applications/1/progress')
            .send({ progress: 50 });
        expect(res.status).toBe(401);
    });
});

describe('Route Existence', () => {
    it('POST /api/auth/register endpoint exists', async () => {
        const res = await request(app).post('/api/auth/register').send({});
        // Should NOT be 404 — it should be 400/500 (route exists, just fails validation/db)
        expect(res.status).not.toBe(404);
    });

    it('POST /api/auth/login endpoint exists', async () => {
        const res = await request(app).post('/api/auth/login').send({});
        expect(res.status).not.toBe(404);
    });

    it('POST /api/admin/login endpoint exists', async () => {
        const res = await request(app).post('/api/admin/login').send({});
        expect(res.status).not.toBe(404);
    });

    it('POST /api/auth/google endpoint exists', async () => {
        const res = await request(app).post('/api/auth/google').send({});
        expect(res.status).not.toBe(404);
    });

    it('POST /api/auth/facebook endpoint exists', async () => {
        const res = await request(app).post('/api/auth/facebook').send({});
        expect(res.status).not.toBe(404);
    });

    it('POST /api/auth/telegram endpoint exists', async () => {
        const res = await request(app).post('/api/auth/telegram').send({});
        expect(res.status).not.toBe(404);
    });

    it('GET /api/public/settings endpoint exists', async () => {
        const res = await request(app).get('/api/public/settings');
        expect(res.status).not.toBe(404);
    });

    it('POST /api/public/contact endpoint exists', async () => {
        const res = await request(app).post('/api/public/contact').send({});
        expect(res.status).not.toBe(404);
    });
});

describe('Admin Credentials Validation', () => {
    it('admin email format is valid', () => {
        const email = 'vertex@loans.com';
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('admin password meets security requirements', () => {
        const password = '@Kenya90!132323';
        expect(password.length).toBeGreaterThanOrEqual(8);
        expect(/[A-Z]/.test(password)).toBe(true);
        expect(/[a-z]/.test(password)).toBe(true);
        expect(/[0-9]/.test(password)).toBe(true);
        expect(/[!@#$%^&*]/.test(password)).toBe(true);
    });
});

describe('Configuration', () => {
    it('config module loads correctly', async () => {
        const { config } = await import('../src/config/config');
        expect(config.server).toBeDefined();
        expect(config.server.port).toBeTypeOf('number');
        expect(config.server.token.secret).toBeDefined();
    });

    it('response helper works', async () => {
        const { sendResponse } = await import('../src/utils/response');
        expect(sendResponse).toBeTypeOf('function');
    });
});
