import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ensureAirtableConfigured,
  isAuthorizedEmail,
  normalizeEmail
} from "@/lib/airtable";
import { createMagicLinkToken } from "@/lib/auth/magic-links";
import { ensureSendGridConfigured, sendMagicLinkEmail } from "@/lib/email/sendgrid";
import { isConfigurationError } from "@/lib/errors";

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
    ensureAirtableConfigured();
    ensureSendGridConfigured();
    const isAuthorized = await isAuthorizedEmail(email);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized email", code: "unauthorized" },
        { status: 403 }
      );
    }

    const token = createMagicLinkToken(email);
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const magicLink = `${origin}/api/auth/verify?token=${token}`;

    await sendMagicLinkEmail({
      to: email,
      magicLink
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process magic link request", error);

    if (isConfigurationError(error)) {
      return NextResponse.json(
        {
          error: "Email service misconfigured",
          code: "config"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unable to process request", code: "server" },
      { status: 500 }
    );
  }
}
