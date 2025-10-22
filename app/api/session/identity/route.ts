import { NextRequest, NextResponse } from "next/server";

import { resolveUserProfile } from "@/lib/users/profile";
import { verifySessionToken } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("jbv_session")?.value;
  if (!token) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "invalid_session" }, { status: 401 });
  }

  const profile = resolveUserProfile({
    email: session.email,
    userId: session.userId
  });

  return NextResponse.json({
    userId: profile.userId,
    email: profile.email,
    profile
  });
}
