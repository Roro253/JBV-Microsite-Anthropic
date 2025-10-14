import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthorizedEmail, normalizeEmail, resolveEmailFields, buildEmailFormula } from "@/lib/airtable";
import { createMagicLinkToken } from "@/lib/auth/magic-links";
import { sendMagicLinkEmail } from "@/lib/email/sendgrid";
import { isIntegrationError } from "@/lib/errors";

const RequestSchema = z.object({
  email: z.string().email("Invalid email address")
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parseResult = RequestSchema.safeParse(json);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid email", code: "invalid" },
      { status: 400 }
    );
  }

  const email = normalizeEmail(parseResult.data.email);

  try {
    const isAuthorized = await isAuthorizedEmail(email);

    if (!isAuthorized) {
      if (process.env.AIRTABLE_DEBUG === '1') {
        const fields = resolveEmailFields();
        const formula = buildEmailFormula(fields, email);
        let sampleFields: string[] = [];
        try {
          const baseId = process.env.AIRTABLE_BASE_ID;
          const tableId = process.env.AIRTABLE_TABLE_ID;
          const apiKey = process.env.AIRTABLE_API_KEY;
          if (baseId && tableId && apiKey) {
            const url = `https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=1`;
            const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.records) && data.records[0]?.fields) {
                sampleFields = Object.keys(data.records[0].fields);
              }
            }
          }
        } catch {
          // swallow debug fetch errors
        }
  console.warn('[auth] unauthorized email debug', { email, fields, formula, sampleFields, envEmailField: process.env.AIRTABLE_EMAIL_FIELD, envEmailField2: process.env.AIRTABLE_EMAIL_FIELD_2, envEmailFieldsList: process.env.AIRTABLE_EMAIL_FIELDS });
        return NextResponse.json(
          { error: "Unauthorized email", code: "unauthorized", debug: { fields, formula, sampleFields } },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: "Unauthorized email", code: "unauthorized" },
        { status: 403 }
      );
    }

    const token = await createMagicLinkToken(email);
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const magicLink = `${origin}/api/auth/verify?token=${token}`;

    await sendMagicLinkEmail({
      to: email,
      magicLink
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (isIntegrationError(error)) {
      console.error(
        `Failed to process magic link request via ${error.service}`,
        error
      );
      const code =
        error.service === "airtable" ? "registry_unavailable" : "email_failed";
      return NextResponse.json(
        {
          error: "Required integration is currently unavailable",
          code
        },
        { status: 503 }
      );
    }

    console.error("Failed to process magic link request", error);
    return NextResponse.json(
      { error: "Unable to process request", code: "server" },
      { status: 500 }
    );
  }
}
