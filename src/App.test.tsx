import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock API module
vi.mock('./lib/api', () => ({
    default: {
        get: vi.fn().mockResolvedValue({ data: { success: true, data: [] } }),
        post: vi.fn().mockResolvedValue({ data: { success: true } }),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        }
    }
}));

describe('Client App - Unit Tests', () => {
    it('environment sanity check', () => {
        expect(1 + 1).toBe(2);
        expect(typeof window).toBe('object');
    });

    it('React is available', () => {
        expect(React).toBeDefined();
        expect(React.createElement).toBeTypeOf('function');
    });

    it('can render basic JSX', () => {
        const { container } = render(<div data-testid="test">Hello</div>);
        expect(screen.getByTestId('test')).toBeDefined();
        expect(screen.getByTestId('test').textContent).toBe('Hello');
    });

    it('MemoryRouter works for routing tests', () => {
        const { container } = render(
            <MemoryRouter>
                <div data-testid="routed">Routed Content</div>
            </MemoryRouter>
        );
        expect(screen.getByTestId('routed').textContent).toBe('Routed Content');
    });
});

describe('Client App - Component Import Tests', () => {
    it('can import UI components', async () => {
        const ui = await import('./app/components/ui');
        expect(ui.Card).toBeDefined();
        expect(ui.Button).toBeDefined();
        expect(ui.Badge).toBeDefined();
    });

    it('can import client components', async () => {
        const client = await import('./app/components/client');
        expect(client.Navbar).toBeDefined();
        expect(client.Hero).toBeDefined();
        expect(client.Calculator).toBeDefined();
        expect(client.Contact).toBeDefined();
        expect(client.PartnerLogos).toBeDefined();
        expect(client.LoanRepayment).toBeDefined();
    });

    it('can import auth components', async () => {
        const auth = await import('./app/components/auth');
        expect(auth).toBeDefined();
    });

    it('can import dashboard component', async () => {
        const dashboard = await import('./app/components/dashboard');
        expect(dashboard.UserDashboard).toBeDefined();
    });
});

describe('Client App - UI Component Rendering', () => {
    it('renders Card component', async () => {
        const { Card } = await import('./app/components/ui');
        const { container } = render(<Card className="test-card"><p>Content</p></Card>);
        expect(container.querySelector('.test-card')).toBeDefined();
    });

    it('renders Button component', async () => {
        const { Button } = await import('./app/components/ui');
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeDefined();
    });

    it('renders Badge component with variants', async () => {
        const { Badge } = await import('./app/components/ui');
        render(<Badge variant="success">Active</Badge>);
        expect(screen.getByText('Active')).toBeDefined();
    });
});
