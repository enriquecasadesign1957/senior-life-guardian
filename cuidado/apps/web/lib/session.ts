import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { users, getDb } from "@cuidado/db";
import { cookies } from "next/headers";
import { ApiError } from "./errors";

const COOKIE = "cuidado_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new ApiError("CONFIG", "Falta la configuración del servidor.", 500);
  }
  return secret;
}

function sign(userId: string): string {
  const mac = createHmac("sha256", authSecret()).update(userId).digest("base64url");
  return `${userId}.${mac}`;
}

function readSigned(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const userId = value.slice(0, dot);
  const mac = value.slice(dot + 1);
  const expected = createHmac("sha256", authSecret()).update(userId).digest("base64url");
  const left = Buffer.from(mac);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  return userId;
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export async function writeSessionCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), cookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

export async function currentUserId(): Promise<string> {
  const jar = await cookies();
  const existing = readSigned(jar.get(COOKIE)?.value);
  if (existing) {
    const db = getDb();
    const found = await db.select({ id: users.id }).from(users).where(eq(users.id, existing)).limit(1);
    if (found[0]) return existing;
  }

  const id = randomUUID();
  const db = getDb();
  await db.insert(users).values({
    id,
    email: `session-${id}@users.cuidadoweb.invalid`,
  });
  await writeSessionCookie(id);
  return id;
}

export async function optionalUserId(): Promise<string | null> {
  try {
    const jar = await cookies();
    const existing = readSigned(jar.get(COOKIE)?.value);
    if (!existing) return null;
    const found = await getDb().select({ id: users.id }).from(users).where(eq(users.id, existing)).limit(1);
    return found[0]?.id ?? null;
  } catch {
    return null;
  }
}

export async function requireUserId(): Promise<string> {
  const jar = await cookies();
  const existing = readSigned(jar.get(COOKIE)?.value);
  if (!existing) {
    throw new ApiError("UNAUTHENTICATED", "Vuelve a pegar la dirección del sitio.", 401);
  }
  const db = getDb();
  const found = await db.select({ id: users.id }).from(users).where(eq(users.id, existing)).limit(1);
  if (!found[0]) {
    throw new ApiError("UNAUTHENTICATED", "Vuelve a pegar la dirección del sitio.", 401);
  }
  return existing;
}
