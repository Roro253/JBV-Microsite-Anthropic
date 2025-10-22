import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/auth/request-magic-link/route';

// We will mock dependent modules: airtable authorization + email sender + token creation.
vi.mock('@/lib/airtable', () => ({
  isAuthorizedEmail: vi.fn(async (email: string) => email === 'roronazari25@gmail.com'),
  normalizeEmail: (e: string) => e.trim().toLowerCase()
}));

vi.mock('@/lib/auth/magic-links', () => ({
  createMagicLinkToken: vi.fn(async () => 'test-token')
}));

vi.mock('@/lib/email/sendgrid', () => ({
  sendMagicLinkEmail: vi.fn(async () => ({ success: true }))
}));

describe('POST /api/auth/request-magic-link', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, NEXT_PUBLIC_SITE_URL: 'https://example.com' };
  });

  afterEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  it('returns success for authorized email roronazari25@gmail.com', async () => {
    const body = JSON.stringify({ email: 'roronazari25@gmail.com' });
    const request = new Request('https://example.com/api/auth/request-magic-link', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ success: true });
  });

  it('rejects unauthorized email with code unauthorized', async () => {
    const body = JSON.stringify({ email: 'someoneelse@example.com' });
    const request = new Request('https://example.com/api/auth/request-magic-link', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' }
    });
    const response = await POST(request);
    expect(response.status).toBe(403);
    const json = await response.json();
    expect(json.code).toBe('unauthorized');
  });
});
