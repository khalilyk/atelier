import { SignJWT, jwtVerify } from "jose";

// A real secret is mandatory in production. The dev fallback is public (it is in
// this file), so accepting it in production would let anyone forge a session.
const RAW_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  (process.env.NODE_ENV === "production" ? "" : "atelier-admin-dev-only-secret");
const SECRET = new TextEncoder().encode(RAW_SECRET);

export const COOKIE_NAME = "atelier-admin";

export async function signToken(payload: Record<string, unknown>) {
  if (!RAW_SECRET) throw new Error("ADMIN_JWT_SECRET is not configured");
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  if (!RAW_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// Reset tokens - random opaque token, stored only as a SHA-256 hash
export function generateResetToken(): string {
  return (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
}

export async function hashToken(token: string): Promise<string> {
  return hashPassword(token);
}
