import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('CORS Configuration', () => {
    it('should allow requests from admin portal on Vercel', async () => {
        const res = await request(app)
            .get('/')
            .set('Origin', 'https://admin-nu-blush-61.vercel.app');

        expect(res.headers['access-control-allow-origin']).toBe('https://admin-nu-blush-61.vercel.app');
        expect(res.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow requests from a .vercel.app subdomain', async () => {
        const res = await request(app)
            .get('/')
            .set('Origin', 'https://random-preview.vercel.app');

        expect(res.headers['access-control-allow-origin']).toBe('https://random-preview.vercel.app');
    });

    it('should allow requests from localhost', async () => {
        const res = await request(app)
            .get('/')
            .set('Origin', 'http://localhost:5173');

        expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should reject unauthorized origins', async () => {
        const res = await request(app)
            .get('/')
            .set('Origin', 'https://malicious-site.com');

        // When origin is rejected, the header is either missing or doesn't match
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should handle preflight OPTIONS requests', async () => {
        const res = await request(app)
            .options('/')
            .set('Origin', 'https://admin-nu-blush-61.vercel.app')
            .set('Access-Control-Request-Method', 'POST')
            .set('Access-Control-Request-Headers', 'Content-Type');

        expect(res.status).toBe(204);
        expect(res.headers['access-control-allow-origin']).toBe('https://admin-nu-blush-61.vercel.app');
        expect(res.headers['access-control-allow-methods']).toContain('POST');
    });
});
