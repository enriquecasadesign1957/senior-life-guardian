import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { AGENCY_INVITE_DEFAULT_DAYS, AGENCY_TRIAL_SEATS } from "@cuidado/contract";
import { agencyInviteCodes, getDb, users } from "@cuidado/db";
import { cookies } from "next/headers";
import { ApiError } from "./errors";
import { normalizeAgencyInviteCode } from "./agency";

const COOKIE = "cuidado_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function adminSecret(): string {
  const configured =
    process.env.ADMIN_SECRET?.trim() || process.env.CREA_CLAVES_AGENCIAS?.trim();
  if (configured && configured.length >= 8) return configured;
  return "CwAdminPanel2026";
}

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new ApiError("CONFIG", "Falta la configuración del servidor.", 500);
  }
  return secret;
}

function signAdmin(): string {
  return createHmac("sha256", authSecret()).update(`admin:${adminSecret()}`).digest("base64url");
}

export async function writeAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, signAdmin(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const jar = await cookies();
    const value = jar.get(COOKIE)?.value;
    if (!value) return false;
    const expected = signAdmin();
    const left = Buffer.from(value);
    const right = Buffer.from(expected);
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new ApiError("UNAUTHORIZED", "Entra al panel admin con la clave.", 401);
  }
}

export function assertAdminSecret(secret: string): void {
  const expected = adminSecret();
  const left = Buffer.from(secret);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    throw new ApiError("UNAUTHORIZED", "La clave de admin no sirve.", 401);
  }
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(): string {
  const bytes = randomBytes(8);
  let body = "";
  for (const byte of bytes) {
    body += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return normalizeAgencyInviteCode(`CW-${body}`);
}

export type InviteStatus = "available" | "used" | "expired";

export type AdminInviteRow = {
  id: string;
  code: string;
  seats: number;
  maxUses: number;
  usedCount: number;
  note: string | null;
  createdAt: string;
  expiresAt: string | null;
  available: boolean;
  status: InviteStatus;
  redeemedByEmail: string | null;
};

export function inviteExpiresAt(validDays: number, now = new Date()): Date {
  const days = Number.isFinite(validDays) && validDays > 0 ? validDays : AGENCY_INVITE_DEFAULT_DAYS;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

export function inviteStatus(input: {
  usedCount: number;
  maxUses: number;
  expiresAt: Date | null;
  now?: Date;
}): InviteStatus {
  const now = input.now ?? new Date();
  if (input.usedCount >= input.maxUses) return "used";
  if (input.expiresAt && input.expiresAt.getTime() <= now.getTime()) return "expired";
  return "available";
}

function toAdminInviteRow(
  row: {
    id: string;
    code: string;
    seats: number;
    maxUses: number;
    usedCount: number;
    note: string | null;
    createdAt: Date;
    expiresAt: Date | null;
  },
  redeemedByEmail: string | null,
  now = new Date(),
): AdminInviteRow {
  const status = inviteStatus({ ...row, now });
  return {
    id: row.id,
    code: row.code,
    seats: row.seats,
    maxUses: row.maxUses,
    usedCount: row.usedCount,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    available: status === "available",
    status,
    redeemedByEmail,
  };
}

export async function listInviteCodes(): Promise<AdminInviteRow[]> {
  const db = getDb();
  const now = new Date();
  const rows = await db
    .select({
      id: agencyInviteCodes.id,
      code: agencyInviteCodes.code,
      seats: agencyInviteCodes.seats,
      maxUses: agencyInviteCodes.maxUses,
      usedCount: agencyInviteCodes.usedCount,
      note: agencyInviteCodes.note,
      createdAt: agencyInviteCodes.createdAt,
      expiresAt: agencyInviteCodes.expiresAt,
    })
    .from(agencyInviteCodes)
    .orderBy(desc(agencyInviteCodes.createdAt));

  const redeemed = await db
    .select({
      codeId: users.agencyTrialCodeId,
      email: users.email,
    })
    .from(users);

  const emailByCode = new Map<string, string>();
  for (const row of redeemed) {
    if (row.codeId && row.email) emailByCode.set(row.codeId, row.email);
  }

  return rows.map((row) => toAdminInviteRow(row, emailByCode.get(row.id) ?? null, now));
}

export async function createInviteCode(input: {
  note?: string;
  seats?: number;
  validDays?: number;
}): Promise<AdminInviteRow> {
  const db = getDb();
  const seats = input.seats && input.seats > 0 ? input.seats : AGENCY_TRIAL_SEATS;
  const note = input.note?.trim() ? input.note.trim().slice(0, 120) : null;
  const expiresAt = inviteExpiresAt(input.validDays ?? AGENCY_INVITE_DEFAULT_DAYS);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateInviteCode();
    try {
      const inserted = (
        await db
          .insert(agencyInviteCodes)
          .values({
            code,
            seats,
            maxUses: 1,
            usedCount: 0,
            note,
            expiresAt,
          })
          .returning({
            id: agencyInviteCodes.id,
            code: agencyInviteCodes.code,
            seats: agencyInviteCodes.seats,
            maxUses: agencyInviteCodes.maxUses,
            usedCount: agencyInviteCodes.usedCount,
            note: agencyInviteCodes.note,
            createdAt: agencyInviteCodes.createdAt,
            expiresAt: agencyInviteCodes.expiresAt,
          })
      )[0];
      if (!inserted) continue;
      return toAdminInviteRow(inserted, null);
    } catch {
      // unique collision; retry
    }
  }
  throw new ApiError("INTERNAL", "No pudimos generar un código nuevo.", 500);
}

export async function getInviteById(id: string): Promise<AdminInviteRow | null> {
  const row = (
    await getDb()
      .select({
        id: agencyInviteCodes.id,
        code: agencyInviteCodes.code,
        seats: agencyInviteCodes.seats,
        maxUses: agencyInviteCodes.maxUses,
        usedCount: agencyInviteCodes.usedCount,
        note: agencyInviteCodes.note,
        createdAt: agencyInviteCodes.createdAt,
        expiresAt: agencyInviteCodes.expiresAt,
      })
      .from(agencyInviteCodes)
      .where(eq(agencyInviteCodes.id, id))
      .limit(1)
  )[0];
  if (!row) return null;
  const redeemer = (
    await getDb()
      .select({ email: users.email })
      .from(users)
      .where(eq(users.agencyTrialCodeId, row.id))
      .limit(1)
  )[0];
  return toAdminInviteRow(row, redeemer?.email ?? null);
}
