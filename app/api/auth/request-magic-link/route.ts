import { NextResponse } from "next/server";
import { z } from "zod";

import { isAuthorizedEmail, normalizeEmail } from "@/lib/airtable";
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
