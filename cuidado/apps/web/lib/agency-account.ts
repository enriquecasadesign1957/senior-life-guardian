import { and, desc, eq, isNotNull, ne } from "drizzle-orm";
import { getDb, sites, users } from "@cuidado/db";
import { ApiError } from "./errors";
import { hashPassword, verifyPassword } from "./password";
import { clearSessionCookie, currentUserId, writeSessionCookie } from "./session";

const ANON_SUFFIX = "@users.cuidadoweb.invalid";

export function isAnonymousEmail(email: string): boolean {
  return email.toLowerCase().endsWith(ANON_SUFFIX);
}

export type AgencyAccount = {
  userId: string;
  email: string;
  hasPassword: boolean;
  trialActive: boolean;
  trialSeats: number;
};

export async function getAgencyAccount(userId: string): Promise<AgencyAccount | null> {
  const row = (
    await getDb()
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        trialSeats: users.agencyTrialSeats,
        trialActivatedAt: users.agencyTrialActivatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
  )[0];
  if (!row) return null;
  return {
    userId: row.id,
    email: row.email,
    hasPassword: Boolean(row.passwordHash),
    trialActive: Boolean(row.trialActivatedAt) && row.trialSeats > 0,
    trialSeats: row.trialSeats,
  };
}

export async function requireAgencyAccount(): Promise<AgencyAccount> {
  const userId = await currentUserId();
  const account = await getAgencyAccount(userId);
  if (!account?.hasPassword || isAnonymousEmail(account.email)) {
    throw new ApiError("UNAUTHENTICATED", "Entra con tu cuenta de agencia.", 401);
  }
  return account;
}

export async function registerAgencyAccount(input: {
  email: string;
  password: string;
}): Promise<AgencyAccount> {
  const email = input.email.trim().toLowerCase();
  if (isAnonymousEmail(email)) {
    throw new ApiError("INVALID_INPUT", "Usa un correo real de la agencia.", 400);
  }
  const db = getDb();
  const userId = await currentUserId();
  const current = await getAgencyAccount(userId);
  if (!current) {
    throw new ApiError("UNAUTHENTICATED", "Vuelve a abrir cuidadoweb.com e inténtalo otra vez.", 401);
  }
  if (current.hasPassword && !isAnonymousEmail(current.email)) {
    throw new ApiError("ACCOUNT_EXISTS", "Esta sesión ya tiene cuenta. Entra con tu correo.", 409);
  }

  const taken = (
    await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), ne(users.id, userId)))
      .limit(1)
  )[0];
  if (taken) {
    throw new ApiError("EMAIL_TAKEN", "Ese correo ya tiene cuenta. Entra con tu contraseña.", 409);
  }

  await db
    .update(users)
    .set({
      email,
      passwordHash: hashPassword(input.password),
      emailVerified: new Date(),
    })
    .where(eq(users.id, userId));

  await writeSessionCookie(userId);
  const account = await getAgencyAccount(userId);
  if (!account) throw new ApiError("INTERNAL", "No pudimos crear la cuenta.", 500);
  return account;
}

export async function loginAgencyAccount(input: {
  email: string;
  password: string;
}): Promise<AgencyAccount> {
  const email = input.email.trim().toLowerCase();
  const row = (
    await getDb()
      .select({
        id: users.id,
        email: users.email,
        passwordHash: users.passwordHash,
        trialSeats: users.agencyTrialSeats,
        trialActivatedAt: users.agencyTrialActivatedAt,
      })
      .from(users)
      .where(and(eq(users.email, email), isNotNull(users.passwordHash)))
      .limit(1)
  )[0];
  if (!row?.passwordHash || !verifyPassword(input.password, row.passwordHash)) {
    throw new ApiError("INVALID_CREDENTIALS", "Correo o contraseña incorrectos.", 401);
  }
  await writeSessionCookie(row.id);
  return {
    userId: row.id,
    email: row.email,
    hasPassword: true,
    trialActive: Boolean(row.trialActivatedAt) && row.trialSeats > 0,
    trialSeats: row.trialSeats,
  };
}

export async function logoutAgencyAccount(): Promise<void> {
  await clearSessionCookie();
}

export type AgencySiteRow = {
  id: string;
  baseUrl: string;
  plan: "none" | "rescue" | "cuidado";
  agencySeat: boolean;
  watchUntil: Date | null;
  connectedAt: Date | null;
  lastProbeAt: Date | null;
  lastProbeStatus: number | null;
};

export async function listAgencySites(userId: string): Promise<AgencySiteRow[]> {
  return getDb()
    .select({
      id: sites.id,
      baseUrl: sites.baseUrl,
      plan: sites.plan,
      agencySeat: sites.agencySeat,
      watchUntil: sites.watchUntil,
      connectedAt: sites.connectedAt,
      lastProbeAt: sites.lastProbeAt,
      lastProbeStatus: sites.lastProbeStatus,
    })
    .from(sites)
    .where(and(eq(sites.userId, userId), eq(sites.status, "connected")))
    .orderBy(desc(sites.connectedAt));
}
