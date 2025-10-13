import { SignJWT, jwtVerify } from "jose";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes

function getMagicLinkSecret(): Uint8Array {
  const secret = process.env.MAGIC_LINK_SECRET;
  if (!secret) {
    throw new Error("MAGIC_LINK_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function createMagicLinkToken(email: string): Promise<string> {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Date.now() + MAGIC_LINK_TTL_MS)
    .sign(getMagicLinkSecret());

  return token;
}

export async function consumeMagicLinkToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify<{ email: string }>(token, getMagicLinkSecret());

    if (!payload?.email) {
      return null;
    }

    return payload.email;
  } catch (error) {
    console.error("Failed to verify magic link token", error);
    return null;
  }
}
