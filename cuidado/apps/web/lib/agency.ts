import { and, count, eq } from "drizzle-orm";
import { AGENCY_TRIAL_SEATS } from "@cuidado/contract";
import { getDb, sites, users } from "@cuidado/db";

export type AgencyTrialStatus = {
  active: boolean;
  seats: number;
  used: number;
  remaining: number;
};

export function agencyTrialInviteCode(): string {
  const configured = process.env.AGENCY_TRIAL_CODE?.trim();
  return configured && configured.length >= 4 ? configured : "CW-AGENCIA-5";
}

export async function getAgencyTrialStatus(userId: string): Promise<AgencyTrialStatus> {
  const db = getDb();
  const user = (
    await db
      .select({
        seats: users.agencyTrialSeats,
        activatedAt: users.agencyTrialActivatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
  )[0];
  const seats = user?.seats ?? 0;
  const active = Boolean(user?.activatedAt) && seats > 0;
  if (!active) {
    return { active: false, seats: 0, used: 0, remaining: 0 };
  }
  const usedRow = (
    await db
      .select({ value: count() })
      .from(sites)
      .where(and(eq(sites.userId, userId), eq(sites.agencySeat, true), eq(sites.status, "connected")))
  )[0];
  const used = Number(usedRow?.value ?? 0);
  return {
    active: true,
    seats,
    used,
    remaining: Math.max(0, seats - used),
  };
}

export async function activateAgencyTrial(userId: string, code: string): Promise<AgencyTrialStatus> {
  if (code.trim() !== agencyTrialInviteCode()) {
    throw new AgencyTrialError("AGENCY_CODE_INVALID", "Ese código de agencia no sirve.", 403);
  }
  const db = getDb();
  const existing = (
    await db
      .select({
        seats: users.agencyTrialSeats,
        activatedAt: users.agencyTrialActivatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
  )[0];
  if (!existing) {
    throw new AgencyTrialError("UNAUTHENTICATED", "Vuelve a abrir cuidadoweb.com e inténtalo otra vez.", 401);
  }
  if (existing.activatedAt) {
    return getAgencyTrialStatus(userId);
  }
  await db
    .update(users)
    .set({
      agencyTrialSeats: AGENCY_TRIAL_SEATS,
      agencyTrialActivatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  return getAgencyTrialStatus(userId);
}

export async function claimAgencySeat(input: {
  userId: string;
  siteId: string;
}): Promise<{ granted: boolean; status: AgencyTrialStatus; reason?: string }> {
  const status = await getAgencyTrialStatus(input.userId);
  if (!status.active) {
    return { granted: false, status, reason: "Activa antes la prueba de agencia." };
  }
  if (status.remaining <= 0) {
    return { granted: false, status, reason: "Ya usaste los 5 sitios gratis de la prueba." };
  }

  const db = getDb();
  const site = (
    await db
      .select({
        id: sites.id,
        plan: sites.plan,
        agencySeat: sites.agencySeat,
        status: sites.status,
      })
      .from(sites)
      .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId)))
      .limit(1)
  )[0];
  if (!site || site.status !== "connected") {
    return { granted: false, status, reason: "Primero conecta el sitio con el plugin." };
  }
  if (site.agencySeat || site.plan === "cuidado") {
    return { granted: false, status: await getAgencyTrialStatus(input.userId), reason: "Ese sitio ya tiene el Plan Cuidado." };
  }

  const updated = await db
    .update(sites)
    .set({
      plan: "cuidado",
      watchUntil: null,
      agencySeat: true,
    })
    .where(
      and(
        eq(sites.id, input.siteId),
        eq(sites.userId, input.userId),
        eq(sites.status, "connected"),
        eq(sites.agencySeat, false),
        eq(sites.plan, "none"),
      ),
    )
    .returning({ id: sites.id });

  if (!updated[0]) {
    // rescue sites can still take a seat
    const fromRescue = await db
      .update(sites)
      .set({
        plan: "cuidado",
        watchUntil: null,
        agencySeat: true,
      })
      .where(
        and(
          eq(sites.id, input.siteId),
          eq(sites.userId, input.userId),
          eq(sites.status, "connected"),
          eq(sites.agencySeat, false),
          eq(sites.plan, "rescue"),
        ),
      )
      .returning({ id: sites.id });
    if (!fromRescue[0]) {
      return { granted: false, status: await getAgencyTrialStatus(input.userId), reason: "No pudimos asignar el cupo a ese sitio." };
    }
  }

  return { granted: true, status: await getAgencyTrialStatus(input.userId) };
}

export async function maybeGrantAgencySeatOnConnect(input: {
  userId: string;
  siteId: string;
}): Promise<boolean> {
  const result = await claimAgencySeat(input);
  return result.granted;
}

export class AgencyTrialError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "AgencyTrialError";
  }
}
