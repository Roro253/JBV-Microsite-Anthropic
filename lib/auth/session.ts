import { createHash } from "crypto";
import { SignJWT, jwtVerify } from "jose";

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export function deriveUserId(email: string): string {
  return createHash("sha256").update(email.trim().toLowerCase()).digest("hex").slice(0, 24);
}

export async function createSessionToken(email: string): Promise<string> {
  const userId = deriveUserId(email);
  return await new SignJWT({ email, userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string
): Promise<{ email: string; userId: string } | null> {
  try {
    const { payload } = await jwtVerify<{ email: string; userId?: string }>(token, getAuthSecret());

    if (!payload?.email) {
      return null;
    }

    const email = payload.email;
    const userId = payload.userId ?? deriveUserId(email);

    return { email, userId };
  } catch (error) {
    console.error("Failed to verify session token", error);
    return null;
  }
}
