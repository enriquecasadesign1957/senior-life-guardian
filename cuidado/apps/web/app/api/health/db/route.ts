import { sql } from "drizzle-orm";
import { describeDatabaseUrl, getDb, getPool } from "@cuidado/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const REPAIR_0008 = `
CREATE TABLE IF NOT EXISTS "payment_intents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "purpose" text NOT NULL,
  "site_id" uuid NOT NULL REFERENCES "sites"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "provider" text NOT NULL,
  "buy_order" text NOT NULL UNIQUE,
  "amount_clp" integer,
  "status" text DEFAULT 'pending' NOT NULL,
  "tbk_token" text,
  "tbk_user" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "paid_at" timestamp with time zone
);
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "tbk_user" text;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "tbk_username" text;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "plan_renewal_at" timestamp with time zone;
`;

/**
 * Smoke de conectividad Postgres sin filtrar secretos.
 * GET /api/health/db
 * GET /api/health/db?repair=1  → aplica 0008 idempotente (tbk columns + payment_intents)
 */
export async function GET(request: Request): Promise<NextResponse> {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    return NextResponse.json(
      { ok: false, error: "DATABASE_URL_missing" },
      { status: 500 },
    );
  }

  let info;
  try {
    info = describeDatabaseUrl(raw);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL_invalid",
        message: error instanceof Error ? error.message.slice(0, 160) : "invalid",
      },
      { status: 500 },
    );
  }

  const base = {
    provider: info.provider,
    mode: info.mode,
    host: info.host,
    port: info.port,
    userShape: info.user.includes(".") ? "project-ref" : info.user || "empty",
  };

  const repair = new URL(request.url).searchParams.get("repair") === "1";

  try {
    const client = await getPool().connect();
    try {
      await client.query("SELECT 1 AS ok");
      if (repair) {
        await client.query(REPAIR_0008);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { code?: string };
    return NextResponse.json(
      {
        ok: false,
        ...base,
        error: err.code ?? err.name ?? "connect_failed",
        message: typeof err.message === "string" ? err.message.slice(0, 160) : "connect_failed",
      },
      { status: 500 },
    );
  }

  try {
    await getDb().transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(${42})`);
      await tx.execute(sql`SELECT 1`);
    });
    // Confirm tbk_user exists after optional repair
    const col = await getPool().query(
      `SELECT 1 AS ok FROM information_schema.columns
       WHERE table_schema='public' AND table_name='sites' AND column_name='tbk_user'`,
    );
    return NextResponse.json({
      ok: true,
      ...base,
      lockOk: true,
      repaired: repair,
      hasTbkUser: col.rowCount === 1,
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { code?: string };
    return NextResponse.json(
      {
        ok: false,
        ...base,
        lockOk: false,
        error: err.code ?? err.name ?? "lock_failed",
        message: typeof err.message === "string" ? err.message.slice(0, 160) : "lock_failed",
      },
      { status: 500 },
    );
  }
}
