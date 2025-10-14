import { NextResponse } from 'next/server';
import { buildEmailFormula, buildSimpleEmailFormula, normalizeEmail, resolveEmailFields } from '@/lib/airtable';

// GET /api/debug/airtable?email=foo@example.com
// Provides diagnostic info about Airtable email matching configuration.
// Only outputs formulas; does not reveal env secrets.
// NOTE: Consider protecting this route or removing after debugging.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawEmail = url.searchParams.get('email');
  if (!rawEmail) {
    return NextResponse.json({ error: 'email query param required' }, { status: 400 });
  }
  const email = normalizeEmail(rawEmail);
  const fields = resolveEmailFields();
  const complex = buildEmailFormula(fields, email);
  const simple = buildSimpleEmailFormula(fields, email);

  return NextResponse.json({
    email,
    fields,
    forceSimple: process.env.AIRTABLE_FORCE_SIMPLE === '1',
    complexFormula: complex,
    simpleFormula: simple
  });
}
