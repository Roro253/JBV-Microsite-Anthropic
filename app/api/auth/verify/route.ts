import { NextRequest, NextResponse } from "next/server";

import { consumeMagicLinkToken } from "@/lib/auth/magic-links";
import { createSessionToken } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("status", "missing-token");
    return NextResponse.redirect(redirectUrl);
  }

  const email = await consumeMagicLinkToken(token);

  if (!email) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("status", "invalid-token");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const sessionToken = await createSessionToken(email);
    const response = NextResponse.redirect(new URL("/", request.url));

    response.cookies.set({
      name: "jbv_session",
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24
    });

    return response;
  } catch (error) {
    console.error("Failed to create session", error);
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("status", "invalid-token");
    return NextResponse.redirect(redirectUrl);
  }
}
